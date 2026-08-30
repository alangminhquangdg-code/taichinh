/**
 * MODULE: FAMILY MEMBERS & SHARED POOL (QUẢN TRỊ THÀNH VIÊN & QUỸ CHUNG)
 */
import { getState, saveMember } from '../state.js';
import { formatCurrency, formatCompactCurrency, escapeHTML } from '../utils/formatters.js';
import { showToast, openModal, closeModal } from '../utils/notifications.js';

export function renderFamily() {
  const container = document.getElementById('familyView');
  if (!container) return;

  const state = getState();
  const currency = state.settings.currency;
  const currentMonthPrefix = new Date().toISOString().substring(0, 7);

  // Calculate Member spending and income this month
  const memberSpending = {};
  const memberIncome = {};

  state.transactions.forEach(t => {
    if (t.date && t.date.startsWith(currentMonthPrefix)) {
      if (t.type === 'expense' && t.memberId) {
        memberSpending[t.memberId] = (memberSpending[t.memberId] || 0) + Number(t.amount);
      } else if (t.type === 'income' && t.memberId) {
        memberIncome[t.memberId] = (memberIncome[t.memberId] || 0) + Number(t.amount);
      }
    }
  });

  // Calculate Shared Pool Balance (Accounts owned by 'all')
  let sharedPoolBalance = 0;
  state.accounts.forEach(a => {
    if (a.ownerId === 'all') sharedPoolBalance += Number(a.balance || 0);
  });

  container.innerHTML = `
    <!-- Top Action & Title Bar -->
    <div class="flex items-center justify-between flex-wrap gap-4 mb-6">
      <div>
        <h2 style="font-size: 1.35rem; font-weight: 800;">Quản Lý Thành Viên & Quỹ Chung Gia Đình</h2>
        <p style="font-size: 0.85rem; color: var(--text-muted);">Phân quyền tài khoản, hạn mức chi tiêu cá nhân và đóng góp vào quỹ chung gia đình</p>
      </div>
      <button class="btn btn-primary" id="btnOpenAddMemberModal">
        <i class="fa-solid fa-user-plus"></i> Thêm thành viên mới
      </button>
    </div>

    <!-- Shared Pool Highlight Banner -->
    <div class="card mb-6" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%); border-left: 4px solid var(--primary);">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div class="flex items-center gap-4">
          <div style="width: 52px; height: 52px; border-radius: var(--radius-lg); background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.6rem;">
            <i class="fa-solid fa-people-roof"></i>
          </div>
          <div>
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
              Số Dư Quỹ Chung Gia Đình Hiện Tại
            </span>
            <div style="font-size: 1.8rem; font-weight: 800; color: var(--text-primary); margin-top: 2px;">
              ${formatCurrency(sharedPoolBalance, currency)}
            </div>
            <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 2px;">
              Dùng cho các chi phí sinh hoạt chung: Tiền ăn, điện nước, học phí con cái, bảo hiểm
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button class="btn btn-primary btn-sm" id="btnFamilyTransfer">
            <i class="fa-solid fa-arrow-right-arrow-left"></i> Đóng góp quỹ chung
          </button>
        </div>
      </div>
    </div>

    <!-- Family Members Grid -->
    <div class="grid grid-cols-2 gap-6" id="familyMembersGrid">
      ${renderMemberCards(state.members, memberSpending, memberIncome, state, currency)}
    </div>
  `;

  setupFamilyEventListeners(state);
}

function renderMemberCards(members, memberSpending, memberIncome, state, currency) {
  if (!members || members.length === 0) {
    return `<div class="card w-full" style="grid-column: span 2; text-align: center; color: var(--text-muted); padding: 40px;">
      Chưa có hồ sơ thành viên nào.
    </div>`;
  }

  return members.map(m => {
    const spent = memberSpending[m.id] || 0;
    const income = memberIncome[m.id] || 0;
    const quota = Number(m.monthlyQuota || 1);
    const spentPct = Math.min(100, Math.round((spent / quota) * 100));

    // Accounts owned by this member
    const ownedAccounts = state.accounts.filter(a => a.ownerId === m.id);

    return `
      <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <!-- Member Top Header -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div style="width: 48px; height: 48px; border-radius: var(--radius-full); background: ${m.avatarColor || 'var(--primary)'}; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 800; box-shadow: var(--shadow-sm);">
                <i class="fa-solid ${m.icon || 'fa-user'}"></i>
              </div>
              <div>
                <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary);">${escapeHTML(m.name)}</h4>
                <div style="font-size: 0.8rem; color: var(--text-muted);">${escapeHTML(m.role || 'Thành viên')}</div>
              </div>
            </div>
            <button class="btn-icon-header btn-edit-member" data-id="${m.id}" style="width: 32px; height: 32px; font-size: 0.8rem;">
              <i class="fa-solid fa-pen"></i>
            </button>
          </div>

          <!-- Quota Progress -->
          <div style="background: var(--bg-glass-card); border-radius: var(--radius-md); padding: 14px; margin-bottom: 14px;">
            <div class="flex items-center justify-between mb-2">
              <span style="font-size: 0.78rem; font-weight: 600; color: var(--text-muted);">Chi tiêu tháng này vs Hạn mức</span>
              <span class="badge ${spentPct > 90 ? 'badge-rose' : 'badge-emerald'}" style="font-size: 0.75rem;">${spentPct}%</span>
            </div>
            <div class="progress-bar-container mb-2" style="height: 8px;">
              <div class="progress-bar-fill ${spentPct > 90 ? 'rose' : 'emerald'}" style="width: ${spentPct}%;"></div>
            </div>
            <div class="flex justify-between" style="font-size: 0.82rem;">
              <span>Đã chi: <strong style="color: var(--rose);">${formatCurrency(spent, currency)}</strong></span>
              <span>Hạn mức: <strong>${formatCurrency(quota, currency)}</strong></span>
            </div>
          </div>

          <!-- Income Stats if applicable -->
          ${income > 0 ? `
            <div class="flex items-center justify-between mb-3" style="font-size: 0.85rem; padding: 0 4px;">
              <span style="color: var(--text-muted);"><i class="fa-solid fa-coins" style="color: var(--emerald);"></i> Thu nhập tháng:</span>
              <strong style="color: var(--emerald); font-size: 0.95rem;">+${formatCurrency(income, currency)}</strong>
            </div>
          ` : ''}

          <!-- Owned Accounts -->
          <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 6px;">
            Tài khoản đứng tên (${ownedAccounts.length}):
          </div>
          <div class="flex flex-wrap gap-2 mb-2">
            ${ownedAccounts.length > 0 ? ownedAccounts.map(a => `
              <span style="font-size: 0.75rem; background: rgba(255,255,255,0.06); padding: 3px 8px; border-radius: var(--radius-sm); color: var(--text-secondary); display: flex; align-items: center; gap: 4px;">
                <i class="fa-solid fa-credit-card"></i> ${escapeHTML(a.name)} (${formatCompactCurrency(a.balance, currency)})
              </span>
            `).join('') : '<span style="font-size: 0.75rem; color: var(--text-muted);">Chưa có tài khoản riêng</span>'}
          </div>
        </div>

        <!-- Card Footer -->
        <div class="flex items-center justify-between pt-3" style="border-top: 1px solid var(--border-color); margin-top: 10px;">
          <button class="btn btn-outline btn-sm btn-filter-this-member" data-id="${m.id}" style="font-size: 0.8rem; width: 100%;">
            <i class="fa-solid fa-filter"></i> Xem dòng tiền của ${escapeHTML(m.shortName || m.name)}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function setupFamilyEventListeners(state) {
  const btnAdd = document.getElementById('btnOpenAddMemberModal');
  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      document.getElementById('formMember').reset();
      document.getElementById('memberModalId').value = '';
      document.getElementById('memberModalTitle').textContent = 'Thêm Thành Viên Mới';
      openModal('modalMember');
    });
  }

  const btnTransfer = document.getElementById('btnFamilyTransfer');
  if (btnTransfer) {
    btnTransfer.addEventListener('click', () => {
      document.getElementById('btnOpenTransferModal')?.click();
    });
  }

  // Edit member
  document.querySelectorAll('.btn-edit-member').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const m = state.members.find(mem => mem.id === id);
      if (m) {
        document.getElementById('memberModalId').value = m.id;
        document.getElementById('memberName').value = m.name;
        document.getElementById('memberShortName').value = m.shortName || '';
        document.getElementById('memberRole').value = m.role || '';
        document.getElementById('memberQuota').value = m.monthlyQuota || 0;
        document.getElementById('memberModalTitle').textContent = 'Chỉnh Sửa Thành Viên';
        openModal('modalMember');
      }
    });
  });

  // Filter to this member
  document.querySelectorAll('.btn-filter-this-member').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      state.settings.selectedMemberId = id;
      document.getElementById('memberFilterSelect').value = id;
      showToast(`Đã chuyển sang xem dòng tiền của ${btn.textContent.replace('Xem dòng tiền của ', '')}`, 'info');
      document.querySelector('[data-tab="transactions"]')?.click();
    });
  });
}

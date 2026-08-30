/**
 * MODULE: DEBTS & LOANS (SỔ NỢ & CHO VAY)
 */
import { getState, saveDebt, payDebtInstallment } from '../state.js';
import { formatCurrency, formatCompactCurrency, formatDate, escapeHTML, generateUUID } from '../utils/formatters.js';
import { showToast, openModal, closeModal } from '../utils/notifications.js';

export function renderDebts() {
  const container = document.getElementById('debtsView');
  if (!container) return;

  const state = getState();
  const currency = state.settings.currency;

  let totalBorrowed = 0; // Tôi nợ
  let totalBorrowedPaid = 0;
  let totalLent = 0; // Người khác nợ tôi
  let totalLentPaid = 0;

  state.debts.forEach(d => {
    if (d.type === 'borrowed') {
      totalBorrowed += Number(d.originalAmount || 0);
      totalBorrowedPaid += Number(d.paidAmount || 0);
    } else {
      totalLent += Number(d.originalAmount || 0);
      totalLentPaid += Number(d.paidAmount || 0);
    }
  });

  const remainingBorrowed = totalBorrowed - totalBorrowedPaid;
  const remainingLent = totalLent - totalLentPaid;

  container.innerHTML = `
    <!-- Top Action & Title Bar -->
    <div class="flex items-center justify-between flex-wrap gap-4 mb-6">
      <div>
        <h2 style="font-size: 1.35rem; font-weight: 800;">Sổ Nợ & Cho Vay Gia Đình</h2>
        <p style="font-size: 0.85rem; color: var(--text-muted);">Theo dõi các khoản vay ngân hàng (mua nhà, mua xe) và tiền cho vay mượn cá nhân</p>
      </div>
      <button class="btn btn-primary" id="btnOpenAddDebtModal">
        <i class="fa-solid fa-plus"></i> Thêm khoản nợ / cho vay
      </button>
    </div>

    <!-- Summary Stat 2 Cards -->
    <div class="grid grid-cols-2 gap-6 mb-8">
      <!-- Borrowed (Tôi Nợ) -->
      <div class="card" style="border-left: 4px solid var(--rose); background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(17, 24, 39, 0.9) 100%);">
        <div class="flex items-center justify-between mb-3">
          <span class="stat-label">Tổng Nợ Phải Trả (Tôi Nợ)</span>
          <div class="stat-icon-box rose"><i class="fa-solid fa-hand-holding-dollar"></i></div>
        </div>
        <div style="font-size: 1.7rem; font-weight: 800; color: var(--rose);">
          ${formatCurrency(remainingBorrowed, currency)}
        </div>
        <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 6px;">
          Gốc ban đầu: ${formatCompactCurrency(totalBorrowed, currency)} • Đã trả: <strong style="color: var(--emerald);">${formatCompactCurrency(totalBorrowedPaid, currency)}</strong>
        </div>
      </div>

      <!-- Lent (Người Khác Nợ Tôi) -->
      <div class="card" style="border-left: 4px solid var(--emerald); background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(17, 24, 39, 0.9) 100%);">
        <div class="flex items-center justify-between mb-3">
          <span class="stat-label">Tiền Cần Thu Hồi (Người Khác Nợ)</span>
          <div class="stat-icon-box emerald"><i class="fa-solid fa-money-bill-transfer"></i></div>
        </div>
        <div style="font-size: 1.7rem; font-weight: 800; color: var(--emerald);">
          ${formatCurrency(remainingLent, currency)}
        </div>
        <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 6px;">
          Cho vay: ${formatCompactCurrency(totalLent, currency)} • Đã thu hồi: <strong style="color: var(--emerald);">${formatCompactCurrency(totalLentPaid, currency)}</strong>
        </div>
      </div>
    </div>

    <!-- Debts List Grid -->
    <div class="grid grid-cols-2 gap-6" id="debtsListGrid">
      ${renderDebtCards(state.debts, state, currency)}
    </div>
  `;

  setupDebtEventListeners(state);
}

function renderDebtCards(debts, state, currency) {
  if (!debts || debts.length === 0) {
    return `<div class="card w-full" style="grid-column: span 2; text-align: center; color: var(--text-muted); padding: 40px;">
      Gia đình bạn hiện không có khoản nợ hay cho vay nào.
    </div>`;
  }

  return debts.map(d => {
    const isBorrowed = d.type === 'borrowed';
    const original = Number(d.originalAmount || 0);
    const paid = Number(d.paidAmount || 0);
    const remaining = Math.max(0, original - paid);
    const percent = original > 0 ? Math.min(100, Math.round((paid / original) * 100)) : 100;
    const isSettled = remaining === 0;

    return `
      <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; border-top: 3px solid ${isBorrowed ? 'var(--rose)' : 'var(--emerald)'};">
        <div>
          <div class="flex items-center justify-between mb-3">
            <div>
              <span class="badge ${isBorrowed ? 'badge-rose' : 'badge-emerald'}" style="font-size: 0.72rem; margin-bottom: 4px;">
                ${isBorrowed ? '🔴 Tôi đang nợ' : '🟢 Người khác nợ tôi'}
              </span>
              <h4 style="font-size: 1.08rem; font-weight: 700; color: var(--text-primary); margin-top: 4px;">
                ${escapeHTML(d.personName)}
              </h4>
            </div>
            <span class="badge ${isSettled ? 'badge-emerald' : 'badge-neutral'}">
              ${isSettled ? '✅ Đã tất toán' : `Đã trả ${percent}%`}
            </span>
          </div>

          <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px;">
            ${escapeHTML(d.note || 'Ghi chú khoản nợ')}
          </div>

          <!-- Balance progress -->
          <div class="progress-bar-container mb-2" style="height: 8px;">
            <div class="progress-bar-fill ${isSettled ? 'emerald' : (isBorrowed ? 'rose' : 'emerald')}" style="width: ${percent}%;"></div>
          </div>

          <div class="grid grid-cols-2 gap-2 mb-4" style="font-size: 0.84rem; background: var(--bg-glass-card); padding: 10px 14px; border-radius: var(--radius-md);">
            <div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">DƯ NỢ CÒN LẠI</div>
              <strong style="color: ${isBorrowed ? 'var(--rose)' : 'var(--emerald)'}; font-size: 1rem;">${formatCurrency(remaining, currency)}</strong>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 0.72rem; color: var(--text-muted);">SỐ TIỀN GỐC</div>
              <strong style="color: var(--text-primary); font-size: 0.95rem;">${formatCurrency(original, currency)}</strong>
            </div>
            ${d.interestRate > 0 ? `
              <div style="margin-top: 4px;">
                <div style="font-size: 0.72rem; color: var(--text-muted);">LÃI SUẤT</div>
                <span style="font-weight: 600;">${d.interestRate}% / năm</span>
              </div>
            ` : ''}
            ${d.dueDate ? `
              <div style="margin-top: 4px; text-align: right;">
                <div style="font-size: 0.72rem; color: var(--text-muted);">HẠN THANH TOÁN</div>
                <span style="font-weight: 600;">${formatDate(d.dueDate)}</span>
              </div>
            ` : ''}
          </div>

          <!-- Payment history preview -->
          ${d.payments && d.payments.length > 0 ? `
            <div style="margin-bottom: 14px;">
              <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">
                Lịch sử thanh toán gần đây:
              </div>
              <div class="flex flex-col gap-1">
                ${d.payments.slice(0, 2).map(p => `
                  <div class="flex items-center justify-between" style="font-size: 0.78rem; padding: 4px 8px; background: rgba(255,255,255,0.03); border-radius: var(--radius-sm);">
                    <span style="color: var(--text-muted);">${formatDate(p.date)} - ${escapeHTML(p.note)}</span>
                    <strong style="color: var(--emerald);">${formatCompactCurrency(p.amount, currency)}</strong>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-between pt-3" style="border-top: 1px solid var(--border-color);">
          <button class="btn btn-primary btn-sm btn-pay-debt" data-id="${d.id}" data-name="${escapeHTML(d.personName)}" data-remaining="${remaining}" data-type="${d.type}">
            <i class="fa-solid fa-money-bill-wave"></i> ${isBorrowed ? 'Ghi nhận trả nợ' : 'Ghi nhận thu tiền'}
          </button>
          <button class="btn btn-secondary btn-sm btn-edit-debt" data-id="${d.id}">
            <i class="fa-solid fa-pen"></i> Chỉnh sửa
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function setupDebtEventListeners(state) {
  // Add Debt Modal
  const btnAdd = document.getElementById('btnOpenAddDebtModal');
  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      document.getElementById('formDebt').reset();
      document.getElementById('debtModalId').value = '';
      document.getElementById('debtModalTitle').textContent = 'Thêm Khoản Nợ / Cho Vay Mới';
      openModal('modalDebt');
    });
  }

  // Pay Debt Modal
  document.querySelectorAll('.btn-pay-debt').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      const remaining = Number(btn.getAttribute('data-remaining'));
      const type = btn.getAttribute('data-type');

      document.getElementById('payDebtId').value = id;
      document.getElementById('payDebtNameLabel').textContent = name;
      document.getElementById('payDebtRemainingLabel').textContent = formatCurrency(remaining, state.settings.currency);
      document.getElementById('payDebtAmount').value = remaining > 0 ? remaining : '';

      // Populate Account Selector
      const accSelect = document.getElementById('payDebtFromAcc');
      if (accSelect) {
        accSelect.innerHTML = state.accounts.map(a => 
          `<option value="${a.id}">${escapeHTML(a.name)} (${formatCompactCurrency(a.balance, state.settings.currency)})</option>`
        ).join('');
      }

      openModal('modalPayDebt');
    });
  });
}

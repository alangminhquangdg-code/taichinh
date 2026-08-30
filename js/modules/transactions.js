/**
 * MODULE: TRANSACTIONS (SỔ GIAO DỊCH THU / CHI / CHUYỂN KHOẢN)
 */
import { getState, addTransaction, deleteTransaction } from '../state.js';
import { formatCurrency, formatCompactCurrency, formatDate, formatRelativeDate, escapeHTML, generateUUID } from '../utils/formatters.js';
import { showToast, openModal, closeModal } from '../utils/notifications.js';

let currentFilter = {
  keyword: '',
  type: 'all',
  categoryId: 'all',
  accountId: 'all',
  memberId: 'all',
  dateRange: 'this_month'
};

export function renderTransactions() {
  const container = document.getElementById('transactionsView');
  if (!container) return;

  const state = getState();
  const currency = state.settings.currency;

  // Apply filters
  const filteredTxs = filterTransactions(state.transactions, currentFilter, state);

  // Calculate filtered totals
  let filteredIncome = 0;
  let filteredExpense = 0;

  filteredTxs.forEach(t => {
    if (t.type === 'income') filteredIncome += Number(t.amount || 0);
    else if (t.type === 'expense') filteredExpense += Number(t.amount || 0);
  });

  const filteredNet = filteredIncome - filteredExpense;

  container.innerHTML = `
    <!-- Top Action & Title Bar -->
    <div class="flex items-center justify-between flex-wrap gap-4 mb-6">
      <div>
        <h2 style="font-size: 1.35rem; font-weight: 800;">Sổ Giao Dịch Tài Chính Gia Đình</h2>
        <p style="font-size: 0.85rem; color: var(--text-muted);">Ghi nhận và tra cứu toàn bộ dòng tiền chi tiêu, thu nhập của các thành viên</p>
      </div>
      <div class="flex items-center gap-3">
        <button class="btn btn-primary" id="btnOpenAddTxModal">
          <i class="fa-solid fa-plus"></i> Thêm giao dịch mới
        </button>
      </div>
    </div>

    <!-- Filter Summary Bar 3 Cards -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="stat-card emerald" style="padding: 16px;">
        <div class="stat-top">
          <span class="stat-label">Tổng Thu (Theo bộ lọc)</span>
          <div class="stat-icon-box emerald" style="width: 34px; height: 34px; font-size: 1rem;"><i class="fa-solid fa-arrow-down"></i></div>
        </div>
        <div class="stat-value" style="font-size: 1.4rem;">+${formatCurrency(filteredIncome, currency)}</div>
      </div>

      <div class="stat-card rose" style="padding: 16px;">
        <div class="stat-top">
          <span class="stat-label">Tổng Chi (Theo bộ lọc)</span>
          <div class="stat-icon-box rose" style="width: 34px; height: 34px; font-size: 1rem;"><i class="fa-solid fa-arrow-up"></i></div>
        </div>
        <div class="stat-value" style="font-size: 1.4rem;">-${formatCurrency(filteredExpense, currency)}</div>
      </div>

      <div class="stat-card ${filteredNet >= 0 ? 'emerald' : 'rose'}" style="padding: 16px;">
        <div class="stat-top">
          <span class="stat-label">Chênh Lệch Dòng Tiền</span>
          <div class="stat-icon-box ${filteredNet >= 0 ? 'emerald' : 'rose'}" style="width: 34px; height: 34px; font-size: 1rem;"><i class="fa-solid fa-scale-balanced"></i></div>
        </div>
        <div class="stat-value" style="font-size: 1.4rem;">${filteredNet >= 0 ? '+' : ''}${formatCurrency(filteredNet, currency)}</div>
      </div>
    </div>

    <!-- Filter Toolbar Controls -->
    <div class="card mb-6" style="padding: 18px;">
      <div class="grid grid-cols-4 gap-3">
        <!-- Search Keyword -->
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label" style="font-size: 0.75rem;">Tìm kiếm ghi chú / thẻ</label>
          <input type="text" class="form-control" id="txSearchKeyword" placeholder="Nhập từ khóa..." value="${escapeHTML(currentFilter.keyword)}">
        </div>

        <!-- Filter by Type -->
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label" style="font-size: 0.75rem;">Loại giao dịch</label>
          <select class="form-control" id="txFilterType">
            <option value="all" ${currentFilter.type === 'all' ? 'selected' : ''}>Tất cả loại giao dịch</option>
            <option value="expense" ${currentFilter.type === 'expense' ? 'selected' : ''}>💸 Chi tiêu (Tiền ra)</option>
            <option value="income" ${currentFilter.type === 'income' ? 'selected' : ''}>💰 Thu nhập (Tiền vào)</option>
            <option value="transfer" ${currentFilter.type === 'transfer' ? 'selected' : ''}>🔄 Chuyển khoản nội bộ</option>
          </select>
        </div>

        <!-- Filter by Category -->
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label" style="font-size: 0.75rem;">Danh mục</label>
          <select class="form-control" id="txFilterCategory">
            <option value="all">Tất cả danh mục</option>
            ${state.categories.map(c => `
              <option value="${c.id}" ${currentFilter.categoryId === c.id ? 'selected' : ''}>
                ${c.type === 'income' ? '🟢' : '🔴'} ${escapeHTML(c.name)}
              </option>
            `).join('')}
          </select>
        </div>

        <!-- Filter by Account -->
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label" style="font-size: 0.75rem;">Tài khoản / Ví</label>
          <select class="form-control" id="txFilterAccount">
            <option value="all">Tất cả tài khoản</option>
            ${state.accounts.map(a => `
              <option value="${a.id}" ${currentFilter.accountId === a.id ? 'selected' : ''}>${escapeHTML(a.name)}</option>
            `).join('')}
          </select>
        </div>
      </div>
    </div>

    <!-- Transactions Ledger Table -->
    <div class="card" style="padding: 0; overflow: hidden;">
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Danh Mục & Ghi Chú</th>
              <th>Thành Viên</th>
              <th>Tài Khoản / Ví</th>
              <th style="text-align: right;">Số Tiền</th>
              <th style="text-align: center; width: 90px;">Thao Tác</th>
            </tr>
          </thead>
          <tbody id="txTableBody">
            ${renderTxRows(filteredTxs, state, currency)}
          </tbody>
        </table>
      </div>
    </div>
  `;

  setupTxEventListeners(state);
}

function filterTransactions(transactions, filter, state) {
  const currentMonthPrefix = new Date().toISOString().substring(0, 7);

  return transactions.filter(t => {
    // Keyword
    if (filter.keyword) {
      const kw = filter.keyword.toLowerCase();
      const matchNote = (t.note || '').toLowerCase().includes(kw);
      const matchTag = (t.tags || []).some(tag => tag.toLowerCase().includes(kw));
      if (!matchNote && !matchTag) return false;
    }

    // Type
    if (filter.type !== 'all' && t.type !== filter.type) return false;

    // Category
    if (filter.categoryId !== 'all' && t.categoryId !== filter.categoryId) return false;

    // Account
    if (filter.accountId !== 'all' && t.accountId !== filter.accountId && t.targetAccountId !== filter.accountId) return false;

    // Global member filter
    const selectedMemberId = state.settings.selectedMemberId || 'all';
    if (selectedMemberId !== 'all' && t.memberId !== selectedMemberId && t.memberId !== 'all') {
      return false;
    }

    // Date range
    if (filter.dateRange === 'this_month' && t.date && !t.date.startsWith(currentMonthPrefix)) {
      return false;
    }

    return true;
  });
}

function renderTxRows(txs, state, currency) {
  if (!txs || txs.length === 0) {
    return `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">
          Không tìm thấy giao dịch nào phù hợp với bộ lọc.
        </td>
      </tr>
    `;
  }

  return txs.map(tx => {
    const cat = state.categories.find(c => c.id === tx.categoryId) || { name: 'Chuyển khoản nội bộ', icon: 'fa-arrow-right-arrow-left', color: '#3b82f6' };
    const acc = state.accounts.find(a => a.id === tx.accountId) || { name: 'Ví' };
    const targetAcc = tx.targetAccountId ? state.accounts.find(a => a.id === tx.targetAccountId) : null;
    const member = state.members.find(m => m.id === tx.memberId) || { name: 'Cả nhà', shortName: 'Cả nhà' };

    let isIncome = tx.type === 'income';
    let isTransfer = tx.type === 'transfer';
    let amountClass = isIncome ? 'income' : (isTransfer ? 'transfer' : 'expense');
    let prefix = isIncome ? '+' : (isTransfer ? '' : '-');

    return `
      <tr>
        <td style="font-weight: 600; font-size: 0.85rem; color: var(--text-secondary); white-space: nowrap;">
          ${formatDate(tx.date)}
        </td>
        <td>
          <div class="flex items-center gap-3">
            <div class="tx-icon-box" style="width: 38px; height: 38px; font-size: 1rem; background: ${isIncome ? 'var(--emerald-light)' : (isTransfer ? 'var(--primary-light)' : 'var(--rose-light)')}; color: ${isIncome ? 'var(--emerald)' : (isTransfer ? 'var(--primary)' : 'var(--rose)')};">
              <i class="fa-solid ${cat.icon || 'fa-receipt'}"></i>
            </div>
            <div>
              <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-primary);">${escapeHTML(tx.note || cat.name)}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px; margin-top: 2px;">
                <span class="badge ${isIncome ? 'badge-emerald' : 'badge-neutral'}" style="padding: 1px 6px; font-size: 0.68rem;">${escapeHTML(cat.name)}</span>
                ${(tx.tags || []).map(tg => `<span style="background: rgba(255,255,255,0.05); padding: 1px 6px; border-radius: var(--radius-sm);">#${escapeHTML(tg)}</span>`).join('')}
              </div>
            </div>
          </div>
        </td>
        <td>
          <div class="flex items-center gap-2">
            <div style="width: 24px; height: 24px; border-radius: var(--radius-full); background: ${member.avatarColor || 'var(--primary)'}; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700;">
              ${escapeHTML(member.shortName ? member.shortName[0] : 'G')}
            </div>
            <span style="font-size: 0.85rem; font-weight: 600;">${escapeHTML(member.shortName || member.name)}</span>
          </div>
        </td>
        <td>
          <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">
            <i class="fa-solid fa-credit-card" style="font-size: 0.75rem; color: var(--text-muted);"></i>
            ${escapeHTML(acc.name)}
            ${targetAcc ? ` ➔ <span style="color: var(--primary);">${escapeHTML(targetAcc.name)}</span>` : ''}
          </div>
        </td>
        <td style="text-align: right;">
          <div class="tx-amount ${amountClass}" style="font-size: 0.98rem;">
            ${prefix}${formatCurrency(tx.amount, currency)}
          </div>
        </td>
        <td style="text-align: center;">
          <button class="btn-icon-header btn-delete-tx" data-id="${tx.id}" style="width: 32px; height: 32px; font-size: 0.8rem; margin: 0 auto; color: var(--rose);" title="Xóa giao dịch">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function setupTxEventListeners(state) {
  // Add Tx Button
  const btnAdd = document.getElementById('btnOpenAddTxModal');
  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      populateTxModalSelects(state);
      document.getElementById('formTransaction').reset();
      document.getElementById('txModalDate').value = new Date().toISOString().split('T')[0];
      openModal('modalTransaction');
    });
  }

  // Filter input listeners
  const searchInput = document.getElementById('txSearchKeyword');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentFilter.keyword = e.target.value;
      renderTransactions();
    });
  }

  const filterType = document.getElementById('txFilterType');
  if (filterType) {
    filterType.addEventListener('change', (e) => {
      currentFilter.type = e.target.value;
      renderTransactions();
    });
  }

  const filterCat = document.getElementById('txFilterCategory');
  if (filterCat) {
    filterCat.addEventListener('change', (e) => {
      currentFilter.categoryId = e.target.value;
      renderTransactions();
    });
  }

  const filterAcc = document.getElementById('txFilterAccount');
  if (filterAcc) {
    filterAcc.addEventListener('change', (e) => {
      currentFilter.accountId = e.target.value;
      renderTransactions();
    });
  }

  // Delete Tx buttons
  document.querySelectorAll('.btn-delete-tx').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Bạn có chắc chắn muốn xóa giao dịch này? Số dư tài khoản sẽ được hoàn lại tương ứng.')) {
        deleteTransaction(id);
        showToast('Đã xóa giao dịch thành công', 'success');
      }
    });
  });
}

export function populateTxModalSelects(state) {
  // Category select
  const catSelect = document.getElementById('txModalCategory');
  const typeSeg = document.querySelector('.tx-type-seg.active')?.getAttribute('data-type') || 'expense';
  
  if (catSelect) {
    const cats = state.categories.filter(c => c.type === typeSeg);
    catSelect.innerHTML = cats.map(c => `
      <option value="${c.id}">${escapeHTML(c.name)}</option>
    `).join('');
  }

  // Account select
  const accSelect = document.getElementById('txModalAccount');
  if (accSelect) {
    accSelect.innerHTML = state.accounts.map(a => `
      <option value="${a.id}">${escapeHTML(a.name)} (${formatCompactCurrency(a.balance, state.settings.currency)})</option>
    `).join('');
  }

  // Member select
  const memSelect = document.getElementById('txModalMember');
  if (memSelect) {
    memSelect.innerHTML = state.members.map(m => `
      <option value="${m.id}">${escapeHTML(m.name)}</option>
    `).join('');
  }
}

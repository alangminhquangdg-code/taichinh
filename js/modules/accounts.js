/**
 * MODULE: ACCOUNTS & WALLETS (QUẢN TRỊ TÀI KHOẢN & VÍ TIỀN)
 */
import { getState, saveAccount, deleteAccount, addTransaction } from '../state.js';
import { formatCurrency, formatCompactCurrency, escapeHTML, generateUUID } from '../utils/formatters.js';
import { showToast, openModal, closeModal } from '../utils/notifications.js';

export function renderAccounts() {
  const container = document.getElementById('accountsView');
  if (!container) return;

  const state = getState();
  const currency = state.settings.currency;
  const selectedMemberId = state.settings.selectedMemberId || 'all';

  let filteredAccounts = state.accounts;
  if (selectedMemberId !== 'all') {
    filteredAccounts = state.accounts.filter(a => a.ownerId === selectedMemberId || a.ownerId === 'all');
  }

  // Calculate Totals
  let totalCash = 0;
  let totalBank = 0;
  let totalEWallet = 0;
  let totalCreditDebt = 0;
  let totalCreditLimit = 0;

  state.accounts.forEach(a => {
    if (a.type === 'cash') totalCash += (a.balance || 0);
    else if (a.type === 'bank') totalBank += (a.balance || 0);
    else if (a.type === 'ewallet') totalEWallet += (a.balance || 0);
    else if (a.type === 'credit') {
      totalCreditDebt += Math.abs(a.balance < 0 ? a.balance : 0);
      totalCreditLimit += (a.creditLimit || 0);
    }
  });

  const totalLiquidBalance = totalCash + totalBank + totalEWallet;

  container.innerHTML = `
    <!-- Top Action Bar -->
    <div class="flex items-center justify-between flex-wrap gap-4 mb-6">
      <div>
        <h2 style="font-size: 1.35rem; font-weight: 800;">Tài Khoản & Danh Mục Ví</h2>
        <p style="font-size: 0.85rem; color: var(--text-muted);">Quản lý dòng tiền mặt, tài khoản ngân hàng và thẻ tín dụng gia đình</p>
      </div>
      <div class="flex items-center gap-3">
        <button class="btn btn-secondary btn-sm" id="btnOpenTransferModal">
          <i class="fa-solid fa-arrow-right-arrow-left"></i> Chuyển tiền nội bộ
        </button>
        <button class="btn btn-primary btn-sm" id="btnOpenAddAccountModal">
          <i class="fa-solid fa-plus"></i> Thêm tài khoản mới
        </button>
      </div>
    </div>

    <!-- Account Summary 4 Cards -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="stat-card emerald">
        <div class="stat-top">
          <span class="stat-label">Tổng Số Dư Khả Dụng</span>
          <div class="stat-icon-box emerald"><i class="fa-solid fa-wallet"></i></div>
        </div>
        <div class="stat-value">${formatCurrency(totalLiquidBalance, currency)}</div>
        <div class="stat-footer">
          <span class="stat-subtext">Tiền mặt + Ngân hàng + Ví ĐT</span>
        </div>
      </div>

      <div class="stat-card primary">
        <div class="stat-top">
          <span class="stat-label">Tài Khoản Ngân Hàng</span>
          <div class="stat-icon-box primary"><i class="fa-solid fa-building-columns"></i></div>
        </div>
        <div class="stat-value">${formatCurrency(totalBank, currency)}</div>
        <div class="stat-footer">
          <span class="stat-subtext">${state.accounts.filter(a => a.type === 'bank').length} tài khoản</span>
        </div>
      </div>

      <div class="stat-card rose">
        <div class="stat-top">
          <span class="stat-label">Dư Nợ Thẻ Tín Dụng</span>
          <div class="stat-icon-box rose"><i class="fa-solid fa-credit-card"></i></div>
        </div>
        <div class="stat-value">${formatCurrency(totalCreditDebt, currency)}</div>
        <div class="stat-footer">
          <span class="stat-subtext">Hạn mức khả dụng: ${formatCompactCurrency(totalCreditLimit - totalCreditDebt, currency)}</span>
        </div>
      </div>

      <div class="stat-card purple">
        <div class="stat-top">
          <span class="stat-label">Tiền Mặt & Ví Điện Tử</span>
          <div class="stat-icon-box purple"><i class="fa-solid fa-money-bill-wave"></i></div>
        </div>
        <div class="stat-value">${formatCurrency(totalCash + totalEWallet, currency)}</div>
        <div class="stat-footer">
          <span class="stat-subtext">Sẵn sàng chi tiêu tức thì</span>
        </div>
      </div>
    </div>

    <!-- Accounts Cards Grid -->
    <div class="grid grid-cols-3 gap-6 mb-8" id="accountsListGrid">
      ${renderAccountCards(filteredAccounts, state, currency)}
    </div>
  `;

  // Setup Event Listeners
  setupAccountEventListeners(state);
}

function renderAccountCards(accounts, state, currency) {
  if (!accounts || accounts.length === 0) {
    return `<div class="card w-full" style="grid-column: span 3; text-align: center; color: var(--text-muted); padding: 40px;">
      Chưa có tài khoản nào. Hãy nhấn "Thêm tài khoản mới".
    </div>`;
  }

  return accounts.map(acc => {
    let ownerText = 'Quỹ chung gia đình';
    if (acc.ownerId && acc.ownerId !== 'all') {
      const mem = state.members.find(m => m.id === acc.ownerId);
      if (mem) ownerText = `Sở hữu: ${mem.name}`;
    }

    let typeBadge = 'Tài khoản Ngân hàng';
    let typeClass = 'bank';
    let icon = 'fa-building-columns';

    if (acc.type === 'cash') {
      typeBadge = 'Tiền mặt';
      typeClass = 'cash';
      icon = 'fa-money-bill-wave';
    } else if (acc.type === 'credit') {
      typeBadge = 'Thẻ tín dụng';
      typeClass = 'credit';
      icon = 'fa-credit-card';
    } else if (acc.type === 'ewallet') {
      typeBadge = 'Ví điện tử';
      typeClass = 'ewallet';
      icon = 'fa-wallet';
    }

    const isCredit = acc.type === 'credit';

    return `
      <div class="wallet-card ${typeClass}" data-account-id="${acc.id}">
        <i class="fa-solid ${icon} wallet-card-bg"></i>
        <div class="wallet-top">
          <div>
            <span class="wallet-badge-type">${typeBadge}</span>
            <div class="wallet-name">${escapeHTML(acc.name)}</div>
            <div class="wallet-owner"><i class="fa-solid fa-user-tag"></i> ${escapeHTML(ownerText)}</div>
            ${acc.accountNumber ? `<div style="font-size: 0.72rem; color: rgba(255,255,255,0.6); margin-top: 4px; font-family: var(--font-mono);">STK: ${escapeHTML(acc.accountNumber)}</div>` : ''}
          </div>
          <div class="flex items-center gap-2">
            <button class="btn-icon-header btn-edit-account" data-id="${acc.id}" style="width: 32px; height: 32px; font-size: 0.8rem; background: rgba(255,255,255,0.1); border: none;" title="Chỉnh sửa">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn-icon-header btn-delete-account" data-id="${acc.id}" style="width: 32px; height: 32px; font-size: 0.8rem; background: rgba(255,255,255,0.1); border: none; color: var(--rose);" title="Xóa">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>

        <div class="wallet-balance-wrap">
          <div class="wallet-balance-label">${isCredit ? 'Dư nợ hiện tại' : 'Số dư khả dụng'}</div>
          <div class="wallet-balance-num" style="${isCredit && acc.balance < 0 ? 'color: #fca5a5;' : ''}">
            ${formatCurrency(isCredit ? Math.abs(acc.balance) : acc.balance, currency)}
          </div>
          ${isCredit ? `
            <div style="font-size: 0.75rem; color: rgba(255,255,255,0.7); margin-top: 6px; display: flex; justify-content: space-between;">
              <span>Hạn mức: ${formatCompactCurrency(acc.creditLimit || 0, currency)}</span>
              <span>Sao kê: ngày ${acc.statementDate || 20}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function populateAccountOwnerSelect(state) {
  const ownerSelect = document.getElementById('accOwner');
  if (ownerSelect) {
    let options = `<option value="all">👨‍👩‍👧‍👦 Quỹ chung gia đình</option>`;
    state.members.forEach(m => {
      options += `<option value="${m.id}">👤 ${escapeHTML(m.name)}</option>`;
    });
    ownerSelect.innerHTML = options;
  }
}

function setupAccountEventListeners(state) {
  // Add Account Button
  const btnAdd = document.getElementById('btnOpenAddAccountModal');
  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      populateAccountOwnerSelect(state);
      document.getElementById('formAccount').reset();
      document.getElementById('accModalId').value = '';
      document.getElementById('accModalTitle').textContent = 'Thêm Tài Khoản / Ví Mới';
      toggleCreditFields('bank');
      openModal('modalAccount');
    });
  }

  // Transfer Button
  const btnTransfer = document.getElementById('btnOpenTransferModal');
  if (btnTransfer) {
    btnTransfer.addEventListener('click', () => {
      populateTransferSelects(state);
      document.getElementById('formTransfer').reset();
      openModal('modalTransfer');
    });
  }

  // Edit Account Buttons
  document.querySelectorAll('.btn-edit-account').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const acc = state.accounts.find(a => a.id === id);
      if (acc) {
        populateAccountOwnerSelect(state);
        document.getElementById('accModalId').value = acc.id;
        document.getElementById('accName').value = acc.name;
        document.getElementById('accType').value = acc.type;
        document.getElementById('accBalance').value = acc.balance;
        document.getElementById('accOwner').value = acc.ownerId || 'all';
        document.getElementById('accNumber').value = acc.accountNumber || '';
        document.getElementById('accCreditLimit').value = acc.creditLimit || 0;
        document.getElementById('accModalTitle').textContent = 'Chỉnh Sửa Tài Khoản';
        
        // Toggle credit fields
        toggleCreditFields(acc.type);
        openModal('modalAccount');
      }
    });
  });

  // Account type change listener in modal
  const accTypeSelect = document.getElementById('accType');
  if (accTypeSelect) {
    accTypeSelect.addEventListener('change', (e) => {
      toggleCreditFields(e.target.value);
    });
  }

  // Delete Account Buttons
  document.querySelectorAll('.btn-delete-account').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      if (confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
        deleteAccount(id);
        showToast('Đã xóa tài khoản thành công', 'success');
      }
    });
  });
}

function toggleCreditFields(type) {
  const creditGroup = document.getElementById('creditFieldsGroup');
  if (creditGroup) {
    creditGroup.style.display = type === 'credit' ? 'block' : 'none';
  }
}

function populateTransferSelects(state) {
  const fromSelect = document.getElementById('transferFromAcc');
  const toSelect = document.getElementById('transferToAcc');
  if (!fromSelect || !toSelect) return;

  const options = state.accounts.map(a => 
    `<option value="${a.id}">${escapeHTML(a.name)} (${formatCompactCurrency(a.balance, state.settings.currency)})</option>`
  ).join('');

  fromSelect.innerHTML = options;
  toSelect.innerHTML = options;
  if (toSelect.options.length > 1) {
    toSelect.selectedIndex = 1;
  }
}

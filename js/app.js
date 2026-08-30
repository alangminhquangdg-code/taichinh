/**
 * APPLICATION BOOTSTRAPPER & EVENT DISPATCHER
 */
import { getState, saveState, subscribe, addTransaction, saveAccount, saveBudget, saveGoal, depositToGoal, saveDebt, payDebtInstallment, saveInvestment, saveMember } from './state.js';
import { setupModalListeners, openModal, closeModal, showToast, triggerConfetti } from './utils/notifications.js';
import { formatCompactCurrency, generateUUID } from './utils/formatters.js';

// Module Renderers
import { renderDashboard } from './modules/dashboard.js';
import { renderAccounts, } from './modules/accounts.js';
import { renderTransactions, populateTxModalSelects } from './modules/transactions.js';
import { renderBudgets } from './modules/budgets.js';
import { renderSavings } from './modules/savings.js';
import { renderDebts } from './modules/debts.js';
import { renderInvestments } from './modules/investments.js';
import { renderFamily } from './modules/family.js';
import { renderReports } from './modules/reports.js';
import { renderAiAdvisor } from './modules/aiAdvisor.js';
import { renderSettings } from './modules/settings.js';
import './firebase.js';

let currentTab = 'dashboard';

// Initialize the Application
document.addEventListener('DOMContentLoaded', () => {
  const state = getState();

  // Apply Theme
  if (state.settings.theme) {
    document.documentElement.setAttribute('data-theme', state.settings.theme);
  }

  // Setup UI components
  setupModalListeners();
  setupNavigation();
  setupHeaderMemberFilter();
  setupGlobalModals();
  setupMobileDrawer();

  // Subscribe to state updates to re-render active view
  subscribe(() => {
    renderCurrentTab();
    updateHeaderStats();
  });

  // Initial Render
  renderCurrentTab();
  updateHeaderStats();
});

// Render the active Tab View
function renderCurrentTab() {
  // Hide all views
  document.querySelectorAll('.tab-view').forEach(el => el.classList.remove('active'));

  // Update Page Title
  const titleMap = {
    'dashboard': { title: 'Tổng Quan Tài Chính', sub: 'Thống kê tài sản ròng, dòng tiền và phân bổ chi tiêu' },
    'accounts': { title: 'Tài Khoản & Danh Mục Ví', sub: 'Quản trị tiền mặt, tài khoản ngân hàng và thẻ tín dụng' },
    'transactions': { title: 'Sổ Giao Dịch Chi Tiết', sub: 'Lịch sử dòng tiền thu chi, chuyển khoản và hóa đơn' },
    'budgets': { title: 'Ngân Sách & Hạn Mức', sub: 'Kiểm soát hạn mức danh mục và quy tắc 50/30/20' },
    'savings': { title: 'Mục Tiêu Tiết Kiệm', sub: 'Tích lũy ước mơ và các quỹ tài chính quan trọng' },
    'debts': { title: 'Sổ Nợ & Cho Vay', sub: 'Theo dõi vay mua nhà, trả góp và tiền cho vay cá nhân' },
    'investments': { title: 'Đầu Tư & Sổ Tiết Kiệm', sub: 'Tiền gửi ngân hàng có kỳ hạn, vàng, chứng khoán sinh lời' },
    'family': { title: 'Thành Viên & Quỹ Chung', sub: 'Quản lý tài khoản thành viên, hạn mức cá nhân và quỹ chung' },
    'reports': { title: 'Báo Cáo & Sức Khỏe Tài Chính', sub: 'Báo cáo lưu chuyển tiền tệ, điểm sức khỏe và xuất Excel' },
    'ai-advisor': { title: 'Trợ Lý Tài Chính AI', sub: 'Tư vấn phân tích thông minh, cảnh báo vượt mức và chiến lược' },
    'settings': { title: 'Cài Đặt & Dữ Liệu', sub: 'Tùy chỉnh giao diện theme, tiền tệ và sao lưu an toàn' }
  };

  const currentInfo = titleMap[currentTab] || titleMap['dashboard'];
  const titleEl = document.getElementById('headerPageTitle');
  const subEl = document.getElementById('headerPageSubtitle');
  if (titleEl) titleEl.textContent = currentInfo.title;
  if (subEl) subEl.textContent = currentInfo.sub;

  // Show active view and render
  if (currentTab === 'dashboard') {
    document.getElementById('dashboardView')?.classList.add('active');
    renderDashboard();
  } else if (currentTab === 'accounts') {
    document.getElementById('accountsView')?.classList.add('active');
    renderAccounts();
  } else if (currentTab === 'transactions') {
    document.getElementById('transactionsView')?.classList.add('active');
    renderTransactions();
  } else if (currentTab === 'budgets') {
    document.getElementById('budgetsView')?.classList.add('active');
    renderBudgets();
  } else if (currentTab === 'savings') {
    document.getElementById('savingsView')?.classList.add('active');
    renderSavings();
  } else if (currentTab === 'debts') {
    document.getElementById('debtsView')?.classList.add('active');
    renderDebts();
  } else if (currentTab === 'investments') {
    document.getElementById('investmentsView')?.classList.add('active');
    renderInvestments();
  } else if (currentTab === 'family') {
    document.getElementById('familyView')?.classList.add('active');
    renderFamily();
  } else if (currentTab === 'reports') {
    document.getElementById('reportsView')?.classList.add('active');
    renderReports();
  } else if (currentTab === 'ai-advisor') {
    document.getElementById('aiAdvisorView')?.classList.add('active');
    renderAiAdvisor();
  } else if (currentTab === 'settings') {
    document.getElementById('settingsView')?.classList.add('active');
    renderSettings();
  }
}

// Navigation Tab Switcher
function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = item.getAttribute('data-tab');
      if (targetTab) {
        currentTab = targetTab;
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        // Close mobile drawer if open
        document.getElementById('appSidebar')?.classList.remove('mobile-open');
        renderCurrentTab();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });

  // Global Quick Add Button in Top Header
  const btnGlobalAdd = document.getElementById('btnGlobalQuickAdd');
  if (btnGlobalAdd) {
    btnGlobalAdd.addEventListener('click', () => {
      const state = getState();
      populateTxModalSelects(state);
      document.getElementById('formTransaction').reset();
      document.getElementById('txModalDate').value = new Date().toISOString().split('T')[0];
      openModal('modalTransaction');
    });
  }
}

// Header Family Member Filter & Theme Toggle
function setupHeaderMemberFilter() {
  const memberSelect = document.getElementById('memberFilterSelect');
  if (memberSelect) {
    memberSelect.addEventListener('change', (e) => {
      const state = getState();
      state.settings.selectedMemberId = e.target.value;
      saveState();
      showToast(`Đã lọc theo: ${memberSelect.options[memberSelect.selectedIndex].text}`, 'info');
    });
  }

  // Quick Theme Toggle Button in Header
  const btnThemeToggle = document.getElementById('btnThemeToggle');
  if (btnThemeToggle) {
    btnThemeToggle.addEventListener('click', () => {
      const state = getState();
      const themes = ['dark', 'light', 'emerald'];
      const curIdx = themes.indexOf(state.settings.theme || 'dark');
      const nextTheme = themes[(curIdx + 1) % themes.length];
      
      state.settings.theme = nextTheme;
      document.documentElement.setAttribute('data-theme', nextTheme);
      saveState();
      showToast(`Đã chuyển theme sang ${nextTheme.toUpperCase()}`, 'success');
    });
  }
}

// Update Mini Widget in Sidebar and Top Header Member Select
function updateHeaderStats() {
  const state = getState();

  // 1. Update Mini Avatars in Sidebar
  const avatarGroup = document.getElementById('sidebarFamilyAvatars');
  if (avatarGroup) {
    avatarGroup.innerHTML = state.members.map(m => `
      <div class="avatar-mini" style="background-color: ${m.avatarColor || '#3b82f6'};" title="${m.name}">
        ${m.shortName ? m.shortName[0] : (m.name ? m.name[0] : 'G')}
      </div>
    `).join('');
  }

  // 2. Update Top Header Member Filter Dropdown
  const memberSelect = document.getElementById('memberFilterSelect');
  if (memberSelect) {
    const currentVal = state.settings.selectedMemberId || 'all';
    let options = `<option value="all" ${currentVal === 'all' ? 'selected' : ''}>👨‍👩‍👧‍👦 Cả Gia Đình</option>`;
    state.members.forEach(m => {
      options += `<option value="${m.id}" ${currentVal === m.id ? 'selected' : ''}>👤 ${m.name}</option>`;
    });
    memberSelect.innerHTML = options;
  }
}

// Setup All Global Modal Forms
function setupGlobalModals() {
  const state = getState();

  // 1. Transaction Type Segmented Switcher in Modal
  document.querySelectorAll('.tx-type-seg').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tx-type-seg').forEach(b => b.classList.remove('active', 'expense', 'income', 'transfer'));
      const type = btn.getAttribute('data-type');
      btn.classList.add('active', type);

      const targetAccGroup = document.getElementById('txTargetAccountGroup');
      const catGroup = document.getElementById('txCategoryGroup');

      if (type === 'transfer') {
        if (targetAccGroup) targetAccGroup.style.display = 'block';
        if (catGroup) catGroup.style.display = 'none';
      } else {
        if (targetAccGroup) targetAccGroup.style.display = 'none';
        if (catGroup) catGroup.style.display = 'block';
      }

      populateTxModalSelects(getState());
    });
  });

  // Fast amount helper chips
  document.querySelectorAll('.amount-chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const addVal = Number(btn.getAttribute('data-amount') || 0);
      const input = document.getElementById('txModalAmount');
      if (input) {
        const cur = Number(input.value || 0);
        input.value = cur + addVal;
      }
    });
  });

  // 2. Submit Transaction Form
  const formTx = document.getElementById('formTransaction');
  if (formTx) {
    formTx.addEventListener('submit', (e) => {
      e.preventDefault();
      const amount = Number(document.getElementById('txModalAmount').value);
      if (amount <= 0) {
        showToast('Vui lòng nhập số tiền hợp lệ!', 'error');
        return;
      }

      const type = document.querySelector('.tx-type-seg.active')?.getAttribute('data-type') || 'expense';
      const categoryId = document.getElementById('txModalCategory').value;
      const accountId = document.getElementById('txModalAccount').value;
      const targetAccountId = type === 'transfer' ? document.getElementById('txModalTargetAccount').value : null;
      const memberId = document.getElementById('txModalMember').value;
      const date = document.getElementById('txModalDate').value || new Date().toISOString().split('T')[0];
      const note = document.getElementById('txModalNote').value.trim();
      const rawTags = document.getElementById('txModalTags')?.value || '';
      const tags = rawTags.split(',').map(t => t.trim()).filter(t => t);

      addTransaction({
        id: generateUUID(),
        type,
        amount,
        categoryId: type === 'transfer' ? null : categoryId,
        accountId,
        targetAccountId,
        memberId,
        date,
        note,
        tags
      });

      closeModal('modalTransaction');
      showToast('Đã thêm giao dịch thành công!', 'success');
    });
  }

  // 3. Submit Account Form
  const formAcc = document.getElementById('formAccount');
  if (formAcc) {
    formAcc.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('accModalId').value || generateUUID();
      const name = document.getElementById('accName').value.trim();
      const type = document.getElementById('accType').value;
      const balance = Number(document.getElementById('accBalance').value || 0);
      const ownerId = document.getElementById('accOwner').value;
      const accountNumber = document.getElementById('accNumber').value.trim();
      const creditLimit = Number(document.getElementById('accCreditLimit').value || 0);

      saveAccount({
        id,
        name,
        type,
        balance,
        ownerId,
        accountNumber,
        creditLimit,
        statementDate: 20,
        dueDate: 5
      });

      closeModal('modalAccount');
      showToast('Đã lưu tài khoản thành công!', 'success');
    });
  }

  // 4. Submit Internal Transfer Form
  const formTransfer = document.getElementById('formTransfer');
  if (formTransfer) {
    formTransfer.addEventListener('submit', (e) => {
      e.preventDefault();
      const fromAccId = document.getElementById('transferFromAcc').value;
      const toAccId = document.getElementById('transferToAcc').value;
      const amount = Number(document.getElementById('transferAmount').value);
      const note = document.getElementById('transferNote').value.trim() || 'Chuyển tiền nội bộ';

      if (fromAccId === toAccId) {
        showToast('Tài khoản nguồn và tài khoản đích không được trùng nhau!', 'error');
        return;
      }
      if (amount <= 0) {
        showToast('Vui lòng nhập số tiền lớn hơn 0!', 'error');
        return;
      }

      addTransaction({
        id: generateUUID(),
        type: 'transfer',
        amount,
        accountId: fromAccId,
        targetAccountId: toAccId,
        memberId: 'all',
        date: new Date().toISOString().split('T')[0],
        note
      });

      closeModal('modalTransfer');
      showToast('Chuyển tiền nội bộ thành công!', 'success');
    });
  }

  // 5. Submit Budget Form
  const formBudget = document.getElementById('formBudget');
  if (formBudget) {
    formBudget.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('budgetModalId').value || generateUUID();
      const categoryId = document.getElementById('budgetModalCategory').value;
      const amount = Number(document.getElementById('budgetModalAmount').value);

      saveBudget({
        id,
        categoryId,
        memberId: 'all',
        amount,
        period: 'monthly'
      });

      closeModal('modalBudget');
      showToast('Đã lưu ngân sách thành công!', 'success');
    });
  }

  // 6. Submit Goal Form
  const formGoal = document.getElementById('formGoal');
  if (formGoal) {
    formGoal.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('goalModalId').value || generateUUID();
      const name = document.getElementById('goalName').value.trim();
      const targetAmount = Number(document.getElementById('goalTarget').value);
      const currentAmount = Number(document.getElementById('goalCurrent').value || 0);
      const targetDate = document.getElementById('goalDate').value;
      const note = document.getElementById('goalNote').value.trim();

      saveGoal({
        id,
        name,
        targetAmount,
        currentAmount,
        targetDate,
        icon: 'fa-piggy-bank',
        color: '#10b981',
        note
      });

      closeModal('modalGoal');
      showToast('Đã lưu mục tiêu tiết kiệm!', 'success');
    });
  }

  // 7. Submit Deposit to Goal
  const formDepositGoal = document.getElementById('formDepositGoal');
  if (formDepositGoal) {
    formDepositGoal.addEventListener('submit', (e) => {
      e.preventDefault();
      const goalId = document.getElementById('depositGoalId').value;
      const fromAcc = document.getElementById('depositFromAcc').value;
      const amount = Number(document.getElementById('depositAmount').value);

      if (amount <= 0) {
        showToast('Vui lòng nhập số tiền nạp hợp lệ!', 'error');
        return;
      }

      const ok = depositToGoal(goalId, amount, fromAcc);
      if (ok) {
        closeModal('modalDepositGoal');
        triggerConfetti();
        showToast('🎉 Nạp tiền tích lũy thành công!', 'success');
      } else {
        showToast('Không thể nạp tiền, vui lòng kiểm tra lại số dư!', 'error');
      }
    });
  }

  // 8. Submit Debt Form
  const formDebt = document.getElementById('formDebt');
  if (formDebt) {
    formDebt.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('debtModalId').value || generateUUID();
      const type = document.getElementById('debtType').value;
      const personName = document.getElementById('debtPersonName').value.trim();
      const originalAmount = Number(document.getElementById('debtOriginal').value);
      const paidAmount = Number(document.getElementById('debtPaid').value || 0);
      const interestRate = Number(document.getElementById('debtRate').value || 0);
      const dueDate = document.getElementById('debtDueDate').value;
      const note = document.getElementById('debtNote').value.trim();

      saveDebt({
        id,
        type,
        personName,
        originalAmount,
        paidAmount,
        interestRate,
        dueDate,
        note,
        payments: []
      });

      closeModal('modalDebt');
      showToast('Đã lưu khoản nợ / cho vay!', 'success');
    });
  }

  // 9. Submit Pay Debt Form
  const formPayDebt = document.getElementById('formPayDebt');
  if (formPayDebt) {
    formPayDebt.addEventListener('submit', (e) => {
      e.preventDefault();
      const debtId = document.getElementById('payDebtId').value;
      const amount = Number(document.getElementById('payDebtAmount').value);
      const fromAcc = document.getElementById('payDebtFromAcc').value;
      const note = document.getElementById('payDebtNote').value.trim();

      const ok = payDebtInstallment(debtId, amount, fromAcc, note);
      if (ok) {
        closeModal('modalPayDebt');
        showToast('Đã ghi nhận thanh toán nợ thành công!', 'success');
      } else {
        showToast('Không thể thanh toán nợ, vui lòng thử lại!', 'error');
      }
    });
  }

  // 10. Submit Invest Form
  const formInvest = document.getElementById('formInvest');
  if (formInvest) {
    formInvest.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('investModalId').value || generateUUID();
      const type = document.getElementById('investType').value;
      const name = document.getElementById('investName').value.trim();
      const code = document.getElementById('investCode').value.trim();

      if (type === 'term_deposit') {
        const principalAmount = Number(document.getElementById('investPrincipal').value);
        const interestRate = Number(document.getElementById('investRate').value);
        const termMonths = Number(document.getElementById('investMonths').value);
        const openDate = document.getElementById('investOpenDate').value;
        const maturityDate = document.getElementById('investMaturityDate').value;

        saveInvestment({
          id,
          type,
          name,
          code,
          principalAmount,
          interestRate,
          termMonths,
          openDate,
          maturityDate,
          status: 'active'
        });
      } else {
        const quantity = Number(document.getElementById('investQuantity').value);
        const buyPrice = Number(document.getElementById('investBuyPrice').value);
        const currentPrice = Number(document.getElementById('investCurrentPrice').value);

        saveInvestment({
          id,
          type,
          name,
          code,
          quantity,
          buyPrice,
          currentPrice,
          costBasis: quantity * buyPrice,
          marketValue: quantity * currentPrice,
          status: 'active'
        });
      }

      closeModal('modalInvest');
      showToast('Đã lưu tài sản đầu tư!', 'success');
    });
  }

  // 11. Submit Member Form
  const formMember = document.getElementById('formMember');
  if (formMember) {
    formMember.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('memberModalId').value || generateUUID();
      const name = document.getElementById('memberName').value.trim();
      const shortName = document.getElementById('memberShortName').value.trim() || name;
      const role = document.getElementById('memberRole').value.trim();
      const monthlyQuota = Number(document.getElementById('memberQuota').value || 0);

      const currentState = getState();
      const existing = currentState.members.find(m => m.id === id);

      saveMember({
        id,
        name,
        shortName,
        role,
        avatarColor: existing?.avatarColor || '#3b82f6',
        monthlyQuota,
        icon: existing?.icon || 'fa-user'
      });

      closeModal('modalMember');
      showToast('Đã lưu hồ sơ thành viên thành công!', 'success');
    });
  }
}

// Setup Mobile Navigation Drawer Toggle
function setupMobileDrawer() {
  const btnToggle = document.getElementById('btnMobileMenuToggle');
  const sidebar = document.getElementById('appSidebar');

  if (btnToggle && sidebar) {
    btnToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }
}

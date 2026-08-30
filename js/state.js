/**
 * GLOBAL STATE MANAGEMENT & LOCAL STORAGE PERSISTENCE
 */

const STORAGE_KEY = 'family_finance_hub_v1';

// Initial Demo Seed Data for a modern Vietnamese family
const INITIAL_STATE = {
  settings: {
    currency: 'VND',
    theme: 'dark',
    selectedMemberId: 'all',
    selectedPeriod: 'this_month',
    customDateRange: null
  },
  members: [
    {
      id: 'mem-1',
      name: 'Nguyễn Minh Quân (Bố)',
      shortName: 'Bố Quân',
      role: 'Chủ hộ / Thu nhập chính',
      avatarColor: '#3b82f6',
      icon: 'fa-user-tie',
      monthlyQuota: 15000000,
      monthlyIncomeTarget: 45000000
    },
    {
      id: 'mem-2',
      name: 'Trần Thu Hương (Mẹ)',
      shortName: 'Mẹ Hương',
      role: 'Thủ quỹ gia đình',
      avatarColor: '#ec4899',
      icon: 'fa-user',
      monthlyQuota: 25000000,
      monthlyIncomeTarget: 30000000
    },
    {
      id: 'mem-3',
      name: 'Nguyễn Nam Khánh',
      shortName: 'Nam Khánh',
      role: 'Con trai (Lớp 11)',
      avatarColor: '#10b981',
      icon: 'fa-graduation-cap',
      monthlyQuota: 3000000,
      monthlyIncomeTarget: 0
    },
    {
      id: 'mem-4',
      name: 'Nguyễn Bảo Ngọc',
      shortName: 'Bảo Ngọc',
      role: 'Con gái (Lớp 6)',
      avatarColor: '#8b5cf6',
      icon: 'fa-child',
      monthlyQuota: 1500000,
      monthlyIncomeTarget: 0
    }
  ],
  accounts: [
    {
      id: 'acc-1',
      name: 'Vietcombank - Quỹ chung',
      type: 'bank',
      bankName: 'VCB',
      accountNumber: '10188996688',
      balance: 145000000,
      ownerId: 'all',
      color: '#00843D',
      icon: 'fa-building-columns'
    },
    {
      id: 'acc-2',
      name: 'Techcombank - Tài khoản Bố',
      type: 'bank',
      bankName: 'TCB',
      accountNumber: '19034567890',
      balance: 52000000,
      ownerId: 'mem-1',
      color: '#EB1B24',
      icon: 'fa-building-columns'
    },
    {
      id: 'acc-3',
      name: 'MB Bank - Tài khoản Mẹ',
      type: 'bank',
      bankName: 'MB',
      accountNumber: '0987654321',
      balance: 38500000,
      ownerId: 'mem-2',
      color: '#1C3F94',
      icon: 'fa-building-columns'
    },
    {
      id: 'acc-4',
      name: 'Tiền mặt tại nhà',
      type: 'cash',
      balance: 12500000,
      ownerId: 'all',
      color: '#10B981',
      icon: 'fa-money-bill-wave'
    },
    {
      id: 'acc-5',
      name: 'Thẻ tín dụng VCB Signature',
      type: 'credit',
      bankName: 'Vietcombank',
      balance: -18500000, // Dư nợ đã quẹt
      creditLimit: 100000000,
      statementDate: 20,
      dueDate: 5,
      ownerId: 'mem-1',
      color: '#4B5563',
      icon: 'fa-credit-card'
    },
    {
      id: 'acc-6',
      name: 'Ví MoMo Gia đình',
      type: 'ewallet',
      balance: 6200000,
      ownerId: 'mem-2',
      color: '#A50064',
      icon: 'fa-wallet'
    }
  ],
  categories: [
    // Chi tiêu
    { id: 'cat-food', name: 'Ăn uống & Đi chợ', type: 'expense', icon: 'fa-utensils', color: '#f59e0b', jar: 'NEC', standardRatio: 0.25 },
    { id: 'cat-housing', name: 'Nhà cửa & Tiện ích (Điện/Nước/Net)', type: 'expense', icon: 'fa-house', color: '#3b82f6', jar: 'NEC', standardRatio: 0.15 },
    { id: 'cat-education', name: 'Giáo dục & Học phí con', type: 'expense', icon: 'fa-graduation-cap', color: '#8b5cf6', jar: 'NEC', standardRatio: 0.12 },
    { id: 'cat-transport', name: 'Xăng xe & Đi lại', type: 'expense', icon: 'fa-car', color: '#06b6d4', jar: 'NEC', standardRatio: 0.06 },
    { id: 'cat-healthcare', name: 'Y tế & Sức khỏe', type: 'expense', icon: 'fa-heart-pulse', color: '#ef4444', jar: 'NEC', standardRatio: 0.05 },
    { id: 'cat-shopping', name: 'Mua sắm & Trang phục', type: 'expense', icon: 'fa-bag-shopping', color: '#ec4899', jar: 'PLAY', standardRatio: 0.08 },
    { id: 'cat-entertainment', name: 'Giải trí & Du lịch', type: 'expense', icon: 'fa-umbrella-beach', color: '#14b8a6', jar: 'PLAY', standardRatio: 0.07 },
    { id: 'cat-family', name: 'Hiếu hỷ & Đối ngoại', type: 'expense', icon: 'fa-gift', color: '#f97316', jar: 'GIVE', standardRatio: 0.05 },
    // Thu nhập
    { id: 'cat-salary-dad', name: 'Lương & Thưởng Bố', type: 'income', icon: 'fa-briefcase', color: '#10b981' },
    { id: 'cat-salary-mom', name: 'Lương & Thưởng Mẹ', type: 'income', icon: 'fa-coins', color: '#059669' },
    { id: 'cat-invest-return', name: 'Lợi nhuận đầu tư & Cổ tức', type: 'income', icon: 'fa-chart-line', color: '#6366f1' },
    { id: 'cat-other-income', name: 'Thu nhập phụ khác', type: 'income', icon: 'fa-hand-holding-dollar', color: '#84cc16' }
  ],
  transactions: [],
  budgets: [
    { id: 'bgt-1', categoryId: 'cat-food', memberId: 'all', amount: 18000000, period: 'monthly' },
    { id: 'bgt-2', categoryId: 'cat-housing', memberId: 'all', amount: 7500000, period: 'monthly' },
    { id: 'bgt-3', categoryId: 'cat-education', memberId: 'all', amount: 12000000, period: 'monthly' },
    { id: 'bgt-4', categoryId: 'cat-transport', memberId: 'all', amount: 4500000, period: 'monthly' },
    { id: 'bgt-5', categoryId: 'cat-shopping', memberId: 'all', amount: 6000000, period: 'monthly' },
    { id: 'bgt-6', categoryId: 'cat-entertainment', memberId: 'all', amount: 5000000, period: 'monthly' },
    { id: 'bgt-7', categoryId: 'cat-healthcare', memberId: 'all', amount: 3500000, period: 'monthly' }
  ],
  savingsGoals: [
    {
      id: 'goal-1',
      name: 'Quỹ khẩn cấp 6 tháng',
      targetAmount: 200000000,
      currentAmount: 165000000,
      targetDate: '2026-12-31',
      icon: 'fa-shield-halved',
      color: '#10b981',
      note: 'Dự phòng trường hợp y tế hoặc công việc gián đoạn'
    },
    {
      id: 'goal-2',
      name: 'Đổi xe ô tô điện VinFast VF7',
      targetAmount: 850000000,
      currentAmount: 420000000,
      targetDate: '2027-06-30',
      icon: 'fa-car-side',
      color: '#3b82f6',
      note: 'Nâng cấp xe gia đình di chuyển an toàn'
    },
    {
      id: 'goal-3',
      name: 'Du lịch Nhật Bản mùa hoa anh đào',
      targetAmount: 90000000,
      currentAmount: 72000000,
      targetDate: '2027-04-15',
      icon: 'fa-plane-departure',
      color: '#ec4899',
      note: 'Tour gia đình 4 người Tokyo - Kyoto'
    },
    {
      id: 'goal-4',
      name: 'Quỹ đại học Nam Khánh',
      targetAmount: 300000000,
      currentAmount: 185000000,
      targetDate: '2028-08-01',
      icon: 'fa-user-graduate',
      color: '#8b5cf6',
      note: 'Học phí 4 năm Đại học Bách Khoa / Fulbright'
    }
  ],
  debts: [
    {
      id: 'debt-1',
      type: 'borrowed', // Tôi nợ
      personName: 'Ngân hàng VCB - Vay mua căn hộ Masteri',
      originalAmount: 1200000000,
      paidAmount: 850000000,
      interestRate: 8.5, // %/năm
      startDate: '2022-01-15',
      dueDate: '2030-01-15',
      monthlyPayment: 14500000,
      note: 'Gốc + lãi thanh toán ngày 15 hàng tháng',
      payments: [
        { id: 'p-1', date: '2026-07-15', amount: 14500000, note: 'Kỳ tháng 7' },
        { id: 'p-2', date: '2026-08-15', amount: 14500000, note: 'Kỳ tháng 8' }
      ]
    },
    {
      id: 'debt-2',
      type: 'lent', // Người khác nợ tôi
      personName: 'Anh Tuấn (Đồng nghiệp mượn)',
      originalAmount: 30000000,
      paidAmount: 10000000,
      interestRate: 0,
      startDate: '2026-05-10',
      dueDate: '2026-10-30',
      monthlyPayment: 0,
      note: 'Mượn sửa nhà, hứa hoàn trả trước tháng 11',
      payments: [
        { id: 'p-3', date: '2026-07-01', amount: 10000000, note: 'Trả đợt 1' }
      ]
    }
  ],
  investments: [
    {
      id: 'inv-1',
      type: 'term_deposit',
      name: 'Sổ tiết kiệm VCB 12 tháng',
      code: 'STK-998822',
      principalAmount: 250000000,
      interestRate: 5.4, // %/năm
      termMonths: 12,
      openDate: '2026-01-10',
      maturityDate: '2027-01-10',
      accruedInterest: 8437500,
      status: 'active'
    },
    {
      id: 'inv-2',
      type: 'stock',
      name: 'Cổ phiếu FPT Telecom',
      code: 'FPT',
      quantity: 2500,
      buyPrice: 110000,
      currentPrice: 135000,
      costBasis: 275000000,
      marketValue: 337500000,
      pnl: 62500000,
      pnlPercent: 22.7,
      status: 'active'
    },
    {
      id: 'inv-3',
      type: 'gold',
      name: 'Vàng miếng SJC 9999',
      code: 'SJC',
      quantity: 5, // 5 cây (lượng)
      buyPrice: 79000000,
      currentPrice: 89500000,
      costBasis: 395000000,
      marketValue: 447500000,
      pnl: 52500000,
      pnlPercent: 13.3,
      status: 'active'
    },
    {
      id: 'inv-4',
      type: 'term_deposit',
      name: 'Sổ tích lũy giáo dục Techcombank 6 tháng',
      code: 'STK-TCB-443',
      principalAmount: 120000000,
      interestRate: 4.8,
      termMonths: 6,
      openDate: '2026-04-05',
      maturityDate: '2026-10-05',
      accruedInterest: 2280000,
      status: 'active'
    }
  ]
};

// Generate realistic transactions for current month and previous month
function generateSampleTransactions() {
  const txs = [
    // Thu nhập tháng này
    { id: 'tx-1', type: 'income', amount: 48000000, categoryId: 'cat-salary-dad', accountId: 'acc-2', memberId: 'mem-1', date: '2026-08-05', note: 'Lương tháng 08 Tập đoàn Công nghệ', tags: ['Lương', 'Bố'] },
    { id: 'tx-2', type: 'income', amount: 32000000, categoryId: 'cat-salary-mom', accountId: 'acc-3', memberId: 'mem-2', date: '2026-08-05', note: 'Lương tháng 08 Ngân hàng', tags: ['Lương', 'Mẹ'] },
    { id: 'tx-3', type: 'income', amount: 6500000, categoryId: 'cat-invest-return', accountId: 'acc-1', memberId: 'mem-1', date: '2026-08-12', note: 'Cổ tức tiền mặt FPT', tags: ['Cổ tức'] },

    // Chi tiêu tháng này
    { id: 'tx-4', type: 'expense', amount: 5200000, categoryId: 'cat-food', accountId: 'acc-1', memberId: 'mem-2', date: '2026-08-06', note: 'Đi siêu thị Mega Market mua đồ ăn 2 tuần', tags: ['Siêu thị'] },
    { id: 'tx-5', type: 'expense', amount: 1450000, categoryId: 'cat-food', accountId: 'acc-6', memberId: 'mem-2', date: '2026-08-10', note: 'Đi chợ rau quả tươi', tags: ['Chợ'] },
    { id: 'tx-6', type: 'expense', amount: 2800000, categoryId: 'cat-food', accountId: 'acc-5', memberId: 'mem-1', date: '2026-08-15', note: 'Ăn tối gia đình cuối tuần tại nhà hàng', tags: ['Nhà hàng'] },
    { id: 'tx-7', type: 'expense', amount: 3850000, categoryId: 'cat-housing', accountId: 'acc-1', memberId: 'mem-2', date: '2026-08-08', note: 'Tiền điện sinh hoạt EVN tháng 7', tags: ['Hóa đơn', 'Điện'] },
    { id: 'tx-8', type: 'expense', amount: 480000, categoryId: 'cat-housing', accountId: 'acc-1', memberId: 'mem-2', date: '2026-08-08', note: 'Tiền nước sinh hoạt', tags: ['Hóa đơn', 'Nước'] },
    { id: 'tx-9', type: 'expense', amount: 350000, categoryId: 'cat-housing', accountId: 'acc-1', memberId: 'mem-1', date: '2026-08-09', note: 'Cáp quang Internet Viettel', tags: ['Internet'] },
    { id: 'tx-10', type: 'expense', amount: 1800000, categoryId: 'cat-housing', accountId: 'acc-1', memberId: 'mem-1', date: '2026-08-10', note: 'Phí dịch vụ chung cư & gửi xe', tags: ['Chung cư'] },
    { id: 'tx-11', type: 'expense', amount: 7500000, categoryId: 'cat-education', accountId: 'acc-1', memberId: 'mem-3', date: '2026-08-14', note: 'Học phí ôn thi IELTS & Toán nâng cao Nam Khánh', tags: ['Học tập'] },
    { id: 'tx-12', type: 'expense', amount: 3200000, categoryId: 'cat-education', accountId: 'acc-1', memberId: 'mem-4', date: '2026-08-14', note: 'Khóa học vẽ & bơi lội hè Bảo Ngọc', tags: ['Học tập'] },
    { id: 'tx-13', type: 'expense', amount: 1200000, categoryId: 'cat-transport', accountId: 'acc-2', memberId: 'mem-1', date: '2026-08-11', note: 'Đổ xăng xe ô tô', tags: ['Xăng'] },
    { id: 'tx-14', type: 'expense', amount: 450000, categoryId: 'cat-transport', accountId: 'acc-6', memberId: 'mem-2', date: '2026-08-16', note: 'Nạp ví VETC trạm thu phí không dừng', tags: ['VETC'] },
    { id: 'tx-15', type: 'expense', amount: 2450000, categoryId: 'cat-shopping', accountId: 'acc-5', memberId: 'mem-2', date: '2026-08-18', note: 'Mua sắm quần áo chuẩn bị năm học mới cho 2 con', tags: ['Quần áo'] },
    { id: 'tx-16', type: 'expense', amount: 1650000, categoryId: 'cat-healthcare', accountId: 'acc-6', memberId: 'mem-2', date: '2026-08-20', note: 'Mua vitamin & thực phẩm bổ sung dinh dưỡng', tags: ['Sức khỏe'] },
    { id: 'tx-17', type: 'expense', amount: 14500000, categoryId: 'cat-housing', accountId: 'acc-1', memberId: 'mem-1', date: '2026-08-15', note: 'Trả nợ gốc + lãi vay căn hộ ngân hàng VCB', tags: ['Trả nợ'] },
    { id: 'tx-18', type: 'expense', amount: 2000000, categoryId: 'cat-entertainment', accountId: 'acc-6', memberId: 'mem-1', date: '2026-08-22', note: 'Xem phim rạp IMAX & ăn kem gia đình', tags: ['Giải trí'] },
    { id: 'tx-19', type: 'expense', amount: 1500000, categoryId: 'cat-family', accountId: 'acc-4', memberId: 'mem-2', date: '2026-08-25', note: 'Quà mừng thọ ông bà nội', tags: ['Hiếu hỷ'] },

    // Chuyển khoản nội bộ
    { id: 'tx-20', type: 'transfer', amount: 25000000, accountId: 'acc-2', targetAccountId: 'acc-1', memberId: 'mem-1', date: '2026-08-06', note: 'Bố đóng góp Quỹ chung gia đình tháng 8' },
    { id: 'tx-21', type: 'transfer', amount: 15000000, accountId: 'acc-3', targetAccountId: 'acc-1', memberId: 'mem-2', date: '2026-08-06', note: 'Mẹ đóng góp Quỹ chung gia đình tháng 8' }
  ];
  return txs;
}

// Active in-memory state
let state = null;
const listeners = [];

// Load State from LocalStorage or initialize with defaults
export function getState() {
  if (!state) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        state = JSON.parse(stored);
      } else {
        state = JSON.parse(JSON.stringify(INITIAL_STATE));
        state.transactions = generateSampleTransactions();
        saveState();
      }
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
      state = JSON.parse(JSON.stringify(INITIAL_STATE));
      state.transactions = generateSampleTransactions();
    }
  }
  return state;
}

// Persist State to LocalStorage & notify all subscribed components
export function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    notifyListeners();
  } catch (e) {
    console.error('Error saving state:', e);
  }
}

// Event bus / Subscription listener
export function subscribe(listener) {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx > -1) listeners.splice(idx, 1);
  };
}

function notifyListeners() {
  listeners.forEach(fn => {
    try {
      fn(state);
    } catch (err) {
      console.error('Listener callback error:', err);
    }
  });
}

// Reset data back to initial demo dataset
export function resetToDemoData() {
  state = JSON.parse(JSON.stringify(INITIAL_STATE));
  state.transactions = generateSampleTransactions();
  saveState();
}

// Export Full State JSON
export function exportStateJSON() {
  return JSON.stringify(state, null, 2);
}

// Import Full State JSON
export function importStateJSON(jsonStr) {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed && parsed.accounts && parsed.members) {
      state = parsed;
      saveState();
      return true;
    }
  } catch (e) {
    console.error('Import error:', e);
  }
  return false;
}

/* ==========================================================================
   CRUD STATE HELPERS
   ========================================================================== */

// Add Transaction
export function addTransaction(tx) {
  const currentState = getState();
  currentState.transactions.unshift(tx);

  // Update Account Balances
  const acc = currentState.accounts.find(a => a.id === tx.accountId);
  if (acc) {
    if (tx.type === 'income') {
      acc.balance += Number(tx.amount);
    } else if (tx.type === 'expense') {
      acc.balance -= Number(tx.amount);
    } else if (tx.type === 'transfer') {
      acc.balance -= Number(tx.amount);
      const targetAcc = currentState.accounts.find(a => a.id === tx.targetAccountId);
      if (targetAcc) {
        targetAcc.balance += Number(tx.amount);
      }
    }
  }

  saveState();
}

// Delete Transaction
export function deleteTransaction(txId) {
  const currentState = getState();
  const index = currentState.transactions.findIndex(t => t.id === txId);
  if (index > -1) {
    const tx = currentState.transactions[index];
    const acc = currentState.accounts.find(a => a.id === tx.accountId);
    if (acc) {
      // Reverse balance changes
      if (tx.type === 'income') {
        acc.balance -= Number(tx.amount);
      } else if (tx.type === 'expense') {
        acc.balance += Number(tx.amount);
      } else if (tx.type === 'transfer') {
        acc.balance += Number(tx.amount);
        const targetAcc = currentState.accounts.find(a => a.id === tx.targetAccountId);
        if (targetAcc) {
          targetAcc.balance -= Number(tx.amount);
        }
      }
    }
    currentState.transactions.splice(index, 1);
    saveState();
  }
}

// Add / Update Account
export function saveAccount(account) {
  const currentState = getState();
  const existingIdx = currentState.accounts.findIndex(a => a.id === account.id);
  if (existingIdx > -1) {
    currentState.accounts[existingIdx] = account;
  } else {
    currentState.accounts.push(account);
  }
  saveState();
}

// Delete Account
export function deleteAccount(accountId) {
  const currentState = getState();
  currentState.accounts = currentState.accounts.filter(a => a.id !== accountId);
  saveState();
}

// Add / Update Goal
export function saveGoal(goal) {
  const currentState = getState();
  const existingIdx = currentState.savingsGoals.findIndex(g => g.id === goal.id);
  if (existingIdx > -1) {
    currentState.savingsGoals[existingIdx] = goal;
  } else {
    currentState.savingsGoals.push(goal);
  }
  saveState();
}

// Deposit into Goal
export function depositToGoal(goalId, amount, fromAccountId) {
  const currentState = getState();
  const goal = currentState.savingsGoals.find(g => g.id === goalId);
  const acc = currentState.accounts.find(a => a.id === fromAccountId);

  if (goal && acc && Number(amount) > 0) {
    goal.currentAmount = Number(goal.currentAmount || 0) + Number(amount);
    acc.balance = Number(acc.balance || 0) - Number(amount);

    // Record as special transaction
    currentState.transactions.unshift({
      id: 'tx-goal-' + Date.now(),
      type: 'expense',
      amount: Number(amount),
      categoryId: 'cat-housing', // or investment
      accountId: fromAccountId,
      memberId: 'all',
      date: new Date().toISOString().split('T')[0],
      note: `Nạp tiền tích lũy: ${goal.name}`,
      tags: ['Tiết kiệm', 'Mục tiêu']
    });

    saveState();
    return true;
  }
  return false;
}

// Add / Update Debt
export function saveDebt(debt) {
  const currentState = getState();
  const existingIdx = currentState.debts.findIndex(d => d.id === debt.id);
  if (existingIdx > -1) {
    currentState.debts[existingIdx] = debt;
  } else {
    currentState.debts.push(debt);
  }
  saveState();
}

// Pay Debt installment
export function payDebtInstallment(debtId, paymentAmount, fromAccountId, note = '') {
  const currentState = getState();
  const debt = currentState.debts.find(d => d.id === debtId);
  const acc = currentState.accounts.find(a => a.id === fromAccountId);

  if (debt && acc && Number(paymentAmount) > 0) {
    debt.paidAmount = Number(debt.paidAmount || 0) + Number(paymentAmount);
    if (!debt.payments) debt.payments = [];
    
    debt.payments.unshift({
      id: 'pay-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      amount: Number(paymentAmount),
      note: note || 'Thanh toán trả nợ'
    });

    if (debt.type === 'borrowed') {
      acc.balance = Number(acc.balance || 0) - Number(paymentAmount);
    } else {
      acc.balance = Number(acc.balance || 0) + Number(paymentAmount);
    }

    // Ghi sổ giao dịch
    currentState.transactions.unshift({
      id: 'tx-debt-' + Date.now(),
      type: debt.type === 'borrowed' ? 'expense' : 'income',
      amount: Number(paymentAmount),
      categoryId: 'cat-housing',
      accountId: fromAccountId,
      memberId: 'all',
      date: new Date().toISOString().split('T')[0],
      note: `${debt.type === 'borrowed' ? 'Thanh toán khoản nợ' : 'Nhận tiền trả nợ'}: ${debt.personName}`,
      tags: ['Sổ nợ']
    });

    saveState();
    return true;
  }
  return false;
}

// Add / Update Investment
export function saveInvestment(inv) {
  const currentState = getState();
  const existingIdx = currentState.investments.findIndex(i => i.id === inv.id);
  if (existingIdx > -1) {
    currentState.investments[existingIdx] = inv;
  } else {
    currentState.investments.push(inv);
  }
  saveState();
}

// Add / Update Member
export function saveMember(member) {
  const currentState = getState();
  const existingIdx = currentState.members.findIndex(m => m.id === member.id);
  if (existingIdx > -1) {
    currentState.members[existingIdx] = {
      ...currentState.members[existingIdx],
      ...member
    };
  } else {
    currentState.members.push({
      avatarColor: '#3b82f6',
      icon: 'fa-user',
      monthlyQuota: 10000000,
      monthlyIncomeTarget: 0,
      ...member
    });
  }
  saveState();
}

// Update Budget item
export function saveBudget(budget) {
  const currentState = getState();
  const existingIdx = currentState.budgets.findIndex(b => b.id === budget.id);
  if (existingIdx > -1) {
    currentState.budgets[existingIdx] = budget;
  } else {
    currentState.budgets.push(budget);
  }
  saveState();
}

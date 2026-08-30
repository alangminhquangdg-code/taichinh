/**
 * MODULE: DASHBOARD (BẢNG ĐIỀU KHIỂN TỔNG QUAN)
 */
import { getState } from '../state.js';
import { formatCurrency, formatCompactCurrency, formatPercentage, formatRelativeDate, escapeHTML } from '../utils/formatters.js';
import { renderCashFlowChart, renderCategoryDonutChart } from '../utils/charts.js';

export function renderDashboard() {
  const container = document.getElementById('dashboardView');
  if (!container) return;

  const state = getState();
  const currency = state.settings.currency;
  const selectedMemberId = state.settings.selectedMemberId || 'all';

  // 1. Calculate Net Worth & Liquid Assets
  let totalLiquid = 0;
  let totalInvestmentValue = 0;
  let totalTermDeposits = 0;
  let totalCreditDebt = 0;

  state.accounts.forEach(acc => {
    if (selectedMemberId !== 'all' && acc.ownerId !== selectedMemberId && acc.ownerId !== 'all') {
      return;
    }
    if (acc.balance > 0) {
      totalLiquid += acc.balance;
    } else {
      totalCreditDebt += Math.abs(acc.balance);
    }
  });

  // Investments
  state.investments.forEach(inv => {
    if (inv.type === 'term_deposit') {
      totalTermDeposits += inv.principalAmount || 0;
    } else {
      totalInvestmentValue += inv.marketValue || inv.costBasis || 0;
    }
  });

  // Loans debt
  let totalLoanDebt = 0;
  state.debts.forEach(d => {
    if (d.type === 'borrowed') {
      const remaining = (d.originalAmount || 0) - (d.paidAmount || 0);
      totalLoanDebt += Math.max(0, remaining);
    }
  });

  const totalAssets = totalLiquid + totalTermDeposits + totalInvestmentValue;
  const totalLiabilities = totalCreditDebt + totalLoanDebt;
  const netWorth = totalAssets - totalLiabilities;

  // 2. Calculate Monthly Flow (Income & Expense for current month)
  const currentMonthPrefix = new Date().toISOString().substring(0, 7); // '2026-08'
  let currentMonthIncome = 0;
  let currentMonthExpense = 0;

  // Filter transactions by member if selected
  const filteredTxs = state.transactions.filter(t => {
    if (selectedMemberId !== 'all' && t.memberId !== selectedMemberId && t.memberId !== 'all') {
      return false;
    }
    return true;
  });

  filteredTxs.forEach(tx => {
    if (tx.date && tx.date.startsWith(currentMonthPrefix)) {
      if (tx.type === 'income') {
        currentMonthIncome += Number(tx.amount || 0);
      } else if (tx.type === 'expense') {
        currentMonthExpense += Number(tx.amount || 0);
      }
    }
  });

  const netSavings = currentMonthIncome - currentMonthExpense;
  const savingsRate = currentMonthIncome > 0 ? (netSavings / currentMonthIncome) * 100 : 0;

  // 3. Category Expenses Breakdown for Donut Chart
  const catMap = {};
  filteredTxs.forEach(tx => {
    if (tx.type === 'expense' && tx.date && tx.date.startsWith(currentMonthPrefix)) {
      catMap[tx.categoryId] = (catMap[tx.categoryId] || 0) + Number(tx.amount);
    }
  });

  const donutLabels = [];
  const donutData = [];
  const donutColors = [];

  state.categories.forEach(cat => {
    if (catMap[cat.id]) {
      donutLabels.push(cat.name);
      donutData.push(catMap[cat.id]);
      donutColors.push(cat.color || '#3b82f6');
    }
  });

  // If no expenses this month, add placeholder
  if (donutData.length === 0) {
    donutLabels.push('Chưa có chi tiêu');
    donutData.push(1);
    donutColors.push('rgba(255,255,255,0.1)');
  }

  // 4. Render HTML Structure
  container.innerHTML = `
    <!-- Top Stat Banner 4 Cards -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      <!-- Net Worth Card -->
      <div class="stat-card emerald">
        <div class="stat-top">
          <span class="stat-label">Tài Sản Ròng (Net Worth)</span>
          <div class="stat-icon-box emerald">
            <i class="fa-solid fa-shield-halved"></i>
          </div>
        </div>
        <div class="stat-value">${formatCurrency(netWorth, currency)}</div>
        <div class="stat-footer">
          <span class="stat-trend up"><i class="fa-solid fa-arrow-trend-up"></i> +14.2%</span>
          <span class="stat-subtext">Tổng TS: ${formatCompactCurrency(totalAssets, currency)}</span>
        </div>
      </div>

      <!-- Income Card -->
      <div class="stat-card primary">
        <div class="stat-top">
          <span class="stat-label">Tổng Thu Nhập Tháng 8</span>
          <div class="stat-icon-box primary">
            <i class="fa-solid fa-wallet"></i>
          </div>
        </div>
        <div class="stat-value">${formatCurrency(currentMonthIncome, currency)}</div>
        <div class="stat-footer">
          <span class="stat-trend up"><i class="fa-solid fa-arrow-up"></i> Đạt 115%</span>
          <span class="stat-subtext">so với mục tiêu</span>
        </div>
      </div>

      <!-- Expense Card -->
      <div class="stat-card rose">
        <div class="stat-top">
          <span class="stat-label">Tổng Chi Tiêu Tháng 8</span>
          <div class="stat-icon-box rose">
            <i class="fa-solid fa-receipt"></i>
          </div>
        </div>
        <div class="stat-value">${formatCurrency(currentMonthExpense, currency)}</div>
        <div class="stat-footer">
          <span class="stat-trend ${currentMonthExpense > 60000000 ? 'down' : 'up'}">
            ${currentMonthExpense > 60000000 ? '<i class="fa-solid fa-arrow-up"></i> Vượt nhẹ' : '<i class="fa-solid fa-check"></i> Trong hạn mức'}
          </span>
          <span class="stat-subtext">Hạn mức 56.5 tr</span>
        </div>
      </div>

      <!-- Savings Rate Card -->
      <div class="stat-card amber">
        <div class="stat-top">
          <span class="stat-label">Tỷ Lệ Tiết Kiệm</span>
          <div class="stat-icon-box amber">
            <i class="fa-solid fa-piggy-bank"></i>
          </div>
        </div>
        <div class="stat-value">${savingsRate.toFixed(1)}%</div>
        <div class="stat-footer">
          <span class="stat-trend ${savingsRate >= 20 ? 'up' : 'down'}">
            ${savingsRate >= 20 ? '<i class="fa-solid fa-star"></i> Xuất sắc' : 'Cần cải thiện'}
          </span>
          <span class="stat-subtext">Thặng dư: ${formatCompactCurrency(netSavings, currency)}</span>
        </div>
      </div>
    </div>

    <!-- Alert / Smart Notification Widget -->
    <div class="card mb-6" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%); border-left: 4px solid var(--primary);">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div class="flex items-center gap-3">
          <div style="width: 38px; height: 38px; border-radius: var(--radius-full); background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">
            <i class="fa-solid fa-robot"></i>
          </div>
          <div>
            <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary);">
              Gợi ý tài chính từ AI Trợ lý Gia đình:
            </div>
            <div style="font-size: 0.84rem; color: var(--text-secondary);">
              Tháng này gia đình bạn đã tiết kiệm được <strong>${formatCurrency(netSavings, currency)} (${savingsRate.toFixed(1)}%)</strong>. Hãy trích 15.000.000 ₫ nạp vào <span style="color: var(--emerald); font-weight: 600;">"Quỹ khẩn cấp 6 tháng"</span> để sớm về đích!
            </div>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="btnDashQuickAi">
          <i class="fa-solid fa-wand-magic-sparkles"></i> Phân tích chi tiết
        </button>
      </div>
    </div>

    <!-- Main Charts Grid -->
    <div class="grid grid-3-1 gap-6 mb-6">
      <!-- Cash Flow Trend Chart -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <i class="fa-solid fa-chart-column"></i>
            Dòng Tiền Thu Chi Gia Đình 6 Tháng Gần Nhất
          </div>
          <div class="badge badge-primary">2026</div>
        </div>
        <div style="height: 300px; position: relative;">
          <canvas id="dashCashFlowCanvas"></canvas>
        </div>
      </div>

      <!-- Category Donut Chart -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <i class="fa-solid fa-chart-pie"></i>
            Cơ Cấu Chi Tiêu Tháng 8
          </div>
        </div>
        <div style="height: 300px; position: relative;">
          <canvas id="dashCategoryCanvas"></canvas>
        </div>
      </div>
    </div>

    <!-- Bottom Two Columns: Recent Transactions & Savings Goals / Budgets -->
    <div class="grid grid-2-1 gap-6">
      <!-- Recent Transactions List -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <i class="fa-solid fa-clock-rotate-left"></i>
            Giao Dịch Gần Đây
          </div>
          <a class="card-action" id="dashViewAllTx">
            Xem tất cả sổ <i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>

        <div class="flex flex-col gap-2" id="dashRecentTxList">
          ${renderRecentTxItems(filteredTxs.slice(0, 6), state)}
        </div>
      </div>

      <!-- Savings Goals & Fast Piggy -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <i class="fa-solid fa-bullseye"></i>
            Mục Tiêu Tiết Kiệm Nổi Bật
          </div>
          <a class="card-action" id="dashViewAllGoals">
            Xem tất cả <i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>

        <div class="flex flex-col gap-4">
          ${renderMiniGoals(state.savingsGoals.slice(0, 3), currency)}
        </div>
      </div>
    </div>
  `;

  // Render Charts
  const months = ['Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8'];
  const incomeSeries = [68000000, 72000000, 75000000, 80000000, 78000000, currentMonthIncome || 86500000];
  const expenseSeries = [45000000, 49000000, 52000000, 58000000, 54000000, currentMonthExpense || 50530000];
  const netSeries = incomeSeries.map((inc, i) => inc - expenseSeries[i]);

  renderCashFlowChart('dashCashFlowCanvas', months, incomeSeries, expenseSeries, netSeries);
  renderCategoryDonutChart('dashCategoryCanvas', donutLabels, donutData, donutColors);

  // Setup button events
  const btnDashAi = document.getElementById('btnDashQuickAi');
  if (btnDashAi) {
    btnDashAi.addEventListener('click', () => {
      document.querySelector('[data-tab="ai-advisor"]')?.click();
    });
  }

  const btnViewTx = document.getElementById('dashViewAllTx');
  if (btnViewTx) {
    btnViewTx.addEventListener('click', () => {
      document.querySelector('[data-tab="transactions"]')?.click();
    });
  }

  const btnViewGoals = document.getElementById('dashViewAllGoals');
  if (btnViewGoals) {
    btnViewGoals.addEventListener('click', () => {
      document.querySelector('[data-tab="savings"]')?.click();
    });
  }
}

function renderRecentTxItems(txs, state) {
  if (!txs || txs.length === 0) {
    return `<div style="text-align: center; padding: 24px; color: var(--text-muted);">Chưa có giao dịch nào trong khoảng thời gian này.</div>`;
  }

  return txs.map(tx => {
    const cat = state.categories.find(c => c.id === tx.categoryId) || { name: 'Chuyển tiền', icon: 'fa-arrow-right-arrow-left', color: '#3b82f6' };
    const acc = state.accounts.find(a => a.id === tx.accountId) || { name: 'Ví' };
    const member = state.members.find(m => m.id === tx.memberId) || { shortName: 'Cả nhà' };

    let typeClass = tx.type === 'income' ? 'income' : (tx.type === 'expense' ? 'expense' : 'transfer');
    let prefix = tx.type === 'income' ? '+' : (tx.type === 'expense' ? '-' : '');
    let iconBg = tx.type === 'income' ? 'var(--emerald-light)' : (tx.type === 'expense' ? 'var(--rose-light)' : 'var(--primary-light)');
    let iconColor = tx.type === 'income' ? 'var(--emerald)' : (tx.type === 'expense' ? 'var(--rose)' : 'var(--primary)');

    return `
      <div class="tx-item">
        <div class="tx-left">
          <div class="tx-icon-box" style="background: ${iconBg}; color: ${iconColor};">
            <i class="fa-solid ${cat.icon || 'fa-receipt'}"></i>
          </div>
          <div class="tx-info">
            <div class="tx-title">${escapeHTML(tx.note || cat.name)}</div>
            <div class="tx-meta">
              <span><i class="fa-regular fa-calendar"></i> ${formatRelativeDate(tx.date)}</span>
              <span>•</span>
              <span class="tx-wallet-tag"><i class="fa-solid fa-credit-card"></i> ${escapeHTML(acc.name)}</span>
              <span>•</span>
              <span><i class="fa-solid fa-user"></i> ${escapeHTML(member.shortName)}</span>
            </div>
          </div>
        </div>
        <div class="tx-right">
          <div class="tx-amount ${typeClass}">${prefix}${formatCurrency(tx.amount, state.settings.currency)}</div>
          <span class="badge ${tx.type === 'income' ? 'badge-emerald' : 'badge-neutral'}">${escapeHTML(cat.name)}</span>
        </div>
      </div>
    `;
  }).join('');
}

function renderMiniGoals(goals, currency) {
  if (!goals || goals.length === 0) {
    return `<div style="color: var(--text-muted); font-size: 0.85rem;">Chưa thiết lập mục tiêu nào.</div>`;
  }

  return goals.map(goal => {
    const percent = Math.min(100, Math.round(((goal.currentAmount || 0) / (goal.targetAmount || 1)) * 100));
    return `
      <div style="background: var(--bg-glass-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px;">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <i class="fa-solid ${goal.icon || 'fa-piggy-bank'}" style="color: ${goal.color || 'var(--emerald)'};"></i>
            <span style="font-weight: 700; font-size: 0.88rem; color: var(--text-primary);">${escapeHTML(goal.name)}</span>
          </div>
          <span style="font-weight: 800; font-size: 0.85rem; color: ${percent >= 100 ? 'var(--emerald)' : 'var(--primary)'};">${percent}%</span>
        </div>
        <div class="progress-bar-container mb-2" style="height: 7px;">
          <div class="progress-bar-fill ${percent >= 100 ? 'emerald' : 'primary'}" style="width: ${percent}%;"></div>
        </div>
        <div class="flex justify-between" style="font-size: 0.75rem; color: var(--text-muted);">
          <span>${formatCompactCurrency(goal.currentAmount, currency)}</span>
          <span>Mục tiêu: ${formatCompactCurrency(goal.targetAmount, currency)}</span>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * MODULE: REPORTS & FINANCIAL HEALTH SCORE (BÁO CÁO & SỨC KHỎE TÀI CHÍNH)
 */
import { getState } from '../state.js';
import { formatCurrency, formatCompactCurrency, formatPercentage, formatDate, escapeHTML } from '../utils/formatters.js';
import { renderFinancialHealthRadar } from '../utils/charts.js';
import { showToast } from '../utils/notifications.js';

export function renderReports() {
  const container = document.getElementById('reportsView');
  if (!container) return;

  const state = getState();
  const currency = state.settings.currency;
  const currentMonthPrefix = new Date().toISOString().substring(0, 7);

  // 1. Calculate Monthly Cash Flow
  let totalIncome = 0;
  let totalExpense = 0;
  const catSpending = {};
  const catIncome = {};

  state.transactions.forEach(t => {
    if (t.date && t.date.startsWith(currentMonthPrefix)) {
      if (t.type === 'income') {
        totalIncome += Number(t.amount || 0);
        catIncome[t.categoryId] = (catIncome[t.categoryId] || 0) + Number(t.amount);
      } else if (t.type === 'expense') {
        totalExpense += Number(t.amount || 0);
        catSpending[t.categoryId] = (catSpending[t.categoryId] || 0) + Number(t.amount);
      }
    }
  });

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // 2. Calculate Financial Health Score (0 - 100)
  // Pillar 1: Savings Rate (max 25)
  let scoreSavings = 0;
  if (savingsRate >= 25) scoreSavings = 25;
  else if (savingsRate >= 20) scoreSavings = 22;
  else if (savingsRate >= 10) scoreSavings = 16;
  else if (savingsRate > 0) scoreSavings = 10;

  // Pillar 2: Emergency Fund (max 25) - Target: 6 months of expenses
  const emergencyGoal = state.savingsGoals.find(g => g.id === 'goal-1') || { currentAmount: 165000000 };
  const monthlyEssentialNeed = 35000000;
  const emergencyMonths = (emergencyGoal.currentAmount || 0) / monthlyEssentialNeed;
  let scoreEmergency = 0;
  if (emergencyMonths >= 6) scoreEmergency = 25;
  else if (emergencyMonths >= 4) scoreEmergency = 22;
  else if (emergencyMonths >= 3) scoreEmergency = 18;
  else scoreEmergency = 10;

  // Pillar 3: Debt to Income (DTI) (max 25) - Monthly debt payment / Monthly income
  const monthlyDebtPayment = 14500000;
  const dtiRatio = totalIncome > 0 ? (monthlyDebtPayment / totalIncome) * 100 : 20;
  let scoreDti = 0;
  if (dtiRatio <= 20) scoreDti = 25;
  else if (dtiRatio <= 35) scoreDti = 20;
  else if (dtiRatio <= 45) scoreDti = 12;
  else scoreDti = 5;

  // Pillar 4: Asset Diversification (max 25)
  let hasCash = state.accounts.some(a => a.type === 'cash' && a.balance > 0);
  let hasTerm = state.investments.some(i => i.type === 'term_deposit');
  let hasMarket = state.investments.some(i => i.type === 'stock' || i.type === 'gold');
  let scoreDiversification = (hasCash ? 8 : 0) + (hasTerm ? 9 : 0) + (hasMarket ? 8 : 0);

  const totalHealthScore = Math.min(100, scoreSavings + scoreEmergency + scoreDti + scoreDiversification);

  container.innerHTML = `
    <!-- Top Action & Title Bar -->
    <div class="flex items-center justify-between flex-wrap gap-4 mb-6">
      <div>
        <h2 style="font-size: 1.35rem; font-weight: 800;">Báo Cáo Tài Chính & Đánh Giá Sức Khỏe</h2>
        <p style="font-size: 0.85rem; color: var(--text-muted);">Báo cáo tổng kết dòng tiền, bảng cân đối tài sản và chỉ số sức khỏe tài chính gia đình</p>
      </div>
      <div class="flex items-center gap-3">
        <button class="btn btn-secondary btn-sm" id="btnPrintReport">
          <i class="fa-solid fa-print"></i> In / Xuất PDF
        </button>
        <button class="btn btn-emerald btn-sm" id="btnExportExcel">
          <i class="fa-solid fa-file-excel"></i> Xuất file Excel (.xlsx)
        </button>
      </div>
    </div>

    <!-- Financial Health Score Meter & Radar Grid -->
    <div class="grid grid-2-1 gap-6 mb-8">
      <!-- Health Score Card -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <i class="fa-solid fa-heart-pulse" style="color: var(--emerald);"></i>
            Chỉ Số Sức Khỏe Tài Chính Gia Đình
          </div>
          <span class="badge ${totalHealthScore >= 80 ? 'badge-emerald' : 'badge-amber'}">
            ${totalHealthScore >= 80 ? 'Hạng A+ • Rất Vững Vàng' : 'Hạng B • Khá Tốt'}
          </span>
        </div>

        <div class="health-score-container mb-6">
          <div class="score-circle" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%); border: 3px solid var(--emerald);">
            <div class="score-number">${totalHealthScore}</div>
            <div class="score-total">/ 100 Điểm</div>
          </div>
          <div>
            <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">
              Cấu trúc tài chính gia đình bạn đang rất an toàn và thịnh vượng!
            </h4>
            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
              Tỷ lệ tiết kiệm tháng đạt <strong>${savingsRate.toFixed(1)}%</strong>, quỹ dự phòng khẩn cấp đảm bảo chi tiêu trong <strong>${emergencyMonths.toFixed(1)} tháng</strong> và tỷ lệ nợ DTI ở mức lý tưởng <strong>${dtiRatio.toFixed(1)}%</strong>.
            </p>
          </div>
        </div>

        <!-- 4 Pillars Breakdown -->
        <div class="grid grid-cols-2 gap-4">
          <div style="background: var(--bg-glass-card); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
            <div class="flex justify-between text-sm mb-1">
              <span style="color: var(--text-muted); font-size: 0.78rem;">Tỷ lệ tiết kiệm (${savingsRate.toFixed(0)}%)</span>
              <strong style="color: var(--emerald); font-size: 0.85rem;">${scoreSavings}/25 đ</strong>
            </div>
            <div class="progress-bar-container" style="height: 6px;">
              <div class="progress-bar-fill emerald" style="width: ${(scoreSavings / 25) * 100}%;"></div>
            </div>
          </div>

          <div style="background: var(--bg-glass-card); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
            <div class="flex justify-between text-sm mb-1">
              <span style="color: var(--text-muted); font-size: 0.78rem;">Quỹ khẩn cấp (${emergencyMonths.toFixed(1)} tháng)</span>
              <strong style="color: var(--emerald); font-size: 0.85rem;">${scoreEmergency}/25 đ</strong>
            </div>
            <div class="progress-bar-container" style="height: 6px;">
              <div class="progress-bar-fill emerald" style="width: ${(scoreEmergency / 25) * 100}%;"></div>
            </div>
          </div>

          <div style="background: var(--bg-glass-card); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
            <div class="flex justify-between text-sm mb-1">
              <span style="color: var(--text-muted); font-size: 0.78rem;">Tỷ lệ nợ/thu nhập DTI (${dtiRatio.toFixed(0)}%)</span>
              <strong style="color: var(--emerald); font-size: 0.85rem;">${scoreDti}/25 đ</strong>
            </div>
            <div class="progress-bar-container" style="height: 6px;">
              <div class="progress-bar-fill emerald" style="width: ${(scoreDti / 25) * 100}%;"></div>
            </div>
          </div>

          <div style="background: var(--bg-glass-card); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
            <div class="flex justify-between text-sm mb-1">
              <span style="color: var(--text-muted); font-size: 0.78rem;">Đa dạng hóa tài sản</span>
              <strong style="color: var(--emerald); font-size: 0.85rem;">${scoreDiversification}/25 đ</strong>
            </div>
            <div class="progress-bar-container" style="height: 6px;">
              <div class="progress-bar-fill emerald" style="width: ${(scoreDiversification / 25) * 100}%;"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Radar Diagram -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <i class="fa-solid fa-chart-line"></i>
            Mô Hình Sức Khỏe 4 Chiều
          </div>
        </div>
        <div style="height: 280px; position: relative;">
          <canvas id="healthRadarCanvas"></canvas>
        </div>
      </div>
    </div>

    <!-- Income & Expense Statement Table -->
    <div class="card" style="padding: 0; overflow: hidden; margin-bottom: 24px;">
      <div class="card-header" style="padding: 20px 24px; margin-bottom: 0; border-bottom: 1px solid var(--border-color);">
        <div class="card-title">
          <i class="fa-solid fa-file-invoice-dollar"></i>
          Báo Cáo Chi Tiết Cơ Cấu Thu Chi Tháng 8/2026
        </div>
      </div>
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Hạng Mục Danh Mục</th>
              <th>Loại Dòng Tiền</th>
              <th style="text-align: right;">Số Tiền Thực Tế</th>
              <th style="text-align: right;">Tỷ Trọng (%)</th>
            </tr>
          </thead>
          <tbody>
            ${renderCashFlowTableRows(state.categories, catIncome, catSpending, totalIncome, totalExpense, currency)}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Render Radar Chart
  const radarLabels = ['Tỷ Lệ Tiết Kiệm', 'Quỹ Khẩn Cấp', 'An Toàn Nợ DTI', 'Đa Dạng Hóa'];
  const radarScores = [
    (scoreSavings / 25) * 100,
    (scoreEmergency / 25) * 100,
    (scoreDti / 25) * 100,
    (scoreDiversification / 25) * 100
  ];
  renderFinancialHealthRadar('healthRadarCanvas', radarLabels, radarScores);

  setupReportEventListeners(state);
}

function renderCashFlowTableRows(categories, catIncome, catSpending, totalIncome, totalExpense, currency) {
  let rows = '';

  // Thu nhập rows
  categories.filter(c => c.type === 'income').forEach(cat => {
    const amt = catIncome[cat.id] || 0;
    if (amt > 0) {
      const pct = totalIncome > 0 ? ((amt / totalIncome) * 100).toFixed(1) : '0.0';
      rows += `
        <tr>
          <td style="font-weight: 600;"><i class="fa-solid ${cat.icon || 'fa-coins'}" style="color: var(--emerald); margin-right: 8px;"></i> ${escapeHTML(cat.name)}</td>
          <td><span class="badge badge-emerald">Thu nhập</span></td>
          <td style="text-align: right; font-weight: 700; color: var(--emerald);">+${formatCurrency(amt, currency)}</td>
          <td style="text-align: right; font-weight: 600;">${pct}%</td>
        </tr>
      `;
    }
  });

  // Chi tiêu rows
  categories.filter(c => c.type === 'expense').forEach(cat => {
    const amt = catSpending[cat.id] || 0;
    if (amt > 0) {
      const pct = totalExpense > 0 ? ((amt / totalExpense) * 100).toFixed(1) : '0.0';
      rows += `
        <tr>
          <td style="font-weight: 600;"><i class="fa-solid ${cat.icon || 'fa-receipt'}" style="color: var(--rose); margin-right: 8px;"></i> ${escapeHTML(cat.name)}</td>
          <td><span class="badge badge-rose">Chi tiêu</span></td>
          <td style="text-align: right; font-weight: 700; color: var(--rose);">-${formatCurrency(amt, currency)}</td>
          <td style="text-align: right; font-weight: 600;">${pct}%</td>
        </tr>
      `;
    }
  });

  return rows;
}

function setupReportEventListeners(state) {
  // Print Report
  const btnPrint = document.getElementById('btnPrintReport');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }

  // Export Excel
  const btnExcel = document.getElementById('btnExportExcel');
  if (btnExcel) {
    btnExcel.addEventListener('click', () => {
      exportTransactionsToExcel(state);
    });
  }
}

function exportTransactionsToExcel(state) {
  if (typeof XLSX === 'undefined') {
    showToast('Thư viện Excel đang tải, vui lòng thử lại sau giây lát', 'warning');
    return;
  }

  try {
    const data = state.transactions.map((t, idx) => {
      const cat = state.categories.find(c => c.id === t.categoryId);
      const acc = state.accounts.find(a => a.id === t.accountId);
      const mem = state.members.find(m => m.id === t.memberId);

      return {
        'STT': idx + 1,
        'Ngày': t.date,
        'Loại': t.type === 'income' ? 'Thu nhập' : (t.type === 'expense' ? 'Chi tiêu' : 'Chuyển khoản'),
        'Số tiền (VNĐ)': t.amount,
        'Danh mục': cat ? cat.name : '',
        'Tài khoản': acc ? acc.name : '',
        'Thành viên': mem ? mem.name : 'Cả nhà',
        'Ghi chú': t.note || ''
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'So_Giao_Dich_Gia_Dinh');
    XLSX.writeFile(workbook, `Bao_Cao_Tai_Chinh_Gia_Dinh_${new Date().toISOString().substring(0,10)}.xlsx`);
    showToast('Đã xuất file Excel thành công!', 'success');
  } catch (err) {
    console.error('Excel export error:', err);
    showToast('Có lỗi khi xuất file Excel', 'error');
  }
}

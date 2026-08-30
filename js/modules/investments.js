/**
 * MODULE: INVESTMENTS & TERM DEPOSITS (DANH MỤC ĐẦU TƯ & SỔ TIẾT KIỆM)
 */
import { getState, saveInvestment } from '../state.js';
import { formatCurrency, formatCompactCurrency, formatPercentage, formatDate, escapeHTML, generateUUID } from '../utils/formatters.js';
import { showToast, openModal, closeModal } from '../utils/notifications.js';

export function renderInvestments() {
  const container = document.getElementById('investmentsView');
  if (!container) return;

  const state = getState();
  const currency = state.settings.currency;

  let totalTermDeposits = 0;
  let totalStockValue = 0;
  let totalGoldValue = 0;
  let totalOtherInvest = 0;

  let totalCostBasis = 0;
  let totalMarketValue = 0;

  state.investments.forEach(i => {
    if (i.type === 'term_deposit') {
      totalTermDeposits += Number(i.principalAmount || 0);
    } else {
      const cost = Number(i.costBasis || (i.buyPrice * i.quantity) || 0);
      const val = Number(i.marketValue || (i.currentPrice * i.quantity) || cost);
      totalCostBasis += cost;
      totalMarketValue += val;

      if (i.type === 'stock') totalStockValue += val;
      else if (i.type === 'gold') totalGoldValue += val;
      else totalOtherInvest += val;
    }
  });

  const totalPortfolioValue = totalTermDeposits + totalMarketValue;
  const totalPnL = totalMarketValue - totalCostBasis;
  const totalPnLPct = totalCostBasis > 0 ? (totalPnL / totalCostBasis) * 100 : 0;

  container.innerHTML = `
    <!-- Top Action & Title Bar -->
    <div class="flex items-center justify-between flex-wrap gap-4 mb-6">
      <div>
        <h2 style="font-size: 1.35rem; font-weight: 800;">Danh Mục Đầu Tư & Sổ Tiết Kiệm Có Kỳ Hạn</h2>
        <p style="font-size: 0.85rem; color: var(--text-muted);">Theo dõi tiền gửi tiết kiệm ngân hàng, cổ phiếu, vàng miếng và tài sản sinh lời</p>
      </div>
      <button class="btn btn-primary" id="btnOpenAddInvestModal">
        <i class="fa-solid fa-plus"></i> Thêm tài sản đầu tư
      </button>
    </div>

    <!-- 4 Summary Stat Cards -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="stat-card emerald">
        <div class="stat-top">
          <span class="stat-label">Tổng Danh Mục Đầu Tư</span>
          <div class="stat-icon-box emerald"><i class="fa-solid fa-chart-pie"></i></div>
        </div>
        <div class="stat-value">${formatCurrency(totalPortfolioValue, currency)}</div>
        <div class="stat-footer">
          <span class="stat-subtext">Bao gồm sổ tiết kiệm & tài sản</span>
        </div>
      </div>

      <div class="stat-card primary">
        <div class="stat-top">
          <span class="stat-label">Sổ Tiết Kiệm Ngân Hàng</span>
          <div class="stat-icon-box primary"><i class="fa-solid fa-vault"></i></div>
        </div>
        <div class="stat-value">${formatCurrency(totalTermDeposits, currency)}</div>
        <div class="stat-footer">
          <span class="stat-subtext">Lãi suất 4.8% - 5.4%/năm</span>
        </div>
      </div>

      <div class="stat-card amber">
        <div class="stat-top">
          <span class="stat-label">Vàng & Chứng Khoán</span>
          <div class="stat-icon-box amber"><i class="fa-solid fa-coins"></i></div>
        </div>
        <div class="stat-value">${formatCurrency(totalStockValue + totalGoldValue, currency)}</div>
        <div class="stat-footer">
          <span class="stat-subtext">Vàng: ${formatCompactCurrency(totalGoldValue, currency)} • CP: ${formatCompactCurrency(totalStockValue, currency)}</span>
        </div>
      </div>

      <div class="stat-card ${totalPnL >= 0 ? 'emerald' : 'rose'}">
        <div class="stat-top">
          <span class="stat-label">Lợi Nhuận Tạm Tính (P&L)</span>
          <div class="stat-icon-box ${totalPnL >= 0 ? 'emerald' : 'rose'}"><i class="fa-solid fa-arrow-trend-up"></i></div>
        </div>
        <div class="stat-value" style="color: ${totalPnL >= 0 ? 'var(--emerald)' : 'var(--rose)'};">
          ${totalPnL >= 0 ? '+' : ''}${formatCurrency(totalPnL, currency)}
        </div>
        <div class="stat-footer">
          <span class="stat-trend ${totalPnL >= 0 ? 'up' : 'down'}">${formatPercentage(totalPnLPct)}</span>
          <span class="stat-subtext">so với vốn gốc</span>
        </div>
      </div>
    </div>

    <!-- Section 1: Sổ Tiết Kiệm Có Kỳ Hạn -->
    <div class="card mb-6" style="padding: 0; overflow: hidden;">
      <div class="card-header" style="padding: 20px 24px; margin-bottom: 0; border-bottom: 1px solid var(--border-color);">
        <div class="card-title">
          <i class="fa-solid fa-vault"></i>
          Sổ Tiết Kiệm Ngân Hàng Tích Lũy
        </div>
      </div>
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Tên Sổ & Mã Số</th>
              <th>Số Tiền Gốc</th>
              <th>Kỳ Hạn</th>
              <th>Lãi Suất</th>
              <th>Ngày Mở</th>
              <th>Ngày Đáo Hạn</th>
              <th style="text-align: right;">Tiền Lãi Dự Kiến</th>
            </tr>
          </thead>
          <tbody>
            ${renderTermDepositRows(state.investments.filter(i => i.type === 'term_deposit'), currency)}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Section 2: Chứng Khoán, Vàng, BĐS -->
    <div class="card" style="padding: 0; overflow: hidden;">
      <div class="card-header" style="padding: 20px 24px; margin-bottom: 0; border-bottom: 1px solid var(--border-color);">
        <div class="card-title">
          <i class="fa-solid fa-chart-line"></i>
          Danh Mục Chứng Khoán & Kim Loại Quý (Vàng)
        </div>
      </div>
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Mã / Tên Tài Sản</th>
              <th>Loại Hình</th>
              <th>Số Lượng</th>
              <th>Giá Vốn TB</th>
              <th>Giá Thị Trường</th>
              <th>Tổng Giá Trị</th>
              <th style="text-align: right;">Lãi / Lỗ (P&L)</th>
            </tr>
          </thead>
          <tbody>
            ${renderMarketAssetRows(state.investments.filter(i => i.type !== 'term_deposit'), currency)}
          </tbody>
        </table>
      </div>
    </div>
  `;

  setupInvestEventListeners(state);
}

function renderTermDepositRows(deposits, currency) {
  if (!deposits || deposits.length === 0) {
    return `<tr><td colspan="7" style="text-align: center; padding: 30px; color: var(--text-muted);">Chưa có sổ tiết kiệm nào.</td></tr>`;
  }

  return deposits.map(d => {
    const principal = Number(d.principalAmount || 0);
    const rate = Number(d.interestRate || 0);
    const months = Number(d.termMonths || 12);
    const expectedInterest = Math.round((principal * (rate / 100) * months) / 12);

    return `
      <tr>
        <td>
          <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-primary);">${escapeHTML(d.name)}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">${escapeHTML(d.code || 'STK')}</div>
        </td>
        <td style="font-weight: 700; font-size: 0.95rem;">${formatCurrency(principal, currency)}</td>
        <td><span class="badge badge-primary">${months} Tháng</span></td>
        <td><span class="badge badge-emerald">${rate}% / năm</span></td>
        <td style="font-size: 0.85rem; color: var(--text-secondary);">${formatDate(d.openDate)}</td>
        <td style="font-size: 0.85rem; font-weight: 600; color: var(--amber);">${formatDate(d.maturityDate)}</td>
        <td style="text-align: right; font-weight: 700; color: var(--emerald); font-size: 0.95rem;">
          +${formatCurrency(expectedInterest, currency)}
        </td>
      </tr>
    `;
  }).join('');
}

function renderMarketAssetRows(assets, currency) {
  if (!assets || assets.length === 0) {
    return `<tr><td colspan="7" style="text-align: center; padding: 30px; color: var(--text-muted);">Chưa có tài sản đầu tư nào.</td></tr>`;
  }

  return assets.map(a => {
    const qty = Number(a.quantity || 0);
    const buyPrice = Number(a.buyPrice || 0);
    const curPrice = Number(a.currentPrice || buyPrice);
    const cost = qty * buyPrice;
    const marketVal = qty * curPrice;
    const pnl = marketVal - cost;
    const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
    const isProfit = pnl >= 0;

    let typeBadge = 'Chứng khoán';
    let typeClass = 'badge-primary';
    if (a.type === 'gold') {
      typeBadge = 'Vàng miếng';
      typeClass = 'badge-amber';
    } else if (a.type === 'crypto') {
      typeBadge = 'Crypto';
      typeClass = 'badge-purple';
    }

    return `
      <tr>
        <td>
          <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-primary);">${escapeHTML(a.name)}</div>
          <div style="font-size: 0.75rem; font-weight: 800; color: var(--primary); font-family: var(--font-mono);">${escapeHTML(a.code || '')}</div>
        </td>
        <td><span class="badge ${typeClass}">${typeBadge}</span></td>
        <td style="font-weight: 600;">${qty.toLocaleString('vi-VN')} ${a.type === 'gold' ? 'cây (lượng)' : 'CP'}</td>
        <td style="font-size: 0.88rem;">${formatCurrency(buyPrice, currency)}</td>
        <td style="font-size: 0.88rem; font-weight: 600;">${formatCurrency(curPrice, currency)}</td>
        <td style="font-size: 0.95rem; font-weight: 700;">${formatCurrency(marketVal, currency)}</td>
        <td style="text-align: right;">
          <div style="font-weight: 800; font-size: 0.95rem; color: ${isProfit ? 'var(--emerald)' : 'var(--rose)'};">
            ${isProfit ? '+' : ''}${formatCurrency(pnl, currency)}
          </div>
          <div style="font-size: 0.78rem; font-weight: 700; color: ${isProfit ? 'var(--emerald)' : 'var(--rose)'};">
            ${formatPercentage(pnlPct)}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function setupInvestEventListeners(state) {
  const btnAdd = document.getElementById('btnOpenAddInvestModal');
  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      document.getElementById('formInvest').reset();
      document.getElementById('investModalId').value = '';
      openModal('modalInvest');
    });
  }
}

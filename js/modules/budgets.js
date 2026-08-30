/**
 * MODULE: BUDGETS (LẬP NGÂN SÁCH & PHÂN BỔ 50/30/20, JARS)
 */
import { getState, saveBudget } from '../state.js';
import { formatCurrency, formatCompactCurrency, formatPercentage, escapeHTML } from '../utils/formatters.js';
import { showToast, openModal, closeModal } from '../utils/notifications.js';

export function renderBudgets() {
  const container = document.getElementById('budgetsView');
  if (!container) return;

  const state = getState();
  const currency = state.settings.currency;
  const currentMonthPrefix = new Date().toISOString().substring(0, 7);

  // Calculate actual spending per category this month
  const actualCatSpending = {};
  let totalMonthlySpent = 0;
  let totalMonthlyIncome = 0;

  state.transactions.forEach(t => {
    if (t.date && t.date.startsWith(currentMonthPrefix)) {
      if (t.type === 'expense') {
        actualCatSpending[t.categoryId] = (actualCatSpending[t.categoryId] || 0) + Number(t.amount);
        totalMonthlySpent += Number(t.amount);
      } else if (t.type === 'income') {
        totalMonthlyIncome += Number(t.amount);
      }
    }
  });

  // Calculate Total Planned Budget
  let totalBudgetAmount = 0;
  state.budgets.forEach(b => {
    totalBudgetAmount += Number(b.amount || 0);
  });

  const overallSpentPercent = totalBudgetAmount > 0 ? Math.round((totalMonthlySpent / totalBudgetAmount) * 100) : 0;

  // 50/30/20 Calculation
  // 50% Needs: Ăn uống, Nhà cửa, Giáo dục, Y tế, Đi lại
  // 30% Wants: Mua sắm, Giải trí, Hiếu hỷ
  // 20% Savings: Phần còn lại tích lũy/đầu tư
  let needsSpent = 0;
  let wantsSpent = 0;

  const needsCatIds = ['cat-food', 'cat-housing', 'cat-education', 'cat-transport', 'cat-healthcare'];
  const wantsCatIds = ['cat-shopping', 'cat-entertainment', 'cat-family'];

  needsCatIds.forEach(id => { needsSpent += (actualCatSpending[id] || 0); });
  wantsCatIds.forEach(id => { wantsSpent += (actualCatSpending[id] || 0); });

  const totalIncomeForRule = totalMonthlyIncome || 80000000;
  const needsPct = Math.round((needsSpent / totalIncomeForRule) * 100);
  const wantsPct = Math.round((wantsSpent / totalIncomeForRule) * 100);
  const savingsPct = Math.max(0, 100 - needsPct - wantsPct);

  container.innerHTML = `
    <!-- Top Title & Action Bar -->
    <div class="flex items-center justify-between flex-wrap gap-4 mb-6">
      <div>
        <h2 style="font-size: 1.35rem; font-weight: 800;">Ngân Sách & Hạn Mức Chi Tiêu</h2>
        <p style="font-size: 0.85rem; color: var(--text-muted);">Kiểm soát ngân sách thông minh theo từng danh mục và quy tắc 50/30/20</p>
      </div>
      <button class="btn btn-primary btn-sm" id="btnOpenAddBudgetModal">
        <i class="fa-solid fa-plus"></i> Thiết lập ngân sách
      </button>
    </div>

    <!-- Overall Budget Summary Stat Card -->
    <div class="card mb-6" style="background: linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(31, 41, 55, 0.8) 100%);">
      <div class="flex items-center justify-between flex-wrap gap-4 mb-4">
        <div>
          <span style="font-size: 0.82rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
            Tổng Ngân Sách Gia Đình Tháng 8
          </span>
          <div style="font-size: 1.8rem; font-weight: 800; color: var(--text-primary); margin-top: 4px;">
            ${formatCurrency(totalMonthlySpent, currency)} <span style="font-size: 1.1rem; font-weight: 500; color: var(--text-muted);">/ ${formatCurrency(totalBudgetAmount, currency)}</span>
          </div>
        </div>
        <div style="text-align: right;">
          <span class="badge ${overallSpentPercent > 100 ? 'badge-rose' : (overallSpentPercent > 80 ? 'badge-amber' : 'badge-emerald')}" style="font-size: 0.9rem; padding: 6px 14px;">
            ${overallSpentPercent > 100 ? '⚠️ Đã vượt ngân sách' : (overallSpentPercent > 80 ? '⚡ Sắp chạm hạn mức' : '✅ Trong tầm kiểm soát')} (${overallSpentPercent}%)
          </span>
          <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px;">
            Còn lại: <strong style="color: ${totalBudgetAmount - totalMonthlySpent >= 0 ? 'var(--emerald)' : 'var(--rose)'};">${formatCurrency(totalBudgetAmount - totalMonthlySpent, currency)}</strong>
          </div>
        </div>
      </div>

      <div class="progress-bar-container" style="height: 12px;">
        <div class="progress-bar-fill ${overallSpentPercent > 100 ? 'rose' : (overallSpentPercent > 80 ? 'amber' : 'emerald')}" style="width: ${Math.min(100, overallSpentPercent)}%;"></div>
      </div>
    </div>

    <!-- 50/30/20 Financial Framework Box -->
    <div class="grid grid-cols-3 gap-4 mb-8">
      <!-- 50% Needs -->
      <div class="card" style="border-top: 3px solid var(--primary);">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-house" style="color: var(--primary);"></i>
            <span style="font-weight: 700; font-size: 0.92rem;">Nhu Cầu Thiết Yếu (50%)</span>
          </div>
          <span class="badge ${needsPct <= 50 ? 'badge-emerald' : 'badge-amber'}">${needsPct}% / 50%</span>
        </div>
        <div style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin-bottom: 6px;">
          ${formatCurrency(needsSpent, currency)}
        </div>
        <div style="font-size: 0.78rem; color: var(--text-muted);">
          Ăn uống, Tiện ích điện nước, Giáo dục con cái, Đi lại, Y tế
        </div>
      </div>

      <!-- 30% Wants -->
      <div class="card" style="border-top: 3px solid var(--purple);">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-bag-shopping" style="color: var(--purple);"></i>
            <span style="font-weight: 700; font-size: 0.92rem;">Sở Thích & Hưởng Thụ (30%)</span>
          </div>
          <span class="badge ${wantsPct <= 30 ? 'badge-emerald' : 'badge-amber'}">${wantsPct}% / 30%</span>
        </div>
        <div style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin-bottom: 6px;">
          ${formatCurrency(wantsSpent, currency)}
        </div>
        <div style="font-size: 0.78rem; color: var(--text-muted);">
          Mua sắm, Giải trí, Ăn tiệm cuối tuần, Du lịch, Quà tặng
        </div>
      </div>

      <!-- 20% Savings -->
      <div class="card" style="border-top: 3px solid var(--emerald);">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-piggy-bank" style="color: var(--emerald);"></i>
            <span style="font-weight: 700; font-size: 0.92rem;">Tiết Kiệm & Đầu Tư (20%)</span>
          </div>
          <span class="badge ${savingsPct >= 20 ? 'badge-emerald' : 'badge-amber'}">${savingsPct}% / 20%</span>
        </div>
        <div style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin-bottom: 6px;">
          ${formatCurrency(Math.max(0, totalIncomeForRule - needsSpent - wantsSpent), currency)}
        </div>
        <div style="font-size: 0.78rem; color: var(--text-muted);">
          Tích lũy quỹ khẩn cấp, Trả gốc nợ, Đầu tư chứng khoán/vàng
        </div>
      </div>
    </div>

    <!-- Category Budget Breakdown Grid -->
    <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 16px;">
      <i class="fa-solid fa-layer-group" style="color: var(--primary);"></i> Hạn Mức Chi Tiêu Từng Danh Mục
    </h3>
    <div class="grid grid-cols-2 gap-6" id="categoryBudgetsGrid">
      ${renderCategoryBudgetCards(state.budgets, actualCatSpending, state, currency)}
    </div>
  `;

  setupBudgetEventListeners(state);
}

function renderCategoryBudgetCards(budgets, actualSpending, state, currency) {
  if (!budgets || budgets.length === 0) {
    return `<div class="card w-full" style="grid-column: span 2; text-align: center; color: var(--text-muted); padding: 30px;">
      Chưa thiết lập ngân sách danh mục nào.
    </div>`;
  }

  return budgets.map(b => {
    const cat = state.categories.find(c => c.id === b.categoryId) || { name: 'Danh mục', icon: 'fa-tag', color: '#3b82f6' };
    const spent = actualSpending[b.categoryId] || 0;
    const limit = Number(b.amount || 1);
    const percent = Math.round((spent / limit) * 100);
    const remaining = limit - spent;

    let barClass = 'emerald';
    let badgeClass = 'badge-emerald';
    if (percent > 100) {
      barClass = 'rose';
      badgeClass = 'badge-rose';
    } else if (percent > 80) {
      barClass = 'amber';
      badgeClass = 'badge-amber';
    }

    return `
      <div class="budget-card">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="tx-icon-box" style="width: 40px; height: 40px; background: rgba(255,255,255,0.06); color: ${cat.color || 'var(--primary)'}; font-size: 1.1rem;">
              <i class="fa-solid ${cat.icon || 'fa-tag'}"></i>
            </div>
            <div>
              <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary);">${escapeHTML(cat.name)}</div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">
                Đã chi: <strong>${formatCurrency(spent, currency)}</strong>
              </div>
            </div>
          </div>
          <div style="text-align: right;">
            <span class="badge ${badgeClass}">${percent}%</span>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">
              ${remaining >= 0 ? `Còn lại ${formatCompactCurrency(remaining, currency)}` : `Vượt ${formatCompactCurrency(Math.abs(remaining), currency)}`}
            </div>
          </div>
        </div>

        <div class="progress-bar-container">
          <div class="progress-bar-fill ${barClass}" style="width: ${Math.min(100, percent)}%;"></div>
        </div>

        <div class="flex items-center justify-between" style="font-size: 0.8rem; color: var(--text-secondary); border-top: 1px solid var(--border-color); padding-top: 10px;">
          <span>Hạn mức tháng: <strong>${formatCurrency(limit, currency)}</strong></span>
          <button class="card-action btn-edit-budget" data-id="${b.id}" data-cat="${b.categoryId}" data-amount="${b.amount}" style="border: none; background: none;">
            <i class="fa-solid fa-pen"></i> Chỉnh sửa
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function setupBudgetEventListeners(state) {
  const btnAdd = document.getElementById('btnOpenAddBudgetModal');
  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      populateBudgetSelects(state);
      document.getElementById('formBudget').reset();
      document.getElementById('budgetModalId').value = '';
      openModal('modalBudget');
    });
  }

  document.querySelectorAll('.btn-edit-budget').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const catId = btn.getAttribute('data-cat');
      const amount = btn.getAttribute('data-amount');

      populateBudgetSelects(state);
      document.getElementById('budgetModalId').value = id;
      document.getElementById('budgetModalCategory').value = catId;
      document.getElementById('budgetModalAmount').value = amount;
      openModal('modalBudget');
    });
  });
}

function populateBudgetSelects(state) {
  const select = document.getElementById('budgetModalCategory');
  if (!select) return;

  const expenseCats = state.categories.filter(c => c.type === 'expense');
  select.innerHTML = expenseCats.map(c => `
    <option value="${c.id}">${escapeHTML(c.name)}</option>
  `).join('');
}

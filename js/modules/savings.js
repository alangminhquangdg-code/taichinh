/**
 * MODULE: SAVINGS GOALS (MỤC TIÊU TIẾT KIỆM & HŨ ƯỚC MƠ)
 */
import { getState, saveGoal, depositToGoal } from '../state.js';
import { formatCurrency, formatCompactCurrency, formatDate, escapeHTML, generateUUID } from '../utils/formatters.js';
import { showToast, openModal, closeModal, triggerConfetti } from '../utils/notifications.js';

export function renderSavings() {
  const container = document.getElementById('savingsView');
  if (!container) return;

  const state = getState();
  const currency = state.settings.currency;

  let totalTarget = 0;
  let totalSaved = 0;

  state.savingsGoals.forEach(g => {
    totalTarget += Number(g.targetAmount || 0);
    totalSaved += Number(g.currentAmount || 0);
  });

  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  container.innerHTML = `
    <!-- Top Action & Title Bar -->
    <div class="flex items-center justify-between flex-wrap gap-4 mb-6">
      <div>
        <h2 style="font-size: 1.35rem; font-weight: 800;">Mục Tiêu Tiết Kiệm & Hũ Ước Mơ</h2>
        <p style="font-size: 0.85rem; color: var(--text-muted);">Theo dõi các mục tiêu tài chính quan trọng của gia đình (Mua nhà, Mua xe, Quỹ khẩn cấp, Du lịch)</p>
      </div>
      <button class="btn btn-primary" id="btnOpenAddGoalModal">
        <i class="fa-solid fa-plus"></i> Tạo mục tiêu mới
      </button>
    </div>

    <!-- Summary Banner Card -->
    <div class="card mb-6" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%); border-left: 4px solid var(--emerald);">
      <div class="flex items-center justify-between flex-wrap gap-4 mb-4">
        <div>
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
            Tổng Tích Lũy Tất Cả Mục Tiêu
          </span>
          <div style="font-size: 1.8rem; font-weight: 800; color: var(--text-primary); margin-top: 4px;">
            ${formatCurrency(totalSaved, currency)} <span style="font-size: 1.1rem; font-weight: 500; color: var(--text-muted);">/ ${formatCurrency(totalTarget, currency)}</span>
          </div>
        </div>
        <div style="text-align: right;">
          <span class="badge badge-emerald" style="font-size: 0.95rem; padding: 6px 14px;">
            Đã hoàn thành ${overallProgress}%
          </span>
          <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px;">
            Còn thiếu: <strong style="color: var(--emerald);">${formatCurrency(Math.max(0, totalTarget - totalSaved), currency)}</strong>
          </div>
        </div>
      </div>

      <div class="progress-bar-container" style="height: 12px;">
        <div class="progress-bar-fill emerald" style="width: ${Math.min(100, overallProgress)}%;"></div>
      </div>
    </div>

    <!-- Goals Grid -->
    <div class="grid grid-cols-2 gap-6" id="goalsListGrid">
      ${renderGoalCards(state.savingsGoals, state, currency)}
    </div>
  `;

  setupSavingsEventListeners(state);
}

function renderGoalCards(goals, state, currency) {
  if (!goals || goals.length === 0) {
    return `<div class="card w-full" style="grid-column: span 2; text-align: center; color: var(--text-muted); padding: 40px;">
      Chưa có mục tiêu nào. Nhấn "Tạo mục tiêu mới" để bắt đầu tiết kiệm cho ước mơ của gia đình!
    </div>`;
  }

  const now = new Date();

  return goals.map(g => {
    const target = Number(g.targetAmount || 1);
    const saved = Number(g.currentAmount || 0);
    const percent = Math.min(100, Math.round((saved / target) * 100));
    const isCompleted = percent >= 100;

    // Calculate days remaining & monthly savings needed
    let daysRemaining = 0;
    let monthlyNeeded = 0;

    if (g.targetDate) {
      const targetDate = new Date(g.targetDate);
      const diffTime = targetDate - now;
      daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      const monthsRemaining = Math.max(1, daysRemaining / 30);
      const needed = Math.max(0, target - saved);
      monthlyNeeded = Math.round(needed / monthsRemaining);
    }

    return `
      <div class="goal-card" style="${isCompleted ? 'border-color: var(--emerald);' : ''}">
        <div>
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="goal-icon-large" style="background: ${g.color ? g.color + '22' : 'var(--emerald-light)'}; color: ${g.color || 'var(--emerald)'};">
                <i class="fa-solid ${g.icon || 'fa-piggy-bank'}"></i>
              </div>
              <div>
                <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary);">${escapeHTML(g.name)}</h4>
                <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">
                  <i class="fa-regular fa-calendar-check"></i> Hạn chót: ${formatDate(g.targetDate)} (${daysRemaining > 0 ? `${daysRemaining} ngày nữa` : 'Đến hạn'})
                </div>
              </div>
            </div>
            <span class="badge ${isCompleted ? 'badge-emerald' : 'badge-primary'}" style="font-size: 0.85rem;">
              ${isCompleted ? '🎉 Hoàn thành!' : `${percent}%`}
            </span>
          </div>

          <div style="font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 14px; line-height: 1.4;">
            ${escapeHTML(g.note || 'Mục tiêu tài chính gia đình')}
          </div>

          <!-- Progress Bar -->
          <div class="progress-bar-container mb-2" style="height: 10px;">
            <div class="progress-bar-fill ${isCompleted ? 'emerald' : 'primary'}" style="width: ${percent}%;"></div>
          </div>

          <div class="flex items-center justify-between mb-4" style="font-size: 0.85rem;">
            <div>
              <span style="color: var(--text-muted);">Đã tiết kiệm: </span>
              <strong style="color: var(--text-primary); font-size: 0.95rem;">${formatCurrency(saved, currency)}</strong>
            </div>
            <div style="text-align: right;">
              <span style="color: var(--text-muted);">Mục tiêu: </span>
              <strong style="color: var(--text-primary); font-size: 0.95rem;">${formatCurrency(target, currency)}</strong>
            </div>
          </div>
        </div>

        <!-- Footer Recommendation & Deposit Button -->
        <div class="flex items-center justify-between flex-wrap gap-2 pt-3" style="border-top: 1px solid var(--border-color);">
          <div style="font-size: 0.78rem; color: var(--text-muted);">
            ${!isCompleted && monthlyNeeded > 0 ? `Cần tích lũy: <strong style="color: var(--emerald);">${formatCompactCurrency(monthlyNeeded, currency)}/tháng</strong>` : 'Đã đạt mục tiêu đề ra!'}
          </div>
          <div class="flex items-center gap-2">
            <button class="btn btn-emerald btn-sm btn-deposit-goal" data-id="${g.id}" data-name="${escapeHTML(g.name)}" style="font-size: 0.8rem;">
              <i class="fa-solid fa-plus-circle"></i> Nạp tiền tích lũy
            </button>
            <button class="btn btn-secondary btn-sm btn-edit-goal" data-id="${g.id}" style="padding: 6px 10px;">
              <i class="fa-solid fa-pen"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function setupSavingsEventListeners(state) {
  // Add Goal Modal
  const btnAdd = document.getElementById('btnOpenAddGoalModal');
  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      document.getElementById('formGoal').reset();
      document.getElementById('goalModalId').value = '';
      document.getElementById('goalModalTitle').textContent = 'Tạo Mục Tiêu Tiết Kiệm Mới';
      openModal('modalGoal');
    });
  }

  // Edit Goal
  document.querySelectorAll('.btn-edit-goal').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const goal = state.savingsGoals.find(g => g.id === id);
      if (goal) {
        document.getElementById('goalModalId').value = goal.id;
        document.getElementById('goalName').value = goal.name;
        document.getElementById('goalTarget').value = goal.targetAmount;
        document.getElementById('goalCurrent').value = goal.currentAmount || 0;
        document.getElementById('goalDate').value = goal.targetDate || '';
        document.getElementById('goalNote').value = goal.note || '';
        document.getElementById('goalModalTitle').textContent = 'Chỉnh Sửa Mục Tiêu';
        openModal('modalGoal');
      }
    });
  });

  // Deposit to Goal
  document.querySelectorAll('.btn-deposit-goal').forEach(btn => {
    btn.addEventListener('click', () => {
      const goalId = btn.getAttribute('data-id');
      const goalName = btn.getAttribute('data-name');
      
      document.getElementById('depositGoalId').value = goalId;
      document.getElementById('depositGoalNameLabel').textContent = goalName;
      
      // Populate Account Selector
      const accSelect = document.getElementById('depositFromAcc');
      if (accSelect) {
        accSelect.innerHTML = state.accounts.map(a => 
          `<option value="${a.id}">${escapeHTML(a.name)} (${formatCompactCurrency(a.balance, state.settings.currency)})</option>`
        ).join('');
      }

      document.getElementById('depositAmount').value = '';
      openModal('modalDepositGoal');
    });
  });
}

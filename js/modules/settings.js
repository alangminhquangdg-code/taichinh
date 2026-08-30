/**
 * MODULE: SETTINGS (CÀI ĐẶT & SAO LƯU DỮ LIỆU)
 */
import { getState, saveState, resetToDemoData, exportStateJSON, importStateJSON } from '../state.js';
import { showToast } from '../utils/notifications.js';

export function renderSettings() {
  const container = document.getElementById('settingsView');
  if (!container) return;

  const state = getState();

  container.innerHTML = `
    <!-- Top Title Bar -->
    <div class="flex items-center justify-between flex-wrap gap-4 mb-6">
      <div>
        <h2 style="font-size: 1.35rem; font-weight: 800;">Cài Đặt Hệ Thống & Quản Trị Dữ Liệu</h2>
        <p style="font-size: 0.85rem; color: var(--text-muted);">Tùy chỉnh giao diện, đơn vị tiền tệ, sao lưu an toàn và phục hồi dữ liệu gia đình</p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-6">
      <!-- Section 1: Appearance & Currency Preferences -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <i class="fa-solid fa-palette"></i>
            Tùy Chỉnh Giao Diện & Tiền Tệ
          </div>
        </div>

        <div class="form-group mb-4">
          <label class="form-label">Chủ đề giao diện (Theme):</label>
          <div class="tab-segmented" id="themeSegmented">
            <button class="tab-seg-btn ${state.settings.theme === 'dark' ? 'active' : ''}" data-theme-val="dark">
              🌙 Fintech Dark
            </button>
            <button class="tab-seg-btn ${state.settings.theme === 'light' ? 'active' : ''}" data-theme-val="light">
              ☀️ Light Clean
            </button>
            <button class="tab-seg-btn ${state.settings.theme === 'emerald' ? 'active' : ''}" data-theme-val="emerald">
              💎 Emerald Luxury
            </button>
          </div>
        </div>

        <div class="form-group mb-4">
          <label class="form-label">Đơn vị tiền tệ chính:</label>
          <select class="form-control" id="settingCurrency">
            <option value="VND" ${state.settings.currency === 'VND' ? 'selected' : ''}>VNĐ (₫) - Việt Nam Đồng</option>
            <option value="USD" ${state.settings.currency === 'USD' ? 'selected' : ''}>USD ($) - US Dollar</option>
            <option value="EUR" ${state.settings.currency === 'EUR' ? 'selected' : ''}>EUR (€) - Euro</option>
          </select>
        </div>

        <div class="form-group mb-4">
          <label class="form-label">Ngôn ngữ hiển thị:</label>
          <input type="text" class="form-control" value="Tiếng Việt (Mặc định)" disabled style="opacity: 0.7;">
        </div>
      </div>

      <!-- Section 2: Backup & Restore Data -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <i class="fa-solid fa-database"></i>
            Sao Lưu & Phục Hồi Dữ Liệu
          </div>
        </div>

        <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 16px;">
          Toàn bộ dữ liệu của bạn được mã hóa và lưu trữ an toàn trong trình duyệt cục bộ (Local Storage). Hãy tải bản sao lưu định kỳ để không lo mất dữ liệu.
        </div>

        <div class="flex flex-col gap-3 mb-6">
          <button class="btn btn-primary" id="btnExportJSON">
            <i class="fa-solid fa-download"></i> Tải file sao lưu dữ liệu (.JSON)
          </button>

          <div style="position: relative;">
            <input type="file" id="importFileInput" accept=".json" style="display: none;">
            <button class="btn btn-secondary w-full" id="btnImportJSON">
              <i class="fa-solid fa-upload"></i> Phục hồi dữ liệu từ file JSON
            </button>
          </div>
        </div>

        <div style="border-top: 1px solid var(--border-color); padding-top: 16px;">
          <div style="font-size: 0.85rem; font-weight: 700; color: var(--rose); margin-bottom: 4px;">
            Vùng Nguy Hiểm:
          </div>
          <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 10px;">
            Khôi phục lại dữ liệu mẫu ban đầu của gia đình mẫu Việt Nam.
          </div>
          <button class="btn btn-danger btn-sm" id="btnResetDemo">
            <i class="fa-solid fa-rotate-left"></i> Khôi phục dữ liệu mẫu Demo
          </button>
        </div>
      </div>
    </div>
  `;

  setupSettingsEventListeners(state);
}

function setupSettingsEventListeners(state) {
  // Theme Switcher Buttons
  document.querySelectorAll('#themeSegmented .tab-seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const themeVal = btn.getAttribute('data-theme-val');
      document.documentElement.setAttribute('data-theme', themeVal);
      state.settings.theme = themeVal;
      saveState();

      document.querySelectorAll('#themeSegmented .tab-seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      showToast(`Đã chuyển sang giao diện ${themeVal.toUpperCase()}`, 'success');
    });
  });

  // Currency selection
  const curSelect = document.getElementById('settingCurrency');
  if (curSelect) {
    curSelect.addEventListener('change', (e) => {
      state.settings.currency = e.target.value;
      saveState();
      showToast(`Đã đổi đơn vị tiền tệ sang ${e.target.value}`, 'success');
    });
  }

  // Export JSON
  const btnExport = document.getElementById('btnExportJSON');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      const json = exportStateJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FamilyFinanceHub_Backup_${new Date().toISOString().substring(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Đã tải xuống file sao lưu an toàn!', 'success');
    });
  }

  // Import JSON
  const btnImport = document.getElementById('btnImportJSON');
  const fileInput = document.getElementById('importFileInput');
  if (btnImport && fileInput) {
    btnImport.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const success = importStateJSON(event.target.result);
          if (success) {
            showToast('Đã phục hồi dữ liệu thành công!', 'success');
            setTimeout(() => window.location.reload(), 800);
          } else {
            showToast('File sao lưu không hợp lệ!', 'error');
          }
        };
        reader.readAsText(file);
      }
    });
  }

  // Reset to Demo Data
  const btnReset = document.getElementById('btnResetDemo');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (confirm('Bạn có chắc chắn muốn cài đặt lại toàn bộ dữ liệu mẫu ban đầu?')) {
        resetToDemoData();
        showToast('Đã cài đặt lại dữ liệu mẫu thành công!', 'success');
        setTimeout(() => window.location.reload(), 500);
      }
    });
  }
}

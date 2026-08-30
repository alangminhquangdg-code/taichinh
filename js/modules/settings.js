/**
 * MODULE: SETTINGS (CÀI ĐẶT, ĐỒNG BỘ CLOUD FIREBASE & SAO LƯU DỮ LIỆU)
 */
import { getState, saveState, resetToDemoData, exportStateJSON, importStateJSON } from '../state.js';
import { showToast } from '../utils/notifications.js';
import { firebaseConfig, syncStateToFirestore, fetchStateFromFirestore, subscribeToFirestore } from '../firebase.js';

export function renderSettings() {
  const container = document.getElementById('settingsView');
  if (!container) return;

  const state = getState();
  const savedFamilyCode = localStorage.getItem('family_sync_code') || 'gia_dinh_quang_2026';

  container.innerHTML = `
    <!-- Top Title Bar -->
    <div class="flex items-center justify-between flex-wrap gap-4 mb-6">
      <div>
        <h2 style="font-size: 1.35rem; font-weight: 800;">Cài Đặt Hệ Thống & Quản Trị Dữ Liệu</h2>
        <p style="font-size: 0.85rem; color: var(--text-muted);">Tùy chỉnh giao diện, đơn vị tiền tệ, kết nối Firebase Cloud & sao lưu dữ liệu gia đình</p>
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

      <!-- Section 2: Firebase Cloud Sync (Đồng bộ đám mây) -->
      <div class="card" style="border: 1px solid rgba(59, 130, 246, 0.3); background: linear-gradient(180deg, rgba(59, 130, 246, 0.05) 0%, rgba(17, 24, 39, 0.85) 100%);">
        <div class="card-header">
          <div class="card-title">
            <i class="fa-solid fa-cloud" style="color: #3b82f6;"></i>
            Đồng Bộ Điện Toán Đám Mây Firebase
          </div>
          <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); font-size: 0.75rem;">
            <i class="fa-solid fa-circle-check"></i> ${firebaseConfig.projectId}
          </span>
        </div>

        <div style="font-size: 0.83rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 16px;">
          Dữ liệu của bạn được kết nối trực tiếp với <strong>Firebase Cloud Firestore</strong> & <strong>Google Analytics</strong> (${firebaseConfig.measurementId}). Cả nhà có thể dùng chung một Mã Gia Đình để đồng bộ số dư và giao dịch giữa điện thoại và máy tính.
        </div>

        <div class="form-group mb-4">
          <label class="form-label">Mã Gia Đình (Family Sync Code):</label>
          <div style="display: flex; gap: 8px;">
            <input type="text" class="form-control" id="inputFamilyCode" value="${savedFamilyCode}" placeholder="vd: gia_dinh_quang_2026">
            <button class="btn btn-secondary" id="btnSaveFamilyCode" title="Lưu mã">
              <i class="fa-solid fa-check"></i>
            </button>
          </div>
          <small style="color: var(--text-muted); font-size: 0.75rem; margin-top: 4px; display: block;">
            Nhập cùng mã này trên các thiết bị khác để tải dữ liệu tài chính gia đình.
          </small>
        </div>

        <div class="grid grid-cols-2 gap-3 mb-2">
          <button class="btn btn-primary" id="btnSyncToCloud" style="background: var(--primary-gradient);">
            <i class="fa-solid fa-cloud-arrow-up"></i> Đẩy Lên Cloud
          </button>
          <button class="btn btn-secondary" id="btnFetchFromCloud">
            <i class="fa-solid fa-cloud-arrow-down"></i> Tải Về Từ Cloud
          </button>
        </div>
      </div>

      <!-- Section 3: Backup & Restore Data File (.JSON) -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <i class="fa-solid fa-database"></i>
            Sao Lưu & Phục Hồi File Cục Bộ
          </div>
        </div>

        <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 16px;">
          Tải file dữ liệu JSON về máy tính hoặc nạp file sao lưu đã lưu trước đó.
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

  // Save Family Code
  const inputFamilyCode = document.getElementById('inputFamilyCode');
  const btnSaveFamilyCode = document.getElementById('btnSaveFamilyCode');
  if (btnSaveFamilyCode && inputFamilyCode) {
    btnSaveFamilyCode.addEventListener('click', () => {
      const code = inputFamilyCode.value.trim() || 'gia_dinh_quang_2026';
      localStorage.setItem('family_sync_code', code);
      showToast(`Đã lưu Mã Gia Đình: ${code}`, 'success');
    });
  }

  // Push to Firebase Cloud
  const btnSyncToCloud = document.getElementById('btnSyncToCloud');
  if (btnSyncToCloud) {
    btnSyncToCloud.addEventListener('click', async () => {
      const code = (inputFamilyCode ? inputFamilyCode.value.trim() : null) || localStorage.getItem('family_sync_code') || 'gia_dinh_quang_2026';
      localStorage.setItem('family_sync_code', code);

      btnSyncToCloud.disabled = true;
      btnSyncToCloud.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang tải lên...`;

      const currentState = getState();
      const res = await syncStateToFirestore(currentState, code);

      btnSyncToCloud.disabled = false;
      btnSyncToCloud.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Đẩy Lên Cloud`;

      if (res.success) {
        showToast(`Đã đồng bộ toàn bộ dữ liệu lên Firebase Cloud thành công! (Mã: ${code})`, 'success');
      } else {
        showToast(`Lỗi đồng bộ: ${res.error}`, 'error');
      }
    });
  }

  // Fetch from Firebase Cloud
  const btnFetchFromCloud = document.getElementById('btnFetchFromCloud');
  if (btnFetchFromCloud) {
    btnFetchFromCloud.addEventListener('click', async () => {
      const code = (inputFamilyCode ? inputFamilyCode.value.trim() : null) || localStorage.getItem('family_sync_code') || 'gia_dinh_quang_2026';
      
      btnFetchFromCloud.disabled = true;
      btnFetchFromCloud.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang tải về...`;

      const res = await fetchStateFromFirestore(code);

      btnFetchFromCloud.disabled = false;
      btnFetchFromCloud.innerHTML = `<i class="fa-solid fa-cloud-arrow-down"></i> Tải Về Từ Cloud`;

      if (res.success && res.data) {
        const success = importStateJSON(JSON.stringify(res.data));
        if (success) {
          showToast(`Đã tải và khôi phục dữ liệu từ Firebase Cloud thành công!`, 'success');
          setTimeout(() => window.location.reload(), 600);
        } else {
          showToast('Dữ liệu từ Cloud không hợp lệ!', 'error');
        }
      } else {
        showToast(res.error || 'Không tìm thấy dữ liệu trên Cloud!', 'error');
      }
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

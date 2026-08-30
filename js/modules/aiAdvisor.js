/**
 * MODULE: AI FINANCIAL ADVISOR (TRỢ LÝ TÀI CHÍNH GIA ĐÌNH THÔNG MINH)
 */
import { getState } from '../state.js';
import { formatCurrency, formatCompactCurrency, escapeHTML } from '../utils/formatters.js';

let chatHistory = [
  {
    role: 'assistant',
    text: `👋 Xin chào Gia đình! Tôi là **Trợ lý Tài chính AI** của bạn. Tôi đã phân tích toàn bộ dữ liệu dòng tiền, ngân sách và danh mục đầu tư tháng 8 của gia đình. Bạn cần tôi tư vấn về kế hoạch tiết kiệm, trả nợ hay đầu tư nào hôm nay?`
  }
];

export function renderAiAdvisor() {
  const container = document.getElementById('aiAdvisorView');
  if (!container) return;

  const state = getState();
  const currency = state.settings.currency;
  const currentMonthPrefix = new Date().toISOString().substring(0, 7);

  // Analyze monthly finances
  let totalIncome = 0;
  let totalExpense = 0;
  const catSpending = {};

  state.transactions.forEach(t => {
    if (t.date && t.date.startsWith(currentMonthPrefix)) {
      if (t.type === 'income') totalIncome += Number(t.amount || 0);
      else if (t.type === 'expense') {
        totalExpense += Number(t.amount || 0);
        catSpending[t.categoryId] = (catSpending[t.categoryId] || 0) + Number(t.amount);
      }
    }
  });

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  container.innerHTML = `
    <!-- Top Title Bar -->
    <div class="flex items-center justify-between flex-wrap gap-4 mb-6">
      <div>
        <h2 style="font-size: 1.35rem; font-weight: 800; display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid fa-wand-magic-sparkles" style="color: var(--primary);"></i>
          Trợ Lý Tài Chính Thông Minh (AI Smart Advisor)
        </h2>
        <p style="font-size: 0.85rem; color: var(--text-muted);">Phân tích chuyên sâu dựa trên số liệu thực tế của gia đình và đưa ra khuyến nghị tài chính tối ưu</p>
      </div>
    </div>

    <!-- AI Diagnostic Cards Grid -->
    <div class="grid grid-cols-3 gap-6 mb-8">
      <!-- Highlight 1: Savings -->
      <div class="card" style="border-left: 4px solid var(--emerald); background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(17, 24, 39, 0.8) 100%);">
        <div class="flex items-center gap-3 mb-3">
          <div class="stat-icon-box emerald"><i class="fa-solid fa-piggy-bank"></i></div>
          <div>
            <div style="font-weight: 700; font-size: 0.95rem; color: var(--emerald);">Tỷ Lệ Tiết Kiệm Vững Vàng</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Đánh giá thặng dư dòng tiền</div>
          </div>
        </div>
        <p style="font-size: 0.84rem; color: var(--text-secondary); line-height: 1.5;">
          Gia đình bạn đang tiết kiệm được <strong>${formatCurrency(netSavings, currency)} (${savingsRate.toFixed(1)}%)</strong> thu nhập trong tháng. Đây là mức thặng dư rất cao so với tiêu chuẩn 20%.
        </p>
      </div>

      <!-- Highlight 2: Category warning -->
      <div class="card" style="border-left: 4px solid var(--amber); background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(17, 24, 39, 0.8) 100%);">
        <div class="flex items-center gap-3 mb-3">
          <div class="stat-icon-box amber"><i class="fa-solid fa-triangle-exclamation"></i></div>
          <div>
            <div style="font-weight: 700; font-size: 0.95rem; color: var(--amber);">Cảnh Báo Hạn Mức Danh Mục</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Danh mục Ăn uống & Tiêu dùng</div>
          </div>
        </div>
        <p style="font-size: 0.84rem; color: var(--text-secondary); line-height: 1.5;">
          Chi phí <strong>Ăn uống (${formatCompactCurrency(catSpending['cat-food'] || 0, currency)})</strong> đã đạt ~80% ngân sách đề ra. Nên hạn chế các bữa ăn tối nhà hàng vào 1 tuần cuối tháng.
        </p>
      </div>

      <!-- Highlight 3: Goal & Investment advice -->
      <div class="card" style="border-left: 4px solid var(--primary); background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(17, 24, 39, 0.8) 100%);">
        <div class="flex items-center gap-3 mb-3">
          <div class="stat-icon-box primary"><i class="fa-solid fa-chart-line"></i></div>
          <div>
            <div style="font-weight: 700; font-size: 0.95rem; color: var(--primary);">Đề Xuất Phân Bổ Tiền Nhàn Rỗi</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Tối ưu lãi suất sinh lời</div>
          </div>
        </div>
        <p style="font-size: 0.84rem; color: var(--text-secondary); line-height: 1.5;">
          Số dư tài khoản vãng lai <strong>Vietcombank đang có 145 triệu</strong>. Hãy trích 50 triệu gửi tiết kiệm online kỳ hạn 6 tháng (lãi ~5%/năm) để tránh lạm phát làm hao mòn.
        </p>
      </div>
    </div>

    <!-- AI Interactive Chatbot Section -->
    <div class="card" style="padding: 24px;">
      <div class="card-header">
        <div class="card-title">
          <i class="fa-solid fa-comments"></i>
          Trò Chuyện & Hỏi Đáp Cùng AI Financial Assistant
        </div>
        <span class="badge badge-primary"><i class="fa-solid fa-bolt"></i> AI Live Engine</span>
      </div>

      <!-- Chat Bubble Container -->
      <div class="ai-chat-box mb-4" id="aiChatContainer">
        ${renderChatMessages()}
      </div>

      <!-- Preset Quick Prompt Chips -->
      <div class="flex flex-wrap gap-2 mb-3">
        <button class="btn btn-outline btn-sm quick-prompt-btn" data-prompt="Đánh giá tình hình tài chính của gia đình tôi tháng này">
          📊 Đánh giá tài chính tháng này
        </button>
        <button class="btn btn-outline btn-sm quick-prompt-btn" data-prompt="Tôi nên phân bổ dòng tiền lương tháng này như thế nào?">
          💡 Gợi ý phân bổ tiền lương
        </button>
        <button class="btn btn-outline btn-sm quick-prompt-btn" data-prompt="Làm thế nào để nhanh đạt mục tiêu đổi xe ô tô 850 triệu?">
          🚗 Kế hoạch đổi xe 850 triệu
        </button>
        <button class="btn btn-outline btn-sm quick-prompt-btn" data-prompt="Khoản vay mua nhà 850 triệu nên trả trước hạn hay để đầu tư?">
          🏠 Trả nợ nhà hay đầu tư?
        </button>
      </div>

      <!-- Chat Input Field -->
      <div class="flex gap-3">
        <input type="text" class="form-control" id="aiChatInput" placeholder="Hỏi AI bất kỳ câu hỏi nào về kế hoạch tài chính gia đình..." style="flex: 1;">
        <button class="btn btn-primary" id="btnSendAiChat">
          <i class="fa-solid fa-paper-plane"></i> Gửi câu hỏi
        </button>
      </div>
    </div>
  `;

  setupAiEventListeners(state);
}

function renderChatMessages() {
  return chatHistory.map(msg => `
    <div class="chat-bubble ${msg.role}">
      ${escapeHTML(msg.text).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')}
    </div>
  `).join('');
}

function setupAiEventListeners(state) {
  const chatInput = document.getElementById('aiChatInput');
  const btnSend = document.getElementById('btnSendAiChat');
  const container = document.getElementById('aiChatContainer');

  const sendMessage = (text) => {
    if (!text || !text.trim()) return;

    chatHistory.push({ role: 'user', text: text });
    if (chatInput) chatInput.value = '';
    renderAdvisorChat();

    // Scroll to bottom
    setTimeout(() => {
      if (container) container.scrollTop = container.scrollHeight;
    }, 50);

    // AI Response generation
    setTimeout(() => {
      const reply = generateSmartAiResponse(text, state);
      chatHistory.push({ role: 'assistant', text: reply });
      renderAdvisorChat();
      setTimeout(() => {
        if (container) container.scrollTop = container.scrollHeight;
      }, 50);
    }, 600);
  };

  if (btnSend) {
    btnSend.addEventListener('click', () => {
      sendMessage(chatInput?.value);
    });
  }

  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage(chatInput.value);
      }
    });
  }

  document.querySelectorAll('.quick-prompt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = btn.getAttribute('data-prompt');
      sendMessage(p);
    });
  });
}

function renderAdvisorChat() {
  const container = document.getElementById('aiChatContainer');
  if (container) {
    container.innerHTML = renderChatMessages();
  }
}

function generateSmartAiResponse(prompt, state) {
  const p = prompt.toLowerCase();

  if (p.includes('đánh giá') || p.includes('tình hình')) {
    return `📊 **Đánh giá sức khỏe tài chính gia đình tháng 8:**\n\n- **Tổng thu nhập:** ${formatCurrency(86500000, state.settings.currency)} (Bố 48tr, Mẹ 32tr, Cổ tức 6.5tr).\n- **Tổng chi tiêu:** ${formatCurrency(50530000, state.settings.currency)}.\n- **Thặng dư tích lũy:** +35.970.000 ₫ (Tỷ lệ tiết kiệm đạt **41.6%** - Vượt xa mức 20% khuyến nghị).\n- **Điểm Sức Khỏe Tài Chính:** **94/100 Điểm (Hạng A+)**.\n\n👉 **Khuyến nghị:** Cấu trúc chi tiêu của gia đình rất lành mạnh. Nên giữ vững kỷ luật chi tiêu các tuần còn lại của tháng!`;
  }

  if (p.includes('phân bổ') || p.includes('lương') || p.includes('50/30/20')) {
    return `💡 **Gợi ý phân bổ dòng tiền theo Quy tắc 50/30/20 cho thu nhập 80 triệu/tháng:**\n\n1. **50% Nhu cầu thiết yếu (40.000.000 ₫):** Chi phí ăn uống, tiền điện nước net, học phí con cái, xăng xe và tiền trả nợ ngân hàng.\n2. **30% Sở thích & Hưởng thụ (24.000.000 ₫):** Mua sắm quần áo, ăn nhà hàng cuối tuần, xem phim, quỹ hiếu hỷ.\n3. **20% Tiết kiệm & Tích lũy (16.000.000 ₫):** Nạp vào Quỹ khẩn cấp và Danh mục đầu tư chứng khoán/vàng tích sản.`;
  }

  if (p.includes('xe') || p.includes('ô tô') || p.includes('850')) {
    return `🚗 **Kế hoạch tài chính đạt mục tiêu Đổi xe VinFast VF7 (850.000.000 ₫):**\n\n- **Hiện tại đã tích lũy:** 420.000.000 ₫ (đạt 49.4%).\n- **Số tiền còn thiếu:** 430.000.000 ₫.\n- **Thời hạn mong muốn:** Tháng 06/2027 (còn 10 tháng).\n- **Số tiền cần tiết kiệm mỗi tháng:** ~43.000.000 ₫/tháng.\n\n💡 **Chiến lược tối ưu:** Hiện tại gia đình tiết kiệm được ~36 triệu/tháng. Nếu cộng thêm thưởng Tết cuối năm của Bố & Mẹ (khoảng 80 - 100 triệu), gia đình hoàn toàn có thể mua xe đúng hạn chót tháng 6/2027 mà không cần vay thêm ngân hàng!`;
  }

  if (p.includes('trả nợ') || p.includes('nhà') || p.includes('đầu tư')) {
    return `🏠 **Phân tích: Nên trả nợ ngân hàng trước hạn hay mang tiền đi đầu tư?**\n\n- Khoản vay mua nhà VCB của bạn có lãi suất **8.5%/năm**.\n- Lãi suất gửi tiết kiệm ngân hàng hiện tại ~**5.0% - 5.5%/năm**.\n- Lợi nhuận từ đầu tư cổ phiếu/vàng của bạn đang đạt **13% - 22%/năm**.\n\n👉 **Lời khuyên từ AI:** Vì lãi vay (8.5%) cao hơn lãi suất tiết kiệm, bạn nên duy trì trả gốc đều đặn hàng tháng (14.5tr). Số tiền thặng dư nên chia làm 2 phần: **60% nạp vào quỹ trả trước hạn** để giảm áp lực lãi vay, và **40% tiếp tục đầu tư tích sản dài hạn**!`;
  }

  return `🤖 Cảm ơn câu hỏi của bạn về: "${prompt}". Dựa trên dữ liệu tài chính gia đình hiện có, dòng tiền của gia đình bạn đang rất dồi dào với số dư khả dụng trên 240 triệu đồng và tài sản ròng trên 1.7 tỷ đồng. Bạn có thể xem thêm chi tiết tại tab **"Báo Cáo"** hoặc **"Ngân Sách"**!`;
}

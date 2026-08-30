# 💼 Family Finance Hub - Quản Lý Tài Chính Cá Nhân & Gia Đình

Ứng dụng web Quản lý Tài chính Cá nhân & Gia đình toàn diện với giao diện Fintech hiện đại (Dark Glassmorphism UI), hỗ trợ đầy đủ các nghiệp vụ quản lý tài chính chuẩn mực, bảo mật và lưu trữ dữ liệu an toàn trên trình duyệt (LocalStorage).

---

## 🌟 Các Tính Năng Nổi Bật

1. **Tổng Quan Tài Sản Ròng (Net Worth & Dashboard)**:
   - Thống kê tài sản ròng theo thời gian thực (Tiền mặt + Ngân hàng + Đầu tư + Tiết kiệm - Nợ).
   - Biểu đồ dòng tiền thu/chi, phân bổ tài sản và danh mục chi tiêu trực quan.

2. **Quản Lý Đa Ví & Tài Khoản Ngân Hàng**:
   - Quản lý tiền mặt, tài khoản ngân hàng (VCB, TCB, MB, BIDV...), thẻ tín dụng, ví điện tử (Momo, ZaloPay), sổ tiết kiệm.
   - Chuyển tiền nội bộ giữa các ví.
   - Phân quyền sở hữu theo từng thành viên hoặc Quỹ chung gia đình.

3. **Sổ Giao Dịch Thu / Chi Chi Tiết**:
   - Ghi nhận thu/chi, phân loại danh mục thông minh, đính kèm thành viên thực hiện, ghi chú và hình ảnh hóa đơn.
   - Bộ lọc đa chiều theo thời gian, thành viên, danh mục và từ khóa.

4. **Kế Hoạch Ngân Sách Thông Minh**:
   - Thiết lập hạn mức chi tiêu theo tháng và danh mục.
   - Hỗ trợ công thức phân bổ tài chính nổi tiếng **50/30/20** và **6 Chiếc Hũ (JARS)**.

5. **Mục Tiêu Tiết Kiệm Ước Mơ (Piggy Bank Goals)**:
   - Đặt mục tiêu mua nhà, mua xe, du lịch, giáo dục con cái...
   - Nạp tiền từ các ví và theo dõi tiến độ tiết kiệm trực quan.

6. **Quản Lý Vay & Cho Vay (Debts & Loans)**:
   - Theo dõi các khoản vay ngân hàng, người khác nợ, tiến độ trả nợ và nhắc nhở hạn trả.

7. **Danh Mục Đầu Tư & Sổ Tiết Kiệm Tích Lũy**:
   - Quản lý danh mục Cổ phiếu, Vàng miếng SJC, Bất động sản, Crypto với tính toán Lãi/Lỗ (P&L) tự động.
   - Quản lý sổ tiết kiệm ngân hàng có kỳ hạn, tự động tính ngày đáo hạn và tiền lãi.

8. **Thành Viên Gia Đình & Quỹ Chung (Family Pool)**:
   - Quản lý hồ sơ các thành viên trong gia đình (Bố, Mẹ, Con cái...), hạn mức chi tiêu riêng và đóng góp quỹ chung.

9. **Báo Cáo Chuyên Sâu & Điểm Sức Khỏe Tài Chính**:
   - Đánh giá **Điểm Sức Khỏe Tài Chính 0 - 100** dựa trên 4 trụ cột (Tỷ lệ tiết kiệm, Quỹ khẩn cấp, DTI, Đa dạng hóa tài sản).

10. **Trợ Lý Ảo AI Tài Chính**:
    - Phân tích thói quen chi tiêu, cảnh báo rủi ro lạm phát chi tiêu và đưa ra lời khuyên tối ưu hóa ngân sách.

11. **Sao Lưu & Khôi Phục Dữ Liệu**:
    - Xuất/Nhập dữ liệu JSON an toàn, xuất báo cáo ra Excel, in ấn PDF.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ

1. **Clone repository về máy:**
   ```bash
   git clone https://github.com/alangminhquangdg-code/taichinh.git
   cd taichinh
   ```

2. **Chạy ứng dụng:**
   - Mở trực tiếp file `index.html` trên trình duyệt (hoặc dùng Live Server / Python HTTP Server):
   ```bash
   python -m http.server 8080
   ```
   - Mở trình duyệt và truy cập: `http://localhost:8080`

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: HTML5 Semantic, Modern Vanilla JavaScript (ES6+ Modules)
- **Styling**: Vanilla CSS3 (Custom Design System, Dark Mode Glassmorphism, CSS Grid/Flexbox)
- **Thư viện tích hợp**:
  - [Chart.js](https://www.chartjs.org/) - Biểu đồ thống kê tài chính
  - [FontAwesome 6](https://fontawesome.com/) - Hệ thống icon Fintech
  - [Canvas Confetti](https://github.com/catdad/canvas-confetti) - Hiệu ứng chúc mừng đạt mục tiêu
  - [SheetJS (xlsx)](https://sheetjs.com/) - Xuất dữ liệu Excel
- **Lưu trữ**: LocalStorage (Dữ liệu hoàn toàn riêng tư trên thiết bị người dùng)

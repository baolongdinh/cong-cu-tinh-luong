# 🧮 Máy Tính Lương & So Sánh Offer Việt Nam (Chuẩn 2026)

Công cụ tính lương Gross sang Net và ngược lại, hỗ trợ so sánh 2 offer khác nhau để tìm ra "Tổng giá trị thực" (Total Value) bạn nhận được mỗi năm. Ứng dụng đã được cập nhật theo **Luật Thuế TNCN 2025** và **Nghị định 293/2025** có hiệu lực từ 01/01/2026.

<img width="1348" height="805" alt="image" src="https://github.com/user-attachments/assets/4753c09f-bd19-49ba-8681-415ab8dac2e3" />


## 🌟 Tính năng nổi bật

### 1. Tính lương Gross ↔ Net chính xác
- Tự động tính Bảo hiểm (BHXH, BHYT, BHTN) theo tỷ lệ chuẩn.
- Tự động tính Thuế TNCN theo **biểu thuế 5 bậc mới nhất (2026)**.
- Hỗ trợ giảm trừ gia cảnh mới: **15.5tr/tháng** cho bản thân và **6.2tr/tháng** cho người phụ thuộc.

### 2. So sánh 2 Offer (Side-by-side)
- So sánh trực quan giữa 2 công việc khác nhau.
- Tính toán **Tổng giá trị thực (Total Value)** = Lương Net + Tích lũy Bảo hiểm (Hưu trí).
- Chỉ ra offer nào "hời" hơn về mặt tài sản thực sự tích lũy được mỗi tháng/năm.

### 3. Công cụ "Deal Lương" (Breakeven Analysis)
- Giúp bạn trả lời câu hỏi: *"Nếu công ty B không đóng full bảo hiểm, tôi cần deal lương bao nhiêu để nhận được tổng giá trị tương đương công ty A đang đóng full bảo hiểm?"*
- Tự động tính toán mức lương "điểm hòa vốn" để bạn không bị lỗ khi nhảy việc.

### 4. Tùy chỉnh đóng Bảo hiểm
- Hỗ trợ các chế độ: Đóng Full, Đóng theo mức tối thiểu vùng, Không đóng, hoặc **Tùy chỉnh số tiền đóng BH**.

---

## 🛠️ Cài đặt & Phát triển

### Yêu cầu
- Node.js (phiên bản 18 trở lên)
- Npm hoặc Yarn

### Chạy local
1. Clone repository:
```bash
git clone https://github.com/baolongdinh/cong-cu-tinh-luong.git
cd cong-cu-tinh-luong
```
2. Cài đặt thư viện:
```bash
make install
```
3. Chạy môi trường phát triển:
```bash
make dev
```
Truy cập: `http://localhost:5173`

---

## 🚀 Deployment (Vercel)

Dự án đã được cấu hình sẵn để deploy lên Vercel chỉ với 1 câu lệnh:

```bash
make deploy
```
*Lưu ý: Yêu cầu cài đặt Vercel CLI (`npm install -g vercel`) và đã `vercel login`.*

---

## 📚 Cơ sở pháp lý cập nhật (2026)
- **Lương tối thiểu vùng**: Áp dụng mức mới theo NĐ 293/2025 (Vùng I: 5.31tr, Vùng II: 4.73tr, ...).
- **Thuế TNCN**: Áp dụng biểu thuế 5 bậc (5% - 35%) theo Luật 109/2025/QH15.
- **Giảm trừ gia cảnh**: Theo Nghị quyết 110/2025/UBTVQH15.

---

## 💻 Công nghệ sử dụng
- **Core**: Vue 3 (Composition API)
- **Tooling**: Vite
- **Styling**: Vanilla CSS (Premium Dark Theme)
- **Deployment**: Vercel

---

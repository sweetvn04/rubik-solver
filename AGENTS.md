# AGENTS.md — WORKSPACE INSTRUCTIONS & RULES

> **Context:** Dự án Rubik 3D Interactive Guide & Solver theo phương pháp **Roux**, phong cách đồ họa thủ công kết hợp cảm hứng từ phim ngắn [*Scrambled*](https://www.youtube.com/watch?v=F07x_n4iB34) và game [*Deliver on a planet (Messenger)*](https://messenger.abeto.co/).

---

## 🤖 MANDATORY AGENT BEHAVIOR RULES

Mọi AI Agent khi làm việc trong repository này **BẮT BUỘC** tuân thủ các quy tắc sau:

### 1. Nhật ký lệnh bắt buộc (`COMMAND_LOG.md`)
* Mọi lệnh terminal được thực thi thông qua công cụ (`run_command`) đều **PHẢI ĐƯỢC GHI LẠI NGAY LẬP TỨC** vào file [`COMMAND_LOG.md`](./COMMAND_LOG.md).
* Định dạng ghi nhận gồm:
  - STT & Thời gian (Timestamp).
  - Lệnh chính xác đã chạy.
  - Mục đích / Chức năng kỹ thuật của lệnh.
  - Kết quả thực thi (Exit code / commit hash / chi tiết liên quan).

### 2. Nhật ký thay đổi code bắt buộc (`CHANGELOG.md`)
* Mọi thay đổi mã nguồn (tạo file mới, sửa đổi component/logic, refactor, tối ưu hóa hiệu năng, sửa lỗi bug) đều **PHẢI ĐƯỢC GHI NHẬN CHI TIẾT** vào file [`CHANGELOG.md`](./CHANGELOG.md).
* Định dạng ghi nhận gồm:
  - Thời gian (Timestamp) & Mã commit liên quan.
  - Phạm vi thay đổi (Scope / Feature / Fix).
  - Danh sách các file bị tác động (`Files Changed`).
  - Giải thích nguyên nhân kỹ thuật và chi tiết những gì đã thay đổi.

### 3. Tư duy & Phương pháp làm việc
* **Bite-sized steps:** Chia nhỏ công việc thành các bước micro-step từ 15–30 phút, tránh làm dàn trải gây quá tải ngữ cảnh.
* **Pragmatic execution:** "Done is better than perfect" — ưu tiên nguyên mẫu chạy được trước, sau đó mới tối ưu và refactor.
* **Giải thích trước khi sửa:** Giải thích ngắn gọn nguyên nhân và hướng giải quyết trước khi sửa code quan trọng.

### 4. Tiêu chuẩn Git & Code Quality
* Giữ git working tree sạch sẽ, commit thường xuyên theo chuẩn **Conventional Commits** (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `perf:`, `style:`).
* Sau mỗi thay đổi lớn hoặc hoàn tất một step, chạy kiểm tra biên dịch (`npm run build`) để đảm bảo không có lỗi TypeScript hay Vite build.

### 5. Định hướng Tech Stack & Thẩm mỹ
* **Framework:** Vite + React 19 + TypeScript + TailwindCSS v4.
* **3D Canvas:** Three.js + React Three Fiber (R3F) + `@react-three/drei`.
* **State Management:** Zustand.
* **Visual Style:** Crayon / Art Paper / Stop-motion Claymation (lấy cảm hứng từ *Scrambled*), thân khối bo góc mềm, texture sáp dầu dày dặn, các rãnh chia tầng khít sát, tối ưu tối đa cho cả Desktop và Mobile.
* **Solver Logic:** 100% bám sát phương pháp **Roux** (FB $\rightarrow$ SB $\rightarrow$ CMLL $\rightarrow$ LSE) theo giáo trình `rouxmethodvn`.

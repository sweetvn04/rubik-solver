# AGENTS.md — WORKSPACE INSTRUCTIONS & RULES

> **Context:** Dự án Rubik 3D Interactive Guide & Solver theo phương pháp **Roux**, phong cách đồ họa và âm thanh lấy cảm hứng từ game [*Deliver on a planet (Messenger)*](https://messenger.abeto.co/).

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

### 2. Tư duy & Phương pháp làm việc
* **Bite-sized steps:** Chia nhỏ công việc thành các bước micro-step từ 15–30 phút, tránh làm dàn trải gây quá tải ngữ cảnh.
* **Pragmatic execution:** "Done is better than perfect" — ưu tiên nguyên mẫu chạy được trước, sau đó mới tối ưu và refactor.
* **Giải thích trước khi sửa:** Giải thích ngắn gọn nguyên nhân và hướng giải quyết trước khi sửa code quan trọng.

### 3. Tiêu chuẩn Git & Code Quality
* Giữ git working tree sạch sẽ, commit thường xuyên theo chuẩn **Conventional Commits** (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`).
* Sau mỗi thay đổi lớn hoặc hoàn tất một step, chạy kiểm tra biên dịch (`npm run build`) để đảm bảo không có lỗi TypeScript hay Vite build.

### 4. Định hướng Tech Stack & Thẩm mỹ
* **Framework:** Vite + React 19 + TypeScript + TailwindCSS v4.
* **3D Canvas:** Three.js + React Three Fiber (R3F) + `@react-three/drei`.
* **State Management:** Zustand.
* **Visual Style:** Cozy Toy / Soft Rounded (`RoundedBoxGeometry`), bảng màu Pastel Matte, ánh sáng ấm, âm thanh cơ học tactile (Howler.js). Tránh layout CSS phức tạp.
* **Solver Logic:** 100% bám sát phương pháp **Roux** (FB $\rightarrow$ SB $\rightarrow$ CMLL $\rightarrow$ LSE) theo giáo trình `rouxmethodvn`.

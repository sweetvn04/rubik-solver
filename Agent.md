# AGENT EXECUTION RULES & COMMAND LOG

> **LUẬT BẮT BUỘC CHO AGENT:**  
> Trong toàn bộ quá trình thực hiện dự án này, Agent **PHẢI LIÊN TỤC GHI NHẬN** mọi lệnh terminal được thực thi (khởi tạo, cài đặt package, thao tác Git, build, test, v.v.) vào file này. Mỗi lệnh phải đi kèm mục đích/chức năng rõ ràng và kết quả thực hiện.

---

## 📌 QUY TẮC CẬP NHẬT FILE NÀY

1. **Ghi nhận ngay sau khi chạy:** Bất cứ khi nào gọi công cụ `run_command` để thực thi lệnh trên hệ thống, Agent phải cập nhật dòng lệnh đó vào bảng nhật ký bên dưới.
2. **Thông tin bắt buộc:**
   - **Thời gian (Timestamp):** Thời điểm thực thi.
   - **Lệnh (Command):** Chuỗi lệnh chính xác đã chạy.
   - **Chức năng / Mục đích:** Giải thích ngắn gọn tác dụng kỹ thuật của lệnh.
   - **Kết quả:** Thành công (Exit code 0) hoặc lỗi (nếu có) và cách khắc phục.
3. **Phân loại giai đoạn:** Gom nhóm theo từng Phase phát triển tương ứng với `plan.md`.

---

## 📜 NHẬT KÝ LỆNH ĐÃ THỰC THI (COMMAND LOG)

### Phase 0: Setup Project & Cozy Base

| # | Thời gian (Local) | Lệnh đã thực thi | Chức năng / Mục đích | Kết quả |
|---|-------------------|------------------|----------------------|---------|
| 1 | 2026-10-08 23:28 | `node -v && npm -v` | Kiểm tra phiên bản Node.js và npm có sẵn trên môi trường Linux | Node v26.10.0, npm 12.2.0 |
| 2 | 2026-10-08 23:28 | `which pnpm yarn bun 2>/dev/null \|\| true` | Kiểm tra xem hệ thống có cài đặt sẵn package manager khác (pnpm, yarn, bun) hay không | Chỉ có npm |
| 3 | 2026-10-08 23:29 | `npx --yes create-vite@latest --help` | Đọc danh sách cờ lệnh hỗ trợ của `create-vite` (chế độ `--no-interactive`) | Tìm ra cờ non-interactive |
| 4 | 2026-10-08 23:29 | `npx --yes create-vite@latest tmp-vite --template react-ts --no-interactive && cp -r tmp-vite/. . && rm -rf tmp-vite` | Khởi tạo khung dự án Vite + React + TypeScript vào thư mục tạm, sao chép sang thư mục gốc để bảo toàn file `plan.md` | Hoàn thành, sinh ra project Vite sạch |
| 5 | 2026-10-08 23:29 | `npm info @react-three/fiber peerDependencies` | Kiểm tra tính tương thích của `@react-three/fiber` với React 19 | R3F hỗ trợ chính thức `>=19 <19.4` |
| 6 | 2026-10-08 23:29 | `npm info tailwindcss version` | Kiểm tra phiên bản mới nhất của Tailwind CSS | Tailwind v4.3.3 |
| 7 | 2026-10-08 23:29 | `npm install --fetch-retries=5 --fetch-retry-factor=2 three @react-three/fiber @react-three/drei zustand howler lucide-react` | Cài đặt các thư viện phụ thuộc chính: 3D engine (Three.js, R3F, Drei), State management (Zustand), Audio (Howler) và Icons (Lucide) | Thành công (added 63 packages) |
| 8 | 2026-10-08 23:30 | `npm install -D --fetch-retries=5 @types/three @types/howler tailwindcss @tailwindcss/vite` | Cài đặt các thư viện dev: Type definitions cho Three.js và Howler, Tailwind CSS v4 kèm plugin Vite | Thành công (added 18 packages) |
| 9 | 2026-10-08 23:30 | `rm -f src/App.css` | Xóa stylesheet mặc định của template Vite để tránh xung đột với Tailwind CSS | Xóa thành công |
| 10 | 2026-10-08 23:30 | `mkdir -p src/components/cube src/components/ui src/data/lessons src/engine/solver src/hooks src/store src/types public/audio` | Khởi tạo cấu trúc các thư mục mã nguồn theo chuẩn kiến trúc đã định trong `plan.md` | Thư mục được tạo đầy đủ |
| 11 | 2026-10-08 23:31 | `npm run build` | Kiểm tra biên dịch TypeScript (`tsc -b`) và đóng gói Vite (`vite build`) toàn bộ dự án | Build thành công trong 694ms |
| 12 | 2026-10-08 23:31 | `git init && git add . && git commit -m "feat: scaffold cozy 3D base with Vite, R3F and TailwindCSS"` | Khởi tạo local git repository và thực hiện commit đầu tiên theo chuẩn Conventional Commits | Initial commit `4367dc0` |

---

### Phase 1: Cozy 3D Cube Model (Đang chờ thực hiện)

*(Các lệnh của Phase 1 sẽ tiếp tục được ghi nối tiếp vào đây...)*

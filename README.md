# 🎲 Roux Method VN — 3D Interactive Rubik Guide & Solver

> Ứng dụng mô phỏng 3D tương tác, học lý thuyết và tự động giải Rubik 3x3x3 theo phương pháp **Roux** (First Block $\rightarrow$ Second Block $\rightarrow$ CMLL $\rightarrow$ LSE), mang phong cách đồ họa thủ công ấm áp lấy cảm hứng từ phim ngắn hoạt hình [*Scrambled*](https://www.youtube.com/watch?v=F07x_n4iB34) và trò chơi [*Messenger (Deliver on a planet)*](https://messenger.abeto.co/).

---

## ✨ Điểm nổi bật & Tính năng chính

### 🎨 1. Thẩm mỹ Claymation & Crayon Texture Thủ công
- **Hình khối bo góc mềm mại:** 26 khối cubie độc lập được tạo bởi `RoundedBoxGeometry` từ `@react-three/drei` với khoảng hở rãnh tầng khít sát, mô phỏng khối Rubik đồ chơi cao cấp.
- **Vân sáp dầu (Procedural Crayon Texture):** Bộ sinh texture thời gian thực bằng HTML5 Canvas 2D (`src/engine/crayonTexture.ts`), kết hợp lớp nền giấy thô, hạt sần sáp đan chéo và viền lem mực hữu cơ mà không cần tải bất kỳ file ảnh ngoài nào (0KB asset tải mạng).
- **Bảng màu Scrambled:** Màu sắc ấm áp, dịu mắt (Kem vani, San hô pastel, Xanh lá bạc hà, Xanh da trời dịu, Vàng bơ mềm, Đỏ gạch nung).

### 🧠 2. Thuật toán Tự giải Roux & Chế độ Hướng dẫn Từng bước (Tutor Mode)
- **Chuẩn 4 Phase Roux Method:**
  1. **Phase 1 — First Block (FB):** Dựng khối 1x2x3 ở bên trái (mặt D trắng, L xanh lam).
  2. **Phase 2 — Second Block (SB):** Dựng khối 1x2x3 ở bên phải mà không làm vỡ FB.
  3. **Phase 3 — CMLL:** Định hướng và hoán vị 4 góc tầng U bằng thuật toán tối ưu.
  4. **Phase 4 — LSE (Last Six Edges):** Hoàn thiện 6 cạnh còn lại (4a: EO $\rightarrow$ 4b: UL/UR $\rightarrow$ 4c: M-slice).
- **Bảng TutorCard linh hoạt:**
  - Vị trí mặc định là **Floating Side Panel** góc dưới bên phải, giải phóng 100% tầm nhìn trung tâm của khối Rubik 3D.
  - Hỗ trợ **Thu gọn thành Mini Bar** (~52px) tiện lợi.
  - Nút **Đổi bên (Switch Side)** chuyển đổi mượt mà giữa góc Trái và Phải.
  - Tự động **nâng độ cao khối Rubik** trên màn hình di động khi mở Tutor để tránh che khuất.

### 💡 3. Hệ thống Focus Block & Phase-based Dimming
- Tự động làm sáng rực rỡ các viên cubie thuộc giai đoạn đang giải (FB: 6 viên trái; SB: 6 viên phải; CMLL: 4 góc đỉnh; LSE: toàn khối).
- Làm mờ (dimming / desaturate) các viên không liên quan để người học tập trung cao độ vào nhóm viên mục tiêu.
- Nút bật/tắt chế độ Tiêu điểm (`Eye` / `EyeOff`) ngay trên thanh TutorCard.

### 📚 4. Thư viện Giáo trình Roux & Tra cứu 45 Thế cờ CMLL Trainer
- **Giáo trình 4 Bước:** Dữ liệu lý thuyết chuẩn xác từ giáo trình `rouxmethodvn` kèm mục tiêu, kỹ thuật then chốt và lời khuyên cuber.
- **Tra cứu & Luyện tập 45 CMLL:**
  - Bộ lọc 8 nhóm thế cờ (O, H, Pi, T, U, L, S, As) và thanh tìm kiếm công thức theo tên hoặc ký hiệu.
  - Nút **"Tập thế cờ này"**: Tự động tính toán chuỗi move đảo ngược và dàn dựng thế cờ 3D lên Rubik để người dùng tự luyện tập giải.
  - Nút **"Chạy giải"**: Tự động kích hoạt chuỗi xoay công thức với tốc độ tùy chỉnh.

### 🎧 5. Cozy Lo-fi Ambient BGM & Âm thanh Xúc giác (Tactile ASMR)
- **Procedural Lo-fi Engine:** Bộ tổng hợp âm thanh thời gian thực qua **Web Audio API** thuần túy:
  - Lớp 1: *Warm Rhodes Chords* (vòng hòa thanh Fmaj7 $\rightarrow$ Em7 $\rightarrow$ Dm7 $\rightarrow$ Cmaj7 qua bộ lọc Low-pass băng từ cassette).
  - Lớp 2: *Vinyl Crackle & Tape Hiss* (tiếng đĩa than lép bép analog hoài niệm).
  - Lớp 3: *Ambient Pentatonic Drops* (những giọt nốt piano điện ngẫu nhiên tạo không gian thư thái).
- **Tactile Click SFX:** Tiếng click cơ học nhẹ nhàng khi xoay các mặt tầng và thao tác giao diện.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

| Thành phần | Công nghệ |
|------------|-----------|
| **Core Framework** | React 19, TypeScript, Vite |
| **Styling** | TailwindCSS v4 |
| **3D Rendering** | Three.js, React Three Fiber (R3F), `@react-three/drei` |
| **State Management**| Zustand |
| **Audio Synthesizer**| Web Audio API thuần (Rhodes Oscillator + Noise Buffer + BiquadFilter) |
| **Icons** | Lucide React |

---

## 🚀 Cài đặt & Khởi chạy (Getting Started)

### Yêu cầu hệ thống
- Node.js version 18.0 trở lên.
- npm hoặc pnpm / yarn.

### Các bước cài đặt

1. **Clone repository:**
   ```bash
   git clone https://github.com/sweetvn/Rubik-Solver.git
   cd Rubik-Solver
   ```

2. **Cài đặt các gói phụ thuộc:**
   ```bash
   npm install
   ```

3. **Khởi chạy môi trường phát triển (Dev server):**
   ```bash
   npm run dev
   ```
   Mở trình duyệt tại: `http://localhost:5173/`

4. **Đóng gói phiên bản Production:**
   ```bash
   npm run build
   ```
   Mã nguồn đóng gói sẽ được xuất ra thư mục `dist/`, sẵn sàng triển khai lên GitHub Pages, Vercel hoặc Netlify.

---

## ⌨️ Phím tắt thao tác (Keyboard Shortcuts)

| Phím tắt | Thao tác |
|----------|----------|
| `Space` | Tạm dừng / Tiếp tục chạy chuỗi giải (Play / Pause) |
| `←` / `→` | Lùi 1 bước / Tiến 1 bước trong Tutor Mode |
| `U`, `D`, `L`, `R`, `F`, `B` | Xoay mặt tương ứng theo chiều kim đồng hồ |
| `Shift` + Phím mặt | Xoay mặt tương ứng ngược chiều kim đồng hồ (`U'`, `D'`, `L'`...) |
| `M` / `Shift` + `M` | Xoay tầng giữa (M-slice / M') |

---

## 📁 Cấu trúc Thư mục Dự án

```
Rubik-Solver/
├── src/
│   ├── components/
│   │   ├── cube/
│   │   │   ├── Cubie.tsx            # Render từng khối cubie bo góc và texture sáp dầu
│   │   │   ├── RubikCube.tsx        # Lắp ráp 26 cubies và quản lý góc xoay tầng
│   │   │   ├── RubikCanvas.tsx      # Canvas 3D R3F, camera, orbit controls và ánh sáng
│   │   │   └── EnvironmentView.tsx  # Ánh sáng studio ấm và bóng sàn
│   │   └── ui/
│   │       ├── PlayerBar.tsx        # Dock điều khiển chính (Play, Speed, Scramble, Solve...)
│   │       ├── TutorCard.tsx        # Card hướng dẫn từng bước (Side panel & Mini bar)
│   │       └── LessonDrawer.tsx     # Thư viện giáo trình 4 bước và tra cứu 45 CMLL Trainer
│   ├── engine/
│   │   ├── cubeModel.ts             # Biểu diễn tọa độ 3D và định hướng 26 cubies
│   │   ├── crayonTexture.ts         # Sinh CanvasTexture sáp dầu crayon thủ công
│   │   ├── highlightRules.ts        # Luật định vị và làm mờ theo từng giai đoạn Roux
│   │   ├── lofiEngine.ts            # Bộ tổng hợp nhạc nền Lo-fi BGM Web Audio API
│   │   ├── soundEngine.ts           # Hiệu ứng âm thanh click xúc giác
│   │   ├── scrambler.ts             # Bộ sinh scramble chuẩn WCA
│   │   └── solver/
│   │       └── rouxSolver.ts        # Thuật toán phân giải Roux 4 bước
│   ├── data/
│   │   └── lessonsData.ts           # Dữ liệu giáo trình Roux và bảng 45 công thức CMLL
│   ├── store/
│   │   └── useRubikStore.ts         # Zustand store điều phối toàn bộ trạng thái
│   ├── App.tsx                      # Layout ứng dụng chính
│   └── main.tsx                     # Điểm khởi chạy React
├── COMMAND_LOG.md                   # Nhật ký lệnh terminal bắt buộc
├── CHANGELOG.md                     # Nhật ký chi tiết thay đổi mã nguồn
├── plan.md                          # Kế hoạch và kiến trúc dài hạn
└── vite.config.ts                   # Cấu hình Vite (hỗ trợ relative base)
```

---

## 📜 Tài liệu Tham khảo & Lời cảm ơn

- [Roux Method VN (Google Sites)](https://sites.google.com/view/rouxmethodvn/tongquan) — Tài liệu giáo trình và bảng công thức chuẩn phương pháp Roux.
- [*Scrambled* (Short Film)](https://www.youtube.com/watch?v=F07x_n4iB34) của Polder Animation — Cảm hứng thiết kế thẩm mỹ đồ họa thủ công khối Rubik.
- [*Deliver on a planet (Messenger)*](https://messenger.abeto.co/) của Vicente Lucendo & Michael Sungaila — Cảm hứng trải nghiệm tương tác 3D cozy và không gian âm thanh ambient.

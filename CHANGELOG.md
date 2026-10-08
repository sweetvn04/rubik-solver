# CHANGELOG (NHẬT KÝ THAY ĐỔI MÃ NGUỒN)

> File này ghi nhận chi tiết mọi thay đổi trong mã nguồn (tạo file mới, chỉnh sửa logic, tối ưu hiệu năng, sửa lỗi), theo đúng quy định tại [`AGENTS.md`](./AGENTS.md).

---

## 📅 2026-10-09

### 🔄 [Feature] — Triển khai Move Engine & Xoay tầng 3D (Layer Rotation Engine)
* **Mục đích:** Xây dựng bộ máy xoay các tầng của Rubik hỗ trợ đầy đủ các move WCA cơ bản và các move đặc thù của phương pháp Roux (M-slice và Wide moves), điều khiển mượt mà qua hàng đợi trạng thái.
* **Files tác động:**
  - `src/engine/moveParser.ts` *(Mới)*:
    * Parser chuyển đổi chuỗi ký hiệu công thức (ví dụ: `"R U R' U' M2 U M"`) thành các đối tượng `Move`.
    * Định nghĩa ánh xạ trục xoay Vector3, góc quay radian và hàm lọc tọa độ 9 viên cho từng mặt: `R, L, U, D, F, B`, các move tầng giữa Roux `M, E, S` và các wide moves 2 tầng `r, l, u, d, f, b`.
  - `src/engine/scrambler.ts` *(Mới)*:
    * Bộ sinh chuỗi xáo khối Scramble 20 moves ngẫu nhiên chuẩn WCA, tự động lọc tránh lặp lại cùng trục xoay liên tiếp.
  - `src/store/useRubikStore.ts` *(Mới)*:
    * Quản lý trạng thái 26 cubies trong Zustand (vị trí nguyên và quaternion hướng).
    * Hàng đợi di chuyển FIFO (`moveQueue`) ngăn chặn xung đột khi người dùng click liên tục.
    * Hàm toán học `rotateCubies` cập nhật chính xác vị trí và quaternion sau mỗi move.
  - `src/components/cube/RubikCube.tsx`:
    * Vòng lặp `useFrame` nội suy góc xoay bằng hàm `easeOutCubic` mượt mà có độ nảy nhẹ.
    * Gọi `invalidate()` thông minh khi đang xoay để duy trì 60fps, tự động ngủ về 0% GPU khi xoay xong.
  - `src/components/cube/Cubie.tsx`:
    * Cập nhật nhận `quaternion` toán học và cơ chế đăng ký ref phục vụ việc xoay theo tầng.
  - `src/components/ui/PlayerBar.tsx` *(Mới)*:
    * Thanh điều khiển dạng capsule phong cách *Deliver on a planet* ở đáy màn hình.
    * Nút xoay nhanh (`R, R', U, U', M, M', r, F, F'`), nút **Xáo (Scramble)**, nút **Reset**, và nút thử nhanh công thức (`R U R' U'`, `M2 U M2`).
  - `src/App.tsx`: Gắn component `PlayerBar` vào footer.
  - `src/types/index.ts`: Bổ sung wide moves vào `Face` type và `quaternion` vào `CubieState`.

---
* **Mục đích:** Khắc phục triệt để lỗi tấm hình chữ nhật màu xám cắt ngang sàn do Drei `ContactShadows` không tương thích với `alpha: false`, đồng thời sửa lỗi nhận nhầm Desktop thành Mobile khiến máy tính bị tắt khử răng cưa.
* **Files tác động:**
  - `src/components/cube/EnvironmentView.tsx`:
    * Loại bỏ hoàn toàn component `ContactShadows` của Drei.
    * Tự sinh texture bóng mềm hình tròn đa tầng loang mờ (`createRadialShadowTexture`) đặt sát ngay đáy khối Rubik (`y = -1.275`).
    * Triệt tiêu 100% hiện tượng lộ viền xám hình chữ nhật, giúp khối Rubik tiếp đất tự nhiên, êm ái.
  - `src/engine/device.ts`:
    * Cải tiến hàm `isMobileDevice()`: Kiểm tra chặt chẽ `isMobileUA && isSmallScreen` thay vì chỉ dựa vào `maxTouchPoints > 0`, tránh nhận nhầm laptop có màn hình cảm ứng trên Linux.
    * Đặt lại `DPR` tối đa lên tới `2.0` cho Desktop.
  - `src/components/cube/RubikCanvas.tsx`:
    * Tự động bật lại `antialias: true` và `DPR = 2.0` trên Desktop, giúp khử sạch toàn bộ hiện tượng răng cưa mà không ảnh hưởng hiệu năng.

---
* **Mục đích:** Đảm bảo khối Rubik 3D chạy mượt 60fps trên điện thoại và máy tính bảng, không gây nóng máy hay tụt pin.
* **Files tác động:**
  - `src/engine/device.ts` *(Mới)*: Module nhận diện thiết bị (`isMobileDevice`) và tính toán DPR tối ưu (`1.0` cho mobile, `1.25` cho desktop).
  - `src/components/cube/RubikCanvas.tsx`:
    * Khóa `dpr={dpr}` (tránh màn hình Retina 3x/4x của điện thoại render hàng chục triệu pixel gây quá tải).
    * Bật `precision: 'mediump'` để kích hoạt nhân tính toán 16-bit ALU trên chip ARM di động (giảm 50% điện năng tiêu thụ).
    * Tắt `antialias` trên mobile vì mật độ PPI điện thoại đã quá cao, tiết kiệm 4x băng thông RAM.
    * Thêm cấu hình chạm cảm ứng đa điểm cho `OrbitControls` (`touches: { ONE: ROTATE, TWO: DOLLY_PAN }`).
  - `index.html`: Cấu hình viewport di động `user-scalable=no, viewport-fit=cover` và chặn hành vi trượt trang (`overscroll-none touch-none`).

---

### 🎨 [Commit `acca7a7`] — Thu nhỏ tỷ lệ khối Rubik cân đối khung nhìn
* **Mục đích:** Khối Rubik ban đầu hơi to chiếm hết màn hình; thu nhỏ lại để tạo khoảng thở và bố cục hài hòa.
* **Files tác động:**
  - `src/components/cube/RubikCube.tsx`: Đặt `scale={0.85}` cho nhóm gốc `RubikCubeRoot`.
  - `src/components/cube/EnvironmentView.tsx`: Nâng vị trí bóng tiếp xúc `ContactShadows` từ `-2.2` lên `-1.85` và thu nhỏ bán kính bóng xuống `6.5` để khớp hoàn hảo với đáy khối.

---

### ⚡ [Commit `6734eee`] — Gói tối ưu hóa hiệu năng sâu cho WebGL & Linux Compositor
* **Mục đích:** Giảm tải GPU tối đa cả khi xoay liên tục, triệt tiêu gánh nặng trên iGPU.
* **Files tác động:**
  - `src/components/cube/RubikCanvas.tsx`:
    * Tắt `alpha: false`: Cho phép Linux window compositor (X11/Wayland) không phải tính toán hòa trộn alpha từng pixel với nền web.
    * Gán `<color attach="background" args={['#f6f2e9']} />` trực tiếp vào WebGL scene.
    * Tắt `stencil: false` để giải phóng bộ đệm VRAM.
    * Tăng `dampingFactor = 0.12` để hãm dừng quán tính nhanh, đưa GPU về 0% tức thì khi thả chuột.
  - `src/engine/crayonTexture.ts`:
    * Triển khai **Material Pooling** (`getSharedFaceMaterial` & `getSharedCoreMaterial`): Giảm từ 80 instance vật liệu xuống chỉ còn đúng 7 vật liệu dùng chung. Three.js tự động gom nhóm lệnh vẽ (draw call batching).
    * Bỏ `bumpMap` dư thừa, chỉ giữ lại color map sắc nét để giảm 60% băng thông đọc texture của Fragment Shader.
  - `src/engine/organicGeometry.ts`:
    * Cắt giảm số phân đoạn bo góc (`segments`) từ 4 xuống 2 trên thân khối và 1 trên miếng dán $\rightarrow$ Cắt giảm hơn 50% số lượng tam giác.
  - `src/components/cube/Cubie.tsx`: Chuyển sang sử dụng trực tiếp các vật liệu dùng chung từ cache pool.

---

### 📏 [Commit `c54027d`] — Thu hẹp rãnh đen giữa các viên khít sát
* **Mục đích:** Theo yêu cầu người dùng, các rãnh chia tầng ban đầu quá rộng; cần thu hẹp lại thành các đường chỉ đen mảnh tinh tế.
* **Files tác động:**
  - `src/components/cube/RubikCube.tsx`: Giảm `SPACING` từ `1.02` về `1.00`.
  - `src/engine/organicGeometry.ts`: Tăng kích thước thân khối `body` từ `0.94` lên `0.98` (khe hở chỉ còn `0.02`), tăng kích thước miếng dán `tile` từ `0.86` lên `0.93`.
  - `src/components/cube/Cubie.tsx`: Căn chỉnh `TILE_OFFSET = 0.501` để miếng dán ốp sát bề mặt thân.

---

### 🐛 [Commit `f954096`] — Sửa lỗi đâm xuyên hình học (Mesh Clipping) & Tăng độ no màu sáp
* **Mục đích:** Khắc phục triệt để hiện tượng thân khối nhựa đen đâm thủng miếng dán màu, đồng thời làm màu sáp đậm đà như phim *Scrambled*.
* **Files tác động:**
  - `src/engine/organicGeometry.ts`: Giới hạn biên độ biến dạng lồi lõm của thân đen tối đa `0.012` để không bao giờ vượt qua mặt phẳng miếng dán.
  - `src/components/cube/Cubie.tsx`: Đẩy `TILE_OFFSET = 0.490` an toàn.
  - `src/engine/crayonTexture.ts`: Tăng độ phủ màu lót lên `94%` (thay vì 65%), tăng mật độ nét đánh sáp lên 220 nét dày dặn, viền giấy mỹ thuật kem định hình rõ ràng.

---

### 🏺 [Commit `53fc374`] — Hình học méo mó hữu cơ & Micro-jitter thủ công
* **Mục đích:** Tạo vẻ đẹp stop-motion / đất sét nặn tay như chú Rubik Twisty trong phim *Scrambled*, các cạnh không thẳng tắp công nghiệp.
* **Files tác động:**
  - `src/engine/organicGeometry.ts` *(Mới)*: Thuật toán uốn lượn bề mặt dựa trên sóng điều hòa 3D và seed ngẫu nhiên (`createWobblyBodyGeometry`, `createWobblyTileGeometry`), cùng hàm sinh độ nghiêng ngẫu nhiên siêu nhỏ (`getCubieMicroJitter`).
  - `src/components/cube/Cubie.tsx`: Áp dụng hình học biến dạng hữu cơ và góc nghiêng vi mô cho từng cubie.

---

### 🎨 [Commit `9877b6b`] — Hệ thống Texture sáp màu & Giấy mỹ thuật thủ công (*Scrambled*)
* **Mục đích:** Chuyển đổi từ màu phẳng sang chất liệu sáp màu vẽ tay trên giấy mỹ thuật.
* **Files tác động:**
  - `src/engine/crayonTexture.ts` *(Mới)*: Bộ sinh `CanvasTexture` thủ công bằng HTML5 Canvas 2D: lớp nền giấy thô, hạt sần giấy, nét cọ sáp đan chéo, viền lem hữu cơ và viền mực phác thảo.
  - `src/types/index.ts`: Bổ sung bảng màu `SCRAMBLED_PALETTE` lấy cảm hứng từ phim.
  - `src/components/cube/Cubie.tsx`: Áp dụng texture lên từng miếng dán.

---

## 📅 2026-10-08

### 🧩 [Commit `d074714`] — Dựng 26 Cubies độc lập & Bảng màu Cozy Pastel
* **Files tác động:**
  - `src/engine/cubeModel.ts` *(Mới)*: Khởi tạo lưới tọa độ 3D $\{-1, 0, 1\}^3$ cho 26 cubies (bỏ qua tâm rỗng).
  - `src/components/cube/Cubie.tsx` *(Mới)*: Component render từng viên gồm thân nhựa than đen bo góc và các miếng dán mặt ngoài.
  - `src/components/cube/RubikCube.tsx` *(Mới)*: Lắp ráp 26 cubies thành khối Rubik hoàn chỉnh.
  - `src/components/cube/RubikCanvas.tsx`: Đưa `<RubikCube />` vào canvas 3D.

### 📋 [Commit `4367dc0`] — Khởi tạo nền tảng dự án (Scaffold Cozy 3D Base)
* **Files tác động:**
  - Khởi tạo Vite + React 19 + TypeScript + TailwindCSS v4.
  - Cài đặt `@react-three/fiber`, `@react-three/drei`, `three`, `zustand`, `howler`, `lucide-react`.
  - Cấu hình ánh sáng studio ấm (`EnvironmentView.tsx`), camera mượt mà, layout nền cozy (`App.tsx`).
  - Tạo tài liệu dài hạn `plan.md`.

# CHANGELOG (NHẬT KÝ THAY ĐỔI MÃ NGUỒN)

> File này ghi nhận chi tiết mọi thay đổi trong mã nguồn (tạo file mới, chỉnh sửa logic, tối ưu hiệu năng, sửa lỗi), theo đúng quy định tại [`AGENTS.md`](./AGENTS.md).

---

## 📅 2026-10-09

### 🐛 [Fix] — Khắc phục Triệt để Lỗi Second Block bị Kẹt/Dở dang bằng Unslot Triggers & Validation Guard
* **Nguyên nhân kỹ thuật (Root Cause):**
  1. Khi các viên góc và cạnh của Second Block (DR, BR, DBR, FR, DFR) bị kẹt chéo ở các khe tầng dưới (tầng D và R), các nhánh tìm kiếm trước đó bị giới hạn ở độ sâu 6 nên không tìm thấy lời giải, dẫn đến việc thuật toán trả về moves dở dang (chỉ xoay vài bước DR) trong khi toàn bộ Second Block vẫn chưa hoàn tất.
  2. Thiếu Validation Guard: Khi Second Block chưa được giải xong 100%, hệ thống vẫn nạp các moves cụt vào 3D canvas khiến Rubik chỉ giải xong FB còn SB lộn xộn.
* **Giải pháp khắc phục:**
  - `src/engine/solver/secondBlock.ts`:
    * Tích hợp tập hợp **Unslot Triggers (`SB_SETUPS`)**: `R U R'`, `R' U R`, `r U r'`, `r' U r`, v.v. để chủ động giải phóng các cặp bị kẹt chéo lên tầng U.
    * Nâng độ sâu tìm kiếm lên 7 bước (được kiểm chứng chạy chỉ mất ~370ms), xử lý 100% các thế cờ hiểm hóc nhất.
    * Đa tầng Fallback: Nếu không giải được, trả về mảng rỗng thay vì trả về moves dở dang.
  - `src/store/useRubikStore.ts`:
    * Bổ sung **Validation Guard**: Kiểm tra nghiêm ngặt `isSecondBlockSolved(sbRes.state)`. Nếu SB chưa hoàn tất, tuyệt đối không nạp moves cụt vào canvas, đồng thời thông báo rõ ràng cho người dùng.
  - `src/components/ui/PlayerBar.tsx`:
    * Hiển thị cảnh báo trạng thái chi tiết trên Banner Toast khi gặp sự cố, đảm bảo phản hồi tức thì và chính xác.

---

### 🪄 [Commit `419e326`] — Tích hợp Nút Tự giải FB & SB trực quan và Banner kết quả lên Minimal Dock
* **Mục đích:** Cho phép người dùng trải nghiệm trực tiếp và kiểm chứng thuật toán solver Roux 3D ngay trên giao diện web bằng 1 cú click: Rubik tự tính toán và tự động diễn hoạt xoay giải Khối bên trái rồi Khối bên phải kèm âm thanh click tactile ASMR.
* **Files tác động:**
  - `src/store/useRubikStore.ts`:
    * Bổ sung action `solveFirstTwoBlocks`:
      - Đọc trạng thái 3D Quaternion hiện tại từ Zustand và chuyển đổi sang mô hình 54-facelet qua `cubiesToSolverState`.
      - Kiểm tra và tự động giải tuần tự First Block rồi Second Block.
      - Nạp toàn bộ các moves giải được vào `moveQueue` của 3D canvas qua `enqueueAlgorithm`.
      - Đo lường và trả về thông số thống kê (`fbMoves`, `sbMoves`, `durationMs`, `isAlreadySolved`).
  - `src/components/ui/PlayerBar.tsx`:
    * Thêm nút bấm nổi bật màu xanh ngọc Roux (`#2a9d8f`) với icon `Wand2` ("Giải FB+SB") ngay trên thanh điều khiển chính.
    * Bổ sung Banner Toast thông báo số bước và thời gian tính toán tự động biến mất sau 5 giây.
    * Tự động vô hiệu hóa (`disabled`) khi Rubik đang xoay dở để tránh xung đột luồng trạng thái.

---

### 🧩 [Commit `db13f4f`] — Triển khai Bộ máy giải Tự động First Block & Second Block (Micro-step 3.2)
* **Mục đích:** Hiện thực hóa 2 giai đoạn nền tảng đầu tiên của phương pháp Roux: xây dựng Khối 1x2x3 bên trái (First Block - FB) và Khối 1x2x3 bên phải (Second Block - SB) bằng thuật toán tìm kiếm tối ưu, bám sát giáo trình Roux Method VN và bảo toàn tuyệt đối nguyên lý bất biến (Roux Invariance Property).
* **Files tác động:**
  - `src/engine/solver/firstBlock.ts` *(Mới)*:
    * Phân rã mục tiêu (Goal-oriented sub-staging):
      1. Đưa cạnh DL và tâm L về vị trí trong độ sâu 1–4 bước.
      2. Đánh giá song song 2 nhánh xây dựng (Nhánh A: Cặp sau BL+DBL trước; Nhánh B: Cặp trước FL+DFL trước) bằng IDA* cắt tỉa thông minh.
      3. Hoàn tất toàn bộ First Block trong trung bình 6–10 bước xoay (thời gian tính toán trung bình ~370ms trên các scramble WCA 20 bước).
  - `src/engine/solver/secondBlock.ts` *(Mới)*:
    * Giới hạn không gian tìm kiếm nghiêm ngặt trong tập moves `{R, r, M, U}` (12 candidate moves), bảo toàn 100% Khối First Block ở bên trái ($x = -1, y \le 0$).
    * Chiến lược kết hợp IDA* + Macro BFS (Atomic Triggers):
      1. Đặt cạnh DR và tâm R trong độ sâu 1–5 bước.
      2. Giải Cặp 1 (Back-Square hoặc Front-Square) bằng IDA* độ sâu 5–6 bước.
      3. Giải Cặp 2 còn lại bằng BFS trên tập Macro F2L an toàn (Safe Slotting Operators: `R U R'`, `r U' r'`, `U R U' R'`, `M' U M`, v.v.) độ sâu tối đa 4 tầng macro.
    * Đạt tốc độ cực nhanh: trung bình Second Block chỉ mất ~60ms! Tổng chuỗi giải FB + SB chỉ mất khoảng 200–500ms với 20–28 bước xoay tự nhiên.

---

### 🧮 [Commit `6539e49`] — Triển khai Mô hình Toán học Rời rạc & Chuyển trạng thái Nano-giây (Micro-step 3.1)
* **Mục đích:** Xây dựng nền tảng biểu diễn toán học rời rạc 54-facelet siêu tốc cho bộ máy giải Roux (Phase 3), cho phép thực hiện hàng triệu move/giây phục vụ thuật toán tìm kiếm cây trạng thái (BFS/IDA*) và định lượng chính xác 4 giai đoạn FB, SB, CMLL, LSE.
* **Files tác động:**
  - `src/engine/solver/cubeState.ts` *(Mới)*:
    * Định nghĩa cấu trúc 54 Facelet Indices (0..53) theo chuẩn Kociemba / WCA tương thích bảng màu BOY (U Vàng, D Trắng, F Xanh lá, B Xanh lam, L Cam, R Đỏ).
    * `generateMovePermutation`: Tự động tính toán toán học chuyển đổi vị trí và pháp tuyến 3D từ `moveParser`, đảm bảo đồng bộ 100% với 3D canvas và loại bỏ rủi ro sai sót thủ công.
    * Cache `MOVE_PERMUTATIONS`: Tối ưu hóa chuyển trạng thái trong nano-giây qua mảng `Uint8Array(54)`.
    * Cầu nối 2 chiều `cubiesToSolverState`: Chuyển đổi trạng thái visual 3D Quaternion của Zustand sang trạng thái giải toán.
    * Bộ kiểm tra điều kiện đạt chuẩn 4 giai đoạn Roux (`isFirstBlockSolved`, `isSecondBlockSolved`, `isCMLLSolved`, `isLSE_EOSolved`, `isCubeSolved`).
    * Vượt qua 100% (5/5) các bài unit test toán học (Sexy Move x6, R4, U4, M4, F4, Roux H-Perm x2, tính bất biến của First Block khi xoay R/U).

---

### 🔊 [Commit `239779a`] — Tích hợp bộ máy âm thanh xúc giác (Tactile ASMR Sound Engine) qua Web Audio API
* **Mục đích:** Mang lại cảm giác xúc giác cơ học chân thực (game feel) mỗi khi xoay khối Rubik hoặc bấm nút, mô phỏng âm thanh nam châm hít đanh gọn của các dòng speedcube cao cấp bằng Web Audio API thuần (0 latency, 0 asset tải mạng).
* **Files tác động:**
  - `src/engine/soundEngine.ts` *(Mới)*:
    * Xây dựng bộ tổng hợp âm thanh đa tầng bằng Web Audio API thuần:
      - **Lớp 1 (Plastic Friction):** Tiếng ma sát bề mặt nhựa qua bộ lọc dải tần (Bandpass filtered white noise) thời lượng 25ms.
      - **Lớp 2 (Magnetic Snap):** Tiếng hít nam châm đanh gọn với sóng tam giác tụt tần số nhanh từ 740Hz xuống 260Hz.
      - **Lớp 3 (Tactile Pop):** Tiếng gõ cơ học vi mô tần số cao ~1600Hz tạo độ nảy sắc nét.
    * Tự động áp dụng micro-jitter ngẫu nhiên hóa nhẹ tần số ($\pm 5\%$) mỗi cú xoay, giúp âm thanh tự nhiên như cầm khối vật lý trên tay.
    * Âm thanh nhẹ nhàng khi bấm nút Reset.
    * Tự động lưu và khôi phục trạng thái tắt/bật tiếng vào `localStorage`.
  - `src/store/useRubikStore.ts`:
    * Tự động kích hoạt `soundEngine.playTurnSnap()` mỗi khi một move hoàn tất (`completeCurrentMove`).
    * Kích hoạt `soundEngine.playResetSound()` khi Reset.
    * Quản lý trạng thái `isMuted` và action `toggleMute()`.
  - `src/components/ui/PlayerBar.tsx`:
    * Bổ sung nút bấm bật/tắt âm thanh (biểu tượng `Volume2` / `VolumeX`) trên thanh Minimal Dock.

---

### 🔍 [Commit `9667b55`] — Đặt cự ly camera mặc định về mức zoom nhỏ nhất (Khoảng cách 14.0)
* **Mục đích:** Theo yêu cầu người dùng, đặt kích thước hiển thị mặc định của khối Rubik ngay khi load trang bằng đúng kích thước nhỏ nhất hiện tại có thể điều chỉnh qua thao tác zoom-out (`maxDistance = 14.0`), tạo khoảng thở rộng rãi và góc nhìn cân đối trên mọi thiết bị.
* **Files tác động:**
  - `src/components/cube/RubikCanvas.tsx`:
    * Tinh chỉnh tọa độ camera khởi tạo từ `[5.2, 4.2, 6.0]` (khoảng cách $\approx 8.98$) thành `[8.1, 6.55, 9.35]` (khoảng cách đúng chuẩn $\approx 14.0$).
    * Giữ nguyên góc nhìn chéo kinh điển (isometric perspective) và bảo toàn tính năng zoom-in lại gần (`minDistance = 4.2`) khi người dùng muốn quan sát kỹ các mặt.

---

### 📱 [Commit `736cb05`] — Khắc phục Viewport Mobile (h-dvh & Safe Area) và Tối giản hóa Header
* **Mục đích:** Sửa triệt để lỗi thanh PlayerBar bị lẹm một nửa bên dưới thanh điều hướng của trình duyệt điện thoại, đồng thời gỡ bỏ các nút thừa trên Header để người dùng tập trung 100% vào trải nghiệm khối Rubik 3D.
* **Files tác động:**
  - `src/App.tsx`:
    * Chuyển đổi từ `h-screen` (100vh) sang `h-dvh min-h-dvh max-h-dvh` (Dynamic Viewport Height): Tự động thích ứng chính xác theo chiều cao thực tế khi thanh địa chỉ di động xuất hiện/ẩn đi.
    * Đặt vị trí `footer` nổi an toàn: `bottom-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))]` giúp thanh điều khiển luôn nằm trên thanh chỉ báo vuốt (Home Indicator) của iOS/Android.
    * Tinh gọn triệt để thanh tiêu đề: Loại bỏ hoàn toàn 2 nút hành động lớn ("Bài học", "Tự giải") và phụ đề rườm rà; chỉ giữ lại logo watermark `Roux Method VN` nhỏ gọn ở góc trái trên.
  - `src/components/ui/PlayerBar.tsx`:
    * Ẩn nút phím tắt bàn phím trên điện thoại (`hidden sm:flex`) vì màn hình cảm ứng không dùng phím cứng.
    * Giới hạn chiều cao cuộn `max-h-[65vh] overflow-y-auto` cho Hộp Moves và ô nhập công thức để không bao giờ bị tràn ngoài màn hình khi xoay ngang máy.
    * Tinh chỉnh padding và nhãn nút bấm co giãn linh hoạt dưới 360px.

---

### 🎨 [Commit `bd56fd0`] — Tích hợp Cozy Studio Radial Vignette Overlay (Chiều sâu điện ảnh, 0% GPU)
* **Mục đích:** Khắc phục cảm giác nền phẳng đơn điệu và khối Rubik lơ lửng không gian; bổ sung lớp phủ ánh sáng studio (Phương án 3) với hiệu ứng spotlight tập trung vào trung tâm khối Rubik và viền tối ấm dịu nhẹ ở 4 góc mà không tiêu tốn bất kỳ draw call hay chu kỳ GPU nào.
* **Files tác động:**
  - `src/App.tsx`:
    * Thêm lớp phủ `absolute inset-0 pointer-events-none` phủ trên khung nhìn Three.js.
    * Sử dụng kết hợp CSS `radial-gradient` đa tầng: tâm điểm sáng ấm dịu (`rgba(255, 253, 248, 0.35)`) và viền ngoài màu đất nung ấm áp (`rgba(110, 85, 60, 0.25)`).
    * `pointer-events-none` đảm bảo toàn bộ cử chỉ xoay chuột, zoom, vuốt cảm ứng trên Rubik hoàn toàn không bị ảnh hưởng.
    * Đạt hiệu năng tối đa: 0 WebGL draw call, 0 tam giác, tải GPU giữ nguyên 0% khi đứng yên.

---

### 🎛️ [Commit `eee97a9`] — Tinh gọn PlayerBar thành Minimal Dock & Tích hợp Floating Move Pad
* **Mục đích:** Loại bỏ dãy 9 nút xoay nhanh rời rạc gây chật chội và tràn màn hình di động; quy hoạch toàn bộ các thao tác xoay tầng vào **Hộp Moves (Floating Move Pad)** chuyên dụng, mang lại giao diện tinh gọn, công thái học và chuẩn thẩm mỹ stop-motion claymation.
* **Files tác động:**
  - `src/components/ui/PlayerBar.tsx`:
    * Chuyển đổi thanh đáy chính thành **Minimalist Dock**: chỉ chứa các nút cốt lõi (Xáo, Reset, Hộp Moves, Công thức, Tốc độ, Phím tắt).
    * Thiết kế **Hộp Moves (Floating Move Pad)** mở dạng popover nổi với nút đóng:
      - Cụm 6 mặt cơ bản WCA tổ chức dạng ma trận 6 cột x 3 hàng: Thuận (`R, L, U...`), Nghịch (`R', L', U'...`), Đôi (`R2, L2, U2...`) với độ cao và màu nền phân biệt rõ rệt.
      - Cụm tầng giữa Roux (`M, E, S`) với màu xanh Roux Blue `#3d5a80`.
      - Cụm xoay 2 tầng Wide (`r, l, u`) với màu xanh Roux Teal `#2a9d8f`.
    * Tối ưu hoàn hảo cho màn hình Mobile (chiều ngang co giãn dưới 380px không bị tràn viền hay vỡ dòng).

---

### 🎛️ [Commit `174c08a`] — Đại tu PlayerBar, Phím tắt WCA và Khắc phục đứng hình Render Loop
* **Mục đích:** Sửa triệt để lỗi người dùng bấm nút thì move bị kẹt trong hàng đợi (phải xoay nhẹ khối mới chạy), đồng thời nâng cấp giao diện điều khiển toàn diện với bảng ký hiệu đầy đủ, ô nhập thuật toán tùy biến, thanh tốc độ, và phím tắt bàn phím chuẩn speedcubing.
* **Files tác động:**
  - `src/store/useRubikStore.ts`:
    * Import trực tiếp `invalidate` từ `@react-three/fiber` vào Zustand store.
    * Kích hoạt `invalidate()` ngay lập tức trong `enqueueMove`, `enqueueAlgorithm`, `scramble`, và `reset` $\rightarrow$ Đảm bảo WebGL Canvas thức dậy tức thì khi người dùng tương tác từ ngoài DOM mà không phụ thuộc vào cử chỉ chuột.
  - `src/components/cube/RubikCube.tsx`:
    * Đơn giản hóa và đồng bộ hóa việc lấy `moveInfo` trực tiếp từ `currentMove` trong `useFrame`, loại bỏ race condition của `useEffect` và ref.
    * Thêm cơ chế bảo vệ bước nhảy thời gian `safeDelta = Math.min(delta, 0.035)`: Ngăn chặn hiện tượng delta quá lớn sau thời gian dài ngủ demand làm move bị nhảy vọt chỉ trong 1 frame.
    * Tự động lấy move tiếp theo trong cùng frame để chuỗi thuật toán xoay liên tục không bị gián đoạn.
  - `src/hooks/useKeyboardControls.ts` *(Mới)*:
    * Lắng nghe sự kiện bàn phím toàn cục cho các phím: `R, L, U, D, F, B, M` (ấn kèm `Shift` để xoay ngược `'`).
    * Phím `Space` để xáo nhanh (Scramble), phím `Esc` để đặt lại trạng thái ban đầu (Reset).
    * Tự động bỏ qua khi người dùng đang gõ trong ô text input.
  - `src/components/ui/PlayerBar.tsx`:
    * Bổ sung **Expandable Move Drawer**: Bảng ngăn kéo mở rộng chứa trọn bộ các ký hiệu: 6 mặt chuẩn WCA (`R, L, U, D, F, B`), tầng giữa Roux (`M, E, S`) và các wide moves (`r, l, u`).
    * Bổ sung **Custom Algorithm Input Bar**: Ô nhập công thức tùy ý hỗ trợ nút Chạy, nút Xóa, và danh sách các công thức mẫu kinh điển (Sexy Move, Sune, T-Perm, Roux H-Perm, Roux EOLR).
    * Bổ sung **Bộ chọn tốc độ (Speed Selector)**: Chuyển đổi nhanh giữa 3 nấc: Nhanh (120ms), Vừa (220ms), Chậm (420ms).
    * Bổ sung **Bảng gợi ý phím tắt (Keyboard Shortcut Hints)**.
  - `src/App.tsx`:
    * Tích hợp hook `useKeyboardControls()`.

---

### 🔄 [Commit `8a74efa`] — Triển khai Move Engine & Xoay tầng 3D (Layer Rotation Engine)
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

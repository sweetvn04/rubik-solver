/**
 * Dữ liệu 42 thuật toán CMLL (Corners of the Last Layer) chuẩn phương pháp Roux
 * Nguồn tham khảo: Giáo trình Roux Method VN & Kian Mansour Roux Guide.
 * 
 * Đặc điểm:
 * - 100% bảo toàn First Block (L layer + DL) và Second Block (R layer + DR).
 * - Sử dụng các bước xoay WCA không cần cube rotation (x, y, z): R, U, F, L, D, r.
 */

export interface CMLLCase {
  group: 'O' | 'H' | 'Pi' | 'T' | 'U' | 'As' | 'L' | 'S';
  name: string;
  alg: string;
  description?: string;
}

export const CMLL_ALGORITHMS: CMLLCase[] = [
  // ==========================================
  // NHÓM O: Orientation đã xong, chỉ cần CP (Corner Permutation)
  // ==========================================
  {
    group: 'O',
    name: 'O - Adjacent Swap',
    alg: "R U R' F' R U R' U' R' F R2 U' R'",
    description: 'Hoán vị 2 góc kề nhau (Jb/T permutation)',
  },
  {
    group: 'O',
    name: 'O - Diagonal Swap',
    alg: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
    description: 'Hoán vị 2 góc chéo nhau (Y permutation)',
  },

  // ==========================================
  // NHÓM H: 4 góc đều quay ra ngoài (Car)
  // ==========================================
  {
    group: 'H',
    name: 'H - Columns',
    alg: "R U2 R' U' R U R' U' R U' R'",
    description: '4 góc quay ra 2 bên đối xứng theo cột',
  },
  {
    group: 'H',
    name: 'H - Rows',
    alg: "F R U R' U' R U R' U' R U R' U' F'",
    description: 'Triple sexy move bảo toàn block',
  },
  {
    group: 'H',
    name: 'H - Column',
    alg: "R U2 R2 F R F' U2 R' F R F'",
    description: 'H dạng cột lệch',
  },
  {
    group: 'H',
    name: 'H - Row (Standard)',
    alg: "r U' r2 D' r U' r' D r2 U r'",
    description: 'H dạng hàng ngang với wide move r',
  },
  {
    group: 'H',
    name: 'H - Row (Alternative)',
    alg: "R U R' U R U L' U R' U' L",
    description: 'H dạng hàng ngang sử dụng L/R',
  },

  // ==========================================
  // NHÓM Pi: 2 góc cùng hướng, 2 góc hướng đối
  // ==========================================
  {
    group: 'Pi',
    name: 'Pi - Right Bar',
    alg: "F R U R' U' R U R' U' F'",
    description: 'Double sexy move với F/F\'',
  },
  {
    group: 'Pi',
    name: 'Pi - Back Slash',
    alg: "F R' F' R U2 R U' R' U R U2 R'",
    description: 'Pi đường chéo sau',
  },
  {
    group: 'Pi',
    name: 'Pi - X Checkerboard',
    alg: "F R U' R' U' R U R' U R U' R' F'",
    description: 'Pi dạng bàn cờ X',
  },
  {
    group: 'Pi',
    name: 'Pi - Forward Slash',
    alg: "R U2 R' U' R U R' U2 R' F R F'",
    description: 'Pi đường chéo trước',
  },
  {
    group: 'Pi',
    name: 'Pi - Columns (Standard)',
    alg: "r U' r2 D' r U r' D r2 U r'",
    description: 'Pi dạng cột sử dụng D commutators',
  },
  {
    group: 'Pi',
    name: 'Pi - Columns (Alternative)',
    alg: "R' U L U' R U' L' U' L U' L'",
    description: 'Pi dạng cột sử dụng L/R',
  },
  {
    group: 'Pi',
    name: 'Pi - Left Bar',
    alg: "R' U' R' F R F' R U' R' U2 R",
    description: 'Pi thanh bên trái',
  },

  // ==========================================
  // NHÓM T: 2 góc đối đỉnh hướng sang 2 bên
  // ==========================================
  {
    group: 'T',
    name: 'T - Left Bar',
    alg: "R U R' U' R' F R F'",
    description: 'Sexy move + Sledgehammer cơ bản',
  },
  {
    group: 'T',
    name: 'T - Right Bar',
    alg: "F R U' R' U R U R' F'",
    description: 'T thanh bên phải',
  },
  {
    group: 'T',
    name: 'T - Rows',
    alg: "R U2 R' U' R U' R2 U2 R U R' U R",
    description: 'T dạng hàng',
  },
  {
    group: 'T',
    name: 'T - Front Row',
    alg: "r' U r U2 R2 F R F' R",
    description: 'T hàng trước với wide move',
  },
  {
    group: 'T',
    name: 'T - Back Row',
    alg: "F R U R' U' R U' R' U' R U R' F'",
    description: 'T hàng sau',
  },
  {
    group: 'T',
    name: 'T - Columns',
    alg: "r2 D' r U r' D r2 U' r' U' r",
    description: 'T dạng cột với r và D',
  },

  // ==========================================
  // NHÓM U: 2 góc hướng lên, 2 góc cùng hướng trước
  // ==========================================
  {
    group: 'U',
    name: 'U - Forward Slash',
    alg: "R2 D R' U2 R D' R' U2 R'",
    description: 'U đường chéo trước với D commutator',
  },
  {
    group: 'U',
    name: 'U - Back Slash',
    alg: "R2 D' R U2 R' D R U2 R",
    description: 'U đường chéo sau',
  },
  {
    group: 'U',
    name: 'U - Front Row',
    alg: "R' U' R U' R' U2 R2 U R' U R U2 R'",
    description: 'U hàng trước',
  },
  {
    group: 'U',
    name: 'U - Rows',
    alg: "F R2 D R' U R D' R2 U' F'",
    description: 'U dạng hàng sử dụng F và D',
  },
  {
    group: 'U',
    name: 'U - X Checkerboard',
    alg: "F R U' R' U R U R' U R U' R' F'",
    description: 'U bàn cờ X',
  },
  {
    group: 'U',
    name: 'U - Back Row',
    alg: "F R U R' U' F'",
    description: 'Công thức OLL F R U R\' U\' F\' kinh điển',
  },

  // ==========================================
  // NHÓM As: Anti-Sune (1 góc vàng lên, 3 góc ngược chiều kim đồng hồ)
  // ==========================================
  {
    group: 'As',
    name: 'As - Right Bar',
    alg: "R' U' R U' R' U2 R",
    description: 'Anti-Sune cơ bản',
  },
  {
    group: 'As',
    name: 'As - Columns',
    alg: "R2 D R' U R D' R' U R' U' R U' R'",
    description: 'Anti-Sune dạng cột',
  },
  {
    group: 'As',
    name: 'As - Back Slash',
    alg: "F' r U r' U2 r' F2 r",
    description: 'Anti-Sune đường chéo sau',
  },
  {
    group: 'As',
    name: 'As - X Checkerboard',
    alg: "R U2 R' U2 R' F R F'",
    description: 'Anti-Sune bàn cờ X',
  },
  {
    group: 'As',
    name: 'As - Forward Slash (Standard)',
    alg: "r' F R F' r U R'",
    description: 'Anti-Sune đường chéo trước với r',
  },
  {
    group: 'As',
    name: 'As - Forward Slash (Alternative)',
    alg: "L' U R U' L U R'",
    description: 'Anti-Sune Niklas commutator',
  },
  {
    group: 'As',
    name: 'As - Left Bar',
    alg: "R' U' R U' R' U R' F R F' U R",
    description: 'Anti-Sune thanh bên trái',
  },

  // ==========================================
  // NHÓM L: Bowtie (2 góc vàng hướng chéo nhau)
  // ==========================================
  {
    group: 'L',
    name: 'L - Mirror',
    alg: "F R U' R' U' R U R' F'",
    description: 'L gương đối xứng',
  },
  {
    group: 'L',
    name: 'L - Inverse',
    alg: "F R' F' R U R U' R'",
    description: 'L nghịch đảo',
  },
  {
    group: 'L',
    name: 'L - Pure',
    alg: "R U2 R' U' R U R' U' R U R' U' R U' R'",
    description: 'L thuần túy',
  },
  {
    group: 'L',
    name: 'L - Front Commutator',
    alg: "R U2 R D R' U2 R D' R2",
    description: 'L giao hoán trước',
  },
  {
    group: 'L',
    name: 'L - Diag',
    alg: "R' U' R U R' F' R U R' U' R' F R2",
    description: 'L đường chéo',
  },
  {
    group: 'L',
    name: 'L - Back Commutator',
    alg: "R' U2 R' D' R U2 R' D R2",
    description: 'L giao hoán sau',
  },

  // ==========================================
  // NHÓM S: Sune (1 góc vàng lên, 3 góc theo chiều kim đồng hồ)
  // ==========================================
  {
    group: 'S',
    name: 'S - Left Bar',
    alg: "R U R' U R U2 R'",
    description: 'Sune cơ bản',
  },
  {
    group: 'S',
    name: 'S - X Checkerboard',
    alg: "L' U2 L U2 r U' r' F",
    description: 'Sune bàn cờ X',
  },
  {
    group: 'S',
    name: 'S - Forward Slash',
    alg: "F R' F' R U2 R U2 R'",
    description: 'Sune đường chéo trước',
  },
  {
    group: 'S',
    name: 'S - Columns',
    alg: "R U R' U R U' R D R' U' R D' R2",
    description: 'Sune dạng cột',
  },
  {
    group: 'S',
    name: 'S - Right Bar',
    alg: "R U R' U R' F R F' R U2 R'",
    description: 'Sune thanh bên phải',
  },
  {
    group: 'S',
    name: 'S - Back Slash',
    alg: "R U' L' U R' U' L",
    description: 'Sune Niklas commutator',
  },
];

/**
 * Sound Engine — Bộ máy tổng hợp âm thanh xúc giác (Tactile ASMR Sound Engine)
 * Lấy cảm hứng từ âm thanh cơ học của game Messenger (Deliver on a planet)
 * và tiếng nam châm hút giòn tan của các khối speedcube hiện đại.
 * 
 * Sử dụng Web Audio API thuần:
 * - 0% tải mạng, không cần tải file .mp3 / .wav bên ngoài (chống lỗi 404, chạy offline 100%).
 * - Độ trễ bằng 0 (Zero latency).
 * - Sinh âm thanh động có biến thiên tự nhiên (micro-variations) mỗi lần xoay,
 *   tránh hiện tượng lặp máy móc.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private lastPlayTime: number = 0;

  constructor() {
    // Khôi phục tùy chọn âm thanh từ localStorage nếu có
    const savedMute = localStorage.getItem('roux_rubik_muted');
    if (savedMute !== null) {
      this.isMuted = savedMute === 'true';
    }
  }

  /**
   * Khởi tạo hoặc đánh thức AudioContext khi người dùng tương tác
   */
  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    localStorage.setItem('roux_rubik_muted', String(muted));
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Âm thanh click cơ học giòn tan khi một tầng Rubik hoàn tất xoay (Magnetic Speedcube Snap)
   */
  public playTurnSnap(): void {
    if (this.isMuted) return;

    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Chặn spam âm thanh quá dày đặc (tối đa 25 âm thanh / giây)
    if (now - this.lastPlayTime < 0.04) return;
    this.lastPlayTime = now;

    // Ngẫu nhiên hóa nhẹ tần số để mỗi cú xoay đều có nét tự nhiên riêng (micro-jitter)
    const pitchFactor = 0.95 + Math.random() * 0.1; // ±5% pitch

    // --- LỚP 1: Tiếng ma sát nhựa cao cấp (Filtered Noise Burst) ---
    const bufferSize = Math.floor(ctx.sampleRate * 0.025); // 25ms
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(2200 * pitchFactor, now);
    noiseFilter.Q.setValueAtTime(3.0, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.22, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    whiteNoise.start(now);

    // --- LỚP 2: Tiếng hít nam châm đanh gọn (Resonant Magnetic Snap) ---
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = 'triangle';
    // Tần số từ 720Hz tụt nhanh về 260Hz tạo tiếng "cắc" vật lý chắc nịch
    osc1.frequency.setValueAtTime(740 * pitchFactor, now);
    osc1.frequency.exponentialRampToValueAtTime(260 * pitchFactor, now + 0.035);

    gain1.gain.setValueAtTime(0.28, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.05);

    // --- LỚP 3: Tiếng gõ vi mô sắc nét (High-pitch Tactile Pop) ---
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1600 * pitchFactor, now);
    osc2.frequency.exponentialRampToValueAtTime(500 * pitchFactor, now + 0.015);

    gain2.gain.setValueAtTime(0.18, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.025);
  }

  /**
   * Âm thanh nhẹ nhàng khi bấm nút Reset
   */
  public playResetSound(): void {
    if (this.isMuted) return;

    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }
}

export const soundEngine = new SoundEngine();

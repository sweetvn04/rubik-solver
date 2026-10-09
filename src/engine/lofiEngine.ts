/**
 * Cozy Lo-fi Ambient BGM Engine
 * 
 * Bộ phát nhạc nền Lo-fi thư giãn được tổng hợp hoàn toàn thời gian thực
 * bằng Web Audio API thuần (không cần tải file MP3 nặng, 0% tải mạng, chạy offline).
 * 
 * Cấu trúc âm thanh gồm 3 lớp thư giãn:
 * 1. Warm Electric Piano (Hợp âm Rhodes ấm áp qua bộ lọc Low-pass băng từ cassette).
 * 2. Vinyl Crackle & Tape Hiss (Tiếng đĩa than lép bép hoài niệm của phòng trà).
 * 3. Ambient Pentatonic Drops (Những giọt nốt piano điện thưa thớt, ngân vang tĩnh lặng).
 */

// Vòng hòa thanh Lo-Fi Jazz kinh điển (Fmaj7 -> Em7 -> Dm7 -> Cmaj7)
const CHORDS: number[][] = [
  // Fmaj7: F3, A3, C4, E4
  [174.61, 220.00, 261.63, 329.63],
  // Em7: E3, G3, B3, D4
  [164.81, 196.00, 246.94, 293.66],
  // Dm7: D3, F3, A3, C4
  [146.83, 174.61, 220.00, 261.63],
  // Cmaj7: C3, E3, G3, B3
  [130.81, 164.81, 196.00, 246.94],
];

// Thang âm ngũ cung ấm cho giai điệu ngẫu nhiên
const PENTATONIC_SCALE: number[] = [
  329.63, // E4
  392.00, // G4
  440.00, // A4
  523.25, // C5
  587.33, // D5
  659.25, // E5
];

class LofiBgmEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private vinylGain: GainNode | null = null;
  private timerId: number | null = null;
  private chordIndex: number = 0;
  private currentVolume: number = 0.35;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedPlaying = localStorage.getItem('roux_lofi_playing');
      const savedVol = localStorage.getItem('roux_lofi_volume');
      if (savedVol !== null) {
        this.currentVolume = Math.max(0, Math.min(1, parseFloat(savedVol) || 0.35));
      }
      // Không tự động phát ngay khi khởi tạo vì chính sách Autoplay của trình duyệt yêu cầu click chuột trước
      this.isPlaying = savedPlaying === 'true';
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();

        // Master Gain điều khiển tổng âm lượng
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isPlaying ? this.currentVolume : 0, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getVolume(): number {
    return this.currentVolume;
  }

  public setVolume(vol: number): void {
    this.currentVolume = Math.max(0, Math.min(1, vol));
    if (typeof window !== 'undefined') {
      localStorage.setItem('roux_lofi_volume', String(this.currentVolume));
    }
    if (this.masterGain && this.ctx && this.isPlaying) {
      this.masterGain.gain.setTargetAtTime(this.currentVolume, this.ctx.currentTime, 0.1);
    }
  }

  /**
   * Phát một hợp âm Rhodes ấm áp trong 3.6 giây
   */
  private playChord(freqs: number[], startTime: number): void {
    const ctx = this.ctx;
    const master = this.masterGain;
    if (!ctx || !master) return;

    // Bộ lọc Lowpass mô phỏng độ đục ấm của băng từ (Tape Warmth)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(540, startTime);
    filter.frequency.linearRampToValueAtTime(680, startTime + 1.2);
    filter.frequency.linearRampToValueAtTime(480, startTime + 3.6);
    filter.Q.setValueAtTime(1.5, startTime);
    filter.connect(master);

    const chordGain = ctx.createGain();
    chordGain.gain.setValueAtTime(0.001, startTime);
    // Attack chậm 1.0s, duy trì và decay êm dịu
    chordGain.gain.linearRampToValueAtTime(0.12, startTime + 0.9);
    chordGain.gain.exponentialRampToValueAtTime(0.001, startTime + 3.7);
    chordGain.connect(filter);

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      // Hòa trộn giữa sine (ngọt dịu) và triangle (chút gai của phím Rhodes)
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      // Nhẹ nhàng thêm chút detune ngẫu nhiên để tạo hiệu ứng hợp xướng (chorus/wow & flutter)
      osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 0.8, startTime);

      osc.connect(chordGain);
      osc.start(startTime);
      osc.stop(startTime + 3.8);
    });

    // Thỉnh thoảng thả 1 nốt giai điệu ngẫu nhiên trên cao (Ambient Drop)
    if (Math.random() > 0.35) {
      this.playMelodyNote(startTime + 0.8 + Math.random() * 1.5);
    }
  }

  /**
   * Thả 1 nốt chuông/piano điện ngân vang tĩnh lặng
   */
  private playMelodyNote(startTime: number): void {
    const ctx = this.ctx;
    const master = this.masterGain;
    if (!ctx || !master) return;

    const noteFreq = PENTATONIC_SCALE[Math.floor(Math.random() * PENTATONIC_SCALE.length)];

    const noteGain = ctx.createGain();
    noteGain.gain.setValueAtTime(0.001, startTime);
    noteGain.gain.linearRampToValueAtTime(0.06, startTime + 0.08);
    noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + 2.2);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, startTime);
    filter.connect(master);

    noteGain.connect(filter);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(noteFreq, startTime);

    osc.connect(noteGain);
    osc.start(startTime);
    osc.stop(startTime + 2.3);
  }

  /**
   * Sinh tiếng đĩa than lép bép ấm áp (Vinyl Crackle)
   */
  private startVinylNoise(): void {
    const ctx = this.ctx;
    const master = this.masterGain;
    if (!ctx || !master || this.vinylGain) return;

    const bufferSize = ctx.sampleRate * 2; // 2 giây buffer lặp
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Hạt noise siêu mịn
      const hiss = (Math.random() * 2 - 1) * 0.015;
      // Thỉnh thoảng có hạt bụi đĩa than (dust click)
      const pop = Math.random() > 0.9995 ? (Math.random() - 0.5) * 0.18 : 0;
      data[i] = hiss + pop;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;
    filter.Q.value = 1.0;

    this.vinylGain = ctx.createGain();
    this.vinylGain.gain.setValueAtTime(0.001, ctx.currentTime);
    this.vinylGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 1.5);

    noiseSource.connect(filter);
    filter.connect(this.vinylGain);
    this.vinylGain.connect(master);

    noiseSource.start();
  }

  private tick = (): void => {
    if (!this.isPlaying || !this.ctx) return;

    const now = this.ctx.currentTime;
    const chord = CHORDS[this.chordIndex];
    this.playChord(chord, now);

    this.chordIndex = (this.chordIndex + 1) % CHORDS.length;

    // Mỗi hợp âm kéo dài 3.6 giây
    this.timerId = window.setTimeout(this.tick, 3600);
  };

  public play(): void {
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    this.isPlaying = true;
    if (typeof window !== 'undefined') {
      localStorage.setItem('roux_lofi_playing', 'true');
    }

    // Fade in âm lượng êm dịu 1.0s
    this.masterGain.gain.cancelScheduledValues(ctx.currentTime);
    this.masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(this.currentVolume, ctx.currentTime + 1.2);

    this.startVinylNoise();
    this.chordIndex = 0;
    this.tick();
  }

  public pause(): void {
    this.isPlaying = false;
    if (typeof window !== 'undefined') {
      localStorage.setItem('roux_lofi_playing', 'false');
    }

    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }

    if (this.ctx && this.masterGain) {
      // Fade out âm lượng êm dịu 0.6s
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);
    }

    this.vinylGain = null;
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }
}

export const lofiEngine = new LofiBgmEngine();

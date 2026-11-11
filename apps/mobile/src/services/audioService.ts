type Listener = (trackId: string | null, elapsedSec: number, ratio: number) => void;

class DevotionalAudioService {
  private audioCtx: any = null;
  private currentInterval: any = null;
  private activeTrackId: string | null = null;
  private activeDurationSec = 40;
  private elapsed = 0;
  private listeners: Listener[] = [];

  private initContext() {
    if (typeof window !== 'undefined') {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass && !this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    }
  }

  private playTone(freq = 587.33, duration = 3.5) {
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.22, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch {
      // Ignored
    }
  }

  private playDroneChord() {
    if (!this.audioCtx) return;
    try {
      const notes = [146.83, 220.0, 293.66];
      notes.forEach((freq) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

        gain.gain.setValueAtTime(0.06, this.audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, this.audioCtx.currentTime + 3);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 3);
      });
    } catch {
      // Ignored
    }
  }

  public subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    const ratio = this.activeDurationSec > 0 ? Math.min(this.elapsed / this.activeDurationSec, 1) : 0;
    this.listeners.forEach((l) => l(this.activeTrackId, this.elapsed, ratio));
  }

  /**
   * Play only one track at any time.
   * If another track is currently playing, it is immediately stopped.
   * startFromSec allows resuming from a previous stopped/paused position.
   */
  public playTrack(trackId: string, durationSec = 40, startFromSec = 0) {
    // If this track is already playing, do nothing
    if (this.activeTrackId === trackId) {
      return;
    }

    // Stop whichever track was playing previously
    this.stopTrack();

    this.initContext();
    this.activeTrackId = trackId;
    this.activeDurationSec = durationSec;
    this.elapsed = Math.min(Math.max(0, startFromSec), durationSec);

    this.playTone(trackId === 'suprabatham' ? 587.33 : 440.0, 3.5);
    this.playDroneChord();
    this.notify();

    this.currentInterval = setInterval(() => {
      this.elapsed += 1;
      this.notify();

      if (this.elapsed % 5 === 0) {
        this.playTone(trackId === 'suprabatham' ? 659.25 : 523.25, 3.5);
      }
      if (this.elapsed % 8 === 0) {
        this.playDroneChord();
      }

      if (this.elapsed >= this.activeDurationSec) {
        this.stopTrack();
      }
    }, 1000);
  }

  public getElapsed() {
    return this.elapsed;
  }

  public seekToRatio(ratio: number) {
    if (!this.activeTrackId) return;
    this.elapsed = Math.floor(Math.max(0, Math.min(ratio, 1)) * this.activeDurationSec);
    this.notify();
  }

  public stopTrack() {
    if (this.currentInterval) {
      clearInterval(this.currentInterval);
      this.currentInterval = null;
    }
    const hadTrack = this.activeTrackId !== null;
    this.activeTrackId = null;
    this.elapsed = 0;
    if (hadTrack) {
      this.notify();
    }
  }

  public getActiveTrackId() {
    return this.activeTrackId;
  }
}

export const devotionalAudio = new DevotionalAudioService();

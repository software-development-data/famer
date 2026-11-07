// Audio Engine using Web Audio API for zero-dependency sounds and Vietnamese folk-style BGM

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.bgmGain = null;
        this.sfxGain = null;
        this.isMuted = false;
        this.isBgmPlaying = false;
        this.bgmTimer = null;
        this.bgmStep = 0;
        this.volume = 0.5;
    }

    init() {
        if (this.ctx) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();

        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.value = 0.25;
        this.bgmGain.connect(this.ctx.destination);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = 0.4;
        this.sfxGain.connect(this.ctx.destination);
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.ctx) {
            if (this.isMuted) {
                this.bgmGain.gain.value = 0;
                this.sfxGain.gain.value = 0;
            } else {
                this.bgmGain.gain.value = 0.25;
                this.sfxGain.gain.value = 0.4;
            }
        }
        return this.isMuted;
    }

    startBGM() {
        this.init();
        if (this.isBgmPlaying) return;
        this.isBgmPlaying = true;
        this.playBGMSequence();
    }

    stopBGM() {
        this.isBgmPlaying = false;
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
    }

    // Traditional pentatonic scale melody (Hò Mái Nhì / Điệu Bắc: C, D, F, G, A)
    playBGMSequence() {
        if (!this.isBgmPlaying || !this.ctx || this.isMuted) {
            this.bgmTimer = setTimeout(() => this.playBGMSequence(), 500);
            return;
        }

        const notes = [
            261.63, 293.66, 349.23, 392.00, 440.00, // C4, D4, F4, G4, A4
            523.25, 587.33, 698.46, 783.99, 880.00  // C5, D5, F5, G5, A5
        ];

        // Gentle folk tune pattern
        const melody = [
            { note: notes[2], dur: 0.6 },
            { note: notes[3], dur: 0.4 },
            { note: notes[4], dur: 0.8 },
            { note: notes[5], dur: 0.6 },
            { note: notes[4], dur: 0.4 },
            { note: notes[3], dur: 0.6 },
            { note: notes[2], dur: 1.0 },
            { note: notes[1], dur: 0.4 },
            { note: notes[2], dur: 0.8 },
            { note: notes[3], dur: 0.6 },
            { note: notes[5], dur: 0.6 },
            { note: notes[6], dur: 1.2 },
            { note: notes[5], dur: 0.6 },
            { note: notes[4], dur: 0.6 },
            { note: notes[3], dur: 0.8 },
            { note: notes[0], dur: 1.4 }
        ];

        const item = melody[this.bgmStep % melody.length];
        this.bgmStep++;

        // Flute / Dan Tranh pluck synthesis
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(item.note, this.ctx.currentTime);

            // Pluck envelope
            const now = this.ctx.currentTime;
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + item.dur);

            osc.connect(gain);
            gain.connect(this.bgmGain);

            osc.start(now);
            osc.stop(now + item.dur);

            // Soft bass accompaniment every 4 beats
            if (this.bgmStep % 4 === 1) {
                const bassOsc = this.ctx.createOscillator();
                const bassGain = this.ctx.createGain();
                bassOsc.type = 'triangle';
                bassOsc.frequency.setValueAtTime(item.note / 2, now);
                bassGain.gain.setValueAtTime(0.12, now);
                bassGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
                bassOsc.connect(bassGain);
                bassGain.connect(this.bgmGain);
                bassOsc.start(now);
                bassOsc.stop(now + 1.2);
            }
        } catch (e) {
            console.warn(e);
        }

        const nextDelay = item.dur * 700;
        this.bgmTimer = setTimeout(() => this.playBGMSequence(), nextDelay);
    }

    // Sound Effects
    playClick() {
        if (this.isMuted) return;
        this.init();
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const now = this.ctx.currentTime;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now);
            osc.stop(now + 0.05);
        } catch (e) {}
    }

    playAttack() {
        if (this.isMuted) return;
        this.init();
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(350, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now);
            osc.stop(now + 0.12);
        } catch (e) {}
    }

    playShoot() {
        if (this.isMuted) return;
        this.init();
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(880, now);
            osc.frequency.exponentialRampToValueAtTime(220, now + 0.18);

            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now);
            osc.stop(now + 0.18);
        } catch (e) {}
    }

    playHit() {
        if (this.isMuted) return;
        this.init();
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'square';
            osc.frequency.setValueAtTime(140, now);
            osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

            gain.gain.setValueAtTime(0.35, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now);
            osc.stop(now + 0.08);
        } catch (e) {}
    }

    playCoin() {
        if (this.isMuted) return;
        this.init();
        try {
            const now = this.ctx.currentTime;
            [987.77, 1318.51].forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const time = now + idx * 0.08;

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, time);

                gain.gain.setValueAtTime(0.25, time);
                gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(time);
                osc.stop(time + 0.15);
            });
        } catch (e) {}
    }

    playHarvest() {
        if (this.isMuted) return;
        this.init();
        try {
            const now = this.ctx.currentTime;
            [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const time = now + idx * 0.05;

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, time);

                gain.gain.setValueAtTime(0.2, time);
                gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(time);
                osc.stop(time + 0.2);
            });
        } catch (e) {}
    }

    playLevelUp() {
        if (this.isMuted) return;
        this.init();
        try {
            const now = this.ctx.currentTime;
            const chords = [523.25, 659.25, 783.99, 1046.50, 1318.51];
            chords.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const time = now + idx * 0.07;

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, time);

                gain.gain.setValueAtTime(0.3, time);
                gain.gain.exponentialRampToValueAtTime(0.01, time + 0.35);

                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(time);
                osc.stop(time + 0.35);
            });
        } catch (e) {}
    }

    playTrap() {
        if (this.isMuted) return;
        this.init();
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(700, now);
            osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);

            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now);
            osc.stop(now + 0.15);
        } catch (e) {}
    }

    playSpinTick() {
        if (this.isMuted) return;
        this.init();
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'square';
            osc.frequency.setValueAtTime(1200, now);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now);
            osc.stop(now + 0.03);
        } catch (e) {}
    }
}

export const sound = new SoundEngine();

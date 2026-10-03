/**
 * Procedural Web Audio Sound Synthesizer for Wind Turbine Simulation
 * Synthesizes aerodynamic wind rush, low-frequency 3P blade passing thump,
 * spatial Doppler sweep, and electro-mechanical generator hum.
 */

export class TurbineSoundEngine {
  constructor() {
    this.ctx = null;
    this.isEnabled = false;
    this.isMuted = true;

    // Audio Nodes
    this.masterGain = null;
    this.windGain = null;
    this.windFilter = null;
    this.bladeGain = null;
    this.bladeFilter = null;
    this.thumpGain = null;
    this.thumpOsc = null;
    this.genGain = null;
    this.genOsc = null;
    this.panner = null;

    // Blade passing modulation
    this.bladeModPhase = 0.0;
  }

  /**
   * Initializes Web Audio Context upon user interaction
   */
  init() {
    if (this.ctx) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      // Master output gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

      // Stereo panner for spatial breeze
      if (this.ctx.createStereoPanner) {
        this.panner = this.ctx.createStereoPanner();
        this.masterGain.connect(this.panner);
        this.panner.connect(this.ctx.destination);
      } else {
        this.masterGain.connect(this.ctx.destination);
      }

      // 1. Wind Rush Synth (Filtered Noise Buffer)
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      this.windFilter = this.ctx.createBiquadFilter();
      this.windFilter.type = 'lowpass';
      this.windFilter.frequency.setValueAtTime(420, this.ctx.currentTime);
      this.windFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);

      this.windGain = this.ctx.createGain();
      this.windGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

      whiteNoise.connect(this.windFilter);
      this.windFilter.connect(this.windGain);
      this.windGain.connect(this.masterGain);
      whiteNoise.start(0);

      // 2. 3P Blade Passing Whoosh (Modulated mid-range aero resonance)
      this.bladeGain = this.ctx.createGain();
      this.bladeGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

      this.bladeFilter = this.ctx.createBiquadFilter();
      this.bladeFilter.type = 'bandpass';
      this.bladeFilter.frequency.setValueAtTime(130, this.ctx.currentTime);
      this.bladeFilter.Q.setValueAtTime(3.2, this.ctx.currentTime);

      this.windFilter.connect(this.bladeFilter);
      this.bladeFilter.connect(this.bladeGain);
      this.bladeGain.connect(this.masterGain);

      // 3. Sub-Bass Aeroacoustic Blade Tower-Pass Thump (45 Hz impulse)
      this.thumpOsc = this.ctx.createOscillator();
      this.thumpOsc.type = 'sine';
      this.thumpOsc.frequency.setValueAtTime(45, this.ctx.currentTime);

      this.thumpGain = this.ctx.createGain();
      this.thumpGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

      this.thumpOsc.connect(this.thumpGain);
      this.thumpGain.connect(this.masterGain);
      this.thumpOsc.start(0);

      // 4. Generator & High-Speed Gearbox Meshing Hum
      this.genOsc = this.ctx.createOscillator();
      this.genOsc.type = 'triangle';
      this.genOsc.frequency.setValueAtTime(120, this.ctx.currentTime);

      this.genGain = this.ctx.createGain();
      this.genGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

      this.genOsc.connect(this.genGain);
      this.genGain.connect(this.masterGain);
      this.genOsc.start(0);

      this.isEnabled = true;
    } catch (e) {
      console.warn('Web Audio not supported or blocked:', e);
    }
  }

  toggleSound() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      const targetGain = this.isMuted ? 0.0 : 0.4;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
    }
    return !this.isMuted;
  }

  /**
   * Modulate audio parameters based on real-time turbine physics
   */
  update(physics, dt) {
    if (!this.isEnabled || this.isMuted || !this.ctx) return;

    const t = this.ctx.currentTime;

    // Wind noise scales dynamically with wind velocity
    const windCutoff = 160 + Math.pow(physics.windSpeed / 25.0, 1.8) * 1500;
    this.windFilter.frequency.setTargetAtTime(windCutoff, t, 0.12);

    const windVolume = Math.min(0.42, 0.06 + (physics.windSpeed / 30.0) * 0.36);
    this.windGain.gain.setTargetAtTime(windVolume, t, 0.12);

    // 3P Blade Passing Frequency (3 blades * RPM / 60)
    const bladePassFreq = (3.0 * physics.rotorRpm) / 60.0;
    if (bladePassFreq > 0.05) {
      this.bladeModPhase += bladePassFreq * dt * Math.PI * 2;
      const whooshMod = Math.pow(Math.max(0, Math.sin(this.bladeModPhase)), 3.5);
      const bladeVol = whooshMod * Math.min(0.35, (physics.rotorRpm / 12.0) * 0.32);
      this.bladeGain.gain.setTargetAtTime(bladeVol, t, 0.02);

      // Low frequency tower passing thump
      const thumpMod = Math.pow(Math.max(0, Math.sin(this.bladeModPhase)), 6.0);
      const thumpVol = thumpMod * Math.min(0.25, (physics.rotorRpm / 12.0) * 0.22);
      this.thumpGain.gain.setTargetAtTime(thumpVol, t, 0.02);

      // Subtle stereo pan sweep
      if (this.panner) {
        const panVal = Math.sin(this.bladeModPhase) * 0.35;
        this.panner.pan.setTargetAtTime(panVal, t, 0.05);
      }
    } else {
      this.bladeGain.gain.setTargetAtTime(0.0, t, 0.1);
      this.thumpGain.gain.setTargetAtTime(0.0, t, 0.1);
    }

    // Generator & Gearbox high-speed whine (proportional to generator RPM)
    const genFreq = Math.max(45, (physics.generatorRpm / 1200.0) * 240);
    this.genOsc.frequency.setTargetAtTime(genFreq, t, 0.1);

    const genVol = Math.min(0.14, (physics.powerKw / 4200.0) * 0.12);
    this.genGain.gain.setTargetAtTime(genVol, t, 0.15);
  }
}

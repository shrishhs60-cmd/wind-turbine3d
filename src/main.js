/**
 * Main Application Orchestrator for AeroTurbine 3D
 * Connects Three.js scene, physics engine, UI HUD telemetry,
 * sound engine, Chart.js, and camera controls.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { TurbinePhysicsEngine } from './physicsEngine.js';
import { TurbineBuilder } from './turbineBuilder.js';
import { TurbineSoundEngine } from './soundEngine.js';
import { ChartManager } from './chartManager.js';

class AeroTurbineApp {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.viewportContainer = document.getElementById('viewport-container');

    // Core Systems
    this.physics = new TurbinePhysicsEngine();
    this.sound = new TurbineSoundEngine();

    // Three.js Core
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.builder = null;
    this.chartManager = null;

    // Raycaster for 3D component inspection
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Animation & Timing
    this.clock = new THREE.Clock();
    this.gustTime = 0;
    this.gustFactor = 1.0;
    this.gustsEnabled = true;

    // Camera preset animation target
    this.camTargetPos = null;
    this.camTargetLookAt = null;

    // SCADA Scope: 'turbine' (WTG-01) or 'farm' (8x Ridge Fleet)
    this.scadaScope = 'turbine';
    this.farmListRendered = false;

    // Cinematic Post-Processing Pipeline
    this.composer = null;
    this.bloomPass = null;
    this.bloomEnabled = true;

    // 3D Digital Twin Hotspots
    this.hotspots = [];
    this.hotspotElements = [];
    this.hotspotsEnabled = true;
    this.hotspotsContainer = null;

    // Optical Sun Glare
    this.sunGlareElement = null;

    // Drone Flyover Mode
    this.droneProgress = 0;

    // Live SCADA Operations Event Log
    this.scadaEvents = [
      'WTG-01: Grid Synchronized at 33.0 kV loop · OptiTip active',
      'MET-01: Highland ridge wind shear α = 0.142 logged',
      'FLEET: All 8x SG 5.0-145 units synchronized at 33.0 kV loop',
      'FLEET: Dual ICAO Type B obstruction beacons synchronized',
      'WTG-01: DinoTails trailing-edge acoustic attenuation active',
      'WTG-03: Local wake deficit 4.0% within IEC 61400 limits',
      'SUBSTATION: 33kV collector bus frequency 50.00 Hz · cos φ = 0.99',
      'ENVIRONMENT: Valley cloud sea inversion layer stable at -26m',
      'WTG-01: Pitch bearings calibrated to 0.5° MPPT optimal lift'
    ];
    this.lastEventIndex = 0;
    this.lastEventTime = 0;

    this.init();
  }

  init() {
    this.initThree();
    this.builder = new TurbineBuilder(this.scene, this.renderer);
    this.builder.buildScene();
    this.builder.setTimeOfDay('day');
    this.setCameraPreset('hero');

    this.isRotorPaused = false;
    this.inspectorModeEnabled = false;
    document.body.classList.add('free-view-active');

    this.chartManager = new ChartManager('power-curve-chart', this.physics);

    this.initEventListeners();
    this.initBlueprintModal();
    this.initHotspots();
    this.initSunGlare();
    this.initFullscreen();
    this.initScadaEventLog();

    // Start Animation Loop
    this.animate();
  }

  initThree() {
    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera: Positioned initially for a breathtaking full view of the windmill
    const aspect = this.viewportContainer.clientWidth / this.viewportContainer.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.5, 2000);
    // Initial direct framing centered on the windmill:
    this.camera.position.set(-82.0, 92.0, 118.0);

    // 3. Renderer with tone mapping and shadows
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(this.viewportContainer.clientWidth, this.viewportContainer.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.82; // Balanced exposure to prevent blowout and show full turbine details

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't clip below ground
    this.controls.minDistance = 6.0;
    this.controls.maxDistance = 650.0;
    this.controls.target.set(0.0, 72.0, 0.0); // Perfectly centered on the windmill body & rotor hub
    this.controls.autoRotate = false;
    this.controls.autoRotateSpeed = 0.65;
    this.controls.update();

    this.currentPreset = 'hero';

    // 5. Cinematic Post-Processing Pipeline (Atmospheric Bloom & Photorealism)
    try {
      this.composer = new EffectComposer(this.renderer);
      const renderPass = new RenderPass(this.scene, this.camera);
      this.composer.addPass(renderPass);

      this.bloomPass = new UnrealBloomPass(
        new THREE.Vector2(this.viewportContainer.clientWidth, this.viewportContainer.clientHeight),
        0.12, // Subtle atmospheric bloom strength (reduced from 0.32 so turbine edges stay crisp)
        0.55, // Radius
        0.93  // Threshold (only intense specular highlights and beacons glow, no blinding turbine wash)
      );
      this.composer.addPass(this.bloomPass);

      const outputPass = new OutputPass();
      this.composer.addPass(outputPass);
    } catch (err) {
      console.warn('Post-processing composer init error:', err);
    }
    this.isUserInteracting = false;
    this.lastUserInteractTime = 0;

    this.controls.addEventListener('start', () => {
      this.isUserInteracting = true;
    });
    this.controls.addEventListener('end', () => {
      this.isUserInteracting = false;
      this.lastUserInteractTime = performance.now();
    });

    window.addEventListener('resize', () => this.onWindowResize());
  }

  onWindowResize() {
    if (!this.renderer || !this.camera) return;
    const width = this.viewportContainer.clientWidth;
    const height = this.viewportContainer.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    if (this.composer) {
      this.composer.setSize(width, height);
    }
  }

  /**
   * Set up Camera View Presets
   */
  setCameraPreset(preset) {
    const hubY = 107.0;
    let targetPos, lookAt;
    this.currentPreset = preset;

    switch (preset) {
      case 'hero':
        // Full Windmill viewpoint - perfectly frames the entire turbine from blades to foundation
        targetPos = new THREE.Vector3(-82.0, 92.0, 118.0);
        lookAt = new THREE.Vector3(0.0, 72.0, 0.0);
        this.controls.autoRotate = false;
        break;
      case 'front':
        // Direct frontal elevation view of rotor plane and tower
        targetPos = new THREE.Vector3(0.0, 75.0, 150.0);
        lookAt = new THREE.Vector3(0.0, 72.0, 0.0);
        this.controls.autoRotate = false;
        break;
      case 'side':
        // Side aerodynamic profile view of nacelle, hub tilt, and tower
        targetPos = new THREE.Vector3(-145.0, 75.0, 0.0);
        lookAt = new THREE.Vector3(0.0, 72.0, 0.0);
        this.controls.autoRotate = false;
        break;
      case 'ground':
        // Dramatic low-angle view looking up from the foundation
        targetPos = new THREE.Vector3(-45.0, 10.0, 65.0);
        lookAt = new THREE.Vector3(0.0, 85.0, 0.0);
        this.controls.autoRotate = false;
        break;
      case 'specs':
      case 'ridge':
        // Optimal angle and zoom framing the full single turbine with clear component callouts
        targetPos = new THREE.Vector3(-85.0, 75.0, 115.0);
        lookAt = new THREE.Vector3(0.0, 68.0, 0.0);
        this.controls.autoRotate = false;
        break;
      case 'substation':
        // Dedicated view framing the 33 kV step-up substation, powerhouse building, and basement cable vault
        targetPos = new THREE.Vector3(18.5, 9.2, 14.5);
        lookAt = new THREE.Vector3(5.5, 2.0, 1.5);
        this.controls.autoRotate = false;
        break;
      case 'drone':
        // Cinematic Single Turbine 360° Inspection Orbit
        this.controls.autoRotate = false;
        this.droneProgress = 0;
        targetPos = null;
        lookAt = null;
        break;
      default:
        targetPos = new THREE.Vector3(-82.0, 92.0, 118.0);
        lookAt = new THREE.Vector3(0.0, 72.0, 0.0);
        this.controls.autoRotate = false;
    }

    this.camTargetPos = targetPos;
    this.camTargetLookAt = lookAt;
  }

  /**
   * UI Controls & Listeners
   */
  initEventListeners() {
    // 1. Wind Speed Slider
    const windSlider = document.getElementById('slider-wind-speed');
    const windDisplay = document.getElementById('display-wind-speed');
    const knotsDisplay = document.getElementById('display-wind-knots');
    const topWind = document.getElementById('top-wind-val');

    windSlider.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      this.physics.windSpeed = v;
      windDisplay.textContent = v.toFixed(1);
      knotsDisplay.textContent = `(${(v * 1.94384).toFixed(1)} kts)`;
      topWind.textContent = v.toFixed(1);
      this.updatePresetButtonsActiveState(v);
    });

    // Preset wind speed buttons
    document.querySelectorAll('.preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const v = parseFloat(btn.dataset.wind);
        this.physics.windSpeed = v;
        windSlider.value = v;
        windDisplay.textContent = v.toFixed(1);
        knotsDisplay.textContent = `(${(v * 1.94384).toFixed(1)} kts)`;
        topWind.textContent = v.toFixed(1);
        this.updatePresetButtonsActiveState(v);
      });
    });

    // 2. Wind Direction Slider
    const dirSlider = document.getElementById('slider-wind-dir');
    const dirDisplay = document.getElementById('display-wind-dir');
    const dirCardinal = document.getElementById('display-wind-cardinal');

    dirSlider.addEventListener('input', (e) => {
      const deg = parseFloat(e.target.value);
      this.physics.windDirection = deg;
      dirDisplay.textContent = Math.round(deg);
      dirCardinal.textContent = this.getCardinalDirection(deg);
    });

    // 3. Operating Regime Buttons
    const btnAuto = document.getElementById('btn-mode-auto');
    const btnManual = document.getElementById('btn-mode-manual');
    const manualDrawer = document.getElementById('manual-controls-drawer');
    const modeBadge = document.getElementById('badge-op-mode');

    btnAuto.addEventListener('click', () => {
      this.physics.operatingMode = 'auto';
      btnAuto.classList.add('active');
      btnManual.classList.remove('active');
      manualDrawer.classList.add('hidden');
      modeBadge.textContent = 'AUTO MPPT';
      modeBadge.style.color = '#00f2fe';
    });

    btnManual.addEventListener('click', () => {
      this.physics.operatingMode = 'manual';
      btnManual.classList.add('active');
      btnAuto.classList.remove('active');
      manualDrawer.classList.remove('hidden');
      modeBadge.textContent = 'MANUAL';
      modeBadge.style.color = '#ffb800';
    });

    // Manual Pitch & Yaw Sliders
    const pitchSlider = document.getElementById('slider-manual-pitch');
    const pitchDisplay = document.getElementById('display-manual-pitch');
    pitchSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.physics.manualPitch = val;
      pitchDisplay.textContent = `${val.toFixed(1)}°`;
    });

    const yawSlider = document.getElementById('slider-manual-yaw');
    const yawDisplay = document.getElementById('display-manual-yaw');
    yawSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.physics.manualYaw = val;
      yawDisplay.textContent = `${Math.round(val)}°`;
    });

    // 4. Safety & Brake Actions
    const btnBrake = document.getElementById('btn-emergency-brake');
    const btnFeather = document.getElementById('btn-feather-storm');
    const btnReset = document.getElementById('btn-reset-turbine');

    btnBrake.addEventListener('click', () => {
      this.physics.operatingMode = 'brake';
      modeBadge.textContent = 'EMERGENCY BRAKE';
      modeBadge.style.color = '#ff3366';
      btnAuto.classList.remove('active');
      btnManual.classList.remove('active');
      manualDrawer.classList.add('hidden');
    });

    btnFeather.addEventListener('click', () => {
      this.physics.operatingMode = 'feather';
      modeBadge.textContent = 'STORM FEATHER';
      modeBadge.style.color = '#ffb800';
      btnAuto.classList.remove('active');
      btnManual.classList.remove('active');
      manualDrawer.classList.add('hidden');
    });

    btnReset.addEventListener('click', () => {
      this.physics.operatingMode = 'auto';
      modeBadge.textContent = 'AUTO MPPT';
      modeBadge.style.color = '#00f2fe';
      btnAuto.classList.add('active');
      btnManual.classList.remove('active');
      manualDrawer.classList.add('hidden');
    });

    // 5. Environment Time of Day
    document.querySelectorAll('.env-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.env-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.builder.setTimeOfDay(btn.dataset.tod);
      });
    });

    // 6. Sound Synthesizer Toggle
    const soundBtn = document.getElementById('btn-audio-toggle');
    const iconSoundOff = document.getElementById('icon-sound-off');
    const iconSoundOn = document.getElementById('icon-sound-on');

    soundBtn.addEventListener('click', () => {
      const isUnmuted = this.sound.toggleSound();
      if (isUnmuted) {
        soundBtn.classList.add('active');
        iconSoundOff.classList.add('hidden');
        iconSoundOn.classList.remove('hidden');
      } else {
        soundBtn.classList.remove('active');
        iconSoundOff.classList.remove('hidden');
        iconSoundOn.classList.add('hidden');
      }
    });

    // 7. X-Ray Cutaway Toggle
    const xrayBtn = document.getElementById('btn-xray-toggle');
    xrayBtn.addEventListener('click', () => {
      const newState = !this.builder.cutawayActive;
      this.builder.setCutawayMode(newState);
      if (newState) {
        xrayBtn.classList.add('active');
      } else {
        xrayBtn.classList.remove('active');
      }
    });

    // 8. Camera Preset Buttons
    document.querySelectorAll('.cam-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cam-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.setCameraPreset(btn.dataset.preset);
      });
    });

    // 8b. Real-time Scene Brightness / Exposure Slider
    const exposureSlider = document.getElementById('exposure-slider');
    const exposureLabel = document.getElementById('exposure-val-label');
    if (exposureSlider) {
      exposureSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.renderer.toneMappingExposure = val;
        if (exposureLabel) {
          exposureLabel.textContent = `${Math.round(val * 100)}%`;
        }
      });
    }

    // 8c. Rotor Spin Play / Pause Toggle
    const btnToggleSpin = document.getElementById('btn-toggle-rotor-spin');
    const spinIcon = document.getElementById('spin-btn-icon');
    const spinText = document.getElementById('spin-btn-text');
    if (btnToggleSpin) {
      btnToggleSpin.addEventListener('click', () => {
        this.isRotorPaused = !this.isRotorPaused;
        if (this.isRotorPaused) {
          btnToggleSpin.classList.add('active');
          if (spinIcon) spinIcon.textContent = '▶';
          if (spinText) spinText.textContent = 'Spin Rotor';
        } else {
          btnToggleSpin.classList.remove('active');
          if (spinIcon) spinIcon.textContent = '⏸';
          if (spinText) spinText.textContent = 'Pause Rotor';
        }
      });
    }

    // 8d. Clean Free View (Hide / Show Side Panels) Toggle
    const btnToggleFreeView = document.getElementById('btn-toggle-free-view');
    const btnMobTel = document.getElementById('btn-mobile-telemetry');
    const btnMobCtrl = document.getElementById('btn-mobile-controls');

    const updatePanelButtonStates = () => {
      const isFree = document.body.classList.contains('free-view-active');
      if (btnToggleFreeView) {
        btnToggleFreeView.classList.toggle('active', isFree);
      }
      if (btnMobTel) {
        btnMobTel.classList.toggle('active', document.body.classList.contains('mobile-left-open'));
      }
      if (btnMobCtrl) {
        btnMobCtrl.classList.toggle('active', document.body.classList.contains('mobile-right-open'));
      }
    };

    if (btnToggleFreeView) {
      btnToggleFreeView.addEventListener('click', () => {
        const isFree = document.body.classList.toggle('free-view-active');
        document.body.classList.remove('mobile-left-open', 'mobile-right-open');
        updatePanelButtonStates();
      });
    }

    // Panel Close Buttons
    const btnCloseLeft = document.getElementById('btn-close-left-panel');
    if (btnCloseLeft) {
      btnCloseLeft.addEventListener('click', () => {
        document.body.classList.add('free-view-active');
        document.body.classList.remove('mobile-left-open');
        updatePanelButtonStates();
      });
    }

    const btnCloseRight = document.getElementById('btn-close-right-panel');
    if (btnCloseRight) {
      btnCloseRight.addEventListener('click', () => {
        document.body.classList.add('free-view-active');
        document.body.classList.remove('mobile-right-open');
        updatePanelButtonStates();
      });
    }

    // Mobile Quick Access Pills
    if (btnMobTel) {
      btnMobTel.addEventListener('click', () => {
        const wasOpen = document.body.classList.contains('mobile-left-open');
        document.body.classList.remove('mobile-right-open');
        if (wasOpen) {
          document.body.classList.remove('mobile-left-open');
          document.body.classList.add('free-view-active');
        } else {
          document.body.classList.add('mobile-left-open');
          document.body.classList.remove('free-view-active');
        }
        updatePanelButtonStates();
      });
    }

    if (btnMobCtrl) {
      btnMobCtrl.addEventListener('click', () => {
        const wasOpen = document.body.classList.contains('mobile-right-open');
        document.body.classList.remove('mobile-left-open');
        if (wasOpen) {
          document.body.classList.remove('mobile-right-open');
          document.body.classList.add('free-view-active');
        } else {
          document.body.classList.add('mobile-right-open');
          document.body.classList.remove('free-view-active');
        }
        updatePanelButtonStates();
      });
    }

    const btnMobChart = document.getElementById('btn-mobile-power-curve');
    const dockPanel = document.getElementById('bottom-dock-panel');
    if (btnMobChart && dockPanel) {
      btnMobChart.addEventListener('click', () => {
        document.body.classList.remove('mobile-left-open', 'mobile-right-open');
        const isCollapsed = dockPanel.classList.toggle('collapsed');
        btnMobChart.classList.toggle('active', !isCollapsed);
        if (!isCollapsed) {
          document.body.classList.remove('free-view-active');
        }
        updatePanelButtonStates();
        setTimeout(() => {
          if (this.chartManager && this.chartManager.chart) {
            this.chartManager.chart.resize();
          }
        }, 350);
      });
    }

    // Dismiss open mobile drawers when clicking 3D canvas background
    const canvasEl = document.getElementById('webgl-canvas');
    if (canvasEl) {
      canvasEl.addEventListener('click', () => {
        if (document.body.classList.contains('mobile-left-open') || document.body.classList.contains('mobile-right-open')) {
          document.body.classList.remove('mobile-left-open', 'mobile-right-open');
          updatePanelButtonStates();
        }
      });
    }

    // 9b. SCADA Scope Switcher (Single Turbine vs Wind Farm Fleet)
    const btnScopeTurbine = document.getElementById('btn-scope-turbine');
    const btnScopeFarm = document.getElementById('btn-scope-farm');
    const turbineView = document.getElementById('telemetry-turbine-view');
    const farmView = document.getElementById('telemetry-farm-view');
    const scadaIdBadge = document.getElementById('scada-active-id');

    if (btnScopeTurbine && btnScopeFarm) {
      btnScopeTurbine.addEventListener('click', () => {
        this.scadaScope = 'turbine';
        btnScopeTurbine.classList.add('active');
        btnScopeFarm.classList.remove('active');
        turbineView.classList.remove('hidden');
        farmView.classList.add('hidden');
        if (scadaIdBadge) scadaIdBadge.textContent = 'WTG-01';
      });

      btnScopeFarm.addEventListener('click', () => {
        this.scadaScope = 'farm';
        btnScopeFarm.classList.add('active');
        btnScopeTurbine.classList.remove('active');
        farmView.classList.remove('hidden');
        turbineView.classList.add('hidden');
        if (scadaIdBadge) scadaIdBadge.textContent = 'FARM (8x)';
      });
    }

    // 9c. Active Grid Power Curtailment Slider & Quick Presets
    const curtailSlider = document.getElementById('slider-curtailment');
    const curtailDisplay = document.getElementById('display-curtailment');
    const curtailMwDisplay = document.getElementById('display-curtail-mw');

    if (curtailSlider) {
      curtailSlider.addEventListener('input', (e) => {
        const pct = parseFloat(e.target.value);
        this.physics.curtailmentLimitPct = pct;
        curtailDisplay.textContent = Math.round(pct);
        curtailMwDisplay.textContent = `(${((5.0 * pct) / 100).toFixed(1)} MW)`;
        document.querySelectorAll('[data-curtail]').forEach((btn) => {
          if (parseFloat(btn.dataset.curtail) === pct) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });
      });

      document.querySelectorAll('[data-curtail]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const pct = parseFloat(btn.dataset.curtail);
          this.physics.curtailmentLimitPct = pct;
          curtailSlider.value = pct;
          curtailDisplay.textContent = Math.round(pct);
          curtailMwDisplay.textContent = `(${((5.0 * pct) / 100).toFixed(1)} MW)`;
          document.querySelectorAll('[data-curtail]').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });
    }

    // 9d. Noise Reduced Operation (NRO / DinoTails) Mode Toggle
    const chkNro = document.getElementById('chk-nro-mode');
    if (chkNro) {
      chkNro.addEventListener('change', (e) => {
        this.physics.nroMode = e.target.checked;
      });
    }

    // 9e. Cable Untwist Procedure
    const btnUntwist = document.getElementById('btn-cable-untwist');
    if (btnUntwist) {
      btnUntwist.addEventListener('click', () => {
        this.physics.untwistCables();
      });
    }

    // 9. Simulation Visualizer Checkboxes & Spec Controls
    const chkHotspots = document.getElementById('chk-hotspots');
    const btnToggleHotspots = document.getElementById('btn-toggle-hotspots');
    const updateHotspotsState = (enabled) => {
      this.hotspotsEnabled = enabled;
      if (this.hotspotsContainer) {
        this.hotspotsContainer.style.display = enabled ? 'block' : 'none';
      }
      if (chkHotspots) chkHotspots.checked = enabled;
      if (btnToggleHotspots) btnToggleHotspots.classList.toggle('active', enabled);
    };

    if (chkHotspots) {
      chkHotspots.addEventListener('change', (e) => updateHotspotsState(e.target.checked));
    }
    if (btnToggleHotspots) {
      btnToggleHotspots.addEventListener('click', () => updateHotspotsState(!this.hotspotsEnabled));
    }

    // Quick Specifications HUD Card Toggles
    const specHud = document.getElementById('turbine-specs-hud');
    const btnToggleSpecHud = document.getElementById('btn-toggle-spec-hud');
    const btnSpecsHudCollapse = document.getElementById('btn-specs-hud-toggle');
    const btnHudOpenBlueprint = document.getElementById('btn-hud-open-blueprint');
    const specsModal = document.getElementById('specs-modal');

    if (btnToggleSpecHud && specHud) {
      btnToggleSpecHud.addEventListener('click', () => {
        const isHidden = specHud.classList.toggle('hidden');
        btnToggleSpecHud.classList.toggle('active', !isHidden);
      });
    }

    if (btnSpecsHudCollapse && specHud) {
      btnSpecsHudCollapse.addEventListener('click', () => {
        const isCollapsed = specHud.classList.toggle('collapsed');
        btnSpecsHudCollapse.textContent = isCollapsed ? '+' : '−';
      });
    }

    if (btnHudOpenBlueprint && specsModal) {
      btnHudOpenBlueprint.addEventListener('click', () => {
        specsModal.classList.remove('hidden');
      });
    }

    const chkBloom = document.getElementById('chk-bloom');
    if (chkBloom) {
      chkBloom.addEventListener('change', (e) => {
        this.bloomEnabled = e.target.checked;
      });
    }

    const chkStreamlines = document.getElementById('chk-wind-streamlines');
    chkStreamlines.addEventListener('change', (e) => {
      if (this.builder.streamlinesSystem) {
        this.builder.streamlinesSystem.visible = e.target.checked;
      }
    });

    const chkGusts = document.getElementById('chk-gusts');
    chkGusts.addEventListener('change', (e) => {
      this.gustsEnabled = e.target.checked;
    });

    const chkFarm = document.getElementById('chk-farm-turbines');
    if (chkFarm) {
      chkFarm.addEventListener('change', (e) => {
        if (this.builder.farmRotorGroups) {
          this.builder.farmRotorGroups.forEach((frg) => {
            if (frg.parent) frg.parent.visible = e.target.checked;
          });
        }
      });
    }

    // 10. Bottom Power Curve Dock Collapse
    const dockBar = document.getElementById('dock-toggle-bar');
    if (dockBar && dockPanel) {
      dockBar.addEventListener('click', () => {
        const isCollapsed = dockPanel.classList.toggle('collapsed');
        if (btnMobChart) btnMobChart.classList.toggle('active', !isCollapsed);
        setTimeout(() => {
          if (this.chartManager && this.chartManager.chart) {
            this.chartManager.chart.resize();
          }
        }, 350);
      });
    }

    // 10b. Export Standard 3D Model (.GLB)
    const exportBtn = document.getElementById('btn-export-glb');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        exportBtn.classList.add('active');
        const exporter = new GLTFExporter();
        const exportRoot = new THREE.Group();
        exportRoot.name = 'WINDCARE_MONITORING_SG_5_0_145';

        if (this.builder.towerGroup) exportRoot.add(this.builder.towerGroup.clone(true));
        if (this.builder.nacelleGroup) exportRoot.add(this.builder.nacelleGroup.clone(true));

        exporter.parse(
          exportRoot,
          (gltf) => {
            const blob = new Blob([gltf], { type: 'model/gltf-binary' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'windcare-monitoring-sg-5-0-145.glb';
            link.click();
            URL.revokeObjectURL(link.href);
            exportBtn.classList.remove('active');
          },
          (error) => {
            console.error('Error exporting GLTF:', error);
            exportBtn.classList.remove('active');
          },
          { binary: true }
        );
      });
    }

    // 11. Raycasting Click-to-Inspect in 3D Scene
    this.canvas.addEventListener('click', (e) => this.onSceneClick(e));

    const btnCloseInspect = document.getElementById('btn-close-inspect');
    btnCloseInspect.addEventListener('click', () => {
      document.getElementById('inspection-card').classList.add('hidden');
    });
  }

  /**
   * Raycasting to identify clicked turbine components
   */
  onSceneClick(event) {
    if (!this.inspectorModeEnabled) return;
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const validObjects = (this.builder.inspectableMeshes || []).filter((o) => o && o.isObject3D);
    const intersects = this.raycaster.intersectObjects(validObjects, true);

    if (intersects.length > 0) {
      // Find the first inspectable parent or mesh
      let hit = intersects[0].object;
      while (hit && !hit.userData?.isInspectable && hit.parent) {
        hit = hit.parent;
      }

      if (hit && hit.userData?.isInspectable) {
        this.showInspectionCard(hit.userData);
      }
    }
  }

  showInspectionCard(data) {
    const card = document.getElementById('inspection-card');
    const tag = document.getElementById('inspect-tag');
    const title = document.getElementById('inspect-title');
    const desc = document.getElementById('inspect-desc');
    const specsGrid = document.getElementById('inspect-specs');

    tag.textContent = data.tag || 'COMPONENT';
    title.textContent = data.title;
    desc.textContent = data.desc;

    specsGrid.innerHTML = '';
    if (data.specs) {
      data.specs.forEach((s) => {
        const cell = document.createElement('div');
        cell.className = 'spec-cell';
        cell.innerHTML = `<span class="spec-k">${s.k}</span><span class="spec-v">${s.v}</span>`;
        specsGrid.appendChild(cell);
      });
    }

    card.classList.remove('hidden');
  }

  /**
   * Blueprint / Technical Datasheet Modal
   */
  initBlueprintModal() {
    const modal = document.getElementById('specs-modal');
    const btnOpen = document.getElementById('btn-specs-open');
    const btnClose = document.getElementById('btn-specs-close');

    btnOpen.addEventListener('click', () => modal.classList.remove('hidden'));
    btnClose.addEventListener('click', () => modal.classList.add('hidden'));

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });

    // Tab switching
    const tabs = document.querySelectorAll('.bp-tab');
    const contents = document.querySelectorAll('.blueprint-tab-content');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        const tabKey = tab.dataset.tab;
        contents.forEach((c) => {
          if (c.id === `tab-content-${tabKey}`) {
            c.classList.remove('hidden');
          } else {
            c.classList.add('hidden');
          }
        });
      });
    });
  }

  updatePresetButtonsActiveState(windVal) {
    document.querySelectorAll('.preset-btn').forEach((btn) => {
      if (Math.abs(parseFloat(btn.dataset.wind) - windVal) < 0.2) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  getCardinalDirection(deg) {
    const d = (deg + 360) % 360;
    if (d >= 337.5 || d < 22.5) return 'North';
    if (d >= 22.5 && d < 67.5) return 'North-East';
    if (d >= 67.5 && d < 112.5) return 'East';
    if (d >= 112.5 && d < 157.5) return 'South-East';
    if (d >= 157.5 && d < 202.5) return 'South';
    if (d >= 202.5 && d < 247.5) return 'South-West';
    if (d >= 247.5 && d < 292.5) return 'West';
    return 'North-West';
  }

  /**
   * Updates SCADA HUD gauges, bars, text, and compass needle
   */
  updateHUD() {
    const p = this.physics;

    // Header Status Pill
    const statusPill = document.getElementById('system-status-pill');
    const statusText = document.getElementById('system-status-text');

    if (p.operatingMode === 'brake') {
      statusPill.className = 'status-indicator-pill danger';
      statusText.textContent = 'EMERGENCY BRAKE ENGAGED';
    } else if (p.operatingMode === 'feather' || p.windSpeed > p.CUT_OUT_WIND) {
      statusPill.className = 'status-indicator-pill warning';
      statusText.textContent = 'STORM CUT-OUT · FEATHERED';
    } else if (p.windSpeed < p.CUT_IN_WIND) {
      statusPill.className = 'status-indicator-pill';
      statusText.textContent = 'STANDBY · BELOW CUT-IN';
    } else {
      statusPill.className = 'status-indicator-pill';
      statusText.textContent = p.operatingMode === 'auto' ? 'ONLINE · MPPT ACTIVE' : 'MANUAL CONTROL ACTIVE';
    }

    // Top Quick Readouts
    document.getElementById('top-power-val').textContent = Math.round(p.powerKw).toLocaleString();

    // SCADA Left HUD
    document.getElementById('metric-power-mw').textContent = p.powerMw.toFixed(2);
    const powerBarPercent = Math.min(100, (p.powerKw / p.RATED_POWER_KW) * 100);
    document.getElementById('power-bar-fill').style.width = `${powerBarPercent}%`;

    document.getElementById('metric-rotor-rpm').textContent = p.rotorRpm.toFixed(1);
    document.getElementById('metric-gen-rpm').textContent = Math.round(p.generatorRpm).toLocaleString();
    document.getElementById('metric-tip-speed').textContent = Math.round(p.tipSpeedKmh);
    document.getElementById('metric-tsr').textContent = p.tsr.toFixed(2);
    document.getElementById('metric-torque').textContent = Math.round(p.aeroTorqueKnm).toLocaleString();
    document.getElementById('metric-cp').textContent = p.cp.toFixed(3);

    // Pitch visualizer
    const pitchStr = `${p.bladePitch.toFixed(1)}°`;
    document.getElementById('blade1-pitch-val').textContent = pitchStr;
    document.getElementById('blade2-pitch-val').textContent = pitchStr;
    document.getElementById('blade3-pitch-val').textContent = pitchStr;

    // Meters
    document.getElementById('temp-gen-val').textContent = `${p.generatorTempC.toFixed(1)} °C`;
    document.getElementById('temp-gen-bar').style.width = `${Math.min(100, (p.generatorTempC / 100.0) * 100)}%`;

    document.getElementById('deflect-val').textContent = `${p.towerDeflectionM.toFixed(2)} m`;
    document.getElementById('deflect-bar').style.width = `${Math.min(100, (p.towerDeflectionM / 1.0) * 100)}%`;

    document.getElementById('vibe-val').textContent = `${p.vibrationMms.toFixed(1)} mm/s`;
    document.getElementById('vibe-bar').style.width = `${Math.min(100, (p.vibrationMms / 4.0) * 100)}%`;

    // Cumulative stats
    document.getElementById('cum-energy-val').textContent = `${Math.round(p.cumulativeEnergyMwh).toLocaleString()} MWh`;
    document.getElementById('co2-offset-val').textContent = `${Math.round(p.co2OffsetTons).toLocaleString()} t`;

    // Cable Twist Readout
    const twistElem = document.getElementById('display-cable-twist');
    if (twistElem) {
      twistElem.textContent = `${p.cableTwistDeg.toFixed(1)}°`;
      twistElem.style.color = Math.abs(p.cableTwistDeg) > 360 ? '#ff3366' : '#00f2fe';
    }

    // Farm Fleet SCADA Overview Update
    if (this.scadaScope === 'farm') {
      const fPower = document.getElementById('farm-power-mw');
      const fBar = document.getElementById('farm-power-bar');
      const fVolt = document.getElementById('farm-voltage-val');
      const fFreq = document.getElementById('farm-freq-val');
      const fCf = document.getElementById('farm-cf-val');
      const fGen = document.getElementById('farm-gen-val');

      if (fPower) fPower.textContent = p.totalFarmPowerMw.toFixed(2);
      if (fBar) fBar.style.width = `${Math.min(100, (p.totalFarmPowerMw / p.farmRatedPowerMw) * 100)}%`;
      if (fVolt) fVolt.textContent = `${p.gridVoltageKv.toFixed(1)} kV`;
      if (fFreq) fFreq.textContent = `${p.gridFrequencyHz.toFixed(2)} Hz`;
      if (fCf) fCf.textContent = `${p.farmCapacityFactorPct.toFixed(1)}%`;
      if (fGen) fGen.textContent = `${p.farmDailyEnergyMwh.toFixed(1)} MWh`;

      // Update 8 Turbine Fleet Rows
      const listContainer = document.getElementById('farm-turbines-list');
      if (listContainer) {
        if (!this.farmListRendered || listContainer.children.length === 0) {
          listContainer.innerHTML = '';
          p.windFarmData.forEach((wtg, idx) => {
            const row = document.createElement('div');
            row.className = 'wtg-fleet-row';
            row.id = `fleet-row-${wtg.id}`;
            row.innerHTML = `
              <div class="wtg-id-badge">
                <span class="wtg-status-dot ${wtg.status === 'CURTAILED' ? 'curtailed' : (wtg.status === 'STOPPED' ? 'stopped' : '')}"></span>
                <span>${wtg.name}</span>
              </div>
              <div class="wtg-metrics">
                <span class="wtg-power" id="wtg-p-${wtg.id}">${wtg.powerMw.toFixed(2)} MW</span>
                <span class="wtg-wake">${wtg.rpm} RPM</span>
              </div>
            `;
            row.addEventListener('click', () => {
              if (idx === 0) {
                this.setCameraPreset('hero');
              } else {
                const tz = wtg.z;
                const tx = this.builder.getRidgeX(tz);
                const ty = this.builder.getTerrainHeight(tx, tz);
                this.camTargetPos = new THREE.Vector3(tx + 60, ty + 70, tz + 90);
                this.camTargetLookAt = new THREE.Vector3(tx, ty + this.builder.HUB_HEIGHT, tz);
                this.controls.autoRotate = false;
              }
            });
            listContainer.appendChild(row);
          });
          this.farmListRendered = true;
        } else {
          // Real-time update values
          p.windFarmData.forEach((wtg) => {
            const pElem = document.getElementById(`wtg-p-${wtg.id}`);
            if (pElem) pElem.textContent = `${wtg.powerMw.toFixed(2)} MW`;
          });
        }
      }
    }

    // Compass
    const needleWind = document.getElementById('compass-needle-wind');
    const needleTurbine = document.getElementById('compass-needle-turbine');
    needleWind.style.transform = `rotate(${p.windDirection}deg)`;
    needleTurbine.style.transform = `rotate(${p.nacelleYaw}deg)`;

    document.getElementById('compass-wind-deg').textContent = `${Math.round(p.windDirection)}° (${this.getCardinalDirection(p.windDirection)[0]})`;
    document.getElementById('compass-yaw-deg').textContent = `${Math.round(p.nacelleYaw)}° (${this.getCardinalDirection(p.nacelleYaw)[0]})`;

    const yawError = Math.abs((p.windDirection - p.nacelleYaw + 360) % 360);
    const yawErrorNorm = yawError > 180 ? 360 - yawError : yawError;
    const errorElem = document.getElementById('compass-yaw-error');
    errorElem.textContent = `${yawErrorNorm.toFixed(1)}° ${yawErrorNorm < 2 ? '(LOCKED)' : '(SLEWING)'}`;
    errorElem.style.color = yawErrorNorm < 2 ? '#00ff88' : '#ffb800';

    // Zone Badge in Dock
    const zoneBadge = document.getElementById('operating-zone-badge');
    if (p.windSpeed < p.CUT_IN_WIND) {
      zoneBadge.textContent = 'ZONE I: CUT-IN / PARKED';
      zoneBadge.style.color = '#8b9bb4';
      zoneBadge.style.background = 'rgba(255,255,255,0.06)';
    } else if (p.windSpeed <= p.RATED_WIND) {
      zoneBadge.textContent = 'ZONE II: MPPT VARIABLE SPEED';
      zoneBadge.style.color = '#00f2fe';
      zoneBadge.style.background = 'rgba(0, 242, 254, 0.15)';
    } else if (p.windSpeed <= p.CUT_OUT_WIND) {
      zoneBadge.textContent = 'ZONE III: RATED POWER REGULATION';
      zoneBadge.style.color = '#00ff88';
      zoneBadge.style.background = 'rgba(0, 255, 136, 0.15)';
    } else {
      zoneBadge.textContent = 'ZONE IV: STORM CUT-OUT FEATHERED';
      zoneBadge.style.color = '#ff3366';
      zoneBadge.style.background = 'rgba(255, 51, 102, 0.15)';
    }

    // Update Chart.js Operating Point
    if (this.chartManager) {
      this.chartManager.updateOperatingPoint(p.windSpeed, p.powerMw);
    }
  }

  /**
   * 3D Digital Twin Hotspot Callouts Overlay
   */
  /**
   * 3D Digital Twin Hotspot Callouts Overlay (Single Turbine Component Specifications)
   */
  initHotspots() {
    this.hotspotsContainer = document.getElementById('hotspot-overlay-container');
    if (!this.hotspotsContainer) return;

    this.hotspotsEnabled = true;
    this.hotspotsContainer.style.display = 'block';

    const hubH = this.builder ? this.builder.HUB_HEIGHT : 107.5;

    this.hotspots = [
      {
        id: 'rotor',
        name: '3x IntegralBlade® (Ø 145m)',
        pos: new THREE.Vector3(0, hubH + 34.0, 4.2),
        preset: 'front',
        inspectData: {
          title: 'WINDCARE MONITORING 71.0m IntegralBlade®',
          tag: 'ROTOR AERODYNAMICS',
          desc: '71-meter single-piece hybrid carbon/glass cast blades without glue seams, featuring DinoTails® low-noise trailing-edge serrations and OptiTip® individual pitch control.',
          specs: [
            { k: 'Rotor Diameter', v: '145.0 m (Swept: 16,513 m²)' },
            { k: 'Blade Length', v: '71.0 m (17.2 Tons each)' },
            { k: 'Tip Velocity', v: '287 km/h (79.7 m/s / Mach 0.23)' },
            { k: 'Operating RPM', v: '5.2 – 12.2 RPM (Variable)' }
          ]
        }
      },
      {
        id: 'hub',
        name: 'Cast Rotor Hub & Pitch System',
        pos: new THREE.Vector3(0, hubH, 4.5),
        preset: 'hub',
        inspectData: {
          title: 'Cast Spherical Rotor Hub & Pitch Drives',
          tag: 'ROTOR HUB ASSEMBLY',
          desc: 'Heavy ductile iron spherical hub housing individual AC servomotor pitch actuators, emergency fail-safe ultra-capacitor backup modules, and blade pitch bearings.',
          specs: [
            { k: 'Pitch System', v: 'OptiTip® Individual Pitch' },
            { k: 'Pitch Rate', v: 'Up to 8.0°/s (Fast Feather)' },
            { k: 'Pre-Cone Angle', v: '2.5° Upwind Cone' },
            { k: 'Rotor Tilt Angle', v: '5.0° Upward Tilt' }
          ]
        }
      },
      {
        id: 'gearbox',
        name: 'Planetary Gearbox (1 : 104.2)',
        pos: new THREE.Vector3(0, hubH + 2.2, -0.6),
        preset: 'nacelle',
        inspectData: {
          title: '3-Stage Planetary-Helical Transmission',
          tag: 'DRIVETRAIN GEARBOX',
          desc: 'Transforms low-speed high-torque rotor rotation (11.5 RPM) into high-speed generator input (1,060 RPM). Combines two planetary stages with one parallel helical gear set.',
          specs: [
            { k: 'Total Gear Ratio', v: '1 : 104.2' },
            { k: 'Nominal Torque', v: '4,550 kN·m' },
            { k: 'Lubrication', v: 'Pressure Synthetic ISO VG 320' },
            { k: 'Efficiency', v: '97.5% Mechanical' }
          ]
        }
      },
      {
        id: 'generator',
        name: 'OptiSpeed® DFIG (5.0 MW / 690V)',
        pos: new THREE.Vector3(0, hubH + 2.2, -3.8),
        preset: 'nacelle',
        inspectData: {
          title: '5,000 kW Doubly-Fed Induction Generator (DFIG)',
          tag: 'ELECTRICAL GENERATOR',
          desc: 'Liquid-cooled 6-pole pair variable-speed induction generator delivering 5.0 MW rated power at 690 V AC to the frequency converter and step-up transformer.',
          specs: [
            { k: 'Rated Capacity', v: '5,000 kW (5.0 MW)' },
            { k: 'Nominal Voltage', v: '690 V AC, 3-Phase' },
            { k: 'Synchronous Speed', v: '1,000 / 1,200 RPM' },
            { k: 'Power Factor', v: '0.95 Inductive to Capacitive' }
          ]
        }
      },
      {
        id: 'tower',
        name: 'Tubular Steel Tower (107.5m)',
        pos: new THREE.Vector3(0, 52.0, 0.0),
        preset: 'hero',
        inspectData: {
          title: '4-Section Conical Tubular Rolled Steel Tower',
          tag: 'TOWER STRUCTURE',
          desc: 'Heavy structural rolled steel conical tower standing 107.5m to hub centerline. Includes internal technician service lift, safety ladder, and high-voltage busbar cables.',
          specs: [
            { k: 'Hub Height', v: '107.5 m (Tip Height: 180.0 m)' },
            { k: 'Base Diameter', v: 'Ø 5.10 m (Flanged Base)' },
            { k: 'Top Flange Ø', v: 'Ø 3.44 m (Nacelle Flange)' },
            { k: 'Total Tower Mass', v: '~245 Metric Tons' }
          ]
        }
      },
      {
        id: 'transformer',
        name: '33 kV Step-Up Substation',
        pos: new THREE.Vector3(8.8, 3.0, 5.2),
        preset: 'substation',
        inspectData: {
          title: '5,000 kVA 33 kV Medium-Voltage Step-Up Transformer',
          tag: 'SUBSTATION TRANSFORMER',
          desc: 'Pad-mounted oil-immersed step-up transformer converting 690 V generator output to 33 kV for direct utility grid collection export.',
          specs: [
            { k: 'Rated Power', v: '5,000 kVA (5.0 MVA)' },
            { k: 'Voltage Ratio', v: '0.69 kV / 33.0 kV' },
            { k: 'Cooling Class', v: 'ONAN Corrugated Steel Fins' },
            { k: 'Grid Connection', v: '33 kV Under-Ground Collector' }
          ]
        }
      },
      {
        id: 'powerhouse',
        name: 'Powerhouse & MV Switchgear',
        pos: new THREE.Vector3(8.8, 3.0, -2.4),
        preset: 'substation',
        inspectData: {
          title: 'WTG-01 Control Powerhouse & MV Switchgear',
          tag: 'CONTROL POWERHOUSE',
          desc: 'Houses 33 kV SF6 gas-insulated switchgear (GIS), SCADA grid synchronization PLC, fiber-optic communications, and emergency auxiliary power batteries.',
          specs: [
            { k: 'Switchgear', v: '33 kV SF6 GIS Unit' },
            { k: 'SCADA Protocol', v: 'IEC 61400-25 / Modbus TCP' },
            { k: 'Protection', v: 'Arc-Flash & Overcurrent Relays' },
            { k: 'Aux Backup', v: '400V/230V UPS Battery Pack' }
          ]
        }
      },
      {
        id: 'foundation',
        name: 'Gravity Base Plinth (680 m³)',
        pos: new THREE.Vector3(0, 1.2, 5.5),
        preset: 'ground',
        inspectData: {
          title: 'Reinforced Concrete Octagonal Gravity Base',
          tag: 'FOUNDATION ENGINEERING',
          desc: 'High-density C35/45 reinforced concrete slab foundation engineered to absorb 400+ kN horizontal aerodynamic thrust and extreme 52.5 m/s storm overturning moments.',
          specs: [
            { k: 'Concrete Volume', v: '~680 m³ (C35/45 Concrete)' },
            { k: 'Steel Rebar', v: '~78 Metric Tons' },
            { k: 'Anchor Bolts', v: '160x M42 Pre-tensioned 10.9' },
            { k: 'Bearing Capacity', v: 'Max 260 kPa Overturning' }
          ]
        }
      }
    ];

    this.hotspotsContainer.innerHTML = '';
    this.hotspotElements = [];

    this.hotspots.forEach((spot) => {
      const pin = document.createElement('div');
      pin.className = 'hotspot-pin';
      pin.id = `hotspot-${spot.id}`;
      pin.innerHTML = `
        <span class="hotspot-pin-dot"></span>
        <span class="hotspot-pin-label">${spot.name}</span>
      `;
      pin.addEventListener('click', (e) => {
        e.stopPropagation();
        if (spot.inspectData) {
          this.showInspectionCard(spot.inspectData);
        }
        if (spot.preset) {
          this.setCameraPreset(spot.preset);
        }
      });
      this.hotspotsContainer.appendChild(pin);
      this.hotspotElements.push({ spot, elem: pin });
    });
  }

  updateHotspots() {
    if (!this.hotspotsEnabled || !this.hotspotsContainer || this.hotspotElements.length === 0) return;

    const width = this.viewportContainer.clientWidth;
    const height = this.viewportContainer.clientHeight;
    const tempV = new THREE.Vector3();

    this.hotspotElements.forEach(({ spot, elem }) => {
      tempV.copy(spot.pos);
      tempV.project(this.camera);

      // Behind camera or out of bounds
      if (tempV.z > 1.0 || tempV.x < -1.15 || tempV.x > 1.15 || tempV.y < -1.15 || tempV.y > 1.15) {
        elem.style.display = 'none';
        return;
      }

      elem.style.display = 'flex';
      const x = (tempV.x * 0.5 + 0.5) * width;
      const y = (-tempV.y * 0.5 + 0.5) * height;
      elem.style.left = `${x}px`;
      elem.style.top = `${y}px`;

      // Smooth distance fade
      const dist = this.camera.position.distanceTo(spot.pos);
      elem.style.opacity = dist > 450 ? String(Math.max(0.25, 1.0 - (dist - 450) / 250)) : '1.0';
    });
  }

  /**
   * Optical Sun Glare Lens Flare
   */
  initSunGlare() {
    this.sunGlareElement = document.getElementById('sun-glare-effect');
  }

  updateSunGlare() {
    if (!this.sunGlareElement || !this.builder || !this.builder.sunSphere) return;

    const width = this.viewportContainer.clientWidth;
    const height = this.viewportContainer.clientHeight;

    const sunPos = this.builder.sunSphere.position.clone();
    sunPos.project(this.camera);

    // Behind camera or out of bounds
    if (sunPos.z > 1.0 || sunPos.x < -1.3 || sunPos.x > 1.3 || sunPos.y < -1.3 || sunPos.y > 1.3) {
      this.sunGlareElement.style.opacity = '0';
      return;
    }

    const x = (sunPos.x * 0.5 + 0.5) * width;
    const y = (-sunPos.y * 0.5 + 0.5) * height;

    this.sunGlareElement.style.left = `${x}px`;
    this.sunGlareElement.style.top = `${y}px`;

    const distCenter = Math.hypot(sunPos.x, sunPos.y);
    const intensity = Math.max(0, 1.0 - distCenter / 1.35) * 0.18;
    this.sunGlareElement.style.opacity = intensity.toFixed(2);
  }

  /**
   * Fullscreen Immersion Mode
   */
  initFullscreen() {
    const fsBtn = document.getElementById('btn-fullscreen-toggle');
    const iconEnter = document.getElementById('icon-fs-enter');
    const iconExit = document.getElementById('icon-fs-exit');

    if (fsBtn) {
      fsBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch((err) => {
            console.warn('Error attempting to enable fullscreen:', err);
          });
        } else {
          document.exitFullscreen().catch((err) => {
            console.warn('Error attempting to exit fullscreen:', err);
          });
        }
      });

      document.addEventListener('fullscreenchange', () => {
        const isFs = !!document.fullscreenElement;
        if (iconEnter && iconExit) {
          iconEnter.classList.toggle('hidden', isFs);
          iconExit.classList.toggle('hidden', !isFs);
        }
      });
    }
  }

  /**
   * Live SCADA Operations Event Log
   */
  initScadaEventLog() {
    const tickerText = document.getElementById('scada-ticker-text');
    const tickerTime = document.getElementById('scada-ticker-time');
    if (!tickerText) return;

    setInterval(() => {
      this.lastEventIndex = (this.lastEventIndex + 1) % this.scadaEvents.length;
      tickerText.textContent = this.scadaEvents[this.lastEventIndex];

      const now = new Date();
      const timeStr = [
        String(now.getHours()).padStart(2, '0'),
        String(now.getMinutes()).padStart(2, '0'),
        String(now.getSeconds()).padStart(2, '0')
      ].join(':');
      if (tickerTime) tickerTime.textContent = timeStr;
    }, 5500);
  }

  /**
   * Main Frame Render Loop
   */
  animate() {
    requestAnimationFrame(() => this.animate());

    const dt = Math.min(this.clock.getDelta(), 0.1);
    const time = this.clock.getElapsedTime();

    // Wind Gust Turbulence Simulation
    if (this.gustsEnabled) {
      this.gustTime += dt;
      // Perlin-like pseudo-harmonic wind fluctuation
      this.gustFactor = 1.0 + Math.sin(this.gustTime * 0.4) * 0.08 + Math.cos(this.gustTime * 0.9 + 1.2) * 0.05;
    } else {
      this.gustFactor = 1.0;
    }

    // Step Physics Simulation
    const effectiveDt = this.isRotorPaused ? 0 : dt;
    this.physics.update(effectiveDt, this.gustFactor);

    // Update 3D Visuals & Rotations
    this.builder.updateAnimation(this.physics, effectiveDt, time);

    // Modulate Synthesized Audio
    this.sound.update(this.physics, effectiveDt);

    // Camera preset smooth interpolation
    if (this.camTargetPos && this.camTargetLookAt) {
      this.camera.position.lerp(this.camTargetPos, 0.05);
      this.controls.target.lerp(this.camTargetLookAt, 0.05);

      if (this.camera.position.distanceTo(this.camTargetPos) < 0.2) {
        this.camTargetPos = null;
        this.camTargetLookAt = null;
      }
    }

    this.controls.update();

    // Update SCADA Telemetry UI every frame
    this.updateHUD();

    // Drone Inspection Flyover Mode (Cinematic 360° Orbit around Single Turbine)
    if (this.currentPreset === 'drone') {
      this.droneProgress = (time * 0.12) % (Math.PI * 2);
      const orbitR = 96.0;
      const x = Math.sin(this.droneProgress) * orbitR;
      const z = Math.cos(this.droneProgress) * orbitR;
      const y = 82.0 + Math.sin(this.droneProgress * 2.0) * 16.0;
      this.camera.position.set(x, y, z);
      this.controls.target.set(0.0, 68.0, 0.0);
    }

    // Update 3D Digital Twin Hotspots Overlay
    this.updateHotspots();

    // Update Optical Sun Glare Effect
    this.updateSunGlare();

    // Render 3D Scene with Photorealistic Post-Processing Pipeline
    if (this.composer && this.bloomEnabled) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

// Instantiate App when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  new AeroTurbineApp();
});

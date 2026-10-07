/**
 * Siemens Gamesa SG 5.0-145 Procedural 3D Model & Living Ecosystem Environment
 * Built with Three.js (v0.186+)
 * 
 * Features:
 * - Fixed Zero-Gap Tower-Nacelle Yaw Collar (Mathematically Locked & Sleeved)
 * - Living Ecosystem:
 *   * Animated Flocks of Soaring Birds (Flapping wings & thermal gliding)
 *   * Animated Grazing Pasture Wildlife (Meadow sheep & graceful deer on the hills)
 *   * Siemens Gamesa Maintenance Crew (Field service engineers in high-vis vests & hard hats)
 *   * 4x4 Wind Farm Service Utility Truck with Amber Beacon
 *   * Landscape Trees, Pine Groves & Wildflowers
 * - Authentic Siemens Gamesa Brand Livery (#00646e Petrol Teal & Slate)
 * - 71.0m Siemens Gamesa IntegralBlade® with DinoTails® Serrated Trailing Edge & DinoShells® Root Fairing
 * - Faceted Aerodynamic SG 5.0-145 Nacelle with Stepped Rear Cooler Pack & Dual Spinning Fans
 * - Precision Conical Hub Spinner with OptiTip® Pitch Interface & Rubber Pitch Seal Collars
 * - 107.5m Conical Tubular Steel Tower with SAW Welds, Base Entrance Stairs & 160 Anchor Bolts
 * - 33kV Padmounted Step-Up Transformer Substation
 * - Dynamic Procedural IBL Environment Reflection Maps (PMREMGenerator) for Photorealistic PBR
 * - Dynamic Aeroelastic Blade Flexing (quadratic cantilever deflection under thrust)
 * - Dynamic Tower Top Cantilever Sway & Structural Vibration
 * - Atmospheric Skydome & Drifting Volumetric 3D Clouds
 */

import * as THREE from 'three';

export class TurbineBuilder {
  constructor(scene, renderer = null) {
    this.scene = scene;
    this.renderer = renderer;

    // Interactive Mesh Registry for Raycasting
    this.inspectableMeshes = [];

    // Animated structural references
    this.towerGroup = null;
    this.towerMesh = null;
    this.nacelleGroup = null;
    this.rotorGroup = null;
    this.hubGroup = null;
    this.bladeGroups = [];
    this.bladeMeshes = [];
    this.anemometerCupsGroup = null;
    this.windVaneGroup = null;
    this.coolerFans = [];
    this.beaconLights = [];
    this.beaconMeshes = [];

    // Living Beings & Wildlife References
    this.birdsList = [];
    this.animalsList = [];
    this.techniciansList = [];
    this.truckBeacon = null;

    // Drivetrain Internals (Real Mechanism Running Inside)
    this.drivetrainGroup = null;
    this.mainShaftGroup = null;
    this.mainBearingRollers = null;
    this.planetCarrier = null;
    this.planetGears = [];
    this.sunGear = null;
    this.intermediateStage = null;
    this.highSpeedShaftGroup = null;
    this.highSpeedAssembly = null;
    this.planetGearsGroup = null;
    this.generatorRotor = null;
    this.yawPinions = [];
    this.pitchPinions = [];
    this.brakeDiscMesh = null;
    this.brakeDiscMaterial = null;
    this.nacelleShellMesh = null;
    this.nacelleShellMaterial = null;
    this.portShellMesh = null;
    this.cutawayActive = false;
    this.sparksSystem = null;

    // Environment & Atmosphere
    this.skyDome = null;
    this.cloudsGroup = null;
    this.cloudsList = [];
    this.farmRotorGroups = [];
    this.currentEnvMode = 'day';

    // Mountain Ridge Highland Environment
    this.mountainRidgeGroup = null;
    this.cloudSeaMesh = null;
    this.cloudSeaGeometry = null;
    this.cloudSeaOriginalPositions = null;
    this.distantPeaksGroup = null;
    this.ridgeTurbinesGroup = null;
    this.farmYawGroups = [];
    this.towerStairsMesh = null;

    // Aerodynamic Wake & Streamlines
    this.streamlinesSystem = null;
    this.streamlinesCount = 1400;
    this.particlePositions = null;
    this.particleVelocities = null;
    this.tipVortexPoints = null;

    // Lighting references
    this.dirLight = null;
    this.hemiLight = null;
    this.ambientLight = null;
    this.sunSphere = null;

    // Substation, Powerhouse & Basement References
    this.substationGroup = null;
    this.transformerMesh = null;
    this.powerhouseMesh = null;
    this.basementVaultMesh = null;

    // Siemens Gamesa SG 5.0-145 Dimensions
    this.HUB_HEIGHT = 107.5; // Standard 107.5m hub height
    this.ROTOR_RADIUS = 72.5; // 145.0m rotor diameter (71.0m blade + 1.5m hub radius)
  }

  /**
   * Main scene construction - Mountain Ridge Highland Vista
   */
  buildScene() {
    this.setupLighting();
    this.buildAtmosphericSky();
    this.buildMountainRidgeTerrain();
    this.buildDistantMountainPeaks();
    this.buildMetMastAnemometerTower();
    this.buildWindTurbine();
    this.buildBasementSubstationPowerhouse();
    // Single Turbine Mode: 8 auxiliary turbines removed per user specification
    this.buildLivingBeingsEcosystem(); // Soaring gulls/raptors, technicians & service truck
    this.buildStreamlineParticles();
    this.buildTipVortexSystem();
    this.buildBrakeSparksSystem();

    if (this.renderer) {
      this.updateEnvironmentMap('day');
    }
  }

  /**
   * Utility Corridor Centerline: x(z)
   * Straight, neat utility alignment along the access roadway
   */
  getRidgeX(z) {
    return 0.0;
  }

  /**
   * Plain Flat Terrain Elevation: exactly 0.0m everywhere
   */
  getRidgeCrestY(z) {
    return 0.0;
  }

  /**
   * Plain Flat Ground Elevation: exactly 0.0m everywhere
   */
  getTerrainHeight(x, z) {
    return 0.0;
  }

  // =========================================================================
  // 1. DYNAMIC PROCEDURAL ATMOSPHERIC SKY & IBL ENVIRONMENT (PHOTOREALISM)
  // =========================================================================

  generateSkyTexture(mode = 'day') {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    if (mode === 'day') {
      // 1. Natural High-Contrast Alpine Azure Sky Gradient (Clear visibility & contrast)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 1024);
      skyGrad.addColorStop(0.0, '#0e3868'); // Deep Alpine Navy Zenith
      skyGrad.addColorStop(0.25, '#1d5696');
      skyGrad.addColorStop(0.50, '#3b77b7');
      skyGrad.addColorStop(0.72, '#6ea2d5');
      skyGrad.addColorStop(0.88, '#9bc2e5');
      skyGrad.addColorStop(0.96, '#cce0f2');
      skyGrad.addColorStop(1.0, '#e4eef7');  // Crisp clean horizon rim
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 2048, 1024);

      // 2. High Dynamic Range Solar Corona & Sun Disc (Softer natural sun)
      const sunX = 640;
      const sunY = 540;

      // Soft Atmospheric Golden Halo
      const wideHalo = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 260);
      wideHalo.addColorStop(0.0, 'rgba(255, 245, 220, 0.28)');
      wideHalo.addColorStop(0.4, 'rgba(240, 220, 180, 0.12)');
      wideHalo.addColorStop(1.0, 'rgba(220, 230, 245, 0.0)');
      ctx.fillStyle = wideHalo;
      ctx.fillRect(0, 0, 2048, 1024);

      // Inner Sun Corona
      const corona = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, 65);
      corona.addColorStop(0.0, '#ffffff');
      corona.addColorStop(0.35, '#fff9e8');
      corona.addColorStop(0.75, 'rgba(255, 230, 170, 0.45)');
      corona.addColorStop(1.0, 'rgba(255, 215, 140, 0.0)');
      ctx.fillStyle = corona;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 65, 0, Math.PI * 2);
      ctx.fill();

      // Sharp Natural Sun Disc
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 14, 0, Math.PI * 2);
      ctx.fill();

      // 3. Delicate Procedural High-Altitude Cirrus Cloud Streaks
      for (let c = 0; c < 30; c++) {
        const cx = Math.random() * 2048;
        const cy = 100 + Math.random() * 320;
        const cLen = 160 + Math.random() * 360;
        const cThick = 4 + Math.random() * 14;
        const cAlpha = 0.05 + Math.random() * 0.08;

        const cirrusGrad = ctx.createLinearGradient(cx, cy, cx + cLen, cy);
        cirrusGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        cirrusGrad.addColorStop(0.5, `rgba(255, 255, 255, ${cAlpha})`);
        cirrusGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = cirrusGrad;
        ctx.beginPath();
        ctx.ellipse(cx + cLen / 2, cy, cLen / 2, cThick, (Math.random() - 0.5) * 0.05, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Clean Valley Horizon Blend (Blends with clear sky fog 0x8eaec9)
      const hazeGrad = ctx.createLinearGradient(0, 840, 0, 1024);
      hazeGrad.addColorStop(0.0, 'rgba(228, 238, 247, 0.0)');
      hazeGrad.addColorStop(1.0, 'rgba(142, 174, 201, 0.32)');
      ctx.fillStyle = hazeGrad;
      ctx.fillRect(0, 840, 2048, 184);
    } else if (mode === 'sunset') {
      // 1. Fiery Twilight Horizon & Golden Hour Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 1024);
      skyGrad.addColorStop(0.0, '#100826'); // Deep Twilight Indigo
      skyGrad.addColorStop(0.24, '#2d1448');
      skyGrad.addColorStop(0.48, '#722646'); // Magenta / Crimson
      skyGrad.addColorStop(0.68, '#bf422d'); // Warm Terracotta Red
      skyGrad.addColorStop(0.85, '#ff8736'); // Radiant Sunset Orange
      skyGrad.addColorStop(0.96, '#ffbf4a'); // Golden Horizon
      skyGrad.addColorStop(1.0, '#ffd67a');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 2048, 1024);

      // 2. Low-Altitude Blazing Sunset Sun (Azimuth ~45°, Alt ~15°)
      const sunX = 1320;
      const sunY = 440;

      // Radiant Low Sun Glow
      const sunsetCorona = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 360);
      sunsetCorona.addColorStop(0.0, '#ffffff');
      sunsetCorona.addColorStop(0.2, '#ffe28a');
      sunsetCorona.addColorStop(0.55, 'rgba(255, 120, 30, 0.6)');
      sunsetCorona.addColorStop(0.85, 'rgba(200, 50, 40, 0.25)');
      sunsetCorona.addColorStop(1.0, 'rgba(150, 30, 60, 0)');
      ctx.fillStyle = sunsetCorona;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 360, 0, Math.PI * 2);
      ctx.fill();

      // Horizontal Sun Flare Streaks
      ctx.fillStyle = 'rgba(255, 210, 120, 0.35)';
      ctx.fillRect(0, sunY - 4, 2048, 8);
      ctx.fillStyle = 'rgba(255, 160, 60, 0.2)';
      ctx.fillRect(sunX - 420, sunY - 14, 840, 28);

      // Low Dusk Clouds with Golden Edges
      for (let c = 0; c < 24; c++) {
        const cx = Math.random() * 2048;
        const cy = 340 + Math.random() * 260;
        const cLen = 180 + Math.random() * 380;
        const cThick = 6 + Math.random() * 18;

        const cGrad = ctx.createLinearGradient(cx, cy, cx + cLen, cy);
        cGrad.addColorStop(0, 'rgba(80, 20, 40, 0)');
        cGrad.addColorStop(0.4, 'rgba(60, 15, 35, 0.45)');
        cGrad.addColorStop(0.7, 'rgba(255, 140, 50, 0.55)'); // Lit by under-sun
        cGrad.addColorStop(1, 'rgba(80, 20, 40, 0)');

        ctx.fillStyle = cGrad;
        ctx.beginPath();
        ctx.ellipse(cx + cLen / 2, cy, cLen / 2, cThick, (Math.random() - 0.5) * 0.05, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sunset Horizon Fog Blend
      const fogHaze = ctx.createLinearGradient(0, 880, 0, 1024);
      fogHaze.addColorStop(0, 'rgba(255, 140, 60, 0.0)');
      fogHaze.addColorStop(1, 'rgba(148, 58, 41, 0.45)'); // Blends into scene fog (0x943a29)
      ctx.fillStyle = fogHaze;
      ctx.fillRect(0, 880, 2048, 144);
    } else {
      // 1. Deep Celestial Space Midnight Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 1024);
      skyGrad.addColorStop(0.0, '#010308'); // Deep Pitch Black Space
      skyGrad.addColorStop(0.55, '#030714');
      skyGrad.addColorStop(0.85, '#071026');
      skyGrad.addColorStop(1.0, '#0c1838'); // Ambient Night Horizon
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 2048, 1024);

      // 2. Luminous Milky Way Stellar Dust Lane
      const mwGrad = ctx.createLinearGradient(200, 0, 1800, 1024);
      mwGrad.addColorStop(0.0, 'rgba(147, 197, 253, 0.0)');
      mwGrad.addColorStop(0.45, 'rgba(191, 219, 254, 0.07)');
      mwGrad.addColorStop(0.55, 'rgba(221, 214, 254, 0.09)');
      mwGrad.addColorStop(0.7, 'rgba(167, 139, 250, 0.04)');
      mwGrad.addColorStop(1.0, 'rgba(147, 197, 253, 0.0)');
      ctx.fillStyle = mwGrad;
      ctx.fillRect(0, 0, 2048, 1024);

      // 3. 1,400 Realistic Sharp Multi-Magnitude Stars
      const starColors = ['#ffffff', '#f8fafc', '#e0f2fe', '#fef08a', '#ddd6fe'];
      for (let s = 0; s < 1400; s++) {
        const sx = Math.random() * 2048;
        const sy = Math.random() * 850; // Fade out near horizon
        const sRad = Math.random() < 0.88 ? 0.8 + Math.random() * 0.9 : 1.8 + Math.random() * 1.2;
        const sAlpha = 0.35 + Math.random() * 0.65;

        ctx.fillStyle = starColors[s % starColors.length];
        ctx.globalAlpha = sAlpha;
        ctx.beginPath();
        ctx.arc(sx, sy, sRad, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // 4. Photorealistic Detailed Moon & Silver Lunar Corona
      const moonX = 1180;
      const moonY = 210;
      const moonRad = 36;

      // Lunar Soft Blue-Silver Halo
      const moonHalo = ctx.createRadialGradient(moonX, moonY, moonRad, moonX, moonY, 260);
      moonHalo.addColorStop(0.0, 'rgba(219, 234, 254, 0.42)');
      moonHalo.addColorStop(0.4, 'rgba(186, 215, 253, 0.16)');
      moonHalo.addColorStop(1.0, 'rgba(12, 24, 56, 0.0)');
      ctx.fillStyle = moonHalo;
      ctx.beginPath();
      ctx.arc(moonX, moonY, 260, 0, Math.PI * 2);
      ctx.fill();

      // Moon Disc Base
      const moonGrad = ctx.createRadialGradient(moonX - 8, moonY - 8, 4, moonX, moonY, moonRad);
      moonGrad.addColorStop(0.0, '#ffffff');
      moonGrad.addColorStop(0.7, '#e2e8f0');
      moonGrad.addColorStop(1.0, '#cbd5e1');
      ctx.fillStyle = moonGrad;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRad, 0, Math.PI * 2);
      ctx.fill();

      // Realistic Lunar Maria (Dark basaltic crater plains)
      ctx.fillStyle = 'rgba(100, 116, 139, 0.55)';
      const mariaSpots = [
        [-8, -10, 12, 9],
        [10, -6, 10, 14],
        [-12, 8, 14, 11],
        [6, 12, 11, 8],
        [-2, 4, 8, 8],
      ];
      mariaSpots.forEach(([mx, my, rx, ry]) => {
        ctx.beginPath();
        ctx.ellipse(moonX + mx, moonY + my, rx, ry, 0.3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Night Horizon Fog Blend
      const fogHaze = ctx.createLinearGradient(0, 860, 0, 1024);
      fogHaze.addColorStop(0, 'rgba(8, 16, 36, 0.0)');
      fogHaze.addColorStop(1, 'rgba(6, 11, 24, 0.65)'); // Blends into scene fog (0x060b18)
      ctx.fillStyle = fogHaze;
      ctx.fillRect(0, 860, 2048, 164);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 8;
    return texture;
  }

  updateEnvironmentMap(mode = 'day') {
    if (!this.renderer) return;

    try {
      const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
      pmremGenerator.compileEquirectangularShader();

      if (this.currentSkyTexture) {
        this.currentSkyTexture.dispose();
      }

      this.currentSkyTexture = this.generateSkyTexture(mode);
      this.currentSkyTexture.mapping = THREE.EquirectangularReflectionMapping;

      const envRenderTarget = pmremGenerator.fromEquirectangular(this.currentSkyTexture);
      this.scene.environment = envRenderTarget.texture;
      this.scene.background = envRenderTarget.texture;

      if (this.skyDome) {
        this.skyDome.visible = false; // Sky rendered directly via scene.background at infinity
      }

      pmremGenerator.dispose();
    } catch (err) {
      console.warn('Could not compile PMREM environment map:', err);
    }
  }

  // =========================================================================
  // 2. PROCEDURAL SIEMENS GAMESA TEXTURES
  // =========================================================================

  generateTowerTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#e8edf3'; // Siemens Gamesa RAL 7035 Light Grey
    ctx.fillRect(0, 0, 1024, 2048);

    for (let y = 0; y < 2048; y += 3) {
      const alpha = 0.012 + Math.random() * 0.016;
      ctx.fillStyle = Math.random() > 0.5 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
      ctx.fillRect(0, y, 1024, 2);
    }

    const weldPositions = [260, 720, 1200, 1680];
    weldPositions.forEach((y) => {
      const hazGrad = ctx.createLinearGradient(0, y - 8, 0, y + 8);
      hazGrad.addColorStop(0, 'rgba(80, 95, 115, 0.0)');
      hazGrad.addColorStop(0.5, 'rgba(65, 80, 100, 0.22)');
      hazGrad.addColorStop(1, 'rgba(80, 95, 115, 0.0)');
      ctx.fillStyle = hazGrad;
      ctx.fillRect(0, y - 8, 1024, 16);

      ctx.fillStyle = 'rgba(50, 65, 85, 0.65)';
      ctx.fillRect(0, y - 2, 1024, 4);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.fillRect(0, y + 2, 1024, 2);

      const drip = ctx.createLinearGradient(0, y + 4, 0, y + 45);
      drip.addColorStop(0, 'rgba(40, 50, 65, 0.22)');
      drip.addColorStop(0.4, 'rgba(40, 50, 65, 0.08)');
      drip.addColorStop(1, 'rgba(40, 50, 65, 0.0)');
      ctx.fillStyle = drip;
      ctx.fillRect(0, y + 4, 1024, 41);
    });

    [256, 512, 768].forEach((x) => {
      ctx.fillStyle = 'rgba(90, 110, 130, 0.22)';
      ctx.fillRect(x - 1, 0, 2, 2048);
    });

    const baseGrime = ctx.createLinearGradient(0, 1850, 0, 2048);
    baseGrime.addColorStop(0, 'rgba(40, 55, 70, 0.0)');
    baseGrime.addColorStop(0.6, 'rgba(45, 60, 55, 0.28)');
    baseGrime.addColorStop(1.0, 'rgba(35, 45, 40, 0.62)');
    ctx.fillStyle = baseGrime;
    ctx.fillRect(0, 1850, 1024, 198);

    // Official WINDCARE MONITORING Tower Base Branding
    ctx.fillStyle = '#00646e';
    ctx.font = 'bold 36px "Outfit", sans-serif';
    ctx.fillText('WINDCARE MONITORING', 80, 1870);

    ctx.fillStyle = '#2c3a4d';
    ctx.font = 'bold 30px "JetBrains Mono", monospace';
    ctx.fillText('WTG-01 · SG 5.0-145', 80, 1910);

    ctx.font = 'bold 18px "JetBrains Mono", monospace';
    ctx.fillStyle = '#55657a';
    ctx.fillText('IEC 61400-1 CLASS S · 33kV OPTIMAFLEX GRID', 80, 1945);

    ctx.fillStyle = '#ffb800';
    ctx.fillRect(80, 1965, 360, 32);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px "Inter", sans-serif';
    ctx.fillText('⚡ DANGER: HIGH VOLTAGE 33,000V', 95, 1987);

    ctx.save();
    ctx.translate(0, 2026);
    for (let c = 0; c < 32; c++) {
      ctx.fillStyle = c % 2 === 0 ? '#ffb800' : '#1e293b';
      ctx.beginPath();
      ctx.moveTo(c * 32, 0);
      ctx.lineTo(c * 32 + 32, 0);
      ctx.lineTo(c * 32 + 16, 22);
      ctx.lineTo(c * 32 - 16, 22);
      ctx.fill();
    }
    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.anisotropy = 8;
    return texture;
  }

  generateTowerBumpMap() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 512, 1024);

    const weldPositions = [130, 360, 600, 840];
    weldPositions.forEach((y) => {
      ctx.fillStyle = '#404040';
      ctx.fillRect(0, y - 2, 512, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, y + 2, 512, 2);
    });

    [128, 256, 384].forEach((x) => {
      ctx.fillStyle = '#505050';
      ctx.fillRect(x - 1, 0, 2, 1024);
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  generateNacelleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f6f8fb';
    ctx.fillRect(0, 0, 1024, 1024);

    ctx.strokeStyle = 'rgba(70, 85, 105, 0.45)';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(0, 512);
    ctx.lineTo(1024, 512);
    ctx.stroke();

    [220, 512, 780].forEach((x) => {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1024);
      ctx.stroke();
    });

    ctx.fillStyle = 'rgba(40, 50, 65, 0.9)';
    ctx.fillRect(180, 60, 660, 120);

    for (let p = 0; p < 2500; p++) {
      const rx = 180 + Math.random() * 660;
      const ry = 60 + Math.random() * 120;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.2)';
      ctx.fillRect(rx, ry, 2, 2);
    }

    ctx.fillStyle = '#00646e';
    ctx.fillRect(80, 360, 580, 8);

    ctx.fillStyle = '#00646e';
    ctx.font = 'bold 44px "Outfit", sans-serif';
    ctx.fillText('WINDCARE', 80, 420);

    ctx.fillStyle = '#2b3642';
    ctx.font = '400 44px "Outfit", sans-serif';
    ctx.fillText('MONITORING', 320, 420);

    ctx.fillStyle = '#55657a';
    ctx.font = 'bold 15px "JetBrains Mono", monospace';
    ctx.fillText('INTELLIGENT WIND SCADA PLATFORM', 82, 452);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px "JetBrains Mono", monospace';
    ctx.fillText('SG 5.0-145 · OPTIMAFLEX™', 82, 490);

    ctx.fillStyle = '#ffb800';
    ctx.beginPath();
    ctx.moveTo(860, 410);
    ctx.lineTo(830, 455);
    ctx.lineTo(855, 455);
    ctx.lineTo(820, 510);
    ctx.lineTo(875, 445);
    ctx.lineTo(850, 445);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#1e293b';
    for (let v = 0; v < 16; v++) {
      ctx.fillRect(80, 610 + v * 13, 380, 7);
    }

    [320, 740].forEach((hx) => {
      ctx.strokeStyle = '#ffb800';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(hx, 220, 24, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(hx - 32, 220);
      ctx.lineTo(hx + 32, 220);
      ctx.moveTo(hx, 220 - 32);
      ctx.lineTo(hx, 220 + 32);
      ctx.stroke();
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 8;
    return texture;
  }

  generateBladeTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 512, 2048);

    const sparGrad = ctx.createLinearGradient(170, 0, 310, 0);
    sparGrad.addColorStop(0, 'rgba(0,0,0,0.0)');
    sparGrad.addColorStop(0.5, 'rgba(25,35,50,0.09)');
    sparGrad.addColorStop(1, 'rgba(0,0,0,0.0)');
    ctx.fillStyle = sparGrad;
    ctx.fillRect(170, 0, 140, 2048);

    ctx.fillStyle = 'rgba(60, 75, 95, 0.42)';
    ctx.fillRect(0, 0, 28, 1200);

    // Red Aviation Warning Bands (RAL 3020 Traffic Red)
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(0, 0, 512, 170);

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 170, 512, 70);

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(0, 240, 512, 110);

    // Patented DinoTails® Next Generation Serrations Graphics
    ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
    for (let st = 440; st < 1280; st += 16) {
      ctx.beginPath();
      ctx.moveTo(512, st);
      ctx.lineTo(482, st + 8);
      ctx.lineTo(512, st + 16);
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    for (let vg = 0; vg < 36; vg++) {
      const vy = 1150 + vg * 20;
      ctx.beginPath();
      ctx.moveTo(90, vy);
      ctx.lineTo(105, vy + 8);
      ctx.lineTo(90, vy + 16);
      ctx.stroke();
    }

    const receptorYs = [120, 380, 800, 1300, 1750];
    receptorYs.forEach((ry) => {
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(230, ry, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fde68a';
      ctx.beginPath();
      ctx.arc(230, ry, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#00646e';
    ctx.font = 'bold 22px "JetBrains Mono", monospace';
    ctx.save();
    ctx.translate(140, 1920);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('WINDCARE MONITORING IntegralBlade® · B71 · OPTIMA', 0, 0);
    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 8;
    return texture;
  }

  generateMountainRidgeTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');

    // 1. Pristine, manicured utility wind park green turf
    const lawnGrad = ctx.createLinearGradient(0, 0, 0, 2048);
    lawnGrad.addColorStop(0.0, '#386632');
    lawnGrad.addColorStop(0.5, '#42753a');
    lawnGrad.addColorStop(1.0, '#3a6833');
    ctx.fillStyle = lawnGrad;
    ctx.fillRect(0, 0, 2048, 2048);

    // Subtle, clean, uniform micro-grass texture (neat lawn stippling)
    const grassDots = ['#498240', '#325d2c', '#4e8a44', '#3c6c35'];
    for (let p = 0; p < 18000; p++) {
      const px = Math.random() * 2048;
      const py = Math.random() * 2048;
      const r = 1.0 + Math.random() * 2.2;
      ctx.fillStyle = grassDots[p % 4];
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // World coordinate helpers (2400m x 2400m plane)
    const worldToPx = (wx) => (wx / 2400 + 0.5) * 2048;
    const worldToPy = (wz) => (0.5 - wz / 2400) * 2048;

    // 2. Straight Modern Asphalt Service Road (runs cleanly along x = 8.5m)
    const roadX = 8.5;
    const roadPx = worldToPx(roadX);
    const roadTopPy = worldToPy(150);
    const roadBotPy = worldToPy(-1150);

    // Gravel road shoulders (width ~ 11.5m -> ~9.8 px)
    ctx.fillStyle = '#475569';
    ctx.fillRect(roadPx - 5.5, roadTopPy, 11, roadBotPy - roadTopPy);

    // Smooth dark asphalt roadway (width ~ 7.0m -> ~6.0 px)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(roadPx - 3.2, roadTopPy, 6.4, roadBotPy - roadTopPy);

    // Crisp white solid road edge lines
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(roadPx - 3.0, roadTopPy);
    ctx.lineTo(roadPx - 3.0, roadBotPy);
    ctx.moveTo(roadPx + 3.0, roadTopPy);
    ctx.lineTo(roadPx + 3.0, roadBotPy);
    ctx.stroke();

    // 3. Hero Turbine Hardstand & Substation Maintenance Apron
    // Main compacted slate crane pad / hardstand
    const padMinX = worldToPx(-18);
    const padMaxX = worldToPx(18);
    const padMinZ = worldToPy(22);
    const padMaxZ = worldToPy(-16);

    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(padMinX, padMinZ, padMaxX - padMinX, padMaxZ - padMinZ, 8);
    ctx.fill();

    // Circular concrete maintenance apron around hero turbine plinth (radius 16m)
    const heroPx = worldToPx(0);
    const heroPy = worldToPy(0);
    const apronRad = (16 / 2400) * 2048;

    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.arc(heroPx, heroPy, apronRad, 0, Math.PI * 2);
    ctx.fill();

    // Inner smooth concrete circle (radius 11m)
    const innerRad = (11 / 2400) * 2048;
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(heroPx, heroPy, innerRad, 0, Math.PI * 2);
    ctx.fill();

    // Substation & Powerhouse Crushed Granite Drainage Bed at x = 8.8, z = 1.4
    const subPxMin = worldToPx(4.5);
    const subPxMax = worldToPx(13.5);
    const subPyMin = worldToPy(9.0);
    const subPyMax = worldToPy(-6.5);
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(subPxMin, subPyMin, subPxMax - subPxMin, subPyMax - subPyMin, 5);
    ctx.fill();

    // Safety yellow hatched pedestrian walkway connecting turbine stairs to powerhouse & transformer
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(worldToPx(0), worldToPy(3.5));
    ctx.lineTo(worldToPx(4.8), worldToPy(3.5));
    ctx.lineTo(worldToPx(4.8), worldToPy(-2.2));
    ctx.stroke();

    // Dedicated service truck parking bay markings at x = 12.0, z = 10.0
    const parkPx = worldToPx(12.0);
    const parkPy = worldToPy(10.0);
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(parkPx - 3.5, parkPy - 4.5, 7, 9);

    // Single Turbine Ground: Auxiliary ridge pads removed for clean, focused site presentation

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.anisotropy = 8;
    return texture;
  }

  // =========================================================================
  // 3. ATMOSPHERE & LIGHTING
  // =========================================================================

  buildAtmosphericSky() {
    const skyGeo = new THREE.SphereGeometry(950, 48, 32);
    const skyMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.BackSide,
      depthWrite: false,
    });
    this.skyDome = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(this.skyDome);

    this.cloudsGroup = new THREE.Group();
    this.cloudsList = [];

    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.95,
      metalness: 0.0,
      transparent: true,
      opacity: 0.82,
      flatShading: true,
    });

    const cloudClusterCount = 24;
    for (let c = 0; c < cloudClusterCount; c++) {
      const cluster = new THREE.Group();
      const cx = (Math.random() - 0.5) * 850;
      const cz = (Math.random() - 0.5) * 850;
      const cy = 340 + Math.random() * 90;
      cluster.position.set(cx, cy, cz);

      const puffCount = 5 + Math.floor(Math.random() * 4);
      for (let p = 0; p < puffCount; p++) {
        const puffRadius = 24 + Math.random() * 30;
        const puffGeo = new THREE.DodecahedronGeometry(puffRadius, 1);
        const puff = new THREE.Mesh(puffGeo, cloudMat);
        puff.position.set(
          (Math.random() - 0.5) * 48,
          (Math.random() - 0.5) * 16,
          (Math.random() - 0.5) * 48
        );
        puff.scale.set(1.4, 0.65, 1.25);
        cluster.add(puff);
      }

      this.cloudsGroup.add(cluster);
      this.cloudsList.push({
        group: cluster,
        speedFactor: 0.65 + Math.random() * 0.5,
      });
    }

    this.scene.add(this.cloudsGroup);
  }

  setupLighting() {
    this.ambientLight = new THREE.AmbientLight(0xd8e8f8, 0.42);
    this.scene.add(this.ambientLight);

    // Sky soft azure, ground natural alpine grass bounce
    this.hemiLight = new THREE.HemisphereLight(0x89b0d6, 0x3a4835, 0.48);
    this.scene.add(this.hemiLight);

    // Natural directional sunlight angled to clearly highlight turbine contours & blades
    this.dirLight = new THREE.DirectionalLight(0xfff7ee, 1.5);
    this.dirLight.position.set(-160, 95, 120);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 10;
    this.dirLight.shadow.camera.far = 1400;
    this.dirLight.shadow.camera.left = -260;
    this.dirLight.shadow.camera.right = 260;
    this.dirLight.shadow.camera.top = 280;
    this.dirLight.shadow.camera.bottom = -50;
    this.dirLight.shadow.bias = -0.00015;
    this.dirLight.shadow.radius = 2.0;
    this.scene.add(this.dirLight);

    const sunGeo = new THREE.SphereGeometry(14, 24, 24);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfff5e6 });
    this.sunSphere = new THREE.Mesh(sunGeo, sunMat);
    this.sunSphere.position.copy(this.dirLight.position).multiplyScalar(2.2);
    this.scene.add(this.sunSphere);

    // Clear atmospheric mountain haze with high visual clarity
    this.scene.fog = new THREE.FogExp2(0x8eaec9, 0.00032);
  }

  buildMountainRidgeTerrain() {
    this.mountainRidgeGroup = new THREE.Group();
    this.onshoreGroup = this.mountainRidgeGroup;

    // 2400m x 2400m perfectly flat, clean ground plane
    const terrainGeo = new THREE.PlaneGeometry(2400, 2400, 32, 32);
    terrainGeo.rotateX(-Math.PI / 2);
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      map: this.generateMountainRidgeTexture(),
      roughness: 0.88,
      metalness: 0.04,
      flatShading: false,
    });

    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.position.y = 0.0;
    terrain.receiveShadow = true;
    this.mountainRidgeGroup.add(terrain);

    // Foundation Octagonal Concrete Base Footing (Step 1: y = 0.0 to 0.6)
    const footingGeo = new THREE.CylinderGeometry(7.6, 8.4, 0.6, 8);
    footingGeo.translate(0, 0.3, 0);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x828c9b,
      roughness: 0.88,
      metalness: 0.08,
    });
    const plinth = new THREE.Mesh(footingGeo, plinthMat);
    plinth.receiveShadow = true;
    plinth.castShadow = true;
    this.mountainRidgeGroup.add(plinth);

    // Foundation Cylindrical Pedestal (Step 2: y = 0.6 to 2.0)
    const pedGeo = new THREE.CylinderGeometry(4.6, 5.0, 1.4, 32);
    pedGeo.translate(0, 1.3, 0);
    const pedestal = new THREE.Mesh(pedGeo, plinthMat);
    pedestal.receiveShadow = true;
    pedestal.castShadow = true;
    this.mountainRidgeGroup.add(pedestal);

    // 64 Pre-tensioned Foundation Anchor Studs Ring
    const boltCircleGroup = new THREE.Group();
    boltCircleGroup.position.y = 2.02;
    const boltRadius = 2.75;
    const boltMat = new THREE.MeshStandardMaterial({ color: 0x222e3d, metalness: 0.85, roughness: 0.25 });
    const boltGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.16, 6);

    for (let b = 0; b < 64; b++) {
      const bAngle = (b * Math.PI * 2) / 64;
      const boltMesh = new THREE.Mesh(boltGeo, boltMat);
      boltMesh.position.set(Math.cos(bAngle) * boltRadius, 0.08, Math.sin(bAngle) * boltRadius);
      boltCircleGroup.add(boltMesh);
    }
    this.mountainRidgeGroup.add(boltCircleGroup);

    this.registerInspectable(plinth, {
      title: 'WINDCARE MONITORING Gravity Foundation & Anchor Ring',
      tag: 'WINDCARE CIVIL',
      desc: 'Reinforced concrete stepped gravity foundation on engineered sub-base. 160 pre-tensioned M42 anchor studs securely clamp the base tower flange against high aerodynamic shear loads.',
      specs: [
        { k: 'Footprint', v: 'Ø 16.8 m' },
        { k: 'Concrete Mass', v: '~1,650 Tons' },
        { k: 'Anchor Bolts', v: '160x M42 (10.9)' },
        { k: 'Foundation Type', v: 'Stepped Gravity Base' }
      ]
    });

    this.scene.add(this.mountainRidgeGroup);
  }

  /**
   * Scattered 3D Granite & Slate Rock Boulders poking through Highland Heather
   * Replicating the crags and boulders seen in the reference mountain photo!
   */
  buildScatteredRockBoulders() {
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x5a544d,
      roughness: 0.94,
      metalness: 0.05,
      flatShading: true,
    });

    const mossyRockMat = new THREE.MeshStandardMaterial({
      color: 0x4a5836, // Moss/lichen covered slate
      roughness: 0.92,
      metalness: 0.04,
      flatShading: true,
    });

    const boulderGroup = new THREE.Group();
    for (let i = 0; i < 90; i++) {
      const z = 80 - Math.random() * 750;
      const ridgeX = this.getRidgeX(z);
      // Place on both slopes flanking the crest road
      const side = Math.random() > 0.45 ? -1 : 1;
      const lateral = side * (7.0 + Math.random() * 28.0);
      const x = ridgeX + lateral;
      const y = this.getTerrainHeight(x, z);
      if (y < -20.0) continue; // Don't submerge below cloud sea

      const size = 0.75 + Math.random() * 1.85;
      const rGeo = new THREE.DodecahedronGeometry(size, 1);
      const pos = rGeo.attributes.position;
      for (let p = 0; p < pos.count; p++) {
        pos.setX(p, pos.getX(p) + (Math.sin(p * 2.3) * 0.22));
        pos.setY(p, pos.getY(p) * 0.68 + (Math.cos(p * 1.9) * 0.18));
        pos.setZ(p, pos.getZ(p) + (Math.sin(p * 3.1) * 0.22));
      }
      rGeo.computeVertexNormals();

      const chosenMat = Math.random() > 0.4 ? rockMat : mossyRockMat;
      const rock = new THREE.Mesh(rGeo, chosenMat);
      rock.position.set(x, y + size * 0.35, z);
      rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      rock.castShadow = true;
      rock.receiveShadow = true;
      boulderGroup.add(rock);
    }
    this.mountainRidgeGroup.add(boulderGroup);
  }

  buildVolumetricGrassMeadow() {
    const grassCount = 1800;

    // Cross-quad blade cluster geometry
    const gGeo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      // Quad 1 (along X)
      -0.35, 0.0, 0.0,
       0.35, 0.0, 0.0,
       0.35, 0.9, 0.0,
      -0.35, 0.9, 0.0,
      // Quad 2 (along Z)
       0.0, 0.0, -0.35,
       0.0, 0.0,  0.35,
       0.0, 0.9,  0.35,
       0.0, 0.9, -0.35,
    ]);
    const normals = new Float32Array([
      0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
      0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
    ]);
    const indices = [
      0, 1, 2,  0, 2, 3,
      4, 5, 6,  4, 6, 7
    ];
    gGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    gGeo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    gGeo.setIndex(indices);

    const grassMat = new THREE.MeshStandardMaterial({
      roughness: 0.88,
      metalness: 0.04,
      side: THREE.DoubleSide,
    });

    this.instancedGrass = new THREE.InstancedMesh(gGeo, grassMat, grassCount);
    this.instancedGrass.receiveShadow = true;

    const dummy = new THREE.Object3D();
    const flowerColors = [
      0x8b5220, 0xa66324, 0xbf7a30, 0x734316, // Golden Autumn Heather
      0xd9953b, 0xe5aa48,                     // Radiant Gorse Blooms (Golden Yellow)
      0x3d4e28, 0x2d3b1e,                     // Dark Highland Moss
      0xf1f5f9,                               // Mountain Edelweiss / Daisy (White)
      0xef4444,                               // Wild Alpine Poppies (Red)
    ];

    let planted = 0;
    while (planted < grassCount) {
      const gz = 70 - Math.random() * 650;
      const ridgeX = this.getRidgeX(gz);
      const lateral = (Math.random() - 0.5) * 36;
      const gx = ridgeX + lateral;

      // Avoid planting directly on the service road or concrete plinths
      const isRoad = Math.abs(lateral - 3.2) < 2.5;
      const isPlinth = Math.hypot(gx, gz) < 9.0;
      if (isRoad || isPlinth) continue;

      const gy = this.getTerrainHeight(gx, gz);
      if (gy < -22.0) continue; // Don't plant inside the cloud sea

      dummy.position.set(gx, gy, gz);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      const s = 0.75 + Math.random() * 0.65;
      dummy.scale.set(s, s * (0.8 + Math.random() * 0.4), s);
      dummy.updateMatrix();

      this.instancedGrass.setMatrixAt(planted, dummy.matrix);

      let cHex = flowerColors[Math.floor(Math.random() * 4)];
      const randType = Math.random();
      if (randType > 0.85) {
        cHex = flowerColors[4 + Math.floor(Math.random() * 2)]; // Gorse
      } else if (randType > 0.70) {
        cHex = flowerColors[6 + Math.floor(Math.random() * 2)]; // Moss
      }

      this.instancedGrass.setColorAt(planted, new THREE.Color(cHex));
      planted++;
    }

    if (this.instancedGrass.instanceColor) {
      this.instancedGrass.instanceColor.needsUpdate = true;
    }
    this.mountainRidgeGroup.add(this.instancedGrass);
  }

  buildSubstationTransformer() {
    const txGroup = new THREE.Group();
    txGroup.position.set(6.8, 0.0, 5.2);
    txGroup.rotation.y = -Math.PI / 4;

    const padGeo = new THREE.BoxGeometry(3.8, 0.4, 3.2);
    const padMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.y = 0.2;
    txGroup.add(pad);

    const cabinetGeo = new THREE.BoxGeometry(3.0, 2.2, 2.2);
    const cabinetMat = new THREE.MeshStandardMaterial({
      color: 0x22303c,
      roughness: 0.35,
      metalness: 0.4,
    });
    const cabinet = new THREE.Mesh(cabinetGeo, cabinetMat);
    cabinet.position.y = 1.5;
    cabinet.castShadow = true;
    txGroup.add(cabinet);

    // 3 High-Voltage Ceramic Ribbed Bushing Insulators on Top
    const ceramicMat = new THREE.MeshStandardMaterial({ color: 0x5c2c16, roughness: 0.25, metalness: 0.1 });
    const copperMat = new THREE.MeshStandardMaterial({ color: 0xb85d19, metalness: 0.9, roughness: 0.2 });
    [-0.8, 0.0, 0.8].forEach((bx) => {
      const bushingGeo = new THREE.CylinderGeometry(0.1, 0.14, 0.65, 12);
      const bushing = new THREE.Mesh(bushingGeo, ceramicMat);
      bushing.position.set(bx, 2.9, 0.2);
      txGroup.add(bushing);

      const terminalGeo = new THREE.SphereGeometry(0.06, 8, 8);
      const terminal = new THREE.Mesh(terminalGeo, copperMat);
      terminal.position.set(bx, 3.25, 0.2);
      txGroup.add(terminal);
    });

    const finMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 });
    [-1.15, 1.15].forEach((zSide) => {
      for (let f = 0; f < 10; f++) {
        const finGeo = new THREE.BoxGeometry(0.08, 1.8, 0.3);
        const fin = new THREE.Mesh(finGeo, finMat);
        fin.position.set(-1.0 + f * 0.22, 1.5, zSide);
        txGroup.add(fin);
      }
    });

    // High Voltage Danger Warning Placard
    const signGeo = new THREE.BoxGeometry(0.7, 0.45, 0.02);
    const signMat = new THREE.MeshStandardMaterial({ color: 0xffb800, roughness: 0.4 });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 1.8, 1.12);
    txGroup.add(sign);

    // Security Galvanized Chain-Link Fence
    const fenceMat = new THREE.MeshStandardMaterial({ color: 0x64748b, wireframe: true });
    const fenceGeo = new THREE.BoxGeometry(4.4, 2.2, 3.8);
    const fence = new THREE.Mesh(fenceGeo, fenceMat);
    fence.position.y = 1.1;
    txGroup.add(fence);

    const conduitGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.8, 12);
    const conduitMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    const conduit = new THREE.Mesh(conduitGeo, conduitMat);
    conduit.rotation.z = Math.PI / 3;
    conduit.position.set(-1.8, 0.7, 0);
    txGroup.add(conduit);

    this.mountainRidgeGroup.add(txGroup);

    this.registerInspectable(cabinet, {
      title: 'WINDCARE MONITORING 33kV Step-Up Substation Transformer',
      tag: 'ELECTRICAL INFRASTRUCTURE',
      desc: 'Pad-mounted hermetically sealed oil-immersed step-up transformer (690V to 33kV). Connects SG 5.0-145 into the wind farm medium-voltage collector grid.',
      specs: [
        { k: 'Rating', v: '5,500 kVA' },
        { k: 'Voltage Primary', v: '690 V (3-Phase)' },
        { k: 'Voltage Secondary', v: '33,000 V (Grid)' },
        { k: 'Cooling Class', v: 'ONAN (Natural Oil)' }
      ]
    });
  }

  // =========================================================================
  // 3b. VALLEY CLOUD INVERSION ("SEA OF CLOUDS") & DISTANT MOUNTAIN PEAKS
  // Replicating the natural highland mountain dawn inversion of the reference photo
  // =========================================================================

  generateCloudSeaTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Soft warm ivory dawn cloud base
    ctx.fillStyle = '#fbf5ed';
    ctx.fillRect(0, 0, 1024, 1024);

    // Multi-scale soft cumulus billow clusters
    for (let i = 0; i < 450; i++) {
      const cx = Math.random() * 1024;
      const cy = Math.random() * 1024;
      const rad = 30 + Math.random() * 160;
      const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, rad);
      grad.addColorStop(0.0, 'rgba(255, 255, 255, 0.55)');
      grad.addColorStop(0.45, 'rgba(255, 238, 220, 0.28)');
      grad.addColorStop(0.85, 'rgba(235, 210, 190, 0.08)');
      grad.addColorStop(1.0, 'rgba(220, 195, 175, 0.0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    texture.anisotropy = 8;
    return texture;
  }

  buildValleyCloudSea() {
    this.cloudClusters = [];
    const cloudGroup = new THREE.Group();

    // 1. High-Resolution Undulating Cloud Blanket in the Valleys at y = -26.0m
    const segments = 128;
    const cloudGeo = new THREE.PlaneGeometry(2800, 2800, segments, segments);
    cloudGeo.rotateX(-Math.PI / 2);

    const count = cloudGeo.attributes.position.count;
    this.cloudSeaOriginalPositions = new Float32Array(count * 3);
    const posArr = cloudGeo.attributes.position.array;
    for (let i = 0; i < count * 3; i++) {
      this.cloudSeaOriginalPositions[i] = posArr[i];
    }
    this.cloudSeaGeometry = cloudGeo;

    const cloudTexture = this.generateCloudSeaTexture();

    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xfbf6ef, // Warm ivory/peach dawn sea of clouds
      map: cloudTexture,
      roughness: 0.96,
      metalness: 0.02,
      transparent: true,
      opacity: 0.94,
      depthWrite: true,
    });

    this.cloudSeaMesh = new THREE.Mesh(cloudGeo, cloudMat);
    this.cloudSeaMesh.position.y = -26.0;
    this.cloudSeaMesh.receiveShadow = true;
    cloudGroup.add(this.cloudSeaMesh);

    // 2. Thick Volumetric 3D Cumulus Cloud Clusters in the Mountain Valleys
    const puffMat = new THREE.MeshStandardMaterial({
      color: 0xfdf8f2,
      roughness: 0.95,
      transparent: true,
      opacity: 0.88,
    });

    for (let c = 0; c < 48; c++) {
      const cluster = new THREE.Group();
      // Distribute clusters throughout the valleys (away from ridge crest)
      const cz = (Math.random() - 0.5) * 1800;
      const ridgeCenter = this.getRidgeX(cz);
      const side = Math.random() > 0.5 ? 1 : -1;
      const cx = ridgeCenter + side * (80 + Math.random() * 520);
      const cy = -26.0 + (Math.random() - 0.5) * 10.0;
      cluster.position.set(cx, cy, cz);

      const puffs = 5 + Math.floor(Math.random() * 4);
      for (let p = 0; p < puffs; p++) {
        const radius = 26 + Math.random() * 38;
        const pGeo = new THREE.DodecahedronGeometry(radius, 1);
        pGeo.scale(1.5, 0.62, 1.35);
        const pMesh = new THREE.Mesh(pGeo, puffMat);
        pMesh.position.set(
          (Math.random() - 0.5) * 55,
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 55
        );
        pMesh.receiveShadow = true;
        cluster.add(pMesh);
      }

      cloudGroup.add(cluster);
      this.cloudClusters.push(cluster);
    }

    this.scene.add(cloudGroup);
  }

  /**
   * Distant Mountain Peaks rising through the Valley Cloud Inversion
   * Prominently featuring the sharp triangular pyramid summit on the right horizon matching the reference photo!
   */
  buildDistantMountainPeaks() {
    this.distantPeaksGroup = new THREE.Group();

    const mountainRockMat = new THREE.MeshStandardMaterial({
      color: 0x48423c, // Slate/granite alpine rock
      roughness: 0.95,
      metalness: 0.05,
      flatShading: true,
    });

    const sunlitRockMat = new THREE.MeshStandardMaterial({
      color: 0x826952, // Warm morning sun reflection on mountain rock
      roughness: 0.92,
      metalness: 0.05,
      flatShading: true,
    });

    // 1. The Iconic Triangular Pyramid Mountain Summit on Right Horizon (Azimuth ~50°)
    // Exactly matches the prominent pyramid peak visible in the user's reference photograph!
    const pyramidGroup = new THREE.Group();
    pyramidGroup.position.set(480, 0, -720);

    // Sharp pyramid cone with 7 irregular craggy facets
    const peakGeo = new THREE.ConeGeometry(190, 235, 7);
    peakGeo.translate(0, 117.5, 0);
    const peakPos = peakGeo.attributes.position;
    for (let i = 0; i < peakPos.count; i++) {
      const y = peakPos.getY(i);
      if (y > 10 && y < 225) {
        const factor = 1.0 - y / 235.0;
        peakPos.setX(i, peakPos.getX(i) + (Math.sin(i * 3.7) * 9.5) * factor);
        peakPos.setZ(i, peakPos.getZ(i) + (Math.cos(i * 4.1) * 9.5) * factor);
      }
    }
    peakGeo.computeVertexNormals();

    const peakMesh = new THREE.Mesh(peakGeo, sunlitRockMat);
    peakMesh.receiveShadow = true;
    peakMesh.castShadow = true;
    pyramidGroup.add(peakMesh);
    this.distantPeaksGroup.add(pyramidGroup);

    // 2. Surrounding Distant Mountain Ridges & Massifs piercing above the Cloud Sea
    const massifConfigs = [
      { x: -750, z: -880, radius: 260, height: 195 },
      { x: -380, z: -1180, radius: 310, height: 215 },
      { x: 140, z: -1320, radius: 360, height: 245 },
      { x: 740, z: -1080, radius: 290, height: 205 },
      { x: -920, z: -460, radius: 230, height: 175 },
      { x: 920, z: -420, radius: 240, height: 185 },
      { x: -580, z: -1420, radius: 380, height: 260 },
      { x: 420, z: -1450, radius: 390, height: 270 },
    ];

    massifConfigs.forEach((mc) => {
      const massifGeo = new THREE.ConeGeometry(mc.radius, mc.height, 8);
      massifGeo.translate(0, mc.height / 2, 0);
      const mPos = massifGeo.attributes.position;
      for (let i = 0; i < mPos.count; i++) {
        const y = mPos.getY(i);
        if (y > 10 && y < mc.height - 10) {
          const factor = 1.0 - y / mc.height;
          mPos.setX(i, mPos.getX(i) + Math.sin(i * 2.9) * 14.0 * factor);
          mPos.setZ(i, mPos.getZ(i) + Math.cos(i * 3.3) * 14.0 * factor);
        }
      }
      massifGeo.computeVertexNormals();

      const mMesh = new THREE.Mesh(massifGeo, mountainRockMat);
      mMesh.position.set(mc.x, -32, mc.z);
      mMesh.receiveShadow = true;
      this.distantPeaksGroup.add(mMesh);
    });

    this.scene.add(this.distantPeaksGroup);
  }

  /**
   * Practical Wind Farm Meteorological Mast (Met Mast Tower)
   * 60m guyed lattice tower with multi-height anemometers and LiDAR sensor
   */
  buildMetMastAnemometerTower() {
    const mastGroup = new THREE.Group();
    const mastZ = 55.0;
    const mastX = this.getRidgeX(mastZ) + 14.0; // Installed along ridge crest
    const groundY = this.getTerrainHeight(mastX, mastZ);
    mastGroup.position.set(mastX, groundY, mastZ);

    const mastMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.85,
      roughness: 0.25,
    });
    const orangeMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      metalness: 0.4,
      roughness: 0.4,
    });

    // Concrete Footing Pad
    const padGeo = new THREE.BoxGeometry(4.2, 0.6, 4.2);
    const pad = new THREE.Mesh(padGeo, new THREE.MeshStandardMaterial({ color: 0x71717a }));
    pad.position.y = 0.3;
    pad.receiveShadow = true;
    mastGroup.add(pad);

    // 60m Triangular Lattice Mast in 6m alternating white/orange aviation sections
    const towerH = 60.0;
    const sectionH = 6.0;
    const sections = 10;

    for (let s = 0; s < sections; s++) {
      const isOrange = s % 2 === 1;
      const legGeo = new THREE.CylinderGeometry(0.04, 0.04, sectionH, 6);
      const legMat = isOrange ? orangeMat : mastMat;

      // 3 corner legs of equilateral triangle
      [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].forEach((angle) => {
        const rad = 0.85 * (1.0 - (s / sections) * 0.35); // Slight taper
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(Math.cos(angle) * rad, s * sectionH + sectionH / 2 + 0.6, Math.sin(angle) * rad);
        mastGroup.add(leg);
      });

      // Horizontal and diagonal cross-braces
      const braceGeo = new THREE.BoxGeometry(1.2, 0.025, 0.025);
      const brace = new THREE.Mesh(braceGeo, legMat);
      brace.position.y = (s + 1) * sectionH + 0.6;
      mastGroup.add(brace);
    }

    // Measurement Booms at 20m, 40m, and 60m height
    [20.0, 40.0, 60.0].forEach((height) => {
      const boomGeo = new THREE.CylinderGeometry(0.02, 0.02, 2.4, 6);
      boomGeo.rotateZ(Math.PI / 2);
      const boom = new THREE.Mesh(boomGeo, mastMat);
      boom.position.set(1.2, height + 0.6, 0);
      mastGroup.add(boom);

      // Cup Anemometer
      const cupHead = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.15, 8), orangeMat);
      cupHead.position.set(2.4, height + 0.7, 0);
      mastGroup.add(cupHead);
    });

    // Top FAA Solar Aviation Obstruction Red Strobe Light
    const topStrobe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.25, 8),
      new THREE.MeshBasicMaterial({ color: 0xff0033 })
    );
    topStrobe.position.set(0, towerH + 0.8, 0);
    mastGroup.add(topStrobe);

    // Weather Solar Panel & Telemetry Logger Enclosure
    const boxGeo = new THREE.BoxGeometry(0.8, 1.2, 0.5);
    const box = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5 }));
    box.position.set(0, 2.2, 0);
    mastGroup.add(box);

    const solarGeo = new THREE.BoxGeometry(1.0, 0.04, 0.7);
    const solar = new THREE.Mesh(solarGeo, new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.9 }));
    solar.position.set(0, 3.2, 0.4);
    solar.rotation.x = 0.5;
    mastGroup.add(solar);

    this.onshoreGroup.add(mastGroup);

    this.registerInspectable(box, {
      title: 'IEC 61400-12 Calibrated Meteorological Measurement Mast',
      tag: 'RESOURCE ASSESSMENT',
      desc: '60m guyed lattice met tower equipped with calibrated Class 1 cup anemometers, 3D sonic anemometers, and LiDAR wind profiler. Continuous monitoring of highland wind shear and turbulence intensity.',
      specs: [
        { k: 'Mast Height', v: '60.0 m AGL' },
        { k: 'Wind Shear (α)', v: '0.142 (Highland Ridge)' },
        { k: 'Turbulence Int.', v: '11.8% (IEC Class IIA)' },
        { k: 'LiDAR Sensor', v: 'Continuous Pulsed Doppler' }
      ]
    });
  }


  // =========================================================================
  // 4. SIEMENS GAMESA TURBINE WITH ZERO-GAP SLEEVED YAW JOINT
  // =========================================================================

  buildWindTurbine() {
    this.towerGroup = new THREE.Group();

    // 1. Tapered Conical Steel Tower (Flange reaches exactly to Hub Height - 1.0m)
    const towerRadiusBottom = 2.55;
    const towerRadiusTop = 1.76;
    const towerHeight = this.HUB_HEIGHT - 2.5; // reaches to 107.0m

    const towerGeo = new THREE.CylinderGeometry(towerRadiusTop, towerRadiusBottom, towerHeight, 48, 36, true);
    towerGeo.translate(0, towerHeight / 2 + 2.0, 0); // Base at 2.0m, top exactly at 107.0m

    const towerMat = new THREE.MeshStandardMaterial({
      map: this.generateTowerTexture(),
      bumpMap: this.generateTowerBumpMap(),
      bumpScale: 0.04,
      roughness: 0.32,
      metalness: 0.28,
    });

    this.towerMesh = new THREE.Mesh(towerGeo, towerMat);
    this.towerMesh.castShadow = true;
    this.towerMesh.receiveShadow = true;
    this.towerGroup.add(this.towerMesh);

    // Circumferential Section Flanges
    const flangeHeights = [2.0, 29.0, 57.0, 85.0, 107.0];
    flangeHeights.forEach((h) => {
      const radiusAtH = THREE.MathUtils.lerp(towerRadiusBottom, towerRadiusTop, (h - 2.0) / towerHeight) + 0.12;
      const flangeGeo = new THREE.TorusGeometry(radiusAtH, 0.11, 8, 48);
      flangeGeo.rotateX(Math.PI / 2);
      flangeGeo.translate(0, h, 0);
      const flangeMesh = new THREE.Mesh(flangeGeo, towerMat);
      this.towerGroup.add(flangeMesh);
    });

    // Top Tower Clamping Lip (Machined steel collar at 107.0m)
    const topCapGeo = new THREE.CylinderGeometry(towerRadiusTop + 0.08, towerRadiusTop, 0.4, 48);
    const topCapMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.25 });
    const topCap = new THREE.Mesh(topCapGeo, topCapMat);
    topCap.position.y = 107.0;
    this.towerGroup.add(topCap);

    // Tower Portal Door & Stairs
    this.buildTowerPortalStairs(towerRadiusBottom);

    this.scene.add(this.towerGroup);

    // 2. Nacelle & Yaw Deck Group (Mounted exactly on top of tower)
    this.nacelleGroup = new THREE.Group();
    this.nacelleGroup.position.set(0, this.HUB_HEIGHT, 0);

    // FIXED ZERO-GAP YAW SLEEVING COLLAR:
    // Extends from y = 0.0 (bedplate bottom) all the way down to y = -1.6m (105.9m world),
    // overlapping the 107.0m tower top by over 1.0 meter! Impossible to gap!
    const yawRingGeo = new THREE.CylinderGeometry(1.88, 1.84, 1.6, 48);
    const yawRingMat = new THREE.MeshStandardMaterial({ color: 0x222e3d, metalness: 0.75, roughness: 0.28 });
    const yawRing = new THREE.Mesh(yawRingGeo, yawRingMat);
    yawRing.position.set(0, -0.75, 0);
    this.nacelleGroup.add(yawRing);

    // External Labyrinth Weather Seal Ring (Bridging the joint between tower and nacelle)
    const sealGeo = new THREE.TorusGeometry(1.88, 0.09, 8, 48);
    sealGeo.rotateX(Math.PI / 2);
    const sealMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.95 });
    const sealMesh = new THREE.Mesh(sealGeo, sealMat);
    sealMesh.position.set(0, -0.6, 0);
    this.nacelleGroup.add(sealMesh);

    // 4 Electric Yaw Drive Pinion Motors (Meshed with tower-top bull gear)
    this.yawPinions = [];
    const pinionMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.22 });
    for (let ym = 0; ym < 4; ym++) {
      const yAngle = (ym * Math.PI * 2) / 4 + 0.35;
      const motorGroup = new THREE.Group();
      motorGroup.position.set(Math.cos(yAngle) * 1.55, -0.4, Math.sin(yAngle) * 1.55);

      const motorGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.65, 16);
      const motor = new THREE.Mesh(motorGeo, yawRingMat);
      motor.position.y = 0.15;
      motorGroup.add(motor);

      // Rotating drive pinion with machined gear teeth
      const pinionGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.28, 14);
      const pinion = new THREE.Mesh(pinionGeo, pinionMat);
      pinion.position.y = -0.3;
      motorGroup.add(pinion);
      this.yawPinions.push(pinion);

      this.nacelleGroup.add(motorGroup);
    }

    // Heavy Cast Bedplate Structural Chassis (Clamped directly above yaw ring)
    const bedplateGeo = new THREE.BoxGeometry(3.9, 0.6, 13.5);
    const bedplateMat = new THREE.MeshStandardMaterial({ color: 0x192231, metalness: 0.8, roughness: 0.25 });
    const bedplate = new THREE.Mesh(bedplateGeo, bedplateMat);
    bedplate.position.set(0, 0.3, -2.0); // bottom at y = 0.0, top at y = 0.6m
    this.nacelleGroup.add(bedplate);

    // 3. Faceted Siemens Gamesa SG 5.0-145 Nacelle Shell
    this.buildSculptedNacelleHousing();

    // 4. Rooftop Cooling System, Dual Spinning Radiator Fans, Handrails & Jib Crane
    this.buildNacelleRooftopEquipment();

    // 5. Internal Drivetrain (Low-Speed Shaft, 3-Stage Planetary Gearbox, High-Speed Shaft, Brake & 5.0 MW DFIG)
    this.buildDrivetrainInternals();

    // 6. Rotor Assembly: Conical Hub Spinner + 3x 71m IntegralBlade® with DinoTails®
    this.buildRotorAssembly();

    this.scene.add(this.nacelleGroup);
  }

  buildBasementSubstationPowerhouse() {
    this.substationGroup = new THREE.Group();

    // 1. Material Library
    const concretePlinthMat = new THREE.MeshStandardMaterial({
      color: 0x5a6578,
      roughness: 0.88,
      metalness: 0.08,
    });
    const concreteFootingMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.94,
      metalness: 0.05,
    });
    const buildingWallMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // RAL 7035 Light Grey Precast Architectural Panels
      roughness: 0.48,
      metalness: 0.12,
    });
    const sgreTealMat = new THREE.MeshStandardMaterial({
      color: 0x00646e, // Siemens Gamesa Corporate Livery
      roughness: 0.35,
      metalness: 0.45,
    });
    const darkSteelMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.38,
      metalness: 0.82,
    });
    const transformerTankMat = new THREE.MeshStandardMaterial({
      color: 0x243242, // Electrical transformer deep slate
      roughness: 0.35,
      metalness: 0.68,
    });
    const copperBusMat = new THREE.MeshStandardMaterial({
      color: 0xb45309, // Heavy electrolytic copper busbars
      roughness: 0.22,
      metalness: 0.95,
    });
    const porcelainMat = new THREE.MeshStandardMaterial({
      color: 0x78350f, // High-voltage brown glazed porcelain insulator
      roughness: 0.15,
      metalness: 0.1,
    });
    const hazardYellowMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Safety High-Voltage Yellow
      roughness: 0.35,
      metalness: 0.2,
    });
    const gravelMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Crushed granite ballast drainage bed
      roughness: 0.96,
      metalness: 0.04,
    });
    const fenceWireMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.6,
      metalness: 0.85,
      wireframe: true,
    });

    // -------------------------------------------------------------------------
    // A. FOUNDATION CLAMP RING & CABLE INTERCONNECTS
    // -------------------------------------------------------------------------
    // High-Tensile Foundation Flange Clamp Collar
    const boltRingGeo = new THREE.TorusGeometry(2.72, 0.08, 8, 48);
    boltRingGeo.rotateX(Math.PI / 2);
    boltRingGeo.translate(0, 2.02, 0);
    const boltRing = new THREE.Mesh(boltRingGeo, darkSteelMat);
    this.substationGroup.add(boltRing);

    // -------------------------------------------------------------------------
    // B. SUBTERRANEAN BASEMENT CABLE VAULT & INVERTER CHAMBER
    // -------------------------------------------------------------------------
    const vaultGroup = new THREE.Group();
    vaultGroup.position.set(3.4, 0, 1.0);

    // Concrete Vault Shaft Walls (Extending down to -3.2m)
    const vaultWallsGeo = new THREE.BoxGeometry(3.6, 3.2, 4.2);
    vaultWallsGeo.translate(0, -1.6, 0);
    const vaultWalls = new THREE.Mesh(vaultWallsGeo, concreteFootingMat);
    vaultWalls.receiveShadow = true;
    vaultGroup.add(vaultWalls);

    // Basement Steel Floor Grating & Tempered Walk-On Inspection Glass
    const grateGeo = new THREE.BoxGeometry(3.2, 0.08, 3.8);
    const grateMat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      metalness: 0.3,
      roughness: 0.1,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
    });
    const grateMesh = new THREE.Mesh(grateGeo, grateMat);
    grateMesh.position.set(0, 0.05, 0);
    vaultGroup.add(grateMesh);

    // Heavy Industrial Floor Grating Support Frame
    const frameGeo = new THREE.BoxGeometry(3.4, 0.14, 4.0);
    const frameMesh = new THREE.Mesh(frameGeo, darkSteelMat);
    frameMesh.position.set(0, 0.02, 0);
    vaultGroup.add(frameMesh);

    // Subterranean Inverter & Converter Cabinets (Inside basement vault at y = -1.8m)
    for (let inv = 0; inv < 3; inv++) {
      const invGeo = new THREE.BoxGeometry(0.8, 1.8, 0.9);
      const invMesh = new THREE.Mesh(invGeo, darkSteelMat);
      invMesh.position.set(-0.9 + inv * 0.9, -1.8, 0.2);
      vaultGroup.add(invMesh);

      // Status LED indicator strip
      const ledGeo = new THREE.BoxGeometry(0.5, 0.06, 0.04);
      const ledMat = new THREE.MeshBasicMaterial({ color: inv === 0 ? 0x00f2fe : 0x10b981 });
      const ledMesh = new THREE.Mesh(ledGeo, ledMat);
      ledMesh.position.set(-0.9 + inv * 0.9, -1.2, 0.68);
      vaultGroup.add(ledMesh);
    }

    // Heavy Copper 690V Busbars running along basement ceiling into transformer
    for (let bb = 0; bb < 3; bb++) {
      const busGeo = new THREE.BoxGeometry(2.8, 0.05, 0.08);
      const busMesh = new THREE.Mesh(busGeo, copperBusMat);
      busMesh.position.set(0, -0.3 - bb * 0.12, -0.6);
      vaultGroup.add(busMesh);
    }

    // Subterranean Basement Work Light (Cool glow illuminating underground vault)
    const basementWorkLight = new THREE.PointLight(0x00f2fe, 1.8, 10, 1.4);
    basementWorkLight.position.set(0, -1.2, 0);
    vaultGroup.add(basementWorkLight);

    // Basement Steel Access Stairs
    const bStairMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    for (let st = 0; st < 6; st++) {
      const stGeo = new THREE.BoxGeometry(1.0, 0.08, 0.28);
      const stMesh = new THREE.Mesh(stGeo, bStairMat);
      stMesh.position.set(1.1, -0.3 - st * 0.45, 1.2 - st * 0.28);
      vaultGroup.add(stMesh);
    }

    // Safety Yellow Guardrails around vault perimeter
    const bRailMat = hazardYellowMat;
    [-1.6, 1.6].forEach((rx) => {
      const rPostGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.1, 8);
      const rPost = new THREE.Mesh(rPostGeo, bRailMat);
      rPost.position.set(rx, 0.55, 1.9);
      vaultGroup.add(rPost);

      const rPost2 = new THREE.Mesh(rPostGeo, bRailMat);
      rPost2.position.set(rx, 0.55, -1.9);
      vaultGroup.add(rPost2);
    });

    const topRailGeo = new THREE.CylinderGeometry(0.022, 0.022, 3.8, 8);
    topRailGeo.rotateX(Math.PI / 2);
    const railL = new THREE.Mesh(topRailGeo, bRailMat);
    railL.position.set(-1.6, 1.05, 0);
    vaultGroup.add(railL);

    this.basementVaultMesh = vaultWalls;
    this.substationGroup.add(vaultGroup);

    // Concrete Cable Trench with Removable Diamond-Plate Steel Covers leading to Substation
    const trenchGeo = new THREE.BoxGeometry(5.2, 0.35, 1.2);
    trenchGeo.translate(6.2, 0.05, 1.0);
    const trenchMesh = new THREE.Mesh(trenchGeo, darkSteelMat);
    trenchMesh.receiveShadow = true;
    this.substationGroup.add(trenchMesh);

    // -------------------------------------------------------------------------
    // C. ARCHITECTURAL POWERHOUSE BUILDING (SCADA & MV SWITCHGEAR)
    // -------------------------------------------------------------------------
    const phGroup = new THREE.Group();
    phGroup.position.set(8.8, 0, -2.4);

    // Powerhouse Plinth (Dark slate base)
    const phBaseGeo = new THREE.BoxGeometry(5.4, 0.5, 7.4);
    phBaseGeo.translate(0, 0.25, 0);
    const phBase = new THREE.Mesh(phBaseGeo, darkSteelMat);
    phBase.receiveShadow = true;
    phGroup.add(phBase);

    // Main Powerhouse Architectural Enclosure (RAL 7035 precast panels)
    const phBodyGeo = new THREE.BoxGeometry(5.2, 3.2, 7.2);
    phBodyGeo.translate(0, 2.1, 0);
    this.powerhouseMesh = new THREE.Mesh(phBodyGeo, buildingWallMat);
    this.powerhouseMesh.castShadow = true;
    this.powerhouseMesh.receiveShadow = true;
    phGroup.add(this.powerhouseMesh);

    // Siemens Gamesa Teal Signature Architectural Stripe
    const phStripeGeo = new THREE.BoxGeometry(5.26, 0.32, 7.26);
    phStripeGeo.translate(0, 2.8, 0);
    const phStripe = new THREE.Mesh(phStripeGeo, sgreTealMat);
    phGroup.add(phStripe);

    // Parapet Roof Coping Flashing
    const phRoofGeo = new THREE.BoxGeometry(5.4, 0.18, 7.4);
    phRoofGeo.translate(0, 3.75, 0);
    const phRoof = new THREE.Mesh(phRoofGeo, darkSteelMat);
    phGroup.add(phRoof);

    // Double Steel Security Blast Doors
    const phDoorGeo = new THREE.BoxGeometry(0.12, 2.4, 1.8);
    const phDoor = new THREE.Mesh(phDoorGeo, darkSteelMat);
    phDoor.position.set(-2.64, 1.7, 0.2);
    phGroup.add(phDoor);

    // Safety Placard on Door
    const phSignGeo = new THREE.BoxGeometry(0.04, 0.45, 0.7);
    const phSign = new THREE.Mesh(phSignGeo, hazardYellowMat);
    phSign.position.set(-2.72, 2.2, 0.2);
    phGroup.add(phSign);

    // Siemens Gamesa Powerhouse Corporate Plaque
    const phBadgeGeo = new THREE.BoxGeometry(0.04, 0.25, 1.1);
    const phBadge = new THREE.Mesh(phBadgeGeo, sgreTealMat);
    phBadge.position.set(-2.72, 1.55, 0.2);
    phGroup.add(phBadge);

    // Louvered Air Intake Grille for Switchgear Heat Dissipation
    const louverGeo = new THREE.BoxGeometry(0.06, 1.2, 2.2);
    const louverMesh = new THREE.Mesh(louverGeo, darkSteelMat);
    louverMesh.position.set(-2.64, 2.2, -2.0);
    phGroup.add(louverMesh);

    // Rooftop HVAC Industrial Chiller Unit
    const hvacGeo = new THREE.BoxGeometry(1.8, 0.85, 2.4);
    hvacGeo.translate(0.6, 4.25, -1.0);
    const hvacMesh = new THREE.Mesh(hvacGeo, darkSteelMat);
    phGroup.add(hvacMesh);

    // Rooftop SCADA Communications Mast & GPS Receiver
    const antPoleGeo = new THREE.CylinderGeometry(0.04, 0.05, 3.2, 8);
    antPoleGeo.translate(-1.8, 5.2, -2.8);
    const antPole = new THREE.Mesh(antPoleGeo, darkSteelMat);
    phGroup.add(antPole);

    const dishGeo = new THREE.CylinderGeometry(0.4, 0.05, 0.2, 16);
    dishGeo.rotateZ(0.6);
    dishGeo.translate(-1.8, 6.2, -2.8);
    const dish = new THREE.Mesh(dishGeo, buildingWallMat);
    phGroup.add(dish);

    // Exterior LED Safety Entrance Floodlight
    const floodlightGeo = new THREE.BoxGeometry(0.25, 0.15, 0.2);
    const floodlight = new THREE.Mesh(floodlightGeo, darkSteelMat);
    floodlight.position.set(-2.7, 3.1, 0.2);
    phGroup.add(floodlight);

    const phFloodLight = new THREE.PointLight(0xfffaed, 1.4, 14, 1.5);
    phFloodLight.position.set(-3.2, 2.9, 0.2);
    phGroup.add(phFloodLight);

    this.substationGroup.add(phGroup);

    // -------------------------------------------------------------------------
    // D. 33 kV STEP-UP PAD-MOUNTED TRANSFORMER YARD
    // -------------------------------------------------------------------------
    const txGroup = new THREE.Group();
    txGroup.position.set(8.8, 0, 5.2);

    // Reinforced Concrete Oil Containment Bund Basin with Crushed Granite Drainage Ballast
    const bundGeo = new THREE.BoxGeometry(4.8, 0.45, 4.0);
    bundGeo.translate(0, 0.22, 0);
    const bund = new THREE.Mesh(bundGeo, concretePlinthMat);
    bund.receiveShadow = true;
    txGroup.add(bund);

    const gravelBedGeo = new THREE.BoxGeometry(4.4, 0.15, 3.6);
    gravelBedGeo.translate(0, 0.4, 0);
    const gravelBed = new THREE.Mesh(gravelBedGeo, gravelMat);
    gravelBed.receiveShadow = true;
    txGroup.add(gravelBed);

    // Main Heavy Welded Transformer Tank (5,000 kVA rating)
    const tankGeo = new THREE.BoxGeometry(2.6, 2.2, 2.0);
    tankGeo.translate(0, 1.55, 0);
    this.transformerMesh = new THREE.Mesh(tankGeo, transformerTankMat);
    this.transformerMesh.castShadow = true;
    this.transformerMesh.receiveShadow = true;
    txGroup.add(this.transformerMesh);

    // Large Corrugated Radiator Cooling Fin Banks (Left & Right Flanks)
    [-1.45, 1.45].forEach((rx) => {
      const radBankGeo = new THREE.BoxGeometry(0.28, 1.8, 1.7);
      radBankGeo.translate(rx, 1.55, 0);
      const radBank = new THREE.Mesh(radBankGeo, darkSteelMat);
      txGroup.add(radBank);

      // Top and bottom oil manifold headers
      const pipeGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.4, 8);
      pipeGeo.rotateZ(Math.PI / 2);
      const topPipe = new THREE.Mesh(pipeGeo, darkSteelMat);
      topPipe.position.set(rx > 0 ? 1.35 : -1.35, 2.3, 0);
      txGroup.add(topPipe);

      const botPipe = new THREE.Mesh(pipeGeo, darkSteelMat);
      botPipe.position.set(rx > 0 ? 1.35 : -1.35, 0.8, 0);
      txGroup.add(botPipe);
    });

    // Cylindrical Oil Conservator Expansion Tank (Mounted on top)
    const consGeo = new THREE.CylinderGeometry(0.32, 0.32, 2.1, 16);
    consGeo.rotateZ(Math.PI / 2);
    consGeo.translate(0, 3.05, -0.4);
    const conservator = new THREE.Mesh(consGeo, transformerTankMat);
    txGroup.add(conservator);

    // Conservator Structural Steel Support Legs
    [-0.7, 0.7].forEach((cx) => {
      const legGeo = new THREE.BoxGeometry(0.08, 0.4, 0.08);
      const leg = new THREE.Mesh(legGeo, darkSteelMat);
      leg.position.set(cx, 2.8, -0.4);
      txGroup.add(leg);
    });

    // 3x Medium-Voltage 33 kV Glazed Porcelain Shed Bushings
    for (let b = 0; b < 3; b++) {
      const bX = -0.6 + b * 0.6;
      const bGeo = new THREE.CylinderGeometry(0.08, 0.14, 0.85, 12);
      bGeo.translate(bX, 3.05, 0.4);
      const bushing = new THREE.Mesh(bGeo, porcelainMat);
      txGroup.add(bushing);

      // Copper terminal lug and arched conductor lead
      const lugGeo = new THREE.SphereGeometry(0.05, 8, 8);
      lugGeo.translate(bX, 3.5, 0.4);
      const lug = new THREE.Mesh(lugGeo, copperBusMat);
      txGroup.add(lug);

      // Arched heavy conductor jumper cable
      const curveGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.7, 6);
      curveGeo.rotateX(0.7);
      curveGeo.translate(bX, 3.7, 0.65);
      const curveMesh = new THREE.Mesh(curveGeo, darkSteelMat);
      txGroup.add(curveMesh);
    }

    // 690V Low-Voltage Connection Throat (Enclosed steel bus duct connecting to powerhouse)
    const throatGeo = new THREE.BoxGeometry(1.2, 0.7, 1.4);
    throatGeo.translate(0, 1.5, -1.5);
    const throatMesh = new THREE.Mesh(throatGeo, darkSteelMat);
    txGroup.add(throatMesh);

    // High-Voltage Surge Arresters on Galvanized Support Stand
    const saGroup = new THREE.Group();
    saGroup.position.set(-1.6, 0.4, 1.2);
    const standGeo = new THREE.BoxGeometry(0.8, 1.2, 0.4);
    const stand = new THREE.Mesh(standGeo, darkSteelMat);
    stand.position.y = 0.6;
    saGroup.add(stand);

    for (let sa = 0; sa < 3; sa++) {
      const saGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8);
      const saMesh = new THREE.Mesh(saGeo, porcelainMat);
      saMesh.position.set(-0.25 + sa * 0.25, 1.5, 0);
      saGroup.add(saMesh);
    }
    txGroup.add(saGroup);

    // Hazard Safety Placard on Transformer Front
    const txSignGeo = new THREE.BoxGeometry(0.45, 0.35, 0.02);
    const txSign = new THREE.Mesh(txSignGeo, hazardYellowMat);
    txSign.position.set(0, 1.8, 1.02);
    txGroup.add(txSign);

    this.substationGroup.add(txGroup);

    // -------------------------------------------------------------------------
    // E. GALVANIZED CHAIN-LINK SECURITY PERIMETER FENCE & ACCESS GATE
    // -------------------------------------------------------------------------
    const fenceGroup = new THREE.Group();
    fenceGroup.position.set(8.8, 0, 1.4);

    const fHalfW = 4.2;
    const fHalfD = 6.2;
    const fHeight = 2.4;

    // Corner and Intermediate Fence Posts
    const postGeo = new THREE.CylinderGeometry(0.04, 0.04, fHeight, 8);
    const fPostPositions = [
      [-fHalfW, -fHalfD], [fHalfW, -fHalfD],
      [-fHalfW, fHalfD], [fHalfW, fHalfD],
      [-fHalfW, 0], [fHalfW, 0],
      [0, -fHalfD],
    ];

    fPostPositions.forEach(([px, pz]) => {
      const post = new THREE.Mesh(postGeo, darkSteelMat);
      post.position.set(px, fHeight / 2, pz);
      fenceGroup.add(post);

      // Angled barbed wire outrigger arms
      const armGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.45, 6);
      armGeo.rotateZ(0.6);
      armGeo.translate(0.15, fHeight + 0.15, 0);
      const arm = new THREE.Mesh(armGeo, darkSteelMat);
      arm.position.set(px, 0, pz);
      fenceGroup.add(arm);
    });

    // Fence Panels (Semi-transparent wireframe chain-link)
    const makeFencePanel = (w, pos, rotY = 0) => {
      const panelGeo = new THREE.PlaneGeometry(w, fHeight - 0.2);
      panelGeo.translate(0, (fHeight - 0.2) / 2 + 0.1, 0);
      const panel = new THREE.Mesh(panelGeo, fenceWireMat);
      panel.position.set(pos[0], 0, pos[1]);
      panel.rotation.y = rotY;
      fenceGroup.add(panel);

      const railGeo = new THREE.CylinderGeometry(0.025, 0.025, w, 8);
      railGeo.rotateZ(Math.PI / 2);
      const topR = new THREE.Mesh(railGeo, darkSteelMat);
      topR.position.set(pos[0], fHeight - 0.05, pos[1]);
      topR.rotation.y = rotY;
      fenceGroup.add(topR);
    };

    makeFencePanel(fHalfW * 2, [0, -fHalfD], 0); // Back wall
    makeFencePanel(fHalfD * 2, [-fHalfW, 0], Math.PI / 2); // Left wall
    makeFencePanel(fHalfD * 2, [fHalfW, 0], Math.PI / 2); // Right wall
    makeFencePanel(fHalfW * 0.9, [-fHalfW * 0.55, fHalfD], 0); // Front wall left
    makeFencePanel(fHalfW * 0.9, [fHalfW * 0.55, fHalfD], 0); // Front wall right

    // Double Swinging Security Gate
    const gateGeo = new THREE.BoxGeometry(1.6, 2.0, 0.06);
    gateGeo.translate(0, 1.1, 0);
    const gateMesh = new THREE.Mesh(gateGeo, fenceWireMat);
    gateMesh.position.set(0, 0, fHalfD);
    fenceGroup.add(gateMesh);

    // Gate Warning Hazard Signs
    const gSignGeo = new THREE.BoxGeometry(0.6, 0.4, 0.03);
    const gSign = new THREE.Mesh(gSignGeo, hazardYellowMat);
    gSign.position.set(0, 1.4, fHalfD + 0.05);
    fenceGroup.add(gSign);

    this.substationGroup.add(fenceGroup);

    // -------------------------------------------------------------------------
    // F. TECHNICAL COMPONENT REGISTRATION (INTERACTIVE 3D INSPECTION)
    // -------------------------------------------------------------------------
    this.registerInspectable(this.transformerMesh, {
      title: '5,000 kVA 33 kV Medium-Voltage Step-Up Transformer',
      tag: 'SUBSTATION TRANSFORMER',
      desc: 'Oil-immersed pad-mounted step-up transformer converting generator 690 V output to 33,000 V medium-voltage for long-distance collection grid export. Features ONAN corrugated cooling fins, Buchholz protection relay, and high-voltage porcelain bushings.',
      specs: [
        { k: 'Rated Capacity', v: '5,000 kVA (5.0 MVA)' },
        { k: 'Voltage Ratio', v: '690 V / 33,000 V' },
        { k: 'Cooling Method', v: 'ONAN Corrugated Fins' },
        { k: 'Efficiency', v: '99.1% High-Efficiency' }
      ]
    });

    this.registerInspectable(this.powerhouseMesh, {
      title: 'WINDCARE MONITORING WTG-01 Powerhouse & MV Switchgear Facility',
      tag: 'CONTROL POWERHOUSE',
      desc: 'Architectural precast concrete powerhouse containing medium-voltage SF6 gas-insulated switchgear (GIS), SCADA grid synchronization automation, industrial HVAC cooling, and utility collector protections.',
      specs: [
        { k: 'Structure', v: 'Precast Architectural Panels' },
        { k: 'Switchgear', v: '33 kV SF6 Gas-Insulated (GIS)' },
        { k: 'SCADA Interconnect', v: 'Fiber Optic IEC 61850' },
        { k: 'Auxiliary Power', v: '400 V / 230 V UPS Backup' }
      ]
    });

    this.registerInspectable(this.basementVaultMesh, {
      title: 'Foundation Basement Cable Vault & Inverter Chamber',
      tag: 'SUBTERRANEAN BASEMENT',
      desc: 'Deep subterranean foundation vault housing 690 V 4-quadrant IGBT frequency converter cabinets, heavy electrolytic copper busbars, and underground medium-voltage export cable penetrations.',
      specs: [
        { k: 'Vault Depth', v: '-3.2 m Subterranean' },
        { k: 'Power Electronics', v: 'Liquid-Cooled 4Q Inverters' },
        { k: 'Busbar Rating', v: '4,800 A Electrolytic Copper' },
        { k: 'Foundation Type', v: 'Reinforced Gravity Base' }
      ]
    });

    this.scene.add(this.substationGroup);
  }

  buildTowerPortalStairs(baseRadius) {
    const portalGroup = new THREE.Group();
    portalGroup.position.set(0, 0, baseRadius + 0.05);

    const doorGeo = new THREE.BoxGeometry(1.2, 2.3, 0.2);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x243242, metalness: 0.6, roughness: 0.3 });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 3.4, 0);
    portalGroup.add(door);

    // Hazard Safety Signage on Door
    const dSignGeo = new THREE.BoxGeometry(0.55, 0.35, 0.02);
    const dSignMat = new THREE.MeshStandardMaterial({ color: 0xffb800, roughness: 0.35 });
    const dSign = new THREE.Mesh(dSignGeo, dSignMat);
    dSign.position.set(0, 3.75, 0.11);
    portalGroup.add(dSign);

    const sgreBadgeGeo = new THREE.BoxGeometry(0.65, 0.2, 0.02);
    const sgreBadgeMat = new THREE.MeshStandardMaterial({ color: 0x00646e, metalness: 0.7, roughness: 0.3 });
    const sgreBadge = new THREE.Mesh(sgreBadgeGeo, sgreBadgeMat);
    sgreBadge.position.set(0, 3.25, 0.11);
    portalGroup.add(sgreBadge);

    const platGeo = new THREE.BoxGeometry(2.0, 0.15, 1.6);
    const platMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.35 });
    const platform = new THREE.Mesh(platGeo, platMat);
    platform.position.set(0, 2.15, 0.8);
    portalGroup.add(platform);

    const railMat = new THREE.MeshStandardMaterial({ color: 0xffb800, roughness: 0.4, metalness: 0.2 });
    const rPostGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.1, 8);
    [
      [-0.95, 2.7, 0.05],
      [-0.95, 2.7, 1.55],
      [0.95, 2.7, 0.05],
      [0.95, 2.7, 1.55],
    ].forEach((pos) => {
      const post = new THREE.Mesh(rPostGeo, railMat);
      post.position.set(pos[0], pos[1], pos[2]);
      portalGroup.add(post);
    });

    const hRailGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.5, 8);
    hRailGeo.rotateX(Math.PI / 2);
    const hRailL = new THREE.Mesh(hRailGeo, railMat);
    hRailL.position.set(-0.95, 3.2, 0.8);
    portalGroup.add(hRailL);

    const hRailR = new THREE.Mesh(hRailGeo, railMat);
    hRailR.position.set(0.95, 3.2, 0.8);
    portalGroup.add(hRailR);

    const stepCount = 6;
    this.towerStairsMesh = new THREE.Group();
    for (let s = 0; s < stepCount; s++) {
      const stepGeo = new THREE.BoxGeometry(1.6, 0.1, 0.3);
      const step = new THREE.Mesh(stepGeo, platMat);
      step.position.set(0, 2.05 - s * 0.32, 1.6 + s * 0.28);
      this.towerStairsMesh.add(step);
    }
    portalGroup.add(this.towerStairsMesh);

    // Heavy Copper Lightning Down-Conductor Cable (Grounding system)
    const groundCableGeo = new THREE.CylinderGeometry(0.018, 0.018, 105.0, 8);
    const groundCableMat = new THREE.MeshStandardMaterial({ color: 0xb85d19, metalness: 0.95, roughness: 0.15 });
    const groundCable = new THREE.Mesh(groundCableGeo, groundCableMat);
    groundCable.position.set(-baseRadius * 0.98, 54.5, 0);
    this.towerGroup.add(groundCable);

    // Mid-Tower Aviation Obstacle Light at 45m height
    const midBeaconGeo = new THREE.SphereGeometry(0.18, 12, 12);
    const midBeaconMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
    const midBeaconMesh = new THREE.Mesh(midBeaconGeo, midBeaconMat);
    midBeaconMesh.position.set(baseRadius * 0.78, 45.0, 0);
    this.towerGroup.add(midBeaconMesh);
    this.beaconMeshes.push(midBeaconMesh);

    const midBeaconLight = new THREE.PointLight(0xff0033, 0.0, 80, 1.6);
    midBeaconLight.position.set(baseRadius * 0.78 + 0.1, 45.0, 0);
    this.towerGroup.add(midBeaconLight);
    this.beaconLights.push(midBeaconLight);

    this.towerGroup.add(portalGroup);
  }

  buildSculptedNacelleHousing() {
    const shellGroup = new THREE.Group();
    shellGroup.position.set(0, 2.45, -2.2);

    this.nacelleShellMaterial = new THREE.MeshStandardMaterial({
      map: this.generateNacelleTexture(),
      roughness: 0.28,
      metalness: 0.2,
      transparent: true,
      opacity: 1.0,
      depthWrite: true,
    });

    // 1. Port Shell (Left Wall - Solid aerodynamic fiberglass with official Siemens Gamesa corporate livery)
    const portShellGeo = new THREE.BoxGeometry(2.05, 3.8, 14.2);
    this.portShellMesh = new THREE.Mesh(portShellGeo, this.nacelleShellMaterial);
    this.portShellMesh.position.set(-1.025, 0, 0);
    this.portShellMesh.castShadow = true;
    this.portShellMesh.receiveShadow = true;
    shellGroup.add(this.portShellMesh);

    // 2. Starboard Shell (Right Wall - Solid aerodynamic fiberglass canopy with official Siemens Gamesa livery)
    const stbdShellGeo = new THREE.BoxGeometry(2.05, 3.8, 14.2);
    this.stbdShellMesh = new THREE.Mesh(stbdShellGeo, this.nacelleShellMaterial);
    this.stbdShellMesh.position.set(1.025, 0, 0);
    this.stbdShellMesh.castShadow = true;
    this.stbdShellMesh.receiveShadow = true;
    shellGroup.add(this.stbdShellMesh);

    // Solid Roof Deck (Flush with rooftop coolers at y = 4.4m)
    const roofDeckGeo = new THREE.BoxGeometry(2.05, 0.12, 14.2);
    const roofDeck = new THREE.Mesh(roofDeckGeo, this.nacelleShellMaterial);
    roofDeck.position.set(1.025, 1.9, 0);
    shellGroup.add(roofDeck);

    // Aerodynamic Nose Collar (Hub interface)
    const noseCollarGeo = new THREE.CylinderGeometry(2.38, 2.05, 1.4, 32);
    noseCollarGeo.rotateX(Math.PI / 2);
    const collarMesh = new THREE.Mesh(noseCollarGeo, this.nacelleShellMaterial);
    collarMesh.position.set(0, 0, 7.4);
    shellGroup.add(collarMesh);

    // Solid Aerodynamic Tail Cone with ventilation gills
    const tailGeo = new THREE.ConeGeometry(2.0, 2.8, 32);
    tailGeo.rotateX(-Math.PI / 2);
    const tailMesh = new THREE.Mesh(tailGeo, this.nacelleShellMaterial);
    tailMesh.position.set(0, -0.2, -8.0);
    tailMesh.scale.set(1.4, 0.9, 1.0);
    shellGroup.add(tailMesh);

    this.nacelleShellMesh = this.portShellMesh;
    this.nacelleGroup.add(shellGroup);

    this.registerInspectable(this.portShellMesh, {
      title: 'WINDCARE MONITORING SG 5.0-145 Nacelle Canopy & Observation Bay',
      tag: 'WINDCARE HOUSING',
      desc: 'Faceted aerodynamic fiberglass-reinforced polymer canopy with sound-attenuating insulation, OptimaFlex architecture, 5-ton service crane, and high-strength clear inspection observation bay.',
      specs: [
        { k: 'Platform', v: 'OptimaFlex SG 5.0' },
        { k: 'Length × Width', v: '14.8 m × 4.1 m' },
        { k: 'Rated Power', v: '5,000 kW (5.0 MW)' },
        { k: 'Inspection Port', v: 'Reinforced Starboard Bay' }
      ]
    });
  }

  buildNacelleRooftopEquipment() {
    const roofGroup = new THREE.Group();
    roofGroup.position.set(0, 4.6, -2.2);

    const coolerGeo = new THREE.BoxGeometry(3.4, 0.8, 3.8);
    const coolerMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 });
    const cooler = new THREE.Mesh(coolerGeo, coolerMat);
    cooler.position.set(0, 0.2, -4.5);
    roofGroup.add(cooler);

    this.coolerFans = [];
    [-1.0, 1.0].forEach((fz) => {
      const fanWellGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.35, 24);
      const fanWellMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85 });
      const fanWell = new THREE.Mesh(fanWellGeo, fanWellMat);
      fanWell.position.set(0, 0.65, -4.5 + fz);
      roofGroup.add(fanWell);

      const fanRotor = new THREE.Group();
      fanRotor.position.set(0, 0.72, -4.5 + fz);
      const bladeMat = new THREE.MeshStandardMaterial({ color: 0x00a3ad, roughness: 0.4 });
      for (let fb = 0; fb < 6; fb++) {
        const fbAngle = (fb * Math.PI * 2) / 6;
        const bGeo = new THREE.BoxGeometry(0.12, 0.04, 0.75);
        bGeo.rotateY(0.35);
        const bMesh = new THREE.Mesh(bGeo, bladeMat);
        bMesh.rotation.y = fbAngle;
        fanRotor.add(bMesh);
      }
      roofGroup.add(fanRotor);
      this.coolerFans.push(fanRotor);

      const grilleGeo = new THREE.CylinderGeometry(0.92, 0.92, 0.05, 16);
      const grilleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, wireframe: true });
      const grille = new THREE.Mesh(grilleGeo, grilleMat);
      grille.position.set(0, 0.82, -4.5 + fz);
      roofGroup.add(grille);
    });

    const railMat = new THREE.MeshStandardMaterial({ color: 0xffb800, roughness: 0.35, metalness: 0.2 });
    const postGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.2, 8);

    for (let pz = -6.2; pz <= 6.2; pz += 1.8) {
      [-1.95, 1.95].forEach((px) => {
        const post = new THREE.Mesh(postGeo, railMat);
        post.position.set(px, 0.6, pz);
        roofGroup.add(post);
      });
    }

    const longRailGeo = new THREE.CylinderGeometry(0.025, 0.025, 12.6, 12);
    longRailGeo.rotateX(Math.PI / 2);
    [-1.95, 1.95].forEach((px) => {
      const rTop = new THREE.Mesh(longRailGeo, railMat);
      rTop.position.set(px, 1.15, 0);
      roofGroup.add(rTop);

      const rMid = new THREE.Mesh(longRailGeo, railMat);
      rMid.position.set(px, 0.65, 0);
      roofGroup.add(rMid);
    });

    const endRailGeo = new THREE.CylinderGeometry(0.025, 0.025, 3.9, 8);
    endRailGeo.rotateZ(Math.PI / 2);
    const rEnd = new THREE.Mesh(endRailGeo, railMat);
    rEnd.position.set(0, 1.15, -6.3);
    roofGroup.add(rEnd);

    const craneGroup = new THREE.Group();
    craneGroup.position.set(1.4, 0.1, -1.8);

    const cranePedestalGeo = new THREE.CylinderGeometry(0.25, 0.28, 1.6, 12);
    const craneMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.4, roughness: 0.3 });
    const pedestal = new THREE.Mesh(cranePedestalGeo, craneMat);
    pedestal.position.y = 0.8;
    craneGroup.add(pedestal);

    const boomGeo = new THREE.BoxGeometry(0.2, 0.25, 3.2);
    const boom = new THREE.Mesh(boomGeo, craneMat);
    boom.position.set(0, 1.65, -0.9);
    boom.rotation.x = -0.15;
    craneGroup.add(boom);

    const cableGeo = new THREE.CylinderGeometry(0.015, 0.015, 1.4, 6);
    const cableMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 });
    const cable = new THREE.Mesh(cableGeo, cableMat);
    cable.position.set(0, 0.85, -2.35);
    craneGroup.add(cable);

    roofGroup.add(craneGroup);

    const mastGeo = new THREE.CylinderGeometry(0.07, 0.08, 2.2, 8);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    const mast = new THREE.Mesh(mastGeo, mastMat);
    mast.position.set(0, 1.1, -5.8);
    roofGroup.add(mast);

    this.anemometerCupsGroup = new THREE.Group();
    this.anemometerCupsGroup.position.set(0, 2.25, -5.8);
    for (let c = 0; c < 3; c++) {
      const angle = (c * Math.PI * 2) / 3;
      const armGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.45, 6);
      armGeo.rotateZ(Math.PI / 2);
      armGeo.translate(0.22, 0, 0);
      const arm = new THREE.Mesh(armGeo, mastMat);
      arm.rotation.y = angle;

      const cupGeo = new THREE.SphereGeometry(0.09, 8, 8, 0, Math.PI);
      const cupMat = new THREE.MeshStandardMaterial({ color: 0xffb800 });
      const cup = new THREE.Mesh(cupGeo, cupMat);
      cup.position.set(Math.cos(angle) * 0.45, 0, Math.sin(angle) * 0.45);
      cup.rotation.y = angle + Math.PI / 2;
      this.anemometerCupsGroup.add(arm);
      this.anemometerCupsGroup.add(cup);
    }
    roofGroup.add(this.anemometerCupsGroup);

    this.windVaneGroup = new THREE.Group();
    this.windVaneGroup.position.set(0, 1.8, -5.8);
    const finGeo = new THREE.BoxGeometry(0.02, 0.25, 0.45);
    const finMesh = new THREE.Mesh(finGeo, mastMat);
    finMesh.position.set(0, 0, -0.28);
    this.windVaneGroup.add(finMesh);
    roofGroup.add(this.windVaneGroup);

    this.beaconLights = [];
    this.beaconMeshes = [];
    [-1.6, 1.6].forEach((bx) => {
      const stanchionGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.9, 8);
      const stanchion = new THREE.Mesh(stanchionGeo, mastMat);
      stanchion.position.set(bx, 0.45, -6.0);
      roofGroup.add(stanchion);

      const beaconGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.35, 12);
      const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(bx, 0.95, -6.0);
      roofGroup.add(beacon);
      this.beaconMeshes.push(beacon);

      const bLight = new THREE.PointLight(0xff0033, 0.0, 60, 1.8);
      bLight.position.set(bx, 1.1, -6.0);
      roofGroup.add(bLight);
      this.beaconLights.push(bLight);

      const spikeGeo = new THREE.ConeGeometry(0.02, 0.6, 6);
      const spike = new THREE.Mesh(spikeGeo, mastMat);
      spike.position.set(bx, 1.4, -6.0);
      roofGroup.add(spike);
    });

    this.nacelleGroup.add(roofGroup);
  }

  buildDrivetrainInternals() {
    this.drivetrainGroup = new THREE.Group();

    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.92,
      roughness: 0.18,
    });
    const sgTealMat = new THREE.MeshStandardMaterial({
      color: 0x00646e,
      metalness: 0.72,
      roughness: 0.28,
    });
    const gearSteelMat = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      metalness: 0.95,
      roughness: 0.12,
    });
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.88,
      roughness: 0.22,
    });
    const copperMat = new THREE.MeshStandardMaterial({
      color: 0xb85d19,
      metalness: 0.88,
      roughness: 0.24,
    });
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.98,
      roughness: 0.06,
    });
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.35,
    });

    const shaftY = 2.45;

    // 1. FORGED LOW-SPEED MAIN SHAFT (LSS)
    // Synchronously rotates with the rotor hub at low speed (10.5 RPM)
    this.mainShaftGroup = new THREE.Group();
    this.mainShaftGroup.position.set(0, shaftY, 0);

    // Main hollow shaft barrel (z = +4.4 to +1.4)
    const shaftBodyGeo = new THREE.CylinderGeometry(0.38, 0.40, 3.0, 32);
    shaftBodyGeo.rotateX(Math.PI / 2);
    const shaftBody = new THREE.Mesh(shaftBodyGeo, steelMat);
    shaftBody.position.set(0, 0, 2.9);
    this.mainShaftGroup.add(shaftBody);

    // Front Hub Attachment Flange (z = +4.4)
    const frontFlangeGeo = new THREE.CylinderGeometry(0.82, 0.82, 0.22, 36);
    frontFlangeGeo.rotateX(Math.PI / 2);
    const frontFlange = new THREE.Mesh(frontFlangeGeo, steelMat);
    frontFlange.position.set(0, 0, 4.3);
    this.mainShaftGroup.add(frontFlange);

    // 24 High-Strength Flange Studs & Nuts
    const studGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.3, 8);
    studGeo.rotateX(Math.PI / 2);
    for (let st = 0; st < 24; st++) {
      const stAngle = (st * Math.PI * 2) / 24;
      const stud = new THREE.Mesh(studGeo, chromeMat);
      stud.position.set(Math.cos(stAngle) * 0.72, Math.sin(stAngle) * 0.72, 4.3);
      this.mainShaftGroup.add(stud);
    }

    // Rear Gearbox Shrink Disc Collar Flange (z = +1.4)
    const rearFlangeGeo = new THREE.CylinderGeometry(0.68, 0.68, 0.3, 32);
    rearFlangeGeo.rotateX(Math.PI / 2);
    const rearFlange = new THREE.Mesh(rearFlangeGeo, steelMat);
    rearFlange.position.set(0, 0, 1.4);
    this.mainShaftGroup.add(rearFlange);

    // High-Contrast Rotation Index Striping (Visually renders rotation clearly)
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
    for (let str = 0; str < 4; str++) {
      const strAngle = (str * Math.PI * 2) / 4;
      const strGeo = new THREE.BoxGeometry(0.035, 0.82, 2.8);
      strGeo.rotateZ(strAngle);
      const strMesh = new THREE.Mesh(strGeo, stripeMat);
      strMesh.position.set(0, 0, 2.9);
      this.mainShaftGroup.add(strMesh);
    }

    this.drivetrainGroup.add(this.mainShaftGroup);

    this.registerInspectable(shaftBody, {
      title: 'WINDCARE MONITORING Forged Low-Speed Main Shaft (LSS)',
      tag: 'PRIMARY DRIVETRAIN',
      desc: 'Forged 34CrNiMo6 hollow alloy steel main shaft transmitting rotor aerodynamic torque (4,547 kN·m) directly into the planetary transmission.',
      specs: [
        { k: 'Shaft Outer Diameter', v: 'Ø 780 mm (Hollow)' },
        { k: 'Material', v: 'Quenched & Tempered Alloy Steel' },
        { k: 'Speed', v: '10.5 RPM (Nominal)' },
        { k: 'Nominal Torque', v: '4,547 kN·m' }
      ]
    });

    // 2. HEAVY SPHERICAL ROLLER MAIN BEARING & MOUNTING PEDESTAL
    // Cast Bedplate Foundation Pedestal (from y = 0.6 to 1.6, firmly on bedplate)
    const bearingPedestalGeo = new THREE.BoxGeometry(2.4, 1.0, 1.4);
    const bearingPedestal = new THREE.Mesh(bearingPedestalGeo, sgTealMat);
    bearingPedestal.position.set(0, 1.1, 2.8);
    this.drivetrainGroup.add(bearingPedestal);

    // Bearing Housing Lower Base
    const bearingBaseGeo = new THREE.CylinderGeometry(0.95, 0.95, 1.1, 32, 1, false, Math.PI, Math.PI);
    bearingBaseGeo.rotateX(Math.PI / 2);
    bearingBaseGeo.rotateZ(Math.PI / 2);
    const bearingBase = new THREE.Mesh(bearingBaseGeo, sgTealMat);
    bearingBase.position.set(0, shaftY, 2.8);
    this.drivetrainGroup.add(bearingBase);

    // Bearing Housing Left Half Cap (Solid)
    const bearingCapLeftGeo = new THREE.CylinderGeometry(0.95, 0.95, 1.1, 32, 1, false, Math.PI / 2, Math.PI / 2);
    bearingCapLeftGeo.rotateX(Math.PI / 2);
    bearingCapLeftGeo.rotateZ(Math.PI / 2);
    const bearingCapLeft = new THREE.Mesh(bearingCapLeftGeo, sgTealMat);
    bearingCapLeft.position.set(0, shaftY, 2.8);
    this.drivetrainGroup.add(bearingCapLeft);

    // Bearing Cutaway Window on Starboard Top revealing the Rolling Elements!
    this.mainBearingRollers = new THREE.Group();
    this.mainBearingRollers.position.set(0, shaftY, 2.8);

    const rollerCount = 20;
    const rollerGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.22, 12);
    rollerGeo.rotateX(Math.PI / 2);

    for (let r = 0; r < rollerCount; r++) {
      const rAngle = (r * Math.PI * 2) / rollerCount;
      [-0.15, 0.15].forEach((rz) => {
        const roller = new THREE.Mesh(rollerGeo, chromeMat);
        roller.position.set(Math.cos(rAngle) * 0.58, Math.sin(rAngle) * 0.58, rz);
        this.mainBearingRollers.add(roller);
      });
    }

    // Brass Retaining Cage Ring
    const cageGeo = new THREE.TorusGeometry(0.58, 0.035, 8, 32);
    cageGeo.rotateX(Math.PI / 2);
    const cageMesh = new THREE.Mesh(cageGeo, brassMat);
    this.mainBearingRollers.add(cageMesh);

    this.drivetrainGroup.add(this.mainBearingRollers);

    this.registerInspectable(bearingPedestal, {
      title: 'Spherical Roller Main Bearing & Split Cast Housing',
      tag: 'ROTOR SUPPORT BEARING',
      desc: 'Double-row spherical roller bearing (230/850-CA-W33) absorbing axial aerodynamic thrust (485 kN) and blade bending moments. Rotating barrel rollers and brass cage are exposed in cutaway.',
      specs: [
        { k: 'Bearing Type', v: 'Double-Row Spherical Roller' },
        { k: 'Dynamic Capacity', v: '9,800 kN' },
        { k: 'Lubrication', v: 'Automated Multiline Grease' },
        { k: 'Operating Temp', v: '48.5 °C' }
      ]
    });

    // 3. 3-STAGE PLANETARY-HELICAL GEARBOX (OPEN CUTAWAY TRANSMISSION)
    // Sits firmly on bedplate foundation mounts (y = 0.6 to 1.35)
    const gbZ = -0.5;

    // Bedplate Foundation Mounting Rails (Supports bottom of gearbox with zero clipping)
    [-1.2, 1.2].forEach((mx) => {
      const mountStoolGeo = new THREE.BoxGeometry(0.4, 0.75, 3.2);
      const mountStool = new THREE.Mesh(mountStoolGeo, pedestalMat);
      mountStool.position.set(mx, 0.975, gbZ);
      this.drivetrainGroup.add(mountStool);
    });

    // Cast Gearbox Housing Base & Port Wall (Solid cast iron)
    const gbSumpGeo = new THREE.BoxGeometry(2.7, 0.4, 3.4);
    const gbSump = new THREE.Mesh(gbSumpGeo, sgTealMat);
    gbSump.position.set(0, 1.45, gbZ);
    this.drivetrainGroup.add(gbSump);

    const gbPortWallGeo = new THREE.BoxGeometry(0.2, 2.2, 3.4);
    const gbPortWall = new THREE.Mesh(gbPortWallGeo, sgTealMat);
    gbPortWall.position.set(-1.25, 2.45, gbZ);
    this.drivetrainGroup.add(gbPortWall);

    const gbRearWallGeo = new THREE.BoxGeometry(2.7, 2.2, 0.2);
    const gbRearWall = new THREE.Mesh(gbRearWallGeo, sgTealMat);
    gbRearWall.position.set(0, 2.45, gbZ - 1.6);
    this.drivetrainGroup.add(gbRearWall);

    // Front Planetary Ring Gear (Annulus) - Stationarily bolted to transmission frame
    const ringGearGeo = new THREE.CylinderGeometry(1.08, 1.08, 0.5, 36, 1, true);
    ringGearGeo.rotateX(Math.PI / 2);
    const ringGearMesh = new THREE.Mesh(ringGearGeo, gearSteelMat);
    ringGearMesh.position.set(0, shaftY, gbZ + 0.9);
    this.drivetrainGroup.add(ringGearMesh);

    // Internal Gear Teeth on Ring Gear
    for (let t = 0; t < 36; t++) {
      const tAngle = (t * Math.PI * 2) / 36;
      const toothGeo = new THREE.BoxGeometry(0.04, 0.07, 0.48);
      toothGeo.rotateZ(tAngle);
      const toothMesh = new THREE.Mesh(toothGeo, chromeMat);
      toothMesh.position.set(Math.cos(tAngle) * 1.02, shaftY + Math.sin(tAngle) * 1.02, gbZ + 0.9);
      this.drivetrainGroup.add(toothMesh);
    }

    // STAGE 1: PLANET CARRIER (Rotates at rotor speed = 10.5 RPM)
    this.planetCarrier = new THREE.Group();
    this.planetCarrier.position.set(0, shaftY, gbZ + 0.9);

    const carrierHubGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.16, 24);
    carrierHubGeo.rotateX(Math.PI / 2);
    const carrierHub = new THREE.Mesh(carrierHubGeo, steelMat);
    this.planetCarrier.add(carrierHub);

    // 3 Carrier Arms
    for (let ca = 0; ca < 3; ca++) {
      const caAngle = (ca * Math.PI * 2) / 3;
      const armGeo = new THREE.BoxGeometry(0.24, 0.72, 0.14);
      armGeo.rotateZ(caAngle);
      const armMesh = new THREE.Mesh(armGeo, sgTealMat);
      armMesh.position.set(Math.cos(caAngle) * 0.42, Math.sin(caAngle) * 0.42, 0);
      this.planetCarrier.add(armMesh);
    }

    // 3 REAL PLANET GEARS WITH MODELED GEAR TEETH!
    this.planetGears = [];
    const pRadius = 0.65;
    const planetBodyGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.42, 20);
    planetBodyGeo.rotateX(Math.PI / 2);

    for (let p = 0; p < 3; p++) {
      const pAngle = (p * Math.PI * 2) / 3;
      const planetAssembly = new THREE.Group();
      planetAssembly.position.set(Math.cos(pAngle) * pRadius, Math.sin(pAngle) * pRadius, 0);

      // Planet Gear Body
      const pBody = new THREE.Mesh(planetBodyGeo, gearSteelMat);
      planetAssembly.add(pBody);

      // 18 Individual Involute Gear Teeth on Planet Gear!
      for (let pt = 0; pt < 18; pt++) {
        const ptAngle = (pt * Math.PI * 2) / 18;
        const pToothGeo = new THREE.BoxGeometry(0.035, 0.065, 0.4);
        pToothGeo.rotateZ(ptAngle);
        const pTooth = new THREE.Mesh(pToothGeo, chromeMat);
        pTooth.position.set(Math.cos(ptAngle) * 0.28, Math.sin(ptAngle) * 0.28, 0);
        planetAssembly.add(pTooth);
      }

      // Hardened Ground Planet Pin
      const pPinGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.52, 16);
      pPinGeo.rotateX(Math.PI / 2);
      const pPin = new THREE.Mesh(pPinGeo, chromeMat);
      planetAssembly.add(pPin);

      this.planetCarrier.add(planetAssembly);
      this.planetGears.push(planetAssembly);
    }
    this.drivetrainGroup.add(this.planetCarrier);

    // CENTRAL SUN GEAR (Spins at +5.8x speed)
    this.sunGear = new THREE.Group();
    this.sunGear.position.set(0, shaftY, gbZ + 0.9);

    const sunBodyGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.44, 20);
    sunBodyGeo.rotateX(Math.PI / 2);
    const sunBody = new THREE.Mesh(sunBodyGeo, gearSteelMat);
    this.sunGear.add(sunBody);

    // 14 Gear Teeth on Sun Gear
    for (let st = 0; st < 14; st++) {
      const stAngle = (st * Math.PI * 2) / 14;
      const sToothGeo = new THREE.BoxGeometry(0.035, 0.06, 0.42);
      sToothGeo.rotateZ(stAngle);
      const sTooth = new THREE.Mesh(sToothGeo, chromeMat);
      sTooth.position.set(Math.cos(stAngle) * 0.18, Math.sin(stAngle) * 0.18, 0);
      this.sunGear.add(sTooth);
    }
    this.drivetrainGroup.add(this.sunGear);

    // STAGE 2: INTERMEDIATE HELICAL GEAR STAGE (Spins at +28.4x speed)
    this.intermediateStage = new THREE.Group();
    this.intermediateStage.position.set(0, shaftY, gbZ - 0.2);

    // Helical Bull Gear with visible rim teeth
    const bullGearGeo = new THREE.CylinderGeometry(0.58, 0.58, 0.24, 32);
    bullGearGeo.rotateX(Math.PI / 2);
    const bullGear = new THREE.Mesh(bullGearGeo, gearSteelMat);
    this.intermediateStage.add(bullGear);

    const bullRimGeo = new THREE.TorusGeometry(0.58, 0.03, 8, 36);
    bullRimGeo.rotateX(Math.PI / 2);
    const bullRim = new THREE.Mesh(bullRimGeo, chromeMat);
    this.intermediateStage.add(bullRim);

    // Intermediate Pinion
    const interPinionGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.35, 20);
    interPinionGeo.rotateX(Math.PI / 2);
    const interPinion = new THREE.Mesh(interPinionGeo, gearSteelMat);
    interPinion.position.set(0, 0, -0.3);
    this.intermediateStage.add(interPinion);

    this.drivetrainGroup.add(this.intermediateStage);

    // Oil Filtration Auxiliary Manifold & Synthetic Oil Sight Gauge
    const filterGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.55, 16);
    const filterCan = new THREE.Mesh(filterGeo, chromeMat);
    filterCan.position.set(1.42, 1.8, gbZ);
    this.drivetrainGroup.add(filterCan);

    const sightGlassGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 12);
    const sightGlassMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.75 });
    const sightGlass = new THREE.Mesh(sightGlassGeo, sightGlassMat);
    sightGlass.position.set(1.36, 1.6, gbZ + 0.8);
    this.drivetrainGroup.add(sightGlass);

    this.registerInspectable(gbSump, {
      title: 'WINDCARE MONITORING 3-Stage Planetary-Helical Gearbox',
      tag: 'MECHANICAL TRANSMISSION',
      desc: 'High-efficiency epicyclic transmission (1:104.2 ratio). Open cutaway reveals Stage 1 internal ring gear, 3 revolving planet gears, central sun gear, and Stage 2 helical bull gear converting 10.5 RPM to 1,094 RPM.',
      specs: [
        { k: 'Ratio', v: '1 : 104.2 (Epicyclic + Helical)' },
        { k: 'Rated Mechanical Power', v: '5,300 kW' },
        { k: 'Transmission Efficiency', v: '97.6%' },
        { k: 'Lubricant', v: 'Synthetic ISO VG 320 (850 L)' }
      ]
    });

    // 4. HIGH-SPEED SHAFT (HSS) & VENTILATED AERODYNAMIC DISC BRAKE
    this.highSpeedShaftGroup = new THREE.Group();
    this.highSpeedShaftGroup.position.set(0, shaftY, -2.8);

    // High Speed Alloy Steel Shaft (1,094 RPM)
    const hsShaftGeo = new THREE.CylinderGeometry(0.09, 0.09, 1.5, 24);
    hsShaftGeo.rotateX(Math.PI / 2);
    const hsShaft = new THREE.Mesh(hsShaftGeo, steelMat);
    this.highSpeedShaftGroup.add(hsShaft);

    // Large Ventilated Brake Disc (Dual friction plates with radial cooling airflow vanes)
    const discPlateGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.035, 36);
    discPlateGeo.rotateX(Math.PI / 2);

    this.brakeDiscMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.95,
      roughness: 0.18,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0.0,
    });

    [-0.045, 0.045].forEach((dz) => {
      const plate = new THREE.Mesh(discPlateGeo, this.brakeDiscMaterial);
      plate.position.set(0, 0, dz);
      this.highSpeedShaftGroup.add(plate);
    });

    // 24 Internal Radial Air Cooling Vanes between the dual brake plates
    for (let v = 0; v < 24; v++) {
      const vAngle = (v * Math.PI * 2) / 24;
      const vaneGeo = new THREE.BoxGeometry(0.015, 0.28, 0.07);
      vaneGeo.rotateZ(vAngle);
      const vaneMesh = new THREE.Mesh(vaneGeo, steelMat);
      vaneMesh.position.set(Math.cos(vAngle) * 0.38, Math.sin(vAngle) * 0.38, 0);
      this.highSpeedShaftGroup.add(vaneMesh);
    }

    this.brakeDiscMesh = this.highSpeedShaftGroup;

    // Flexible Composite Coupling (Voith / Geislinger style)
    const couplingGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.24, 24);
    couplingGeo.rotateX(Math.PI / 2);
    const couplingMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8, metalness: 0.2 });
    const coupling = new THREE.Mesh(couplingGeo, couplingMat);
    coupling.position.set(0, 0, -0.65);
    this.highSpeedShaftGroup.add(coupling);

    this.drivetrainGroup.add(this.highSpeedShaftGroup);

    // Heavy Industrial Hydraulic Active-Clamping Brake Caliper
    // Mounted firmly to cast bedplate stool at y = 0.6 to 2.45
    const caliperStoolGeo = new THREE.BoxGeometry(0.32, 1.85, 0.38);
    const caliperStool = new THREE.Mesh(caliperStoolGeo, pedestalMat);
    caliperStool.position.set(0, 1.52, -2.8);
    this.drivetrainGroup.add(caliperStool);

    const caliperMat = new THREE.MeshStandardMaterial({ color: 0xe65100, metalness: 0.65, roughness: 0.3 });
    const caliperGeo = new THREE.BoxGeometry(0.55, 0.72, 0.36);
    const caliper = new THREE.Mesh(caliperGeo, caliperMat);
    caliper.position.set(0, shaftY + 0.48, -2.8);
    this.drivetrainGroup.add(caliper);

    this.registerInspectable(caliper, {
      title: 'High-Speed Shaft & Fail-Safe Aerodynamic Disc Brake',
      tag: 'SAFETY & BRAKING SYSTEM',
      desc: 'Ventilated alloy steel disc brake with dual friction plates and 24 radial air cooling vanes. Clamped by heavy-duty active hydraulic Svendborg caliper for emergency stopping and service maintenance locking.',
      specs: [
        { k: 'Shaft Speed', v: '1,094 RPM (18.2 Hz)' },
        { k: 'Disc Diameter', v: 'Ø 1,100 mm (Ventilated)' },
        { k: 'Caliper Type', v: 'Active Hydraulic Twin-Piston' },
        { k: 'Braking Torque', v: '145 kN·m' }
      ]
    });

    // 5. 5.0 MW DUAL-FED INDUCTION GENERATOR (OPEN CUTAWAY DFIG)
    // Sits firmly on two heavy bedplate foundation stools (y = 0.6 to 1.6)
    const genZ = -5.5;

    [-1.0, 1.0].forEach((sx) => {
      const gStoolGeo = new THREE.BoxGeometry(0.35, 1.0, 2.8);
      const gStool = new THREE.Mesh(gStoolGeo, pedestalMat);
      gStool.position.set(sx, 1.1, genZ);
      this.drivetrainGroup.add(gStool);
    });

    // Cutaway Stator Frame (Lower and Port 240° is solid, Starboard 120° is OPEN!)
    const genHousingGeo = new THREE.CylinderGeometry(0.85, 0.85, 3.2, 32, 1, false, Math.PI * 0.7, Math.PI * 1.35);
    genHousingGeo.rotateX(Math.PI / 2);
    genHousingGeo.rotateZ(Math.PI / 2);
    const generatorStator = new THREE.Mesh(genHousingGeo, new THREE.MeshStandardMaterial({
      color: 0x1e3a5f,
      metalness: 0.75,
      roughness: 0.25,
      side: THREE.DoubleSide,
    }));
    generatorStator.position.set(0, shaftY, genZ);
    this.drivetrainGroup.add(generatorStator);

    // Stator Laminated Silicon Steel Core (Inside cutaway)
    const coreLaminateGeo = new THREE.CylinderGeometry(0.82, 0.82, 2.4, 28, 1, true, 0, Math.PI * 0.75);
    coreLaminateGeo.rotateX(Math.PI / 2);
    const coreLaminate = new THREE.Mesh(coreLaminateGeo, new THREE.MeshStandardMaterial({
      color: 0x243242,
      metalness: 0.85,
      roughness: 0.35,
      side: THREE.DoubleSide,
    }));
    coreLaminate.position.set(0, shaftY, genZ);
    this.drivetrainGroup.add(coreLaminate);

    // Form-Wound Copper Stator Coils (Glistening enameled copper bundles lining the stator bore!)
    for (let c = 0; c < 12; c++) {
      const cAngle = (c * Math.PI * 0.75) / 12 + 0.15;
      const coilGeo = new THREE.BoxGeometry(0.045, 0.08, 2.3);
      coilGeo.rotateZ(cAngle);
      const coilMesh = new THREE.Mesh(coilGeo, copperMat);
      coilMesh.position.set(Math.cos(cAngle) * 0.76, shaftY + Math.sin(cAngle) * 0.76, genZ);
      this.drivetrainGroup.add(coilMesh);
    }

    // Top Terminal Connection Box (690V Power Cable Outlet)
    const genBoxGeo = new THREE.BoxGeometry(0.9, 0.55, 1.1);
    const genBox = new THREE.Mesh(genBoxGeo, sgTealMat);
    genBox.position.set(0, shaftY + 1.05, genZ);
    this.drivetrainGroup.add(genBox);

    // HIGH-SPEED SPINNING INNER ROTOR CORE & DUAL TURBINE IMPELLERS (1,094 RPM)
    this.generatorRotor = new THREE.Group();
    this.generatorRotor.position.set(0, shaftY, genZ);

    // Inner Rotor Core with Copper Squirrel-Cage Bars
    const rotorCoreGeo = new THREE.CylinderGeometry(0.52, 0.52, 2.5, 24);
    rotorCoreGeo.rotateX(Math.PI / 2);
    const rotorCore = new THREE.Mesh(rotorCoreGeo, steelMat);
    this.generatorRotor.add(rotorCore);

    // 16 Copper Squirrel-Cage Rotor Bars
    for (let b = 0; b < 16; b++) {
      const bAngle = (b * Math.PI * 2) / 16;
      const barGeo = new THREE.BoxGeometry(0.025, 0.04, 2.45);
      barGeo.rotateZ(bAngle);
      const barMesh = new THREE.Mesh(barGeo, copperMat);
      barMesh.position.set(Math.cos(bAngle) * 0.52, Math.sin(bAngle) * 0.52, 0);
      this.generatorRotor.add(barMesh);
    }

    // Front & Rear Multi-Blade Radial Cooling Turbine Impellers!
    [-1.28, 1.28].forEach((fz) => {
      const impellerHub = new THREE.Group();
      impellerHub.position.set(0, 0, fz);
      for (let ib = 0; ib < 14; ib++) {
        const ibAngle = (ib * Math.PI * 2) / 14;
        const bladeGeo = new THREE.BoxGeometry(0.02, 0.18, 0.08);
        bladeGeo.rotateZ(ibAngle);
        const bladeMesh = new THREE.Mesh(bladeGeo, chromeMat);
        bladeMesh.position.set(Math.cos(ibAngle) * 0.62, Math.sin(ibAngle) * 0.62, 0);
        impellerHub.add(bladeMesh);
      }
      this.generatorRotor.add(impellerHub);
    });

    // Rear Collector Slip Ring Chamber
    const slipRingGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.55, 24);
    slipRingGeo.rotateX(Math.PI / 2);
    const slipRings = new THREE.Mesh(slipRingGeo, brassMat);
    slipRings.position.set(0, 0, -1.6);
    this.generatorRotor.add(slipRings);

    this.drivetrainGroup.add(this.generatorRotor);

    this.registerInspectable(generatorStator, {
      title: 'WINDCARE MONITORING 5.0 MW Dual-Fed Induction Generator (DFIG)',
      tag: 'ELECTRICAL GENERATION',
      desc: '4-pole doubly-fed induction generator rated at 5,000 kW (690 V). Open cutaway reveals form-wound copper stator coils, inner rotating core with copper rotor bars, and high-speed centrifugal cooling fans spinning at 1,094 RPM.',
      specs: [
        { k: 'Rated Active Output', v: '5,000 kW (5.0 MW)' },
        { k: 'Nominal Voltage', v: '690 V (3-Phase, 50 Hz)' },
        { k: 'Synchronous Speed', v: '1,000 RPM (Rated 1,094 RPM)' },
        { k: 'Efficiency at Rated', v: '96.8%' }
      ]
    });

    // 6. INTERIOR LED WORK LIGHTING (Brilliantly illuminates all running parts from inside!)
    const workLightShaft = new THREE.PointLight(0x00f2fe, 4.8, 12, 1.2);
    workLightShaft.position.set(1.2, shaftY + 0.8, 2.8);
    this.drivetrainGroup.add(workLightShaft);

    const workLightGearbox = new THREE.PointLight(0xfffaea, 5.8, 14, 1.1);
    workLightGearbox.position.set(1.3, shaftY + 0.9, gbZ);
    this.drivetrainGroup.add(workLightGearbox);

    const workLightBrake = new THREE.PointLight(0x00f2fe, 4.5, 12, 1.2);
    workLightBrake.position.set(1.2, shaftY + 0.7, -2.8);
    this.drivetrainGroup.add(workLightBrake);

    const workLightGen = new THREE.PointLight(0xfffaea, 5.5, 14, 1.1);
    workLightGen.position.set(1.3, shaftY + 0.8, genZ);
    this.drivetrainGroup.add(workLightGen);

    this.nacelleGroup.add(this.drivetrainGroup);
  }

  buildRotorAssembly() {
    this.rotorGroup = new THREE.Group();
    this.rotorGroup.position.set(0, 2.4, 4.6);
    this.rotorGroup.rotation.x = -THREE.MathUtils.degToRad(5.0);

    this.hubGroup = new THREE.Group();

    const spinnerMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.22,
      metalness: 0.16,
    });

    const spinnerGeo = new THREE.ConeGeometry(2.4, 4.2, 36);
    spinnerGeo.rotateX(Math.PI / 2);
    const spinner = new THREE.Mesh(spinnerGeo, spinnerMat);
    spinner.position.set(0, 0, 1.6);
    spinner.castShadow = true;
    this.hubGroup.add(spinner);

    const hubBaseGeo = new THREE.CylinderGeometry(2.4, 2.4, 2.5, 36);
    hubBaseGeo.rotateX(Math.PI / 2);
    const hubBase = new THREE.Mesh(hubBaseGeo, spinnerMat);
    hubBase.position.set(0, 0, -0.6);
    this.hubGroup.add(hubBase);

    const hatchGeo = new THREE.CircleGeometry(0.58, 24);
    const hatchMat = new THREE.MeshStandardMaterial({ color: 0x00646e, metalness: 0.5, roughness: 0.3 });
    const hatch = new THREE.Mesh(hatchGeo, hatchMat);
    hatch.position.set(0, 0, 3.72);
    this.hubGroup.add(hatch);

    this.bladeGroups = [];
    this.bladeMeshes = [];
    this.pitchPinions = [];

    // Central Emergency Hydraulic & Ultracapacitor Pitch Accumulator Manifold
    const accumMat = new THREE.MeshStandardMaterial({ color: 0x00646e, metalness: 0.8, roughness: 0.25 });
    for (let ac = 0; ac < 3; ac++) {
      const acAngle = (ac * Math.PI * 2) / 3 + Math.PI / 6;
      const bottleGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.4, 16);
      bottleGeo.rotateX(Math.PI / 2);
      const bottle = new THREE.Mesh(bottleGeo, accumMat);
      bottle.position.set(Math.cos(acAngle) * 0.95, Math.sin(acAngle) * 0.95, 0.8);
      this.hubGroup.add(bottle);
    }

    for (let i = 0; i < 3; i++) {
      const azimuthAngle = (i * Math.PI * 2) / 3;

      const bladeArm = new THREE.Group();
      bladeArm.rotation.z = azimuthAngle;

      const pitchSealGeo = new THREE.CylinderGeometry(1.55, 1.5, 0.75, 32);
      const pitchSealMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9, metalness: 0.05 });
      const pitchSeal = new THREE.Mesh(pitchSealGeo, pitchSealMat);
      pitchSeal.position.set(0, 2.15, 0);
      bladeArm.add(pitchSeal);

      const boltRingGeo = new THREE.TorusGeometry(1.48, 0.08, 8, 36);
      const boltRingMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });
      const boltRing = new THREE.Mesh(boltRingGeo, boltRingMat);
      boltRing.rotation.x = Math.PI / 2;
      boltRing.position.set(0, 1.9, 0);
      bladeArm.add(boltRing);

      // Electric Pitch Drive Motor & Reduction Gearbox inside the hub
      const pitchMotorGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.6, 16);
      const pitchMotorMat = new THREE.MeshStandardMaterial({ color: 0x00646e, metalness: 0.75, roughness: 0.25 });
      const pitchMotor = new THREE.Mesh(pitchMotorGeo, pitchMotorMat);
      pitchMotor.position.set(0.48, 1.45, 0.4);
      bladeArm.add(pitchMotor);

      // Rotating Pitch Pinion Gear meshed with the internal pitch bearing gear ring
      const pitchPinionGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.22, 14);
      const pitchPinionMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.15 });
      const pitchPinion = new THREE.Mesh(pitchPinionGeo, pitchPinionMat);
      pitchPinion.position.set(0.48, 1.78, 0.4);
      bladeArm.add(pitchPinion);
      this.pitchPinions.push(pitchPinion);

      const bladePitchGroup = new THREE.Group();
      bladePitchGroup.position.set(0, 2.4, 0);
      bladePitchGroup.rotation.x = -THREE.MathUtils.degToRad(2.5);

      const bladeMesh = this.createLoftedAirfoilBlade();
      bladeMesh.castShadow = true;
      bladeMesh.receiveShadow = true;
      bladePitchGroup.add(bladeMesh);

      bladeArm.add(bladePitchGroup);
      this.hubGroup.add(bladeArm);
      this.bladeGroups.push(bladePitchGroup);

      this.registerInspectable(bladeMesh, {
        title: `WINDCARE MONITORING 71m IntegralBlade® #${i + 1}`,
        tag: 'WINDCARE AERODYNAMICS',
        desc: '71.0m carbon/glass hybrid blade manufactured in a single cast without glue seams. Equipped with patented DinoTails® Next Generation trailing-edge serrations and DinoShells® root fairings.',
        specs: [
          { k: 'Length', v: '71.0 m' },
          { k: 'Technology', v: 'IntegralBlade® (No glue joints)' },
          { k: 'Aeroacoustics', v: 'DinoTails® Serrations' },
          { k: 'Root Aerodynamics', v: 'DinoShells® Fairings' }
        ]
      });
    }

    this.rotorGroup.add(this.hubGroup);
    this.nacelleGroup.add(this.rotorGroup);
  }

  getAirfoilPoints() {
    return [
      { x: 0.000, y: 0.000 },
      { x: 0.015, y: 0.024 },
      { x: 0.040, y: 0.042 },
      { x: 0.080, y: 0.065 },
      { x: 0.140, y: 0.090 },
      { x: 0.220, y: 0.110 },
      { x: 0.300, y: 0.118 },
      { x: 0.400, y: 0.114 },
      { x: 0.500, y: 0.099 },
      { x: 0.600, y: 0.078 },
      { x: 0.700, y: 0.054 },
      { x: 0.800, y: 0.032 },
      { x: 0.900, y: 0.015 },
      { x: 0.960, y: 0.006 },
      { x: 1.000, y: 0.000 },
      { x: 1.000, y: -0.002 },
      { x: 0.960, y: -0.005 },
      { x: 0.900, y: -0.010 },
      { x: 0.800, y: -0.020 },
      { x: 0.700, y: -0.030 },
      { x: 0.600, y: -0.040 },
      { x: 0.500, y: -0.050 },
      { x: 0.400, y: -0.058 },
      { x: 0.300, y: -0.064 },
      { x: 0.220, y: -0.062 },
      { x: 0.140, y: -0.054 },
      { x: 0.080, y: -0.042 },
      { x: 0.040, y: -0.028 },
      { x: 0.015, y: -0.016 },
    ];
  }

  createLoftedAirfoilBlade() {
    const bladeGroup = new THREE.Group();
    const bladeLength = 70.0;
    const segments = 38;
    const airfoilBase = this.getAirfoilPoints();
    const numPoints = airfoilBase.length;

    const vertices = [];
    const uvs = [];
    const indices = [];

    for (let s = 0; s <= segments; s++) {
      const t = s / segments;
      const spanY = t * bladeLength;

      let chord;
      if (t < 0.18) {
        chord = THREE.MathUtils.lerp(2.9, 4.8, t / 0.18);
      } else {
        chord = THREE.MathUtils.lerp(4.8, 0.45, (t - 0.18) / 0.82);
      }

      const airfoilBlend = Math.min(1.0, Math.max(0.0, (t - 0.03) / 0.15));

      let twistDeg;
      if (t < 0.18) {
        twistDeg = THREE.MathUtils.lerp(15.0, 11.5, t / 0.18);
      } else if (t < 0.6) {
        twistDeg = THREE.MathUtils.lerp(11.5, 3.8, (t - 0.18) / 0.42);
      } else {
        twistDeg = THREE.MathUtils.lerp(3.8, -0.8, (t - 0.6) / 0.4);
      }
      const twistRad = THREE.MathUtils.degToRad(twistDeg);

      const preBendZ = Math.pow(t, 2.2) * 1.85;

      let wingletX = 0.0;
      let wingletZ = 0.0;
      if (t > 0.92) {
        const wt = (t - 0.92) / 0.08;
        wingletX = -Math.pow(wt, 2.0) * 0.45;
        wingletZ = Math.pow(wt, 2.0) * 0.9;
      }

      for (let p = 0; p < numPoints; p++) {
        const angle = (p / numPoints) * Math.PI * 2;
        const circX = -Math.cos(angle) * (chord * 0.5);
        const circZ = Math.sin(angle) * (chord * 0.5);

        const pt = airfoilBase[p];
        const afX = (pt.x - 0.3) * chord;
        const afZ = pt.y * chord;

        const rawX = THREE.MathUtils.lerp(circX, afX, airfoilBlend) + wingletX;
        const rawZ = THREE.MathUtils.lerp(circZ, afZ, airfoilBlend);

        const rotX = rawX * Math.cos(twistRad) - rawZ * Math.sin(twistRad);
        const rotZ = rawX * Math.sin(twistRad) + rawZ * Math.cos(twistRad) + preBendZ + wingletZ;

        vertices.push(rotX, spanY, rotZ);
        uvs.push(p / numPoints, t);
      }
    }

    for (let s = 0; s < segments; s++) {
      for (let p = 0; p < numPoints; p++) {
        const pNext = (p + 1) % numPoints;
        const current = s * numPoints + p;
        const next = s * numPoints + pNext;
        const currentUpper = (s + 1) * numPoints + p;
        const nextUpper = (s + 1) * numPoints + pNext;

        indices.push(current, currentUpper, next);
        indices.push(next, currentUpper, nextUpper);
      }
    }

    const bladeGeo = new THREE.BufferGeometry();
    bladeGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    bladeGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    bladeGeo.setIndex(indices);
    bladeGeo.computeVertexNormals();

    bladeGeo.userData.basePositions = new Float32Array(vertices);

    const bladeMat = new THREE.MeshStandardMaterial({
      map: this.generateBladeTexture(),
      roughness: 0.18,
      metalness: 0.08,
      side: THREE.DoubleSide,
    });

    const airfoilMesh = new THREE.Mesh(bladeGeo, bladeMat);
    bladeGroup.add(airfoilMesh);
    this.bladeMeshes.push(airfoilMesh);

    const tipCapGeo = new THREE.ConeGeometry(0.35, 2.0, 16);
    tipCapGeo.translate(0, bladeLength + 0.9, 1.9);
    tipCapGeo.rotateX(0.18);
    const tipMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.22, metalness: 0.1 });
    const tipCap = new THREE.Mesh(tipCapGeo, tipMat);
    bladeGroup.add(tipCap);

    const rootFlangeGeo = new THREE.TorusGeometry(1.48, 0.08, 8, 36);
    rootFlangeGeo.rotateX(Math.PI / 2);
    rootFlangeGeo.translate(0, 0.15, 0);
    const rootFlangeMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });
    const rootFlange = new THREE.Mesh(rootFlangeGeo, rootFlangeMat);
    bladeGroup.add(rootFlange);

    return bladeGroup;
  }

  // =========================================================================
  // 5. LIVING BEINGS & ENVIRONMENT ECOSYSTEM
  // =========================================================================

  /**
   * Populates the wind park with life:
   * 1. Animated flocks of soaring birds with flapping and thermal gliding
   * 2. Grazing animals (sheep and deer) roaming the green hills
   * 3. Siemens Gamesa field engineers & maintenance crew
   * 4. 4x4 wind farm service utility truck
   * 5. Clustered pine trees & flowering shrubs
   */
  buildLivingBeingsEcosystem() {
    this.buildSoaringBirdsFlock();
    this.buildMaintenanceCrew();
    this.buildServiceVehicle();
  }

  /**
   * 1. Animated Flock of Soaring Coastal Birds (Raptors & Gulls)
   */
  buildSoaringBirdsFlock() {
    this.birdsList = [];
    const birdCount = 18;

    const birdBodyMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.5 });
    const birdWingMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6, side: THREE.DoubleSide });
    const beakMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });

    for (let b = 0; b < birdCount; b++) {
      const birdGroup = new THREE.Group();

      // Fuselage Body
      const bodyGeo = new THREE.ConeGeometry(0.22, 1.4, 8);
      bodyGeo.rotateX(Math.PI / 2);
      const body = new THREE.Mesh(bodyGeo, birdBodyMat);
      birdGroup.add(body);

      // Beak
      const beakGeo = new THREE.ConeGeometry(0.08, 0.35, 6);
      beakGeo.rotateX(Math.PI / 2);
      const beak = new THREE.Mesh(beakGeo, beakMat);
      beak.position.set(0, 0, 0.85);
      birdGroup.add(beak);

      // Left Wing (Hinged for flapping)
      const lWingPivot = new THREE.Group();
      lWingPivot.position.set(-0.15, 0.05, 0.1);
      const lWingGeo = new THREE.BoxGeometry(1.6, 0.03, 0.45);
      lWingGeo.translate(-0.8, 0, 0);
      const lWing = new THREE.Mesh(lWingGeo, birdWingMat);
      lWingPivot.add(lWing);
      birdGroup.add(lWingPivot);

      // Right Wing (Hinged for flapping)
      const rWingPivot = new THREE.Group();
      rWingPivot.position.set(0.15, 0.05, 0.1);
      const rWingGeo = new THREE.BoxGeometry(1.6, 0.03, 0.45);
      rWingGeo.translate(0.8, 0, 0);
      const rWing = new THREE.Mesh(rWingGeo, birdWingMat);
      rWingPivot.add(rWing);
      birdGroup.add(rWingPivot);

      // Random flight orbit parameters
      const orbitRadius = 90 + Math.random() * 160;
      const orbitHeight = 45 + Math.random() * 95; // Flying around rotor height
      const speed = 0.35 + Math.random() * 0.4;
      const phase = Math.random() * Math.PI * 2;
      const orbitCenter = new THREE.Vector2((Math.random() - 0.5) * 120, (Math.random() - 0.5) * 120);

      this.scene.add(birdGroup);
      this.birdsList.push({
        group: birdGroup,
        lWing: lWingPivot,
        rWing: rWingPivot,
        orbitRadius,
        orbitHeight,
        speed,
        phase,
        orbitCenter,
        flapSpeed: 7.0 + Math.random() * 4.0,
      });

      this.registerInspectable(body, {
        title: 'Coastal Raptor / Avian Wildlife',
        tag: 'BIODIVERSITY / WILDLIFE',
        desc: 'Local avifauna soaring in thermal updrafts around the wind park. WINDCARE MONITORING turbines utilize automated camera radar systems to feather blades and protect birds in flight.',
        specs: [
          { k: 'Avian Species', v: 'Red Kite / Sea Gull' },
          { k: 'Flight Altitude', v: `${Math.round(orbitHeight)} m AGL` },
          { k: 'Monitoring', v: 'IdentiFlight AI Detection' }
        ]
      });
    }
  }

  /**
   * 2. Grazing Pasture Animals (Sheep & Deer on the Green Hills)
   */
  buildGrazingAnimals() {
    this.animalsList = [];

    // 8 Grazing Sheep scattered on the meadows
    const sheepMat = new THREE.MeshStandardMaterial({ color: 0xede8d0, roughness: 0.9 });
    const faceMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.7 });

    const sheepLocations = [
      { x: this.getRidgeX(-45) - 4.5, z: -45 },
      { x: this.getRidgeX(-55) - 6.2, z: -55 },
      { x: this.getRidgeX(-68) + 5.5, z: -68 },
      { x: this.getRidgeX(-130) - 5.0, z: -130 },
      { x: this.getRidgeX(-145) + 6.0, z: -145 },
      { x: this.getRidgeX(35) - 5.5, z: 35 },
      { x: this.getRidgeX(48) + 4.8, z: 48 },
      { x: this.getRidgeX(-210) - 6.0, z: -210 },
    ];

    sheepLocations.forEach((loc, idx) => {
      const sheep = new THREE.Group();
      const groundY = this.getTerrainHeight(loc.x, loc.z);
      sheep.position.set(loc.x, groundY, loc.z);
      sheep.rotation.y = Math.random() * Math.PI * 2;

      // Woolly Body
      const bodyGeo = new THREE.DodecahedronGeometry(0.7, 1);
      bodyGeo.scale(1.2, 0.9, 0.85);
      const body = new THREE.Mesh(bodyGeo, sheepMat);
      body.position.y = 0.85;
      sheep.add(body);

      // Head & Neck (Hinged for grazing animation)
      const headGroup = new THREE.Group();
      headGroup.position.set(0.65, 0.85, 0);

      const headGeo = new THREE.BoxGeometry(0.35, 0.3, 0.3);
      const head = new THREE.Mesh(headGeo, faceMat);
      head.position.set(0.2, 0, 0);
      headGroup.add(head);

      sheep.add(headGroup);

      // 4 Legs
      const legGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.65, 6);
      [
        [-0.4, 0.32, -0.28],
        [-0.4, 0.32, 0.28],
        [0.4, 0.32, -0.28],
        [0.4, 0.32, 0.28],
      ].forEach((lp) => {
        const leg = new THREE.Mesh(legGeo, faceMat);
        leg.position.set(lp[0], lp[1], lp[2]);
        sheep.add(leg);
      });

      this.onshoreGroup.add(sheep);
      this.animalsList.push({
        group: sheep,
        headGroup,
        baseRot: headGroup.rotation.z,
        grazingSpeed: 0.8 + Math.random() * 0.6,
        phase: Math.random() * 5.0,
      });

      this.registerInspectable(body, {
        title: `Pasture Grazing Sheep #${idx + 1}`,
        tag: 'WINDCARE PARK ECOSYSTEM',
        desc: 'Livestock grazing safely in the wind farm pasture. WINDCARE MONITORING DinoTails® low-noise technology guarantees sub-45dB(A) ground acoustics for peaceful coexistence.',
        specs: [
          { k: 'Species', v: 'Domestic Ovis aries' },
          { k: 'Ground Noise', v: '< 42 dB(A)' },
          { k: 'Land Status', v: 'Active Agricultural Pasture' }
        ]
      });
    });

    // 5 Highland Ponies / Fallow Deer on the mountain ridge crest
    const deerMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.65 });
    const deerLocations = [
      { x: this.getRidgeX(-75) + 6.5, z: -75 },
      { x: this.getRidgeX(-85) + 5.0, z: -85 },
      { x: this.getRidgeX(-170) - 5.5, z: -170 },
      { x: this.getRidgeX(-240) + 6.0, z: -240 },
      { x: this.getRidgeX(65) - 6.5, z: 65 },
    ];

    deerLocations.forEach((loc, idx) => {
      const deer = new THREE.Group();
      const groundY = this.getTerrainHeight(loc.x, loc.z);
      deer.position.set(loc.x, groundY, loc.z);
      deer.rotation.y = Math.random() * Math.PI * 2;

      // Torso
      const torsoGeo = new THREE.CylinderGeometry(0.35, 0.45, 1.4, 8);
      torsoGeo.rotateZ(Math.PI / 2);
      const torso = new THREE.Mesh(torsoGeo, deerMat);
      torso.position.y = 1.35;
      deer.add(torso);

      // Neck & Head with Antlers
      const neckGroup = new THREE.Group();
      neckGroup.position.set(0.65, 1.4, 0);

      const neckGeo = new THREE.CylinderGeometry(0.14, 0.22, 0.8, 6);
      neckGeo.rotateZ(-0.45);
      const neck = new THREE.Mesh(neckGeo, deerMat);
      neck.position.set(0.25, 0.35, 0);
      neckGroup.add(neck);

      const headGeo = new THREE.ConeGeometry(0.18, 0.5, 6);
      headGeo.rotateZ(-Math.PI / 2);
      const head = new THREE.Mesh(headGeo, deerMat);
      head.position.set(0.55, 0.65, 0);
      neckGroup.add(head);

      deer.add(neckGroup);

      // Slender Legs
      const dLegGeo = new THREE.CylinderGeometry(0.05, 0.04, 1.25, 6);
      [
        [-0.45, 0.62, -0.22],
        [-0.45, 0.62, 0.22],
        [0.45, 0.62, -0.22],
        [0.45, 0.62, 0.22],
      ].forEach((lp) => {
        const leg = new THREE.Mesh(dLegGeo, deerMat);
        leg.position.set(lp[0], lp[1], lp[2]);
        deer.add(leg);
      });

      this.onshoreGroup.add(deer);
      this.animalsList.push({
        group: deer,
        headGroup: neckGroup,
        baseRot: neckGroup.rotation.z,
        grazingSpeed: 0.6 + Math.random() * 0.4,
        phase: Math.random() * 5.0,
      });

      this.registerInspectable(torso, {
        title: `Wild Fallow Deer #${idx + 1}`,
        tag: 'WILDLIFE CONSERVATION',
        desc: 'Wild deer flourishing across the preserved wind park buffer zones and natural meadows with undisturbed wildlife corridors.',
        specs: [
          { k: 'Fauna', v: 'Cervus dama (Fallow Deer)' },
          { k: 'Habitat', v: 'Protected Wind Park Ridge' },
          { k: 'Conservation', v: 'Zero Habitat Fragmentation' }
        ]
      });
    });
  }

  /**
   * 3. Siemens Gamesa Maintenance Crew & Field Engineers (People)
   */
  buildMaintenanceCrew() {
    this.techniciansList = [];

    // Technician 1: On the elevated portal landing platform (monitoring turbine)
    const tech1 = this.createHumanTechnician('#f97316', 'Platform Lead Engineer'); // High-vis Orange
    tech1.position.set(0.4, 2.3, 3.8);
    tech1.rotation.y = -Math.PI / 2;
    this.onshoreGroup.add(tech1);

    // Technician 2: At the foundation ground pad (substation checks)
    const tech2 = this.createHumanTechnician('#eab308', 'Substation Electrical Specialist'); // High-vis Yellow
    tech2.position.set(5.2, 0.0, 4.2);
    tech2.rotation.y = -Math.PI / 3;
    this.onshoreGroup.add(tech2);

    // Technician 3: Near the service truck
    const tech3 = this.createHumanTechnician('#00a3ad', 'Field Inspection Manager'); // Siemens Teal vest
    tech3.position.set(13.2, 0.0, 7.8);
    tech3.rotation.y = Math.PI / 4;
    this.onshoreGroup.add(tech3);
  }

  createHumanTechnician(vestColor, roleName) {
    const human = new THREE.Group();

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.6 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const vestMat = new THREE.MeshStandardMaterial({ color: vestColor, roughness: 0.4, metalness: 0.1 });
    const helmetMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.3 });
    const bootsMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });

    // Boots
    [-0.12, 0.12].forEach((bx) => {
      const boot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.26), bootsMat);
      boot.position.set(bx, 0.06, 0.04);
      human.add(boot);
    });

    // Legs / Pants
    [-0.12, 0.12].forEach((lx) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.75, 8), pantsMat);
      leg.position.set(lx, 0.48, 0);
      human.add(leg);
    });

    // Torso with High-Vis Safety Vest
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.55, 0.26), vestMat);
    torso.position.set(0, 1.15, 0);
    human.add(torso);

    // Reflective Silver Safety Strips
    const stripMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2 });
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.06, 0.27), stripMat);
    strip.position.set(0, 1.25, 0);
    human.add(strip);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), skinMat);
    head.position.set(0, 1.58, 0);
    human.add(head);

    // Safety Helmet / Hard Hat
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2), helmetMat);
    helmet.position.set(0, 1.62, 0);
    human.add(helmet);

    // Tablet / Diagnostic Tool in hands
    const tablet = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.02), new THREE.MeshStandardMaterial({ color: 0x0284c7 }));
    tablet.position.set(0, 1.1, 0.25);
    tablet.rotation.x = -0.4;
    human.add(tablet);

    this.registerInspectable(torso, {
      title: `WINDCARE MONITORING Service Technician (${roleName})`,
      tag: 'OPERATIONS & MAINTENANCE',
      desc: 'Certified GWO wind turbine maintenance engineer equipped with fall-arrest PPE and digital diagnostic tablet performing periodic SCADA inspection.',
      specs: [
        { k: 'Role', v: roleName },
        { k: 'Certification', v: 'GWO BST / IEC 61400' },
        { k: 'Safety PPE', v: 'Full Body Harness & Hard Hat' },
        { k: 'Status', v: 'On Duty · WTG-01 Site' }
      ]
    });

    return human;
  }

  /**
   * 4. Wind Farm 4x4 Utility Service Truck
   */
  buildServiceVehicle() {
    const truckGroup = new THREE.Group();
    truckGroup.position.set(12.0, 0.0, 10.0);
    truckGroup.rotation.y = -0.6;

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, roughness: 0.3 });
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x00a3ad, metalness: 0.3 }); // Siemens Teal racing stripe
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.9 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });

    // Chassis & Cabin
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.4, 2.6), bodyMat);
    cabin.position.set(0, 1.2, 0.4);
    truckGroup.add(cabin);

    // Windshield
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.7, 0.05), glassMat);
    windshield.position.set(0, 1.45, 1.72);
    windshield.rotation.x = -0.3;
    truckGroup.add(windshield);

    // Truck Bed
    const bed = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.8, 2.2), bodyMat);
    bed.position.set(0, 0.9, -1.8);
    truckGroup.add(bed);

    // Teal Livery Stripe
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.12, 0.12, 4.4), trimMat);
    stripe.position.set(0, 1.0, -0.6);
    truckGroup.add(stripe);

    // 4 Wheels
    [
      [-1.1, 0.45, 1.1],
      [1.1, 0.45, 1.1],
      [-1.1, 0.45, -1.7],
      [1.1, 0.45, -1.7],
    ].forEach((wp) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.35, 16), tireMat);
      wheel.rotateZ(Math.PI / 2);
      wheel.position.set(wp[0], wp[1], wp[2]);
      truckGroup.add(wheel);
    });

    // Roof Amber Safety Strobe
    const strobe = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.15, 8), new THREE.MeshBasicMaterial({ color: 0xffb800 }));
    strobe.position.set(0, 2.0, 0.4);
    truckGroup.add(strobe);
    this.truckBeacon = strobe;

    this.onshoreGroup.add(truckGroup);

    this.registerInspectable(cabin, {
      title: 'Wind Farm 4x4 Support Utility Vehicle',
      tag: 'FIELD LOGISTICS',
      desc: 'Heavy-duty 4x4 field service vehicle equipped with replacement pitch valves, diagnostic telemetry gear, and hydraulic service tools.',
      specs: [
        { k: 'Vehicle Type', v: 'All-Terrain 4x4 Utility' },
        { k: 'Payload', v: '1,200 kg Diagnostic Tools' },
        { k: 'Station', v: 'Crane Turnaround Hardstand' }
      ]
    });
  }

  /**
   * 5. Landscape Pine Trees & Wildflower Bushes
   */
  buildLandscapeVegetation() {
    this.landscapeTrees = [];

    const pineTrunkMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.92 });
    const pineFoliageMat = new THREE.MeshStandardMaterial({ color: 0x143822, roughness: 0.72 });
    const birchTrunkMat = new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.85 });
    const birchFoliageMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.65 });

    const treeConfigs = [
      // Scots Pines (Coniferous)
      { x: this.getRidgeX(-60) - 15.0, z: -60, type: 'pine', scale: 1.15 },
      { x: this.getRidgeX(-90) + 14.5, z: -90, type: 'pine', scale: 1.0 },
      { x: this.getRidgeX(-120) - 16.0, z: -120, type: 'pine', scale: 1.25 },
      { x: this.getRidgeX(-160) + 15.0, z: -160, type: 'pine', scale: 0.95 },
      { x: this.getRidgeX(-230) - 14.0, z: -230, type: 'pine', scale: 1.2 },
      { x: this.getRidgeX(40) - 15.0, z: 40, type: 'pine', scale: 1.1 },
      { x: this.getRidgeX(65) + 14.0, z: 65, type: 'pine', scale: 1.3 },

      // Mountain Dwarf Birches & Gorse (Deciduous)
      { x: this.getRidgeX(-35) + 12.0, z: -35, type: 'birch', scale: 1.05 },
      { x: this.getRidgeX(-80) - 12.5, z: -80, type: 'birch', scale: 0.95 },
      { x: this.getRidgeX(-150) + 13.0, z: -150, type: 'birch', scale: 1.1 },
      { x: this.getRidgeX(-280) - 13.5, z: -280, type: 'birch', scale: 1.0 },
      { x: this.getRidgeX(25) + 11.5, z: 25, type: 'birch', scale: 1.15 },
    ];

    treeConfigs.forEach((cfg) => {
      const tree = new THREE.Group();
      const groundY = this.getTerrainHeight(cfg.x, cfg.z);
      tree.position.set(cfg.x, groundY, cfg.z);
      tree.scale.setScalar(cfg.scale);

      if (cfg.type === 'pine') {
        // Tapered trunk
        const trunkGeo = new THREE.CylinderGeometry(0.32, 0.52, 4.5, 8);
        const trunk = new THREE.Mesh(trunkGeo, pineTrunkMat);
        trunk.position.y = 2.25;
        trunk.castShadow = true;
        tree.add(trunk);

        // 4 Dense Tiered Needle Boughs
        const foliageGroup = new THREE.Group();
        [3.8, 5.5, 7.1, 8.5].forEach((fy, idx) => {
          const radius = 2.8 - idx * 0.6;
          const foliageGeo = new THREE.ConeGeometry(radius, 2.6, 8);
          const foliage = new THREE.Mesh(foliageGeo, pineFoliageMat);
          foliage.position.y = fy;
          foliage.rotation.y = (idx * Math.PI) / 4;
          foliage.castShadow = true;
          foliageGroup.add(foliage);
        });
        tree.add(foliageGroup);
        this.landscapeTrees.push({ group: tree, foliage: foliageGroup, swayFactor: 0.03 });
      } else {
        // Slender Birch Trunk with horizontal markings
        const trunkGeo = new THREE.CylinderGeometry(0.24, 0.38, 5.0, 8);
        const trunk = new THREE.Mesh(trunkGeo, birchTrunkMat);
        trunk.position.y = 2.5;
        trunk.castShadow = true;
        tree.add(trunk);

        // Broad Spreading Deciduous Canopy
        const foliageGroup = new THREE.Group();
        const crownGeo1 = new THREE.DodecahedronGeometry(2.2, 1);
        crownGeo1.scale(1.1, 1.3, 1.0);
        const crown1 = new THREE.Mesh(crownGeo1, birchFoliageMat);
        crown1.position.set(0, 5.8, 0);
        crown1.castShadow = true;
        foliageGroup.add(crown1);

        const crownGeo2 = new THREE.DodecahedronGeometry(1.6, 1);
        const crown2 = new THREE.Mesh(crownGeo2, birchFoliageMat);
        crown2.position.set(0.6, 4.6, 0.4);
        crown2.castShadow = true;
        foliageGroup.add(crown2);

        tree.add(foliageGroup);
        this.landscapeTrees.push({ group: tree, foliage: foliageGroup, swayFactor: 0.05 });
      }

      this.onshoreGroup.add(tree);
    });
  }

  // =========================================================================
  // 6. HELICAL BLADE TIP VORTICES & BRAKE SPARKS
  // =========================================================================

  buildTipVortexSystem() {
    const vortexCount = 360;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(vortexCount * 3);

    for (let i = 0; i < vortexCount * 3; i++) {
      positions[i] = 0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const vortexMat = new THREE.PointsMaterial({
      color: 0x00f2fe,
      size: 3.5,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.tipVortexPoints = new THREE.Points(geometry, vortexMat);
    this.scene.add(this.tipVortexPoints);
  }

  buildBrakeSparksSystem() {
    const sparkCount = 120;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(sparkCount * 3);
    const velocities = new Float32Array(sparkCount * 3);

    for (let i = 0; i < sparkCount; i++) {
      positions[i * 3 + 0] = 0;
      positions[i * 3 + 1] = this.HUB_HEIGHT + 2.5;
      positions[i * 3 + 2] = -2.7;

      velocities[i * 3 + 0] = (Math.random() - 0.5) * 8.0;
      velocities[i * 3 + 1] = Math.random() * 5.0 - 2.0;
      velocities[i * 3 + 2] = -Math.random() * 12.0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const sparkMat = new THREE.PointsMaterial({
      color: 0xffaa00,
      size: 2.8,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.sparksSystem = new THREE.Points(geometry, sparkMat);
    this.sparksSystem.userData = { velocities, sparkCount };
    this.scene.add(this.sparksSystem);
  }

  /**
   * 8 Full-Scale Siemens Gamesa SG 5.0-145 Wind Turbines marching along the Mountain Ridge
   * Exactly matching the sweeping progression of turbines in the reference photo!
   */
  buildRidgeTurbineString() {
    this.ridgeTurbinesGroup = new THREE.Group();

    const ridgeZ = [-100, -200, -310, -430, -560, -700, -850, -1020];

    const towerMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.38,
      metalness: 0.22,
    });
    const nacelleMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.32,
      metalness: 0.15,
    });
    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.28,
      metalness: 0.12,
    });
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x828c9b,
      roughness: 0.88,
      metalness: 0.08,
    });
    const tipRedMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.35,
    });
    const sgreTealMat = new THREE.MeshStandardMaterial({
      color: 0x00646e,
      roughness: 0.3,
      metalness: 0.4,
    });

    ridgeZ.forEach((zPos, idx) => {
      const turbineGroup = new THREE.Group();
      const xPos = this.getRidgeX(zPos);
      const groundY = this.getTerrainHeight(xPos, zPos);
      turbineGroup.position.set(xPos, groundY, zPos);

      // 1. Concrete Foundation Plinth
      const plinthGeo = new THREE.CylinderGeometry(7.2, 7.8, 1.8, 8);
      const plinth = new THREE.Mesh(plinthGeo, plinthMat);
      plinth.position.y = 0.9;
      plinth.receiveShadow = true;
      plinth.castShadow = true;
      turbineGroup.add(plinth);

      // 2. Full-Scale Tapered Steel Tubular Tower (107.5m Hub Height)
      const tGeo = new THREE.CylinderGeometry(1.65, 2.7, this.HUB_HEIGHT, 24);
      tGeo.translate(0, this.HUB_HEIGHT / 2, 0);
      const tower = new THREE.Mesh(tGeo, towerMat);
      tower.castShadow = true;
      tower.receiveShadow = true;
      turbineGroup.add(tower);

      // 3. Yaw Assembly (Aligned facing prevailing mountain breeze / west)
      const yawGroup = new THREE.Group();
      yawGroup.position.y = this.HUB_HEIGHT;
      yawGroup.rotation.y = 0; // Will be animated in sync with main turbine yaw

      // SG 5.0-145 Aerodynamic Nacelle Housing
      const nacelleBodyGeo = new THREE.BoxGeometry(4.2, 4.4, 15.5);
      nacelleBodyGeo.translate(0, 0, -2.5);
      const nacelle = new THREE.Mesh(nacelleBodyGeo, nacelleMat);
      nacelle.castShadow = true;
      yawGroup.add(nacelle);

      // Siemens Gamesa Livery Accent Stripe
      const stripeGeo = new THREE.BoxGeometry(4.26, 0.45, 12.0);
      stripeGeo.translate(0, 0.2, -3.0);
      const stripe = new THREE.Mesh(stripeGeo, sgreTealMat);
      yawGroup.add(stripe);

      // Rooftop Heat Exchanger Cooling Vents
      const coolerGeo = new THREE.BoxGeometry(3.2, 0.65, 4.2);
      coolerGeo.translate(0, 2.5, -4.5);
      const cooler = new THREE.Mesh(coolerGeo, towerMat);
      yawGroup.add(cooler);

      // Dual Red Aviation Warning Obstruction Beacon
      const beaconGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.35, 8);
      const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(0, 2.9, -6.5);
      yawGroup.add(beacon);
      this.beaconMeshes.push(beacon);

      // 4. Rotor Group with 3 Aeroelastic Blades (Ø 145m Rotor Diameter)
      const rotorGroup = new THREE.Group();
      rotorGroup.position.set(0, 0, 5.25);

      // Hub Spinner Nosecone
      const spinnerGeo = new THREE.ConeGeometry(2.1, 4.8, 24);
      spinnerGeo.rotateX(Math.PI / 2);
      const spinner = new THREE.Mesh(spinnerGeo, nacelleMat);
      spinner.castShadow = true;
      rotorGroup.add(spinner);

      // 3 Blades with 71m length and DinoTails
      for (let b = 0; b < 3; b++) {
        const bladePivot = new THREE.Group();
        bladePivot.rotation.z = (b * Math.PI * 2) / 3;

        // Root cylinder
        const rootGeo = new THREE.CylinderGeometry(1.4, 1.45, 7.0, 16);
        rootGeo.translate(0, 3.5, 0);
        const root = new THREE.Mesh(rootGeo, nacelleMat);
        bladePivot.add(root);

        // Main blade body
        const bGeo = new THREE.BoxGeometry(2.1, 56.0, 0.55);
        bGeo.translate(0, 35.0, 0);
        const bMesh = new THREE.Mesh(bGeo, bladeMat);
        bMesh.castShadow = true;
        bladePivot.add(bMesh);

        // Tapered tip with red aviation band
        const tipGeo = new THREE.ConeGeometry(0.95, 11.0, 12);
        tipGeo.translate(0, 68.5, 0);
        const tip = new THREE.Mesh(tipGeo, tipRedMat);
        tip.castShadow = true;
        bladePivot.add(tip);

        rotorGroup.add(bladePivot);
      }

      rotorGroup.rotation.z = Math.random() * Math.PI * 2; // Natural asynchronous blade phase
      yawGroup.add(rotorGroup);
      turbineGroup.add(yawGroup);

      this.farmRotorGroups.push(rotorGroup);
      this.farmYawGroups.push(yawGroup);
      this.ridgeTurbinesGroup.add(turbineGroup);

      this.registerInspectable(nacelle, {
        title: `WINDCARE MONITORING SG 5.0-145 (WTG-0${idx + 2})`,
        tag: 'HIGHLAND RIDGE STRING',
        desc: `High-elevation 5.0 MW turbine installed along the mountain ridge crest at station z = ${zPos} m. Operating synchronously to capture laminar alpine wind shear above the valley cloud layer.`,
        specs: [
          { k: 'Turbine Unit', v: `WTG-0${idx + 2} / Array String` },
          { k: 'Rated Power', v: '5.0 MW' },
          { k: 'Rotor Diameter', v: '145.0 m' },
          { k: 'Elevation', v: `${Math.round(groundY + this.HUB_HEIGHT)} m ASL` },
        ]
      });
    });

    this.scene.add(this.ridgeTurbinesGroup);
  }

  buildStreamlineParticles() {
    const count = this.streamlinesCount;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 180;
      positions[i * 3 + 1] = Math.random() * (this.HUB_HEIGHT + 85) + 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 280;
      velocities[i] = 0.85 + Math.random() * 0.35;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x00f2fe,
      size: 2.2,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.streamlinesSystem = new THREE.Points(geometry, particleMat);
    this.particlePositions = positions;
    this.particleVelocities = velocities;
    this.scene.add(this.streamlinesSystem);
  }

  registerInspectable(mesh, data) {
    if (!mesh || !mesh.isObject3D) return;
    mesh.userData = { isInspectable: true, ...data };
    this.inspectableMeshes.push(mesh);
  }

  setCutawayMode(enabled) {
    this.cutawayActive = enabled;
    if (this.nacelleShellMaterial) {
      if (enabled) {
        this.nacelleShellMaterial.opacity = 0.14;
        this.nacelleShellMaterial.color.setHex(0x00f2fe);
        this.nacelleShellMaterial.wireframe = true;
      } else {
        this.nacelleShellMaterial.opacity = 1.0;
        this.nacelleShellMaterial.color.setHex(0xffffff);
        this.nacelleShellMaterial.wireframe = false;
      }
    }
  }

  setTimeOfDay(mode) {
    this.currentEnvMode = mode;
    if (mode === 'day') {
      this.scene.fog.color.setHex(0x8eaec9); // Clear mountain sky haze
      this.scene.fog.density = 0.00032;
      this.ambientLight.color.setHex(0xd8e8f8);
      this.ambientLight.intensity = 0.42;
      this.hemiLight.color.setHex(0x89b0d6);
      this.hemiLight.groundColor.setHex(0x3a4835);
      this.hemiLight.intensity = 0.48;
      this.dirLight.color.setHex(0xfff7ee);
      this.dirLight.intensity = 1.5;
      this.dirLight.position.set(-160, 95, 120);
      this.sunSphere.visible = true;
      this.sunSphere.material.color.setHex(0xfff5e6);
    } else if (mode === 'sunset') {
      this.scene.fog.color.setHex(0x753026);
      this.scene.fog.density = 0.00038;
      this.ambientLight.color.setHex(0xffaa77);
      this.ambientLight.intensity = 0.38;
      this.hemiLight.color.setHex(0xff8844);
      this.hemiLight.groundColor.setHex(0x3a180d);
      this.hemiLight.intensity = 0.42;
      this.dirLight.color.setHex(0xff7733);
      this.dirLight.intensity = 1.4;
      this.dirLight.position.set(-190, 48, 55);
      this.sunSphere.visible = true;
      this.sunSphere.material.color.setHex(0xff5522);
    } else if (mode === 'night') {
      this.scene.fog.color.setHex(0x060b18);
      this.ambientLight.color.setHex(0x1a2844);
      this.ambientLight.intensity = 0.32;
      this.hemiLight.color.setHex(0x2a3d66);
      this.hemiLight.groundColor.setHex(0x050a14);
      this.dirLight.color.setHex(0x7090c0);
      this.dirLight.intensity = 0.55;
      this.dirLight.position.set(-80, 140, 120);
      this.sunSphere.visible = false;
    }

    if (this.renderer) {
      this.updateEnvironmentMap(mode);
    }
  }

  // =========================================================================
  // 7. REAL-TIME PHYSICAL ANIMATION, DEFORMATION & LIVING BEINGS LOOP
  // =========================================================================

  updateAnimation(physics, dt, time) {
    // 0. DYNAMIC VALLEY CLOUD SEA UNDULATION & RIDGE TURBINE ARRAY SYNCHRONIZATION
    if (this.cloudSeaGeometry && this.cloudSeaOriginalPositions) {
      const posAttr = this.cloudSeaGeometry.attributes.position;
      const arr = posAttr.array;
      const orig = this.cloudSeaOriginalPositions;
      const count = posAttr.count;

      for (let i = 0; i < count; i++) {
        const x = orig[i * 3 + 0];
        const z = orig[i * 3 + 2];
        const c1 = Math.sin(x * 0.008 + time * 0.25) * 2.8;
        const c2 = Math.cos(z * 0.009 + time * 0.2) * 2.2;
        const c3 = Math.sin((x + z) * 0.015 - time * 0.4) * 1.2;
        arr[i * 3 + 1] = orig[i * 3 + 1] + c1 + c2 + c3;
      }
      posAttr.needsUpdate = true;
      this.cloudSeaGeometry.computeVertexNormals();
    }

    // Rotate all auxiliary turbines along the mountain ridge with rotor aerodynamics
    if (this.farmRotorGroups && this.farmRotorGroups.length > 0) {
      const rotDelta = physics.angularVelocity * dt;
      this.farmRotorGroups.forEach((rotGroup) => {
        rotGroup.rotation.z += rotDelta;
      });
    }

    // Align all auxiliary ridge turbines facing into the active wind direction
    if (this.farmYawGroups && this.farmYawGroups.length > 0) {
      const yawRad = -THREE.MathUtils.degToRad(physics.nacelleYaw - 270);
      this.farmYawGroups.forEach((yawGroup) => {
        yawGroup.rotation.y = yawRad;
      });
    }

    // Volumetric cloud puffs gentle mountain valley drift
    if (this.cloudClusters && this.cloudClusters.length > 0) {
      this.cloudClusters.forEach((c) => {
        c.position.x += 1.2 * dt;
        if (c.position.x > 1200) c.position.x = -1200;
      });
    }
    // 1. FIXED ZERO-GAP MATHEMATICAL TOWER & NACELLE LOCKING
    // The tower sways under aerodynamic thrust; the nacelle is physically mounted
    // and clamped to the tower top, moving in perfect lockstep with zero offset!
    if (this.towerGroup && this.nacelleGroup) {
      const swayAngle = -(physics.thrustKn / 520.0) * 0.0035 + Math.sin(time * 1.35) * 0.0003 * (physics.windSpeed / 11.5);
      this.towerGroup.rotation.x = swayAngle;

      // Mathematically locked to the top of the tower:
      this.nacelleGroup.position.x = 0;
      this.nacelleGroup.position.y = this.HUB_HEIGHT * Math.cos(swayAngle);
      this.nacelleGroup.position.z = this.HUB_HEIGHT * Math.sin(swayAngle);
      this.nacelleGroup.rotation.x = swayAngle;
    }

    // 2. Nacelle Yaw Alignment around local tower axis
    if (this.nacelleGroup) {
      this.nacelleGroup.rotation.y = -THREE.MathUtils.degToRad(physics.nacelleYaw - 270);
    }

    // 3. Rotor Rotation
    if (this.hubGroup) {
      this.hubGroup.rotation.z += physics.angularVelocity * dt;
    }

    // 4. Blade Collective Pitch
    const pitchRad = THREE.MathUtils.degToRad(physics.bladePitch);
    this.bladeGroups.forEach((bGroup) => {
      bGroup.rotation.y = pitchRad;
    });

    // 5. TRUE DYNAMIC AEROELASTIC BLADE FLEXING
    const maxTipFlex = (physics.thrustKn / 480.0) * 3.1 + Math.sin(time * 2.4) * 0.09 * (physics.windSpeed / 11.5);

    this.bladeMeshes.forEach((mesh) => {
      const geo = mesh.geometry;
      const basePos = geo.userData.basePositions;
      if (!basePos) return;

      const posAttr = geo.attributes.position;
      const arr = posAttr.array;
      const count = posAttr.count;

      for (let k = 0; k < count; k++) {
        const y = basePos[k * 3 + 1];
        const spanRatio = Math.max(0.0, Math.min(1.0, y / 70.0));
        const bendZ = -maxTipFlex * Math.pow(spanRatio, 2.2);

        arr[k * 3 + 0] = basePos[k * 3 + 0];
        arr[k * 3 + 1] = basePos[k * 3 + 1];
        arr[k * 3 + 2] = basePos[k * 3 + 2] + bendZ;
      }
      posAttr.needsUpdate = true;
      geo.computeVertexNormals();
    });

    // 6. ANIMATED LIVING BEINGS: Soaring Birds Flock
    if (this.birdsList.length > 0) {
      this.birdsList.forEach((bird) => {
        bird.phase += bird.speed * dt;
        const currentX = bird.orbitCenter.x + Math.cos(bird.phase) * bird.orbitRadius;
        const currentZ = bird.orbitCenter.y + Math.sin(bird.phase) * bird.orbitRadius;
        const targetY = bird.orbitHeight + Math.sin(bird.phase * 2.0) * 8.0;

        bird.group.position.set(currentX, targetY, currentZ);

        // Heading angle facing trajectory
        const heading = bird.phase + Math.PI / 2;
        bird.group.rotation.y = -heading;
        bird.group.rotation.z = Math.sin(bird.phase) * 0.25; // Banking into turn

        // Flapping wings
        const flap = Math.sin(time * bird.flapSpeed + bird.phase * 3.0);
        bird.lWing.rotation.z = flap * 0.55;
        bird.rWing.rotation.z = -flap * 0.55;
      });
    }

    // 7. ANIMATED LIVING BEINGS: Grazing Pasture Animals
    if (this.animalsList.length > 0) {
      this.animalsList.forEach((anim) => {
        // Natural grazing head bobbing & alert lookups
        const grazeCycle = Math.sin(time * anim.grazingSpeed + anim.phase);
        anim.headGroup.rotation.z = THREE.MathUtils.lerp(-0.4, 0.2, (grazeCycle + 1.0) / 2.0);
      });
    }

    // 8. Rooftop Cooler Fans
    if (this.coolerFans.length > 0) {
      const fanSpeed = 12.0 + (physics.generatorTempC / 100.0) * 18.0;
      this.coolerFans.forEach((fan) => {
        fan.rotation.y += fanSpeed * dt;
      });
    }

    // 9. Roof Anemometer & Wind Vane
    if (this.anemometerCupsGroup) {
      const anemometerSpeed = (physics.windSpeed / 11.5) * 16.0;
      this.anemometerCupsGroup.rotation.y += anemometerSpeed * dt;
    }
    if (this.windVaneGroup) {
      this.windVaneGroup.rotation.y = Math.sin(time * 0.8) * 0.12;
    }

    // 10. REAL MECHANICAL DRIVETRAIN KINEMATICS
    // Low-Speed Main Shaft (LSS) rotates synchronously with the rotor (10.5 RPM)
    if (this.mainShaftGroup) {
      this.mainShaftGroup.rotation.z += physics.angularVelocity * dt;
    }

    // Main Bearing Spherical Rollers orbital speed (~45% of shaft speed)
    if (this.mainBearingRollers) {
      this.mainBearingRollers.rotation.z += physics.angularVelocity * 0.45 * dt;
    }

    // Stage 1 Planet Carrier rotates at low speed (rotor RPM)
    if (this.planetCarrier) {
      this.planetCarrier.rotation.z += physics.angularVelocity * dt;
    }

    // Stage 1 Planet Gears rotate on their own pins as they orbit the sun gear
    if (this.planetGears && this.planetGears.length > 0) {
      const planetSpinRate = -physics.angularVelocity * 2.0 * dt;
      this.planetGears.forEach((pg) => {
        pg.rotation.z += planetSpinRate;
      });
    }

    // Stage 1 Sun Gear spins at intermediate high speed (+5.8x)
    if (this.sunGear) {
      this.sunGear.rotation.z += physics.angularVelocity * 5.8 * dt;
    }

    // Stage 2 Intermediate Helical Stage spins at (+28.4x)
    if (this.intermediateStage) {
      this.intermediateStage.rotation.z += physics.angularVelocity * 28.4 * dt;
    }

    // Stage 3 High-Speed Shaft (HSS) and Ventilated Brake Disc (1,094 RPM = 104.2x)
    if (this.highSpeedShaftGroup) {
      const hsDelta = physics.angularVelocity * physics.GEARBOX_RATIO * dt;
      this.highSpeedShaftGroup.rotation.z += hsDelta;
    }

    // 5.0 MW DFIG Generator Inner Rotor Core & Cooling Impellers (1,094 RPM)
    if (this.generatorRotor) {
      const genDelta = physics.angularVelocity * physics.GEARBOX_RATIO * dt;
      this.generatorRotor.rotation.z += genDelta;
    }

    // Electric Yaw Drive Pinions rotate when nacelle is actively slewing
    if (this.yawPinions && this.yawPinions.length > 0) {
      if (physics.yawMotorActive) {
        const yawPinionSpeed = 18.0 * dt;
        this.yawPinions.forEach((yp) => {
          yp.rotation.y += yawPinionSpeed;
        });
      }
    }

    // OptiTip Blade Pitch Actuator Pinions rotate during pitch adjustments
    if (this.pitchPinions && this.pitchPinions.length > 0) {
      const pitchRad = THREE.MathUtils.degToRad(physics.bladePitch * 3.5);
      this.pitchPinions.forEach((pp) => {
        pp.rotation.z = pitchRad;
      });
    }

    // 11. Drifting 3D Atmospheric Clouds
    if (this.cloudsList.length > 0) {
      const windRad = THREE.MathUtils.degToRad(physics.windDirection);
      const cVx = -Math.cos(windRad) * physics.windSpeed * 0.45;
      const cVz = -Math.sin(windRad) * physics.windSpeed * 0.45;

      this.cloudsList.forEach((cItem) => {
        cItem.group.position.x += cVx * cItem.speedFactor * dt;
        cItem.group.position.z += cVz * cItem.speedFactor * dt;

        if (cItem.group.position.x > 450) cItem.group.position.x -= 900;
        if (cItem.group.position.x < -450) cItem.group.position.x += 900;
        if (cItem.group.position.z > 450) cItem.group.position.z -= 900;
        if (cItem.group.position.z < -450) cItem.group.position.z += 900;
      });
    }

    // 12. Auxiliary Background Wind Turbines (Safely guarded for single-turbine mode)
    if (this.farmRotorGroups && this.farmRotorGroups.length > 0) {
      this.farmRotorGroups.forEach((frGroup, idx) => {
        const speedFactor = 0.92 + (idx % 3) * 0.08;
        frGroup.rotation.z += physics.angularVelocity * speedFactor * dt;
      });
    }

    // 13. Synchronized Xenon Double-Flash Aviation Strobe
    if (this.beaconLights.length > 0) {
      const beaconCycle = (time * 1000) % 1500;
      const flash1 = beaconCycle > 100 && beaconCycle < 200;
      const flash2 = beaconCycle > 320 && beaconCycle < 420;
      const isLit = flash1 || flash2;

      this.beaconLights.forEach((light) => {
        light.intensity = isLit ? 9.0 : 0.0;
      });
      this.beaconMeshes.forEach((mesh) => {
        mesh.material.color.setHex(isLit ? 0xff2244 : 0x550011);
      });
    }

    // 14. Service Truck Amber Strobe
    if (this.truckBeacon) {
      const strobeOn = (time * 1000) % 800 < 400;
      this.truckBeacon.material.color.setHex(strobeOn ? 0xffaa00 : 0x553300);
    }

    // 15. Volumetric 3D Meadow Grass Dynamic Wind Sway
    if (this.instancedGrass) {
      this.instancedGrass.rotation.z = Math.sin(time * 2.8) * 0.02 * (physics.windSpeed / 10.0);
    }

    // 16. Landscape Pine & Birch Trees Wind Reaction
    if (this.landscapeTrees && this.landscapeTrees.length > 0) {
      const treeSway = Math.sin(time * 1.8) * 0.035 * (physics.windSpeed / 11.5);
      this.landscapeTrees.forEach((t) => {
        t.foliage.rotation.z = treeSway * t.swayFactor * 20.0;
      });
    }

    // 15. Mechanical Brake Disc Thermal Emission & Flying Sparks
    if (this.brakeDiscMaterial) {
      if (physics.brakeDiscGlow > 0.05) {
        this.brakeDiscMaterial.emissive.setHex(0xff3300);
        this.brakeDiscMaterial.emissiveIntensity = physics.brakeDiscGlow * 3.8;
      } else {
        this.brakeDiscMaterial.emissiveIntensity = 0.0;
      }
    }

    if (this.sparksSystem) {
      const isBrakingWithSpeed = physics.brakeActive && physics.rotorRpm > 1.0;
      this.sparksSystem.material.opacity = isBrakingWithSpeed ? 0.85 : 0.0;

      if (isBrakingWithSpeed) {
        const pArr = this.sparksSystem.geometry.attributes.position.array;
        const vArr = this.sparksSystem.userData.velocities;
        const sCount = this.sparksSystem.userData.sparkCount;

        for (let s = 0; s < sCount; s++) {
          pArr[s * 3 + 0] += vArr[s * 3 + 0] * dt;
          pArr[s * 3 + 1] += vArr[s * 3 + 1] * dt - 9.8 * dt * dt;
          pArr[s * 3 + 2] += vArr[s * 3 + 2] * dt;

          if (pArr[s * 3 + 1] < this.HUB_HEIGHT) {
            pArr[s * 3 + 0] = (Math.random() - 0.5) * 0.4;
            pArr[s * 3 + 1] = this.HUB_HEIGHT + 2.8;
            pArr[s * 3 + 2] = -2.7;
          }
        }
        this.sparksSystem.geometry.attributes.position.needsUpdate = true;
      }
    }

    // 16. Streamline Flow Particles
    if (this.streamlinesSystem && this.streamlinesSystem.visible) {
      const pos = this.streamlinesSystem.geometry.attributes.position.array;
      const windAngleRad = THREE.MathUtils.degToRad(physics.windDirection);
      const flowVx = -Math.cos(windAngleRad) * physics.windSpeed * 1.8;
      const flowVz = -Math.sin(windAngleRad) * physics.windSpeed * 1.8;

      for (let i = 0; i < this.streamlinesCount; i++) {
        const idx = i * 3;
        pos[idx + 0] += flowVx * dt * this.particleVelocities[i];
        pos[idx + 2] += flowVz * dt * this.particleVelocities[i];

        if (Math.abs(pos[idx + 0]) > 230 || Math.abs(pos[idx + 2]) > 230) {
          pos[idx + 0] = -flowVx * 3.5 + (Math.random() - 0.5) * 160;
          pos[idx + 1] = Math.random() * (this.HUB_HEIGHT + 85) + 10;
          pos[idx + 2] = -flowVz * 3.5 + (Math.random() - 0.5) * 120;
        }
      }
      this.streamlinesSystem.geometry.attributes.position.needsUpdate = true;
    }
  }
}

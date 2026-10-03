/**
 * Physics & Aerodynamics Engine for Siemens Gamesa SG 5.0-145 Wind Turbines
 * Implements Betz Limit equations, Blade Element Aerodynamics,
 * OptiTip MPPT controller, Active Grid Curtailment, NRO Low-Noise mode,
 * Rotational Inertia, Drivetrain Torque Balance, and Mountain Wind Farm Fleet Telemetry.
 */

export class TurbinePhysicsEngine {
  constructor() {
    // Physical Constants & Siemens Gamesa SG 5.0-145 Specifications
    this.AIR_DENSITY = 1.225; // kg/m^3 at sea level & 15°C
    this.ROTOR_RADIUS = 72.5; // meters (145m rotor diameter)
    this.SWEPT_AREA = Math.PI * Math.pow(this.ROTOR_RADIUS, 2); // ~16,513 m^2
    this.RATED_POWER_KW = 5000.0; // 5.0 MW rated electrical output per turbine
    this.GEARBOX_RATIO = 104.2; // 1:104.2 low-speed to high-speed ratio
    this.GEN_EFFICIENCY = 0.968; // 96.8% electrical generator conversion efficiency
    this.GEARBOX_EFFICIENCY = 0.976; // 97.6% mechanical transmission efficiency

    this.ROTOR_INERTIA = 2.4e6; // kg·m^2 (high angular inertia of 3x 71m IntegralBlade + hub)
    this.MIN_RPM = 0.0;
    this.RATED_RPM = 10.5; // Nominal rotor RPM at rated wind speed
    this.MAX_RPM = 12.2; // Maximum allowable aerodynamic RPM

    this.CUT_IN_WIND = 3.0; // m/s
    this.RATED_WIND = 11.5; // m/s
    this.CUT_OUT_WIND = 25.0; // m/s

    // Operating State Variables
    this.windSpeed = 11.5; // m/s
    this.windDirection = 270.0; // degrees
    this.nacelleYaw = 270.0; // degrees
    this.bladePitch = 2.8; // degrees (collective pitch)
    this.rotorRpm = 10.5; // RPM
    this.angularVelocity = (this.rotorRpm * 2 * Math.PI) / 60.0; // rad/s

    this.operatingMode = 'auto'; // 'auto' (OptiTip MPPT), 'manual', 'brake', 'feather'
    this.manualPitch = 2.8;
    this.manualYaw = 270.0;

    // Practical Grid & Wind Farm Operations Features
    this.curtailmentLimitPct = 100.0; // Active power curtailment dispatch (20% to 100%)
    this.nroMode = false; // Noise Reduced Operation (NRO / DinoTails mode)
    this.cableTwistDeg = 48.0; // Cumulative nacelle cable twist (±720°)
    this.untwistInProgress = false;

    // Derived Telemetry Values
    this.powerKw = 5000.0;
    this.powerMw = 5.00;
    this.cp = 0.485; // Power coefficient
    this.tsr = 8.12; // Tip Speed Ratio
    this.tipSpeedKmh = 287.0; // ~79.7 m/s
    this.aeroTorqueKnm = 4547.0;
    this.thrustKn = 485.0;
    this.generatorRpm = 1094.0;
    this.generatorTempC = 69.2;
    this.vibrationMms = 1.1;
    this.towerDeflectionM = 0.42;
    this.cumulativeEnergyMwh = 16850.0;
    this.co2OffsetTons = 11960.0;

    this.brakeActive = false;
    this.brakeDiscGlow = 0.0; // 0.0 to 1.0 (visual heat factor)
    this.yawMotorActive = false;

    // Practical Wind Farm Fleet Telemetry (8x SG 5.0-145 on Mountain Ridge)
    this.windFarmData = [
      { id: 'WTG-01', name: 'WTG-01 (Hero)', z: 0, status: 'RUNNING', wakeDeficit: 1.00, powerMw: 5.00, rpm: 10.5, pitchDeg: 2.8, tempC: 69.2 },
      { id: 'WTG-02', name: 'WTG-02', z: -100, status: 'RUNNING', wakeDeficit: 0.96, powerMw: 4.82, rpm: 10.3, pitchDeg: 2.9, tempC: 67.8 },
      { id: 'WTG-03', name: 'WTG-03', z: -200, status: 'RUNNING', wakeDeficit: 0.94, powerMw: 4.70, rpm: 10.1, pitchDeg: 3.1, tempC: 66.5 },
      { id: 'WTG-04', name: 'WTG-04', z: -310, status: 'RUNNING', wakeDeficit: 0.95, powerMw: 4.75, rpm: 10.2, pitchDeg: 3.0, tempC: 67.0 },
      { id: 'WTG-05', name: 'WTG-05', z: -430, status: 'RUNNING', wakeDeficit: 0.97, powerMw: 4.85, rpm: 10.3, pitchDeg: 2.9, tempC: 68.1 },
      { id: 'WTG-06', name: 'WTG-06', z: -560, status: 'RUNNING', wakeDeficit: 0.98, powerMw: 4.90, rpm: 10.4, pitchDeg: 2.8, tempC: 68.4 },
      { id: 'WTG-07', name: 'WTG-07', z: -700, status: 'RUNNING', wakeDeficit: 0.99, powerMw: 4.95, rpm: 10.5, pitchDeg: 2.8, tempC: 68.9 },
      { id: 'WTG-08', name: 'WTG-08', z: -850, status: 'RUNNING', wakeDeficit: 1.00, powerMw: 5.00, rpm: 10.5, pitchDeg: 2.8, tempC: 69.1 },
    ];
    this.totalFarmPowerMw = 38.97;
    this.farmRatedPowerMw = 40.0;
    this.farmCapacityFactorPct = 88.5;
    this.farmDailyEnergyMwh = 312.4;
    this.gridVoltageKv = 33.0;
    this.gridFrequencyHz = 50.00;
  }

  /**
   * Empirical approximation for Aerodynamic Power Coefficient Cp(lambda, pitch)
   * Based on widely accepted standard wind turbine aerodynamic model (Heier / Slootweg).
   */
  calculateCp(lambda, pitchDeg) {
    if (lambda <= 0.1) return 0.0;

    // Empirical coefficients for high-efficiency modern aerofoil blades
    const c1 = 0.5176;
    const c2 = 116.0;
    const c3 = 0.4;
    const c4 = 5.0;
    const c5 = 21.0;
    const c6 = 0.0068;

    const beta = Math.max(0.0, pitchDeg);
    const invLambdaI = (1.0 / (lambda + 0.08 * beta)) - (0.035 / (Math.pow(beta, 3) + 1.0));

    if (invLambdaI <= 0) return 0.0;

    let cp = c1 * (c2 * invLambdaI - c3 * beta - c4) * Math.exp(-c5 * invLambdaI) + c6 * lambda;
    // Constrain by Betz limit (0.593) and positive bounds
    return Math.max(0.0, Math.min(0.488, cp));
  }

  /**
   * Automated cable untwist procedure
   */
  untwistCables() {
    this.untwistInProgress = true;
  }

  /**
   * Step the dynamic simulation by dt seconds
   */
  update(dt, windGustFactor = 1.0) {
    // Effective wind speed including turbulence/gust factor
    const effectiveWind = Math.max(0.0, this.windSpeed * windGustFactor);

    // Calculate Yaw Misalignment Error
    let yawErrorDeg = (this.windDirection - this.nacelleYaw) % 360;
    if (yawErrorDeg > 180) yawErrorDeg -= 360;
    if (yawErrorDeg < -180) yawErrorDeg += 360;

    // Yaw Tracking & Cable Twist Handling
    if (this.untwistInProgress) {
      const untwistRate = 14.0 * dt;
      if (Math.abs(this.cableTwistDeg) > 0.5) {
        const step = Math.sign(this.cableTwistDeg) * Math.min(Math.abs(this.cableTwistDeg), untwistRate);
        this.cableTwistDeg -= step;
        this.nacelleYaw = (this.nacelleYaw - step + 360) % 360;
        this.yawMotorActive = true;
      } else {
        this.cableTwistDeg = 0.0;
        this.untwistInProgress = false;
        this.yawMotorActive = false;
      }
    } else if (this.operatingMode === 'auto') {
      const yawDeadband = 1.5; // degrees deadband to avoid continuous hunting
      const yawSpeed = 0.8 * dt; // 0.8 deg/sec yaw slew rate
      if (Math.abs(yawErrorDeg) > yawDeadband) {
        const deltaYaw = Math.sign(yawErrorDeg) * Math.min(Math.abs(yawErrorDeg), yawSpeed);
        this.nacelleYaw = (this.nacelleYaw + deltaYaw + 360) % 360;
        this.cableTwistDeg += deltaYaw;
        this.yawMotorActive = true;
      } else {
        this.yawMotorActive = false;
      }
    } else {
      // Manual Yaw control slew
      const manualError = (this.manualYaw - this.nacelleYaw) % 360;
      const deltaYaw = Math.sign(manualError) * Math.min(Math.abs(manualError), 1.5 * dt);
      this.nacelleYaw = (this.nacelleYaw + deltaYaw + 360) % 360;
      this.cableTwistDeg += deltaYaw;
      this.yawMotorActive = Math.abs(manualError) > 0.5;
    }

    // Effective wind velocity normal to rotor plane: v_eff = v * cos(yaw_error)
    const yawLossFactor = Math.pow(Math.max(0.0, Math.cos((yawErrorDeg * Math.PI) / 180)), 2.2);
    const vNormal = effectiveWind * yawLossFactor;

    // Pitch Angle Regulation
    if (this.operatingMode === 'brake') {
      // Emergency brake: Pitch to 90° full aerodynamic feathering
      const pitchRate = 12.0 * dt; // fast pitch rate
      this.bladePitch = Math.min(90.0, this.bladePitch + pitchRate);
      this.brakeActive = true;
    } else if (this.operatingMode === 'feather' || effectiveWind > this.CUT_OUT_WIND) {
      // Storm survival feathering
      const pitchRate = 8.0 * dt;
      this.bladePitch = Math.min(90.0, this.bladePitch + pitchRate);
      this.brakeActive = false;
    } else if (this.operatingMode === 'manual') {
      const pitchDiff = this.manualPitch - this.bladePitch;
      this.bladePitch += Math.sign(pitchDiff) * Math.min(Math.abs(pitchDiff), 6.0 * dt);
      this.brakeActive = false;
    } else {
      // AUTO-MPPT & ACTIVE CURTAILMENT REGULATION:
      this.brakeActive = false;
      let targetPitch = 0.5;

      if (effectiveWind < this.CUT_IN_WIND) {
        // Idling pitch
        targetPitch = 15.0;
      } else if (effectiveWind <= this.RATED_WIND) {
        // Optimal lift pitch
        targetPitch = 0.5;
      } else {
        // Region III: Blade pitch shedding excess power up to ~24°
        const excessWind = effectiveWind - this.RATED_WIND;
        targetPitch = 0.5 + Math.pow(excessWind / (this.CUT_OUT_WIND - this.RATED_WIND), 1.2) * 23.5;
      }

      // If active grid power curtailment is dispatched (< 100%)
      if (this.curtailmentLimitPct < 99.0 && effectiveWind >= this.CUT_IN_WIND) {
        const curtailOffset = ((100.0 - this.curtailmentLimitPct) / 80.0) * 14.5;
        targetPitch += curtailOffset;
      }

      // If Noise Reduced Operation (NRO / DinoTails) mode is engaged
      if (this.nroMode) {
        targetPitch += 1.4; // Slightly increased pitch to shed tip speed noise
      }

      this.bladePitch += (targetPitch - this.bladePitch) * 3.5 * dt;
    }

    // Dynamic Rotational Dynamics & Inertia:
    this.angularVelocity = (this.rotorRpm * 2 * Math.PI) / 60.0;

    // Tip Speed Ratio (lambda = omega * R / v)
    if (vNormal > 0.5) {
      this.tsr = (this.angularVelocity * this.ROTOR_RADIUS) / vNormal;
    } else {
      this.tsr = 0.0;
    }

    // Aerodynamic Power Coefficient Cp
    this.cp = this.calculateCp(this.tsr, this.bladePitch);

    // Aerodynamic Kinetic Power captured by rotor (Watts): P_aero = 0.5 * rho * A * v^3 * Cp
    const pAeroWatts = 0.5 * this.AIR_DENSITY * this.SWEPT_AREA * Math.pow(vNormal, 3) * this.cp;

    // Aerodynamic Driving Torque (N·m)
    let aeroTorqueNm = 0.0;
    if (this.angularVelocity > 0.1) {
      aeroTorqueNm = pAeroWatts / this.angularVelocity;
    } else if (vNormal > this.CUT_IN_WIND && this.bladePitch < 45) {
      // Static starting torque when stationary
      aeroTorqueNm = 0.5 * this.AIR_DENSITY * this.SWEPT_AREA * Math.pow(vNormal, 2) * 0.12 * this.ROTOR_RADIUS;
    }

    // Generator Counter-Torque & Mechanical Brake
    let counterTorqueNm = 0.0;
    let brakeTorqueNm = 0.0;

    if (this.brakeActive) {
      brakeTorqueNm = 2.5e6; // 2,500 kN·m equivalent at low speed shaft
      if (this.rotorRpm > 0.5) {
        this.brakeDiscGlow = Math.min(1.0, this.brakeDiscGlow + 1.2 * dt);
      }
    } else {
      this.brakeDiscGlow = Math.max(0.0, this.brakeDiscGlow - 0.4 * dt);

      if (this.operatingMode === 'auto' && effectiveWind >= this.CUT_IN_WIND && effectiveWind <= this.CUT_OUT_WIND) {
        const kOpt = 24000.0;
        const targetRpm = Math.min(
          this.nroMode ? 9.2 : this.RATED_RPM,
          Math.max(4.0, (effectiveWind * 8.05 * 60) / (2 * Math.PI * this.ROTOR_RADIUS))
        );

        counterTorqueNm = kOpt * Math.pow(this.angularVelocity, 2);

        // Cap counter-torque at dispatched power limit
        const dispatchedKw = this.RATED_POWER_KW * (this.curtailmentLimitPct / 100.0);
        const maxDispatchedTorque = (dispatchedKw * 1000.0) / Math.max(0.5, (this.RATED_RPM * 2 * Math.PI) / 60.0);
        if (counterTorqueNm > maxDispatchedTorque) {
          counterTorqueNm = maxDispatchedTorque;
        }

        // Speed governor feedback
        const speedLimit = this.nroMode ? 9.2 : this.RATED_RPM;
        if (this.rotorRpm > speedLimit) {
          counterTorqueNm += (this.rotorRpm - speedLimit) * 500000.0;
        }
      } else if (this.operatingMode === 'manual') {
        counterTorqueNm = aeroTorqueNm * 0.85;
      }
    }

    // Bearing and aerodynamic friction losses
    const frictionTorqueNm = this.angularVelocity * 15000.0 + 5000.0;

    // Net Torque: J * d(omega)/dt = tau_aero - tau_gen - tau_brake - tau_friction
    const netTorque = aeroTorqueNm - counterTorqueNm - brakeTorqueNm - (this.angularVelocity > 0.05 ? frictionTorqueNm : 0);
    const angularAccel = netTorque / this.ROTOR_INERTIA;

    this.angularVelocity = Math.max(0.0, this.angularVelocity + angularAccel * dt);
    this.rotorRpm = (this.angularVelocity * 60.0) / (2 * Math.PI);

    // Generator Electrical Output
    const mechPowerWatts = counterTorqueNm * this.angularVelocity;
    let electricKw = (mechPowerWatts * this.GEARBOX_EFFICIENCY * this.GEN_EFFICIENCY) / 1000.0;

    if (this.brakeActive || effectiveWind < this.CUT_IN_WIND || effectiveWind > this.CUT_OUT_WIND) {
      electricKw = 0.0;
    }
    // Cap at rated electrical capacity or dispatched curtailment limit
    const dispatchedMaxKw = this.RATED_POWER_KW * (this.curtailmentLimitPct / 100.0);
    electricKw = Math.min(dispatchedMaxKw, Math.max(0.0, electricKw));

    this.powerKw = electricKw;
    this.powerMw = electricKw / 1000.0;
    this.generatorRpm = this.rotorRpm * this.GEARBOX_RATIO;
    this.aeroTorqueKnm = aeroTorqueNm / 1000.0;
    this.tipSpeedKmh = this.angularVelocity * this.ROTOR_RADIUS * 3.6;

    // Aerodynamic Thrust on Tower Top: T = 0.5 * rho * A * v^2 * Ct
    const ct = 4.0 * (1.0 - Math.sqrt(Math.max(0.0, 1.0 - this.cp)));
    const thrustN = 0.5 * this.AIR_DENSITY * this.SWEPT_AREA * Math.pow(vNormal, 2) * Math.min(0.9, Math.max(0.1, ct));
    this.thrustKn = thrustN / 1000.0;

    // Tower top deflection based on steel cantilever bending stiffness
    this.towerDeflectionM = Math.min(1.2, (this.thrustKn / 450.0) * 0.42);

    // Generator Operating Temperature Model
    const targetTemp = 42.0 + (this.powerKw / this.RATED_POWER_KW) * 36.0;
    this.generatorTempC += (targetTemp - this.generatorTempC) * 0.05 * dt;

    // Mechanical Vibration Model
    const baseVibe = 0.4 + (this.rotorRpm / this.RATED_RPM) * 0.7;
    const unbalanceFactor = Math.abs(yawErrorDeg) > 10 ? 0.6 : 0.0;
    this.vibrationMms = baseVibe + unbalanceFactor + (Math.random() - 0.5) * 0.08;

    // Accumulate Generated Energy & CO2 Avoided
    const energyIncrementMwh = (this.powerMw * dt) / 3600.0;
    this.cumulativeEnergyMwh += energyIncrementMwh;
    this.co2OffsetTons += energyIncrementMwh * 0.71;

    // Dynamic Wind Farm Fleet Telemetry (8 SG 5.0-145 Turbines along mountain ridge)
    let totalFarmKw = 0;
    this.windFarmData.forEach((wtg, i) => {
      const localWake = wtg.wakeDeficit;
      let localKw = 0;
      if (this.operatingMode === 'brake') {
        wtg.status = 'STOPPED';
        wtg.powerMw = 0.0;
        wtg.rpm = 0.0;
        wtg.pitchDeg = 90.0;
      } else if (this.operatingMode === 'feather' || effectiveWind > this.CUT_OUT_WIND) {
        wtg.status = 'FEATHERED';
        wtg.powerMw = 0.0;
        wtg.rpm = 0.8;
        wtg.pitchDeg = 90.0;
      } else if (effectiveWind < this.CUT_IN_WIND) {
        wtg.status = 'STANDBY';
        wtg.powerMw = 0.0;
        wtg.rpm = 1.2;
        wtg.pitchDeg = 15.0;
      } else {
        wtg.status = this.curtailmentLimitPct < 95.0 ? 'CURTAILED' : 'RUNNING';
        const rawLocalKw = (electricKw * localWake) * (0.97 + (i % 3) * 0.02);
        localKw = Math.min(dispatchedMaxKw, Math.max(0, rawLocalKw));
        wtg.powerMw = +(localKw / 1000.0).toFixed(2);
        wtg.rpm = +(this.rotorRpm * (0.98 + (i % 3) * 0.015)).toFixed(1);
        wtg.pitchDeg = +this.bladePitch.toFixed(1);
        wtg.tempC = +(62.0 + (wtg.powerMw / 5.0) * 12.0 + (i % 2) * 1.5).toFixed(1);
      }
      totalFarmKw += localKw;
    });

    this.totalFarmPowerMw = +(totalFarmKw / 1000.0).toFixed(2);
    this.farmDailyEnergyMwh += (this.totalFarmPowerMw * dt) / 3600.0;
    this.farmCapacityFactorPct = +((this.totalFarmPowerMw / this.farmRatedPowerMw) * 100).toFixed(1);
  }

  /**
   * Generates sample points for theoretical vs actual power curve
   */
  getTheoreticalPowerCurveData() {
    const windSpeeds = [];
    const theoreticalPowers = [];

    for (let v = 0; v <= 30; v += 0.5) {
      windSpeeds.push(v);
      if (v < this.CUT_IN_WIND || v > this.CUT_OUT_WIND) {
        theoreticalPowers.push(0);
      } else if (v >= this.RATED_WIND) {
        theoreticalPowers.push(this.RATED_POWER_KW / 1000.0); // 5.0 MW flat rated plateau
      } else {
        // Region II: cubic ramp P ~ 0.5 * rho * A * v^3 * Cp_max
        const pWatts = 0.5 * this.AIR_DENSITY * this.SWEPT_AREA * Math.pow(v, 3) * 0.485 * this.GEARBOX_EFFICIENCY * this.GEN_EFFICIENCY;
        theoreticalPowers.push(Math.min(this.RATED_POWER_KW / 1000.0, pWatts / 1e6));
      }
    }

    return { windSpeeds, theoreticalPowers };
  }
}

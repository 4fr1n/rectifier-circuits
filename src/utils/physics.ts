import { CircuitParameters, CalculatedMetrics, RectifierType } from '../types/lab';

/**
 * Calculates theoretical and simulated electrical values for both
 * uncontrolled diode rectifiers and controlled thyristor (SCR) rectifiers.
 */
export function calculateCircuitMetrics(params: CircuitParameters): CalculatedMetrics {
  const {
    category,
    type,
    amplitude,
    frequency,
    diodeDrop,
    loadResistance,
    filterCapacitor,
    firingAngle,
    loadType,
    freewheelingDiode,
  } = params;

  const Vm = amplitude;
  const vrmsIn = Vm / Math.SQRT2;
  const alphaRad = (firingAngle * Math.PI) / 180;
  const RL = Math.max(1, loadResistance);

  let vPeakOut = 0;
  let piv = 0;
  let fundamentalRippleFreq = frequency;
  let vdc = 0;
  let vrmsOut = 0;
  let conductionAngleDeg = 0;

  if (category === 'uncontrolled') {
    // UNCONTROLLED DIODE RECTIFIERS
    if (type === 'half-wave') {
      vPeakOut = Math.max(0, Vm - diodeDrop);
      piv = Vm;
      fundamentalRippleFreq = frequency;
      conductionAngleDeg = 180;

      if (filterCapacitor === 0) {
        vdc = vPeakOut / Math.PI;
        vrmsOut = vPeakOut / 2;
      } else {
        const C_F = filterCapacitor * 1e-6;
        const tau = RL * C_F;
        const T = 1 / frequency;
        const vr_pp = vPeakOut * (1 - Math.exp(-T / tau));
        vdc = Math.max(0, vPeakOut - vr_pp / 2);
        const vr_rms = vr_pp / (2 * Math.sqrt(3));
        vrmsOut = Math.sqrt(Math.pow(vdc, 2) + Math.pow(vr_rms, 2));
      }
    } else if (type === 'full-wave-ct') {
      vPeakOut = Math.max(0, Vm - diodeDrop);
      piv = 2 * Vm;
      fundamentalRippleFreq = 2 * frequency;
      conductionAngleDeg = 180;

      if (filterCapacitor === 0) {
        vdc = (2 * vPeakOut) / Math.PI;
        vrmsOut = vPeakOut / Math.SQRT2;
      } else {
        const C_F = filterCapacitor * 1e-6;
        const tau = RL * C_F;
        const T = 1 / (2 * frequency);
        const vr_pp = vPeakOut * (1 - Math.exp(-T / tau));
        vdc = Math.max(0, vPeakOut - vr_pp / 2);
        const vr_rms = vr_pp / (2 * Math.sqrt(3));
        vrmsOut = Math.sqrt(Math.pow(vdc, 2) + Math.pow(vr_rms, 2));
      }
    } else {
      // Full-Wave Bridge
      vPeakOut = Math.max(0, Vm - 2 * diodeDrop);
      piv = Vm;
      fundamentalRippleFreq = 2 * frequency;
      conductionAngleDeg = 180;

      if (filterCapacitor === 0) {
        vdc = (2 * vPeakOut) / Math.PI;
        vrmsOut = vPeakOut / Math.SQRT2;
      } else {
        const C_F = filterCapacitor * 1e-6;
        const tau = RL * C_F;
        const T = 1 / (2 * frequency);
        const vr_pp = vPeakOut * (1 - Math.exp(-T / tau));
        vdc = Math.max(0, vPeakOut - vr_pp / 2);
        const vr_rms = vr_pp / (2 * Math.sqrt(3));
        vrmsOut = Math.sqrt(Math.pow(vdc, 2) + Math.pow(vr_rms, 2));
      }
    }
  } else {
    // CONTROLLED THYRISTOR (SCR) RECTIFIERS
    const drop = diodeDrop; // SCR forward drop ~ 1.0 - 1.4V or simplified Vd
    vPeakOut = Math.max(0, Vm - drop);

    if (type === 'controlled-half-wave') {
      fundamentalRippleFreq = frequency;
      piv = Vm;

      if (loadType === 'R' || freewheelingDiode) {
        // Conduction from alpha to pi
        conductionAngleDeg = Math.max(0, 180 - firingAngle);
        vdc = (vPeakOut / (2 * Math.PI)) * (1 + Math.cos(alphaRad));
        const term = Math.PI - alphaRad + 0.5 * Math.sin(2 * alphaRad);
        vrmsOut = (vPeakOut / 2) * Math.sqrt(Math.max(0, term / Math.PI));
      } else {
        // RL Load without freewheeling diode: conducts past pi up to extinction angle beta
        const phi = Math.atan((2 * Math.PI * frequency * (params.loadInductance * 1e-3)) / RL);
        const betaRad = Math.min(2 * Math.PI, Math.PI + phi * 0.85);
        conductionAngleDeg = Math.max(0, ((betaRad - alphaRad) * 180) / Math.PI);
        vdc = (vPeakOut / (2 * Math.PI)) * (Math.cos(alphaRad) - Math.cos(betaRad));
        const term = betaRad - alphaRad + 0.5 * (Math.sin(2 * alphaRad) - Math.sin(2 * betaRad));
        vrmsOut = (vPeakOut / 2) * Math.sqrt(Math.max(0, term / Math.PI));
      }
    } else if (type === 'controlled-semi-converter') {
      // Semi-converter (Half-Controlled Bridge: 2 SCRs + 2 Diodes)
      // Output voltage is always non-negative: Vdc = (Vm / pi) * (1 + cos(alpha))
      fundamentalRippleFreq = 2 * frequency;
      piv = Vm;
      conductionAngleDeg = Math.max(0, 180 - firingAngle);
      vdc = (vPeakOut / Math.PI) * (1 + Math.cos(alphaRad));
      const term = Math.PI - alphaRad + 0.5 * Math.sin(2 * alphaRad);
      vrmsOut = (vPeakOut / Math.SQRT2) * Math.sqrt(Math.max(0, term / Math.PI));
    } else {
      // Fully-Controlled Bridge Converter (4 SCRs)
      fundamentalRippleFreq = 2 * frequency;
      piv = Vm;

      if (loadType === 'R') {
        // Resistive Load: current cannot be negative, cuts off at pi
        conductionAngleDeg = Math.max(0, 180 - firingAngle);
        vdc = (vPeakOut / Math.PI) * (1 + Math.cos(alphaRad));
        const term = Math.PI - alphaRad + 0.5 * Math.sin(2 * alphaRad);
        vrmsOut = (vPeakOut / Math.SQRT2) * Math.sqrt(Math.max(0, term / Math.PI));
      } else {
        // RL Load (Continuous conduction mode)
        // Vdc = (2 * Vm / pi) * cos(alpha)
        conductionAngleDeg = 180;
        vdc = ((2 * vPeakOut) / Math.PI) * Math.cos(alphaRad);
        vrmsOut = vPeakOut / Math.SQRT2;
      }
    }
  }

  // Electrical metrics
  const vacRipple = Math.sqrt(Math.max(0, Math.pow(vrmsOut, 2) - Math.pow(vdc, 2)));
  const rippleFactor = vdc !== 0 ? Math.abs(vacRipple / vdc) : 0;
  const idc = (vdc / RL) * 1000; // mA
  const irms = (vrmsOut / RL) * 1000; // mA
  const pdc = (vdc * idc) / 1000; // Watts
  const pac = (vrmsOut * irms) / 1000; // Watts
  const efficiency = pac > 0 ? Math.min(100, Math.max(0, (pdc / pac) * 100)) : 0;
  const formFactor = vdc !== 0 ? Math.abs(vrmsOut / vdc) : 0;

  return {
    vm: Vm,
    vrmsIn,
    vPeakOut,
    vdc,
    vrmsOut,
    vacRipple,
    rippleFactor,
    efficiency,
    piv,
    idc,
    irms,
    pdc,
    pac,
    formFactor,
    fundamentalRippleFreq,
    conductionAngle: conductionAngleDeg,
  };
}

/**
 * Computes instantaneous voltages and currents for real-time oscilloscope display.
 */
export function getInstantaneousWaveforms(
  t: number,
  params: CircuitParameters
): {
  vin: number;
  vout: number;
  iout: number;
  vt: number; // Thyristor / Diode switch voltage
  gate: number; // Gate trigger pulse
} {
  const {
    category,
    type,
    amplitude,
    frequency,
    diodeDrop,
    loadResistance,
    filterCapacitor,
    firingAngle,
    loadType,
    freewheelingDiode,
  } = params;

  const omega = 2 * Math.PI * frequency;
  const period = 1 / frequency;
  const tMod = ((t % period) + period) % period; // Time within current cycle [0, T]
  const theta = (tMod / period) * 2 * Math.PI; // Phase angle [0, 2*pi]

  const vin = amplitude * Math.sin(theta);
  const alphaRad = (firingAngle * Math.PI) / 180;
  const RL = Math.max(1, loadResistance);

  let vout = 0;
  let vt = 0;
  let gate = 0;

  // Gate pulse duration: short 10-degree pulse at alpha and (for full wave) pi + alpha
  const pulseWidth = (12 * Math.PI) / 180;
  const isGate1 = theta >= alphaRad && theta <= alphaRad + pulseWidth;
  const isGate2 = theta >= Math.PI + alphaRad && theta <= Math.PI + alphaRad + pulseWidth;

  if (category === 'controlled') {
    gate = (isGate1 || (type !== 'controlled-half-wave' && isGate2)) ? 5 : 0;
  }

  if (category === 'uncontrolled') {
    // UNCONTROLLED DIODE RECTIFIERS
    if (type === 'half-wave') {
      const raw = Math.max(0, vin - diodeDrop);
      if (filterCapacitor === 0) {
        vout = raw;
      } else {
        const C_F = filterCapacitor * 1e-6;
        const tau = RL * C_F;
        const tPeak = period / 4;
        const vPeak = Math.max(0, amplitude - diodeDrop);
        if (tMod <= tPeak) {
          vout = Math.max(0, amplitude * Math.sin(omega * tMod) - diodeDrop);
        } else {
          const tDis = tMod - tPeak;
          const dis = vPeak * Math.exp(-tDis / tau);
          const inc = Math.max(0, amplitude * Math.sin(omega * tMod) - diodeDrop);
          vout = Math.max(dis, inc);
        }
      }
      vt = vin - vout;
    } else {
      // Full-Wave CT or Bridge
      const isBridge = type === 'full-wave-bridge';
      const drop = isBridge ? 2 * diodeDrop : diodeDrop;
      const absVin = Math.abs(vin);
      const raw = Math.max(0, absVin - drop);

      if (filterCapacitor === 0) {
        vout = raw;
      } else {
        const C_F = filterCapacitor * 1e-6;
        const tau = RL * C_F;
        const halfT = period / 2;
        const tInHalf = tMod % halfT;
        const tPeak = halfT / 2;
        const vPeak = Math.max(0, amplitude - drop);

        if (tInHalf <= tPeak) {
          vout = Math.max(0, amplitude * Math.sin(Math.PI * (tInHalf / halfT)) - drop);
        } else {
          const tDis = tInHalf - tPeak;
          const dis = vPeak * Math.exp(-tDis / tau);
          const inc = Math.max(0, amplitude * Math.sin(Math.PI * (tInHalf / halfT)) - drop);
          vout = Math.max(dis, inc);
        }
      }
      vt = vin > 0 ? (vin - vout) : (vin + vout);
    }
  } else {
    // CONTROLLED THYRISTOR RECTIFIERS
    const drop = diodeDrop;

    if (type === 'controlled-half-wave') {
      if (loadType === 'R' || freewheelingDiode) {
        // Conduction strictly from alpha to pi
        if (theta >= alphaRad && theta <= Math.PI) {
          vout = Math.max(0, vin - drop);
          vt = drop;
        } else {
          vout = 0;
          vt = vin; // Forward blocking [0, alpha] or reverse blocking [pi, 2*pi]
        }
      } else {
        // RL Load: conducts past pi up to extinction angle beta
        const phi = Math.atan((2 * Math.PI * frequency * (params.loadInductance * 1e-3)) / RL);
        const betaRad = Math.min(2 * Math.PI, Math.PI + phi * 0.85);

        if (theta >= alphaRad && theta <= betaRad) {
          vout = vin - drop; // can go negative!
          vt = drop;
        } else {
          vout = 0;
          vt = vin;
        }
      }
    } else if (type === 'controlled-semi-converter') {
      // Semi-Converter (Half-Controlled Bridge)
      // Positive half: alpha to pi
      // Negative half: pi + alpha to 2*pi
      if (theta >= alphaRad && theta <= Math.PI) {
        vout = Math.max(0, vin - 2 * drop);
        vt = drop;
      } else if (theta >= Math.PI + alphaRad && theta <= 2 * Math.PI) {
        vout = Math.max(0, -vin - 2 * drop);
        vt = drop;
      } else {
        // Freewheeling interval: vout = 0
        vout = 0;
        vt = vin;
      }
    } else {
      // Fully-Controlled Bridge Converter (4 SCRs)
      if (loadType === 'R') {
        // R-Load: conducts in positive half from alpha to pi, in negative half from pi+alpha to 2*pi
        if (theta >= alphaRad && theta <= Math.PI) {
          vout = Math.max(0, vin - 2 * drop);
          vt = 2 * drop;
        } else if (theta >= Math.PI + alphaRad && theta <= 2 * Math.PI) {
          vout = Math.max(0, -vin - 2 * drop);
          vt = 2 * drop;
        } else {
          vout = 0;
          vt = vin;
        }
      } else {
        // Continuous RL Load:
        // T1, T2 conduct from alpha to pi + alpha
        // T3, T4 conduct from pi + alpha to 2*pi + alpha
        if (theta >= alphaRad && theta <= Math.PI + alphaRad) {
          vout = vin - 2 * drop;
          vt = 2 * drop;
        } else {
          vout = -vin - 2 * drop;
          vt = 2 * drop;
        }
      }
    }
  }

  const iout = vout / RL; // Amperes

  return { vin, vout, iout, vt, gate };
}

export function formatRectifierName(type: RectifierType): string {
  switch (type) {
    case 'half-wave':
      return 'Half-Wave Diode Rectifier';
    case 'full-wave-ct':
      return 'Center-Tapped Diode Rectifier';
    case 'full-wave-bridge':
      return 'Full-Wave Bridge Diode Rectifier';
    case 'controlled-half-wave':
      return 'Single-Phase Half-Wave Controlled (SCR)';
    case 'controlled-semi-converter':
      return 'Single-Phase Semi-Converter (Half-Controlled)';
    case 'controlled-full-converter':
      return 'Single-Phase Fully-Controlled Converter';
  }
}

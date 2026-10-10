export type RectifierCategory = 'uncontrolled' | 'controlled';

export type RectifierType =
  | 'half-wave'
  | 'full-wave-ct'
  | 'full-wave-bridge'
  | 'controlled-half-wave'
  | 'controlled-semi-converter'
  | 'controlled-full-converter';

export type LoadType = 'R' | 'RL';

export interface CircuitParameters {
  category: RectifierCategory;
  type: RectifierType;
  amplitude: number; // Peak input voltage Vm (Volts), e.g. 12V - 230V peak
  frequency: number; // Hz, e.g. 50Hz
  diodeDrop: number; // Vd, e.g. 0.7V for Silicon, 0 for Ideal
  loadResistance: number; // Ohms, e.g. 10 Ohms to 2000 Ohms
  filterCapacitor: number; // Microfarads (uF), 0 if none
  firingAngle: number; // Firing angle alpha in degrees (0° to 180°)
  loadType: LoadType; // R or RL
  loadInductance: number; // mH
  freewheelingDiode: boolean; // Freewheeling diode connected
  timeDiv: number; // ms/div
  voltsDivCh1: number; // V/div
  voltsDivCh2: number; // V/div
  scopeTrace: 'vout' | 'iout' | 'vt' | 'gate' | 'all'; // Trace to display in Oscilloscope
}

export interface CalculatedMetrics {
  vm: number;
  vrmsIn: number;
  vPeakOut: number;
  vdc: number;
  vrmsOut: number;
  vacRipple: number;
  rippleFactor: number;
  efficiency: number;
  piv: number;
  idc: number;
  irms: number;
  pdc: number;
  pac: number;
  formFactor: number;
  fundamentalRippleFreq: number;
  conductionAngle: number; // in degrees
}

export interface ObservationRecord {
  id: string;
  timestamp: string;
  rectifierType: RectifierType;
  firingAngle: number;
  loadResistance: number;
  loadType: LoadType;
  vm: number;
  frequency: number;
  filterCapacitor: number;
  vdcTheoretical: number;
  vdcMeasured: number;
  vrmsMeasured: number;
  rippleFactorTheoretical: number;
  rippleFactorMeasured: number;
  efficiencyMeasured: number;
  errorPercent: number;
}

import React, { useState } from 'react';
import {
  CircuitParameters,
  CalculatedMetrics,
  ObservationRecord,
  RectifierType,
  RectifierCategory,
  LoadType,
} from '../types/lab';
import { calculateCircuitMetrics, formatRectifierName } from '../utils/physics';
import { CircuitSchematic } from './CircuitSchematic';
import { Oscilloscope } from './Oscilloscope';
import { RealTimeAnalyticsPlot } from './RealTimeAnalyticsPlot';
import {
  Gauge,
  Check,
  PlusCircle,
  RotateCcw,
  Sliders,
  Zap,
  Activity,
  Flame,
  Radio,
} from 'lucide-react';

interface SimulationWorkbenchProps {
  params: CircuitParameters;
  onParamsChange: (newParams: Partial<CircuitParameters>) => void;
  onRecordObservation: (record: ObservationRecord) => void;
  onResetParams: () => void;
}

export const SimulationWorkbench: React.FC<SimulationWorkbenchProps> = ({
  params,
  onParamsChange,
  onRecordObservation,
  onResetParams,
}) => {
  const [justRecorded, setJustRecorded] = useState<boolean>(false);
  const metrics: CalculatedMetrics = calculateCircuitMetrics(params);

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
    loadInductance,
    freewheelingDiode,
  } = params;

  const handleRecord = () => {
    let theoreticalVdc = 0;
    const Vm = amplitude;
    const aRad = (firingAngle * Math.PI) / 180;

    if (category === 'uncontrolled') {
      if (type === 'half-wave') {
        theoreticalVdc = (Vm - diodeDrop) / Math.PI;
      } else {
        theoreticalVdc = (2 * (Vm - (type === 'full-wave-bridge' ? 2 * diodeDrop : diodeDrop))) / Math.PI;
      }
    } else {
      if (type === 'controlled-half-wave') {
        theoreticalVdc = (Vm / (2 * Math.PI)) * (1 + Math.cos(aRad));
      } else if (type === 'controlled-semi-converter') {
        theoreticalVdc = (Vm / Math.PI) * (1 + Math.cos(aRad));
      } else {
        theoreticalVdc = loadType === 'R'
          ? (Vm / Math.PI) * (1 + Math.cos(aRad))
          : ((2 * Vm) / Math.PI) * Math.cos(aRad);
      }
    }

    const err =
      Math.abs(theoreticalVdc) > 0.01
        ? Math.abs((metrics.vdc - theoreticalVdc) / theoreticalVdc) * 100
        : 0;

    const newRecord: ObservationRecord = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString(),
      rectifierType: type,
      firingAngle: category === 'controlled' ? firingAngle : 0,
      loadResistance,
      loadType,
      vm: amplitude,
      frequency,
      filterCapacitor,
      vdcTheoretical: theoreticalVdc,
      vdcMeasured: metrics.vdc,
      vrmsMeasured: metrics.vrmsOut,
      rippleFactorTheoretical: metrics.rippleFactor,
      rippleFactorMeasured: metrics.rippleFactor,
      efficiencyMeasured: metrics.efficiency,
      errorPercent: Math.min(100, err),
    };

    onRecordObservation(newRecord);
    setJustRecorded(true);
    setTimeout(() => setJustRecorded(false), 1600);
  };

  const firingAnglePresets = [0, 30, 45, 60, 90, 120, 150];

  return (
    <div className="flex flex-col gap-6">
      {/* Rectifier Category Selector Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Rectifier Simulation Workbench
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate uncontrolled diode circuits & controlled thyristor converters with variable firing angle α and load resistance
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetParams}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Values</span>
            </button>
            <button
              onClick={handleRecord}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {justRecorded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Logged!</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Record Observation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Primary Classification: Controlled vs Uncontrolled */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Technology:
            </span>
            <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200">
              <button
                onClick={() =>
                  onParamsChange({
                    category: 'controlled',
                    type: 'controlled-full-converter',
                  })
                }
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                  category === 'controlled'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Controlled (Thyristor / SCR)</span>
              </button>
              <button
                onClick={() =>
                  onParamsChange({
                    category: 'uncontrolled',
                    type: 'full-wave-bridge',
                  })
                }
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                  category === 'uncontrolled'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Uncontrolled (Diode)</span>
              </button>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-500">
            Selected: <strong className="text-slate-900">{formatRectifierName(type)}</strong>
          </div>
        </div>

        {/* Topology Selector Buttons */}
        <div className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {category === 'controlled' ? (
              <>
                {[
                  {
                    id: 'controlled-half-wave' as RectifierType,
                    title: 'Half-Wave Controlled',
                    subtitle: 'Single SCR · Vdc = (Vm/2π)(1+cosα)',
                  },
                  {
                    id: 'controlled-semi-converter' as RectifierType,
                    title: 'Semi-Converter (Half-Controlled)',
                    subtitle: '2 SCRs + 2 Diodes · Vdc = (Vm/π)(1+cosα)',
                  },
                  {
                    id: 'controlled-full-converter' as RectifierType,
                    title: 'Full-Converter (Fully-Controlled)',
                    subtitle: '4 SCRs Bridge · Vdc = (2Vm/π)cosα',
                  },
                ].map((top) => (
                  <button
                    key={top.id}
                    onClick={() => onParamsChange({ type: top.id })}
                    className={`p-3 text-left rounded-xl border transition-all ${
                      type === top.id
                        ? 'border-purple-600 bg-purple-50/70 shadow-sm ring-1 ring-purple-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-xs sm:text-sm font-bold ${type === top.id ? 'text-purple-900' : 'text-slate-900'}`}>
                        {top.title}
                      </span>
                      {type === top.id && (
                        <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">{top.subtitle}</p>
                  </button>
                ))}
              </>
            ) : (
              <>
                {[
                  {
                    id: 'half-wave' as RectifierType,
                    title: 'Half-Wave Rectifier',
                    subtitle: '1 Diode · Vdc = Vm/π ≈ 0.318 Vm',
                  },
                  {
                    id: 'full-wave-ct' as RectifierType,
                    title: 'Full-Wave Center-Tapped',
                    subtitle: '2 Diodes · Vdc = 2Vm/π ≈ 0.636 Vm',
                  },
                  {
                    id: 'full-wave-bridge' as RectifierType,
                    title: 'Full-Wave Bridge Rectifier',
                    subtitle: '4 Diodes Bridge · Vdc = 2Vm/π',
                  },
                ].map((top) => (
                  <button
                    key={top.id}
                    onClick={() => onParamsChange({ type: top.id })}
                    className={`p-3 text-left rounded-xl border transition-all ${
                      type === top.id
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-xs sm:text-sm font-bold ${type === top.id ? 'text-indigo-900' : 'text-slate-900'}`}>
                        {top.title}
                      </span>
                      {type === top.id && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">{top.subtitle}</p>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Control Knobs and Digital Multimeter Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Parametric Sliders (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sliders className="w-4 h-4 text-purple-600" />
              <h3 className="font-semibold text-sm text-slate-900">
                Converter Parameters
              </h3>
            </div>

            <div className="space-y-4 pt-3 text-xs">
              {/* FIRING ANGLE SLIDER (Visible when controlled rectifier is active) */}
              {category === 'controlled' && (
                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-900 font-bold flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-purple-600" />
                      Firing Angle (α)
                    </span>
                    <span className="font-mono font-bold text-sm text-purple-700 bg-white border border-purple-300 px-2 py-0.5 rounded shadow-xs">
                      {firingAngle}° ({((firingAngle * Math.PI) / 180).toFixed(2)} rad)
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="180"
                    step="1"
                    value={firingAngle}
                    onChange={(e) => onParamsChange({ firingAngle: parseInt(e.target.value) })}
                    className="w-full accent-purple-600"
                  />

                  {/* Preset quick buttons */}
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    <span className="text-[10px] text-purple-700 mr-1 font-semibold">Presets:</span>
                    {firingAnglePresets.map((deg) => (
                      <button
                        key={deg}
                        onClick={() => onParamsChange({ firingAngle: deg })}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                          firingAngle === deg
                            ? 'bg-purple-600 text-white font-bold'
                            : 'bg-white text-purple-900 border border-purple-200 hover:bg-purple-100'
                        }`}
                      >
                        {deg}°
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* LOAD RESISTANCE SLIDER (Requested by user) */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-800 font-bold">Load Resistance (RL)</span>
                  <span className="font-mono font-bold text-sm text-indigo-700 bg-white border border-slate-300 px-2 py-0.5 rounded shadow-xs">
                    {loadResistance >= 1000
                      ? `${(loadResistance / 1000).toFixed(2)} kΩ`
                      : `${loadResistance} Ω`}
                  </span>
                </div>

                <input
                  type="range"
                  min="10"
                  max="2000"
                  step="10"
                  value={loadResistance}
                  onChange={(e) => onParamsChange({ loadResistance: parseInt(e.target.value) })}
                  className="w-full accent-indigo-600"
                />

                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>10 Ω</span>
                  <span>500 Ω</span>
                  <span>1000 Ω</span>
                  <span>2000 Ω</span>
                </div>
              </div>

              {/* LOAD TYPE (R vs RL) */}
              {category === 'controlled' && (
                <div>
                  <label className="text-slate-700 font-medium block mb-1.5">
                    Load Nature & Inductance
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                      onClick={() => onParamsChange({ loadType: 'R' })}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                        loadType === 'R'
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Resistive (R Load)
                    </button>
                    <button
                      onClick={() => onParamsChange({ loadType: 'RL' })}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                        loadType === 'RL'
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Inductive (R-L Load)
                    </button>
                  </div>

                  {loadType === 'RL' && (
                    <div className="space-y-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600">Load Inductance (L)</span>
                        <span className="font-mono font-semibold text-slate-800">
                          {loadInductance} mH
                        </span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="200"
                        step="10"
                        value={loadInductance}
                        onChange={(e) => onParamsChange({ loadInductance: parseInt(e.target.value) })}
                        className="w-full accent-indigo-600"
                      />
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 mt-1">
                        <input
                          type="checkbox"
                          checked={freewheelingDiode}
                          onChange={(e) => onParamsChange({ freewheelingDiode: e.target.checked })}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Enable Freewheeling Diode (FWD)</span>
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* AC Input Amplitude & Frequency */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-700 font-medium">Input Vm</span>
                    <span className="font-mono font-bold text-slate-900">{amplitude} V</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    step="1"
                    value={amplitude}
                    onChange={(e) => onParamsChange({ amplitude: parseFloat(e.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-700 font-medium">Freq (f)</span>
                    <span className="font-mono font-bold text-slate-900">{frequency} Hz</span>
                  </div>
                  <input
                    type="range"
                    min="25"
                    max="100"
                    step="5"
                    value={frequency}
                    onChange={(e) => onParamsChange({ frequency: parseInt(e.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>

              {/* Capacitor Filter (if uncontrolled) */}
              {category === 'uncontrolled' && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-700 font-medium">Shunt Capacitor (C)</span>
                    <span className="font-mono font-bold text-indigo-700">
                      {filterCapacitor === 0 ? 'No Filter' : `${filterCapacitor} µF`}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[0, 47, 100, 470].map((cap) => (
                      <button
                        key={cap}
                        onClick={() => onParamsChange({ filterCapacitor: cap })}
                        className={`py-1 rounded-lg font-mono text-[11px] border transition-colors ${
                          filterCapacitor === cap
                            ? 'bg-indigo-600 border-indigo-600 text-white font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {cap === 0 ? 'None' : `${cap}µF`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[11px] text-slate-600">
            <strong className="text-slate-800">Controlled Firing Fact:</strong> In a full-converter with continuous inductive load, triggering at α &gt; 90° causes negative average DC voltage (Vdc &lt; 0), converting DC power back into the AC grid (Inversion Mode).
          </div>
        </div>

        {/* Right Column: Digital Multimeter & Live Telemetry (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 shadow-md p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-emerald-400" />
                <h3 className="font-mono font-semibold text-sm tracking-wider text-slate-100">
                  REAL-TIME TELEMETRY & MULTIMETER
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded">
                TRUE RMS SAMPLING
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4">
              {/* Vdc */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <span className="text-[11px] font-mono text-slate-400 block mb-1">
                  DC VOLTAGE (Vdc)
                </span>
                <div
                  className={`text-2xl font-bold font-mono ${
                    metrics.vdc < 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {metrics.vdc.toFixed(2)} <span className="text-xs text-slate-400">V</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {metrics.vdc < 0 ? 'Inversion Quadrant' : 'Rectification Mode'}
                </span>
              </div>

              {/* Vrms */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <span className="text-[11px] font-mono text-slate-400 block mb-1">
                  RMS VOLTAGE (Vrms)
                </span>
                <div className="text-2xl font-bold font-mono text-sky-400">
                  {metrics.vrmsOut.toFixed(2)} <span className="text-xs text-slate-400">V</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Effective AC+DC RMS</span>
              </div>

              {/* Ripple Factor */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <span className="text-[11px] font-mono text-slate-400 block mb-1">
                  RIPPLE FACTOR (γ)
                </span>
                <div className="text-2xl font-bold font-mono text-pink-400">
                  {metrics.rippleFactor.toFixed(3)}
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  Vac_rms / Vdc
                </span>
              </div>

              {/* DC Current Idc */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <span className="text-[11px] font-mono text-slate-400 block mb-1">
                  LOAD CURRENT (Idc)
                </span>
                <div className="text-2xl font-bold font-mono text-teal-400">
                  {metrics.idc.toFixed(1)} <span className="text-xs text-slate-400">mA</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Vdc / RL</span>
              </div>

              {/* DC Power Pdc */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <span className="text-[11px] font-mono text-slate-400 block mb-1">
                  OUTPUT POWER (Pdc)
                </span>
                <div className="text-2xl font-bold font-mono text-amber-400">
                  {metrics.pdc.toFixed(2)} <span className="text-xs text-slate-400">W</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Delivered DC</span>
              </div>

              {/* Conduction Angle */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <span className="text-[11px] font-mono text-slate-400 block mb-1">
                  CONDUCTION ANGLE (γ)
                </span>
                <div className="text-2xl font-bold font-mono text-purple-400">
                  {metrics.conductionAngle.toFixed(0)}°
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Switch ON Duration</span>
              </div>
            </div>

            {/* Technical Sub-row */}
            <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-xs font-mono text-slate-400">
              <div>
                <span className="text-slate-500 text-[10px] block">PEAK INVERSE VOLTAGE</span>
                <span className="text-slate-200 font-semibold">{metrics.piv.toFixed(1)} V</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">RIPPLE FREQ</span>
                <span className="text-slate-200 font-semibold">{metrics.fundamentalRippleFreq} Hz</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">FORM FACTOR (FF)</span>
                <span className="text-slate-200 font-semibold">{metrics.formFactor.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Operating State: <strong className="text-slate-200">{category === 'controlled' ? `SCR Triggered at α = ${firingAngle}°` : 'Continuous Diode Conduction'}</strong></span>
            <span className="font-mono text-slate-500">RL = {loadResistance} Ω</span>
          </div>
        </div>
      </div>

      {/* Real-Time Waveform Oscilloscope & Analytical Transfer Curve */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7">
          <Oscilloscope params={params} onParamsChange={onParamsChange} />
        </div>

        <div className="xl:col-span-5 flex flex-col gap-6">
          <RealTimeAnalyticsPlot params={params} metrics={metrics} />
          <CircuitSchematic params={params} />
        </div>
      </div>
    </div>
  );
};

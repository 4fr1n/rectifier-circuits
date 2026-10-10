import React, { useRef, useEffect, useState } from 'react';
import { CircuitParameters } from '../types/lab';
import { getInstantaneousWaveforms } from '../utils/physics';
import { Play, Pause, Crosshair, Eye, Sparkles } from 'lucide-react';

interface OscilloscopeProps {
  params: CircuitParameters;
  onParamsChange?: (newParams: Partial<CircuitParameters>) => void;
}

export const Oscilloscope: React.FC<OscilloscopeProps> = ({ params, onParamsChange }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [showCursors, setShowCursors] = useState<boolean>(false);
  const [cursorV1, setCursorV1] = useState<number>(0.65);
  const [cursorV2, setCursorV2] = useState<number>(0.2);
  const animFrameRef = useRef<number | null>(null);
  const timeOffsetRef = useRef<number>(0);

  const {
    amplitude,
    frequency,
    firingAngle,
    category,
    scopeTrace,
    timeDiv,
    voltsDivCh1,
    voltsDivCh2,
  } = params;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTimestamp = performance.now();

    const render = (now: number) => {
      const dt = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      if (isRunning) {
        timeOffsetRef.current += dt;
      }

      const width = canvas.width;
      const height = canvas.height;

      // Dark CRT phosphor screen
      ctx.fillStyle = '#060d17';
      ctx.fillRect(0, 0, width, height);

      // Grid
      const numDivX = 10;
      const numDivY = 8;
      const divWidth = width / numDivX;
      const divHeight = height / numDivY;

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;

      for (let i = 0; i <= numDivX; i++) {
        ctx.beginPath();
        ctx.moveTo(i * divWidth, 0);
        ctx.lineTo(i * divWidth, height);
        ctx.stroke();

        if (i < numDivX) {
          for (let sub = 1; sub < 5; sub++) {
            const sx = i * divWidth + (sub * divWidth) / 5;
            ctx.beginPath();
            ctx.moveTo(sx, height / 2 - 3);
            ctx.lineTo(sx, height / 2 + 3);
            ctx.stroke();
          }
        }
      }

      for (let j = 0; j <= numDivY; j++) {
        ctx.beginPath();
        ctx.moveTo(0, j * divHeight);
        ctx.lineTo(width, j * divHeight);
        ctx.stroke();

        if (j < numDivY) {
          for (let sub = 1; sub < 5; sub++) {
            const sy = j * divHeight + (sub * divHeight) / 5;
            ctx.beginPath();
            ctx.moveTo(width / 2 - 3, sy);
            ctx.lineTo(width / 2 + 3, sy);
            ctx.stroke();
          }
        }
      }

      // Major Center Axes
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();

      const totalTimeSec = (numDivX * timeDiv) / 1000;
      const pixelsPerSec = width / totalTimeSec;
      const pixelsPerVoltCh1 = divHeight / voltsDivCh1;
      const pixelsPerVoltCh2 = divHeight / voltsDivCh2;
      const centerY = height / 2;

      // 1. Channel 1: Input AC Waveform (Yellow/Amber)
      ctx.save();
      ctx.strokeStyle = '#facc15';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 4;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const tRel = x / pixelsPerSec;
        const t = timeOffsetRef.current + tRel;
        const { vin } = getInstantaneousWaveforms(t, params);
        const y = centerY - vin * pixelsPerVoltCh1;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      // 2. Channel 2: Rectified Output Voltage v_o(t) (Cyan)
      if (scopeTrace === 'vout' || scopeTrace === 'all') {
        ctx.save();
        ctx.strokeStyle = '#06b6d4';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 6;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
          const tRel = x / pixelsPerSec;
          const t = timeOffsetRef.current + tRel;
          const { vout } = getInstantaneousWaveforms(t, params);
          const y = centerY - vout * pixelsPerVoltCh2;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      }

      // 3. Channel 3: Thyristor Voltage v_T(t) (Pink)
      if (scopeTrace === 'vt' || scopeTrace === 'all') {
        ctx.save();
        ctx.strokeStyle = '#ec4899';
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 4;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
          const tRel = x / pixelsPerSec;
          const t = timeOffsetRef.current + tRel;
          const { vt } = getInstantaneousWaveforms(t, params);
          const y = centerY - vt * pixelsPerVoltCh2;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      }

      // 4. Channel 4: Gate Trigger Pulses (Purple)
      if (category === 'controlled' && (scopeTrace === 'gate' || scopeTrace === 'all')) {
        ctx.save();
        ctx.strokeStyle = '#c084fc';
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 4;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
          const tRel = x / pixelsPerSec;
          const t = timeOffsetRef.current + tRel;
          const { gate } = getInstantaneousWaveforms(t, params);
          // Scale gate pulse: base line at height - 25
          const y = height - 20 - gate * 7;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      }

      // 5. Channel 5: Load Current i_o(t) (Emerald)
      if (scopeTrace === 'iout' || scopeTrace === 'all') {
        ctx.save();
        ctx.strokeStyle = '#34d399';
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 4;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
          const tRel = x / pixelsPerSec;
          const t = timeOffsetRef.current + tRel;
          const { iout } = getInstantaneousWaveforms(t, params);
          // Current scaled by load resistance
          const currentScaled = iout * Math.min(100, params.loadResistance);
          const y = centerY - currentScaled * (pixelsPerVoltCh2 * 0.7);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Cursors
      if (showCursors) {
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.5;

        const y1 = height * (1 - cursorV1);
        ctx.strokeStyle = '#ec4899';
        ctx.beginPath();
        ctx.moveTo(0, y1);
        ctx.lineTo(width, y1);
        ctx.stroke();
        ctx.fillStyle = '#ec4899';
        ctx.font = '10px monospace';
        ctx.fillText(`C1: ${((cursorV1 - 0.5) * numDivY * voltsDivCh2).toFixed(2)}V`, 12, y1 - 4);

        const y2 = height * (1 - cursorV2);
        ctx.strokeStyle = '#a855f7';
        ctx.beginPath();
        ctx.moveTo(0, y2);
        ctx.lineTo(width, y2);
        ctx.stroke();
        ctx.fillStyle = '#a855f7';
        ctx.fillText(`C2: ${((cursorV2 - 0.5) * numDivY * voltsDivCh2).toFixed(2)}V`, 12, y2 - 4);
        ctx.restore();
      }

      // Top Telemetry Header Box
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(8, 8, 280, 52);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(8, 8, 280, 52);

      ctx.font = '11px monospace';
      ctx.fillStyle = '#facc15';
      ctx.fillText(`CH1: ${voltsDivCh1} V/div (AC Source)`, 16, 25);
      ctx.fillStyle = '#06b6d4';
      ctx.fillText(`CH2: ${voltsDivCh2} V/div (Output Vo)`, 16, 42);

      if (category === 'controlled') {
        ctx.fillStyle = '#c084fc';
        ctx.fillText(`α = ${firingAngle}° Firing Delay`, 16, 56);
      }

      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`TB: ${timeDiv} ms/div | f = ${frequency} Hz`, width - 210, 25);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [
    isRunning,
    scopeTrace,
    showCursors,
    cursorV1,
    cursorV2,
    params,
    timeDiv,
    voltsDivCh1,
    voltsDivCh2,
    frequency,
    category,
    firingAngle,
  ]);

  const deltaV = Math.abs(cursorV1 - cursorV2) * 8 * voltsDivCh2;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-3">
      {/* Scope Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
          <span className="font-mono text-sm font-semibold tracking-wider text-slate-100">
            REAL-TIME WAVEFORM OSCILLOSCOPE
          </span>
          <span className="text-xs font-mono text-slate-400 border border-slate-700 px-2 py-0.5 rounded">
            50 MS/s
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isRunning
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-rose-600 hover:bg-rose-500 text-white'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? 'RUNNING' : 'STOPPED'}</span>
          </button>

          <button
            onClick={() => setShowCursors(!showCursors)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors border ${
              showCursors
                ? 'bg-purple-900/60 border-purple-500 text-purple-200'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Cursors {showCursors ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Screen Canvas */}
      <div className="relative w-full overflow-hidden rounded-lg border border-slate-700 bg-slate-950 flex justify-center shadow-inner">
        <canvas
          ref={canvasRef}
          width={700}
          height={340}
          className="w-full max-w-[700px] h-[330px] object-contain cursor-crosshair"
        />
      </div>

      {/* Active Cursors Readout if turned on */}
      {showCursors && (
        <div className="bg-slate-950 border border-purple-800/60 rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-4">
            <span className="text-pink-400">
              V1: {((cursorV1 - 0.5) * 8 * voltsDivCh2).toFixed(2)} V
            </span>
            <span className="text-purple-400">
              V2: {((cursorV2 - 0.5) * 8 * voltsDivCh2).toFixed(2)} V
            </span>
            <span className="text-emerald-300 font-semibold">
              ΔV: {deltaV.toFixed(2)} V
            </span>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-slate-400 text-xs">C1:</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={cursorV1}
              onChange={(e) => setCursorV1(parseFloat(e.target.value))}
              className="w-20 accent-pink-500"
            />
            <label className="text-slate-400 text-xs">C2:</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={cursorV2}
              onChange={(e) => setCursorV2(parseFloat(e.target.value))}
              className="w-20 accent-purple-500"
            />
          </div>
        </div>
      )}

      {/* Waveform Selector & Controls */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800 text-xs">
        {/* Trace Selector */}
        <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/60">
          <label className="text-slate-400 font-medium block mb-1.5">ACTIVE WAVEFORM</label>
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => onParamsChange?.({ scopeTrace: 'vout' })}
              className={`py-1 px-1.5 rounded text-[11px] font-semibold transition-colors ${
                scopeTrace === 'vout'
                  ? 'bg-cyan-400 text-slate-950'
                  : 'bg-slate-700/60 text-slate-300 hover:text-white'
              }`}
            >
              Vo (Output)
            </button>
            <button
              onClick={() => onParamsChange?.({ scopeTrace: 'iout' })}
              className={`py-1 px-1.5 rounded text-[11px] font-semibold transition-colors ${
                scopeTrace === 'iout'
                  ? 'bg-emerald-400 text-slate-950'
                  : 'bg-slate-700/60 text-slate-300 hover:text-white'
              }`}
            >
              Io (Current)
            </button>
            <button
              onClick={() => onParamsChange?.({ scopeTrace: 'vt' })}
              className={`py-1 px-1.5 rounded text-[11px] font-semibold transition-colors ${
                scopeTrace === 'vt'
                  ? 'bg-pink-400 text-slate-950'
                  : 'bg-slate-700/60 text-slate-300 hover:text-white'
              }`}
            >
              Vt (Switch)
            </button>
            <button
              onClick={() => onParamsChange?.({ scopeTrace: 'all' })}
              className={`py-1 px-1.5 rounded text-[11px] font-semibold transition-colors ${
                scopeTrace === 'all'
                  ? 'bg-indigo-400 text-slate-950'
                  : 'bg-slate-700/60 text-slate-300 hover:text-white'
              }`}
            >
              All Signals
            </button>
          </div>
        </div>

        {/* Time / Div */}
        <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/60">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-slate-400 font-medium">TIME / DIV</label>
            <span className="font-mono text-emerald-400 font-semibold">{timeDiv} ms</span>
          </div>
          <div className="flex gap-1">
            {[2, 5, 10, 20].map((val) => (
              <button
                key={val}
                onClick={() => onParamsChange?.({ timeDiv: val })}
                className={`flex-1 py-1 rounded font-mono text-[11px] transition-colors ${
                  timeDiv === val
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {val}m
              </button>
            ))}
          </div>
        </div>

        {/* CH1 Volts / Div */}
        <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/60">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-amber-400 font-medium">CH1 (Vin)</label>
            <span className="font-mono text-amber-300 font-semibold">{voltsDivCh1} V</span>
          </div>
          <div className="flex gap-1">
            {[2, 5, 10, 20].map((val) => (
              <button
                key={val}
                onClick={() => onParamsChange?.({ voltsDivCh1: val })}
                className={`flex-1 py-1 rounded font-mono text-[11px] transition-colors ${
                  voltsDivCh1 === val
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {val}V
              </button>
            ))}
          </div>
        </div>

        {/* CH2 Volts / Div */}
        <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/60">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-cyan-400 font-medium">CH2 (Vo)</label>
            <span className="font-mono text-cyan-300 font-semibold">{voltsDivCh2} V</span>
          </div>
          <div className="flex gap-1">
            {[2, 5, 10, 20].map((val) => (
              <button
                key={val}
                onClick={() => onParamsChange?.({ voltsDivCh2: val })}
                className={`flex-1 py-1 rounded font-mono text-[11px] transition-colors ${
                  voltsDivCh2 === val
                    ? 'bg-cyan-400 text-slate-950 font-bold'
                    : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {val}V
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

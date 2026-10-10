import React, { useState, useEffect } from 'react';
import { CircuitParameters } from '../types/lab';
import { Play, Pause, Zap, Info, Sliders } from 'lucide-react';

interface CircuitSchematicProps {
  params: CircuitParameters;
}

export const CircuitSchematic: React.FC<CircuitSchematicProps> = ({ params }) => {
  const {
    type,
    category,
    amplitude,
    frequency,
    loadResistance,
    filterCapacitor,
    firingAngle,
    loadType,
    freewheelingDiode,
  } = params;

  const [cycle, setCycle] = useState<'positive' | 'negative'>('positive');
  const [isAutoCycling, setIsAutoCycling] = useState<boolean>(true);
  const [selectedProbe, setSelectedProbe] = useState<string | null>(null);

  useEffect(() => {
    if (!isAutoCycling) return;
    const interval = setInterval(() => {
      setCycle((prev) => (prev === 'positive' ? 'negative' : 'positive'));
    }, 1500);
    return () => clearInterval(interval);
  }, [isAutoCycling]);

  const isPositive = cycle === 'positive';
  const isControlled = category === 'controlled';

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 text-slate-100 p-5 shadow-lg flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <span className="font-semibold text-sm tracking-wide text-slate-200">
            Dynamic Circuit Schematic
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
            {isControlled ? `SCR · Firing α = ${firingAngle}°` : 'Diode Rectifier'}
          </span>
        </div>

        {/* Half-Cycle Controls */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">AC Half-Cycle:</span>
          <div className="flex rounded-md bg-slate-800 p-0.5 border border-slate-700">
            <button
              onClick={() => {
                setIsAutoCycling(false);
                setCycle('positive');
              }}
              className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap font-medium ${
                isPositive ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              + Cycle
            </button>
            <button
              onClick={() => {
                setIsAutoCycling(false);
                setCycle('negative');
              }}
              className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap font-medium ${
                !isPositive ? 'bg-sky-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              − Cycle
            </button>
          </div>
          <button
            onClick={() => setIsAutoCycling(!isAutoCycling)}
            title={isAutoCycling ? 'Pause cycle animation' : 'Auto-cycle alternating phases'}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            {isAutoCycling ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative my-3 flex items-center justify-center bg-slate-950/90 rounded-lg p-3 border border-slate-800 overflow-x-auto min-h-[290px]">
        <style>{`
          @keyframes flow {
            to { stroke-dashoffset: -20; }
          }
          .circuit-flow {
            stroke-dasharray: 6 4;
            animation: flow 0.8s linear infinite;
          }
        `}</style>

        {/* 1. Controlled Half-Wave Rectifier */}
        {type === 'controlled-half-wave' && (
          <svg viewBox="0 0 540 260" className="w-full max-w-[540px] h-auto select-none">
            {/* AC Source */}
            <g transform="translate(50, 130)">
              <circle cx="0" cy="0" r="22" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
              <path d="M -10 0 Q -5 -10 0 0 T 10 0" fill="none" stroke="#f59e0b" strokeWidth="2" />
              <text x="0" y="38" textAnchor="middle" fill="#94a3b8" fontSize="11">
                {amplitude}V / {frequency}Hz
              </text>
            </g>

            {/* Input Bus */}
            <path d="M 50 108 L 50 60 L 170 60" fill="none" stroke="#64748b" strokeWidth="2" />
            <path d="M 50 152 L 50 200 L 450 200" fill="none" stroke="#64748b" strokeWidth="2" />

            {/* Conduction current during positive cycle when triggered */}
            {isPositive && (
              <path
                d="M 50 108 L 50 60 L 220 60 L 400 60 L 400 200 L 50 200 L 50 152"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2.5"
                className="circuit-flow"
              />
            )}

            {/* Thyristor T1 (SCR) */}
            <g
              transform="translate(200, 60)"
              className="cursor-pointer"
              onClick={() => setSelectedProbe(`SCR T1: Fired at α = ${firingAngle}°`)}
            >
              <circle cx="0" cy="0" r="20" fill={isPositive ? '#3b0764' : '#1e293b'} stroke={isPositive ? '#a855f7' : '#475569'} strokeWidth="1.5" />
              {/* Diode Triangle */}
              <polygon points="-8,-10 -8,10 8,0" fill={isPositive ? '#c084fc' : '#94a3b8'} />
              {/* Cathode bar */}
              <line x1="8" y1="-10" x2="8" y2="10" stroke={isPositive ? '#c084fc' : '#94a3b8'} strokeWidth="2.5" />
              {/* SCR Gate Terminal slanted line */}
              <path d="M 4 8 L 12 18 L 22 18" fill="none" stroke="#f43f5e" strokeWidth="2" />
              <circle cx="22" cy="18" r="3" fill="#f43f5e" />
              <text x="26" y="22" fill="#f43f5e" fontSize="10" fontWeight="bold">Gate</text>

              <text x="0" y="-24" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="bold">T1 (SCR)</text>
              <text x="0" y="34" textAnchor="middle" fill={isPositive ? '#c084fc' : '#ef4444'} fontSize="10" fontWeight="600">
                {isPositive ? `ON (α=${firingAngle}°)` : 'OFF'}
              </text>
            </g>

            <path d="M 220 60 L 400 60" fill="none" stroke="#64748b" strokeWidth="2" />

            {/* Optional Freewheeling Diode */}
            {freewheelingDiode && (
              <g transform="translate(320, 130)">
                <line x1="0" y1="-70" x2="0" y2="-15" stroke="#64748b" strokeWidth="2" />
                <polygon points="-8,10 8,10 0,-10" fill="#38bdf8" />
                <line x1="-8" y1="-10" x2="8" y2="-10" stroke="#38bdf8" strokeWidth="2" />
                <line x1="0" y1="10" x2="0" y2="70" stroke="#64748b" strokeWidth="2" />
                <text x="14" y="4" fill="#38bdf8" fontSize="10" fontWeight="bold">FWD</text>
              </g>
            )}

            {/* Load Section: R or RL */}
            <g transform="translate(410, 60)">
              <line x1="0" y1="0" x2="0" y2="25" stroke="#64748b" strokeWidth="2" />
              {/* Resistor */}
              <path d="M 0 25 L -8 32 L 8 39 L -8 46 L 8 53 L -8 60 L 8 67 L 0 74" fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
              <text x="18" y="52" fill="#f8fafc" fontSize="11" fontWeight="bold">RL: {loadResistance}Ω</text>

              {loadType === 'RL' ? (
                <>
                  <line x1="0" y1="74" x2="0" y2="90" stroke="#64748b" strokeWidth="2" />
                  {/* Inductor coils */}
                  <path d="M 0 90 Q 12 96 0 102 Q 12 108 0 114 Q 12 120 0 126" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
                  <line x1="0" y1="126" x2="0" y2="140" stroke="#64748b" strokeWidth="2" />
                  <text x="18" y="112" fill="#38bdf8" fontSize="10">{params.loadInductance}mH</text>
                </>
              ) : (
                <line x1="0" y1="74" x2="0" y2="140" stroke="#64748b" strokeWidth="2" />
              )}
            </g>

            {/* Ground */}
            <g transform="translate(450, 200)">
              <line x1="0" y1="0" x2="0" y2="14" stroke="#94a3b8" strokeWidth="2" />
              <line x1="-10" y1="14" x2="10" y2="14" stroke="#94a3b8" strokeWidth="2" />
              <line x1="-6" y1="18" x2="6" y2="18" stroke="#94a3b8" strokeWidth="2" />
            </g>
          </svg>
        )}

        {/* 2. Controlled Full Converter / Semi Converter Bridge */}
        {(type === 'controlled-semi-converter' || type === 'controlled-full-converter') && (
          <svg viewBox="0 0 560 300" className="w-full max-w-[560px] h-auto select-none">
            {/* Input AC source */}
            <g transform="translate(45, 150)">
              <circle cx="0" cy="0" r="20" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
              <path d="M -10 0 Q -5 -10 0 0 T 10 0" fill="none" stroke="#f59e0b" strokeWidth="2" />
              <text x="0" y="34" textAnchor="middle" fill="#94a3b8" fontSize="10">
                {amplitude}V AC
              </text>
            </g>

            <path d="M 45 130 L 45 70 L 220 70 L 220 110" fill="none" stroke="#64748b" strokeWidth="2" />
            <path d="M 45 170 L 45 230 L 220 230 L 220 190" fill="none" stroke="#64748b" strokeWidth="2" />

            {/* Bridge Diamond */}
            <path d="M 220 80 L 290 150 L 220 220 L 150 150 Z" fill="none" stroke="#475569" strokeWidth="2" />

            {/* T1 */}
            <g transform="translate(185, 115) rotate(45)" className="cursor-pointer">
              <polygon points="-6,-8 -6,8 6,0" fill={isPositive ? '#c084fc' : '#94a3b8'} />
              <line x1="6" y1="-8" x2="6" y2="8" stroke={isPositive ? '#c084fc' : '#94a3b8'} strokeWidth="2.5" />
              <line x1="3" y1="6" x2="9" y2="12" stroke="#f43f5e" strokeWidth="2" />
            </g>
            <text x="175" y="105" fill="#e2e8f0" fontSize="10" fontWeight="bold">T1</text>

            {/* T2 */}
            <g transform="translate(255, 185) rotate(45)" className="cursor-pointer">
              <polygon points="-6,-8 -6,8 6,0" fill={isPositive ? '#c084fc' : '#94a3b8'} />
              <line x1="6" y1="-8" x2="6" y2="8" stroke={isPositive ? '#c084fc' : '#94a3b8'} strokeWidth="2.5" />
              <line x1="3" y1="6" x2="9" y2="12" stroke="#f43f5e" strokeWidth="2" />
            </g>
            <text x="270" y="195" fill="#e2e8f0" fontSize="10" fontWeight="bold">
              {type === 'controlled-semi-converter' ? 'D2' : 'T2'}
            </text>

            {/* T3 */}
            <g transform="translate(185, 185) rotate(-45)" className="cursor-pointer">
              <polygon points="-6,-8 -6,8 6,0" fill={!isPositive ? '#38bdf8' : '#94a3b8'} />
              <line x1="6" y1="-8" x2="6" y2="8" stroke={!isPositive ? '#38bdf8' : '#94a3b8'} strokeWidth="2.5" />
              <line x1="3" y1="6" x2="9" y2="12" stroke="#f43f5e" strokeWidth="2" />
            </g>
            <text x="175" y="200" fill="#e2e8f0" fontSize="10" fontWeight="bold">
              {type === 'controlled-semi-converter' ? 'D3' : 'T3'}
            </text>

            {/* T4 */}
            <g transform="translate(255, 115) rotate(-45)" className="cursor-pointer">
              <polygon points="-6,-8 -6,8 6,0" fill={!isPositive ? '#38bdf8' : '#94a3b8'} />
              <line x1="6" y1="-8" x2="6" y2="8" stroke={!isPositive ? '#38bdf8' : '#94a3b8'} strokeWidth="2.5" />
              <line x1="3" y1="6" x2="9" y2="12" stroke="#f43f5e" strokeWidth="2" />
            </g>
            <text x="270" y="105" fill="#e2e8f0" fontSize="10" fontWeight="bold">T4</text>

            {/* DC Bus */}
            <path d="M 290 150 L 420 150 L 420 80 L 460 80" fill="none" stroke="#64748b" strokeWidth="2" />
            <path d="M 150 150 L 120 150 L 120 260 L 460 260" fill="none" stroke="#64748b" strokeWidth="2" />

            {/* Current animation */}
            <path
              d={
                isPositive
                  ? 'M 45 70 L 220 70 L 220 80 L 150 150 L 120 150 L 120 260 L 460 260 L 460 170 L 460 80 L 420 80 L 420 150 L 290 150 L 220 220 L 220 230 L 45 230'
                  : 'M 45 230 L 220 230 L 220 220 L 150 150 L 120 150 L 120 260 L 460 260 L 460 170 L 460 80 L 420 80 L 420 150 L 290 150 L 220 80 L 220 70 L 45 70'
              }
              fill="none"
              stroke={isPositive ? '#fbbf24' : '#38bdf8'}
              strokeWidth="2.5"
              className="circuit-flow"
            />

            {/* Load Section */}
            <g transform="translate(460, 80)">
              <line x1="0" y1="0" x2="0" y2="40" stroke="#64748b" strokeWidth="2" />
              <path d="M 0 40 L -8 48 L 8 56 L -8 64 L 8 72 L -8 80 L 8 88 L 0 96" fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
              <line x1="0" y1="96" x2="0" y2="180" stroke="#64748b" strokeWidth="2" />
              <text x="18" y="70" fill="#f8fafc" fontSize="11" fontWeight="bold">RL: {loadResistance}Ω</text>
            </g>
          </svg>
        )}

        {/* 3. Uncontrolled Rectifiers */}
        {!isControlled && (
          <svg viewBox="0 0 540 260" className="w-full max-w-[540px] h-auto select-none">
            <g transform="translate(50, 130)">
              <circle cx="0" cy="0" r="22" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
              <path d="M -10 0 Q -5 -10 0 0 T 10 0" fill="none" stroke="#f59e0b" strokeWidth="2" />
              <text x="0" y="38" textAnchor="middle" fill="#94a3b8" fontSize="11">
                {amplitude}V / {frequency}Hz
              </text>
            </g>
            <path d="M 50 108 L 50 60 L 160 60" fill="none" stroke="#64748b" strokeWidth="2" />
            <path d="M 50 152 L 50 200 L 440 200" fill="none" stroke="#64748b" strokeWidth="2" />

            {isPositive && (
              <path
                d="M 50 108 L 50 60 L 220 60 L 380 60 L 380 200 L 50 200 L 50 152"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2.5"
                className="circuit-flow"
              />
            )}

            {/* Diode D1 */}
            <g transform="translate(190, 60)">
              <circle cx="0" cy="0" r="18" fill={isPositive ? '#065f46' : '#1e293b'} stroke={isPositive ? '#10b981' : '#475569'} strokeWidth="1.5" />
              <polygon points="-7,-9 -7,9 7,0" fill={isPositive ? '#34d399' : '#94a3b8'} />
              <line x1="7" y1="-9" x2="7" y2="9" stroke={isPositive ? '#34d399' : '#94a3b8'} strokeWidth="2.5" />
              <text x="0" y="-22" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="bold">D1 (1N4007)</text>
              <text x="0" y="28" textAnchor="middle" fill={isPositive ? '#34d399' : '#ef4444'} fontSize="9">
                {isPositive ? 'ON' : 'OFF'}
              </text>
            </g>

            <path d="M 210 60 L 380 60" fill="none" stroke="#64748b" strokeWidth="2" />

            {/* Filter Capacitor */}
            {filterCapacitor > 0 && (
              <g transform="translate(290, 60)">
                <line x1="0" y1="0" x2="0" y2="45" stroke="#64748b" strokeWidth="2" />
                <line x1="-16" y1="45" x2="16" y2="45" stroke="#38bdf8" strokeWidth="3" />
                <line x1="-16" y1="55" x2="16" y2="55" stroke="#94a3b8" strokeWidth="3" />
                <line x1="0" y1="55" x2="0" y2="140" stroke="#64748b" strokeWidth="2" />
                <text x="24" y="54" fill="#38bdf8" fontSize="11" fontWeight="bold">C</text>
                <text x="24" y="68" fill="#94a3b8" fontSize="10">{filterCapacitor} µF</text>
              </g>
            )}

            {/* Load Resistor */}
            <g transform="translate(380, 60)">
              <line x1="0" y1="0" x2="0" y2="30" stroke="#64748b" strokeWidth="2" />
              <path d="M 0 30 L -8 38 L 8 46 L -8 54 L 8 62 L -8 70 L 8 78 L 0 86" fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
              <line x1="0" y1="86" x2="0" y2="140" stroke="#64748b" strokeWidth="2" />
              <text x="18" y="58" fill="#f8fafc" fontSize="11" fontWeight="bold">RL: {loadResistance}Ω</text>
            </g>
          </svg>
        )}
      </div>

      {/* Footnote */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>Input AC Source</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span>Rectified Output</span>
          </span>
          {isControlled && (
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>Gate Trigger (α = {firingAngle}°)</span>
            </span>
          )}
        </div>

        {selectedProbe ? (
          <span className="text-purple-300 font-mono">{selectedProbe}</span>
        ) : (
          <span className="text-slate-500 italic">Click switch or terminals for technical pinouts</span>
        )}
      </div>
    </div>
  );
};

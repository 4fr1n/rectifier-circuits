import React from 'react';
import { CircuitParameters, CalculatedMetrics } from '../types/lab';

interface RealTimeAnalyticsPlotProps {
  params: CircuitParameters;
  metrics: CalculatedMetrics;
}

export const RealTimeAnalyticsPlot: React.FC<RealTimeAnalyticsPlotProps> = ({
  params,
  metrics,
}) => {
  const { category, type, firingAngle, amplitude, loadResistance } = params;

  // Generate Vdc vs Alpha curve points from 0 to 180 degrees
  const curvePoints: { alpha: number; vdc: number }[] = [];
  const Vm = amplitude;

  for (let a = 0; a <= 180; a += 5) {
    const aRad = (a * Math.PI) / 180;
    let v = 0;
    if (category === 'uncontrolled') {
      v = metrics.vdc;
    } else if (type === 'controlled-half-wave') {
      v = (Vm / (2 * Math.PI)) * (1 + Math.cos(aRad));
    } else if (type === 'controlled-semi-converter') {
      v = (Vm / Math.PI) * (1 + Math.cos(aRad));
    } else {
      // Full converter
      if (params.loadType === 'R') {
        v = (Vm / Math.PI) * (1 + Math.cos(aRad));
      } else {
        v = ((2 * Vm) / Math.PI) * Math.cos(aRad);
      }
    }
    curvePoints.push({ alpha: a, vdc: v });
  }

  // Plot canvas coordinate mapping
  // X: 0 to 180 deg -> 40 to 360 px
  // Y: minV to maxV -> 180 to 20 px
  const maxV = Math.max(1, ((2 * Vm) / Math.PI) * 1.2);
  const minV = type === 'controlled-full-converter' && params.loadType === 'RL' ? -maxV : 0;
  const vRange = maxV - minV || 1;

  const mapX = (deg: number) => 45 + (deg / 180) * 310;
  const mapY = (v: number) => 170 - ((v - minV) / vRange) * 140;

  const pathD = curvePoints
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${mapX(pt.alpha).toFixed(1)} ${mapY(pt.vdc).toFixed(1)}`)
    .join(' ');

  const currentX = mapX(firingAngle);
  const currentY = mapY(metrics.vdc);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg text-slate-100 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h3 className="font-semibold text-xs text-slate-200 uppercase tracking-wider font-mono">
            TRANSFER CHARACTERISTIC: Vdc vs FIRING ANGLE (α)
          </h3>
          <p className="text-[11px] text-slate-400">
            Real-time operating point tracking along control transfer curve
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/80 border border-indigo-800/80 px-2 py-0.5 rounded">
          α = {firingAngle}°
        </span>
      </div>

      {/* SVG Coordinate Plot */}
      <div className="my-2 flex justify-center">
        <svg viewBox="0 0 380 200" className="w-full max-w-[380px] h-auto select-none">
          {/* Background Grid */}
          <rect x="40" y="20" width="320" height="150" fill="#090d16" stroke="#1e293b" strokeWidth="1" />

          {/* Zero Voltage Axis line if minV < 0 */}
          {minV < 0 && (
            <line
              x1="40"
              y1={mapY(0)}
              x2="360"
              y2={mapY(0)}
              stroke="#475569"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
          )}

          {/* Grid lines */}
          {[0, 45, 90, 135, 180].map((deg) => (
            <g key={deg}>
              <line
                x1={mapX(deg)}
                y1="20"
                x2={mapX(deg)}
                y2="170"
                stroke="#1e293b"
                strokeWidth="1"
              />
              <text
                x={mapX(deg)}
                y="185"
                textAnchor="middle"
                fill="#64748b"
                fontSize="9"
                fontFamily="monospace"
              >
                {deg}°
              </text>
            </g>
          ))}

          {/* Theoretical Curve */}
          <path
            d={pathD}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Current Operating Point Marker */}
          {category === 'controlled' && (
            <>
              {/* Dropline */}
              <line
                x1={currentX}
                y1="170"
                x2={currentX}
                y2={currentY}
                stroke="#a855f7"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <line
                x1="40"
                y1={currentY}
                x2={currentX}
                y2={currentY}
                stroke="#a855f7"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />

              {/* Glowing Pulse Dot */}
              <circle cx={currentX} cy={currentY} r="6" fill="#a855f7" />
              <circle cx={currentX} cy={currentY} r="3" fill="#ffffff" />
            </>
          )}

          {/* Axis Labels */}
          <text x="35" y="28" textAnchor="end" fill="#94a3b8" fontSize="9" fontFamily="monospace">
            +{maxV.toFixed(1)}V
          </text>
          <text x="35" y={mapY(0) + 3} textAnchor="end" fill="#64748b" fontSize="9" fontFamily="monospace">
            0V
          </text>
          {minV < 0 && (
            <text x="35" y="165" textAnchor="end" fill="#f43f5e" fontSize="9" fontFamily="monospace">
              {minV.toFixed(1)}V
            </text>
          )}

          <text x="200" y="196" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">
            Firing Angle α (Degrees)
          </text>
        </svg>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
        <span className="text-indigo-400">
          Vdc(α) = {metrics.vdc.toFixed(2)} V
        </span>
        <span className="text-emerald-400">
          Idc = {metrics.idc.toFixed(1)} mA (RL = {loadResistance}Ω)
        </span>
      </div>
    </div>
  );
};

import React from 'react';
import { ObservationRecord } from '../types/lab';
import { formatRectifierName } from '../utils/physics';
import { Download, Trash2, Database, Table } from 'lucide-react';

interface ObservationTableProps {
  records: ObservationRecord[];
  onClear: () => void;
  onDeleteRow: (id: string) => void;
  onLoadSampleData: () => void;
}

export const ObservationTable: React.FC<ObservationTableProps> = ({
  records,
  onClear,
  onDeleteRow,
  onLoadSampleData,
}) => {
  const exportCSV = () => {
    if (records.length === 0) return;

    const headers = [
      'Trial No',
      'Rectifier Type',
      'Firing Angle Alpha (deg)',
      'Load RL (Ohms)',
      'Load Type',
      'Vm (V)',
      'Freq (Hz)',
      'Vdc Theo (V)',
      'Vdc Meas (V)',
      'Vrms Meas (V)',
      'Ripple Factor',
      'Efficiency (%)',
      'Error (%)',
    ];

    const rows = records.map((r, index) => [
      index + 1,
      formatRectifierName(r.rectifierType),
      r.firingAngle,
      r.loadResistance,
      r.loadType,
      r.vm.toFixed(2),
      r.frequency,
      r.vdcTheoretical.toFixed(2),
      r.vdcMeasured.toFixed(2),
      r.vrmsMeasured.toFixed(2),
      r.rippleFactorMeasured.toFixed(3),
      r.efficiencyMeasured.toFixed(1),
      r.errorPercent.toFixed(2),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rectifier_simulation_readings_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col gap-4">
      {/* Table Header and Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Table className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-sm sm:text-base text-slate-900">
            Recorded Simulation Readings
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {records.length} {records.length === 1 ? 'Reading' : 'Readings'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {records.length === 0 && (
            <button
              onClick={onLoadSampleData}
              className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Load Benchmarks</span>
            </button>
          )}

          {records.length > 0 && (
            <>
              <button
                onClick={exportCSV}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={onClear}
                className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </>
          )}
        </div>
      </div>

      {records.length === 0 ? (
        <div className="py-8 px-4 text-center border-2 border-dashed border-slate-200 rounded-xl">
          <p className="text-xs text-slate-500 mb-3">
            Click "Record Observation" above to log trial data points as you change firing angle α and load resistance RL.
          </p>
          <button
            onClick={onLoadSampleData}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Load Benchmark Controlled & Uncontrolled Trials</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-2 px-3">#</th>
                <th className="py-2 px-3">Configuration</th>
                <th className="py-2 px-3 font-mono">Firing α</th>
                <th className="py-2 px-3 font-mono">RL (Ω)</th>
                <th className="py-2 px-3 font-mono">Load</th>
                <th className="py-2 px-3 font-mono">Vm</th>
                <th className="py-2 px-3 font-mono">Vdc Theo</th>
                <th className="py-2 px-3 font-mono">Vdc Meas</th>
                <th className="py-2 px-3 font-mono">Vrms</th>
                <th className="py-2 px-3 font-mono">Ripple γ</th>
                <th className="py-2 px-3 font-mono">Eff (%)</th>
                <th className="py-2 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {records.map((r, idx) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2 px-3 font-semibold text-slate-400">{idx + 1}</td>
                  <td className="py-2 px-3 font-sans text-slate-900 font-medium whitespace-nowrap">
                    {formatRectifierName(r.rectifierType)}
                  </td>
                  <td className="py-2 px-3 font-semibold text-purple-700">
                    {r.firingAngle > 0 ? `${r.firingAngle}°` : '0° (Diode)'}
                  </td>
                  <td className="py-2 px-3 font-semibold text-indigo-700">
                    {r.loadResistance} Ω
                  </td>
                  <td className="py-2 px-3">{r.loadType}</td>
                  <td className="py-2 px-3">{r.vm.toFixed(1)}V</td>
                  <td className="py-2 px-3 text-slate-500">{r.vdcTheoretical.toFixed(2)}V</td>
                  <td className={`py-2 px-3 font-bold ${r.vdcMeasured < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {r.vdcMeasured.toFixed(2)} V
                  </td>
                  <td className="py-2 px-3">{r.vrmsMeasured.toFixed(2)} V</td>
                  <td className="py-2 px-3 font-semibold text-amber-600">
                    {r.rippleFactorMeasured.toFixed(3)}
                  </td>
                  <td className="py-2 px-3 text-indigo-600 font-semibold">
                    {r.efficiencyMeasured.toFixed(1)}%
                  </td>
                  <td className="py-2 px-2 text-right">
                    <button
                      onClick={() => onDeleteRow(r.id)}
                      title="Delete row"
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

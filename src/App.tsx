/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CircuitParameters, ObservationRecord } from './types/lab';
import { Header } from './components/Header';
import { SimulationWorkbench } from './components/SimulationWorkbench';
import { ObservationTable } from './components/ObservationTable';
import { DownloadModal } from './components/DownloadModal';
import { Zap, ChevronRight } from 'lucide-react';

const DEFAULT_PARAMS: CircuitParameters = {
  category: 'controlled',
  type: 'controlled-full-converter',
  amplitude: 15,
  frequency: 50,
  diodeDrop: 0.7,
  loadResistance: 250,
  filterCapacitor: 0,
  firingAngle: 45,
  loadType: 'R',
  loadInductance: 50,
  freewheelingDiode: false,
  timeDiv: 5,
  voltsDivCh1: 5,
  voltsDivCh2: 5,
  scopeTrace: 'vout',
};

const SAMPLE_BENCHMARK_RECORDS: ObservationRecord[] = [
  {
    id: 'ctrl-1',
    timestamp: '11:05:12 AM',
    rectifierType: 'controlled-full-converter',
    firingAngle: 0,
    loadResistance: 250,
    loadType: 'R',
    vm: 15.0,
    frequency: 50,
    filterCapacitor: 0,
    vdcTheoretical: 9.55,
    vdcMeasured: 9.52,
    vrmsMeasured: 10.58,
    rippleFactorTheoretical: 0.483,
    rippleFactorMeasured: 0.483,
    efficiencyMeasured: 80.8,
    errorPercent: 0.31,
  },
  {
    id: 'ctrl-2',
    timestamp: '11:10:45 AM',
    rectifierType: 'controlled-full-converter',
    firingAngle: 45,
    loadResistance: 250,
    loadType: 'R',
    vm: 15.0,
    frequency: 50,
    filterCapacitor: 0,
    vdcTheoretical: 8.15,
    vdcMeasured: 8.12,
    vrmsMeasured: 9.85,
    rippleFactorTheoretical: 0.686,
    rippleFactorMeasured: 0.686,
    efficiencyMeasured: 68.0,
    errorPercent: 0.37,
  },
  {
    id: 'ctrl-3',
    timestamp: '11:18:20 AM',
    rectifierType: 'controlled-full-converter',
    firingAngle: 90,
    loadResistance: 250,
    loadType: 'R',
    vm: 15.0,
    frequency: 50,
    filterCapacitor: 0,
    vdcTheoretical: 4.77,
    vdcMeasured: 4.75,
    vrmsMeasured: 7.49,
    rippleFactorTheoretical: 1.218,
    rippleFactorMeasured: 1.218,
    efficiencyMeasured: 40.2,
    errorPercent: 0.42,
  },
  {
    id: 'ctrl-4',
    timestamp: '11:24:10 AM',
    rectifierType: 'controlled-half-wave',
    firingAngle: 60,
    loadResistance: 100,
    loadType: 'R',
    vm: 15.0,
    frequency: 50,
    filterCapacitor: 0,
    vdcTheoretical: 3.58,
    vdcMeasured: 3.56,
    vrmsMeasured: 6.70,
    rippleFactorTheoretical: 1.597,
    rippleFactorMeasured: 1.597,
    efficiencyMeasured: 28.2,
    errorPercent: 0.56,
  },
  {
    id: 'unc-1',
    timestamp: '11:32:00 AM',
    rectifierType: 'full-wave-bridge',
    firingAngle: 0,
    loadResistance: 500,
    loadType: 'R',
    vm: 15.0,
    frequency: 50,
    filterCapacitor: 100,
    vdcTheoretical: 13.10,
    vdcMeasured: 13.08,
    vrmsMeasured: 13.09,
    rippleFactorTheoretical: 0.023,
    rippleFactorMeasured: 0.023,
    efficiencyMeasured: 99.8,
    errorPercent: 0.15,
  },
];

export default function App() {
  const [params, setParams] = useState<CircuitParameters>(DEFAULT_PARAMS);
  const [records, setRecords] = useState<ObservationRecord[]>(SAMPLE_BENCHMARK_RECORDS);
  const [activeSection, setActiveSection] = useState<string>('simulation');
  const [isDownloadOpen, setIsDownloadOpen] = useState<boolean>(false);

  const handleParamsChange = (newParams: Partial<CircuitParameters>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  const handleResetParams = () => {
    setParams(DEFAULT_PARAMS);
  };

  const handleRecordObservation = (newRecord: ObservationRecord) => {
    setRecords((prev) => [newRecord, ...prev]);
  };

  const handleClearRecords = () => {
    setRecords([]);
  };

  const handleDeleteRow = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleLoadSampleData = () => {
    setRecords(SAMPLE_BENCHMARK_RECORDS);
  };

  const handleExportCSV = () => {
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
      r.rectifierType,
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
    link.setAttribute('download', `rectifier_simulation_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectSection = (section: string) => {
    setActiveSection(section);
    if (section === 'simulation') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (section === 'readings') {
      const el = document.getElementById('observation-table-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        onExportRecords={handleExportCSV}
        onOpenDownloadModal={() => setIsDownloadOpen(true)}
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
      />

      {/* Breadcrumb strip */}
      <div className="bg-slate-100 border-b border-slate-200 text-xs py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-slate-600">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs">
            <span className="font-medium text-slate-800">Virtual Lab</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span>Power Electronics</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-indigo-700">
              Controlled & Uncontrolled Rectifier Simulation
            </span>
          </div>

          <div className="text-[11px] text-slate-500 font-mono hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Real-time Interactive Engine</span>
          </div>
        </div>
      </div>

      {/* Main Simulation Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Core Simulation Workbench */}
        <SimulationWorkbench
          params={params}
          onParamsChange={handleParamsChange}
          onRecordObservation={handleRecordObservation}
          onResetParams={handleResetParams}
        />

        {/* Observation Readings Table */}
        <div id="observation-table-section">
          <ObservationTable
            records={records}
            onClear={handleClearRecords}
            onDeleteRow={handleDeleteRow}
            onLoadSampleData={handleLoadSampleData}
          />
        </div>
      </main>

      {/* Download Project & GitHub Deployment Modal */}
      <DownloadModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
      />

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 mt-auto py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-1">
          <p>
            Controlled & Uncontrolled Rectifier Simulation Workbench
          </p>
          <p className="text-[11px] text-slate-400 font-mono">
            Adjust Firing Angle α (0°–180°), Load Resistance RL (10Ω–2000Ω), and observe real-time waveforms
          </p>
        </div>
      </footer>
    </div>
  );
}

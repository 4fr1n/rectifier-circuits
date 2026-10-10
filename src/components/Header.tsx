import React from 'react';
import { Download, Sparkles } from 'lucide-react';

interface HeaderProps {
  onExportRecords: () => void;
  onOpenDownloadModal: () => void;
  activeSection: string;
  onSelectSection: (section: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onExportRecords,
  onOpenDownloadModal,
  activeSection,
  onSelectSection,
}) => {
  const navItems = [
    { id: 'simulation', label: 'Simulation Bench' },
    { id: 'oscilloscope', label: 'Real-Time Scope' },
    { id: 'transfer-curve', label: 'Transfer Curve' },
    { id: 'readings', label: 'Observation Log' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single element wordmark */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
              Rectifier Simulation Lab
            </span>
          </div>

          {/* Zone 2: 4-5 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectSection(item.id)}
                className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeSection === item.id
                    ? 'text-indigo-600 font-semibold underline underline-offset-8 decoration-2 decoration-indigo-600'
                    : 'hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenDownloadModal}
              className="px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Download Files (.ZIP)</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

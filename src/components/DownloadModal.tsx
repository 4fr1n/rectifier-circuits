import React, { useState } from 'react';
import { downloadProjectZip } from '../utils/projectDownloader';
import { Download, X, Github, CheckCircle2, FolderArchive, ArrowRight } from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadProjectZip();
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <FolderArchive className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base">Download Files & Launch on GitHub.io</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Primary Action Button */}
          <div className="p-5 bg-indigo-50/80 border border-indigo-200 rounded-xl text-center space-y-3">
            <h4 className="font-bold text-base text-indigo-950">
              Download Complete Project Package
            </h4>
            <p className="text-xs text-indigo-800 max-w-md mx-auto leading-relaxed">
              Downloads a ready-to-upload <code className="font-mono font-bold">Rectifier-Simulation-Lab.zip</code> with all source code, components, HTML, CSS, and automated GitHub Actions deployment.
            </p>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md inline-flex items-center gap-2 cursor-pointer ${
                downloaded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg'
              }`}
            >
              {downloaded ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Downloaded! Check your Downloads folder</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{downloading ? 'Packing files...' : 'Download Project (.ZIP)'}</span>
                </>
              )}
            </button>
          </div>

          {/* Simple 3-Step Guide to Upload to GitHub */}
          <div className="space-y-3 text-xs">
            <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              How to upload to GitHub & get your .github.io link:
            </h5>

            <div className="space-y-2.5">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-mono font-bold flex items-center justify-center text-[11px] shrink-0">
                  1
                </span>
                <div>
                  <strong className="text-slate-900 block">Extract the ZIP</strong>
                  <span className="text-slate-600">Unzip the downloaded folder on your computer.</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-mono font-bold flex items-center justify-center text-[11px] shrink-0">
                  2
                </span>
                <div>
                  <strong className="text-slate-900 block">Upload to a new GitHub repository</strong>
                  <span className="text-slate-600">
                    Create a repo on GitHub (e.g. <code className="font-mono">Rectifier-lab</code>) and either drag & drop the files, or run:
                  </span>
                  <pre className="bg-slate-950 text-emerald-400 p-2 rounded mt-1.5 font-mono text-[10px] overflow-x-auto">
                    git init && git add . && git commit -m "Initial commit" && git push
                  </pre>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-mono font-bold flex items-center justify-center text-[11px] shrink-0">
                  3
                </span>
                <div>
                  <strong className="text-slate-900 block">Turn on GitHub Pages</strong>
                  <span className="text-slate-600">
                    Go to your repo's <strong>Settings &gt; Pages</strong>, set <strong>Source</strong> to <strong>GitHub Actions</strong>. Your site will immediately be live at:
                  </span>
                  <div className="text-indigo-700 font-mono font-semibold mt-1">
                    https://&lt;your-username&gt;.github.io/Rectifier-lab/
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

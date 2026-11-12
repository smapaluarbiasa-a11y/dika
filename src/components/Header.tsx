import React from 'react';
import {
  Upload,
  Download,
  BookOpen,
  FileSpreadsheet,
  Database,
} from 'lucide-react';

interface HeaderProps {
  onOpenUpload: () => void;
  onOpenTemplates?: () => void;
  onOpenAppsScript?: () => void;
  onExportExcel: () => void;
  onExportCsv: () => void;
  isAppsScriptConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenUpload,
  onOpenAppsScript,
  onExportExcel,
  onExportCsv,
  isAppsScriptConnected,
}) => {
  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-30 shadow-2xs">
      {/* Top Banner Ribbon */}
      <div className="bg-slate-950 text-white px-4 py-1.5 text-xs font-medium flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-slate-200">Sistem Repositori Naskah Soal &amp; Asesmen Sekolah</span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-400">Monitoring 21 Mata Pelajaran</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-blue-600/20 text-blue-300 px-2 py-0.5 rounded-md text-[11px] font-bold border border-blue-500/30">
            T.A. 2026/2027
          </span>
          <span className="hidden md:inline text-slate-400 text-[11px] font-medium">
            Panel Panitia Asesmen
          </span>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & School Branding */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <BookOpen className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Upload Soal SMAN 1 Pakem
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                SMAN 1 Pakem &bull; Repositori Dokumen PDF (.pdf) &amp; Microsoft Word (.docx / .doc)
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Export Buttons */}
            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-850 p-0.5">
              <button
                onClick={onExportExcel}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
                title="Ekspor Laporan ke Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel</span>
              </button>
              <button
                onClick={onExportCsv}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                title="Ekspor Laporan ke CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>CSV</span>
              </button>
            </div>

            {/* Database Apps Script Button */}
            {onOpenAppsScript && (
              <button
                onClick={onOpenAppsScript}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-300 dark:border-slate-700 rounded-xl transition-all cursor-pointer shadow-2xs"
                title="Panduan & Koneksi Database Google Apps Script"
              >
                <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Database Apps Script</span>
                {isAppsScriptConnected && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Tersambung ke Google Sheets"></span>
                )}
              </button>
            )}

            {/* Primary Upload Button */}
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Unggah Naskah Soal</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

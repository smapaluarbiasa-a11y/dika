import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Layers,
  FileCheck,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { RecapitulationSummary } from '../types/naskah';

interface RecapOverviewProps {
  summary: RecapitulationSummary;
  onExportExcel: () => void;
  onExportCsv: () => void;
}

export const RecapOverview: React.FC<RecapOverviewProps> = ({
  summary,
  onExportExcel,
  onExportCsv,
}) => {
  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-xs space-y-6">
      {/* Top Banner / Progress Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Rekapitulasi Ketercapaian Panitia Asesmen
            </h2>
            <span className="text-xs bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full font-bold border border-blue-200 dark:border-blue-800">
              Target 21 Mata Pelajaran
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitoring progres kelengkapan pengumpulan naskah soal ujian per mata pelajaran
          </p>
        </div>

        {/* Action Export Buttons */}
        <div className="flex items-center gap-2 self-start lg:self-auto">
          <button
            onClick={onExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/80 transition-all cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>
          <button
            onClick={onExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-all cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Progress Bar Display */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <span>Ketercapaian Naskah Terkumpul:</span>
            <span className="text-blue-600 dark:text-blue-400 font-extrabold text-sm sm:text-base">
              {summary.collectedSubjectsCount} dari {summary.totalTargetSubjects} Mapel
            </span>
          </div>
          <span className="text-sm sm:text-base font-black text-blue-600 dark:text-blue-400">
            {summary.completionPercentage}%
          </span>
        </div>

        {/* Visual Progress Bar Track */}
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700/80">
          <div
            className="h-full rounded-full bg-linear-to-r from-blue-600 via-indigo-600 to-emerald-500 transition-all duration-700 shadow-sm"
            style={{ width: `${Math.min(100, Math.max(0, summary.completionPercentage))}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <span>0 Mapel</span>
          <span>
            {summary.totalTargetSubjects - summary.collectedSubjectsCount > 0
              ? `Tersisa ${summary.totalTargetSubjects - summary.collectedSubjectsCount} mata pelajaran belum mengunggah naskah`
              : 'Semua 21 mata pelajaran telah lengkap mengunggah naskah soal!'}
          </span>
          <span>21 Mapel (100%)</span>
        </div>
      </div>

      {/* Modern KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Documents */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">Total Berkas</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {summary.totalDocuments}
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Dokumen masuk</p>
        </div>

        {/* Mapel Masuk */}
        <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40">
          <div className="flex items-center justify-between text-blue-700 dark:text-blue-300 mb-1">
            <span className="text-xs font-semibold">Mapel Masuk</span>
            <FileCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-700 dark:text-blue-300">
            {summary.collectedSubjectsCount} <span className="text-xs font-normal text-slate-500">/ 21</span>
          </div>
          <p className="text-[11px] text-blue-600/80 dark:text-blue-400 font-medium mt-0.5">
            {summary.completionPercentage}% ketercapaian
          </p>
        </div>

        {/* Disetujui */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 mb-1">
            <span className="text-xs font-semibold">Disetujui</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
            {summary.approvedCount}
          </div>
          <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400 font-medium mt-0.5">Siap cetak / uji</p>
        </div>

        {/* Menunggu Review */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 mb-1">
            <span className="text-xs font-semibold">Menunggu Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-slate-200">
            {summary.pendingCount}
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Menunggu panitia</p>
        </div>

        {/* Perlu Revisi */}
        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-300 mb-1">
            <span className="text-xs font-semibold">Perlu Revisi</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-700 dark:text-amber-300">
            {summary.revisionCount}
          </div>
          <p className="text-[11px] text-amber-600/80 dark:text-amber-400 font-medium mt-0.5">Ada catatan perbaikan</p>
        </div>

        {/* Format Breakdown */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Format Berkas
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="inline-flex items-center gap-1 text-xs font-black text-rose-700 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800">
              {summary.pdfCount} PDF
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-black text-blue-700 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
              {summary.wordCount} Word
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">PDF Merah &amp; Word Biru</p>
        </div>
      </div>
    </div>
  );
};

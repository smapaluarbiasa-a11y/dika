import React from 'react';
import {
  X,
  FileText,
  Download,
  CheckCircle,
  FileCheck2,
  Table,
} from 'lucide-react';
import {
  downloadWordExamTemplate,
  downloadWordRubricTemplate,
} from '../utils/templates';

interface OfficialTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfficialTemplatesModal: React.FC<OfficialTemplatesModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-700 dark:text-blue-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Format & Template Resmi Word (.doc)
              </h3>
              <p className="text-xs text-slate-500">
                SMA Negeri 1 Pakem &bull; Standar Baku Naskah Ujian & Kisi-Kisi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="bg-blue-50/70 dark:bg-blue-950/30 p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
            Guru penyusun diimbau menggunakan template resmi di bawah ini agar format naskah soal seragam, rapi saat dicetak massal, dan memenuhi instrumen verifikasi panitia asesmen.
          </div>

          <div className="space-y-4">
            {/* Card 1: Template Naskah Soal */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Template Naskah Soal Ujian Resmi</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.2 rounded font-mono font-bold">
                      .DOC WORD
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Lengkap Kop Surat SMAN 1 Pakem, Tabel Identitas Ujian, Petunjuk Umum, Format Pilihan Ganda & Uraian, serta Lembar Pengesahan.
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <CheckCircle className="w-3 h-3" /> Siap Edit di Word / Docs
                    </span>
                    <span>&bull;</span>
                    <span>Ukuran Kertas A4 Standar</span>
                  </div>
                </div>
              </div>

              <button
                onClick={downloadWordExamTemplate}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer w-full sm:w-auto justify-center"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Template Soal</span>
              </button>
            </div>

            {/* Card 2: Template Kisi-Kisi & Rubrik */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
                  <Table className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Template Kisi-Kisi & Rubrik Penskoran</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 px-2 py-0.2 rounded font-mono font-bold">
                      .DOC WORD
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Format matriks Capaian Pembelajaran (CP), Tujuan Pembelajaran (TP), Indikator Soal, Level Kognitif (L1/L2/L3), dan Pedoman Penskoran.
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <CheckCircle className="w-3 h-3" /> Kurikulum Merdeka
                    </span>
                    <span>&bull;</span>
                    <span>Format Landscape Matriks</span>
                  </div>
                </div>
              </div>

              <button
                onClick={downloadWordRubricTemplate}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer w-full sm:w-auto justify-center"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Kisi-Kisi</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

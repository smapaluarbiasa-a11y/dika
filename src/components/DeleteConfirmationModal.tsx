import React from 'react';
import { AlertTriangle, Trash2, X, FileText } from 'lucide-react';
import { ExamDocument } from '../types/naskah';
import { getFormatBadgeClasses } from '../utils/fileValidation';

interface DeleteConfirmationModalProps {
  document: ExamDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  document,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !document) return null;

  const formatBadge = getFormatBadgeClasses(document.fileFormat);

  const handleConfirm = () => {
    onConfirm(document.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        {/* Header with Warning Icon */}
        <div className="p-6 pb-4 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-900/50">
            <Trash2 className="w-6 h-6" />
          </div>
          <div className="grow">
            <h3
              id="delete-dialog-title"
              className="text-lg font-bold text-slate-900 dark:text-white"
            >
              Hapus Dokumen Naskah?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Tindakan ini permanen dan berkas akan dihapus dari repositori panitia.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Document Card Preview */}
        <div className="px-6 py-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-mono ${formatBadge.bg} ${formatBadge.text}`}
              >
                {formatBadge.label}
              </span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {document.subject}
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
              {document.title}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate font-mono text-[11px]">
                {document.fileName}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 pt-4 flex items-center justify-end gap-3 bg-slate-50/60 dark:bg-slate-850/40 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] transition-all shadow-md shadow-rose-600/20 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Ya, Hapus Dokumen</span>
          </button>
        </div>
      </div>
    </div>
  );
};

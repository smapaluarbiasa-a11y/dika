import React, { useState } from 'react';
import {
  X,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Clock,
  File,
  FileText,
  ShieldCheck,
  Send,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { ExamDocument, VerificationStatus } from '../types/naskah';
import {
  formatFileSize,
  getFormatBadgeClasses,
  getStatusBadgeClasses,
} from '../utils/fileValidation';
import { generateCleanPdfDataUrl } from '../utils/pdfGenerator';
import { PdfViewer } from './PdfViewer';

interface DocumentPreviewModalProps {
  document: ExamDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: VerificationStatus, feedback?: string) => void;
  onDownload: (doc: ExamDocument) => void;
  onDelete?: (id: string) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  isOpen,
  onClose,
  onUpdateStatus,
  onDownload,
  onDelete,
}) => {
  if (!isOpen || !document) return null;

  const [currentStatus, setCurrentStatus] = useState<VerificationStatus>(document.status);
  const [feedback, setFeedback] = useState<string>(document.revisionFeedback || '');
  const [showStatusSuccess, setShowStatusSuccess] = useState<boolean>(false);

  const formatBadge = getFormatBadgeClasses(document.fileFormat);
  const statusBadge = getStatusBadgeClasses(currentStatus);

  const isPdf = document.fileFormat === 'pdf';
  const pdfUrl = isPdf ? generateCleanPdfDataUrl(document) : null;

  const handleStatusChange = (newStatus: VerificationStatus) => {
    setCurrentStatus(newStatus);
    onUpdateStatus(document.id, newStatus, feedback);
    setShowStatusSuccess(true);
    setTimeout(() => setShowStatusSuccess(false), 2500);
  };

  const handlePrint = () => {
    if (pdfUrl) {
      try {
        const parts = pdfUrl.split(',');
        const binary = atob(parts[1] || '');
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        const win = window.open(blobUrl, '_blank');
        win?.focus();
      } catch {
        window.print();
      }
    } else {
      window.print();
    }
  };

  const handleOpenExternal = () => {
    if (pdfUrl) {
      try {
        const parts = pdfUrl.split(',');
        const binary = atob(parts[1] || '');
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      } catch {
        // fallback
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-100 dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-300 dark:border-slate-800 w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Control Bar */}
        <div className="px-5 py-3.5 bg-white dark:bg-slate-855 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border ${formatBadge.badge}`}
            >
              {formatBadge.iconType === 'pdf' ? (
                <File className="w-3.5 h-3.5" />
              ) : (
                <FileText className="w-3.5 h-3.5" />
              )}
              {document.fileFormat.toUpperCase()} &bull; {formatFileSize(document.fileSizeBytes)}
            </span>
            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                {document.title}
              </h3>
              <p className="text-[11px] text-slate-500 truncate">
                {document.subject} &bull; {document.grade}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isPdf && pdfUrl && (
              <button
                onClick={handleOpenExternal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Buka PDF di Tab Baru"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Tab Baru</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Cetak Dokumen"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
            <button
              onClick={() => onDownload(document)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
              title="Unduh Berkas Asli"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh</span>
            </button>
            {onDelete && (
              <button
                onClick={() => onDelete(document.id)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Hapus Dokumen"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Tutup Pratinjau"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Document Content Area */}
        <div className="grow overflow-y-auto p-3 sm:p-5 flex justify-center bg-slate-200/90 dark:bg-slate-950/90">
          {isPdf ? (
            /* Dedicated High-Performance PDF Viewer */
            <PdfViewer
              document={document}
              onDownload={() => onDownload(document)}
            />
          ) : (
            /* Clean Document Content View for Word documents (Without Kop Surat and Without Ketua Panitia) */
            <div className="bg-white text-slate-900 w-full max-w-[760px] p-6 sm:p-10 shadow-2xl rounded-2xl border border-slate-300 min-h-[750px] font-sans leading-relaxed">
              {/* Clean Exam Document Header */}
              <div className="border-b border-slate-200 pb-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-black uppercase bg-blue-100 text-blue-700 border border-blue-200">
                    Microsoft Word ({document.fileFormat.toUpperCase()})
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {document.fileName}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {document.title}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100">
                    Mata Pelajaran: {document.subject}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100">
                    Tingkat: {document.grade}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100">
                    Waktu: {document.durationMinutes} Menit
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100">
                    Jumlah: {document.estimatedQuestions} Butir Soal
                  </span>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl mb-6 text-xs text-slate-700 space-y-1">
                <p className="font-bold uppercase tracking-wider text-slate-800">Petunjuk Pengerjaan:</p>
                <p>1. Periksalah naskah soal dan lembar jawaban sebelum mulai mengerjakan.</p>
                <p>2. Pilihlah salah satu opsi jawaban yang paling tepat.</p>
                <p>3. Dilarang menggunakan alat komunikasi elektronik atau catatan tidak sah selama asesmen.</p>
              </div>

              {/* Exam Questions Content */}
              <div className="space-y-6 text-sm">
                <div className="font-bold border-b border-slate-200 pb-1.5 flex items-center justify-between text-slate-800">
                  <span>Butir Naskah Soal Asesmen</span>
                  <span className="text-xs font-normal text-slate-500">
                    Estimasi {document.estimatedQuestions} Butir
                  </span>
                </div>

                {document.previewContent?.sampleQuestions && document.previewContent.sampleQuestions.length > 0 ? (
                  document.previewContent.sampleQuestions.map((q) => (
                    <div key={q.number} className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-slate-900">{q.number}.</span>
                        <p className="text-slate-800 text-justify leading-relaxed">{q.text}</p>
                      </div>
                      {q.choices && (
                        <div className="pl-6 space-y-1 text-xs text-slate-700">
                          {q.choices.map((c, idx) => (
                            <div key={idx} className="leading-snug">
                              {c}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-slate-900">1.</span>
                      <p className="text-slate-800 text-justify leading-relaxed">
                        Naskah soal {document.subject} {document.grade}. Berdasarkan stimulus pembelajaran, analisis pemecahan masalah kontekstual yang paling tepat adalah...
                      </p>
                    </div>
                    <div className="pl-6 space-y-1 text-xs text-slate-700">
                      <div>A. Opsi jawaban A sesuai dengan indikator pencapaian kompetensi</div>
                      <div>B. Opsi jawaban B mengenai karakteristik materi pokok</div>
                      <div>C. Opsi jawaban C terkait pengujian variabel uji</div>
                      <div>D. Opsi jawaban D sintesis hasil pengukuran</div>
                      <div>E. Opsi jawaban E evaluasi kesimpulan komparatif</div>
                    </div>
                  </div>
                )}

                <div className="p-4 my-6 bg-blue-50/70 border border-blue-200 rounded-xl text-center">
                  <p className="text-xs text-blue-800 font-medium">
                    Berkas asli tersimpan dalam format Word ({document.fileName}). Klik tombol <strong>Unduh</strong> di atas untuk membuka dan mengedit naskah soal lengkap di aplikasi Microsoft Word.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM COMMITTEE VERIFICATION CONTROL BAR */}
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 space-y-3 shrink-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Status Verifikasi Panitia:
              </span>

              <button
                onClick={() => handleStatusChange('Disetujui')}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentStatus === 'Disetujui'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Setujui Naskah</span>
              </button>

              <button
                onClick={() => handleStatusChange('Perlu Revisi')}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentStatus === 'Perlu Revisi'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Perlu Revisi</span>
              </button>

              <button
                onClick={() => handleStatusChange('Menunggu Review')}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentStatus === 'Menunggu Review'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Menunggu Review</span>
              </button>

              {showStatusSuccess && (
                <span className="text-xs text-emerald-600 font-bold animate-in fade-in">
                  &bull; Status tersimpan!
                </span>
              )}
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Diunggah: {new Date(document.uploadedAt).toLocaleString('id-ID')}
            </div>
          </div>

          {/* Revision Feedback Input Field */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Berikan catatan revisi atau instruksi tambahan panitia untuk naskah ini..."
              className="grow text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            <button
              onClick={() => handleStatusChange(currentStatus)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors shrink-0 cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Simpan Catatan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

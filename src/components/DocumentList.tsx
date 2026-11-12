import React, { useState } from 'react';
import {
  ExamDocument,
  FileFormat,
  SubjectName,
} from '../types/naskah';
import {
  Search,
  File,
  FileText,
  Eye,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  Calendar,
  Layers,
  AlertCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  formatFileSize,
  getFormatBadgeClasses,
  getStatusBadgeClasses,
} from '../utils/fileValidation';
import { filterDocuments, OFFICIAL_SUBJECTS } from '../utils/recapLogic';

interface DocumentListProps {
  documents: ExamDocument[];
  onPreview: (doc: ExamDocument) => void;
  onVerify: (doc: ExamDocument) => void;
  onDelete: (id: string) => void;
  onDownload: (doc: ExamDocument) => void;
  onOpenUpload: () => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onPreview,
  onVerify,
  onDelete,
  onDownload,
  onOpenUpload,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedAssessment, setSelectedAssessment] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredDocs = filterDocuments(documents, {
    searchTerm,
    subject: selectedSubject,
    grade: selectedGrade,
    assessmentType: selectedAssessment,
    fileFormat: selectedFormat,
    status: selectedStatus,
  });

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedSubject !== 'all' ||
    selectedGrade !== 'all' ||
    selectedAssessment !== 'all' ||
    selectedFormat !== 'all' ||
    selectedStatus !== 'all';

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSubject('all');
    setSelectedGrade('all');
    setSelectedAssessment('all');
    setSelectedFormat('all');
    setSelectedStatus('all');
  };

  return (
    <div className="space-y-4">
      {/* Modern Filter Bar */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Daftar Dokumen Naskah Soal
              </h3>
              <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                {filteredDocs.length} Berkas
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Repositori dokumen resmi format PDF &amp; Word (.docx / .doc) Panitia Asesmen
            </p>
          </div>

          {/* Quick Clear Filter */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        {/* CONTROLS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          {/* Search Box */}
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari judul, mapel, atau nama file..."
              className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Mapel Filter (21 Subjects) */}
          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            >
              <option value="all">Semua Mata Pelajaran (21 Mapel)</option>
              {OFFICIAL_SUBJECTS.map((s) => (
                <option key={s.subject} value={s.subject}>
                  {s.subject}
                </option>
              ))}
            </select>
          </div>

          {/* Tingkat Kelas */}
          <div>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            >
              <option value="all">Semua Tingkat</option>
              <option value="Kelas X">Kelas X</option>
              <option value="Kelas XI">Kelas XI</option>
              <option value="Kelas XII">Kelas XII</option>
            </select>
          </div>

          {/* Format Berkas (PDF vs Word) */}
          <div>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
            >
              <option value="all">Semua Format (PDF &amp; Word)</option>
              <option value="pdf">Khusus PDF (.pdf) [Merah]</option>
              <option value="word">Khusus Word (.docx / .doc) [Biru]</option>
            </select>
          </div>

          {/* Status Panitia */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            >
              <option value="all">Semua Status</option>
              <option value="Disetujui">Disetujui</option>
              <option value="Menunggu Review">Menunggu Review</option>
              <option value="Perlu Revisi">Perlu Revisi</option>
            </select>
          </div>
        </div>
      </div>

      {/* DOCUMENT CARDS GRID */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Tidak Ada Dokumen yang Ditemukan
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Tidak ada naskah soal yang cocok dengan filter yang dipilih. Silakan reset filter atau unggah naskah baru.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-2">
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
            >
              Reset Filter
            </button>
            <button
              onClick={onOpenUpload}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Unggah Naskah Soal
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((doc) => {
            const formatBadge = getFormatBadgeClasses(doc.fileFormat);
            const statusBadge = getStatusBadgeClasses(doc.status);

            return (
              <div
                key={doc.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-5 shadow-xs hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  {/* Top Badges Row */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {/* Format Badge: Red for PDF, Blue for Word */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black shadow-2xs border ${formatBadge.bg} ${formatBadge.text} ${formatBadge.border}`}
                    >
                      {formatBadge.iconType === 'pdf' ? (
                        <File className="w-3.5 h-3.5" />
                      ) : (
                        <FileText className="w-3.5 h-3.5" />
                      )}
                      <span>{doc.fileFormat.toUpperCase()}</span>
                      <span className="opacity-40">&bull;</span>
                      <span className="font-semibold">{formatFileSize(doc.fileSizeBytes)}</span>
                    </span>

                    {/* Verification Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
                      {doc.status}
                    </span>
                  </div>

                  {/* Subject Chip */}
                  <div className="mb-2">
                    <span className="inline-block text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-md border border-indigo-200/60 dark:border-indigo-800/60 uppercase tracking-wide">
                      {doc.subject}
                    </span>
                  </div>

                  {/* Document Title */}
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                    {doc.title}
                  </h4>

                  {/* Original file name */}
                  <div className="text-[11px] text-slate-500 font-mono mt-1.5 break-all flex items-center gap-1">
                    <span className="text-slate-400 font-sans">Berkas:</span> {doc.fileName}
                  </div>

                  {/* Grade & Assessment pills */}
                  <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium px-2.5 py-1 rounded-lg">
                      {doc.grade}
                    </span>
                    <span className="bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 font-medium px-2.5 py-1 rounded-lg border border-amber-200/50">
                      {doc.assessmentType}
                    </span>
                    <span className="text-slate-500 text-[11px] flex items-center gap-1 ml-auto">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{doc.durationMinutes} Menit &bull; {doc.estimatedQuestions} Butir</span>
                    </span>
                  </div>

                  {/* Upload Date & Verification Info */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Diunggah {new Date(doc.uploadedAt).toLocaleDateString('id-ID')}</span>
                    </div>

                    {doc.status === 'Disetujui' && doc.verifiedBy && (
                      <div className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Terverifikasi</span>
                      </div>
                    )}
                  </div>

                  {/* Revision feedback note */}
                  {doc.status === 'Perlu Revisi' && doc.revisionFeedback && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200">
                      <div className="flex items-center gap-1.5 font-bold mb-0.5 text-amber-800 dark:text-amber-300">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Catatan Revisi Panitia:</span>
                      </div>
                      <p className="italic leading-relaxed">{doc.revisionFeedback}</p>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons Bar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Preview Button */}
                    <button
                      onClick={() => onPreview(doc)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/80 dark:border-blue-800 transition-colors cursor-pointer"
                      title="Lihat Pratinjau Naskah Soal"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Lihat Berkas</span>
                    </button>

                    {/* Download Button */}
                    <button
                      onClick={() => onDownload(doc)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      title="Unduh Berkas Asli"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>Unduh</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Verify Status Button */}
                    <button
                      onClick={() => onVerify(doc)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 border border-indigo-200/80 dark:border-indigo-800 transition-colors cursor-pointer"
                      title="Ubah Status Verifikasi"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Verifikasi</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => onDelete(doc.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title="Hapus Dokumen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

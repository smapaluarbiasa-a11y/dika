import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileCheck2,
  AlertCircle,
  FileText,
  File,
  CheckCircle,
  Sparkles,
  Layers,
} from 'lucide-react';
import {
  AssessmentType,
  ExamDocument,
  FileFormat,
  GradeLevel,
  SubjectName,
} from '../types/naskah';
import {
  validateDocumentFile,
  formatFileSize,
  getFormatBadgeClasses,
} from '../utils/fileValidation';
import { OFFICIAL_SUBJECTS } from '../utils/recapLogic';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDocument: (doc: ExamDocument) => void;
  initialSubject?: SubjectName;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onAddDocument,
  initialSubject,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileFormat, setFileFormat] = useState<FileFormat | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Form Fields
  const [subject, setSubject] = useState<SubjectName>(initialSubject || 'BIOLOGI');
  const [grade, setGrade] = useState<GradeLevel>('Kelas X');
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('ASAS');
  const [title, setTitle] = useState<string>(
    `Naskah Soal ${subject} - 2026/2027`
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(90);
  const [estimatedQuestions, setEstimatedQuestions] = useState<number>(40);
  const [committeeNotes, setCommitteeNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubjectChange = (newSub: SubjectName) => {
    setSubject(newSub);
    setTitle(`Naskah Soal ${newSub} - ${assessmentType} 2026/2027`);
  };

  const handleAssessmentChange = (newAss: AssessmentType) => {
    setAssessmentType(newAss);
    setTitle(`Naskah Soal ${subject} - ${newAss} 2026/2027`);
  };

  const processFile = (file: File) => {
    setFileError(null);
    const validation = validateDocumentFile(file);
    if (!validation.isValid) {
      setSelectedFile(null);
      setFileFormat(null);
      setFileError(validation.errorMessage || 'Format berkas tidak diizinkan.');
      return;
    }

    setSelectedFile(file);
    setFileFormat(validation.format!);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !fileFormat) {
      setFileError(
        'Pilih atau seret berkas naskah soal berformat PDF (.pdf) atau Word (.docx / .doc) terlebih dahulu.'
      );
      return;
    }

    if (!title.trim()) {
      alert('Judul naskah soal wajib diisi.');
      return;
    }

    setIsSubmitting(true);

    const reader = new FileReader();
    reader.onload = () => {
      const fileDataUrl = reader.result as string;
      const newDoc: ExamDocument = {
        id: `doc-${Date.now()}`,
        title: title.trim(),
        subject,
        grade,
        assessmentType,
        durationMinutes: Number(durationMinutes) || 90,
        estimatedQuestions: Number(estimatedQuestions) || 40,
        committeeNotes: committeeNotes.trim(),
        fileFormat,
        fileName: selectedFile.name,
        fileSizeBytes: selectedFile.size,
        uploadedAt: new Date().toISOString(),
        status: 'Menunggu Review',
        fileDataUrl,
        previewContent: {
          subject,
          grade,
          academicYear: '2026/2027',
          semester: 'Ganjil',
          timeAllocation: `${durationMinutes} Menit`,
          instructions: [
            'Periksalah kelengkapan berkas naskah soal sebelum mulai mengerjakan.',
            'Isikan identitas pada lembar jawaban sesuai dengan nomor peserta ujian.',
            'Pilihlah salah satu opsi jawaban yang paling tepat.',
            'Dilarang melakukan kecurangan dalam bentuk apapun.',
          ],
          sampleQuestions: [
            {
              number: 1,
              text: `Contoh butir stimulus naskah soal asesmen ${subject} (${grade}). Perhatikan teks dan data berikut untuk menyelesaikan soal nomor 1 sampai 3.`,
              choices: [
                'A. Pilihan jawaban alternatif pertama',
                'B. Pilihan jawaban alternatif kedua',
                'C. Pilihan jawaban alternatif ketiga',
                'D. Pilihan jawaban alternatif keempat',
                'E. Pilihan jawaban alternatif kelima',
              ],
            },
          ],
        },
      };

      onAddDocument(newDoc);
      setIsSubmitting(false);
      onClose();
    };

    reader.onerror = () => {
      setIsSubmitting(false);
      setFileError('Gagal membaca file dari penyimpanan lokal.');
    };

    reader.readAsDataURL(selectedFile);
  };

  if (!isOpen) return null;

  const badgeStyle = fileFormat ? getFormatBadgeClasses(fileFormat) : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-linear-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Unggah Dokumen Naskah Soal
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Khusus berkas naskah format <strong>PDF (.pdf)</strong> dan <strong>Word (.docx / .doc)</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
          {/* DRAG AND DROP ZONE */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Berkas Naskah Soal <span className="text-rose-500">*</span>
            </label>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-7 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-4 ring-blue-500/10 scale-[1.01]'
                  : selectedFile
                  ? 'border-emerald-500/60 bg-emerald-50/40 dark:bg-emerald-950/20'
                  : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-blue-50/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleInputChange}
                className="hidden"
              />

              {selectedFile && badgeStyle ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs shadow-xs border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                    >
                      {fileFormat?.toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white text-sm break-all">
                          {selectedFile.name}
                        </span>
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Ukuran: {formatFileSize(selectedFile.size)} &bull; Format valid terverifikasi
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 underline cursor-pointer shrink-0"
                  >
                    Ganti Berkas
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-linear-to-tr from-blue-500/10 to-indigo-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Tarik &amp; letakkan file naskah soal di sini, atau{' '}
                      <span className="text-blue-600 dark:text-blue-400 font-bold underline">pilih berkas</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Sistem ketat hanya menerima file berformat <strong className="text-rose-600 dark:text-rose-400">.pdf</strong> dan{' '}
                      <strong className="text-blue-600 dark:text-blue-400">.docx / .doc</strong> (Maksimal 25 MB)
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-1.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900/60">
                      <File className="w-3 h-3 text-rose-600" /> PDF (.pdf)
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900/60">
                      <FileText className="w-3 h-3 text-blue-600" /> Word (.docx / .doc)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {fileError && (
              <div className="mt-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <strong>Format Berkas Ditolak:</strong> {fileError}
                </div>
              </div>
            )}
          </div>

          {/* METADATA FORM */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
              <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
              Identitas Naskah Soal
            </h3>

            {/* Judul Naskah */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Judul Naskah Soal <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Naskah Soal Biologi 2026/2027"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden transition-all"
              />
            </div>

            {/* Mata Pelajaran (21 subjects) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Mata Pelajaran (21 Mapel) <span className="text-rose-500">*</span>
              </label>
              <select
                value={subject}
                onChange={(e) => handleSubjectChange(e.target.value as SubjectName)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden font-semibold"
              >
                {OFFICIAL_SUBJECTS.map((s) => (
                  <option key={s.subject} value={s.subject}>
                    {s.subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Row: Tingkat Kelas & Jenis Asesmen */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tingkat Kelas <span className="text-rose-500">*</span>
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as GradeLevel)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="Kelas X">Kelas X</option>
                  <option value="Kelas XI">Kelas XI</option>
                  <option value="Kelas XII">Kelas XII</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Jenis Asesmen <span className="text-rose-500">*</span>
                </label>
                <select
                  value={assessmentType}
                  onChange={(e) => handleAssessmentChange(e.target.value as AssessmentType)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="ASAS">ASAS (Asesmen Sumatif Akhir Semester)</option>
                  <option value="ASTS">ASTS (Asesmen Sumatif Tengah Semester)</option>
                  <option value="Asesmen Sekolah / US">Asesmen Sekolah / US</option>
                  <option value="Formatif">Asesmen Formatif</option>
                </select>
              </div>
            </div>

            {/* Row: Waktu & Jumlah Soal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Alokasi Waktu Pengerjaan (Menit)
                </label>
                <input
                  type="number"
                  min="30"
                  max="240"
                  step="5"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 90)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Estimasi Jumlah Butir Soal
                </label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={estimatedQuestions}
                  onChange={(e) => setEstimatedQuestions(parseInt(e.target.value) || 40)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Catatan Panitia */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Petunjuk Khusus / Catatan Tambahan Panitia
              </label>
              <textarea
                rows={2}
                value={committeeNotes}
                onChange={(e) => setCommitteeNotes(e.target.value)}
                placeholder="Catatan tambahan: butir soal telah dilengkapi diagram warna, kunci jawaban terpisah, dsb."
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedFile}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isSubmitting ? 'Mengunggah...' : 'Simpan & Unggah Berkas'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

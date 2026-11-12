import { FileFormat } from '../types/naskah';

export interface FileValidationResult {
  isValid: boolean;
  format?: FileFormat;
  errorMessage?: string;
  normalizedName?: string;
}

export const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc'] as const;
export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

/**
 * Validates a file strictly against PDF, DOCX, and DOC extensions.
 * Rejects other formats with an explicit Indonesian warning.
 */
export function validateDocumentFile(file: { name: string; size: number }): FileValidationResult {
  if (!file || !file.name) {
    return {
      isValid: false,
      errorMessage: 'Pilih file naskah soal terlebih dahulu.',
    };
  }

  const fileNameLower = file.name.toLowerCase();
  let detectedFormat: FileFormat | undefined;

  if (fileNameLower.endsWith('.pdf')) {
    detectedFormat = 'pdf';
  } else if (fileNameLower.endsWith('.docx')) {
    detectedFormat = 'docx';
  } else if (fileNameLower.endsWith('.doc')) {
    detectedFormat = 'doc';
  } else {
    const extMatch = file.name.match(/\.[0-9a-z]+$/i);
    const rejectedExt = extMatch ? extMatch[0] : 'tidak dikenal';
    return {
      isValid: false,
      errorMessage: `Format berkas (${rejectedExt}) ditolak! Sistem secara ketat hanya menerima dokumen naskah soal berformat PDF (.pdf) dan Microsoft Word (.docx / .doc). Harap konversi berkas Anda sebelum mengunggah.`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      errorMessage: `Ukuran file melebihi batas maksimal 25 MB (Ukuran file Anda: ${formatFileSize(file.size)}).`,
    };
  }

  return {
    isValid: true,
    format: detectedFormat,
    normalizedName: file.name,
  };
}

/**
 * Format bytes to readable string (KB, MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Validates whether email ends with belajar.id domain
 */
export function isValidBelajarId(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();
  return /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.)?belajar\.id$/.test(trimmed);
}

/**
 * Returns visual badge styling for document file formats
 */
export function getFormatBadgeClasses(format: FileFormat): {
  bg: string;
  text: string;
  border: string;
  label: string;
  iconType: 'pdf' | 'word';
  badge: string;
} {
  if (format === 'pdf') {
    return {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-200 dark:border-rose-800',
      label: 'PDF Document',
      iconType: 'pdf',
      badge: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    };
  }
  return {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    label: format === 'docx' ? 'Word (.docx)' : 'Word (.doc)',
    iconType: 'word',
    badge: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  };
}

/**
 * Returns status badge classes
 */
export function getStatusBadgeClasses(status: string): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (status) {
    case 'Disetujui':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-800',
        dot: 'bg-emerald-500',
      };
    case 'Perlu Revisi':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-800',
        dot: 'bg-amber-500',
      };
    case 'Menunggu Review':
    default:
      return {
        bg: 'bg-slate-100 dark:bg-slate-800',
        text: 'text-slate-700 dark:text-slate-300',
        border: 'border-slate-200 dark:border-slate-700',
        dot: 'bg-blue-500',
      };
  }
}

export type FileFormat = 'pdf' | 'docx' | 'doc';

export type SubjectName =
  | 'BAHASA DAN SASTRA INGGRIS'
  | 'MATEMATIKA'
  | 'BAHASA INDONESIA'
  | 'BHS INGGRIS'
  | 'BIOLOGI'
  | 'BS JAWA'
  | 'EKONOMI'
  | 'FISIKA'
  | 'GEOGRAFI'
  | 'KIMIA'
  | 'MATEMATIKA TINGKAT LANJUT/PEMINATAN'
  | 'PEND AGAMA ISLAM'
  | 'PEND AGAMA KATOLIK'
  | 'PEND AGAMA KRISTEN'
  | 'PENJASORKES'
  | 'PKWU'
  | 'PPKN'
  | 'SEJARAH TINGKAT LANJUT/PEMINATAN'
  | 'SEJARAH WAJIB'
  | 'SENI BUDAYA'
  | 'INFORMATIKA';

export type GradeLevel = 'Kelas X' | 'Kelas XI' | 'Kelas XII';

export type AssessmentType = 'ASAS' | 'ASTS' | 'Asesmen Sekolah / US' | 'Formatif';

export type VerificationStatus = 'Disetujui' | 'Menunggu Review' | 'Perlu Revisi';

export interface DocumentPreviewContent {
  subject: string;
  grade: string;
  academicYear: string;
  semester: string;
  timeAllocation: string;
  instructions: string[];
  sampleQuestions: {
    number: number;
    text: string;
    choices?: string[];
  }[];
}

export interface ExamDocument {
  id: string;
  title: string;
  subject: SubjectName;
  grade: GradeLevel;
  assessmentType: AssessmentType;
  durationMinutes: number;
  estimatedQuestions: number;
  committeeNotes?: string;
  revisionFeedback?: string;
  fileFormat: FileFormat;
  fileName: string;
  fileSizeBytes: number;
  uploadedAt: string;
  status: VerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  fileDataUrl?: string; // Data URL for uploaded user file
  previewContent?: DocumentPreviewContent;
}

export interface SubjectMonitoringItem {
  subject: SubjectName;
  hasSubmitted: boolean;
  documentsCount: number;
  latestStatus?: VerificationStatus;
  latestDocumentId?: string;
  format?: FileFormat;
  latestFileName?: string;
}

export interface RecapitulationSummary {
  totalTargetSubjects: number; // 21
  collectedSubjectsCount: number;
  completionPercentage: number;
  totalDocuments: number;
  approvedCount: number;
  pendingCount: number;
  revisionCount: number;
  pdfCount: number;
  wordCount: number;
}

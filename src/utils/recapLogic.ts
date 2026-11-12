import {
  ExamDocument,
  RecapitulationSummary,
  SubjectMonitoringItem,
  SubjectName,
} from '../types/naskah';

export const OFFICIAL_SUBJECTS: {
  subject: SubjectName;
}[] = [
  { subject: 'BAHASA DAN SASTRA INGGRIS' },
  { subject: 'MATEMATIKA' },
  { subject: 'BAHASA INDONESIA' },
  { subject: 'BHS INGGRIS' },
  { subject: 'BIOLOGI' },
  { subject: 'BS JAWA' },
  { subject: 'EKONOMI' },
  { subject: 'FISIKA' },
  { subject: 'GEOGRAFI' },
  { subject: 'KIMIA' },
  { subject: 'MATEMATIKA TINGKAT LANJUT/PEMINATAN' },
  { subject: 'PEND AGAMA ISLAM' },
  { subject: 'PEND AGAMA KATOLIK' },
  { subject: 'PEND AGAMA KRISTEN' },
  { subject: 'PENJASORKES' },
  { subject: 'PKWU' },
  { subject: 'PPKN' },
  { subject: 'SEJARAH TINGKAT LANJUT/PEMINATAN' },
  { subject: 'SEJARAH WAJIB' },
  { subject: 'SENI BUDAYA' },
  { subject: 'INFORMATIKA' },
];

/**
 * Calculates summary statistics for monitoring and progress bars across 21 subjects
 */
export function calculateRecapitulation(documents: ExamDocument[]): RecapitulationSummary {
  const totalTargetSubjects = OFFICIAL_SUBJECTS.length; // 21 subjects

  // Set of subjects that have at least one document submitted
  const submittedSubjects = new Set<SubjectName>();
  documents.forEach((doc) => {
    submittedSubjects.add(doc.subject);
  });

  const collectedSubjectsCount = submittedSubjects.size;
  const completionPercentage = Math.round((collectedSubjectsCount / totalTargetSubjects) * 100);

  let approvedCount = 0;
  let pendingCount = 0;
  let revisionCount = 0;
  let pdfCount = 0;
  let wordCount = 0;

  documents.forEach((doc) => {
    if (doc.status === 'Disetujui') approvedCount++;
    else if (doc.status === 'Perlu Revisi') revisionCount++;
    else pendingCount++;

    if (doc.fileFormat === 'pdf') {
      pdfCount++;
    } else {
      wordCount++;
    }
  });

  return {
    totalTargetSubjects,
    collectedSubjectsCount,
    completionPercentage,
    totalDocuments: documents.length,
    approvedCount,
    pendingCount,
    revisionCount,
    pdfCount,
    wordCount,
  };
}

/**
 * Generates subject-by-subject status for the 21 official school subjects
 */
export function getSubjectMonitoringList(documents: ExamDocument[]): SubjectMonitoringItem[] {
  return OFFICIAL_SUBJECTS.map((item) => {
    const subjectDocs = documents.filter((d) => d.subject === item.subject);
    const hasSubmitted = subjectDocs.length > 0;

    let latestStatus = undefined;
    let latestDocId = undefined;
    let format = undefined;
    let latestFileName = undefined;

    if (hasSubmitted) {
      const sorted = [...subjectDocs].sort(
        (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );
      const latest = sorted[0];
      latestStatus = latest.status;
      latestDocId = latest.id;
      format = latest.fileFormat;
      latestFileName = latest.fileName;
    }

    return {
      subject: item.subject,
      hasSubmitted,
      documentsCount: subjectDocs.length,
      latestStatus,
      latestDocumentId: latestDocId,
      format,
      latestFileName,
    };
  });
}

/**
 * Filters and searches documents according to user criteria
 */
export function filterDocuments(
  documents: ExamDocument[],
  criteria: {
    searchTerm?: string;
    subject?: string;
    grade?: string;
    assessmentType?: string;
    fileFormat?: string; // 'all' | 'pdf' | 'word'
    status?: string;
  }
): ExamDocument[] {
  return documents.filter((doc) => {
    // Search term check
    if (criteria.searchTerm && criteria.searchTerm.trim() !== '') {
      const term = criteria.searchTerm.toLowerCase().trim();
      const matchTitle = doc.title.toLowerCase().includes(term);
      const matchSubject = doc.subject.toLowerCase().includes(term);
      const matchFileName = doc.fileName.toLowerCase().includes(term);
      if (!matchTitle && !matchSubject && !matchFileName) {
        return false;
      }
    }

    // Subject filter
    if (criteria.subject && criteria.subject !== 'all' && doc.subject !== criteria.subject) {
      return false;
    }

    // Grade filter
    if (criteria.grade && criteria.grade !== 'all' && doc.grade !== criteria.grade) {
      return false;
    }

    // Assessment type filter
    if (
      criteria.assessmentType &&
      criteria.assessmentType !== 'all' &&
      doc.assessmentType !== criteria.assessmentType
    ) {
      return false;
    }

    // Format filter
    if (criteria.fileFormat && criteria.fileFormat !== 'all') {
      if (criteria.fileFormat === 'pdf' && doc.fileFormat !== 'pdf') {
        return false;
      }
      if (criteria.fileFormat === 'word' && doc.fileFormat === 'pdf') {
        return false;
      }
    }

    // Status filter
    if (criteria.status && criteria.status !== 'all' && doc.status !== criteria.status) {
      return false;
    }

    return true;
  });
}

/**
 * Generate CSV string with UTF-8 BOM for Microsoft Excel compatibility
 */
export function generateRecapitulationCSV(documents: ExamDocument[]): string {
  const headers = [
    'No',
    'Judul Naskah Soal',
    'Mata Pelajaran',
    'Tingkat Kelas',
    'Jenis Asesmen',
    'Alokasi Waktu (Menit)',
    'Jumlah Butir Soal',
    'Format Berkas',
    'Nama Berkas',
    'Ukuran Berkas (Bytes)',
    'Tanggal Unggah',
    'Status Verifikasi',
    'Catatan Revisi Panitia',
  ];

  const escapeCsv = (str: string | number | undefined) => {
    if (str === undefined || str === null) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = documents.map((doc, idx) => [
    idx + 1,
    escapeCsv(doc.title),
    escapeCsv(doc.subject),
    escapeCsv(doc.grade),
    escapeCsv(doc.assessmentType),
    doc.durationMinutes,
    doc.estimatedQuestions,
    doc.fileFormat.toUpperCase(),
    escapeCsv(doc.fileName),
    doc.fileSizeBytes,
    escapeCsv(new Date(doc.uploadedAt).toLocaleString('id-ID')),
    escapeCsv(doc.status),
    escapeCsv(doc.revisionFeedback || '-'),
  ]);

  return (
    '\uFEFF' +
    [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n')
  );
}

/**
 * Generates Excel-compatible HTML Spreadsheet (.xls / .xlsx openable directly)
 */
export function generateRecapExcelXML(documents: ExamDocument[]): string {
  const recap = calculateRecapitulation(documents);
  const rows = documents
    .map(
      (doc, i) => `
    <tr>
      <td style="text-align: center;">${i + 1}</td>
      <td>${doc.title}</td>
      <td><strong>${doc.subject}</strong></td>
      <td>${doc.grade}</td>
      <td>${doc.assessmentType}</td>
      <td style="text-align: center;">${doc.durationMinutes} Menit</td>
      <td style="text-align: center;">${doc.estimatedQuestions} Butir</td>
      <td style="text-align: center; font-weight: bold; color: ${doc.fileFormat === 'pdf' ? '#e11d48' : '#2563eb'};">${doc.fileFormat.toUpperCase()}</td>
      <td>${doc.fileName}</td>
      <td>${new Date(doc.uploadedAt).toLocaleDateString('id-ID')}</td>
      <td style="text-align: center; font-weight: bold; background-color: ${
        doc.status === 'Disetujui'
          ? '#d1fae5'
          : doc.status === 'Perlu Revisi'
          ? '#fef3c7'
          : '#e0f2fe'
      };">${doc.status}</td>
      <td>${doc.revisionFeedback || '-'}</td>
    </tr>`
    )
    .join('');

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Rekapitulasi Naskah Soal</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
      <style>
        table { border-collapse: collapse; width: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11pt; }
        th { background-color: #0f172a; color: #ffffff; padding: 10px; border: 1px solid #334155; font-weight: bold; }
        td { padding: 8px; border: 1px solid #e2e8f0; }
        .kop-sekolah { font-size: 16pt; font-weight: bold; text-align: center; color: #0f172a; }
        .subkop { font-size: 11pt; text-align: center; color: #475569; }
      </style>
    </head>
    <body>
      <div class="kop-sekolah">REPOSITORI NASKAH SOAL UJIAN SEKOLAH</div>
      <div class="subkop">Laporan Monitoring 21 Mata Pelajaran (Ketercapaian: ${recap.collectedSubjectsCount}/${recap.totalTargetSubjects} Mapel - ${recap.completionPercentage}%)</div>
      <br/>
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Judul Naskah Soal</th>
            <th>Mata Pelajaran</th>
            <th>Tingkat Kelas</th>
            <th>Jenis Asesmen</th>
            <th>Alokasi Waktu</th>
            <th>Jumlah Soal</th>
            <th>Format</th>
            <th>Nama Berkas</th>
            <th>Tanggal Unggah</th>
            <th>Status Panitia</th>
            <th>Catatan Revisi</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </body>
    </html>
  `;
}

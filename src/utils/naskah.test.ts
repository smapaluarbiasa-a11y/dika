import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateDocumentFile,
  formatFileSize,
  getFormatBadgeClasses,
} from './fileValidation';
import {
  calculateRecapitulation,
  filterDocuments,
  getSubjectMonitoringList,
  generateRecapitulationCSV,
  OFFICIAL_SUBJECTS,
} from './recapLogic';
import { ExamDocument } from '../types/naskah';

test('fileValidation: accepts valid PDF, DOCX, and DOC files', () => {
  const pdfRes = validateDocumentFile({ name: 'Naskah_BIOLOGI_KelasX.pdf', size: 1024 * 500 });
  assert.equal(pdfRes.isValid, true);
  assert.equal(pdfRes.format, 'pdf');

  const docxRes = validateDocumentFile({ name: 'Soal_FISIKA_ASAS.docx', size: 1024 * 800 });
  assert.equal(docxRes.isValid, true);
  assert.equal(docxRes.format, 'docx');

  const docRes = validateDocumentFile({ name: 'KIMIA_Susulan.doc', size: 1024 * 300 });
  assert.equal(docRes.isValid, true);
  assert.equal(docRes.format, 'doc');
});

test('fileValidation: rejects invalid formats like images, spreadsheets, executables', () => {
  const imgRes = validateDocumentFile({ name: 'soal.jpg', size: 50000 });
  assert.equal(imgRes.isValid, false);
  assert.match(imgRes.errorMessage || '', /Format berkas/);

  const exeRes = validateDocumentFile({ name: 'ujian.exe', size: 50000 });
  assert.equal(exeRes.isValid, false);
});

test('fileValidation: rejects files larger than 25MB', () => {
  const hugeRes = validateDocumentFile({ name: 'naskah_besar.pdf', size: 26 * 1024 * 1024 });
  assert.equal(hugeRes.isValid, false);
  assert.match(hugeRes.errorMessage || '', /melebihi batas maksimal/);
});

test('fileValidation: formats file size properly', () => {
  assert.equal(formatFileSize(0), '0 B');
  assert.equal(formatFileSize(1024), '1 KB');
  assert.equal(formatFileSize(2.5 * 1024 * 1024), '2.5 MB');
});

test('recapLogic: verifies 21 official subjects and summary computation', () => {
  assert.equal(OFFICIAL_SUBJECTS.length, 21);

  // Check specific subjects requested
  const subjectNames = OFFICIAL_SUBJECTS.map((s) => s.subject);
  assert.ok(subjectNames.includes('BAHASA DAN SASTRA INGGRIS'));
  assert.ok(subjectNames.includes('MATEMATIKA'));
  assert.ok(subjectNames.includes('BAHASA INDONESIA'));
  assert.ok(subjectNames.includes('BHS INGGRIS'));
  assert.ok(subjectNames.includes('BIOLOGI'));
  assert.ok(subjectNames.includes('BS JAWA'));
  assert.ok(subjectNames.includes('EKONOMI'));
  assert.ok(subjectNames.includes('FISIKA'));
  assert.ok(subjectNames.includes('GEOGRAFI'));
  assert.ok(subjectNames.includes('KIMIA'));
  assert.ok(subjectNames.includes('MATEMATIKA TINGKAT LANJUT/PEMINATAN'));
  assert.ok(subjectNames.includes('PEND AGAMA ISLAM'));
  assert.ok(subjectNames.includes('PEND AGAMA KATOLIK'));
  assert.ok(subjectNames.includes('PEND AGAMA KRISTEN'));
  assert.ok(subjectNames.includes('PENJASORKES'));
  assert.ok(subjectNames.includes('PKWU'));
  assert.ok(subjectNames.includes('PPKN'));
  assert.ok(subjectNames.includes('SEJARAH TINGKAT LANJUT/PEMINATAN'));
  assert.ok(subjectNames.includes('SEJARAH WAJIB'));
  assert.ok(subjectNames.includes('SENI BUDAYA'));
  assert.ok(subjectNames.includes('INFORMATIKA'));

  const mockDocs: ExamDocument[] = [
    {
      id: 'doc-1',
      title: 'Naskah Biologi Kelas X',
      subject: 'BIOLOGI',
      grade: 'Kelas X',
      assessmentType: 'ASAS',
      durationMinutes: 90,
      estimatedQuestions: 40,
      fileFormat: 'pdf',
      fileName: 'Biologi_Kelas_X.pdf',
      fileSizeBytes: 1024 * 400,
      uploadedAt: '2026-11-01T08:00:00Z',
      status: 'Disetujui',
    },
    {
      id: 'doc-2',
      title: 'Naskah Fisika Kelas XI',
      subject: 'FISIKA',
      grade: 'Kelas XI',
      assessmentType: 'ASAS',
      durationMinutes: 90,
      estimatedQuestions: 35,
      fileFormat: 'docx',
      fileName: 'Fisika_Kelas_XI.docx',
      fileSizeBytes: 1024 * 600,
      uploadedAt: '2026-11-02T09:00:00Z',
      status: 'Perlu Revisi',
      revisionFeedback: 'Perbaiki kontras gambar',
    },
  ];

  const recap = calculateRecapitulation(mockDocs);
  assert.equal(recap.totalTargetSubjects, 21);
  assert.equal(recap.collectedSubjectsCount, 2);
  assert.equal(recap.completionPercentage, Math.round((2 / 21) * 100)); // 10%
  assert.equal(recap.totalDocuments, 2);
  assert.equal(recap.approvedCount, 1);
  assert.equal(recap.revisionCount, 1);
  assert.equal(recap.pendingCount, 0);

  const monitoring = getSubjectMonitoringList(mockDocs);
  assert.equal(monitoring.length, 21);
  const bio = monitoring.find((m) => m.subject === 'BIOLOGI');
  assert.equal(bio?.hasSubmitted, true);
  const pkwu = monitoring.find((m) => m.subject === 'PKWU');
  assert.equal(pkwu?.hasSubmitted, false);
});

test('recapLogic: filters documents by query, format, and status', () => {
  const docs: ExamDocument[] = [
    {
      id: '1',
      title: 'Soal Matematika',
      subject: 'MATEMATIKA',
      grade: 'Kelas X',
      assessmentType: 'ASAS',
      durationMinutes: 90,
      estimatedQuestions: 40,
      fileFormat: 'pdf',
      fileName: 'matematika.pdf',
      fileSizeBytes: 1000,
      uploadedAt: '2026-11-01',
      status: 'Disetujui',
    },
    {
      id: '2',
      title: 'Soal Fisika',
      subject: 'FISIKA',
      grade: 'Kelas XI',
      assessmentType: 'ASTS',
      durationMinutes: 90,
      estimatedQuestions: 35,
      fileFormat: 'docx',
      fileName: 'fisika.docx',
      fileSizeBytes: 2000,
      uploadedAt: '2026-11-02',
      status: 'Menunggu Review',
    },
  ];

  assert.equal(filterDocuments(docs, { searchTerm: 'matematika' }).length, 1);
  assert.equal(filterDocuments(docs, { fileFormat: 'pdf' }).length, 1);
  assert.equal(filterDocuments(docs, { fileFormat: 'word' }).length, 1);
  assert.equal(filterDocuments(docs, { status: 'Disetujui' }).length, 1);
});

test('recapLogic: generates valid CSV with BOM', () => {
  const docs: ExamDocument[] = [
    {
      id: '1',
      title: 'Soal Kimia Ujian',
      subject: 'KIMIA',
      grade: 'Kelas X',
      assessmentType: 'ASAS',
      durationMinutes: 90,
      estimatedQuestions: 40,
      fileFormat: 'docx',
      fileName: 'kimia.docx',
      fileSizeBytes: 1500,
      uploadedAt: '2026-11-01T00:00:00Z',
      status: 'Disetujui',
    },
  ];

  const csv = generateRecapitulationCSV(docs);
  assert.equal(csv.startsWith('\uFEFF'), true);
  assert.match(csv, /Soal Kimia Ujian/);
  assert.match(csv, /KIMIA/);
  assert.match(csv, /Disetujui/);
});

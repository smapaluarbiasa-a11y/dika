import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { RecapOverview } from './components/RecapOverview';
import { DocumentList } from './components/DocumentList';
import { SubjectMonitoringTable } from './components/SubjectMonitoringTable';
import { UploadModal } from './components/UploadModal';
import { DocumentPreviewModal } from './components/DocumentPreviewModal';
import { VerificationModal } from './components/VerificationModal';
import { OfficialTemplatesModal } from './components/OfficialTemplatesModal';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { AppsScriptModal } from './components/AppsScriptModal';
import { INITIAL_DOCUMENTS } from './data/initialData';
import {
  ExamDocument,
  GradeLevel,
  SubjectName,
  VerificationStatus,
} from './types/naskah';
import {
  calculateRecapitulation,
  generateRecapitulationCSV,
  generateRecapExcelXML,
  getSubjectMonitoringList,
} from './utils/recapLogic';
import { downloadFile } from './utils/templates';
import {
  FileText,
  Table,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  const [documents, setDocuments] = useState<ExamDocument[]>(() => {
    try {
      const saved = localStorage.getItem('sim_naskah_documents_v2');
      if (saved) {
        const parsed: ExamDocument[] = JSON.parse(saved);
        return parsed.map((doc) => {
          let cleanGrade: GradeLevel = 'Kelas X';
          const gStr = String(doc.grade);
          if (gStr.includes('Kelas XII')) cleanGrade = 'Kelas XII';
          else if (gStr.includes('Kelas XI')) cleanGrade = 'Kelas XI';
          else cleanGrade = 'Kelas X';
          return {
            ...doc,
            grade: cleanGrade,
            title: doc.title.replace(/\s*Fase\s*[EF]/gi, ''),
          };
        });
      }
    } catch {
      // Fallback
    }
    return INITIAL_DOCUMENTS;
  });

  const [activeTab, setActiveTab] = useState<'documents' | 'monitoring'>('documents');

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [uploadSubject, setUploadSubject] = useState<SubjectName | undefined>(undefined);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState<boolean>(false);
  const [isAppsScriptOpen, setIsAppsScriptOpen] = useState<boolean>(false);
  const [previewDocument, setPreviewDocument] = useState<ExamDocument | null>(null);
  const [verifyingDocument, setVerifyingDocument] = useState<ExamDocument | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<ExamDocument | null>(null);

  // Google Apps Script Web App Integration
  const [appsScriptUrl, setAppsScriptUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('sim_naskah_apps_script_url') || '';
    } catch {
      return '';
    }
  });

  const handleSaveAppsScriptUrl = (url: string) => {
    setAppsScriptUrl(url);
    try {
      localStorage.setItem('sim_naskah_apps_script_url', url);
    } catch {
      // quota
    }
  };

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    try {
      localStorage.setItem('sim_naskah_documents_v2', JSON.stringify(documents));
    } catch {
      // Handle quota if needed
    }
  }, [documents]);

  const recapSummary = calculateRecapitulation(documents);
  const monitoringList = getSubjectMonitoringList(documents);

  const handleAddDocument = (newDoc: ExamDocument) => {
    setDocuments((prev) => [newDoc, ...prev]);

    // Asynchronously sync to Google Apps Script / Google Sheets if configured
    if (appsScriptUrl && appsScriptUrl.startsWith('http')) {
      try {
        let fileBase64 = '';
        if (newDoc.fileDataUrl && newDoc.fileDataUrl.includes(',')) {
          fileBase64 = newDoc.fileDataUrl.split(',')[1];
        }

        fetch(appsScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: newDoc.id,
            title: newDoc.title,
            subject: newDoc.subject,
            grade: newDoc.grade,
            assessmentType: newDoc.assessmentType,
            durationMinutes: newDoc.durationMinutes,
            estimatedQuestions: newDoc.estimatedQuestions,
            fileName: newDoc.fileName,
            fileFormat: newDoc.fileFormat,
            fileBase64,
            uploadedAt: newDoc.uploadedAt,
            status: newDoc.status,
            committeeNotes: newDoc.committeeNotes,
          }),
        }).catch((err) => console.warn('Sync to Google Apps Script warning:', err));

        showToast(`Naskah soal "${newDoc.title}" berhasil diunggah & disinkronkan ke Google Sheets!`);
        return;
      } catch (err) {
        console.warn('Sync error:', err);
      }
    }

    showToast(`Naskah soal "${newDoc.title}" berhasil diunggah.`);
  };

  const handleUpdateStatus = (
    id: string,
    status: VerificationStatus,
    feedback?: string
  ) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === id) {
          return {
            ...doc,
            status,
            revisionFeedback: feedback ?? doc.revisionFeedback,
            verifiedBy: 'Panitia Kurikulum & Asesmen',
            verifiedAt: new Date().toISOString(),
          };
        }
        return doc;
      })
    );

    if (previewDocument && previewDocument.id === id) {
      setPreviewDocument((prev) =>
        prev
          ? {
              ...prev,
              status,
              revisionFeedback: feedback ?? prev.revisionFeedback,
            }
          : null
      );
    }

    showToast(`Status naskah soal berhasil diubah menjadi "${status}".`);
  };

  const handleDeleteRequest = (id: string) => {
    const docToDelete = documents.find((d) => d.id === id);
    if (docToDelete) {
      setDocumentToDelete(docToDelete);
    }
  };

  const handleConfirmDelete = (id: string) => {
    const docToDelete = documents.find((d) => d.id === id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (previewDocument && previewDocument.id === id) {
      setPreviewDocument(null);
    }
    if (docToDelete) {
      showToast(`Dokumen "${docToDelete.title}" berhasil dihapus.`);
    }
  };

  const handleDownloadDocument = (doc: ExamDocument) => {
    if (doc.fileDataUrl) {
      const link = document.createElement('a');
      link.href = doc.fileDataUrl;
      link.download = doc.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Mengunduh berkas "${doc.fileName}"...`);
    } else {
      const sampleText = `DOKUMEN NASKAH SOAL UJIAN
==================================================
Judul: ${doc.title}
Mata Pelajaran: ${doc.subject}
Tingkat Kelas: ${doc.grade}
Jenis Asesmen: ${doc.assessmentType}
Alokasi Waktu: ${doc.durationMinutes} Menit
Jumlah Butir: ${doc.estimatedQuestions} Butir Soal
Status Panitia: ${doc.status}
Catatan Panitia: ${doc.committeeNotes || '-'}
${doc.revisionFeedback ? `Catatan Revisi: ${doc.revisionFeedback}\n` : ''}
Tanggal Unggah: ${new Date(doc.uploadedAt).toLocaleString('id-ID')}
==================================================
Tervalidasi di portal Upload Soal SMAN 1 Pakem.`;

      downloadFile(
        sampleText,
        doc.fileName.endsWith('.pdf') ? doc.fileName : `${doc.fileName}.doc`,
        doc.fileFormat === 'pdf' ? 'application/pdf' : 'application/msword'
      );
      showToast(`Mengunduh berkas "${doc.fileName}"...`);
    }
  };

  const handleExportCsv = () => {
    const csv = generateRecapitulationCSV(documents);
    downloadFile(
      csv,
      `Rekapitulasi_Naskah_Soal_${new Date().toISOString().slice(0, 10)}.csv`,
      'text/csv;charset=utf-8;'
    );
    showToast('Laporan CSV berhasil diunduh.');
  };

  const handleExportExcel = () => {
    const excelXml = generateRecapExcelXML(documents);
    downloadFile(
      excelXml,
      `Rekapitulasi_Naskah_Soal_${new Date().toISOString().slice(0, 10)}.xls`,
      'application/vnd.ms-excel;charset=utf-8;'
    );
    showToast('Laporan Excel berhasil diunduh.');
  };

  const handleOpenUploadForSubject = (subject: SubjectName) => {
    setUploadSubject(subject);
    setIsUploadOpen(true);
  };

  const handlePreviewFromId = (docId: string) => {
    const target = documents.find((d) => d.id === docId);
    if (target) {
      setPreviewDocument(target);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white antialiased">
      {/* Modern Top Header */}
      <Header
        onOpenUpload={() => {
          setUploadSubject(undefined);
          setIsUploadOpen(true);
        }}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenAppsScript={() => setIsAppsScriptOpen(true)}
        onExportExcel={handleExportExcel}
        onExportCsv={handleExportCsv}
        isAppsScriptConnected={!!appsScriptUrl}
      />

      {/* Main Container */}
      <main className="grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 w-full">
        {/* Recapitulation Progress & Metric Cards */}
        <RecapOverview
          summary={recapSummary}
          onExportExcel={handleExportExcel}
          onExportCsv={handleExportCsv}
        />

        {/* Tab Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-850 rounded-2xl self-start">
            <button
              onClick={() => setActiveTab('documents')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'documents'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Daftar Berkas Masuk ({documents.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('monitoring')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'monitoring'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>Monitoring 21 Mata Pelajaran</span>
              <span className="text-[11px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.2 rounded-full font-bold">
                {recapSummary.collectedSubjectsCount}/21
              </span>
            </button>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-2 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>
              Hanya menerima format: <strong className="text-rose-600 font-bold">.pdf</strong> &amp;{' '}
              <strong className="text-blue-600 font-bold">.docx / .doc</strong>
            </span>
          </div>
        </div>

        {/* Tab Views */}
        {activeTab === 'documents' ? (
          <DocumentList
            documents={documents}
            onPreview={(doc) => setPreviewDocument(doc)}
            onVerify={(doc) => setVerifyingDocument(doc)}
            onDelete={handleDeleteRequest}
            onDownload={handleDownloadDocument}
            onOpenUpload={() => {
              setUploadSubject(undefined);
              setIsUploadOpen(true);
            }}
          />
        ) : (
          <SubjectMonitoringTable
            monitoringList={monitoringList}
            onOpenUploadForSubject={handleOpenUploadForSubject}
            onPreviewDocument={handlePreviewFromId}
          />
        )}
      </main>

      {/* Modern Footer */}
      <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <strong className="text-slate-800 dark:text-slate-200">Upload Soal SMAN 1 Pakem</strong>
            <span>&bull;</span>
            <span>SMAN 1 Pakem</span>
            <span>&bull;</span>
            <span>Tahun Ajaran 2026/2027</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span>Khusus Dokumen PDF (.pdf) &amp; Word (.docx / .doc)</span>
            <span>&bull;</span>
            <span>21 Mata Pelajaran Resmi</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onAddDocument={handleAddDocument}
        initialSubject={uploadSubject}
      />

      {/* 2. Document Preview Modal */}
      <DocumentPreviewModal
        document={previewDocument}
        isOpen={!!previewDocument}
        onClose={() => setPreviewDocument(null)}
        onUpdateStatus={handleUpdateStatus}
        onDownload={handleDownloadDocument}
        onDelete={handleDeleteRequest}
      />

      {/* 3. Verification Quick Modal */}
      <VerificationModal
        document={verifyingDocument}
        isOpen={!!verifyingDocument}
        onClose={() => setVerifyingDocument(null)}
        onSave={handleUpdateStatus}
      />

      {/* 4. Official Word Templates Modal */}
      <OfficialTemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
      />

      {/* 5. In-App Delete Confirmation Modal (Reliable iframe-safe modal) */}
      <DeleteConfirmationModal
        document={documentToDelete}
        isOpen={!!documentToDelete}
        onClose={() => setDocumentToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* 6. Google Apps Script & Sheets Database Modal */}
      <AppsScriptModal
        isOpen={isAppsScriptOpen}
        onClose={() => setIsAppsScriptOpen(false)}
        appsScriptUrl={appsScriptUrl}
        onSaveUrl={handleSaveAppsScriptUrl}
      />

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-2xl shadow-2xl border border-slate-800 dark:border-slate-200 flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import {
  X,
  Database,
  Copy,
  Check,
  ExternalLink,
  HelpCircle,
  FileSpreadsheet,
  HardDrive,
  Send,
  Sparkles,
  Info,
} from 'lucide-react';

interface AppsScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  appsScriptUrl: string;
  onSaveUrl: (url: string) => void;
}

export const APPS_SCRIPT_CODE = `/**
 * BACKEND DATABASE SMAN 1 PAKEM (Google Apps Script)
 * ===================================================
 * Tidak membutuhkan file HTML di Apps Script!
 * Cukup simpan kode ini pada file 'Code.gs'.
 * 
 * Database: Google Sheets (mencatat identitas naskah)
 * Storage : Google Drive (menyimpan file PDF / Word)
 */

// Ganti dengan ID Folder Google Drive tempat menyimpan berkas soal (opsional)
// Jika dikosongkan, file akan tersimpan di root Google Drive Anda.
const GOOGLE_DRIVE_FOLDER_ID = ""; 

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    // Jika sheet masih kosong, inisialisasi header
    if (data.length <= 1 && (!data[0] || data[0].length === 0 || data[0][0] === "")) {
      initSpreadsheetHeaders(sheet);
      return createJsonResponse({ status: "success", count: 0, documents: [] });
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    
    const documents = rows.map((row, idx) => ({
      no: idx + 1,
      id: row[0],
      title: row[1],
      subject: row[2],
      grade: row[3],
      duration: row[4],
      questions: row[5],
      fileName: row[6],
      fileFormat: row[7],
      driveUrl: row[8],
      uploadedAt: row[9],
      status: row[10],
      notes: row[11]
    }));
    
    return createJsonResponse({ status: "success", count: documents.length, documents: documents });
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Inisialisasi header jika belum ada
    if (sheet.getLastRow() === 0) {
      initSpreadsheetHeaders(sheet);
    }
    
    const payload = JSON.parse(e.postData.contents);
    
    // 1. TANGANI AKSI HAPUS: Baris di Google Sheets & Berkas di Drive otomatis ikut terhapus!
    if (payload.action === "delete" || payload.action === "hapus") {
      const data = sheet.getDataRange().getValues();
      let deletedCount = 0;
      
      // Loop dari bawah ke atas agar indeks baris tidak bergeser saat baris dihapus
      for (let i = data.length - 1; i >= 1; i--) {
        const rowId = String(data[i][0] || "").trim();
        const rowTitle = String(data[i][1] || "").trim();
        const rowFileName = String(data[i][6] || "").trim();
        const rowDriveUrl = String(data[i][8] || "").trim();
        
        const isMatch = (payload.id && rowId === String(payload.id).trim()) ||
                        (payload.fileName && rowFileName === String(payload.fileName).trim()) ||
                        (payload.title && rowTitle === String(payload.title).trim());
                        
        if (isMatch) {
          // Hapus berkas dari Google Drive jika ada link
          try {
            if (rowDriveUrl && rowDriveUrl.indexOf("drive.google.com") !== -1) {
              const match = rowDriveUrl.match(/[-\\w]{25,}/);
              if (match && match[0]) {
                DriveApp.getFileById(match[0]).setTrashed(true);
              }
            }
          } catch (driveErr) {
            // Abaikan jika file drive sudah tidak ada
          }
          
          sheet.deleteRow(i + 1);
          deletedCount++;
        }
      }
      
      return createJsonResponse({
        status: "success",
        action: "delete",
        deletedCount: deletedCount,
        message: deletedCount > 0 
          ? "Baris naskah soal dan file di Google Drive berhasil dihapus." 
          : "Naskah soal tidak ditemukan di baris Google Sheets."
      });
    }
    
    // 2. TANGANI AKSI UNGGAH / TAMBAH NASKAH BARU
    // Simpan file ke Google Drive jika ada file data base64
    let fileDriveUrl = "-";
    if (payload.fileBase64 && payload.fileName) {
      try {
        const contentType = payload.fileFormat === "pdf" 
          ? "application/pdf" 
          : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        
        const decodedBytes = Utilities.base64Decode(payload.fileBase64);
        const blob = Utilities.newBlob(decodedBytes, contentType, payload.fileName);
        
        let targetFolder;
        if (GOOGLE_DRIVE_FOLDER_ID && GOOGLE_DRIVE_FOLDER_ID.trim() !== "") {
          targetFolder = DriveApp.getFolderById(GOOGLE_DRIVE_FOLDER_ID.trim());
        } else {
          targetFolder = DriveApp.getRootFolder();
        }
        
        const createdFile = targetFolder.createFile(blob);
        createdFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        fileDriveUrl = createdFile.getUrl();
      } catch (driveErr) {
        fileDriveUrl = "Gagal simpan ke Drive: " + driveErr.toString();
      }
    }
    
    // Tambahkan baris baru ke Spreadsheet
    const newRow = [
      payload.id || "doc-" + new Date().getTime(),
      payload.title || "-",
      payload.subject || "-",
      payload.grade || "-",
      payload.durationMinutes ? payload.durationMinutes + " Menit" : "-",
      payload.estimatedQuestions ? payload.estimatedQuestions + " Butir" : "-",
      payload.fileName || "-",
      payload.fileFormat ? payload.fileFormat.toUpperCase() : "-",
      fileDriveUrl,
      payload.uploadedAt ? new Date(payload.uploadedAt).toLocaleString("id-ID") : new Date().toLocaleString("id-ID"),
      payload.status || "Menunggu Review",
      payload.committeeNotes || "-"
    ];
    
    sheet.appendRow(newRow);
    
    return createJsonResponse({
      status: "success",
      message: "Naskah soal berhasil disimpan ke Google Sheets & Google Drive",
      driveUrl: fileDriveUrl,
      id: payload.id
    });
  } catch (err) {
    return createJsonResponse({
      status: "error",
      message: err.toString()
    });
  }
}

// Inisialisasi format tabel database di Google Sheets
function initSpreadsheetHeaders(sheet) {
  const headers = [
    "ID Dokumen",
    "Judul Naskah Soal",
    "Mata Pelajaran",
    "Tingkat Kelas",
    "Alokasi Waktu",
    "Jumlah Soal",
    "Nama Berkas",
    "Format",
    "Link Google Drive",
    "Waktu Unggah",
    "Status Verifikasi",
    "Catatan Tambahan"
  ];
  sheet.appendRow(headers);
  
  // Format baris judul
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#1e293b");
  headerRange.setFontColor("#ffffff");
  sheet.setFrozenRows(1);
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

export const AppsScriptModal: React.FC<AppsScriptModalProps> = ({
  isOpen,
  onClose,
  appsScriptUrl,
  onSaveUrl,
}) => {
  const [urlInput, setUrlInput] = useState<string>(appsScriptUrl || '');
  const [copied, setCopied] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'explanation' | 'code' | 'setup'>('explanation');

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveUrl(urlInput.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Integrasi Database Google Apps Script &amp; Sheets
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Menghubungkan aplikasi repositori SMAN 1 Pakem dengan Google Sheets &amp; Google Drive
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

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 px-6 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('explanation')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'explanation'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            1. Jawaban &amp; Penjelasan HTML
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'code'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            2. Kode Script Siap Pakai (Code.gs)
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'setup'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            3. Cara Pasang &amp; URL Web App
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-slate-800 dark:text-slate-200 text-sm">
          {activeTab === 'explanation' && (
            <div className="space-y-6">
              {/* Highlight Box: Apakah butuh HTML? */}
              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs font-black">
                  ✓
                </div>
                <div className="space-y-1.5 text-xs sm:text-sm">
                  <h3 className="font-bold text-emerald-900 dark:text-emerald-200 text-base">
                    Apakah butuh HTML di Google Apps Script? Jawabannya: <span className="underline decoration-2">TIDAK BUTUH!</span>
                  </h3>
                  <p className="text-emerald-800 dark:text-emerald-300 leading-relaxed">
                    Jika Anda ingin menjadikan Google Apps Script sebagai <strong>Database / API Backend</strong> untuk aplikasi ini, Anda <strong>cukup membuat 1 file script saja yaitu <code className="bg-emerald-200/60 dark:bg-emerald-900/80 px-1.5 py-0.5 rounded font-mono font-bold">Code.gs</code></strong>.
                  </p>
                </div>
              </div>

              {/* Arsitektur Alur Kerja */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold">
                    1
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Aplikasi Web SMAN 1 Pakem</h4>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    Aplikasi ini bertindak sebagai antarmuka (frontend). Saat guru mengunggah soal (PDF/Word), aplikasi mengirimkan datanya lewat request internet (POST JSON).
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold">
                    2
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Google Apps Script (Code.gs)</h4>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    Berperan sebagai jembatan/API otomatis. Fungsi <code className="font-mono bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">doPost(e)</code> menerima data naskah soal dan berkas tanpa perlu antarmuka HTML.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold">
                    3
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Google Sheets &amp; Drive</h4>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    <strong>Google Sheets</strong> otomatis menyimpan data tabel naskah, dan <strong>Google Drive</strong> menyimpan berkas asli PDF/Word serta menghasilkan link download resmi.
                  </p>
                </div>
              </div>

              {/* Kapan HTML dibutuhkan di Apps Script? */}
              <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/30 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Kapan file HTML dibutuhkan di Apps Script?</span>
                </div>
                <p className="leading-relaxed">
                  File HTML di Apps Script (misalnya <code className="font-mono bg-amber-200/50 dark:bg-amber-900/60 px-1 py-0.5 rounded">Index.html</code>) <strong>hanya dibutuhkan</strong> jika Anda tidak memakai aplikasi web modern React ini, melainkan membuat tampilan form halaman web langsung dari dalam Google Apps Script via <code className="font-mono">HtmlService.createHtmlOutputFromFile()</code>. Karena aplikasi web SMAN 1 Pakem ini sudah dibuat lengkap dan modern, Anda hanya perlu script backend <strong>Code.gs</strong> saja.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setActiveTab('code')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all"
                >
                  <span>Lihat &amp; Salin Kode Script Code.gs</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Kode Google Apps Script (<code className="font-mono text-emerald-600 dark:text-emerald-400">Code.gs</code>)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tempel kode ini ke dalam editor Google Apps Script di spreadsheet Anda.
                  </p>
                </div>
                <button
                  onClick={handleCopyCode}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Berhasil Disalin!' : 'Salin Seluruh Kode'}</span>
                </button>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs text-emerald-300 p-4 max-h-[420px] overflow-y-auto leading-relaxed select-all">
                <pre>{APPS_SCRIPT_CODE}</pre>
              </div>

              <p className="text-xs text-slate-500">
                * Kode di atas sudah otomatis membuat kolom header tabel pada baris pertama spreadsheet, mengonversi file base64 menjadi file di Google Drive, dan mengembalikan respon JSON terstruktur.
              </p>
            </div>
          )}

          {activeTab === 'setup' && (
            <div className="space-y-6">
              {/* Langkah Instalasi */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  Langkah-Langkah Membuat Database di Google Sheets:
                </h3>
                <ol className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 list-decimal pl-5 leading-relaxed">
                  <li>
                    Buka <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline inline-flex items-center gap-0.5">Google Sheets Baru <ExternalLink className="w-3 h-3" /></a>, beri judul file misalnya: <strong>Database Upload Soal SMAN 1 Pakem</strong>.
                  </li>
                  <li>
                    Pada menu atas Google Sheets, klik <strong>Ekstensi (Extensions)</strong> &gt; pilih <strong>Apps Script</strong>.
                  </li>
                  <li>
                    Hapus semua tulisan di file <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">Code.gs</code>, lalu <strong>tempel (paste)</strong> seluruh kode dari Tab 2 tadi.
                  </li>
                  <li>
                    Klik tombol <strong>Terapkan (Deploy)</strong> di pojok kanan atas &gt; pilih <strong>Deployment baru (New deployment)</strong>.
                  </li>
                  <li>
                    Klik ikon roda gigi &gt; pilih jenis <strong>Aplikasi Web (Web App)</strong>.
                  </li>
                  <li>
                    Pada bagian <em>"Siapa yang memiliki akses (Who has access)"</em>: pilih <strong>Siapa saja (Anyone)</strong>. Ini wajib agar aplikasi web ini bisa mengirim naskah soal.
                  </li>
                  <li>
                    Klik <strong>Terapkan</strong>, lalu salin <strong>URL Aplikasi Web</strong> yang berakhiran <code className="font-mono">/exec</code>.
                  </li>
                </ol>
              </div>

              {/* Form Input URL Apps Script */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-4">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-1">
                    Hubungkan URL Google Apps Script ke Aplikasi Ini:
                  </h4>
                  <p className="text-xs text-slate-500">
                    Masukkan URL Web App hasil deployment Anda di bawah ini agar naskah yang diunggah otomatis tersimpan ke Google Sheets &amp; Google Drive Anda:
                  </p>
                </div>

                <form onSubmit={handleSave} className="flex flex-col sm:flex-row items-center gap-2.5">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Simpan Koneksi</span>
                  </button>
                </form>

                {saveSuccess && (
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                    <Check className="w-4 h-4" />
                    <span>URL Web App Google Apps Script berhasil disimpan di peramban ini!</span>
                  </div>
                )}

                {appsScriptUrl && (
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Tersambung ke: <code className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-sm inline-block align-bottom">{appsScriptUrl}</code></span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            SMAN 1 Pakem &bull; Panduan Basis Data Cloud Google Apps Script
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

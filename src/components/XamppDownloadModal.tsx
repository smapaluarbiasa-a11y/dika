import React, { useState } from 'react';
import {
  X,
  Download,
  Server,
  FolderOpen,
  CheckCircle2,
  FileCode2,
  Database,
  AlertCircle,
  Loader2,
  Terminal,
} from 'lucide-react';
import { downloadFile } from '../utils/templates';

interface XamppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_PHP_CONTENT = `<?php
/**
 * Backend PHP Lokal untuk XAMPP (htdocs) - Upload Soal SMAN 1 Pakem
 */
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$USE_MYSQL = false; // Ubah ke true jika ingin memakai MySQL phpMyAdmin (import database.sql dulu)
$DB_HOST = '127.0.0.1';
$DB_NAME = 'db_upload_soal_sman1pakem';
$DB_USER = 'root';
$DB_PASS = '';

$dataDir = __DIR__ . DIRECTORY_SEPARATOR . 'xampp_data';
$docsFile = $dataDir . DIRECTORY_SEPARATOR . 'documents.json';
$configFile = $dataDir . DIRECTORY_SEPARATOR . 'config.json';
if (!is_dir($dataDir)) { @mkdir($dataDir, 0775, true); }

function getPdoConnection($h, $d, $u, $p) {
    return new PDO("mysql:host=$h;dbname=$d;charset=utf8mb4", $u, $p, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
}
function readJsonFile($path, $def) {
    if (!file_exists($path)) return $def;
    $d = json_decode(@file_get_contents($path), true);
    return is_array($d) ? $d : $def;
}
function writeJsonFile($path, $data) {
    @file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

$route = isset($_GET['route']) ? trim($_GET['route'], '/') : '';
$method = isset($_GET['_method']) ? strtoupper($_GET['_method']) : $_SERVER['REQUEST_METHOD'];
$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body)) $body = [];

try {
    if ($route === 'documents' && $method === 'GET') {
        if ($USE_MYSQL) {
            $pdo = getPdoConnection($DB_HOST, $DB_NAME, $DB_USER, $DB_PASS);
            $docs = $pdo->query("SELECT * FROM exam_documents ORDER BY uploadedAt DESC")->fetchAll();
        } else {
            $docs = readJsonFile($docsFile, []);
        }
        echo json_encode(['status' => 'success', 'count' => count($docs), 'documents' => $docs, 'source' => 'xampp-php']);
        exit;
    }
    if ($route === 'documents' && $method === 'POST') {
        $docs = readJsonFile($docsFile, []);
        $filtered = array_values(array_filter($docs, fn($d) => ($d['id'] ?? '') !== ($body['id'] ?? '')));
        array_unshift($filtered, $body);
        writeJsonFile($docsFile, $filtered);
        http_response_code(201);
        echo json_encode(['status' => 'success', 'document' => $body]);
        exit;
    }
    if (preg_match('#^documents/([^/]+)/status$#', $route, $m) && ($method === 'PATCH' || $method === 'POST')) {
        $docs = readJsonFile($docsFile, []);
        foreach ($docs as &$doc) {
            if (($doc['id'] ?? '') === $m[1]) {
                if (isset($body['status'])) $doc['status'] = $body['status'];
                if (isset($body['feedback'])) $doc['revisionFeedback'] = $body['feedback'];
                $doc['verifiedBy'] = 'Panitia Kurikulum & Asesmen';
                $doc['verifiedAt'] = date('c');
            }
        }
        writeJsonFile($docsFile, $docs);
        echo json_encode(['status' => 'success', 'id' => $m[1]]);
        exit;
    }
    if (preg_match('#^documents/([^/]+)$#', $route, $m) && ($method === 'DELETE' || $method === 'POST')) {
        $docs = readJsonFile($docsFile, []);
        $filtered = array_values(array_filter($docs, fn($d) => ($d['id'] ?? '') !== $m[1]));
        writeJsonFile($docsFile, $filtered);
        echo json_encode(['status' => 'success', 'id' => $m[1]]);
        exit;
    }
    if ($route === 'config') {
        if ($method === 'GET') { echo json_encode(['status' => 'success', 'config' => readJsonFile($configFile, ['appsScriptUrl' => ''])]); exit; }
        if ($method === 'POST') { $cfg = ['appsScriptUrl' => trim($body['appsScriptUrl'] ?? '')]; writeJsonFile($configFile, $cfg); echo json_encode(['status' => 'success', 'config' => $cfg]); exit; }
    }
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Endpoint tidak ditemukan']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
`;

const HTACCESS_CONTENT = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^api/(.*)$ api.php?route=$1 [QSA,L]

  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . index.html [L]
</IfModule>

<IfModule mod_headers.c>
  <FilesMatch "\\.(html|php|json)$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
  </FilesMatch>
</IfModule>
`;

const DATABASE_SQL_CONTENT = `CREATE DATABASE IF NOT EXISTS \`db_upload_soal_sman1pakem\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`db_upload_soal_sman1pakem\`;

CREATE TABLE IF NOT EXISTS \`exam_documents\` (
  \`id\` VARCHAR(128) NOT NULL,
  \`title\` VARCHAR(300) NOT NULL,
  \`subject\` VARCHAR(120) NOT NULL,
  \`grade\` VARCHAR(30) NOT NULL,
  \`assessmentType\` VARCHAR(40) NOT NULL DEFAULT 'ASAS',
  \`durationMinutes\` INT NOT NULL DEFAULT 90,
  \`estimatedQuestions\` INT NOT NULL DEFAULT 40,
  \`fileName\` VARCHAR(260) NOT NULL,
  \`fileFormat\` VARCHAR(20) NOT NULL,
  \`fileSizeBytes\` BIGINT NOT NULL DEFAULT 0,
  \`uploadedAt\` VARCHAR(64) NOT NULL,
  \`status\` VARCHAR(60) NOT NULL DEFAULT 'Menunggu Review',
  \`committeeNotes\` TEXT NULL,
  \`revisionFeedback\` TEXT NULL,
  \`verifiedBy\` VARCHAR(120) NULL,
  \`verifiedAt\` VARCHAR(64) NULL,
  \`fileDataUrl\` LONGTEXT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

export const XamppDownloadModal: React.FC<XamppDownloadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'success' | 'fallback'>('idle');

  if (!isOpen) return null;

  const handleDownloadFullZip = async () => {
    setIsDownloadingZip(true);
    setDownloadStatus('idle');
    try {
      const response = await fetch('/api/download-xampp');
      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || !contentType.includes('zip')) {
        throw new Error('Server paket ZIP belum tersedia pada host statis ini.');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'upload-soal-sman1pakem-xampp.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadStatus('success');
    } catch {
      setDownloadStatus('fallback');
    } finally {
      setIsDownloadingZip(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-orange-50/70 via-white to-amber-50/50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Unduh Paket Instalasi XAMPP (htdocs)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Jalankan aplikasi Upload Soal SMAN 1 Pakem secara lokal di Apache / XAMPP tanpa ribet
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

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-5 text-sm text-slate-800 dark:text-slate-200">
          {/* Primary Download Box */}
          <div className="p-5 rounded-2xl border border-orange-200 dark:border-orange-900/50 bg-orange-50/70 dark:bg-orange-950/20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-orange-600" />
                  Paket Lengkap Siap Ekstrak (.ZIP)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Berisi hasil build web (<code className="font-mono bg-white/80 dark:bg-slate-800 px-1 rounded">index.html</code> + <code className="font-mono bg-white/80 dark:bg-slate-800 px-1 rounded">assets/</code>), backend PHP (<code className="font-mono bg-white/80 dark:bg-slate-800 px-1 rounded">api.php</code>), <code className="font-mono bg-white/80 dark:bg-slate-800 px-1 rounded">.htaccess</code>, <code className="font-mono bg-white/80 dark:bg-slate-800 px-1 rounded">database.sql</code>, dan panduan instalasi.
                </p>
              </div>
              <button
                onClick={handleDownloadFullZip}
                disabled={isDownloadingZip}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer shrink-0 disabled:opacity-60"
              >
                {isDownloadingZip ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{isDownloadingZip ? 'Menyiapkan ZIP...' : 'Unduh Paket XAMPP (.zip)'}</span>
              </button>
            </div>

            {downloadStatus === 'success' && (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>File <strong>upload-soal-sman1pakem-xampp.zip</strong> berhasil diunduh! Ikuti langkah instalasi di bawah.</span>
              </div>
            )}

            {downloadStatus === 'fallback' && (
              <div className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-3.5 py-2.5 rounded-xl border border-amber-200 dark:border-amber-900/50">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Host statis ini tidak mengizinkan pembuatan ZIP otomatis di server. Silakan unduh file pendukung PHP/SQL di bawah lalu jalankan <code className="font-mono font-bold">npm run build</code> dari kode GitHub Anda dan salin isi folder <code className="font-mono font-bold">dist/</code> ke <code className="font-mono font-bold">C:\xampp\htdocs\upload-soal\</code>.
                </span>
              </div>
            )}
          </div>

          {/* Step by step XAMPP install */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-600" />
              Cara Memasang di XAMPP (Windows / Mac)
            </h4>
            <ol className="list-decimal pl-5 space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <li>
                Ekstrak file <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-bold">upload-soal-sman1pakem-xampp.zip</code> ke dalam folder:
                <div className="mt-1 font-mono bg-slate-900 text-emerald-300 px-3 py-1.5 rounded-lg text-[11px]">
                  C:\xampp\htdocs\upload-soal\
                </div>
              </li>
              <li>
                Buka <strong>XAMPP Control Panel</strong>, lalu klik tombol <strong>Start</strong> pada baris <strong>Apache</strong> (tunggu sampai berwarna hijau).
              </li>
              <li>
                Buka browser (Chrome / Edge), lalu akses alamat:
                <div className="mt-1 font-mono bg-slate-900 text-amber-300 px-3 py-1.5 rounded-lg text-[11px]">
                  http://localhost/upload-soal/
                </div>
              </li>
              <li>
                <strong>Database Otomatis Aktif:</strong> Saat online, data tersinkron ke <strong>Firebase Firestore</strong> &amp; <strong>Google Spreadsheet</strong>. Data lokal juga otomatis tersimpan oleh <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">api.php</code> di folder <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">xampp_data/</code> (atau aktifkan MySQL phpMyAdmin via <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">database.sql</code>).
              </li>
            </ol>
          </div>

          {/* Individual Helper Downloads */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                <FileCode2 className="w-4 h-4 text-slate-500" />
                Unduh File Pendukung XAMPP Satuan (Jika Build Manual dari GitHub)
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => downloadFile(API_PHP_CONTENT, 'api.php', 'text/plain;charset=utf-8')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>api.php</span>
              </button>
              <button
                onClick={() => downloadFile(HTACCESS_CONTENT, '.htaccess', 'text/plain;charset=utf-8')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>.htaccess</span>
              </button>
              <button
                onClick={() => downloadFile(DATABASE_SQL_CONTENT, 'database.sql', 'text/plain;charset=utf-8')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold cursor-pointer transition-colors"
              >
                <Database className="w-3.5 h-3.5 text-amber-600" />
                <span>database.sql (MySQL)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            SMAN 1 Pakem &bull; Kompatibel dengan XAMPP PHP 7.4 / 8.x &amp; Apache
          </span>
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

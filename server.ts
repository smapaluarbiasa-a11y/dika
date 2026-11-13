import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { INITIAL_DOCUMENTS } from './src/data/initialData';
import { ExamDocument } from './src/types/naskah';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Allow large base64 PDF and Word payloads
app.use(express.json({ limit: '65mb' }));
app.use(express.urlencoded({ extended: true, limit: '65mb' }));

// CORS configuration to allow shared URLs and multi-domain access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Database Storage Paths
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'documents.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// Ensure database directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize database with initial documents if empty or missing
function initDatabase(): ExamDocument[] {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read existing documents.json, reinitializing...', e);
  }

  // Seed default data
  fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DOCUMENTS, null, 2), 'utf-8');
  return INITIAL_DOCUMENTS;
}

let documentsStore: ExamDocument[] = initDatabase();
let lastUpdatedTimestamp = new Date().toISOString();

function saveDocuments(docs: ExamDocument[]) {
  documentsStore = docs;
  lastUpdatedTimestamp = new Date().toISOString();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(docs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write to documents.json:', err);
  }
}

// Config store (for shared Google Apps Script URL)
interface ServerConfig {
  appsScriptUrl: string;
}

function loadConfig(): ServerConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch {
    // fallback
  }
  return { appsScriptUrl: '' };
}

function saveConfig(cfg: ServerConfig) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write to config.json:', err);
  }
}

let configStore: ServerConfig = loadConfig();

// ======================== API ROUTES ========================

// 1. Get all documents (shared across all links, browsers, and devices)
app.get('/api/documents', (req, res) => {
  res.json({
    status: 'success',
    count: documentsStore.length,
    documents: documentsStore,
    lastUpdated: new Date().toISOString(),
  });
});

// 2. Add new document
app.post('/api/documents', async (req, res) => {
  try {
    const newDoc: ExamDocument = req.body;
    if (!newDoc || !newDoc.title || !newDoc.subject) {
      return res.status(400).json({ status: 'error', message: 'Identitas naskah tidak lengkap.' });
    }

    // Prepend new document
    const updated = [newDoc, ...documentsStore.filter((d) => d.id !== newDoc.id)];
    saveDocuments(updated);

    // Forward to Google Apps Script if URL is configured
    if (configStore.appsScriptUrl && configStore.appsScriptUrl.startsWith('http')) {
      try {
        let fileBase64 = '';
        if (newDoc.fileDataUrl && newDoc.fileDataUrl.includes(',')) {
          fileBase64 = newDoc.fileDataUrl.split(',')[1];
        }

        fetch(configStore.appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
        }).catch((e) => console.warn('Background sync to Apps Script:', e));
      } catch (syncErr) {
        console.warn('Apps Script sync error on server:', syncErr);
      }
    }

    res.status(201).json({
      status: 'success',
      document: newDoc,
      message: 'Naskah berhasil disimpan di database server SMAN 1 Pakem.',
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message || 'Gagal menyimpan berkas.' });
  }
});

// 3. Update verification status
app.patch('/api/documents/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, feedback } = req.body;

  let found = false;
  const updated = documentsStore.map((doc) => {
    if (doc.id === id) {
      found = true;
      return {
        ...doc,
        status: status || doc.status,
        revisionFeedback: feedback !== undefined ? feedback : doc.revisionFeedback,
        verifiedBy: 'Panitia Kurikulum & Asesmen',
        verifiedAt: new Date().toISOString(),
      };
    }
    return doc;
  });

  if (!found) {
    return res.status(404).json({ status: 'error', message: 'Dokumen tidak ditemukan.' });
  }

  saveDocuments(updated);
  const updatedDoc = updated.find((d) => d.id === id);
  res.json({ status: 'success', document: updatedDoc });
});

// 4. Delete document (syncs to server and Google Apps Script)
app.delete('/api/documents/:id', async (req, res) => {
  const { id } = req.params;
  const initialLength = documentsStore.length;
  const docToDelete = documentsStore.find((d) => d.id === id);
  const filtered = documentsStore.filter((d) => d.id !== id);

  if (filtered.length === initialLength) {
    return res.status(404).json({ status: 'error', message: 'Dokumen tidak ditemukan.' });
  }

  saveDocuments(filtered);

  // Notify Google Apps Script so the row in Google Sheets & Drive file are also deleted
  if (configStore.appsScriptUrl && configStore.appsScriptUrl.startsWith('http')) {
    try {
      fetch(configStore.appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          id: id,
          title: docToDelete?.title,
          fileName: docToDelete?.fileName,
        }),
      }).catch((e) => console.warn('Background delete sync to Apps Script warning:', e));
    } catch (syncErr) {
      console.warn('Apps Script delete sync error on server:', syncErr);
    }
  }

  res.json({
    status: 'success',
    id,
    deletedDocument: docToDelete,
    message: 'Dokumen berhasil dihapus dari database server dan antrian Google Sheets.',
  });
});

// 5. Config routes (for shared Google Apps Script URL across all links)
app.get('/api/config', (req, res) => {
  res.json({
    status: 'success',
    config: configStore,
  });
});

app.post('/api/config', (req, res) => {
  const { appsScriptUrl } = req.body;
  configStore = { appsScriptUrl: String(appsScriptUrl || '').trim() };
  saveConfig(configStore);
  res.json({ status: 'success', config: configStore });
});

// 6. Reset database to demo initial data
app.post('/api/reset-demo', (req, res) => {
  saveDocuments(INITIAL_DOCUMENTS);
  res.json({ status: 'success', message: 'Database naskah telah direset ke data awal resmi.' });
});

// ======================== XAMPP ZIP BUILDER ========================

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC32_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function buildZipArchive(entries: { name: string; data: Buffer }[]): Buffer {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const fileNameBuf = Buffer.from(entry.name.replace(/\\/g, '/'), 'utf8');
    const uncompressed = entry.data;
    const compressed = zlib.deflateRawSync(uncompressed);
    const crc = crc32(uncompressed);

    // Local file header (30 bytes + filename)
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4); // version needed
    localHeader.writeUInt16LE(0x0800, 6); // UTF-8 flag
    localHeader.writeUInt16LE(8, 8); // compression method: deflate
    localHeader.writeUInt16LE(0, 10); // mod time
    localHeader.writeUInt16LE(0x5421, 12); // mod date
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(compressed.length, 18);
    localHeader.writeUInt32LE(uncompressed.length, 22);
    localHeader.writeUInt16LE(fileNameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28); // extra len

    localParts.push(localHeader, fileNameBuf, compressed);

    // Central directory header (46 bytes + filename)
    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4); // version made by
    centralHeader.writeUInt16LE(20, 6); // version needed
    centralHeader.writeUInt16LE(0x0800, 8); // UTF-8 flag
    centralHeader.writeUInt16LE(8, 10); // deflate
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0x5421, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(compressed.length, 20);
    centralHeader.writeUInt32LE(uncompressed.length, 24);
    centralHeader.writeUInt16LE(fileNameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30); // extra len
    centralHeader.writeUInt16LE(0, 32); // comment len
    centralHeader.writeUInt16LE(0, 34); // disk start
    centralHeader.writeUInt16LE(0, 36); // internal attrs
    centralHeader.writeUInt32LE(0, 38); // external attrs
    centralHeader.writeUInt32LE(offset, 42); // relative offset

    centralParts.push(centralHeader, fileNameBuf);
    offset += localHeader.length + fileNameBuf.length + compressed.length;
  }

  const centralDir = Buffer.concat(centralParts);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralDir.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDir, eocd]);
}

function collectFilesRecursively(dir: string, baseDir: string): { name: string; data: Buffer }[] {
  const results: { name: string; data: Buffer }[] = [];
  if (!fs.existsSync(dir)) return results;

  for (const item of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...collectFilesRecursively(fullPath, baseDir));
    } else if (stat.isFile()) {
      const relPath = path.relative(baseDir, fullPath);
      results.push({
        name: `upload-soal/${relPath}`,
        data: fs.readFileSync(fullPath),
      });
    }
  }
  return results;
}

// 7. Download ready-to-install XAMPP package (.zip)
app.get('/api/download-xampp', (req, res) => {
  try {
    const distDir = path.resolve(__dirname, 'dist');
    const distIndex = path.join(distDir, 'index.html');
    if (!fs.existsSync(distIndex)) {
      execSync('npx vite build', { cwd: __dirname, stdio: 'ignore' });
    }

    const entries = collectFilesRecursively(distDir, distDir);
    const xamppDir = path.resolve(__dirname, 'xampp');
    const xamppFiles = ['api.php', '.htaccess', 'database.sql', 'CARA_INSTALL_XAMPP.txt'];

    for (const fileName of xamppFiles) {
      const filePath = path.join(xamppDir, fileName);
      if (fs.existsSync(filePath)) {
        entries.push({
          name: `upload-soal/${fileName}`,
          data: fs.readFileSync(filePath),
        });
      }
    }

    const zipBuffer = buildZipArchive(entries);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="upload-soal-sman1pakem-xampp.zip"');
    res.setHeader('Content-Length', String(zipBuffer.length));
    res.send(zipBuffer);
  } catch (err: any) {
    console.error('Failed to build XAMPP ZIP:', err);
    res.status(500).json({
      status: 'error',
      message: err?.message || 'Gagal menyiapkan paket ZIP XAMPP.',
    });
  }
});

// ======================== VITE & STATIC HANDLING ========================

async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT} (Mode: ${isProd ? 'production' : 'development'})`);
    console.log(`Shared database active. Documents count: ${documentsStore.length}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

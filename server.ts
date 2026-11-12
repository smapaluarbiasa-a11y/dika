import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
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

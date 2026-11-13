import type { IncomingMessage, ServerResponse } from 'http';
import { INITIAL_DOCUMENTS } from '../src/data/initialData';
import { ExamDocument } from '../src/types/naskah';

// In-memory fallback store for Vercel serverless environment
let inMemoryDocuments: ExamDocument[] = [...INITIAL_DOCUMENTS];
let sharedConfig = {
  appsScriptUrl: process.env.VITE_APPS_SCRIPT_URL || process.env.APPS_SCRIPT_URL || '',
};

export default async function handler(req: IncomingMessage & { body?: any; query?: any }, res: ServerResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const url = req.url || '';
  const method = req.method || 'GET';

  // Helper to parse JSON body
  let body: any = req.body;
  if (!body && method !== 'GET' && method !== 'DELETE') {
    body = await new Promise((resolve) => {
      let data = '';
      req.on('data', (chunk) => {
        data += chunk;
      });
      req.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve({});
        }
      });
    });
  }

  res.setHeader('Content-Type', 'application/json');

  // 1. GET /api/documents
  if (url.startsWith('/api/documents') && method === 'GET') {
    // If Apps Script URL is set, optionally try to fetch live documents from Google Sheets
    if (sharedConfig.appsScriptUrl && sharedConfig.appsScriptUrl.startsWith('http')) {
      try {
        const gasRes = await fetch(sharedConfig.appsScriptUrl);
        if (gasRes.ok) {
          const gasData: any = await gasRes.json();
          if (Array.isArray(gasData.documents) && gasData.documents.length > 0) {
            inMemoryDocuments = gasData.documents;
          }
        }
      } catch (e) {
        // Fallback to inMemoryDocuments
      }
    }

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        status: 'success',
        count: inMemoryDocuments.length,
        documents: inMemoryDocuments,
        source: 'vercel-serverless',
      })
    );
    return;
  }

  // 2. POST /api/documents
  if (url.startsWith('/api/documents') && method === 'POST') {
    const newDoc = body;
    if (newDoc && newDoc.title) {
      inMemoryDocuments = [newDoc, ...inMemoryDocuments.filter((d) => d.id !== newDoc.id)];

      // Forward to Google Apps Script
      if (sharedConfig.appsScriptUrl && sharedConfig.appsScriptUrl.startsWith('http')) {
        try {
          fetch(sharedConfig.appsScriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newDoc),
          }).catch(() => {});
        } catch {}
      }

      res.statusCode = 201;
      res.end(
        JSON.stringify({
          status: 'success',
          document: newDoc,
          message: 'Naskah berhasil disimpan di Vercel Serverless & diteruskan ke Google Sheets.',
        })
      );
      return;
    }
  }

  // 3. DELETE /api/documents/:id
  if (url.startsWith('/api/documents/') && method === 'DELETE') {
    const parts = url.split('/');
    const id = parts[parts.length - 1]?.split('?')[0];
    const docToDelete = inMemoryDocuments.find((d) => d.id === id);
    inMemoryDocuments = inMemoryDocuments.filter((d) => d.id !== id);

    // Forward delete to Google Apps Script
    if (sharedConfig.appsScriptUrl && sharedConfig.appsScriptUrl.startsWith('http')) {
      try {
        fetch(sharedConfig.appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'delete',
            id,
            title: docToDelete?.title,
            fileName: docToDelete?.fileName,
          }),
        }).catch(() => {});
      } catch {}
    }

    res.statusCode = 200;
    res.end(JSON.stringify({ status: 'success', id, message: 'Dokumen berhasil dihapus.' }));
    return;
  }

  // 4. GET /api/config
  if (url.startsWith('/api/config') && method === 'GET') {
    res.statusCode = 200;
    res.end(JSON.stringify({ status: 'success', config: sharedConfig }));
    return;
  }

  // 5. POST /api/config
  if (url.startsWith('/api/config') && method === 'POST') {
    if (body?.appsScriptUrl) {
      sharedConfig.appsScriptUrl = String(body.appsScriptUrl).trim();
    }
    res.statusCode = 200;
    res.end(JSON.stringify({ status: 'success', config: sharedConfig }));
    return;
  }

  // 6. POST /api/reset-demo
  if (url.startsWith('/api/reset-demo') && method === 'POST') {
    inMemoryDocuments = [...INITIAL_DOCUMENTS];
    res.statusCode = 200;
    res.end(JSON.stringify({ status: 'success', message: 'Data demo telah direset.' }));
    return;
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ status: 'error', message: 'Route tidak ditemukan di Vercel Serverless API.' }));
}

import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  AlertCircle,
  Loader2,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { ExamDocument } from '../types/naskah';
import { generateCleanPdfDataUrl } from '../utils/pdfGenerator';

// Configure PDF.js worker
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
} catch (e) {
  console.warn('PDF.js worker initialization warning:', e);
}

interface PdfViewerProps {
  document: ExamDocument;
  onDownload: () => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ document, onDownload }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.25);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'canvas' | 'native'>('canvas');

  // Load and parse PDF data
  useEffect(() => {
    let active = true;
    let currentObjectUrl: string | null = null;
    setIsLoading(true);
    setError(null);

    const loadPdf = async () => {
      try {
        const dataUrl = document.fileDataUrl || generateCleanPdfDataUrl(document);
        if (!dataUrl || !dataUrl.startsWith('data:application/pdf')) {
          throw new Error('Data berkas PDF tidak ditemukan atau format tidak valid.');
        }

        const base64Str = dataUrl.split(',')[1] || '';
        const binaryStr = atob(base64Str);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }

        // Create Blob URL for new tab & native object rendering
        const blob = new Blob([bytes], { type: 'application/pdf' });
        currentObjectUrl = URL.createObjectURL(blob);
        if (active) {
          setBlobUrl(currentObjectUrl);
        }

        // Load document via PDF.js
        const loadingTask = pdfjsLib.getDocument({
          data: bytes,
        });

        const doc = await loadingTask.promise;
        if (!active) return;

        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setCurrentPage(1);
        setIsLoading(false);
      } catch (err: any) {
        console.error('PDF parsing error:', err);
        if (active) {
          setError(err.message || 'Gagal memproses berkas PDF.');
          setIsLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      active = false;
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
      }
    };
  }, [document.id, document.fileDataUrl]);

  // Render page to canvas
  useEffect(() => {
    if (!pdfDoc || viewMode !== 'canvas') return;

    let renderTask: pdfjsLib.RenderTask | null = null;
    let isCancelled = false;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(currentPage);
        if (isCancelled || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        const viewport = page.getViewport({ scale });
        const pixelRatio = window.devicePixelRatio || 1.5;

        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        renderTask = page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        } as any);

        await renderTask.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('Error rendering PDF page:', err);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfDoc, currentPage, scale, viewMode]);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.2, 2.5));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.2, 0.6));
  const handleResetZoom = () => setScale(1.25);

  const handlePrevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(p + 1, numPages));

  const handleOpenExternal = () => {
    if (blobUrl) {
      window.open(blobUrl, '_blank');
    }
  };

  return (
    <div className="w-full flex flex-col bg-slate-900 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-800 shadow-2xl">
      {/* PDF Tool bar */}
      <div className="bg-slate-850 px-4 py-2.5 border-b border-slate-750 flex flex-wrap items-center justify-between gap-3 text-white text-xs shrink-0 select-none">
        {/* Page navigation */}
        <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-xl border border-slate-700">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || isLoading}
            className="p-1 rounded-lg hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Halaman Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold px-2 text-center text-slate-200">
            Halaman {currentPage} dari {numPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= numPages || isLoading}
            className="p-1 rounded-lg hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Halaman Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-xl border border-slate-700">
          <button
            onClick={handleZoomOut}
            disabled={isLoading || scale <= 0.6}
            className="p-1 rounded-lg hover:bg-slate-700 disabled:opacity-30 transition-colors cursor-pointer"
            title="Perkecil (-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="px-2 py-0.5 font-bold text-slate-300 hover:text-white rounded-md hover:bg-slate-700 transition-colors"
            title="Reset Zoom (125%)"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            disabled={isLoading || scale >= 2.5}
            className="p-1 rounded-lg hover:bg-slate-700 disabled:opacity-30 transition-colors cursor-pointer"
            title="Perbesar (+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {blobUrl && (
            <button
              onClick={() => setViewMode((m) => (m === 'canvas' ? 'native' : 'canvas'))}
              className={`px-3 py-1 rounded-xl font-bold transition-colors cursor-pointer text-xs ${
                viewMode === 'native'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
              title="Ganti Mode Tampilan (Kanvas Interaktif / Pembaca Dokumen Asli)"
            >
              {viewMode === 'native' ? 'Mode Kanvas' : 'Mode Dokumen Asli'}
            </button>
          )}

          {blobUrl && (
            <button
              onClick={handleOpenExternal}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer text-xs font-semibold"
              title="Buka Dokumen PDF di Tab Baru"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Tab Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Viewport */}
      <div
        ref={containerRef}
        className="w-full overflow-auto bg-slate-950 p-4 sm:p-6 flex justify-center items-start min-h-[580px] max-h-[72vh] relative"
      >
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-xs z-10 text-white gap-3">
            <Loader2 className="w-9 h-9 animate-spin text-blue-500" />
            <p className="text-xs font-semibold text-slate-300">
              Memuat naskah soal PDF...
            </p>
          </div>
        )}

        {error ? (
          <div className="my-auto max-w-lg p-6 bg-slate-900 border border-rose-800/60 rounded-2xl text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-950/60 border border-rose-700 flex items-center justify-center text-rose-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">
                Gagal Menampilkan Pratinjau Kanvas
              </h4>
              <p className="text-xs text-rose-300 leading-relaxed">{error}</p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={onDownload}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Berkas PDF</span>
              </button>
              {blobUrl && (
                <button
                  onClick={handleOpenExternal}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka di Tab Baru</span>
                </button>
              )}
            </div>
          </div>
        ) : viewMode === 'native' && blobUrl ? (
          <div className="w-full h-full min-h-[620px] bg-white rounded-xl overflow-hidden flex flex-col">
            <object
              data={`${blobUrl}#toolbar=1`}
              type="application/pdf"
              className="w-full flex-1 min-h-[620px]"
            >
              <div className="p-8 text-center text-slate-700">
                <p className="text-sm font-semibold mb-3">
                  Peramban Anda tidak menampilkan berkas PDF secara otomatis.
                </p>
                <button
                  onClick={handleOpenExternal}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white"
                >
                  Buka Dokumen di Tab Baru
                </button>
              </div>
            </object>
          </div>
        ) : (
          <div className="shadow-2xl rounded-sm overflow-hidden bg-white border border-slate-700 transition-transform duration-100 ease-out my-auto">
            <canvas ref={canvasRef} className="block max-w-full" />
          </div>
        )}
      </div>

      {/* Footer bar */}
      <div className="bg-slate-900 px-5 py-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-medium text-slate-300">
            Naskah Asli PDF SMAN 1 Pakem
          </span>
          <span>&bull;</span>
          <span>Tanpa Kop Surat &amp; Tanpa Tanda Tangan Panitia</span>
        </div>
        <div className="font-mono text-slate-400 truncate max-w-xs sm:max-w-md">
          {document.fileName}
        </div>
      </div>
    </div>
  );
};

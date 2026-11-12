import React, { useState } from 'react';
import {
  SubjectMonitoringItem,
  SubjectName,
} from '../types/naskah';
import {
  Clock,
  Upload,
  Eye,
  Search,
  CheckCircle2,
  FileText,
  File,
  Layers,
  Sparkles,
} from 'lucide-react';
import { getFormatBadgeClasses, getStatusBadgeClasses } from '../utils/fileValidation';

interface SubjectMonitoringTableProps {
  monitoringList: SubjectMonitoringItem[];
  onOpenUploadForSubject: (subject: SubjectName) => void;
  onPreviewDocument: (documentId: string) => void;
}

export const SubjectMonitoringTable: React.FC<SubjectMonitoringTableProps> = ({
  monitoringList,
  onOpenUploadForSubject,
  onPreviewDocument,
}) => {
  const [filterState, setFilterState] = useState<'all' | 'submitted' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredItems = monitoringList.filter((item) => {
    if (filterState === 'submitted' && !item.hasSubmitted) return false;
    if (filterState === 'pending' && item.hasSubmitted) return false;

    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const matchSub = item.subject.toLowerCase().includes(q);
      if (!matchSub) return false;
    }

    return true;
  });

  const submittedCount = monitoringList.filter((m) => m.hasSubmitted).length;
  const pendingCount = monitoringList.length - submittedCount;

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Table Header & Controls */}
      <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Tabel Monitoring 21 Mata Pelajaran
            </h3>
            <span className="text-xs bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full font-bold">
              {submittedCount} / {monitoringList.length} Terkumpul
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitoring kelengkapan berkas naskah soal per mata pelajaran sekolah
          </p>
        </div>

        {/* Search & Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick search input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari mata pelajaran..."
              className="text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-44 sm:w-52 transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700 p-0.5 bg-slate-50/80 dark:bg-slate-800 text-xs">
            <button
              onClick={() => setFilterState('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filterState === 'all'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Semua ({monitoringList.length})
            </button>
            <button
              onClick={() => setFilterState('submitted')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filterState === 'submitted'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Sudah ({submittedCount})
            </button>
            <button
              onClick={() => setFilterState('pending')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filterState === 'pending'
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Belum ({pendingCount})
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4 w-12 text-center">No</th>
              <th className="py-3.5 px-4">Mata Pelajaran</th>
              <th className="py-3.5 px-4 text-center">Status Unggah</th>
              <th className="py-3.5 px-4 text-center">Format Berkas</th>
              <th className="py-3.5 px-4 text-center">Status Panitia</th>
              <th className="py-3.5 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredItems.map((item, idx) => {
              const formatBadge = item.format ? getFormatBadgeClasses(item.format) : null;
              const statusBadge = item.latestStatus ? getStatusBadgeClasses(item.latestStatus) : null;

              return (
                <tr
                  key={item.subject}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-4 text-center text-slate-400 font-semibold">
                    {idx + 1}
                  </td>

                  {/* Subject Name */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {item.subject}
                    </div>
                    {item.latestFileName && (
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate max-w-xs sm:max-w-md">
                        {item.latestFileName}
                      </div>
                    )}
                  </td>

                  {/* Status Unggah */}
                  <td className="py-3.5 px-4 text-center">
                    {item.hasSubmitted ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Terkumpul
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        Belum Mengunggah
                      </span>
                    )}
                  </td>

                  {/* Format Berkas (Red PDF / Blue Word) */}
                  <td className="py-3.5 px-4 text-center">
                    {formatBadge ? (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-black border ${formatBadge.bg} ${formatBadge.text} ${formatBadge.border}`}
                      >
                        {formatBadge.iconType === 'pdf' ? (
                          <File className="w-3 h-3" />
                        ) : (
                          <FileText className="w-3 h-3" />
                        )}
                        {item.format?.toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs italic">-</span>
                    )}
                  </td>

                  {/* Status Panitia */}
                  <td className="py-3.5 px-4 text-center">
                    {statusBadge && item.latestStatus ? (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                        {item.latestStatus}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    {item.hasSubmitted && item.latestDocumentId ? (
                      <button
                        onClick={() => onPreviewDocument(item.latestDocumentId!)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                        title="Lihat Pratinjau Naskah Soal"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Pratinjau</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onOpenUploadForSubject(item.subject)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                        title="Unggah Naskah Soal untuk Mapel ini"
                      >
                        <Upload className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                        <span>Unggah</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import { useEffect, useState, useCallback } from 'react';
import { Database, FileText, Trash2, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { listDocuments, deleteDocument } from '../services/api';
import type { DocumentSummary } from '../types';

export default function KnowledgeBase() {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const docs = await listDocuments();
      setDocuments(docs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this document and all of its indexed chunks?')) return;
    setDeletingId(id);
    try {
      await deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document.');
    } finally {
      setDeletingId(null);
    }
  };

  const totalChunks = documents.reduce((sum, d) => sum + d.chunkCount, 0);

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Knowledge Base</h1>
            <p className="text-sm text-slate-500 mt-1">
              {documents.length} documents · {totalChunks} indexed chunks
            </p>
          </div>
          <button
            onClick={loadDocuments}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-900/5 border border-red-500/30 rounded-lg p-3 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-16">
              <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <Database className="h-12 w-12 text-slate-300 mb-4" />
              <p className="text-slate-600 font-medium">No documents indexed yet</p>
              <p className="text-sm text-slate-400 mt-1">
                Run the ingestion pipeline to add technical manuals and SOPs.
              </p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Document</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Access</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Chunks</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Added</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-slate-800 truncate max-w-[280px]" title={doc.name}>
                          {doc.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs uppercase tracking-wide font-medium text-slate-500 bg-slate-100 rounded-full px-2.5 py-1">
                        {doc.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-indigo-600 bg-indigo-50 rounded-full px-2.5 py-1">
                        {doc.accessLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{doc.chunkCount}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(doc.id)}
                        disabled={deletingId === doc.id}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete document"
                      >
                        {deletingId === doc.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-6 bg-slate-100 border border-slate-200 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-2">Adding new documents</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Place PDF, DOCX, or HTML technical documents inside{' '}
            <code className="bg-white px-1.5 py-0.5 rounded text-xs font-mono">knowledge-base/public/</code>{' '}
            and run the ingestion pipeline from the project root:
          </p>
          <pre className="mt-3 bg-slate-900 text-slate-100 text-xs rounded-lg p-4 overflow-x-auto font-mono">
{`# PowerShell
python .\\venv_ingest\\Scripts\\activate
python ingestion\\pipeline.py knowledge-base\\public`}
          </pre>
        </div>
      </div>
    </div>
  );
}
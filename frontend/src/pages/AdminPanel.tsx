import { useState, useEffect } from 'react';
import { UploadCloud, File, Image as ImageIcon, AlertCircle, Database, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function AdminPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [uploads, setUploads] = useState<any[]>([]);
  const [loadingUploads, setLoadingUploads] = useState(true);

  const fetchUploads = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/documents/uploads', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUploads(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUploads(false);
    }
  };

  useEffect(() => {
    fetchUploads();
    const interval = setInterval(fetchUploads, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const data = await res.json();
      setMessage({ type: 'success', text: `Successfully uploaded ${data.fileName}` });
      setFile(null);
      fetchUploads();
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to upload document. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Control Panel</h1>
        <p className="text-textMuted mt-2">Manage machinery documentation, manuals, and image assets.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-white/5 bg-surface/30 h-fit">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <UploadCloud className="text-primary" />
            Upload Asset
          </h2>

          {message && (
            <div className={`p-4 mb-6 rounded-xl flex items-start gap-3 border ${
              message.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}

          <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center hover:bg-white/5 transition-colors group relative">
            <input 
              type="file" 
              id="file-upload"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex justify-center mb-4 text-textMuted group-hover:text-primary transition-colors">
              {file ? (
                file.type.includes('image') ? <ImageIcon size={32} /> : <File size={32} />
              ) : (
                <UploadCloud size={32} />
              )}
            </div>
            <p className="text-sm font-medium text-text">
              {file ? file.name : "Click or drag file"}
            </p>
          </div>

          <div className="mt-6 flex justify-end">
            <button 
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full bg-primary hover:bg-primary/90 text-white px-4 py-3 rounded-xl font-medium disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud size={18} />
                  Upload
                </>
              )}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5 bg-surface/30">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Database className="text-primary" />
            Asset Knowledge Base
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-3 font-semibold text-textMuted text-sm">File Name</th>
                  <th className="pb-3 font-semibold text-textMuted text-sm">Uploader</th>
                  <th className="pb-3 font-semibold text-textMuted text-sm">Size</th>
                  <th className="pb-3 font-semibold text-textMuted text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {loadingUploads ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-textMuted">Loading assets...</td>
                  </tr>
                ) : uploads.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-textMuted">No assets uploaded yet.</td>
                  </tr>
                ) : uploads.map((doc, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="py-4 text-sm font-medium text-text flex items-center gap-2">
                      <File size={16} className="text-primary opacity-70" />
                      {doc.fileName}
                    </td>
                    <td className="py-4 text-sm text-textMuted">{doc.uploader}</td>
                    <td className="py-4 text-sm text-textMuted">{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</td>
                    <td className="py-4 text-sm">
                      {doc.status === 'COMPLETED' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle size={12}/> Indexed</span>}
                      {doc.status === 'PROCESSING' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock size={12}/> Processing</span>}
                      {doc.status === 'FAILED' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20"><XCircle size={12}/> Failed</span>}
                      {doc.status === 'PENDING' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20"><Clock size={12}/> Pending</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

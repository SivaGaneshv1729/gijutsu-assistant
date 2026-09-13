import { useState } from 'react';
import { UploadCloud, File, Image as ImageIcon, AlertCircle } from 'lucide-react';

export default function AdminPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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
    <div className="flex flex-col h-full max-w-4xl mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Control Panel</h1>
        <p className="text-textMuted mt-2">Manage machinery documentation, manuals, and image assets.</p>
      </header>

      <div className="glass-panel p-8 rounded-2xl border border-white/5 bg-surface/30">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <UploadCloud className="text-primary" />
          Upload Assets
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

        <div className="border-2 border-dashed border-white/10 rounded-2xl p-10 text-center hover:bg-white/5 transition-colors group relative">
          <input 
            type="file" 
            id="file-upload"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex justify-center mb-4 text-textMuted group-hover:text-primary transition-colors">
            {file ? (
              file.type.includes('image') ? <ImageIcon size={48} /> : <File size={48} />
            ) : (
              <UploadCloud size={48} />
            )}
          </div>
          <p className="text-lg font-medium text-text">
            {file ? file.name : "Click or drag file to this area to upload"}
          </p>
          <p className="text-sm text-textMuted mt-2">
            Supports PDF manuals or JPG/PNG machinery images
          </p>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleUpload}
            disabled={!file || uploading}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-medium disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <UploadCloud size={20} />
                Upload Asset
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

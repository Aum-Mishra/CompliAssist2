import { useEffect, useState } from 'react';
import { Trash2, Upload, RefreshCw, FileText, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Document {
  name: string;
  size: number;
  uploadedAt: string;
  version: string;
}

interface SystemStatus {
  status: string;
  uptime: string;
  documents_indexed: number;
  vector_index_size: string;
  model_info: string;
  last_update: string;
}

export function AdminPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch documents on mount
  useEffect(() => {
    fetchDocuments();
    fetchStatus();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/documents`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/system-status`);
      if (!response.ok) throw new Error('Failed to fetch status');
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      console.error('Error fetching status:', err);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrorMessage('');
      setSuccessMessage('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    setIsLoading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Use fetch with progress tracking via XMLHttpRequest for better compatibility
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentCompleted = Math.round((e.loaded * 100) / e.total);
          setUploadProgress(percentCompleted);
        }
      });

      // Handle completion
      xhr.addEventListener('load', async () => {
        if (xhr.status === 200) {
          setUploadProgress(100);
          setUploadStatus('success');
          setSuccessMessage(`✓ ${selectedFile.name} uploaded successfully`);
          setSelectedFile(null);

          // Refresh documents list
          await fetchDocuments();
          await fetchStatus();

          // Reset after 2 seconds
          setTimeout(() => {
            setUploadStatus('idle');
            setUploadProgress(0);
            setSuccessMessage('');
          }, 2000);
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        setUploadStatus('error');
        setErrorMessage('Upload failed - network error');
        setUploadProgress(0);
      });

      // Send the request
      xhr.open('POST', `${API_URL}/upload-document`);
      xhr.send(formData);
    } catch (err) {
      setUploadStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Upload failed');
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (docName: string) => {
    if (!window.confirm(`Delete ${docName}?`)) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/documents/${docName}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccessMessage(`✓ ${docName} deleted`);
        await fetchDocuments();
        await fetchStatus();

        setTimeout(() => {
          setSuccessMessage('');
        }, 2000);
      }
    } catch (err) {
      setErrorMessage('Failed to delete document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRebuildIndex = async () => {
    if (!window.confirm('Rebuild vector index? This may take a moment.')) return;

    setIsLoading(true);
    setUploadStatus('uploading');
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await fetch(`${API_URL}/rebuild-index`, {
        method: 'POST',
      });

      if (response.ok) {
        setUploadStatus('success');
        setSuccessMessage('✓ Index rebuilt successfully');
        await fetchStatus();

        setTimeout(() => {
          setUploadStatus('idle');
          setSuccessMessage('');
        }, 2000);
      }
    } catch (err) {
      setUploadStatus('error');
      setErrorMessage('Failed to rebuild index');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full overflow-y-auto"
      style={{ backgroundColor: 'var(--whitent)' }}
    >
      {/* Animated background */}
      <motion.div
        className="fixed top-0 left-1/4 w-96 h-96 rounded-full blur-[100px] opacity-10 pointer-events-none"
        style={{ backgroundColor: 'var(--koopa-green)' }}
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="relative z-10 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--beluga)' }}>
              Admin Dashboard
            </h1>
            <p style={{ color: 'var(--zinc-dust)' }}>Manage documents and system configuration</p>
          </motion.div>

          {/* Status Messages */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 rounded-lg flex items-center gap-3"
                style={{
                  backgroundColor: '#d4edda',
                  color: '#155724',
                }}
              >
                <CheckCircle size={20} />
                <p>{successMessage}</p>
              </motion.div>
            )}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 rounded-lg flex items-center gap-3"
                style={{
                  backgroundColor: '#f8d7da',
                  color: '#721c24',
                }}
              >
                <AlertCircle size={20} />
                <p>{errorMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* System Status Cards */}
          {status && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
            >
              {[
                { label: 'Status', value: status.status, icon: '🟢' },
                { label: 'Documents', value: status.documents_indexed, icon: '📄' },
                { label: 'Index Size', value: status.vector_index_size, icon: '💾' },
                { label: 'Model', value: status.model_info, icon: '🤖' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  className="p-6 rounded-lg border relative overflow-hidden"
                  style={{
                    backgroundColor: 'var(--dynamic-black)',
                    borderColor: 'var(--black-lacquer)',
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.div
                    className="absolute inset-0 opacity-10"
                    style={{
                      background: 'radial-gradient(circle at 50% 0%, var(--koopa-green), transparent 70%)',
                    }}
                  />
                  <div className="relative z-10">
                    <p className="text-sm mb-2" style={{ color: 'var(--zinc-dust)' }}>
                      {item.icon} {item.label}
                    </p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--beluga)' }}>
                      {item.value}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-6 rounded-lg border mb-8 relative overflow-hidden"
            style={{
              backgroundColor: 'var(--dynamic-black)',
              borderColor: 'var(--black-lacquer)',
            }}
          >
            <motion.div
              className="absolute inset-0 opacity-10"
              style={{
                background: 'radial-gradient(circle at 50% 0%, var(--koopa-green), transparent 70%)',
              }}
            />
            <div className="relative z-10">
              <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--beluga)' }}>
                📂 Upload Document
              </h2>

              <div className="space-y-4">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.csv,.md,.txt,.docx"
                  disabled={isLoading}
                  className="w-full p-3 rounded-lg border-2 border-dashed"
                  style={{
                    borderColor: selectedFile ? 'var(--koopa-green)' : 'var(--black-lacquer)',
                    backgroundColor: 'var(--whitent)',
                    color: 'var(--beluga)',
                  }}
                />

                {selectedFile && (
                  <p style={{ color: 'var(--zinc-dust)' }}>
                    Selected: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}

                {/* Upload Progress */}
                {uploadStatus === 'uploading' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full"
                        style={{
                          backgroundColor: 'var(--koopa-green)',
                          width: `${uploadProgress}%`,
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="text-sm mt-2" style={{ color: 'var(--zinc-dust)' }}>
                      Uploading... {uploadProgress}%
                    </p>
                  </motion.div>
                )}

                <div className="flex gap-3">
                  <motion.button
                    onClick={handleUpload}
                    disabled={!selectedFile || isLoading}
                    className="flex-1 px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: selectedFile && !isLoading ? 'var(--koopa-green)' : 'var(--zinc-dust)',
                      color: 'var(--whitent)',
                      cursor: selectedFile && !isLoading ? 'pointer' : 'not-allowed',
                    }}
                    whileHover={selectedFile && !isLoading ? { scale: 1.02 } : {}}
                    whileTap={selectedFile && !isLoading ? { scale: 0.98 } : {}}
                  >
                    {isLoading && uploadStatus === 'uploading' ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={18} />
                        Upload Document
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    onClick={handleRebuildIndex}
                    disabled={isLoading}
                    className="px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: 'var(--black-lacquer)',
                      color: 'var(--koopa-green)',
                      border: '2px solid var(--koopa-green)',
                      cursor: !isLoading ? 'pointer' : 'not-allowed',
                    }}
                    whileHover={!isLoading ? { scale: 1.02 } : {}}
                    whileTap={!isLoading ? { scale: 0.98 } : {}}
                  >
                    {isLoading && uploadStatus === 'uploading' ? (
                      <Loader size={18} className="animate-spin" />
                    ) : (
                      <RefreshCw size={18} />
                    )}
                    Rebuild Index
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Documents List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="p-6 rounded-lg border relative overflow-hidden"
            style={{
              backgroundColor: 'var(--dynamic-black)',
              borderColor: 'var(--black-lacquer)',
            }}
          >
            <motion.div
              className="absolute inset-0 opacity-10"
              style={{
                background: 'radial-gradient(circle at 50% 0%, var(--koopa-green), transparent 70%)',
              }}
            />
            <div className="relative z-10">
              <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--beluga)' }}>
                📄 Documents ({documents.length})
              </h2>

              {documents.length === 0 ? (
                <p style={{ color: 'var(--zinc-dust)' }}>No documents uploaded yet</p>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc, idx) => (
                    <motion.div
                      key={doc.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 rounded-lg border flex items-center justify-between hover:border-opacity-50 transition-all"
                      style={{
                        backgroundColor: 'var(--whitent)',
                        borderColor: 'var(--black-lacquer)',
                      }}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <FileText size={20} style={{ color: 'var(--koopa-green)' }} />
                        <div>
                          <p className="font-medium" style={{ color: 'var(--beluga)' }}>
                            {doc.name}
                          </p>
                          <p className="text-sm" style={{ color: 'var(--zinc-dust)' }}>
                            {(doc.size / 1024).toFixed(2)} KB • v{doc.version}
                          </p>
                        </div>
                      </div>

                      <motion.button
                        onClick={() => handleDeleteDocument(doc.name)}
                        disabled={isLoading}
                        className="p-2 rounded-lg transition-all"
                        style={{
                          backgroundColor: 'var(--dynamic-black)',
                          color: '#d32f2f',
                          cursor: !isLoading ? 'pointer' : 'not-allowed',
                        }}
                        whileHover={!isLoading ? { scale: 1.1 } : {}}
                        whileTap={!isLoading ? { scale: 0.9 } : {}}
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

import { useState, useCallback } from 'react';
import { api } from './api';

interface DocumentInfo {
  name: string;
  size: number;
  uploadedAt: string;
  version: string;
}

interface AdminStatus {
  status: string;
  uptime: string;
  documents_indexed: number;
  vector_index_size: string;
  model_info: string;
  last_update: string;
}

export function useAdmin() {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [status, setStatus] = useState<AdminStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const docs = await api.getDocuments();
      setDocuments(docs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch documents';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const systemStatus = await api.getAdminStatus();
      setStatus(systemStatus);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch status';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadDocument = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setUploadProgress(0);
    try {
      const result = await api.uploadDocument(file);
      setUploadProgress(100);
      await fetchDocuments();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchDocuments]);

  const deleteDocument = useCallback(
    async (name: string) => {
      setIsLoading(true);
      setError(null);
      try {
        await api.deleteDocument(name);
        await fetchDocuments();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Delete failed';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchDocuments]
  );

  const rebuildIndex = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await api.rebuildIndex();
      await fetchStatus();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Rebuild failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [fetchStatus]);

  return {
    documents,
    status,
    isLoading,
    error,
    uploadProgress,
    fetchDocuments,
    fetchStatus,
    uploadDocument,
    deleteDocument,
    rebuildIndex,
  };
}

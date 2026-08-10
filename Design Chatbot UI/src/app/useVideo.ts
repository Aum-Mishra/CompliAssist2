import { useState, useCallback } from 'react';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface VideoUploadStatus {
  stage: 'idle' | 'uploading' | 'transcribing' | 'embedding' | 'indexing' | 'complete' | 'error';
  progress: number;
  message: string;
  error?: string;
}

export function useVideo() {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<VideoUploadStatus>({
    stage: 'idle',
    progress: 0,
    message: '',
  });

  const uploadVideo = useCallback(
    async (file: File): Promise<boolean> => {
      try {
        setUploadStatus({
          stage: 'uploading',
          progress: 10,
          message: 'Uploading video...',
        });

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_URL}/video/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.status !== 'success' || !data.video_id) {
          throw new Error(data.message || 'Upload failed');
        }

        // Update upload stages
        setUploadStatus({
          stage: 'transcribing',
          progress: 40,
          message: 'Transcribing video...',
        });

        setTimeout(() => {
          setUploadStatus({
            stage: 'embedding',
            progress: 70,
            message: 'Embedding transcript...',
          });
        }, 1000);

        setTimeout(() => {
          setUploadStatus({
            stage: 'indexing',
            progress: 90,
            message: 'Indexing in FAISS...',
          });
        }, 2000);

        // Success
        setVideoId(data.video_id);
        setVideoName(file.name);
        setUploadStatus({
          stage: 'complete',
          progress: 100,
          message: `✅ Video ready! ${data.chunks || '?'} chunks indexed.`,
        });

        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setUploadStatus({
          stage: 'error',
          progress: 0,
          message: 'Upload failed',
          error: errorMessage,
        });
        return false;
      }
    },
    []
  );

  const clearVideo = useCallback(() => {
    setVideoId(null);
    setVideoName(null);
    setUploadStatus({
      stage: 'idle',
      progress: 0,
      message: '',
    });
  }, []);

  const resetUploadStatus = useCallback(() => {
    setUploadStatus({
      stage: 'idle',
      progress: 0,
      message: '',
    });
  }, []);

  return {
    videoId,
    videoName,
    uploadStatus,
    uploadVideo,
    clearVideo,
    resetUploadStatus,
  };
}

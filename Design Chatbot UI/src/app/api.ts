const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface AskResponse {
  success: boolean;
  message: string;
  compliance_allowed: boolean;
  answer: string;
  retrieved_documents: Array<{ source: string; content: string }>;
  answer_citations: Array<{ document_name: string; section: string; page: string }>;
  timestamp: string;
}

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

export interface GraphNode {
  id: string;
  label: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  label: string;
  source_id?: string;
}

export interface GraphDataResponse {
  status: string;
  bot_id: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: {
    nodes: number;
    edges: number;
    triplets: number;
  };
}

export const api = {
  async ask(query: string, videoId?: string | null, sessionId?: string | null): Promise<AskResponse> {
    // ✅ CRITICAL: sessionId MUST be provided by caller
    if (!sessionId) {
      throw new Error('Session ID required. Application must create session on startup.');
    }

    const response = await fetch(`${API_URL}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        query,
        session_id: sessionId,  // ✅ Required
        video_id: videoId || undefined,
        user_id: 'default_user'
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle both success and failure cases
    return {
      success: data.success ?? false,
      message: data.message || 'Unable to process query',
      compliance_allowed: data.compliance_allowed ?? false,
      answer: data.answer || data.message || 'No response available',
      retrieved_documents: data.retrieved_documents || [],
      answer_citations: data.answer_citations || [],
      timestamp: data.timestamp || new Date().toISOString(),
    };
  },

  async uploadDocument(file: File, onProgress?: (progress: number) => void): Promise<{ id: string; status: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/upload-document`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  },

  async getDocuments(): Promise<DocumentInfo[]> {
    const response = await fetch(`${API_URL}/admin/documents`);

    if (!response.ok) {
      throw new Error(`Failed to fetch documents: ${response.statusText}`);
    }

    return response.json();
  },

  async deleteDocument(name: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_URL}/admin/documents/${name}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete document: ${response.statusText}`);
    }

    return response.json();
  },

  async rebuildIndex(): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_URL}/rebuild-index`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to rebuild index: ${response.statusText}`);
    }

    return response.json();
  },

  async getAdminStatus(): Promise<AdminStatus> {
    const response = await fetch(`${API_URL}/admin/system-status`);

    if (!response.ok) {
      throw new Error(`Failed to fetch system status: ${response.statusText}`);
    }

    return response.json();
  },

  async getAuditLogs(limit: number = 50): Promise<any[]> {
    const response = await fetch(`${API_URL}/admin/audit-logs?limit=${limit}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch audit logs: ${response.statusText}`);
    }

    return response.json();
  },

  async getUploadStatus(uploadId: string): Promise<{ status: string; progress: number; error?: string }> {
    const response = await fetch(`${API_URL}/upload-status/${uploadId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch upload status: ${response.statusText}`);
    }

    return response.json();
  },

  async uploadVideo(file: File): Promise<{ status: string; video_id: string; chunks: number; transcript_length: number; message: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/video/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Video upload failed: ${response.statusText}`);
    }

    return response.json();
  },

  async getVideos(): Promise<any[]> {
    const response = await fetch(`${API_URL}/video/list`);

    if (!response.ok) {
      throw new Error(`Failed to fetch videos: ${response.statusText}`);
    }

    const data = await response.json();
    return data.videos || [];
  },

  async getVideoDetails(videoId: string): Promise<any> {
    const response = await fetch(`${API_URL}/video/${videoId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch video details: ${response.statusText}`);
    }

    return response.json();
  },

  async getGraphData(botId: string): Promise<GraphDataResponse> {
    const response = await fetch(`${API_URL}/graph/${botId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch graph data: ${response.statusText}`);
    }
    return response.json();
  },

  async rebuildGraph(botId: string, includeVideo: boolean = false, maxChunks?: number): Promise<any> {
    const params = new URLSearchParams();
    params.append('include_video', String(includeVideo));
    if (typeof maxChunks === 'number' && maxChunks > 0) {
      params.append('max_chunks', String(maxChunks));
    }
    const response = await fetch(`${API_URL}/graph/${botId}/rebuild?${params.toString()}`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(`Failed to queue graph rebuild: ${response.statusText}`);
    }
    return response.json();
  },

  async getGraphRebuildStatus(botId: string): Promise<any> {
    const response = await fetch(`${API_URL}/graph/${botId}/status`);
    if (!response.ok) {
      throw new Error(`Failed to fetch graph rebuild status: ${response.statusText}`);
    }
    return response.json();
  },
};

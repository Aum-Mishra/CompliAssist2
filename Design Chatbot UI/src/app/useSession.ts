// ============================================================================
// FILE: Design Chatbot UI/src/app/useSession.ts
// PURPOSE: Proper session management (like ChatGPT)
// ============================================================================

import { useState, useCallback, useEffect } from 'react';
import { api } from './api';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Session {
  id: string;
  title: string;
  created_at: string;
  message_count: number;
}

export interface SessionState {
  currentSessionId: string | null;
  sessions: Session[];
  isLoadingSessions: boolean;
}

/**
 * useSession Hook
 * 
 * Manages session state exactly like ChatGPT:
 * - One active session at a time
 * - Persists across page reloads in localStorage
 * - Loads all sessions on app start
 * - Creates new session only on "New Chat" click
 */
export function useSession() {
  const [sessionState, setSessionState] = useState<SessionState>({
    currentSessionId: null,
    sessions: [],
    isLoadingSessions: true,
  });

  // Load sessions on app mount
  useEffect(() => {
    initializeSessions();
  }, []);

  // Initialize sessions: load or create
  const initializeSessions = useCallback(async () => {
    console.log('[SESSION] Initializing...');
    
    // Check localStorage for existing session
    const savedSessionId = localStorage.getItem('currentSessionId');
    
    // Load all sessions from backend
    const allSessions = await loadAllSessions();
    
    if (savedSessionId && allSessions.find(s => s.id === savedSessionId)) {
      // Restore previous session
      console.log(`[SESSION] Restoring previous session: ${savedSessionId}`);
      setSessionState({
        currentSessionId: savedSessionId,
        sessions: allSessions,
        isLoadingSessions: false,
      });
    } else {
      // Create new session (first time or previous deleted)
      const newSessionId = await createNewSession();
      if (newSessionId) {
        localStorage.setItem('currentSessionId', newSessionId);
        setSessionState({
          currentSessionId: newSessionId,
          sessions: await loadAllSessions(),
          isLoadingSessions: false,
        });
      }
    }
  }, []);

  // Load all sessions from backend
  const loadAllSessions = useCallback(async (): Promise<Session[]> => {
    try {
      const response = await fetch(`${API_URL}/sessions?user_id=default_user`);
      if (!response.ok) throw new Error('Failed to load sessions');
      
      const data = await response.json();
      return data.sessions || [];
    } catch (error) {
      console.error('[SESSION] Failed to load sessions:', error);
      return [];
    }
  }, []);

  // Create new session via backend
  const createNewSession = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch(`${API_URL}/sessions/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'default_user' })
      });
      
      if (!response.ok) throw new Error('Failed to create session');
      
      const data = await response.json();
      console.log(`[SESSION] Created new session: ${data.session_id}`);
      return data.session_id;
    } catch (error) {
      console.error('[SESSION] Failed to create session:', error);
      return null;
    }
  }, []);

  // Switch to different session
  const switchToSession = useCallback(async (sessionId: string) => {
    console.log(`[SESSION] Switching to: ${sessionId}`);
    localStorage.setItem('currentSessionId', sessionId);
    setSessionState(prev => ({
      ...prev,
      currentSessionId: sessionId,
    }));
  }, []);

  // Create new chat (new session)
  const startNewChat = useCallback(async () => {
    console.log('[SESSION] Starting new chat...');
    const newSessionId = await createNewSession();
    
    if (newSessionId) {
      localStorage.setItem('currentSessionId', newSessionId);
      const allSessions = await loadAllSessions();
      
      setSessionState({
        currentSessionId: newSessionId,
        sessions: allSessions,
        isLoadingSessions: false,
      });
      
      return newSessionId;
    }
    
    return null;
  }, [createNewSession, loadAllSessions]);

  return {
    currentSessionId: sessionState.currentSessionId,
    sessions: sessionState.sessions,
    isLoadingSessions: sessionState.isLoadingSessions,
    switchToSession,
    startNewChat,
    refreshSessions: loadAllSessions,
  };
}

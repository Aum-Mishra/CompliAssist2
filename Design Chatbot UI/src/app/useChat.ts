import { useState, useCallback } from 'react';
import { api } from './api';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  videoId?: string;
  videoName?: string;
}

/**
 * useChat Hook
 * 
 * Manages messages for CURRENT session only.
 * Does NOT create sessions - useSession does that.
 * Simply appends messages to current session.
 */
export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Send message to current session
  const sendMessage = useCallback(
    async (content: string, sessionId: string | null, videoId?: string | null) => {
      // CRITICAL: Must have session ID
      if (!sessionId) {
        const errorMsg = 'No active session. Please reload the page.';
        setError(errorMsg);
        return;
      }

      // Add user message immediately (optimistic update)
      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        content,
        role: 'user',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        videoId: videoId || undefined,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        // ✅ CRITICAL: Pass current session ID
        const response = await api.ask(content, videoId, sessionId);

        // Use answer field, fallback to message
        const answerText = response.answer || response.message || 'Unable to process your query';
        
        const assistantMessage: Message = {
          id: `msg-${Date.now()}-ai`,
          content: answerText,
          role: 'assistant',
          timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        };

        // Append to same session
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);

        const errorAssistantMessage: Message = {
          id: `msg-${Date.now()}-error`,
          content: `⚠️ Error: ${errorMessage}. Make sure the backend is running and VITE_API_URL is configured correctly.`,
          role: 'assistant',
          timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        };

        // Append error message
        setMessages((prev) => [...prev, errorAssistantMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ✅ Set messages (for loading session from backend)
  const setSessionMessages = useCallback((msgs: Message[]) => {
    setMessages(msgs);
  }, []);

  // ✅ Clear for new session
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    setSessionMessages,
  };
}

import { useState, Suspense, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatArea } from './components/ChatArea';
import { AdminPage } from './AdminPage';
import { GraphPage } from './GraphPage';
import { useChat } from './useChat';
import { useSession } from './useSession';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Fallback UI for lazy loading
function LoadingScreen() {
  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--whitent)',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: '48px',
            marginBottom: '20px',
            animation: 'spin 2s linear infinite',
          }}
        >
          ⚙️
        </div>
        <p style={{ color: '#666' }}>Loading Chatbot UI...</p>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<'chat' | 'admin' | 'graph'>('chat');
  const [clearVideoSignal, setClearVideoSignal] = useState(false);  // ✅ NEW
  
  // ✅ Session management (one per app instance)
  const {
    currentSessionId,
    sessions,
    isLoadingSessions,
    switchToSession,
    startNewChat,
  } = useSession();
  
  // ✅ Messages for current session only
  const { messages, isLoading, error, sendMessage, clearMessages, setSessionMessages } = useChat();

  // Load messages when session changes
  useEffect(() => {
    if (currentSessionId) {
      loadSessionMessages(currentSessionId);
    }
  }, [currentSessionId]);

  // Load messages from backend
  const loadSessionMessages = async (sessionId: string) => {
    try {
      // CRITICAL: Clear messages FIRST to avoid stale data from previous session
      setSessionMessages([]);
      console.log(`[APP] Loading messages for session: ${sessionId}`);
      
      const response = await fetch(`${API_URL}/sessions/${sessionId}/messages`);
      if (!response.ok) throw new Error('Failed to load messages');
      
      const data = await response.json();
      const msgs = (data.messages || []).map((msg: any, idx: number) => ({
        id: `msg-${idx}`,
        content: msg.content,
        role: msg.role as 'user' | 'assistant',
        timestamp: msg.timestamp || new Date().toLocaleTimeString(),
      }));
      
      setSessionMessages(msgs);
      console.log(`[APP] ✓ Loaded ${msgs.length} messages for session ${sessionId}`);
    } catch (error) {
      console.error('[APP] Failed to load session messages:', error);
      // Fallback: ensure messages are cleared on error
      setSessionMessages([]);
    }
  };

  // Handle sending message in current session
  const handleSendMessage = (content: string, videoId?: string | null) => {
    if (!currentSessionId) {
      console.error('[APP] No current session');
      return;
    }
    
    sendMessage(content, currentSessionId, videoId);
  };

  // Handle new chat
  const handleNewChat = async () => {
    // CRITICAL: Clear messages FIRST to avoid stale data
    clearMessages();
    console.log('[APP] Cleared messages, creating new session...');
    
    // ✅ NEW: Signal ChatArea to clear video context
    setClearVideoSignal(true);
    
    const newSessionId = await startNewChat();
    if (newSessionId) {
      console.log(`[APP] ✓ New chat created: ${newSessionId}`);
      // useEffect will automatically load messages (empty for new session)
      // Reset signal
      setClearVideoSignal(false);
    } else {
      console.error('[APP] ✗ Failed to create new session');
      setClearVideoSignal(false);
    }
  };

  // Handle session selection from sidebar
  const handleChatSelect = async (sessionId: string) => {
    console.log(`[APP] Loading session: ${sessionId}`);
    await switchToSession(sessionId);
    // Messages will be loaded by useEffect
  };

  const handleAdminClick = () => {
    setCurrentPage('admin');
  };

  const handleBackToChat = () => {
    setCurrentPage('chat');
  };

  const handleGraphClick = () => {
    setCurrentPage('graph');
  };

  // Show loading while initializing
  if (isLoadingSessions) {
    return <LoadingScreen />;
  }

  if (currentPage === 'admin') {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <div className="w-full h-screen flex flex-col relative">
          {/* Back to Chat Button */}
          <motion.button
            onClick={handleBackToChat}
            className="fixed top-4 left-4 z-50 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all"
            style={{
              backgroundColor: 'var(--koopa-green)',
              color: 'var(--whitent)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ← Back to Chat
          </motion.button>
          <AdminPage />
        </div>
      </Suspense>
    );
  }

  if (currentPage === 'graph') {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <div className="w-full h-screen flex flex-col relative">
          <motion.button
            onClick={handleBackToChat}
            className="fixed top-4 left-4 z-50 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all"
            style={{
              backgroundColor: 'var(--koopa-green)',
              color: 'var(--whitent)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ← Back to Chat
          </motion.button>
          <GraphPage />
        </div>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <div className="size-full flex" style={{ backgroundColor: 'var(--whitent)' }}>
        <ChatSidebar
          sessions={sessions}
          currentSessionId={currentSessionId || ''}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
          onAdminClick={handleAdminClick}
          onGraphClick={handleGraphClick}
        />
        <ChatArea 
          messages={messages} 
          onSendMessage={handleSendMessage}
          onClearVideoContext={clearVideoSignal ? () => {} : undefined}  // ✅ NEW: Pass signal
          isTyping={isLoading} 
          isError={!!error} 
        />
      </div>
    </Suspense>
  );
}

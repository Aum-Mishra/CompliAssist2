import { MessageSquare, Plus, Sparkles, Shield, Network } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Session } from '../useSession';

interface ChatSidebarProps {
  sessions: Session[];
  currentSessionId: string;
  onChatSelect: (sessionId: string) => void;
  onNewChat: () => void;
  onAdminClick?: () => void;
  onGraphClick?: () => void;
}

/**
 * ChatSidebar - Like ChatGPT
 * 
 * Shows all sessions with:
 * - First question as title
 * - Current session highlighted
 * - Click to switch sessions
 */
export function ChatSidebar({ sessions, currentSessionId, onChatSelect, onNewChat, onAdminClick, onGraphClick }: ChatSidebarProps) {
  const [isAdmin, setIsAdmin] = useState(false);

  const handleAdminToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdmin(!isAdmin);
    if (!isAdmin && onAdminClick) {
      onAdminClick();
    }
  };

  return (
    <motion.div
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-[280px] h-screen flex flex-col relative overflow-hidden"
      style={{ backgroundColor: 'var(--dynamic-black)' }}
    >
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 0%, var(--koopa-green), transparent 70%)',
        }}
        animate={{
          opacity: [0.05, 0.15, 0.05],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Header */}
      <div className="p-4 border-b relative z-10" style={{ borderColor: 'var(--black-lacquer)' }}>
        <motion.button
          onClick={onNewChat}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg relative overflow-hidden group"
          style={{ backgroundColor: 'var(--koopa-green)' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20"
            transition={{ duration: 0.3 }}
          />
          <motion.div
            animate={{ rotate: [0, 180, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Plus className="w-5 h-5" style={{ color: 'var(--whitent)' }} />
          </motion.div>
          <span className="font-medium relative z-10" style={{ color: 'var(--whitent)' }}>New Chat</span>
          <motion.div
            className="absolute right-2"
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Sparkles className="w-4 h-4" style={{ color: 'var(--whitent)' }} />
          </motion.div>
        </motion.button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2 relative z-10">
        {sessions.length === 0 ? (
          <div className="text-center py-8 opacity-50">
            <p style={{ color: 'var(--zinc-dust)', fontSize: '12px' }}>
              No chats yet. Start a new one!
            </p>
          </div>
        ) : (
          sessions.map((session, index) => {
            const isActive = session.id === currentSessionId;
            return (
              <motion.button
                key={session.id}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                onClick={() => onChatSelect(session.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all group relative overflow-hidden ${
                  isActive ? 'ring-2' : ''
                }`}
                style={{
                  backgroundColor: isActive ? 'var(--koopa-green)' : 'transparent',
                  ringColor: isActive ? 'var(--koopa-green)' : 'transparent',
                }}
                whileHover={{
                  backgroundColor: isActive ? 'var(--koopa-green)' : 'var(--black-lacquer)',
                }}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--zinc-dust)' }} />
                <div className="flex-1 text-left min-w-0">
                  <p
                    className="text-sm truncate font-medium"
                    style={{ color: isActive ? 'var(--whitent)' : 'var(--zinc-dust)' }}
                  >
                    {session.title || 'Untitled'}
                  </p>
                  <p
                    className="text-xs opacity-50"
                    style={{ color: isActive ? 'var(--whitent)' : 'var(--zinc-dust)' }}
                  >
                    {session.message_count} messages
                  </p>
                </div>
              </motion.button>
            );
          })
        )}
      </div>

      {/* Footer - Admin & User Section */}
      <motion.div
        className="p-4 border-t space-y-3 relative z-10"
        style={{ borderColor: 'var(--black-lacquer)' }}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        {/* Admin Panel Button */}
        <motion.button
          onClick={handleAdminToggle}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg relative overflow-hidden group"
          style={{
            backgroundColor: isAdmin ? 'var(--koopa-green)' : 'var(--black-lacquer)',
            color: isAdmin ? 'var(--whitent)' : 'var(--zinc-dust)',
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            animate={isAdmin ? { rotate: [0, 360] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Shield size={20} />
          </motion.div>
          <span className="font-medium flex-1 text-left">Admin Panel</span>
          {isAdmin && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Sparkles size={16} />
            </motion.div>
          )}
        </motion.button>

        <motion.button
          onClick={onGraphClick}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg relative overflow-hidden group"
          style={{
            backgroundColor: 'var(--black-lacquer)',
            color: 'var(--zinc-dust)',
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Network size={20} />
          <span className="font-medium flex-1 text-left">Knowledge Network</span>
        </motion.button>

        {/* User Profile Section */}
        <motion.div
          className="flex items-center gap-3 p-3 rounded-lg"
          style={{ backgroundColor: 'var(--black-lacquer)' }}
        >
          <motion.div
            className="w-8 h-8 rounded-full flex items-center justify-center relative flex-shrink-0"
            style={{ backgroundColor: 'var(--zinc-dust)' }}
            whileHover={{ scale: 1.1 }}
          >
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: 'var(--koopa-green)' }}
              initial={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.2, opacity: 0.3 }}
              transition={{ duration: 0.3 }}
            />
            <span className="text-sm relative z-10" style={{ color: 'var(--beluga)' }}>U</span>
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="text-sm" style={{ color: 'var(--beluga)' }}>User</p>
            <p className="text-xs opacity-60" style={{ color: 'var(--zinc-dust)' }}>online</p>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

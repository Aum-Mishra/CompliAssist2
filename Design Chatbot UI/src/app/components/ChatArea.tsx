import { Send, Sparkles, Video, X, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useVideo } from '../useVideo';
import { api } from '../api';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  videoId?: string;
  videoName?: string;
}

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (message: string, videoId?: string | null) => void;
  isTyping?: boolean;
  isError?: boolean;
  onClearVideoContext?: () => void;  // ✅ NEW: Signal to clear video when session changes
}

export function ChatArea({ messages, onSendMessage, isTyping, isError, onClearVideoContext }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState('');
  const { videoId, videoName, uploadStatus, uploadVideo, clearVideo, resetUploadStatus } = useVideo();
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ✅ NEW: Clear video when new chat created (session changed)
  useEffect(() => {
    if (onClearVideoContext) {
      console.log('[CHATAREA] ✓ Clearing video context for new chat');
      clearVideo();
    }
  }, [onClearVideoContext, clearVideo]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input, videoId);
      setInput('');
    }
  };

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file is actually an MP4
      if (!file.type.startsWith('video/') && !file.name.endsWith('.mp4')) {
        alert('Please select a valid video file (MP4, MOV, AVI, WebM, MKV)');
        return;
      }

      setIsUploadingVideo(true);
      resetUploadStatus();

      try {
        const success = await uploadVideo(file);
        if (success) {
          // Show success message in chat
          const successMessage: Message = {
            id: `msg-${Date.now()}-video`,
            content: `🎥 Video uploaded: ${file.name}\n\nVideo is now indexed and ready for questions. You can ask me anything about this video!`,
            role: 'assistant',
            timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
            videoName: file.name,
          };
          messages.push(successMessage);
        }
      } finally {
        setIsUploadingVideo(false);
        if (videoInputRef.current) {
          videoInputRef.current.value = '';
        }
      }
    }
  };

  const handleVideoButtonClick = () => {
    if (videoId) {
      // Already have a video, show clear option
      if (window.confirm(`Clear current video context (${videoName})? You'll return to normal SOP queries.`)) {
        clearVideo();
      }
    } else {
      // Upload new video
      videoInputRef.current?.click();
    }
  };

  return (
    <div className="flex-1 h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: 'var(--whitent)' }}>
      {/* Animated background effects */}
      <motion.div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[100px] opacity-10"
        style={{ backgroundColor: 'var(--koopa-green)' }}
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-[100px] opacity-10"
        style={{ backgroundColor: 'var(--koopa-green)' }}
        animate={{
          x: [0, -100, 0],
          y: [0, -50, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Header */}
      <motion.div
        className="px-8 py-4 border-b backdrop-blur-sm relative z-10"
        style={{ borderColor: 'var(--dynamic-black)' }}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <Sparkles className="w-5 h-5" style={{ color: 'var(--koopa-green)' }} />
          </motion.div>
          <h2 className="text-xl" style={{ color: 'var(--beluga)' }}>CompliAssist</h2>
          <motion.div
            className="ml-2 px-2 py-1 rounded-full text-xs"
            style={{ backgroundColor: 'var(--koopa-green)', color: 'var(--whitent)' }}
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            Online
          </motion.div>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-8 py-6 relative z-10">
        {messages.length === 0 ? (
          <motion.div
            className="h-full flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center max-w-2xl">
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <h1 className="text-3xl mb-4" style={{ color: 'var(--beluga)' }}>
                  How can I help you today?
                </h1>
              </motion.div>
              <motion.p
                className="opacity-60"
                style={{ color: 'var(--zinc-dust)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.3 }}
              >
                Start a conversation by typing a message below
              </motion.p>
            </div>
          </motion.div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  {message.role === 'assistant' && (
                    <motion.div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                      style={{ backgroundColor: 'var(--koopa-green)' }}
                      whileHover={{ scale: 1.1 }}
                      animate={{
                        boxShadow: [
                          '0 0 0 0 rgba(20, 184, 166, 0.4)',
                          '0 0 0 10px rgba(20, 184, 166, 0)',
                        ],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                    >
                      <span className="text-sm" style={{ color: 'var(--whitent)' }}>AI</span>
                    </motion.div>
                  )}
                  <motion.div
                    className={`max-w-[70%] px-4 py-3 rounded-2xl relative overflow-hidden ${
                      message.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'
                    }`}
                    style={{
                      backgroundColor: message.role === 'user' ? 'var(--koopa-green)' : 'var(--dynamic-black)',
                    }}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: message.role === 'user'
                        ? '0 4px 20px rgba(20, 184, 166, 0.3)'
                        : '0 4px 20px rgba(0, 0, 0, 0.5)',
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 opacity-0 hover:opacity-10"
                      style={{ backgroundColor: 'white' }}
                    />
                    {message.videoUrl && (
                      <div className="mb-2 rounded-lg overflow-hidden">
                        <video
                          src={message.videoUrl}
                          controls
                          className="w-full rounded-lg"
                          style={{ maxHeight: '300px' }}
                        />
                        {message.videoName && (
                          <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                            <span>{message.videoName}</span>
                          </div>
                        )}
                      </div>
                    )}
                    <div 
                      className="relative z-10 prose prose-invert max-w-none text-sm"
                      style={{ 
                        color: 'var(--beluga)',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        lineHeight: '1.6'
                      }}
                    >
                      {message.role === 'assistant' ? (
                        <ReactMarkdown
                          components={{
                            h1: ({ node, ...props }) => <h1 className="text-lg font-bold mt-3 mb-2" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-base font-bold mt-3 mb-2" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-sm font-bold mt-2 mb-1" {...props} />,
                            p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2 ml-2" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-2 ml-2" {...props} />,
                            li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                            code: ({ node, ...props }) => <code className="bg-opacity-20 px-2 py-1 rounded text-xs" {...props} />,
                            a: ({ node, ...props }) => <a className="underline opacity-80 hover:opacity-100" {...props} />,
                            blockquote: ({ node, ...props }) => <blockquote className="border-l-4 pl-3 italic opacity-70" {...props} />,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        <p>{message.content}</p>
                      )}
                    </div>
                    <p className="text-xs mt-2 opacity-50 relative z-10" style={{ color: 'var(--zinc-dust)' }}>
                      {message.timestamp}
                    </p>
                  </motion.div>
                  {message.role === 'user' && (
                    <motion.div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'var(--zinc-dust)' }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <span className="text-sm" style={{ color: 'var(--beluga)' }}>U</span>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  className="flex gap-4 justify-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <motion.div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'var(--koopa-green)' }}
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                    }}
                  >
                    <span className="text-sm" style={{ color: 'var(--whitent)' }}>AI</span>
                  </motion.div>
                  <div
                    className="px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center"
                    style={{ backgroundColor: 'var(--dynamic-black)' }}
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: 'var(--koopa-green)' }}
                        animate={{
                          y: [0, -8, 0],
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Input Area */}
      <motion.div
        className="px-8 py-6 border-t backdrop-blur-sm relative z-10"
        style={{ borderColor: 'var(--dynamic-black)' }}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          {/* Video upload status indicator */}
          {isUploadingVideo && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-3 p-3 rounded-lg"
              style={{
                backgroundColor: 'var(--dynamic-black)',
                borderLeft: '3px solid var(--koopa-green)',
              }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Video size={18} style={{ color: 'var(--koopa-green)' }} />
                </motion.div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: 'var(--beluga)' }}>
                    {uploadStatus.message}
                  </p>
                  {uploadStatus.stage !== 'error' && (
                    <motion.div
                      className="mt-2 h-1 rounded-full bg-opacity-30"
                      style={{ backgroundColor: 'var(--koopa-green)' }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: 'var(--koopa-green)' }}
                        initial={{ width: '10%' }}
                        animate={{ width: `${uploadStatus.progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </motion.div>
                  )}
                </div>
                {uploadStatus.stage === 'error' && (
                  <AlertCircle size={20} style={{ color: '#ef4444' }} />
                )}
              </div>
              {uploadStatus.error && (
                <p className="text-xs mt-2 opacity-60" style={{ color: '#ef4444' }}>
                  {uploadStatus.error}
                </p>
              )}
            </motion.div>
          )}

          {/* Video active indicator */}
          {videoId && !isUploadingVideo && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-3 p-3 rounded-lg flex items-center justify-between"
              style={{
                backgroundColor: 'var(--dynamic-black)',
                borderLeft: '3px solid var(--koopa-green)',
              }}
            >
              <div className="flex items-center gap-2 flex-1">
                <CheckCircle size={18} style={{ color: 'var(--koopa-green)' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--beluga)' }}>
                    🎥 Video Context Active
                  </p>
                  <p className="text-xs opacity-60 truncate" style={{ color: 'var(--zinc-dust)' }}>
                    {videoName}
                  </p>
                </div>
              </div>
              <motion.button
                onClick={clearVideo}
                type="button"
                className="px-3 py-1 rounded text-sm font-medium flex items-center gap-2"
                style={{
                  backgroundColor: 'var(--black-lacquer)',
                  color: 'var(--zinc-dust)',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X size={14} />
                Clear
              </motion.button>
            </motion.div>
          )}

          {/* Input form */}
          <motion.div
            className="flex items-center gap-3 px-4 py-3 rounded-full relative overflow-hidden"
            style={{ backgroundColor: 'var(--dynamic-black)' }}
            whileFocus={{ scale: 1.02 }}
          >
            <motion.div
              className="absolute inset-0 opacity-0"
              style={{
                background: 'linear-gradient(90deg, transparent, var(--koopa-green), transparent)',
                opacity: 0.1,
              }}
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            
            {/* Video button */}
            <motion.button
              onClick={handleVideoButtonClick}
              type="button"
              disabled={isUploadingVideo}
              className="w-10 h-10 rounded-full flex items-center justify-center relative overflow-hidden flex-shrink-0"
              style={{
                backgroundColor: videoId && !isUploadingVideo ? 'var(--koopa-green)' : 'var(--black-lacquer)',
                color: videoId && !isUploadingVideo ? 'var(--whitent)' : 'var(--zinc-dust)',
                opacity: isUploadingVideo ? 0.5 : 1,
              }}
              whileHover={!isUploadingVideo ? { scale: 1.1 } : {}}
              whileTap={!isUploadingVideo ? { scale: 0.9 } : {}}
              title={videoId ? `Clear video (${videoName})` : 'Upload video'}
            >
              {isUploadingVideo ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Video size={18} />
                </motion.div>
              ) : (
                <Video size={18} />
              )}
            </motion.button>

            {/* Hidden video input */}
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/x-msvideo,.mp4,.mov,.avi,.webm,.mkv"
              onChange={handleVideoSelect}
              className="hidden"
            />
            
            {/* Input field */}
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
              className="flex-1 bg-transparent outline-none placeholder:opacity-50 relative z-10"
              style={{ color: 'var(--beluga)' }}
            />
            <motion.button
              type="submit"
              disabled={isTyping || !input.trim() || isUploadingVideo}
              className="w-10 h-10 rounded-full flex items-center justify-center relative overflow-hidden flex-shrink-0"
              style={{ 
                backgroundColor: (isTyping || !input.trim() || isUploadingVideo) ? 'var(--zinc-dust)' : 'var(--koopa-green)',
              }}
              whileHover={!isTyping && input.trim() && !isUploadingVideo ? { scale: 1.1 } : {}}
              whileTap={!isTyping && input.trim() && !isUploadingVideo ? { scale: 0.9 } : {}}
              animate={
                isTyping ? {
                  opacity: [0.7, 1, 0.7],
                } : {
                  boxShadow: [
                    '0 0 0 0 rgba(20, 184, 166, 0.7)',
                    '0 0 0 10px rgba(20, 184, 166, 0)',
                  ],
                }
              }
              transition={{
                duration: isTyping ? 1 : 1.5,
                repeat: Infinity,
              }}
              title={videoId ? `Ask video (context: ${videoName})` : 'Ask question'}
            >
              <motion.div
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Send className="w-5 h-5" style={{ color: 'var(--whitent)' }} />
              </motion.div>
            </motion.button>
          </motion.div>
          <motion.p
            className="text-xs mt-3 text-center opacity-50"
            style={{ color: 'var(--zinc-dust)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.5 }}
          >
            AI can make mistakes. Consider checking important information.
          </motion.p>
        </form>
      </motion.div>
    </div>
  );
}
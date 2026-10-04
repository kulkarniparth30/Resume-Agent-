import { useState, useEffect, useRef } from 'react';
import { 
  Send, Bot, Sparkles, User, Briefcase, MapPin, Plus, Trash2, 
  MessageSquare, RefreshCw, PanelLeftClose, PanelLeft, Clock,
  ChevronRight, ArrowRight
} from 'lucide-react';
import useAgentStore from '../store/useAgentStore';
import useChatStore from '../store/useChatStore';
import ChatMessage from '../components/ChatMessage';

export default function Chat() {
  const user = useAgentStore((s) => s.user);

  // Global chat store state & actions (ChatGPT / Claude style)
  const threads = useChatStore((s) => s.threads);
  const activeThreadId = useChatStore((s) => s.activeThreadId);
  const loading = useChatStore((s) => s.loading);
  const generatingThreadId = useChatStore((s) => s.generatingThreadId);
  const profile = useChatStore((s) => s.profile);
  const profileLoading = useChatStore((s) => s.profileLoading);
  
  const setActiveThreadId = useChatStore((s) => s.setActiveThreadId);
  const createNewConversation = useChatStore((s) => s.createNewConversation);
  const deleteConversation = useChatStore((s) => s.deleteConversation);
  const loadProfile = useChatStore((s) => s.loadProfile);
  const sendMessage = useChatStore((s) => s.sendMessage);

  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);

  const messagesEndRef = useRef(null);

  // Current active thread
  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];
  const messages = activeThread?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (user?.id) {
      loadProfile(user.id);
    }
  }, [user]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;
    const textToSend = input;
    setInput('');
    sendMessage(textToSend, user);
  };

  const handleQuickPrompt = (promptText) => {
    sendMessage(promptText, user);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-3 h-[calc(100vh-100px)] flex gap-4 overflow-hidden">
      
      {/* ================= LEFT SIDEBAR: THREADS / SESSIONS ================= */}
      <div 
        className={`bg-white rounded-3xl border border-border shadow-sm flex flex-col transition-all duration-300 z-20 ${
          sidebarOpen ? 'w-72 sm:w-80 shrink-0' : 'w-0 -ml-4 p-0 opacity-0 overflow-hidden pointer-events-none'
        }`}
      >
        {/* Sidebar Header: New Chat Button */}
        <div className="p-4 border-b border-border flex items-center justify-between gap-2">
          <button
            onClick={() => createNewConversation()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-white text-sm font-bold rounded-2xl hover:bg-primary-light transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
          
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 text-text-muted hover:text-dark hover:bg-surface-alt rounded-xl transition-colors cursor-pointer"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>

        {/* Sessions / Context Windows List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          <div className="px-2 py-1 text-[11px] font-bold text-text-muted uppercase tracking-wider">
            Previous Conversations
          </div>

          {threads.map((thread) => {
            const isActive = thread.id === activeThreadId;
            const isGeneratingThis = loading && generatingThreadId === thread.id;

            return (
              <div
                key={thread.id}
                onClick={() => setActiveThreadId(thread.id)}
                className={`group flex items-center justify-between gap-2 p-3 rounded-2xl text-xs font-semibold cursor-pointer transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/25 shadow-xs'
                    : 'text-dark hover:bg-surface-alt border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {isGeneratingThis ? (
                    <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0"></span>
                  ) : (
                    <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-text-muted'}`} />
                  )}
                  <span className="truncate leading-normal">
                    {thread.title || 'Untitled Session'}
                  </span>
                </div>

                {/* Delete Thread Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(thread.id);
                  }}
                  className={`opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-all ${
                    threads.length === 1 ? 'hidden' : ''
                  }`}
                  title="Delete chat thread"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Profile Card Footer */}
        <div className="p-3 border-t border-border bg-surface-alt/50 rounded-b-3xl">
          <div 
            onClick={() => setShowProfileDrawer(!showProfileDrawer)}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-surface-alt cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-dark truncate">
                  {profile?.target_role || 'Target Role'}
                </p>
                <p className="text-[10px] text-text-muted truncate">
                  {profile?.skills?.length || 0} skills synced
                </p>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 text-text-muted transition-transform ${showProfileDrawer ? 'rotate-90' : ''}`} />
          </div>

          {/* Quick Drawer if expanded */}
          {showProfileDrawer && (
            <div className="mt-2 p-3 bg-white rounded-xl border border-border text-xs space-y-2 animate-slide-up">
              <div>
                <span className="text-[10px] font-bold text-text-muted uppercase">Preferred Location</span>
                <p className="font-semibold text-dark truncate">{profile?.location || 'Remote / India'}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-text-muted uppercase">Tracked Skills</span>
                <div className="flex flex-wrap gap-1 mt-1 max-h-20 overflow-y-auto">
                  {profile?.skills?.slice(0, 8).map((s, idx) => (
                    <span key={idx} className="text-[10px] bg-surface-alt px-1.5 py-0.5 rounded border border-border">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= MAIN CHAT PANEL ================= */}
      <div className="flex-1 flex flex-col bg-white rounded-3xl border border-border shadow-sm overflow-hidden h-full">
        
        {/* Chat Header */}
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between bg-surface-alt/40">
          <div className="flex items-center gap-3 min-w-0">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-text-muted hover:text-dark hover:bg-surface-alt rounded-xl transition-colors cursor-pointer mr-1"
                title="Open history sidebar"
              >
                <PanelLeft className="w-5 h-5" />
              </button>
            )}

            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white shadow-sm shrink-0">
              <Bot className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold text-dark truncate">
                  {activeThread?.title || 'Career Copilot'}
                </h2>
                {loading && generatingThreadId === activeThreadId ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    Thinking...
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold bg-success/15 text-success px-2 py-0.5 rounded-full shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
                    Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-text-muted truncate">
                Context window saved across tabs & sessions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => user?.id && loadProfile(user.id)}
              disabled={profileLoading}
              title="Sync Profile"
              className="p-2 text-text-muted hover:text-dark rounded-xl hover:bg-surface-alt transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${profileLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-2 bg-[#FAF8F5]/30">
          {messages.map((m) => (
            <ChatMessage key={m.id} message={m} />
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills if new or short thread */}
        {messages.length <= 2 && !loading && (
          <div className="px-5 py-2 border-t border-border/40 bg-surface-alt/30 overflow-x-auto flex gap-2 no-scrollbar">
            <button
              onClick={() => handleQuickPrompt('Generate a 3-month roadmap to become a Machine Learning Engineer')}
              className="text-xs py-1.5 px-3 rounded-xl bg-white hover:bg-primary/10 hover:text-primary border border-border transition-colors text-text-secondary whitespace-nowrap cursor-pointer shrink-0"
            >
              🗺️ 3-Month ML Roadmap
            </button>
            <button
              onClick={() => handleQuickPrompt('Find remote Python and FastAPI developer jobs for me')}
              className="text-xs py-1.5 px-3 rounded-xl bg-white hover:bg-primary/10 hover:text-primary border border-border transition-colors text-text-secondary whitespace-nowrap cursor-pointer shrink-0"
            >
              💼 Python & FastAPI Jobs
            </button>
            <button
              onClick={() => handleQuickPrompt('What are my biggest skill gaps for a Senior Backend Developer?')}
              className="text-xs py-1.5 px-3 rounded-xl bg-white hover:bg-primary/10 hover:text-primary border border-border transition-colors text-text-secondary whitespace-nowrap cursor-pointer shrink-0"
            >
              🎯 My Skill Gaps
            </button>
            <button
              onClick={() => handleQuickPrompt('Rewrite this bullet with Google XYZ formula: "Implemented user authentication with JWT"')}
              className="text-xs py-1.5 px-3 rounded-xl bg-white hover:bg-primary/10 hover:text-primary border border-border transition-colors text-text-secondary whitespace-nowrap cursor-pointer shrink-0"
            >
              ✍️ Rewrite Resume Bullet
            </button>
          </div>
        )}

        {/* Prompt Input Bar */}
        <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-border bg-white flex gap-2 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Copilot anything (roadmaps, jobs, bullets, outreach)..."
            className="flex-1 px-4 py-3 bg-surface-alt/60 border border-border rounded-2xl text-sm focus:outline-none focus:border-primary text-dark placeholder:text-text-muted"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 bg-dark hover:bg-black text-white font-bold rounded-2xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}

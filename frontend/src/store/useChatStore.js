import { create } from 'zustand';
import { sendChatMessageStream, sendChatMessage, fetchUserProfile } from '../api/chat';
import useAgentStore from './useAgentStore';

const STORAGE_KEY = 'copilot_chat_sessions_v2';
const ACTIVE_ID_KEY = 'copilot_active_thread_id_v2';

const DEFAULT_WELCOME_MSG = {
  id: 'welcome',
  sender: 'bot',
  text: "👋 Hi! I'm your Career Copilot. I can search matching jobs, inspect your skill gaps, generate tailored learning roadmaps, evaluate ATS scores, and remember your job preferences. What career goal or job search can I help you with today?",
  tools: [],
  isStreaming: false,
  activeTool: null,
};

const createNewThread = () => {
  const id = 'th_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  return {
    id,
    title: 'New Conversation',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [DEFAULT_WELCOME_MSG],
  };
};

const loadInitialThreads = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load chat sessions:', e);
  }
  const initial = createNewThread();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([initial]));
  } catch {}
  return [initial];
};

const loadInitialActiveId = (threads) => {
  try {
    const savedId = localStorage.getItem(ACTIVE_ID_KEY);
    if (savedId && threads.some(t => t.id === savedId)) {
      return savedId;
    }
  } catch {}
  return threads[0]?.id || '';
};

const initialThreads = loadInitialThreads();
const initialActiveId = loadInitialActiveId(initialThreads);

export const useChatStore = create((set, get) => ({
  threads: initialThreads,
  activeThreadId: initialActiveId,
  loading: false,
  generatingThreadId: null,
  profile: null,
  profileLoading: false,

  _persist: (threads, activeId) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
      if (activeId) {
        localStorage.setItem(ACTIVE_ID_KEY, activeId);
      }
    } catch (e) {
      console.warn('Failed to persist chat sessions:', e);
    }
  },

  setActiveThreadId: (id) => {
    set({ activeThreadId: id });
    try {
      localStorage.setItem(ACTIVE_ID_KEY, id);
    } catch {}
  },

  createNewConversation: () => {
    const newThread = createNewThread();
    set((state) => {
      const updated = [newThread, ...state.threads];
      get()._persist(updated, newThread.id);
      return {
        threads: updated,
        activeThreadId: newThread.id,
      };
    });
    return newThread.id;
  },

  deleteConversation: (id) => {
    set((state) => {
      let updated = state.threads.filter((t) => t.id !== id);
      if (updated.length === 0) {
        const fresh = createNewThread();
        updated = [fresh];
      }
      const nextActiveId = state.activeThreadId === id ? updated[0].id : state.activeThreadId;
      get()._persist(updated, nextActiveId);
      return {
        threads: updated,
        activeThreadId: nextActiveId,
      };
    });
  },

  loadProfile: async (userId) => {
    if (!userId) return;
    set({ profileLoading: true });
    try {
      const data = await fetchUserProfile(userId);
      set({ profile: data, profileLoading: false });
    } catch (err) {
      console.warn('Could not load user profile in chat store:', err);
      set({ profileLoading: false });
    }
  },

  // Stream message in real-time with tool calling indicators
  sendMessage: async (text, user) => {
    if (!text || !text.trim() || get().loading) return;

    const trimmed = text.trim();
    const threadId = get().activeThreadId;
    const userId = user?.id || user?.email || 'default_user';

    const userMsg = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toISOString(),
    };

    const botMsgId = 'bot_' + Date.now();
    const botMsg = {
      id: botMsgId,
      sender: 'bot',
      text: '',
      tools: [],
      activeTool: null,
      isStreaming: true,
      timestamp: new Date().toISOString(),
    };

    // 1. Append user message & placeholder bot message
    set((state) => {
      const updatedThreads = state.threads.map((t) => {
        if (t.id === threadId) {
          const isFirstUserMsg = !t.messages.some((m) => m.sender === 'user');
          const newTitle = isFirstUserMsg
            ? trimmed.length > 32
              ? trimmed.substring(0, 32) + '...'
              : trimmed
            : t.title;

          return {
            ...t,
            title: newTitle,
            updatedAt: new Date().toISOString(),
            messages: [...t.messages, userMsg, botMsg],
          };
        }
        return t;
      });

      return {
        threads: updatedThreads,
        loading: true,
        generatingThreadId: threadId,
      };
    });

    // 2. Stream tokens & tool events
    await sendChatMessageStream({
      userId,
      threadId,
      message: trimmed,

      onToken: (content) => {
        set((state) => {
          const updatedThreads = state.threads.map((t) => {
            if (t.id === threadId) {
              const updatedMsgs = t.messages.map((m) => {
                if (m.id === botMsgId) {
                  return {
                    ...m,
                    text: m.text + content,
                    activeTool: null,
                  };
                }
                return m;
              });
              return { ...t, messages: updatedMsgs };
            }
            return t;
          });
          return { threads: updatedThreads };
        });
      },

      onToolStart: (toolName, input) => {
        set((state) => {
          const updatedThreads = state.threads.map((t) => {
            if (t.id === threadId) {
              const updatedMsgs = t.messages.map((m) => {
                if (m.id === botMsgId) {
                  const existingTools = m.tools || [];
                  return {
                    ...m,
                    activeTool: toolName,
                    tools: existingTools.includes(toolName) ? existingTools : [...existingTools, toolName],
                  };
                }
                return m;
              });
              return { ...t, messages: updatedMsgs };
            }
            return t;
          });
          return { threads: updatedThreads };
        });
      },

      onToolEnd: (toolName) => {
        set((state) => {
          const updatedThreads = state.threads.map((t) => {
            if (t.id === threadId) {
              const updatedMsgs = t.messages.map((m) => {
                if (m.id === botMsgId) {
                  return {
                    ...m,
                    activeTool: null,
                  };
                }
                return m;
              });
              return { ...t, messages: updatedMsgs };
            }
            return t;
          });
          return { threads: updatedThreads };
        });
      },

      onDone: (data) => {
        try {
          if (data?.saved_roadmap) {
            const rm = data.saved_roadmap;
            useAgentStore.getState().setRoadmapData(
              rm.roadmap || rm.months || rm.roadmap_data,
              rm.target_role || rm.role,
              rm.roadmap_id || rm.id
            );
          } else if (data?.tool_calls_made && data.tool_calls_made.includes('get_roadmap')) {
            useAgentStore.getState().fetchUserRoadmaps(userId);
          }
        } catch (syncErr) {
          console.warn('Roadmap store sync notice:', syncErr);
        }

        set((state) => {
          const updatedThreads = state.threads.map((t) => {
            if (t.id === threadId) {
              const updatedMsgs = t.messages.map((m) => {
                if (m.id === botMsgId) {
                  return {
                    ...m,
                    text: m.text || data.response || "Here is what I found for you.",
                    isStreaming: false,
                    activeTool: null,
                    isOffTopic: data.is_off_topic,
                    tools: data.tool_calls_made || m.tools || [],
                  };
                }
                return m;
              });
              return {
                ...t,
                updatedAt: new Date().toISOString(),
                messages: updatedMsgs,
              };
            }
            return t;
          });

          get()._persist(updatedThreads, state.activeThreadId);
          return {
            threads: updatedThreads,
            loading: false,
            generatingThreadId: null,
            profile: data.profile || state.profile,
          };
        });
      },

      onError: (errMsg) => {
        console.error('Streaming error callback:', errMsg);
        set((state) => {
          const updatedThreads = state.threads.map((t) => {
            if (t.id === threadId) {
              const updatedMsgs = t.messages.map((m) => {
                if (m.id === botMsgId) {
                  return {
                    ...m,
                    text: m.text || "Sorry, I encountered an issue connecting to the Career Copilot service. Please try again in a moment.",
                    isStreaming: false,
                    activeTool: null,
                  };
                }
                return m;
              });
              return { ...t, messages: updatedMsgs };
            }
            return t;
          });

          get()._persist(updatedThreads, state.activeThreadId);
          return {
            threads: updatedThreads,
            loading: false,
            generatingThreadId: null,
          };
        });
      },
    });
  },
}));

export default useChatStore;

import { create } from 'zustand';
import { fetchHistory, saveHistory, getCurrentUser, logout as apiLogout } from '../api/auth';

const getInitialSkills = () => {
  try {
    const saved = localStorage.getItem('saved_skills');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const getInitialHistory = () => {
  try {
    const saved = localStorage.getItem('analysis_history');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const getInitialUser = () => {
  try {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const getInitialProjectGuides = () => {
  try {
    const saved = localStorage.getItem('project_guides_cache');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const useAgentStore = create((set, get) => ({
  // Inputs
  resumeText: '',
  resumeFile: null,
  resumeFileName: '',
  jobRole: '',
  jdText: '',
  manualSkills: getInitialSkills(),

  // Results
  analysisResult: null,
  analysisHistory: getInitialHistory(),
  projectGuidesCache: getInitialProjectGuides(),
  
  // Roadmap
  roadmapData: null,
  
  // Resume Builder Data
  resumeData: {
    name: '',
    location: '',
    phone: '',
    email: '',
    links: [],
    summary: '',
    experiences: [],
    education: [],
    projects: [],
    skillCategories: [],
    publications: [],
    achievements: [],
    certifications: [],
  },

  // Loading
  isLoading: false,
  currentStep: '',
  completedSteps: [],
  
  // Auth & Modals
  user: getInitialUser(),
  authModalOpen: false,
  authModalTab: 'login',

  // Actions — Inputs
  setResumeText: (text) => set({ resumeText: text }),
  setResumeFile: (file) => set({ resumeFile: file, resumeFileName: file?.name || '' }),
  setJobRole: (role) => set({ jobRole: role }),
  setJdText: (text) => set({ jdText: text }),
  
  addSkill: (skill) => set((state) => {
    if (state.manualSkills.includes(skill)) return state;
    const updated = [...state.manualSkills, skill];
    try {
      localStorage.setItem('saved_skills', JSON.stringify(updated));
    } catch {}
    return { manualSkills: updated };
  }),

  removeSkill: (skill) => set((state) => {
    const updated = state.manualSkills.filter((s) => s !== skill);
    try {
      localStorage.setItem('saved_skills', JSON.stringify(updated));
    } catch {}
    return { manualSkills: updated };
  }),

  setManualSkills: (skills) => {
    try {
      localStorage.setItem('saved_skills', JSON.stringify(skills));
    } catch {}
    set({ manualSkills: skills });
  },

  // Actions — Analysis & History
  setAnalysisResult: (result) => set({ analysisResult: result }),
  
  addAnalysisToHistory: async (entry) => {
    const state = get();
    const updatedHistory = [entry, ...state.analysisHistory];
    
    // Save to local storage
    try {
      localStorage.setItem('analysis_history', JSON.stringify(updatedHistory));
    } catch {}
    set({ analysisHistory: updatedHistory });

    // Sync to Supabase if token exists
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await saveHistory({
          jobRole: entry.jobRole,
          jdText: entry.jdText,
          resumeText: state.resumeText,
          analysisResult: entry.result,
        });
      } catch (err) {
        console.error('Failed to sync analysis to Supabase:', err);
      }
    }
  },

  loadAnalysisFromHistory: (index) => set((state) => {
    const entry = state.analysisHistory[index];
    if (entry) {
      return {
        analysisResult: entry.result || entry.analysis_result,
        jobRole: entry.jobRole || entry.job_role,
        jdText: entry.jdText || entry.jd_text,
      };
    }
    return {};
  }),

  syncCloudHistory: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const cloudItems = await fetchHistory();
      if (Array.isArray(cloudItems) && cloudItems.length > 0) {
        const formatted = cloudItems.map(item => ({
          id: item.id,
          date: item.created_at || new Date().toISOString(),
          jobRole: item.job_role,
          jdText: item.jd_text,
          result: item.analysis_result,
        }));
        
        // Merge with local history avoiding duplicates
        const local = get().analysisHistory;
        const merged = [...formatted];
        for (const loc of local) {
          if (!merged.some(m => m.jobRole === loc.jobRole && m.date === loc.date)) {
            merged.push(loc);
          }
        }
        localStorage.setItem('analysis_history', JSON.stringify(merged));
        set({ analysisHistory: merged });
      }
    } catch (err) {
      console.error('Error syncing cloud history:', err);
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setCurrentStep: (step) => set({ currentStep: step }),
  addCompletedStep: (step) => set((state) => ({
    completedSteps: [...state.completedSteps, step]
  })),
  resetLoading: () => set({ isLoading: false, currentStep: '', completedSteps: [] }),

  // Actions — Project Guide Cache
  setProjectGuideCache: (name, guide) => set((state) => {
    const updated = { ...state.projectGuidesCache, [name]: guide };
    try {
      localStorage.setItem('project_guides_cache', JSON.stringify(updated));
    } catch {}
    return { projectGuidesCache: updated };
  }),

  // Actions — Roadmap
  setRoadmapData: (data) => set({ roadmapData: data }),

  // Actions — Resume Builder
  setResumeData: (data) => set({ resumeData: data }),
  updateResumeField: (field, value) => set((state) => ({
    resumeData: { ...state.resumeData, [field]: value }
  })),

  // Actions — Auth & Modals
  setUser: (user) => {
    try {
      if (user) {
        localStorage.setItem('auth_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('auth_user');
      }
    } catch {}
    set({ user });
  },
  openAuthModal: (tab = 'login') => set({ authModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ authModalOpen: false }),
  logout: () => {
    apiLogout();
    set({ user: null });
  },

  initAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const user = await getCurrentUser();
      if (user) {
        set({ user });
        try {
          localStorage.setItem('auth_user', JSON.stringify(user));
        } catch {}
        get().syncCloudHistory();
      }
    } catch (err) {
      console.warn('Background token refresh notice:', err);
      // Do not wipe cached user if network is momentarily slow
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('auth_user');
        set({ user: null });
      }
    }
  },

  // Reset all
  resetAll: () => set({
    resumeText: '',
    resumeFile: null,
    resumeFileName: '',
    jobRole: '',
    jdText: '',
    analysisResult: null,
    roadmapData: null,
    isLoading: false,
    currentStep: '',
    completedSteps: [],
  }),

  // Has any input
  hasInput: () => {
    const state = get();
    return !!(state.resumeText || state.resumeFile || state.jobRole || state.jdText || state.manualSkills.length > 0);
  },
}));

export default useAgentStore;

import { create } from 'zustand';

const useAgentStore = create((set, get) => ({
  // Inputs
  resumeText: '',
  resumeFile: null,
  resumeFileName: '',
  jobRole: '',
  jdText: '',
  manualSkills: [],

  // Results
  analysisResult: null,
  
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
  
  // Auth
  user: null,

  // Actions — Inputs
  setResumeText: (text) => set({ resumeText: text }),
  setResumeFile: (file) => set({ resumeFile: file, resumeFileName: file?.name || '' }),
  setJobRole: (role) => set({ jobRole: role }),
  setJdText: (text) => set({ jdText: text }),
  addSkill: (skill) => set((state) => ({
    manualSkills: state.manualSkills.includes(skill) 
      ? state.manualSkills 
      : [...state.manualSkills, skill]
  })),
  removeSkill: (skill) => set((state) => ({
    manualSkills: state.manualSkills.filter((s) => s !== skill)
  })),
  setManualSkills: (skills) => set({ manualSkills: skills }),

  // Actions — Analysis
  setAnalysisResult: (result) => set({ analysisResult: result }),
  setLoading: (loading) => set({ isLoading: loading }),
  setCurrentStep: (step) => set({ currentStep: step }),
  addCompletedStep: (step) => set((state) => ({
    completedSteps: [...state.completedSteps, step]
  })),
  resetLoading: () => set({ isLoading: false, currentStep: '', completedSteps: [] }),

  // Actions — Roadmap
  setRoadmapData: (data) => set({ roadmapData: data }),

  // Actions — Resume Builder
  setResumeData: (data) => set({ resumeData: data }),
  updateResumeField: (field, value) => set((state) => ({
    resumeData: { ...state.resumeData, [field]: value }
  })),

  // Actions — Auth
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),

  // Reset all
  resetAll: () => set({
    resumeText: '',
    resumeFile: null,
    resumeFileName: '',
    jobRole: '',
    jdText: '',
    manualSkills: [],
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

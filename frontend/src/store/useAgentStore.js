import { create } from 'zustand';

const DUMMY_RESULT = {
  candidate_skills: ["Python", "React", "SQL", "Flask", "HTML", "CSS"],
  required_skills: ["Python", "Machine Learning", "SQL", "Docker", "FastAPI", "AWS", "TensorFlow", "React"],
  skill_gap: [
    { skill: "Machine Learning", importance: 4.8, rank: 1 },
    { skill: "Docker", importance: 4.2, rank: 2 },
    { skill: "AWS", importance: 4.0, rank: 3 },
    { skill: "TensorFlow", importance: 3.8, rank: 4 },
    { skill: "FastAPI", importance: 3.5, rank: 5 }
  ],
  ats_score: 68,
  gap_score: 42,
  match_percent: 62,
  fake_skills: [
    { skill: "Machine Learning", reason: "Listed in skills but no ML project or certification found" },
  ],
  suggestions: [
    { skill: "Scikit-learn", related_to: "Machine Learning", weeks: 2 },
    { skill: "Docker Compose", related_to: "Docker", weeks: 1 },
    { skill: "AWS EC2", related_to: "AWS", weeks: 3 }
  ],
  jobs: [
    { title: "ML Engineer", company: "Zepto", location: "Pune", match: 71, salary: "8-12 LPA" },
    { title: "Backend Developer", company: "Razorpay", location: "Remote", match: 85, salary: "10-15 LPA" },
    { title: "Data Scientist", company: "Swiggy", location: "Bangalore", match: 64, salary: "9-14 LPA" }
  ],
  courses: [
    { name: "ML Specialization", platform: "Coursera", rating: 4.9, price: "Free", skill: "Machine Learning" },
    { name: "Docker Mastery", platform: "Udemy", rating: 4.7, price: "₹499", skill: "Docker" },
    { name: "AWS Cloud Practitioner", platform: "Coursera", rating: 4.8, price: "Free", skill: "AWS" }
  ],
  project_ideas: [
    {
      name: "ML API Service",
      description: "Build a FastAPI backend that serves a scikit-learn model with Docker deployment on AWS EC2",
      skills_covered: ["FastAPI", "Machine Learning", "Docker", "AWS"],
      estimated_time: "2 weekends"
    },
    {
      name: "Resume Parser Pipeline",
      description: "Create an NLP pipeline that extracts skills, education, and experience from PDF resumes",
      skills_covered: ["Machine Learning", "Python", "TensorFlow"],
      estimated_time: "1 weekend"
    },
    {
      name: "Cloud Deployment Dashboard",
      description: "Build a monitoring dashboard for Docker containers running on AWS with real-time logs",
      skills_covered: ["Docker", "AWS", "React"],
      estimated_time: "3 weekends"
    }
  ],
  salary_insights: {
    current_range: "4-6 LPA",
    skills: [
      { skill: "Machine Learning", bump: "+8 LPA", weeks: 12, roi: "high" },
      { skill: "Docker", bump: "+2 LPA", weeks: 2, roi: "highest" },
      { skill: "AWS", bump: "+5 LPA", weeks: 6, roi: "high" },
      { skill: "FastAPI", bump: "+2 LPA", weeks: 1, roi: "highest" }
    ]
  }
};

const useAgentStore = create((set, get) => ({
  // Inputs
  resumeText: '',
  resumeFile: null,
  resumeFileName: '',
  jobRole: '',
  jdText: '',
  manualSkills: [],

  // Results
  analysisResult: DUMMY_RESULT,
  
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

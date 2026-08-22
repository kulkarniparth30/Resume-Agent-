import { useNavigate, Link } from 'react-router-dom';
import { Target, ShieldCheck, Briefcase, Brain, ArrowRight, Sparkles, Zap, FileEdit, CheckCircle2, History } from 'lucide-react';
import useAgentStore from '../store/useAgentStore';

export default function Home() {
  const navigate = useNavigate();
  const user = useAgentStore((s) => s.user);
  const openAuthModal = useAgentStore((s) => s.openAuthModal);

  const handleGetStarted = () => {
    if (!user) {
      openAuthModal('signup');
    } else {
      navigate('/upload');
    }
  };

  const handleResumeBuilder = () => {
    if (!user) {
      openAuthModal('signup');
    } else {
      navigate('/resume-builder');
    }
  };

  return (
    <div className="w-full flex flex-col font-sans text-slate-900 bg-slate-50 min-h-screen">
      
      {/* ===== HERO SECTION ===== */}
      <section className="w-full bg-[#0F172A] text-white py-20 md:py-28 flex justify-center items-center border-b border-slate-800 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="w-full max-w-5xl mx-auto px-4 md:px-8 flex flex-col items-center justify-center text-center relative z-10">
          <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 text-sm font-semibold text-blue-300 mb-8 border border-white/20 shadow-lg backdrop-blur-md">
            <Sparkles className="w-4 h-4" />
            ResumeAgent AI
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
            Know Your Gaps.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Land Your Dream Role.</span>
          </h1>
          
          <p className="text-base md:text-lg text-slate-400 max-w-2xl mb-10 font-medium leading-relaxed">
            Tailor your resume point-by-point to any Job Description. Identify missing skills, optimize for ATS screening, and apply suggested changes directly in our AI Resume Builder.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <button 
              onClick={handleGetStarted}
              className="w-full sm:w-auto px-8 py-4 bg-[#1D4ED8] hover:bg-blue-600 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(29,78,216,0.3)] flex justify-center items-center gap-2 cursor-pointer"
            >
              {user ? 'Analyze New Resume' : 'Get Started Free'} <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={handleResumeBuilder}
              className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-white/10 text-white border border-white/20 rounded-xl font-bold transition-all flex justify-center items-center gap-2 cursor-pointer"
            >
              <FileEdit className="w-4 h-4 text-blue-400" />
              Open Resume Builder
            </button>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="w-full py-12 border-b border-slate-200 bg-white flex justify-center items-center">
        <div className="w-full max-w-5xl mx-auto px-4 md:px-8">
          <div className="flex flex-wrap justify-center gap-8 md:gap-20 text-center">
            {[
              { v: '10k+', l: 'Resumes Analyzed' },
              { v: '95%', l: 'ATS Pass Rate' },
              { v: '150+', l: 'Skills Tracked' },
              { v: '4.9/5', l: 'User Rating' }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center justify-center">
                <div className="text-3xl font-extrabold text-[#0F172A] mb-1">{stat.v}</div>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">{stat.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="w-full py-20 flex flex-col items-center justify-center bg-slate-50">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-8 flex flex-col items-center justify-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] text-center mb-16 tracking-tight">
            Why Professionals Choose ResumeAgent AI
          </h2>

          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                title: 'Exact Point-by-Point Resume Changes',
                desc: 'Unlike generic AI bots, we generate specific metric-backed bullet point changes tailored to the exact JD requirements.',
                icon: Zap,
                color: 'text-[#1D4ED8]',
                bg: 'bg-blue-50',
              },
              {
                title: 'Connected AI Resume Builder',
                desc: 'Upload your resume once. Directly apply our suggested JD changes into your live editable resume with 1 click.',
                icon: FileEdit,
                color: 'text-[#7C3AED]',
                bg: 'bg-purple-50',
              },
              {
                title: 'Persistent Cloud History & Roadmaps',
                desc: 'Test your resume against 10 different job postings. Every dashboard, project roadmap, and score is saved to your account.',
                icon: History,
                color: 'text-[#059669]',
                bg: 'bg-emerald-50',
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                <div className={`w-14 h-14 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm lg:text-base">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="w-full py-20 bg-white flex flex-col items-center justify-center border-y border-slate-200">
        <div className="w-full max-w-3xl mx-auto px-4 md:px-8 flex flex-col items-center justify-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] text-center mb-16 tracking-tight">
            Four Steps to Your Dream Offer
          </h2>

          <div className="w-full flex flex-col gap-10">
            {[
              { title: '1. Sign In & Upload Resume', desc: 'Securely upload your resume and select your verified skills (saved automatically).' },
              { title: '2. Paste Target Job Description', desc: 'Enter any target job description or role to identify critical skill gaps and keyword mismatches.' },
              { title: '3. Review AI Improvement Plan', desc: 'Inspect ATS compatibility scores, recommended projects, and targeted bullet rewrites.' },
              { title: '4. 1-Click Apply to Resume Builder', desc: 'Apply all suggested improvements directly in the connected builder and export a high-scoring ATS resume.' }
            ].map((step, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="w-14 h-14 rounded-full bg-white border border-slate-200 text-[#1D4ED8] flex items-center justify-center font-extrabold text-2xl shrink-0 shadow-sm">
                  {i + 1}
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="text-lg md:text-xl font-bold text-[#0F172A] mb-2">{step.title}</h3>
                  <p className="text-slate-500 text-sm md:text-base leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="w-full py-24 bg-[#0F172A] flex justify-center items-center">
        <div className="w-full max-w-4xl mx-auto px-4 md:px-8 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-[#1D4ED8]/20 rounded-2xl border border-[#1D4ED8]/30 flex items-center justify-center mb-8">
            <Brain className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-10 tracking-tight">
            Ready to tailor your resume for top tech companies?
          </h2>
          <button 
            onClick={handleGetStarted}
            className="w-full sm:w-auto px-8 py-4 bg-[#1D4ED8] hover:bg-blue-600 text-white rounded-xl font-bold text-base transition-all shadow-[0_0_20px_rgba(29,78,216,0.3)] flex justify-center items-center gap-2 cursor-pointer"
          >
            Start Analyzing Now <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="w-full bg-[#0F172A] border-t border-slate-800 py-8 flex justify-center items-center">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-bold text-lg text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#3B82F6]" />
            Resume<span className="text-[#3B82F6]">Agent</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-semibold text-slate-400">
            <button onClick={handleGetStarted} className="hover:text-white transition-colors cursor-pointer">Analyzer</button>
            <button onClick={handleResumeBuilder} className="hover:text-white transition-colors cursor-pointer">Resume Builder</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

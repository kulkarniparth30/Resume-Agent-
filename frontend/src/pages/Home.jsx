import { Link } from 'react-router-dom';
import { Target, ShieldCheck, Briefcase, Brain, ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
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
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Land Your Role.</span>
          </h1>
          
          <p className="text-base md:text-lg text-slate-400 max-w-2xl mb-10 font-medium leading-relaxed">
            Identify missing skills, optimize for ATS, and discover jobs that perfectly match your true potential.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <Link 
              to="/upload" 
              className="w-full sm:w-auto px-8 py-4 bg-[#1D4ED8] hover:bg-blue-600 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(29,78,216,0.3)] flex justify-center items-center gap-2"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              to="/dashboard" 
              className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-white/10 text-white border border-white/20 rounded-xl font-bold transition-all flex justify-center items-center"
            >
              View Demo
            </Link>
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
            Everything you need.
          </h2>

          <div className="w-full flex flex-col md:flex-row items-stretch justify-center gap-6 lg:gap-8">
            {[
              {
                title: 'Skill Gap Analysis',
                desc: 'Compare your resume against live job descriptions. See exactly what you are missing.',
                icon: Target,
                color: 'text-[#1D4ED8]',
                bg: 'bg-blue-50',
              },
              {
                title: 'ATS Score Checker',
                desc: 'Ensure your format, structure, and keywords pass the automated screening bots.',
                icon: ShieldCheck,
                color: 'text-[#7C3AED]',
                bg: 'bg-purple-50',
              },
              {
                title: 'Live Job Finder',
                desc: 'Get matched with high-probability roles based on your verified skill profile.',
                icon: Briefcase,
                color: 'text-[#059669]',
                bg: 'bg-emerald-50',
              }
            ].map((feature, i) => (
              <div key={i} className="flex-1 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center text-center hover:shadow-md transition-shadow">
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
            Four steps to hired.
          </h2>

          <div className="w-full flex flex-col gap-10">
            {[
              { title: 'Upload Resume', desc: 'Securely upload your PDF or DOCX file. Our system parses your data instantly.' },
              { title: 'AI Analysis', desc: 'Agentic AI evaluates your experience and cross-references it against market demands.' },
              { title: 'Review Gaps', desc: 'Get a clear, actionable report detailing your ATS score and critical missing skills.' },
              { title: 'Apply with Confidence', desc: 'Follow your personalized roadmap and apply to matched jobs with a stronger profile.' }
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
            Ready to upgrade your career?
          </h2>
          <Link 
            to="/upload" 
            className="w-full sm:w-auto px-8 py-4 bg-[#1D4ED8] hover:bg-blue-600 text-white rounded-xl font-bold text-base transition-all shadow-[0_0_20px_rgba(29,78,216,0.3)] flex justify-center items-center gap-2"
          >
            Start For Free <ArrowRight className="w-5 h-5" />
          </Link>
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
            <Link to="/upload" className="hover:text-white transition-colors">Analyzer</Link>
            <Link to="/jobs" className="hover:text-white transition-colors">Jobs</Link>
            <Link to="/roadmap" className="hover:text-white transition-colors">Roadmap</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

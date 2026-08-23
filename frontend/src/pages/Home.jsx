import { Link } from 'react-router-dom';
import { Target, ShieldCheck, Briefcase, ArrowRight, ArrowUpRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="w-full flex flex-col font-sans bg-[#F3F0EE] min-h-screen pb-16">
      
      {/* ===== HERO SECTION ===== */}
      <section className="w-full px-4 sm:px-8 lg:px-12 flex flex-col items-center justify-center">
        <div className="w-full max-w-[1280px] bg-[#141413] hero-stadium aspect-[16/9] md:aspect-[2.2/1] relative flex items-center justify-center p-8 md:p-16 overflow-hidden">
          {/* Subtle gradient background inside stadium */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#141413] via-[#262627] to-[#141413] opacity-50"></div>
          
          <div className="relative z-10 w-full max-w-3xl flex flex-col md:flex-row items-center md:items-end justify-between gap-12 text-center md:text-left">
            <div className="flex-1">
              <h1 className="text-[#F3F0EE] h1 text-5xl md:text-7xl mb-6 max-w-xl">
                Know where you stand.<br/>
                Go where you belong.
              </h1>
              <div className="flex flex-col sm:flex-row items-center md:items-start gap-4">
                <Link to="/upload" className="px-6 py-2.5 bg-white text-[#141413] font-medium rounded-full hover:bg-gray-100 transition-colors inline-block">
                  Get Started
                </Link>
                <Link to="/dashboard" className="px-6 py-2.5 bg-[#262627] text-white font-medium rounded-full border border-gray-600 hover:bg-gray-800 transition-colors inline-block">
                  View Demo
                </Link>
              </div>
            </div>
            
            <div className="flex-1 md:max-w-xs">
              <p className="text-[#D1CDC7] text-lg font-medium leading-relaxed">
                A data-driven approach to your career. We analyze your experience against active job descriptions, revealing the exact skills you need to land your next role.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="w-full py-24 flex justify-center items-center">
        <div className="w-full max-w-[1280px] px-4 md:px-12">
          <div className="flex flex-wrap justify-between gap-12">
            {[
              { v: '10k+', l: 'Resumes Analyzed' },
              { v: '95%', l: 'ATS Pass Rate' },
              { v: '150+', l: 'Skills Tracked' },
              { v: '4.9/5', l: 'User Rating' }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-start">
                <div className="text-5xl font-bold text-[#141413] mb-2 tracking-tight">{stat.v}</div>
                <div className="eyebrow text-[#696969] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#CF4500]"></span>
                  {stat.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== EDITORIAL SERVICE CARDS ===== */}
      <section className="w-full py-24 flex justify-center items-center relative overflow-hidden">
        {/* Ghost Watermark */}
        <div className="absolute top-0 left-12 ghost-watermark">
          EVERYTHING YOU NEED
        </div>

        <div className="w-full max-w-[1280px] px-4 md:px-12 mt-20 relative z-10 flex flex-col gap-40">
          
          {/* Card 1 */}
          <div className="flex flex-col md:flex-row items-center gap-16 md:gap-32 w-full max-w-5xl mx-auto">
            <div className="relative">
              <div className="w-[280px] h-[280px] md:w-[340px] md:h-[340px] bg-[#E8E2DA] portrait-circle flex items-center justify-center relative z-10">
                <Target className="w-24 h-24 text-[#9A3A0A] opacity-20" />
              </div>
              {/* Orbital Arc extending to next card */}
              <svg className="absolute top-1/2 left-full w-full h-[400px] overflow-visible pointer-events-none hidden md:block -z-10" viewBox="0 0 200 400" preserveAspectRatio="none">
                <path d="M 0 0 C 150 0, 150 400, 300 400" fill="none" stroke="#F37338" strokeWidth="1.5" />
              </svg>
            </div>
            
            <div className="flex-1 flex flex-col justify-center max-w-md relative z-10 md:ml-16 lg:ml-32">
              <div className="eyebrow text-[#696969] flex items-center gap-2 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#CF4500]"></span>
                ANALYSIS
              </div>
              <h3 className="h3 text-3xl mb-4 text-[#141413]">Precision Skill Mapping</h3>
              <p className="text-lg text-[#555555]">
                Compare your background against real-time market data. See precisely what you're missing and exactly how to bridge the gap before you apply.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-16 md:gap-32 w-full max-w-5xl mx-auto relative">
            <div className="relative">
              <div className="w-[280px] h-[280px] md:w-[340px] md:h-[340px] bg-[#E8E2DA] portrait-circle flex items-center justify-center relative z-10">
                <ShieldCheck className="w-24 h-24 text-[#3860BE] opacity-20" />
              </div>
              {/* Orbital Arc extending to next card */}
              <svg className="absolute top-1/2 right-full w-full h-[400px] overflow-visible pointer-events-none hidden md:block -z-10" viewBox="0 0 200 400" preserveAspectRatio="none">
                <path d="M 200 0 C 50 0, 50 400, -100 400" fill="none" stroke="#F37338" strokeWidth="1.5" />
              </svg>
            </div>
            
            <div className="flex-1 flex flex-col justify-center max-w-md relative z-10 md:mr-16 lg:mr-32">
              <div className="eyebrow text-[#696969] flex items-center gap-2 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#CF4500]"></span>
                COMPLIANCE
              </div>
              <h3 className="h3 text-3xl mb-4 text-[#141413]">Automated Compliance</h3>
              <p className="text-lg text-[#555555]">
                Ensure your resume's format and structure can safely navigate the automated screening systems that guard modern hiring.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col md:flex-row items-center gap-16 md:gap-32 w-full max-w-5xl mx-auto">
            <div className="relative">
              <div className="w-[280px] h-[280px] md:w-[340px] md:h-[340px] bg-[#E8E2DA] portrait-circle flex items-center justify-center relative z-10">
                <Briefcase className="w-24 h-24 text-[#CF4500] opacity-20" />
              </div>
            </div>
            
            <div className="flex-1 flex flex-col justify-center max-w-md">
              <div className="eyebrow text-[#696969] flex items-center gap-2 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#CF4500]"></span>
                OPPORTUNITY
              </div>
              <h3 className="h3 text-3xl mb-4 text-[#141413]">High-Probability Matching</h3>
              <p className="text-lg text-[#555555]">
                Stop relying on basic keyword searches. We connect you to live roles based on a verified analysis of your actual capabilities.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ===== HOW IT WORKS (PILL CAROUSEL STYLE) ===== */}
      <section className="w-full py-32 flex justify-center items-center">
        <div className="w-full max-w-[1280px] px-4 md:px-12 flex flex-col items-center text-center">
          <h2 className="h2 text-4xl mb-16 text-[#141413]">Four steps to hired.</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
            {[
              { num: '1', title: 'Secure Upload', desc: 'Provide your current resume in standard PDF or DOCX formats.' },
              { num: '2', title: 'Intelligent Analysis', desc: 'Our engine cross-references your experience against market demands.' },
              { num: '3', title: 'Actionable Insights', desc: 'Receive a transparent report detailing your ATS viability.' },
              { num: '4', title: 'Strategic Execution', desc: 'Follow your personalized roadmap and apply with certainty.' }
            ].map((step, i) => (
              <div key={i} className="bg-[#FCFBFA] rounded-[40px] p-8 flex flex-col items-center text-center shadow-[0_24px_48px_rgba(0,0,0,0.04)] border border-black/5 hover:-translate-y-2 transition-transform duration-300">
                <div className="w-12 h-12 rounded-full border border-[#141413] flex items-center justify-center font-medium text-xl mb-6">
                  {step.num}
                </div>
                <h3 className="h3 text-xl mb-3 text-[#141413]">{step.title}</h3>
                <p className="text-[#696969] text-base">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="w-full py-32 flex justify-center items-center bg-[#FCFBFA]">
        <div className="w-full max-w-[1280px] px-4 md:px-12 text-center flex flex-col items-center justify-center">
          <h2 className="h2 text-4xl md:text-5xl text-[#141413] mb-10 max-w-2xl">
            Your next step starts here.
          </h2>
          <Link to="/upload" className="btn-ink px-8 py-4 !text-lg">
            Start For Free
          </Link>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="w-full bg-[#141413] pt-24 pb-12 mt-20">
        <div className="w-full max-w-[1280px] mx-auto px-4 md:px-12">
          
          <h2 className="h2 text-[#F3F0EE] text-4xl max-w-2xl mb-16">
            We're always here when you need us.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            {/* Col 1 */}
            <div className="flex flex-col gap-4">
              <div className="eyebrow text-[#696969] mb-2">FOR YOU</div>
              <Link to="/upload" className="text-[#D1CDC7] hover:text-white transition-colors">Analyzer</Link>
              <Link to="/jobs" className="text-[#D1CDC7] hover:text-white transition-colors">Jobs</Link>
              <Link to="/roadmap" className="text-[#D1CDC7] hover:text-white transition-colors">Roadmap</Link>
            </div>
            {/* Col 2 */}
            <div className="flex flex-col gap-4">
              <div className="eyebrow text-[#696969] mb-2">FOR BUSINESS</div>
              <Link to="#" className="text-[#D1CDC7] hover:text-white transition-colors">Recruiting <ArrowUpRight className="inline w-3 h-3 ml-1" /></Link>
              <Link to="#" className="text-[#D1CDC7] hover:text-white transition-colors">API Access</Link>
            </div>
            {/* Col 3 */}
            <div className="flex flex-col gap-4">
              <div className="eyebrow text-[#696969] mb-2">LEGAL</div>
              <Link to="#" className="text-[#D1CDC7] hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="#" className="text-[#D1CDC7] hover:text-white transition-colors">Terms of Service</Link>
            </div>
            {/* Col 4 */}
            <div className="flex flex-col gap-4">
              <div className="eyebrow text-[#696969] mb-2">NEED HELP?</div>
              <Link to="#" className="text-[#D1CDC7] hover:text-white transition-colors">Support Center</Link>
              <Link to="#" className="text-[#D1CDC7] hover:text-white transition-colors">Contact Us</Link>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-[#696969] text-sm font-medium">
              © 2026 ResumeAgent. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <button className="border border-white/40 text-white rounded-full px-6 py-2 text-sm font-medium hover:bg-white/10 transition-colors">
                English (US) ▼
              </button>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}

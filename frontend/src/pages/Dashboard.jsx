import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAgentStore from '../store/useAgentStore';
import ATSScoreRing from '../components/ATSScoreRing';
import SkillGapChart from '../components/SkillGapChart';
import FakeSkillAlert from '../components/FakeSkillAlert';
import SkillCard from '../components/SkillCard';
import JobCard from '../components/JobCard';
import CourseCard from '../components/CourseCard';
import ProjectCard from '../components/ProjectCard';
import SalaryChart from '../components/SalaryChart';
import LearnModal from '../components/LearnModal';
import ProjectGuideModal from '../components/ProjectGuideModal';
import {
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Briefcase,
  GraduationCap,
  Activity,
  Target,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Clock,
  Trophy,
  BarChart3,
  History,
  FileEdit,
  Zap,
} from 'lucide-react';

const RankBreakdownBar = ({ label, value, color }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-sm">
      <span className="text-text-secondary font-medium">{label}</span>
      <span className="font-bold" style={{ color }}>{value}%</span>
    </div>
    <div className="w-full bg-surface-alt rounded-full h-2 overflow-hidden">
      <div className="h-2 rounded-full transition-all duration-1000" style={{ width: `${value}%`, backgroundColor: color }} />
    </div>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const analysisResult = useAgentStore((state) => state.analysisResult);
  const jobRole = useAgentStore((state) => state.jobRole);
  const analysisHistory = useAgentStore((state) => state.analysisHistory);
  const loadAnalysisFromHistory = useAgentStore((state) => state.loadAnalysisFromHistory);
  const syncCloudHistory = useAgentStore((state) => state.syncCloudHistory);
  const [selectedLearnSkill, setSelectedLearnSkill] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  React.useEffect(() => {
    syncCloudHistory();
  }, []);

  if (!analysisResult) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="text-center max-w-md animate-fade-in">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Activity className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-dark mb-3">No Analysis Yet</h2>
          <p className="text-text-secondary mb-6">Upload your resume and run an analysis to see your personalized dashboard.</p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-light transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Start Analysis
          </Link>
        </div>
      </div>
    );
  }

  const data = analysisResult;

  const matchingSkills = (data.candidate_skills || []).filter(skill =>
    (data.required_skills || []).includes(skill)
  );

  const missingSkills = (data.required_skills || []).filter(skill =>
    !(data.candidate_skills || []).includes(skill)
  );

  const getRankColor = (score) => {
    if (score >= 80) return '#059669';
    if (score >= 60) return '#1D4ED8';
    if (score >= 40) return '#D97706';
    return '#DC2626';
  };

  const getRankLabel = (score) => {
    if (score >= 80) return 'Highly Competitive';
    if (score >= 60) return 'Competitive';
    if (score >= 40) return 'Developing';
    return 'Needs Improvement';
  };

  const rankColor = getRankColor(data.rank_score || 0);

  return (
    <div className="min-h-screen bg-surface pt-8 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 animate-fade-in relative">
          <div>
            <h1 className="text-3xl font-bold text-dark flex items-center gap-3">
              <Activity className="w-8 h-8 text-primary" />
              Analysis Dashboard
            </h1>
            <p className="text-text-secondary mt-1">Comprehensive review of your resume against industry standards</p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3 items-center">
            
            {/* History Dropdown */}
            {analysisHistory.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-border text-dark text-sm font-semibold rounded-xl hover:bg-surface-alt transition-colors cursor-pointer"
                >
                  <History className="w-4 h-4 text-text-muted" />
                  History
                </button>
                
                {showHistory && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-border rounded-xl shadow-lg overflow-hidden z-20">
                    <div className="px-4 py-3 bg-surface-alt border-b border-border">
                      <h4 className="text-xs font-bold text-dark uppercase tracking-wider">Past Analyses</h4>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {analysisHistory.map((entry, idx) => (
                        <button
                          key={entry.id || idx}
                          onClick={() => {
                            loadAnalysisFromHistory(idx);
                            setShowHistory(false);
                          }}
                          className="w-full text-left px-4 py-3 border-b border-border last:border-0 hover:bg-surface-alt transition-colors cursor-pointer"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-sm text-dark truncate pr-2">{entry.jobRole}</span>
                            <span className="text-[10px] text-text-muted whitespace-nowrap">
                              {new Date(entry.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-xs text-text-secondary">
                            Rank: {entry.result?.rank_score || 0}/100 • Match: {entry.result?.match_percent || 0}%
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <Link
              to="/roadmap"
              className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-primary text-primary text-sm font-semibold rounded-xl hover:bg-primary/5 transition-colors"
            >
              <Target className="w-4 h-4" />
              View Roadmap
            </Link>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-light transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              New Analysis
            </Link>
          </div>
        </div>

        {/* Top Summary Bar — 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Rank Score — NEW */}
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center animate-slide-up stagger-1 border-t-4" style={{ borderTopColor: rankColor }}>
            <ATSScoreRing score={data.rank_score || 0} size={140} label="Rank Score" />
            <span className="mt-2 text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: `${rankColor}15`, color: rankColor }}>
              {getRankLabel(data.rank_score || 0)}
            </span>
          </div>

          {/* ATS Score */}
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center animate-slide-up stagger-2 border-t-4 border-primary">
            <ATSScoreRing score={data.ats_score || 0} label="ATS Score" />
          </div>

          {/* Gap Score */}
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center animate-slide-up stagger-3 border-t-4 border-warning">
            <ATSScoreRing score={data.gap_score || 0} size={140} label="Gap Score" />
          </div>

          {/* Match % */}
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center animate-slide-up stagger-4 border-t-4 border-success">
            <ATSScoreRing score={data.match_percent || 0} size={140} label="Match %" />
          </div>
        </div>

        {/* Rank Breakdown — NEW */}
        {data.rank_breakdown && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 animate-slide-up stagger-2 border border-border">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-dark">Rank Breakdown</h3>
              <span className="ml-auto text-sm font-bold px-3 py-1 rounded-full" style={{ backgroundColor: `${rankColor}15`, color: rankColor }}>
                Overall: {data.rank_score}/100
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              <RankBreakdownBar label="Skills Match" value={data.rank_breakdown.skills_match || 0} color="#1D4ED8" />
              <RankBreakdownBar label="Experience Relevance" value={data.rank_breakdown.experience_relevance || 0} color="#7C3AED" />
              <RankBreakdownBar label="Education Fit" value={data.rank_breakdown.education_fit || 0} color="#059669" />
              <RankBreakdownBar label="Project Alignment" value={data.rank_breakdown.project_alignment || 0} color="#D97706" />
            </div>
          </div>
        )}

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* LEFT COLUMN (3/5) */}
          <div className="lg:col-span-3 space-y-6">

            {/* Skill Gap Chart */}
            {data.skill_gap && data.skill_gap.length > 0 && (
              <div className="animate-slide-up stagger-3">
                <SkillGapChart data={data.skill_gap} onLearnClick={(skill) => setSelectedLearnSkill(skill)} />
              </div>
            )}

            {/* Fake Skill Alerts */}
            {data.fake_skills && data.fake_skills.length > 0 && (
              <div className="animate-slide-up stagger-4">
                <h3 className="text-lg font-bold text-dark flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-danger" />
                  Skill Discrepancy Alerts
                </h3>
                <div className="space-y-3">
                  {data.fake_skills.map((fake, idx) => (
                    <FakeSkillAlert key={idx} skill={fake.skill} reason={fake.reason} />
                  ))}
                </div>
              </div>
            )}

            {/* Matching Skills */}
            <div className="bg-white rounded-xl shadow-md p-6 animate-slide-up stagger-5">
              <h3 className="text-lg font-bold text-dark flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-success" />
                Your Matching Skills
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                Skills you have that match the job requirements
              </p>
              <div className="flex flex-wrap gap-2">
                {matchingSkills.map((skill) => (
                  <SkillCard key={skill} name={skill} variant="owned" />
                ))}
                {matchingSkills.length === 0 && (
                  <p className="text-text-muted text-sm italic">No matching skills found</p>
                )}
              </div>
              {missingSkills.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm font-medium text-text-secondary mb-3">Missing Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {missingSkills.map((skill) => (
                      <SkillCard key={skill} name={skill} variant="missing" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Targeted Resume Improvements (AI Tailoring Suggestions) */}
            {data.resume_improvements && data.resume_improvements.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md border border-primary/20 p-6 animate-slide-up stagger-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-border">
                  <div>
                    <h3 className="text-lg font-bold text-dark flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      Recommended Resume Changes for This JD
                    </h3>
                    <p className="text-xs text-text-secondary mt-1">
                      Direct before-and-after improvements to match the target job description
                    </p>
                  </div>
                  <Link
                    to="/resume-builder"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary-light text-white text-xs font-bold rounded-xl transition-colors shrink-0 shadow-sm shadow-primary/20"
                  >
                    <FileEdit className="w-4 h-4" />
                    Apply in Resume Builder
                  </Link>
                </div>

                <div className="space-y-4">
                  {data.resume_improvements.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-surface-alt border border-border space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                          {item.section}
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          item.impact === 'High' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'
                        }`}>
                          {item.impact || 'High'} Impact
                        </span>
                      </div>

                      {item.current && (
                        <div>
                          <span className="text-[11px] font-semibold text-text-muted uppercase">Current:</span>
                          <p className="text-xs text-text-secondary bg-white p-2 rounded-lg border border-border line-through opacity-80 mt-0.5">
                            {item.current}
                          </p>
                        </div>
                      )}

                      <div>
                        <span className="text-[11px] font-semibold text-success uppercase">Suggested Improvement:</span>
                        <p className="text-xs text-dark font-medium bg-success/5 border border-success/20 p-2.5 rounded-lg mt-0.5 leading-relaxed">
                          {item.suggested}
                        </p>
                      </div>

                      {item.reason && (
                        <p className="text-[11px] text-text-muted italic flex items-center gap-1 mt-1">
                          <span className="font-semibold text-primary">Why:</span> {item.reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN (2/5) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Skill Suggestions */}
            {data.suggestions && data.suggestions.length > 0 && (
              <div className="animate-slide-up stagger-3">
                <h3 className="text-lg font-bold text-dark flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-warning" />
                  Recommended Skills
                </h3>
                <div className="space-y-3">
                  {data.suggestions.map((sug, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-xl shadow-sm border border-border p-4 flex items-center justify-between card-hover group"
                    >
                      <div>
                        <h4 className="font-semibold text-dark group-hover:text-primary transition-colors">{sug.skill}</h4>
                        <p className="text-xs text-text-secondary mt-0.5">Related to: <span className="font-medium text-primary">{sug.related_to}</span></p>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                        <Clock className="w-3.5 h-3.5" />
                        {sug.weeks}w
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Project Ideas */}
            {data.project_ideas && data.project_ideas.length > 0 && (
              <div className="animate-slide-up stagger-4">
                <h3 className="text-lg font-bold text-dark flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-accent" />
                  Project Ideas
                </h3>
                <div className="space-y-4">
                  {data.project_ideas.map((proj, idx) => (
                    <ProjectCard
                      key={idx}
                      name={proj.name}
                      description={proj.description}
                      skills_covered={proj.skills_covered}
                      estimated_time={proj.estimated_time}
                      onStart={() => setSelectedProject(proj)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Salary Coach */}
            {data.salary_insights && (
              <div className="animate-slide-up stagger-5">
                <SalaryChart data={data.salary_insights} />
              </div>
            )}
          </div>
        </div>

        {/* Bottom Full Width Sections */}
        <div className="space-y-8 mt-10">

          {/* Live Jobs — Horizontal Scroll */}
          {data.jobs && data.jobs.length > 0 && (
            <div className="animate-slide-up stagger-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-dark flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Recommended Jobs
                </h3>
                <Link to="/jobs" className="text-sm font-semibold text-primary hover:text-primary-light flex items-center gap-1">
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="flex overflow-x-auto gap-4 pb-4 -mx-2 px-2" style={{ scrollbarWidth: 'none' }}>
                {data.jobs.map((job, idx) => (
                  <JobCard
                    key={idx}
                    title={job.title}
                    company={job.company}
                    location={job.location}
                    match={job.match}
                    salary={job.salary}
                    compact={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Course Recommendations */}
          {data.courses && data.courses.length > 0 && (
            <div className="animate-slide-up stagger-6">
              <h3 className="text-xl font-bold text-dark flex items-center gap-2 mb-4">
                <GraduationCap className="w-5 h-5 text-accent" />
                Recommended Courses
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.courses.map((course, idx) => (
                  <CourseCard
                    key={idx}
                    name={course.name}
                    platform={course.platform}
                    rating={course.rating}
                    price={course.price}
                    skill={course.skill}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Learn Resources Modal */}
      {selectedLearnSkill && (
        <LearnModal
          skill={selectedLearnSkill}
          jobRole={jobRole}
          onClose={() => setSelectedLearnSkill(null)}
        />
      )}

      {/* Project Guide Modal */}
      {selectedProject && (
        <ProjectGuideModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}

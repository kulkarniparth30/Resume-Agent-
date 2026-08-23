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
  FileText,
  Trash2,
  Plus
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
  const savedResumes = useAgentStore((state) => state.savedResumes);
  const deleteResume = useAgentStore((state) => state.deleteResume);
  const loadAnalysisFromHistory = useAgentStore((state) => state.loadAnalysisFromHistory);
  const syncCloudHistory = useAgentStore((state) => state.syncCloudHistory);
  const [selectedLearnSkill, setSelectedLearnSkill] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  React.useEffect(() => {
    syncCloudHistory();
  }, []);

  // Empty state with history if available
  if (!analysisResult) {
    const hasHistory = analysisHistory.length > 0 || savedResumes.length > 0;

    return (
      <div className="min-h-screen bg-surface py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center max-w-lg mx-auto animate-fade-in">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-dark mb-2">Analysis Dashboard</h2>
            <p className="text-text-secondary mb-6 text-sm">
              Upload your resume to run a deep AI match analysis, or manage your saved resumes below.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary-light transition-colors shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                Start New Analysis
              </Link>
              <Link
                to="/resume-builder"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-border text-dark font-semibold text-sm rounded-xl hover:bg-surface-alt transition-colors"
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                Open Resume Builder
              </Link>
            </div>
          </div>

          {/* If user has history, display the saved items */}
          {hasHistory && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              {/* Saved Resumes History Card */}
              <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-dark text-base">Saved Resumes ({savedResumes.length})</h3>
                  </div>
                  <Link to="/resume-builder" className="text-xs font-semibold text-emerald-600 hover:underline">
                    + New
                  </Link>
                </div>

                {savedResumes.length === 0 ? (
                  <p className="text-xs text-text-muted italic py-4 text-center">No saved resume drafts yet.</p>
                ) : (
                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {savedResumes.map((item) => (
                      <div key={item.id} className="p-3 bg-surface-alt rounded-xl border border-border/70 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-dark truncate">{item.title || 'Resume'}</p>
                          <p className="text-[10px] text-text-muted">
                            {item.formData?.name || 'Draft'} • {new Date(item.updatedAt || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Link
                            to="/resume-builder"
                            className="px-2.5 py-1 bg-dark text-white rounded-lg text-[11px] font-semibold hover:bg-black transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteResume(item.id)}
                            className="p-1 text-text-muted hover:text-danger rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Past Analyses History Card */}
              <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-dark text-base">Past Analyses ({analysisHistory.length})</h3>
                  </div>
                  <Link to="/upload" className="text-xs font-semibold text-primary hover:underline">
                    + Analyze
                  </Link>
                </div>

                {analysisHistory.length === 0 ? (
                  <p className="text-xs text-text-muted italic py-4 text-center">No past analyses saved yet.</p>
                ) : (
                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {analysisHistory.map((entry, idx) => (
                      <div
                        key={entry.id || idx}
                        onClick={() => loadAnalysisFromHistory(idx)}
                        className="p-3 bg-surface-alt hover:bg-surface rounded-xl border border-border/70 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-dark truncate">{entry.jobRole || 'Target Role'}</p>
                          <p className="text-[10px] text-text-muted">
                            Rank: {entry.result?.rank_score || 0}/100 • Match: {entry.result?.match_percent || 0}% • {new Date(entry.date).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-primary shrink-0">
                          View →
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 animate-fade-in relative z-30">
          <div>
            <h1 className="text-3xl font-bold text-dark flex items-center gap-3">
              <Activity className="w-8 h-8 text-primary" />
              Analysis Dashboard
            </h1>
            <p className="text-text-secondary mt-1">Comprehensive review of your resume against industry standards</p>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-wrap gap-3 items-center">
            
            {/* History Dropdown */}
            {analysisHistory.length > 0 && (
              <div className="relative z-50">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-border text-dark text-sm font-semibold rounded-xl hover:bg-surface-alt transition-colors cursor-pointer"
                >
                  <History className="w-4 h-4 text-text-muted" />
                  History ({analysisHistory.length})
                </button>
                
                {showHistory && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowHistory(false)} />
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-border rounded-xl shadow-2xl overflow-hidden z-50">
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
                  </>
                )}
              </div>
            )}

            <Link
              to="/resume-builder"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              <FileText className="w-4 h-4" />
              Resume Builder
            </Link>

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
          {/* Rank Score */}
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

        {/* Rank Breakdown */}
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

            {/* Skills Overview */}
            <div className="bg-white rounded-xl shadow-md p-6 animate-slide-up stagger-4 border border-border">
              <h3 className="text-lg font-bold text-dark mb-4">Skills Overview</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-success mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Matching Skills ({matchingSkills.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {matchingSkills.map((skill, idx) => (
                      <SkillCard key={idx} skill={skill} type="matching" />
                    ))}
                    {matchingSkills.length === 0 && (
                      <p className="text-sm text-text-muted italic">No direct matching skills found</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-danger mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    Missing Skills ({missingSkills.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {missingSkills.map((skill, idx) => (
                      <SkillCard
                        key={idx}
                        skill={skill}
                        type="missing"
                        onLearnClick={(s) => setSelectedLearnSkill(s)}
                      />
                    ))}
                    {missingSkills.length === 0 && (
                      <p className="text-sm text-text-muted italic">All required skills match!</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Project Recommendations */}
            {data.projects && data.projects.length > 0 && (
              <div className="animate-slide-up stagger-4">
                <h3 className="text-lg font-bold text-dark flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-accent" />
                  Recommended Portfolio Projects
                </h3>
                <div className="space-y-4">
                  {data.projects.map((project, idx) => (
                    <ProjectCard
                      key={idx}
                      title={project.title}
                      description={project.description}
                      skills={project.skills}
                      difficulty={project.difficulty}
                      onBuildClick={(proj) => setSelectedProject(proj)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN (2/5) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Quick Resume Builder CTA with Saved Resumes List */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-bold text-slate-900 text-sm">Resume Builder Drafts</h4>
                </div>
                <Link
                  to="/resume-builder"
                  className="text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg transition-colors"
                >
                  Open Builder →
                </Link>
              </div>

              {savedResumes.length > 0 ? (
                <div className="space-y-2 pt-1">
                  {savedResumes.slice(0, 3).map((item) => (
                    <div key={item.id} className="bg-white p-2.5 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800 truncate">{item.title}</span>
                      <Link
                        to="/resume-builder"
                        className="text-[11px] font-semibold text-emerald-600 hover:underline shrink-0 ml-2"
                      >
                        Edit
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-600">
                  Build and save custom resumes tailored to your target job roles with real-time A4 preview.
                </p>
              )}
            </div>

            {/* Resume Improvements CTA */}
            {data.resume_improvements && data.resume_improvements.length > 0 && (
              <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 rounded-xl p-6 border-2 border-primary/20 animate-slide-up stagger-3">
                <div className="flex items-center gap-2 text-primary font-bold mb-2">
                  <Zap className="w-5 h-5" />
                  <span>Tailored Resume Improvements</span>
                </div>
                <p className="text-sm text-text-secondary mb-4">
                  We identified <strong className="text-dark">{data.resume_improvements.length} high-impact improvements</strong> tailored for this job description.
                </p>
                <Link
                  to="/resume-builder"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-light transition-colors text-sm shadow-md shadow-primary/20"
                >
                  <FileEdit className="w-4 h-4" />
                  Apply Improvements in Resume Builder
                </Link>
              </div>
            )}

            {/* Experience Feedback */}
            {data.experience_feedback && (
              <div className="bg-white rounded-xl shadow-md p-6 animate-slide-up stagger-4 border border-border">
                <h3 className="text-lg font-bold text-dark flex items-center gap-2 mb-3">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Experience Evaluation
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">{data.experience_feedback}</p>
              </div>
            )}

            {/* Preparation Strategy */}
            {data.preparation_strategy && (
              <div className="bg-white rounded-xl shadow-md p-6 animate-slide-up stagger-5 border border-border">
                <h3 className="text-lg font-bold text-dark flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-warning" />
                  Preparation Strategy
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">{data.preparation_strategy}</p>
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

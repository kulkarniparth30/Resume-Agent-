import React from 'react';
import useAgentStore from '../store/useAgentStore';
import ATSScoreRing from '../components/ATSScoreRing';
import SkillGapChart from '../components/SkillGapChart';
import FakeSkillAlert from '../components/FakeSkillAlert';
import SkillCard from '../components/SkillCard';
import JobCard from '../components/JobCard';
import CourseCard from '../components/CourseCard';
import ProjectCard from '../components/ProjectCard';
import SalaryChart from '../components/SalaryChart';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';

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
    { skill: "Machine Learning", reason: "Listed in skills but no ML project or certification found" }
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

export default function Dashboard() {
  const analysisResult = useAgentStore((state) => state.analysisResult);
  const data = analysisResult || DUMMY_RESULT;

  const matchingSkills = data.candidate_skills.filter(skill =>
    data.required_skills.includes(skill)
  );

  const missingSkills = data.required_skills.filter(skill =>
    !data.candidate_skills.includes(skill)
  );

  return (
    <div className="min-h-screen bg-surface pt-8 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-dark flex items-center gap-3">
              <Activity className="w-8 h-8 text-primary" />
              Analysis Dashboard
            </h1>
            <p className="text-text-secondary mt-1">Comprehensive review of your resume against industry standards</p>
          </div>
          <Link
            to="/upload"
            className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-light transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            New Analysis
          </Link>
        </div>

        {/* Top Summary Bar — 3 Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* ATS Score */}
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center animate-slide-up stagger-1 border-t-4 border-primary">
            <ATSScoreRing score={data.ats_score} label="ATS Score" />
          </div>

          {/* Gap Score */}
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center animate-slide-up stagger-2 border-t-4 border-warning">
            <ATSScoreRing score={data.gap_score} size={140} label="Gap Score" />
          </div>

          {/* Match % */}
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center animate-slide-up stagger-3 border-t-4 border-success">
            <ATSScoreRing score={data.match_percent} size={140} label="Match %" />
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* LEFT COLUMN (3/5) */}
          <div className="lg:col-span-3 space-y-6">

            {/* Skill Gap Chart */}
            <div className="animate-slide-up stagger-3">
              <SkillGapChart data={data.skill_gap} />
            </div>

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
          </div>

          {/* RIGHT COLUMN (2/5) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Skill Suggestions */}
            <div className="animate-slide-up stagger-3">
              <h3 className="text-lg font-bold text-dark flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-warning" />
                Recommended Skills (ESCO)
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

            {/* Project Ideas */}
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
                  />
                ))}
              </div>
            </div>

            {/* Salary Coach */}
            <div className="animate-slide-up stagger-5">
              <SalaryChart data={data.salary_insights} />
            </div>
          </div>
        </div>

        {/* Bottom Full Width Sections */}
        <div className="space-y-8 mt-10">

          {/* Live Jobs — Horizontal Scroll */}
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

          {/* Course Recommendations */}
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
        </div>
      </div>
    </div>
  );
}

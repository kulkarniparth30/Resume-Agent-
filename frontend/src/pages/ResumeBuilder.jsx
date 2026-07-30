import { useState } from 'react';
import { Sparkles, Download, FileText, Briefcase, GraduationCap, Code2, User, X, CheckCircle2, AlertCircle, Plus, Mail, Phone, Globe } from 'lucide-react';

const INITIAL_DATA = {
  name: 'Parth Sharma',
  email: 'parth@example.com',
  phone: '+91 98765 43210',
  summary: 'Results-driven software developer with 2+ years of experience in web development and data analysis. Proficient in Python, React, and SQL with a passion for building scalable applications.',
  experience: {
    title: 'Software Developer Intern',
    company: 'TechCorp India',
    duration: 'Jun 2024 - Present',
    bullets: [
      'Built REST APIs using Flask serving 10K+ requests/day',
      'Developed React dashboard for real-time analytics',
      'Optimized SQL queries reducing response time by 40%'
    ]
  },
  education: {
    degree: 'B.Tech Computer Science',
    university: 'VIT Pune',
    year: '2021 - 2025',
    gpa: '8.7/10'
  },
  skills: ['Python', 'React', 'SQL', 'Flask', 'HTML', 'CSS'],
  projects: {
    name: 'Smart Attendance System',
    description: 'Face recognition based attendance system using OpenCV and Flask',
    tech: 'Python, OpenCV, Flask, SQLite',
    link: 'github.com/parth/attendance'
  }
};

const missingKeywords = ['Machine Learning', 'Docker', 'AWS', 'TensorFlow', 'FastAPI'];
const addedKeywords = ['Python', 'React', 'SQL', 'Flask'];

export default function ResumeBuilder() {
  const [activeSection, setActiveSection] = useState('Experience');
  const [formData, setFormData] = useState(INITIAL_DATA);
  const [newSkill, setNewSkill] = useState('');

  const handleGenerateAI = () => alert('AI generation coming soon!');
  const handleExport = (type) => alert(`${type} export coming soon!`);

  const updateExperienceBullet = (index, value) => {
    const newBullets = [...formData.experience.bullets];
    newBullets[index] = value;
    setFormData({ ...formData, experience: { ...formData.experience, bullets: newBullets } });
  };

  const addBullet = () => {
    setFormData({
      ...formData,
      experience: { ...formData.experience, bullets: [...formData.experience.bullets, ''] }
    });
  };

  const removeBullet = (index) => {
    setFormData({
      ...formData,
      experience: { ...formData.experience, bullets: formData.experience.bullets.filter((_, i) => i !== index) }
    });
  };

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      if (!formData.skills.includes(newSkill.trim())) {
        setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
      }
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const tabs = [
    { id: 'Experience', icon: Briefcase },
    { id: 'Skills', icon: Code2 },
    { id: 'Education', icon: GraduationCap },
    { id: 'Projects', icon: FileText },
    { id: 'Summary', icon: User }
  ];

  const inputClass = "w-full px-3.5 py-2.5 border border-border rounded-xl bg-surface-alt focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-dark transition-all text-sm";
  const labelClass = "block text-sm font-semibold text-dark mb-1.5";

  const renderEditor = () => {
    switch (activeSection) {
      case 'Experience':
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-dark">Work Experience</h3>
              <button onClick={handleGenerateAI} className="flex items-center gap-2 bg-accent hover:bg-accent-light text-white px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                <Sparkles className="w-4 h-4" /> Enhance with AI
              </button>
            </div>
            <div className="bg-white p-5 rounded-xl border border-border space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Job Title</label>
                  <input type="text" className={inputClass} value={formData.experience.title}
                    onChange={(e) => setFormData({...formData, experience: {...formData.experience, title: e.target.value}})} />
                </div>
                <div>
                  <label className={labelClass}>Company</label>
                  <input type="text" className={inputClass} value={formData.experience.company}
                    onChange={(e) => setFormData({...formData, experience: {...formData.experience, company: e.target.value}})} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Duration</label>
                <input type="text" className={inputClass} value={formData.experience.duration}
                  onChange={(e) => setFormData({...formData, experience: {...formData.experience, duration: e.target.value}})} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold text-dark">Bullet Points</label>
                  <button onClick={addBullet} className="text-xs font-medium text-primary flex items-center gap-1 hover:text-primary-light cursor-pointer">
                    <Plus className="w-3 h-3" /> Add bullet
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.experience.bullets.map((bullet, idx) => (
                    <div key={idx} className="flex gap-2">
                      <textarea rows="2" className={`${inputClass} resize-none flex-1`} value={bullet}
                        onChange={(e) => updateExperienceBullet(idx, e.target.value)} />
                      <button onClick={() => removeBullet(idx)} className="p-2 text-text-muted hover:text-danger transition-colors cursor-pointer self-start">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'Skills':
        return (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold text-dark">Technical Skills</h3>
            <div className="bg-white p-5 rounded-xl border border-border space-y-4">
              <div>
                <label className={labelClass}>Add Skill (Press Enter)</label>
                <input type="text" className={inputClass} value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)} onKeyDown={handleAddSkill}
                  placeholder="e.g. Node.js" />
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map(skill => (
                  <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-medium">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="text-primary/50 hover:text-danger transition-colors cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case 'Education':
        return (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold text-dark">Education</h3>
            <div className="bg-white p-5 rounded-xl border border-border space-y-4">
              <div>
                <label className={labelClass}>Degree</label>
                <input type="text" className={inputClass} value={formData.education.degree}
                  onChange={(e) => setFormData({...formData, education: {...formData.education, degree: e.target.value}})} />
              </div>
              <div>
                <label className={labelClass}>University</label>
                <input type="text" className={inputClass} value={formData.education.university}
                  onChange={(e) => setFormData({...formData, education: {...formData.education, university: e.target.value}})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Year</label>
                  <input type="text" className={inputClass} value={formData.education.year}
                    onChange={(e) => setFormData({...formData, education: {...formData.education, year: e.target.value}})} />
                </div>
                <div>
                  <label className={labelClass}>GPA</label>
                  <input type="text" className={inputClass} value={formData.education.gpa}
                    onChange={(e) => setFormData({...formData, education: {...formData.education, gpa: e.target.value}})} />
                </div>
              </div>
            </div>
          </div>
        );

      case 'Projects':
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-dark">Projects</h3>
              <button onClick={handleGenerateAI} className="flex items-center gap-2 bg-accent hover:bg-accent-light text-white px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                <Sparkles className="w-4 h-4" /> Enhance with AI
              </button>
            </div>
            <div className="bg-white p-5 rounded-xl border border-border space-y-4">
              <div>
                <label className={labelClass}>Project Name</label>
                <input type="text" className={inputClass} value={formData.projects.name}
                  onChange={(e) => setFormData({...formData, projects: {...formData.projects, name: e.target.value}})} />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea rows="3" className={`${inputClass} resize-none`} value={formData.projects.description}
                  onChange={(e) => setFormData({...formData, projects: {...formData.projects, description: e.target.value}})} />
              </div>
              <div>
                <label className={labelClass}>Tech Stack</label>
                <input type="text" className={inputClass} value={formData.projects.tech}
                  onChange={(e) => setFormData({...formData, projects: {...formData.projects, tech: e.target.value}})} />
              </div>
              <div>
                <label className={labelClass}>Link</label>
                <input type="text" className={inputClass} value={formData.projects.link}
                  onChange={(e) => setFormData({...formData, projects: {...formData.projects, link: e.target.value}})} />
              </div>
            </div>
          </div>
        );

      case 'Summary':
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-dark">Professional Summary</h3>
              <button onClick={handleGenerateAI} className="flex items-center gap-2 bg-accent hover:bg-accent-light text-white px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                <Sparkles className="w-4 h-4" /> Enhance with AI
              </button>
            </div>
            <div className="bg-white p-5 rounded-xl border border-border">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-dark">Summary Text</label>
                <span className="text-xs text-text-muted">{formData.summary.length} characters</span>
              </div>
              <textarea rows="8" className={`${inputClass} resize-none leading-relaxed`} value={formData.summary}
                onChange={(e) => setFormData({...formData, summary: e.target.value})} />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-surface py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-bold text-dark">Resume Builder</h1>
          <p className="text-text-secondary mt-1">Edit your resume sections and preview changes in real-time</p>
        </div>

        {/* ATS Keywords Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-border flex flex-col sm:flex-row items-start sm:items-center gap-3 animate-slide-up">
          <div className="flex items-center gap-2 text-dark font-semibold text-sm whitespace-nowrap">
            <Sparkles className="w-5 h-5 text-accent" />
            ATS Keywords:
          </div>
          <div className="flex flex-wrap gap-2 flex-1">
            {addedKeywords.map(kw => (
              <span key={kw} className="inline-flex items-center gap-1.5 px-3 py-1 bg-success/10 text-success border border-success/20 rounded-full text-xs font-medium">
                <CheckCircle2 className="w-3 h-3" /> {kw}
              </span>
            ))}
            {missingKeywords.map(kw => (
              <span key={kw} className="inline-flex items-center gap-1.5 px-3 py-1 bg-danger/10 text-danger border border-danger/20 rounded-full text-xs font-medium">
                <AlertCircle className="w-3 h-3" /> {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left Column: Editor */}
          <div className="flex flex-col gap-4">
            {/* Tab bar */}
            <div className="bg-white p-1.5 rounded-xl shadow-sm border border-border">
              <div className="flex gap-1 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeSection === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSection(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer
                        ${isActive
                          ? 'bg-primary text-white shadow-md shadow-primary/20'
                          : 'text-text-secondary hover:bg-surface-alt hover:text-dark'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.id}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Editor content */}
            <div className="flex-1 min-h-[400px]">
              {renderEditor()}
            </div>

            {/* Export Buttons */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-border flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleExport('PDF (Human)')}
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-3 rounded-xl font-semibold transition-colors cursor-pointer shadow-md shadow-primary/20"
              >
                <Download className="w-5 h-5" />
                Download PDF (Human)
              </button>
              <button
                onClick={() => handleExport('ATS')}
                className="flex-1 flex items-center justify-center gap-2 border-2 border-border hover:border-primary/30 text-dark px-4 py-3 rounded-xl font-semibold transition-colors cursor-pointer"
              >
                <FileText className="w-5 h-5" />
                Download ATS Version
              </button>
            </div>
          </div>

          {/* Right Column: Live Resume Preview */}
          <div className="bg-surface-alt p-4 sm:p-6 rounded-2xl border border-border">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Live Preview</h3>
            <div className="bg-white shadow-xl rounded-sm border border-border/50 p-8 sm:p-10 text-dark min-h-[600px]" style={{ fontFamily: "'Inter', serif" }}>

              {/* Resume Header */}
              <div className="text-center border-b-2 border-dark pb-4 mb-5">
                <h1 className="text-2xl font-bold uppercase tracking-widest mb-2">{formData.name}</h1>
                <div className="flex flex-wrap justify-center gap-4 text-xs text-text-secondary">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{formData.email}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{formData.phone}</span>
                </div>
              </div>

              {/* Summary */}
              {formData.summary && (
                <div className="mb-5">
                  <p className="text-xs text-text-secondary leading-relaxed">{formData.summary}</p>
                </div>
              )}

              {/* Experience */}
              <div className="mb-5">
                <h2 className="text-xs font-bold uppercase tracking-widest border-b border-border pb-1 mb-3 text-dark">Experience</h2>
                <div className="flex items-baseline justify-between mb-1">
                  <h3 className="text-sm font-bold">{formData.experience.title}</h3>
                  <span className="text-[10px] text-text-muted font-medium">{formData.experience.duration}</span>
                </div>
                <p className="text-xs text-text-secondary font-medium mb-2">{formData.experience.company}</p>
                <ul className="list-disc list-outside ml-4 space-y-0.5">
                  {formData.experience.bullets.map((bullet, idx) => (
                    <li key={idx} className="text-xs text-text-secondary pl-0.5">{bullet}</li>
                  ))}
                </ul>
              </div>

              {/* Education */}
              <div className="mb-5">
                <h2 className="text-xs font-bold uppercase tracking-widest border-b border-border pb-1 mb-3 text-dark">Education</h2>
                <div className="flex items-baseline justify-between mb-0.5">
                  <h3 className="text-sm font-bold">{formData.education.degree}</h3>
                  <span className="text-[10px] text-text-muted font-medium">{formData.education.year}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-text-secondary">{formData.education.university}</span>
                  <span className="text-xs text-text-secondary">GPA: {formData.education.gpa}</span>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-5">
                <h2 className="text-xs font-bold uppercase tracking-widest border-b border-border pb-1 mb-3 text-dark">Skills</h2>
                <p className="text-xs text-text-secondary leading-relaxed">{formData.skills.join(' • ')}</p>
              </div>

              {/* Projects */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest border-b border-border pb-1 mb-3 text-dark">Projects</h2>
                <div className="flex items-baseline justify-between mb-0.5">
                  <h3 className="text-sm font-bold">{formData.projects.name}</h3>
                  <span className="text-[10px] text-text-muted">{formData.projects.link}</span>
                </div>
                <p className="text-xs text-text-secondary mb-1">{formData.projects.description}</p>
                <p className="text-[10px] text-text-muted italic">Tech: {formData.projects.tech}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

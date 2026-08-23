import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Sparkles, Download, FileText, Briefcase, GraduationCap, Code2, User, X, CheckCircle2, AlertCircle, Plus, Mail, Phone, Globe, Loader2, MapPin, Link as LinkIcon, Award, BookOpen, Trophy, Zap, ArrowRight, ArrowLeft, Save, Moon } from 'lucide-react';
import { enhanceSection, enhanceBullet } from '../api/ai';
import { parseStructuredResume } from '../api/analyse';
import useAgentStore from '../store/useAgentStore';

const INITIAL_DATA = {
  name: '',
  location: '',
  phone: '',
  email: '',
  links: [{ label: 'LinkedIn', url: '' }, { label: 'GitHub', url: '' }],
  summary: '',
  experiences: [
    {
      id: 1, title: '', company: '', duration: '', techStack: '',
      bullets: ['']
    }
  ],
  education: [
    { id: 1, degree: '', university: '', year: '', gpa: '' }
  ],
  projects: [
    { id: 1, name: '', description: '', tech: '', link: '', bullets: [''] }
  ],
  skillCategories: [
    { id: 1, category: 'Languages', skills: '' },
    { id: 2, category: 'Frameworks', skills: '' },
    { id: 3, category: 'Databases & Cloud', skills: '' },
  ],
  publications: [],
  achievements: [],
  certifications: [],
};

let _nextId = 100;
const nextId = () => ++_nextId;

export default function ResumeBuilder() {
  const [activeSection, setActiveSection] = useState('Experience');
  const [formData, setFormData] = useState(INITIAL_DATA);
  const [enhancing, setEnhancing] = useState({});
  const [parsingResume, setParsingResume] = useState(false);
  const [appliedImprovements, setAppliedImprovements] = useState(new Set());
  
  const resumeText = useAgentStore((s) => s.resumeText);
  const jdText = useAgentStore((s) => s.jdText);
  const jobRole = useAgentStore((s) => s.jobRole);
  const analysisResult = useAgentStore((s) => s.analysisResult);

  // Auto-populate resume builder with uploaded resume
  useEffect(() => {
    if (resumeText && !formData.name) {
      setParsingResume(true);
      parseStructuredResume(resumeText)
        .then((data) => {
          if (data && (data.name || data.experiences?.length || data.education?.length)) {
            setFormData(prev => ({
              ...prev,
              ...data,
              experiences: data.experiences?.length ? data.experiences : prev.experiences,
              education: data.education?.length ? data.education : prev.education,
              projects: data.projects?.length ? data.projects : prev.projects,
              skillCategories: data.skillCategories?.length ? data.skillCategories : prev.skillCategories,
            }));
          }
        })
        .catch((err) => console.warn('Could not auto-parse resume:', err))
        .finally(() => setParsingResume(false));
    }
  }, [resumeText]);

  const setEnhancingKey = (key, val) => setEnhancing(prev => ({ ...prev, [key]: val }));

  const handleEnhanceSection = async (sectionType, content, key) => {
    setEnhancingKey(key, true);
    try {
      const res = await enhanceSection(sectionType, content, jdText, jobRole);
      return res.enhanced;
    } catch (err) {
      console.error('Enhancement failed:', err);
      alert('AI enhancement failed. Is the backend running?');
      return null;
    } finally {
      setEnhancingKey(key, false);
    }
  };

  const handleEnhanceBulletPoint = async (bullet, key) => {
    setEnhancingKey(key, true);
    try {
      const res = await enhanceBullet(bullet, `Job role: ${jobRole}. JD: ${jdText}`);
      return res.enhanced;
    } catch (err) {
      console.error('Bullet enhancement failed:', err);
      return null;
    } finally {
      setEnhancingKey(key, false);
    }
  };

  const handleApplyImprovement = (item, idx) => {
    const section = item.section?.toLowerCase();
    if (section === 'summary') {
      setFormData(prev => ({ ...prev, summary: item.suggested }));
    } else if (section === 'experience') {
      setFormData(prev => {
        const exps = [...prev.experiences];
        if (exps.length > 0) {
          exps[0] = {
            ...exps[0],
            bullets: [item.suggested, ...exps[0].bullets.filter(b => b.trim() !== item.current)]
          };
        } else {
          exps.push({
            id: nextId(),
            title: jobRole || 'Software Engineer',
            company: 'Target Experience',
            duration: '2023 - Present',
            bullets: [item.suggested]
          });
        }
        return { ...prev, experiences: exps };
      });
    } else if (section === 'skills') {
      setFormData(prev => {
        const cats = [...prev.skillCategories];
        if (cats.length > 0) {
          cats[0] = { ...cats[0], skills: cats[0].skills ? `${cats[0].skills}, ${item.suggested}` : item.suggested };
        } else {
          cats.push({ id: nextId(), category: 'Target Skills', skills: item.suggested });
        }
        return { ...prev, skillCategories: cats };
      });
    } else if (section === 'projects') {
      setFormData(prev => {
        const projs = [...prev.projects];
        if (projs.length > 0) {
          projs[0] = { ...projs[0], bullets: [item.suggested, ...(projs[0].bullets || [])] };
        }
        return { ...prev, projects: projs };
      });
    }
    setAppliedImprovements(prev => new Set([...prev, idx]));
  };

  // Helpers
  const updateList = (field, id, updates) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map(item => item.id === id ? { ...item, ...updates } : item)
    }));
  };

  const addToList = (field, template) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], { ...template, id: nextId() }]
    }));
  };

  const removeFromList = (field, id) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(item => item.id !== id)
    }));
  };

  const handleExport = (type) => {
    const previewEl = document.getElementById('resume-preview');
    if (!previewEl) { window.print(); return; }
    const printWindow = window.open('', '_blank', 'width=800,height=1100');
    printWindow.document.write(`
      <html><head><title>Resume - ${formData.name || 'Download'}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; padding: 40px; color: #1a1a1a; }
        @media print {
          body { padding: 0; }
          @page { margin: 0.5in; size: A4; }
        }
      </style></head><body>${previewEl.innerHTML}</body></html>
    `);
    printWindow.document.close();
    printWindow.onload = () => { printWindow.print(); printWindow.close(); };
  };

  const inputClass = "w-full px-3.5 py-2.5 border border-border rounded-xl bg-surface-alt focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-dark transition-all text-sm";
  const labelClass = "block text-sm font-semibold text-dark mb-1.5";

  const EnhanceBtn = ({ onClick, loading, label = 'Improve with AI' }) => (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 bg-accent hover:bg-accent-light text-white px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-60"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
      {loading ? 'Enhancing...' : label}
    </button>
  );

  const BulletEnhanceBtn = ({ onClick, loading }) => (
    <button onClick={onClick} disabled={loading} title="Improve with AI"
      className="p-1.5 text-accent/60 hover:text-accent hover:bg-accent/10 rounded-lg transition-all cursor-pointer disabled:opacity-50 self-start mt-1">
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
    </button>
  );

  const improvements = analysisResult?.resume_improvements || [];

  const tabs = [
    ...(improvements.length > 0 ? [{ id: 'JD Improvements', icon: Zap, badge: improvements.length }] : []),
    { id: 'Experience', icon: Briefcase },
    { id: 'Projects', icon: FileText },
    { id: 'Skills', icon: Code2 },
    { id: 'Education', icon: GraduationCap },
    { id: 'Summary', icon: User },
    { id: 'More', icon: Award },
  ];

  const renderEditor = () => {
    switch (activeSection) {
      case 'JD Improvements':
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-lg font-bold text-dark flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  AI Suggested Changes for This JD
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  1-Click apply recommended bullet improvements to your live resume
                </p>
              </div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                {improvements.length} recommendations
              </span>
            </div>

            <div className="space-y-4">
              {improvements.map((item, idx) => {
                const isApplied = appliedImprovements.has(idx);
                return (
                  <div key={idx} className="bg-white p-5 rounded-xl border border-border shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary">
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
                        <span className="text-[11px] font-semibold text-text-muted uppercase">Original in Resume:</span>
                        <p className="text-xs text-text-secondary bg-surface-alt p-2.5 rounded-lg border border-border line-through opacity-80 mt-0.5">
                          {item.current}
                        </p>
                      </div>
                    )}

                    <div>
                      <span className="text-[11px] font-semibold text-success uppercase">Suggested Replacement:</span>
                      <p className="text-xs text-dark font-medium bg-success/5 border border-success/20 p-3 rounded-lg mt-0.5 leading-relaxed">
                        {item.suggested}
                      </p>
                    </div>

                    {item.reason && (
                      <p className="text-xs text-text-secondary italic">
                        <strong className="text-primary">Why: </strong>{item.reason}
                      </p>
                    )}

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleApplyImprovement(item, idx)}
                        disabled={isApplied}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isApplied
                            ? 'bg-success/10 text-success border border-success/20 cursor-default'
                            : 'bg-primary hover:bg-primary-light text-white shadow-sm shadow-primary/20 hover:shadow-md'
                        }`}
                      >
                        {isApplied ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-success" />
                            Applied to Resume
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Apply to Resume
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 'Experience':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-dark">Work Experience</h3>
              <div className="flex gap-2">
                <EnhanceBtn
                  loading={enhancing['exp-all']}
                  onClick={async () => {
                    const content = formData.experiences.map(e =>
                      `${e.title} at ${e.company} (${e.duration})\n${e.bullets.join('\n')}`
                    ).join('\n\n');
                    const enhanced = await handleEnhanceSection('experience', content, 'exp-all');
                    if (enhanced) {
                      // Replace first experience bullets with enhanced content
                      const lines = enhanced.split('\n').filter(l => l.trim());
                      if (formData.experiences.length > 0) {
                        updateList('experiences', formData.experiences[0].id, { bullets: lines });
                      }
                    }
                  }}
                />
                <button onClick={() => addToList('experiences', { title: '', company: '', duration: '', techStack: '', bullets: [''] })}
                  className="flex items-center gap-1.5 text-sm font-medium text-primary hover:bg-primary/5 px-3 py-2 rounded-lg cursor-pointer">
                  <Plus className="w-4 h-4" /> Add Entry
                </button>
              </div>
            </div>

            {formData.experiences.map((exp, expIdx) => (
              <div key={exp.id} className="bg-white p-5 rounded-xl border border-border space-y-4 relative">
                {formData.experiences.length > 1 && (
                  <button onClick={() => removeFromList('experiences', exp.id)}
                    className="absolute top-3 right-3 p-1.5 text-text-muted hover:text-danger transition-colors cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Job Title</label>
                    <input type="text" className={inputClass} value={exp.title} placeholder="Software Developer Intern"
                      onChange={(e) => updateList('experiences', exp.id, { title: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelClass}>Company</label>
                    <input type="text" className={inputClass} value={exp.company} placeholder="TechCorp"
                      onChange={(e) => updateList('experiences', exp.id, { company: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Duration</label>
                    <input type="text" className={inputClass} value={exp.duration} placeholder="Jun 2024 - Present"
                      onChange={(e) => updateList('experiences', exp.id, { duration: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelClass}>Tech Stack</label>
                    <input type="text" className={inputClass} value={exp.techStack || ''} placeholder="Python, Flask, React"
                      onChange={(e) => updateList('experiences', exp.id, { techStack: e.target.value })} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-semibold text-dark">Bullet Points</label>
                    <button onClick={() => updateList('experiences', exp.id, { bullets: [...exp.bullets, ''] })}
                      className="text-xs font-medium text-primary flex items-center gap-1 hover:text-primary-light cursor-pointer">
                      <Plus className="w-3 h-3" /> Add bullet
                    </button>
                  </div>
                  <div className="space-y-2">
                    {exp.bullets.map((bullet, idx) => (
                      <div key={idx} className="flex gap-2">
                        <textarea rows="2" className={`${inputClass} resize-none flex-1`} value={bullet}
                          placeholder="Describe your achievement with metrics..."
                          onChange={(e) => {
                            const newBullets = [...exp.bullets];
                            newBullets[idx] = e.target.value;
                            updateList('experiences', exp.id, { bullets: newBullets });
                          }} />
                        <BulletEnhanceBtn
                          loading={enhancing[`exp-${exp.id}-${idx}`]}
                          onClick={async () => {
                            if (!bullet.trim()) return;
                            const enhanced = await handleEnhanceBulletPoint(bullet, `exp-${exp.id}-${idx}`);
                            if (enhanced) {
                              const newBullets = [...exp.bullets];
                              newBullets[idx] = enhanced;
                              updateList('experiences', exp.id, { bullets: newBullets });
                            }
                          }}
                        />
                        <button onClick={() => {
                          const newBullets = exp.bullets.filter((_, i) => i !== idx);
                          updateList('experiences', exp.id, { bullets: newBullets.length ? newBullets : [''] });
                        }} className="p-2 text-text-muted hover:text-danger transition-colors cursor-pointer self-start">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'Projects':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-dark">Projects</h3>
              <div className="flex gap-2">
                <EnhanceBtn loading={enhancing['proj-all']} onClick={async () => {
                  const content = formData.projects.map(p => `${p.name}: ${p.description}\nTech: ${p.tech}`).join('\n\n');
                  const enhanced = await handleEnhanceSection('project', content, 'proj-all');
                  if (enhanced && formData.projects.length > 0) {
                    const lines = enhanced.split('\n').filter(l => l.trim());
                    updateList('projects', formData.projects[0].id, { bullets: lines });
                  }
                }} />
                <button onClick={() => addToList('projects', { name: '', description: '', tech: '', link: '', bullets: [''] })}
                  className="flex items-center gap-1.5 text-sm font-medium text-primary hover:bg-primary/5 px-3 py-2 rounded-lg cursor-pointer">
                  <Plus className="w-4 h-4" /> Add Project
                </button>
              </div>
            </div>

            {formData.projects.map((proj) => (
              <div key={proj.id} className="bg-white p-5 rounded-xl border border-border space-y-4 relative">
                {formData.projects.length > 1 && (
                  <button onClick={() => removeFromList('projects', proj.id)}
                    className="absolute top-3 right-3 p-1.5 text-text-muted hover:text-danger transition-colors cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Project Name</label>
                    <input type="text" className={inputClass} value={proj.name} placeholder="Smart Attendance System"
                      onChange={(e) => updateList('projects', proj.id, { name: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelClass}>Tech Stack</label>
                    <input type="text" className={inputClass} value={proj.tech} placeholder="Python, Flask, React"
                      onChange={(e) => updateList('projects', proj.id, { tech: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea rows="2" className={`${inputClass} resize-none`} value={proj.description} placeholder="Brief project description..."
                    onChange={(e) => updateList('projects', proj.id, { description: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>Link</label>
                  <input type="text" className={inputClass} value={proj.link} placeholder="github.com/user/project"
                    onChange={(e) => updateList('projects', proj.id, { link: e.target.value })} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-semibold text-dark">Bullet Points</label>
                    <button onClick={() => updateList('projects', proj.id, { bullets: [...(proj.bullets || []), ''] })}
                      className="text-xs font-medium text-primary flex items-center gap-1 hover:text-primary-light cursor-pointer">
                      <Plus className="w-3 h-3" /> Add bullet
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(proj.bullets || []).map((bullet, idx) => (
                      <div key={idx} className="flex gap-2">
                        <textarea rows="2" className={`${inputClass} resize-none flex-1`} value={bullet} placeholder="Describe what you built..."
                          onChange={(e) => {
                            const newBullets = [...(proj.bullets || [])];
                            newBullets[idx] = e.target.value;
                            updateList('projects', proj.id, { bullets: newBullets });
                          }} />
                        <BulletEnhanceBtn loading={enhancing[`proj-${proj.id}-${idx}`]} onClick={async () => {
                          if (!bullet.trim()) return;
                          const enhanced = await handleEnhanceBulletPoint(bullet, `proj-${proj.id}-${idx}`);
                          if (enhanced) {
                            const nb = [...(proj.bullets || [])];
                            nb[idx] = enhanced;
                            updateList('projects', proj.id, { bullets: nb });
                          }
                        }} />
                        <button onClick={() => {
                          const nb = (proj.bullets || []).filter((_, i) => i !== idx);
                          updateList('projects', proj.id, { bullets: nb.length ? nb : [''] });
                        }} className="p-2 text-text-muted hover:text-danger transition-colors cursor-pointer self-start">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'Skills':
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-dark">Technical Skills</h3>
              <button onClick={() => addToList('skillCategories', { category: '', skills: '' })}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:bg-primary/5 px-3 py-2 rounded-lg cursor-pointer">
                <Plus className="w-4 h-4" /> Add Category
              </button>
            </div>
            {formData.skillCategories.map((cat) => (
              <div key={cat.id} className="bg-white p-5 rounded-xl border border-border space-y-3 relative">
                {formData.skillCategories.length > 1 && (
                  <button onClick={() => removeFromList('skillCategories', cat.id)}
                    className="absolute top-3 right-3 p-1.5 text-text-muted hover:text-danger transition-colors cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div>
                  <label className={labelClass}>Category Name</label>
                  <input type="text" className={inputClass} value={cat.category} placeholder="e.g. Languages, AI/ML, Cloud"
                    onChange={(e) => updateList('skillCategories', cat.id, { category: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>Skills (comma-separated)</label>
                  <input type="text" className={inputClass} value={cat.skills} placeholder="Python, JavaScript, C++"
                    onChange={(e) => updateList('skillCategories', cat.id, { skills: e.target.value })} />
                </div>
              </div>
            ))}
          </div>
        );

      case 'Education':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-dark">Education</h3>
              <button onClick={() => addToList('education', { degree: '', university: '', year: '', gpa: '' })}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:bg-primary/5 px-3 py-2 rounded-lg cursor-pointer">
                <Plus className="w-4 h-4" /> Add Education
              </button>
            </div>
            {formData.education.map((edu) => (
              <div key={edu.id} className="bg-white p-5 rounded-xl border border-border space-y-4 relative">
                {formData.education.length > 1 && (
                  <button onClick={() => removeFromList('education', edu.id)}
                    className="absolute top-3 right-3 p-1.5 text-text-muted hover:text-danger transition-colors cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div>
                  <label className={labelClass}>Degree</label>
                  <input type="text" className={inputClass} value={edu.degree} placeholder="B.Tech Computer Science"
                    onChange={(e) => updateList('education', edu.id, { degree: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>University / School</label>
                  <input type="text" className={inputClass} value={edu.university} placeholder="RSCOE, Pune"
                    onChange={(e) => updateList('education', edu.id, { university: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Year</label>
                    <input type="text" className={inputClass} value={edu.year} placeholder="2024 - 2028"
                      onChange={(e) => updateList('education', edu.id, { year: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelClass}>GPA / Percentile</label>
                    <input type="text" className={inputClass} value={edu.gpa} placeholder="8.11/10"
                      onChange={(e) => updateList('education', edu.id, { gpa: e.target.value })} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'Summary':
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-dark">Contact & Summary</h3>
              <EnhanceBtn loading={enhancing['summary']} onClick={async () => {
                const enhanced = await handleEnhanceSection('summary', formData.summary, 'summary');
                if (enhanced) setFormData(prev => ({ ...prev, summary: enhanced }));
              }} />
            </div>
            <div className="bg-white p-5 rounded-xl border border-border space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input type="text" className={inputClass} value={formData.name} placeholder="Parth Kulkarni"
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <input type="text" className={inputClass} value={formData.location} placeholder="Pune, Maharashtra"
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Phone</label>
                  <input type="text" className={inputClass} value={formData.phone} placeholder="+91 8999126149"
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input type="text" className={inputClass} value={formData.email} placeholder="email@gmail.com"
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
              </div>
              {/* Links */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold text-dark">Links</label>
                  <button onClick={() => setFormData(prev => ({ ...prev, links: [...prev.links, { label: '', url: '' }] }))}
                    className="text-xs font-medium text-primary flex items-center gap-1 hover:text-primary-light cursor-pointer">
                    <Plus className="w-3 h-3" /> Add link
                  </button>
                </div>
                {formData.links.map((link, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input type="text" className={`${inputClass} w-1/3`} value={link.label} placeholder="LinkedIn"
                      onChange={(e) => {
                        const newLinks = [...formData.links];
                        newLinks[idx] = { ...newLinks[idx], label: e.target.value };
                        setFormData({ ...formData, links: newLinks });
                      }} />
                    <input type="text" className={`${inputClass} flex-1`} value={link.url} placeholder="https://..."
                      onChange={(e) => {
                        const newLinks = [...formData.links];
                        newLinks[idx] = { ...newLinks[idx], url: e.target.value };
                        setFormData({ ...formData, links: newLinks });
                      }} />
                    <button onClick={() => setFormData({ ...formData, links: formData.links.filter((_, i) => i !== idx) })}
                      className="p-2 text-text-muted hover:text-danger transition-colors cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold text-dark">Professional Summary</label>
                  <span className="text-xs text-text-muted">{formData.summary.length} characters</span>
                </div>
                <textarea rows="5" className={`${inputClass} resize-none leading-relaxed`} value={formData.summary}
                  placeholder="Results-driven software developer with expertise in..."
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })} />
              </div>
            </div>
          </div>
        );

      case 'More':
        return (
          <div className="space-y-6 animate-fade-in">
            {/* Publications */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-dark flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" /> Publications
                </h3>
                <button onClick={() => addToList('publications', { title: '', venue: '', status: '', description: '' })}
                  className="flex items-center gap-1.5 text-sm font-medium text-primary hover:bg-primary/5 px-3 py-2 rounded-lg cursor-pointer">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              {formData.publications.map((pub) => (
                <div key={pub.id} className="bg-white p-4 rounded-xl border border-border space-y-3 mb-3 relative">
                  <button onClick={() => removeFromList('publications', pub.id)}
                    className="absolute top-3 right-3 p-1 text-text-muted hover:text-danger cursor-pointer"><X className="w-4 h-4" /></button>
                  <input type="text" className={inputClass} value={pub.title} placeholder="Paper Title"
                    onChange={(e) => updateList('publications', pub.id, { title: e.target.value })} />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" className={inputClass} value={pub.venue} placeholder="Conference/Journal"
                      onChange={(e) => updateList('publications', pub.id, { venue: e.target.value })} />
                    <input type="text" className={inputClass} value={pub.status} placeholder="Published / Under Review"
                      onChange={(e) => updateList('publications', pub.id, { status: e.target.value })} />
                  </div>
                  <textarea rows="2" className={`${inputClass} resize-none`} value={pub.description} placeholder="Description..."
                    onChange={(e) => updateList('publications', pub.id, { description: e.target.value })} />
                </div>
              ))}
              {formData.publications.length === 0 && <p className="text-text-muted text-sm italic">No publications added.</p>}
            </div>

            {/* Achievements */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-dark flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-warning" /> Achievements & Activities
                </h3>
                <button onClick={() => addToList('achievements', { text: '' })}
                  className="flex items-center gap-1.5 text-sm font-medium text-primary hover:bg-primary/5 px-3 py-2 rounded-lg cursor-pointer">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              {formData.achievements.map((ach) => (
                <div key={ach.id} className="flex gap-2 mb-2">
                  <input type="text" className={`${inputClass} flex-1`} value={ach.text} placeholder="Achievement description..."
                    onChange={(e) => updateList('achievements', ach.id, { text: e.target.value })} />
                  <button onClick={() => removeFromList('achievements', ach.id)}
                    className="p-2 text-text-muted hover:text-danger cursor-pointer"><X className="w-4 h-4" /></button>
                </div>
              ))}
              {formData.achievements.length === 0 && <p className="text-text-muted text-sm italic">No achievements added.</p>}
            </div>

            {/* Certifications */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-dark flex items-center gap-2">
                  <Award className="w-5 h-5 text-success" /> Certifications
                </h3>
                <button onClick={() => addToList('certifications', { name: '', issuer: '' })}
                  className="flex items-center gap-1.5 text-sm font-medium text-primary hover:bg-primary/5 px-3 py-2 rounded-lg cursor-pointer">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              {formData.certifications.map((cert) => (
                <div key={cert.id} className="flex gap-2 mb-2">
                  <input type="text" className={`${inputClass} flex-1`} value={cert.name} placeholder="Certification Name"
                    onChange={(e) => updateList('certifications', cert.id, { name: e.target.value })} />
                  <input type="text" className={`${inputClass} w-1/3`} value={cert.issuer} placeholder="Issuer"
                    onChange={(e) => updateList('certifications', cert.id, { issuer: e.target.value })} />
                  <button onClick={() => removeFromList('certifications', cert.id)}
                    className="p-2 text-text-muted hover:text-danger cursor-pointer"><X className="w-4 h-4" /></button>
                </div>
              ))}
              {formData.certifications.length === 0 && <p className="text-text-muted text-sm italic">No certifications added.</p>}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Calculate completeness percentage
  const completeness = (() => {
    let filled = 0, total = 10;
    if (formData.name) filled++;
    if (formData.email) filled++;
    if (formData.phone) filled++;
    if (formData.summary) filled++;
    if (formData.experiences.some(e => e.title)) filled++;
    if (formData.experiences.some(e => e.bullets.some(b => b.trim()))) filled++;
    if (formData.education.some(e => e.degree)) filled++;
    if (formData.projects.some(p => p.name)) filled++;
    if (formData.skillCategories.some(c => c.skills)) filled++;
    if (formData.location) filled++;
    return Math.round((filled / total) * 100);
  })();

  const progressLabel = completeness < 30 ? '🚀 Just getting started!' : completeness < 60 ? '🔥 Taking off!' : completeness < 90 ? '💪 Looking strong!' : '🎯 Almost perfect!';

  return (
    <div className="fixed inset-0 flex flex-col bg-white" style={{ top: 0, zIndex: 40 }}>
      {/* ===== TOP TOOLBAR ===== */}
      <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 shrink-0">
        {/* Left: Back + Title */}
        <div className="flex items-center gap-3">
          <RouterLink to="/" className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </RouterLink>
          <span className="font-bold text-gray-800 text-lg">ResumeBuilder</span>
        </div>

        {/* Center: Progress */}
        <div className="hidden md:flex items-center gap-3 bg-gray-50 rounded-full px-4 py-1.5">
          <span className="text-sm font-medium text-gray-600">{progressLabel}</span>
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${completeness}%` }} />
          </div>
          <span className="text-sm font-bold text-emerald-600">{completeness}%</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
            <Moon className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleExport('PDF')}
            className="flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Speak & Generate Resume</span>
          </button>
          <button className="flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Save</span>
          </button>
          <button
            onClick={() => handleExport('PDF')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 cursor-pointer"
            title="Download PDF"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ===== MAIN BODY (Sidebar + Content) ===== */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* ===== LEFT SIDEBAR ===== */}
        <div className="w-12 md:w-14 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4 gap-1 shrink-0 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                title={tab.id}
                className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ===== CONTENT AREA (Editor + Preview side by side) ===== */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* ===== LEFT: EDITOR PANEL ===== */}
          <div className="flex-1 min-w-0 overflow-y-auto p-6 lg:p-8 bg-white">
            {/* Section Title */}
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-xl font-bold text-gray-800">{activeSection}</h2>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <FileText className="w-4 h-4" />
              </button>
            </div>

            {/* Parsing indicator */}
            {parsingResume && (
              <div className="mb-6 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
                <Loader2 className="w-4 h-4 animate-spin" />
                Parsing your uploaded resume into structured fields...
              </div>
            )}

            {/* Editor content */}
            <div className="max-w-2xl">
              {renderEditor()}
            </div>
          </div>

          {/* ===== RIGHT: LIVE PREVIEW PANEL ===== */}
          <div className="hidden lg:flex flex-col w-[420px] xl:w-[480px] bg-gray-100 border-l border-gray-200 shrink-0">
            {/* Preview toolbar */}
            <div className="flex items-center justify-end gap-2 px-4 py-2 border-b border-gray-200 bg-white">
              <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-300 text-gray-500 hover:bg-gray-100 text-xs font-bold">−</button>
              <span className="text-xs text-gray-500 font-medium">60%</span>
              <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-300 text-gray-500 hover:bg-gray-100 text-xs font-bold">+</button>
            </div>
            
            {/* Preview scroll area */}
            <div className="flex-1 overflow-y-auto p-4">
              <div
                id="resume-preview"
                className="bg-white shadow-xl rounded-sm border border-gray-300 p-6 text-gray-900 mx-auto"
                style={{ fontFamily: "'Inter', serif", width: '100%', minHeight: '600px', transformOrigin: 'top center', transform: 'scale(0.6)' }}
              >
                {/* Resume Header */}
                <div className="text-center border-b-2 border-gray-800 pb-4 mb-5">
                  <h1 className="text-2xl font-bold uppercase tracking-widest mb-2">{formData.name || 'YOUR NAME'}</h1>
                  <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-500">
                    {formData.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{formData.location}</span>}
                    {formData.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{formData.phone}</span>}
                    {formData.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{formData.email}</span>}
                    {formData.links.filter(l => l.url).map((link, i) => (
                      <span key={i} className="flex items-center gap-1"><Globe className="w-3 h-3" />{link.url}</span>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                {formData.summary && (
                  <div className="mb-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-3">Summary</h2>
                    <p className="text-xs text-gray-600 leading-relaxed">{formData.summary}</p>
                  </div>
                )}

                {/* Education */}
                {formData.education.some(e => e.degree) && (
                  <div className="mb-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-3">Education</h2>
                    {formData.education.filter(e => e.degree).map((edu) => (
                      <div key={edu.id} className="mb-2">
                        <div className="flex items-baseline justify-between mb-0.5">
                          <h3 className="text-sm font-bold">{edu.university}</h3>
                          <span className="text-[10px] text-gray-400 font-medium">{edu.year}</span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-gray-500">{edu.degree}{edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Experience */}
                {formData.experiences.some(e => e.title) && (
                  <div className="mb-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-3">Experience</h2>
                    {formData.experiences.filter(e => e.title).map((exp) => (
                      <div key={exp.id} className="mb-3">
                        <div className="flex items-baseline justify-between mb-0.5">
                          <h3 className="text-sm font-bold">{exp.title}</h3>
                          <span className="text-[10px] text-gray-400 font-medium">{exp.duration}</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium mb-1">{exp.company}</p>
                        {exp.techStack && <p className="text-[10px] text-gray-400 italic mb-1">{exp.techStack}</p>}
                        <ul className="list-disc list-outside ml-4 space-y-0.5">
                          {exp.bullets.filter(b => b.trim()).map((bullet, idx) => (
                            <li key={idx} className="text-xs text-gray-500 pl-0.5">{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {/* Projects */}
                {formData.projects.some(p => p.name) && (
                  <div className="mb-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-3">Projects</h2>
                    {formData.projects.filter(p => p.name).map((proj) => (
                      <div key={proj.id} className="mb-3">
                        <div className="flex items-baseline justify-between mb-0.5">
                          <h3 className="text-sm font-bold">{proj.name}</h3>
                          {proj.link && <span className="text-[10px] text-gray-400">{proj.link}</span>}
                        </div>
                        {proj.tech && <p className="text-[10px] text-gray-400 italic mb-1">{proj.tech}</p>}
                        {proj.description && <p className="text-xs text-gray-500 mb-1">{proj.description}</p>}
                        {proj.bullets && proj.bullets.some(b => b.trim()) && (
                          <ul className="list-disc list-outside ml-4 space-y-0.5">
                            {proj.bullets.filter(b => b.trim()).map((bullet, idx) => (
                              <li key={idx} className="text-xs text-gray-500 pl-0.5">{bullet}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Skills */}
                {formData.skillCategories.some(c => c.skills) && (
                  <div className="mb-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-3">Skills</h2>
                    {formData.skillCategories.filter(c => c.skills).map((cat) => (
                      <p key={cat.id} className="text-xs text-gray-500 mb-0.5">
                        <span className="font-semibold text-gray-800">{cat.category}: </span>{cat.skills}
                      </p>
                    ))}
                  </div>
                )}

                {/* Publications */}
                {formData.publications.length > 0 && (
                  <div className="mb-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-3">Publications</h2>
                    {formData.publications.map((pub) => (
                      <div key={pub.id} className="mb-2">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs font-semibold">{pub.title}</span>
                          <span className="text-[10px] text-gray-400">{pub.status}</span>
                        </div>
                        {pub.description && <p className="text-xs text-gray-500">{pub.description}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Certifications */}
                {formData.certifications.length > 0 && (
                  <div className="mb-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-3">Certifications</h2>
                    <p className="text-xs text-gray-500">
                      {formData.certifications.map(c => `${c.name}${c.issuer ? ` (${c.issuer})` : ''}`).join(' · ')}
                    </p>
                  </div>
                )}

                {/* Achievements */}
                {formData.achievements.length > 0 && (
                  <div className="mb-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-3">Honors & Awards</h2>
                    <ul className="list-disc list-outside ml-4 space-y-0.5">
                      {formData.achievements.map((ach) => (
                        <li key={ach.id} className="text-xs text-gray-500">{ach.text}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Sparkles, Download, FileText, Briefcase, GraduationCap, Code2, User, X, CheckCircle2, AlertCircle, Plus, Mail, Phone, Globe, Loader2, MapPin, Link as LinkIcon, Award, BookOpen, Trophy } from 'lucide-react';
import { enhanceSection, enhanceBullet } from '../api/ai';
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
  const jdText = useAgentStore((s) => s.jdText);
  const jobRole = useAgentStore((s) => s.jobRole);

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

  const handleExport = (type) => alert(`${type} export coming soon!`);

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

  const tabs = [
    { id: 'Experience', icon: Briefcase },
    { id: 'Projects', icon: FileText },
    { id: 'Skills', icon: Code2 },
    { id: 'Education', icon: GraduationCap },
    { id: 'Summary', icon: User },
    { id: 'More', icon: Award },
  ];

  const renderEditor = () => {
    switch (activeSection) {
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

  return (
    <div className="min-h-screen bg-surface py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-bold text-dark">Resume Builder</h1>
          <p className="text-text-secondary mt-1">Edit your resume sections, enhance with AI, and preview in real-time</p>
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
                onClick={() => handleExport('PDF')}
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-3 rounded-xl font-semibold transition-colors cursor-pointer shadow-md shadow-primary/20"
              >
                <Download className="w-5 h-5" />
                Download PDF
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
                <h1 className="text-2xl font-bold uppercase tracking-widest mb-2">{formData.name || 'YOUR NAME'}</h1>
                <div className="flex flex-wrap justify-center gap-3 text-xs text-text-secondary">
                  {formData.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{formData.location}</span>}
                  {formData.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{formData.phone}</span>}
                  {formData.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{formData.email}</span>}
                  {formData.links.filter(l => l.url).map((link, i) => (
                    <span key={i} className="flex items-center gap-1"><Globe className="w-3 h-3" />{link.label}</span>
                  ))}
                </div>
              </div>

              {/* Education */}
              {formData.education.some(e => e.degree) && (
                <div className="mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-widest border-b border-border pb-1 mb-3 text-dark">Education</h2>
                  {formData.education.filter(e => e.degree).map((edu) => (
                    <div key={edu.id} className="mb-2">
                      <div className="flex items-baseline justify-between mb-0.5">
                        <h3 className="text-sm font-bold">{edu.university}</h3>
                        <span className="text-[10px] text-text-muted font-medium">{edu.year}</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-text-secondary">{edu.degree}</span>
                        {edu.gpa && <span className="text-xs text-text-secondary">CGPA: {edu.gpa}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Experience */}
              {formData.experiences.some(e => e.title) && (
                <div className="mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-widest border-b border-border pb-1 mb-3 text-dark">Experience</h2>
                  {formData.experiences.filter(e => e.title).map((exp) => (
                    <div key={exp.id} className="mb-3">
                      <div className="flex items-baseline justify-between mb-0.5">
                        <h3 className="text-sm font-bold">{exp.title}</h3>
                        <span className="text-[10px] text-text-muted font-medium">{exp.duration}</span>
                      </div>
                      <p className="text-xs text-text-secondary font-medium mb-1">{exp.company}</p>
                      {exp.techStack && <p className="text-[10px] text-text-muted italic mb-1">{exp.techStack}</p>}
                      <ul className="list-disc list-outside ml-4 space-y-0.5">
                        {exp.bullets.filter(b => b.trim()).map((bullet, idx) => (
                          <li key={idx} className="text-xs text-text-secondary pl-0.5">{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Projects */}
              {formData.projects.some(p => p.name) && (
                <div className="mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-widest border-b border-border pb-1 mb-3 text-dark">Projects</h2>
                  {formData.projects.filter(p => p.name).map((proj) => (
                    <div key={proj.id} className="mb-3">
                      <div className="flex items-baseline justify-between mb-0.5">
                        <h3 className="text-sm font-bold">{proj.name}</h3>
                        {proj.link && <span className="text-[10px] text-text-muted">{proj.link}</span>}
                      </div>
                      {proj.tech && <p className="text-[10px] text-text-muted italic mb-1">{proj.tech}</p>}
                      {proj.description && <p className="text-xs text-text-secondary mb-1">{proj.description}</p>}
                      {proj.bullets && proj.bullets.some(b => b.trim()) && (
                        <ul className="list-disc list-outside ml-4 space-y-0.5">
                          {proj.bullets.filter(b => b.trim()).map((bullet, idx) => (
                            <li key={idx} className="text-xs text-text-secondary pl-0.5">{bullet}</li>
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
                  <h2 className="text-xs font-bold uppercase tracking-widest border-b border-border pb-1 mb-3 text-dark">Technical Skills</h2>
                  {formData.skillCategories.filter(c => c.skills).map((cat) => (
                    <p key={cat.id} className="text-xs text-text-secondary mb-0.5">
                      <span className="font-semibold text-dark">{cat.category}: </span>{cat.skills}
                    </p>
                  ))}
                </div>
              )}

              {/* Publications */}
              {formData.publications.length > 0 && (
                <div className="mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-widest border-b border-border pb-1 mb-3 text-dark">Publications</h2>
                  {formData.publications.map((pub) => (
                    <div key={pub.id} className="mb-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs font-semibold text-dark">{pub.title}</span>
                        <span className="text-[10px] text-text-muted">{pub.status}</span>
                      </div>
                      {pub.description && <p className="text-xs text-text-secondary">{pub.description}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Achievements */}
              {formData.achievements.length > 0 && (
                <div className="mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-widest border-b border-border pb-1 mb-3 text-dark">Achievements & Activities</h2>
                  <ul className="list-disc list-outside ml-4 space-y-0.5">
                    {formData.achievements.map((ach) => (
                      <li key={ach.id} className="text-xs text-text-secondary">{ach.text}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Certifications */}
              {formData.certifications.length > 0 && (
                <div className="mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-widest border-b border-border pb-1 mb-3 text-dark">Certifications</h2>
                  <p className="text-xs text-text-secondary">
                    {formData.certifications.map(c => `${c.name}${c.issuer ? ` (${c.issuer})` : ''}`).join(' · ')}
                  </p>
                </div>
              )}

              {/* Summary at bottom if present */}
              {formData.summary && (
                <div className="mt-4 pt-3 border-t border-border/50">
                  <p className="text-xs text-text-secondary leading-relaxed italic">{formData.summary}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

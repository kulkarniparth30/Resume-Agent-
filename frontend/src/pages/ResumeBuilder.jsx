import { useState } from 'react';
import {
  Sparkles, Download, FileText, Briefcase, GraduationCap, Code2,
  User, X, CheckCircle2, Plus, Mail, Phone, Globe,
  Loader2, MapPin, Award, BookOpen, Trophy, Zap, Trash2,
  ArrowUp, ArrowDown, Edit3, Mic, Check
} from 'lucide-react';
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
      id: 1,
      title: '',
      company: '',
      duration: '',
      techStack: '',
      bullets: ['']
    }
  ],
  education: [
    { id: 1, degree: '', university: '', year: '', gpa: '', details: '' }
  ],
  projects: [
    { id: 1, name: '', description: '', tech: '', link: '', bullets: [''] }
  ],
  skillCategories: [
    { id: 1, category: 'Technical Skills', skills: '' }
  ],
  publications: [],
  achievements: [],
  certifications: [
    { id: 1, name: '', issuer: '', date: '', link: '', details: '' }
  ],
  extraCurricular: []
};

let _nextId = 100;
const nextId = () => ++_nextId;

export default function ResumeBuilder() {
  const [activeSection, setActiveSection] = useState('Experience');
  const [formData, setFormData] = useState(INITIAL_DATA);
  const [enhancing, setEnhancing] = useState({});
  const [appliedImprovements, setAppliedImprovements] = useState(new Set());
  const [zoomLevel, setZoomLevel] = useState(60);

  // Per-section AI assistant states
  const [aiBoxState, setAiBoxState] = useState({});

  const jdText = useAgentStore((s) => s.jdText);
  const jobRole = useAgentStore((s) => s.jobRole);
  const analysisResult = useAgentStore((s) => s.analysisResult);

  const setEnhancingKey = (key, val) => setEnhancing(prev => ({ ...prev, [key]: val }));

  // Helper for updating AI Box state
  const updateAiBox = (boxId, updates) => {
    setAiBoxState(prev => ({
      ...prev,
      [boxId]: { ...(prev[boxId] || { activeTab: 'Essential', instruction: '', isOpen: false }), ...updates }
    }));
  };

  // Triggers AI enhancement with 3 tone variants (Essential, Refined, Elevated)
  const triggerAiEnhance = async (boxId, sectionType, currentContent, onApplyCallback) => {
    setEnhancingKey(boxId, true);
    try {
      const instruction = aiBoxState[boxId]?.instruction || '';
      const promptContent = instruction ? `${currentContent}\n\nUser custom instruction: ${instruction}` : currentContent;
      const res = await enhanceSection(sectionType, promptContent, jdText, jobRole);
      const enhancedText = res?.enhanced || currentContent || 'Enhanced content';

      // Generate 3 styled tiers
      const essential = enhancedText;
      const refined = enhancedText.split('\n').map(l => l.replace(/^(I |We )/, 'Spearheaded ').replace(/developed/i, 'Engineered')).join('\n');
      const elevated = enhancedText.split('\n').map(l => l.replace(/^(I |We )/, 'Architected and directed ').replace(/built/i, 'Designed high-performance')).join('\n');

      updateAiBox(boxId, {
        isOpen: true,
        activeTab: 'Essential',
        variants: {
          Essential: essential,
          Refined: refined,
          Elevated: elevated
        },
        improvements: [
          'Highlights core computer science coursework and technical aptitude.',
          'Recruiters see direct relevance to technical roles and a strong academic/practical foundation.'
        ],
        proTips: [
          'If you have specific courses or projects that stand out, consider mentioning them by name.',
          'If you are involved in any clubs, competitions, or hackathons, add a brief mention.'
        ],
        onApply: onApplyCallback
      });
    } catch (err) {
      console.error('Enhancement failed:', err);
      // Fallback preview
      updateAiBox(boxId, {
        isOpen: true,
        activeTab: 'Essential',
        variants: {
          Essential: currentContent || 'Optimized professional description highlighting quantifiable impacts and competencies.',
          Refined: (currentContent || 'Refined with industry-standard terminology and high-impact action verbs.'),
          Elevated: (currentContent || 'Executive-level summary emphasizing leadership, architecture, and scalable deliverables.')
        },
        improvements: [
          'Highlights core competencies and measurable impact.',
          'Optimized for Applicant Tracking Systems (ATS) indexing.'
        ],
        proTips: [
          'Quantify metrics with percentages, users, or latency improvements.',
          'Keep phrasing punchy and action-oriented.'
        ],
        onApply: onApplyCallback
      });
    } finally {
      setEnhancingKey(boxId, false);
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
            techStack: '',
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

  // Helpers for list manipulation
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
      <!DOCTYPE html>
      <html>
        <head>
          <title>Resume - ${formData.name || 'Parth Kulkarni'}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; padding: 32px 40px; color: #111827; background: #fff; line-height: 1.4; }
            @media print {
              body { padding: 0; }
              @page { margin: 0.4in; size: A4 portrait; }
            }
          </style>
        </head>
        <body>
          ${previewEl.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  const inputClass = "w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm";
  const labelClass = "block text-xs font-semibold text-slate-700 mb-1.5";

  // Reusable AI Enhancement Assistant Box matching reference screenshots
  const EnhanceAssistantBox = ({ boxId, currentContent, onApply }) => {
    const box = aiBoxState[boxId] || { activeTab: 'Essential', instruction: '', isOpen: false };
    const isLoading = enhancing[boxId];

    return (
      <div className="space-y-3 pt-2">
        {/* Input + Voice + Enhance bar */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="flex-1 px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
            placeholder="Add specific instructions for AI (optional)"
            value={box.instruction || ''}
            onChange={(e) => updateAiBox(boxId, { instruction: e.target.value })}
          />
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5 text-slate-500" />
            <span>Voice</span>
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => triggerAiEnhance(boxId, activeSection.toLowerCase(), currentContent, onApply)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-60"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Enhance</span>
          </button>
        </div>

        {/* AI Suggested Result Card */}
        {box.isOpen && box.variants && (
          <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm animate-fade-in mt-3">
            {/* Tabs (Essential, Refined, Elevated) */}
            <div className="flex items-center border-b border-slate-100 bg-slate-50/70 px-2 pt-2 gap-1.5">
              {['Essential', 'Refined', 'Elevated'].map((tab) => {
                const isActive = box.activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => updateAiBox(boxId, { activeTab: tab })}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#0F172A] text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>{tab}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab content text */}
            <div className="p-4 bg-white space-y-3">
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl max-h-40 overflow-y-auto text-xs text-slate-700 leading-relaxed font-normal">
                "{box.variants[box.activeTab] || box.variants.Essential}"
              </div>

              {/* Action buttons (Apply & Dismiss) */}
              <div className="flex justify-end items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const textToApply = box.variants[box.activeTab] || box.variants.Essential;
                    if (onApply) onApply(textToApply);
                    updateAiBox(boxId, { isOpen: false });
                  }}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateAiBox(boxId, { isOpen: false })}
                  className="flex items-center gap-1 px-3 py-1.5 text-slate-500 hover:text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Dismiss</span>
                </button>
              </div>

              {/* Improvements & Pro Tips side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-2">
                    <span className="w-1 h-3.5 bg-emerald-500 rounded-full" />
                    <span>Improvements</span>
                  </div>
                  <ul className="space-y-1.5">
                    {(box.improvements || []).map((imp, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-2">
                    <span className="w-1 h-3.5 bg-emerald-500 rounded-full" />
                    <span>Pro Tips</span>
                  </div>
                  <ul className="space-y-1.5">
                    {(box.proTips || []).map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-600">
                        <span className="w-3.5 h-3.5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">✓</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const improvements = analysisResult?.resume_improvements || [];

  const tabs = [
    ...(improvements.length > 0 ? [{ id: 'JD Improvements', icon: Zap, badge: improvements.length }] : []),
    { id: 'Experience', icon: Briefcase },
    { id: 'Projects', icon: FileText },
    { id: 'Skills', icon: Code2 },
    { id: 'Education', icon: GraduationCap },
    { id: 'Summary', icon: User },
    { id: 'Honors & Awards', icon: Award },
    { id: 'Certifications', icon: CheckCircle2 },
    { id: 'Extra-Curricular Activities', icon: Trophy },
  ];

  const renderEditor = () => {
    switch (activeSection) {
      case 'JD Improvements':
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-600" />
                  AI Suggested Changes for This JD
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  1-Click apply recommended bullet improvements to your live resume
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                {improvements.length} recommendations
              </span>
            </div>

            <div className="space-y-4">
              {improvements.map((item, idx) => {
                const isApplied = appliedImprovements.has(idx);
                return (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {item.section}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        item.impact === 'High' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {item.impact || 'High'} Impact
                      </span>
                    </div>

                    {item.current && (
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase">Original in Resume:</span>
                        <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-through opacity-80 mt-0.5">
                          {item.current}
                        </p>
                      </div>
                    )}

                    <div>
                      <span className="text-[11px] font-semibold text-emerald-600 uppercase">Suggested Replacement:</span>
                      <p className="text-xs text-slate-900 font-medium bg-emerald-50/50 border border-emerald-200 p-3 rounded-xl mt-0.5 leading-relaxed">
                        {item.suggested}
                      </p>
                    </div>

                    {item.reason && (
                      <p className="text-xs text-slate-500 italic">
                        <strong className="text-emerald-600">Why: </strong>{item.reason}
                      </p>
                    )}

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleApplyImprovement(item, idx)}
                        disabled={isApplied}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isApplied
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                            : 'bg-[#10B981] hover:bg-[#059669] text-white shadow-sm'
                        }`}
                      >
                        {isApplied ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
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
            {/* Top header row */}
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Work Experience</h3>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    const content = formData.experiences.map(e =>
                      `${e.title} at ${e.company} (${e.duration})\n${e.bullets.join('\n')}`
                    ).join('\n\n');
                    triggerAiEnhance('exp-top', 'experience', content, (enhanced) => {
                      const lines = enhanced.split('\n').filter(l => l.trim());
                      if (formData.experiences.length > 0) {
                        updateList('experiences', formData.experiences[0].id, { bullets: lines });
                      }
                    });
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Improve with AI</span>
                </button>
                <button
                  type="button"
                  onClick={() => addToList('experiences', { title: '', company: '', duration: '', techStack: '', bullets: [''] })}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-3 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Entry
                </button>
              </div>
            </div>

            {formData.experiences.map((exp, expIdx) => (
              <div key={exp.id} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 relative">
                {/* Header inside card */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">Experience {expIdx + 1}</span>
                    <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-semibold">
                      <Mic className="w-3 h-3" /> Voice
                    </span>
                    {formData.experiences.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFromList('experiences', exp.id)}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Job Title</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={exp.title}
                      placeholder="Software Developer Intern"
                      onChange={(e) => updateList('experiences', exp.id, { title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Company</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={exp.company}
                      placeholder="TechCorp"
                      onChange={(e) => updateList('experiences', exp.id, { company: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Duration</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={exp.duration}
                      placeholder="Jun 2024 - Present"
                      onChange={(e) => updateList('experiences', exp.id, { duration: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Tech Stack</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={exp.techStack || ''}
                      placeholder="Python, Flask, React"
                      onChange={(e) => updateList('experiences', exp.id, { techStack: e.target.value })}
                    />
                  </div>
                </div>

                {/* Bullets */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={labelClass}>Bullet Points</label>
                    <button
                      type="button"
                      onClick={() => updateList('experiences', exp.id, { bullets: [...exp.bullets, ''] })}
                      className="text-xs font-semibold text-emerald-600 flex items-center gap-1 hover:text-emerald-700 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add bullet
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {exp.bullets.map((bullet, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <textarea
                          rows="2"
                          className={`${inputClass} resize-none flex-1`}
                          value={bullet}
                          placeholder="Describe your achievement with metrics..."
                          onChange={(e) => {
                            const newBullets = [...exp.bullets];
                            newBullets[idx] = e.target.value;
                            updateList('experiences', exp.id, { bullets: newBullets });
                          }}
                        />
                        <button
                          type="button"
                          disabled={enhancing[`exp-${exp.id}-${idx}`]}
                          onClick={async () => {
                            if (!bullet.trim()) return;
                            const enhanced = await handleEnhanceBulletPoint(bullet, `exp-${exp.id}-${idx}`);
                            if (enhanced) {
                              const newBullets = [...exp.bullets];
                              newBullets[idx] = enhanced;
                              updateList('experiences', exp.id, { bullets: newBullets });
                            }
                          }}
                          className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer self-center"
                          title="Improve with AI"
                        >
                          {enhancing[`exp-${exp.id}-${idx}`] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const newBullets = exp.bullets.filter((_, i) => i !== idx);
                            updateList('experiences', exp.id, { bullets: newBullets.length ? newBullets : [''] });
                          }}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer self-center"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Assistant Section */}
                <EnhanceAssistantBox
                  boxId={`exp-card-${exp.id}`}
                  currentContent={`${exp.title} at ${exp.company}\n${exp.bullets.join('\n')}`}
                  onApply={(enhancedText) => {
                    const lines = enhancedText.split('\n').filter(l => l.trim());
                    updateList('experiences', exp.id, { bullets: lines });
                  }}
                />
              </div>
            ))}
          </div>
        );

      case 'Projects':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Projects</h3>
              <button
                type="button"
                onClick={() => addToList('projects', { name: '', description: '', tech: '', link: '', bullets: [''] })}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-3 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Project
              </button>
            </div>

            {formData.projects.map((proj, projIdx) => (
              <div key={proj.id} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 relative">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">Project {projIdx + 1}</span>
                    <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-semibold">
                      <Mic className="w-3 h-3" /> Voice
                    </span>
                    {formData.projects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFromList('projects', proj.id)}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Project Name</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={proj.name}
                      placeholder="Smart Attendance System"
                      onChange={(e) => updateList('projects', proj.id, { name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Tech Stack</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={proj.tech}
                      placeholder="Python, Flask, React"
                      onChange={(e) => updateList('projects', proj.id, { tech: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    rows="2"
                    className={`${inputClass} resize-none`}
                    value={proj.description}
                    placeholder="Brief project overview..."
                    onChange={(e) => updateList('projects', proj.id, { description: e.target.value })}
                  />
                </div>

                <div>
                  <label className={labelClass}>Project Link</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={proj.link}
                    placeholder="https://github.com/user/project"
                    onChange={(e) => updateList('projects', proj.id, { link: e.target.value })}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={labelClass}>Bullet Points</label>
                    <button
                      type="button"
                      onClick={() => updateList('projects', proj.id, { bullets: [...(proj.bullets || []), ''] })}
                      className="text-xs font-semibold text-emerald-600 flex items-center gap-1 hover:text-emerald-700 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add bullet
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {(proj.bullets || []).map((bullet, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <textarea
                          rows="2"
                          className={`${inputClass} resize-none flex-1`}
                          value={bullet}
                          placeholder="Describe architecture, scale, and performance..."
                          onChange={(e) => {
                            const newBullets = [...(proj.bullets || [])];
                            newBullets[idx] = e.target.value;
                            updateList('projects', proj.id, { bullets: newBullets });
                          }}
                        />
                        <button
                          type="button"
                          disabled={enhancing[`proj-${proj.id}-${idx}`]}
                          onClick={async () => {
                            if (!bullet.trim()) return;
                            const enhanced = await handleEnhanceBulletPoint(bullet, `proj-${proj.id}-${idx}`);
                            if (enhanced) {
                              const nb = [...(proj.bullets || [])];
                              nb[idx] = enhanced;
                              updateList('projects', proj.id, { bullets: nb });
                            }
                          }}
                          className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer self-center"
                        >
                          {enhancing[`proj-${proj.id}-${idx}`] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const nb = (proj.bullets || []).filter((_, i) => i !== idx);
                            updateList('projects', proj.id, { bullets: nb.length ? nb : [''] });
                          }}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer self-center"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <EnhanceAssistantBox
                  boxId={`proj-card-${proj.id}`}
                  currentContent={`${proj.name}: ${proj.description}\nTech: ${proj.tech}\n${(proj.bullets || []).join('\n')}`}
                  onApply={(enhancedText) => {
                    const lines = enhancedText.split('\n').filter(l => l.trim());
                    updateList('projects', proj.id, { bullets: lines });
                  }}
                />
              </div>
            ))}
          </div>
        );

      case 'Skills':
        return (
          <div className="space-y-6 animate-fade-in">
            {/* Top Add button matching screenshot */}
            <button
              type="button"
              onClick={() => addToList('skillCategories', { category: `Category ${formData.skillCategories.length + 1}`, skills: '' })}
              className="w-full py-3 bg-[#F8FAFC] hover:bg-slate-100 border border-dashed border-slate-300 rounded-2xl text-slate-600 font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-500" />
              <span>Add New Skill Category</span>
            </button>

            {formData.skillCategories.map((cat, catIdx) => (
              <div key={cat.id} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 relative">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">{cat.category || `Category ${catIdx + 1}`}</span>
                    <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {formData.skillCategories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFromList('skillCategories', cat.id)}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Category Name</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={cat.category}
                    placeholder="e.g. Programming Languages, Frameworks, Cloud & DevOps"
                    onChange={(e) => updateList('skillCategories', cat.id, { category: e.target.value })}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={labelClass}>Skills</label>
                    <button
                      type="button"
                      onClick={() => {
                        const s = prompt('Enter a skill name:');
                        if (s) {
                          const existing = cat.skills ? cat.skills.split(',').map(x => x.trim()) : [];
                          updateList('skillCategories', cat.id, { skills: [...existing, s].join(', ') });
                        }
                      }}
                      className="text-xs font-semibold text-emerald-600 flex items-center gap-1 hover:text-emerald-700 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add Skill
                    </button>
                  </div>

                  <input
                    type="text"
                    className={inputClass}
                    value={cat.skills}
                    placeholder="Python, TypeScript, React, Docker, FastAPI (comma-separated)"
                    onChange={(e) => updateList('skillCategories', cat.id, { skills: e.target.value })}
                  />
                </div>

                <EnhanceAssistantBox
                  boxId={`skills-card-${cat.id}`}
                  currentContent={`Skills category: ${cat.category}\nSkills: ${cat.skills}`}
                  onApply={(enhancedText) => {
                    updateList('skillCategories', cat.id, { skills: enhancedText.replace(/^[A-Za-z\s]+:\s*/, '') });
                  }}
                />
              </div>
            ))}
          </div>
        );

      case 'Education':
        return (
          <div className="space-y-6 animate-fade-in">
            <button
              type="button"
              onClick={() => addToList('education', { degree: '', university: '', year: '', gpa: '', details: '' })}
              className="w-full py-3 bg-[#F8FAFC] hover:bg-slate-100 border border-dashed border-slate-300 rounded-2xl text-slate-600 font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-500" />
              <span>Add New Education</span>
            </button>

            {formData.education.map((edu, eduIdx) => (
              <div key={edu.id} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 relative">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">Education {eduIdx + 1}</span>
                    <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-semibold">
                      <Mic className="w-3 h-3" /> Voice
                    </span>
                    {formData.education.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFromList('education', edu.id)}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Degree</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={edu.degree}
                    placeholder="B.Tech in Computer Science"
                    onChange={(e) => updateList('education', edu.id, { degree: e.target.value })}
                  />
                </div>

                <div>
                  <label className={labelClass}>University / Institution</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={edu.university}
                    placeholder="JSPMS RSCOE, Pune"
                    onChange={(e) => updateList('education', edu.id, { university: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Graduation Year</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={edu.year}
                      placeholder="2024 - 2028"
                      onChange={(e) => updateList('education', edu.id, { year: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>GPA / Percentage</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={edu.gpa}
                      placeholder="8.11 / 10"
                      onChange={(e) => updateList('education', edu.id, { gpa: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Additional Details</label>
                  <textarea
                    rows="3"
                    className={`${inputClass} resize-none`}
                    value={edu.details || ''}
                    placeholder="Relevant coursework, academic honors, research projects..."
                    onChange={(e) => updateList('education', edu.id, { details: e.target.value })}
                  />
                </div>

                <EnhanceAssistantBox
                  boxId={`edu-card-${edu.id}`}
                  currentContent={`${edu.degree} at ${edu.university} (${edu.year}, GPA: ${edu.gpa})\n${edu.details || ''}`}
                  onApply={(enhancedText) => {
                    updateList('education', edu.id, { details: enhancedText });
                  }}
                />
              </div>
            ))}
          </div>
        );

      case 'Summary':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-800">Contact Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.name}
                    placeholder="Parth Kulkarni"
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.location}
                    placeholder="Pune, Maharashtra, India"
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Phone</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.phone}
                    placeholder="+91 8999126149"
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.email}
                    placeholder="parthkul0930@gmail.com"
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Links */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={labelClass}>Profiles & Links</label>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, links: [...prev.links, { label: '', url: '' }] }))}
                    className="text-xs font-semibold text-emerald-600 flex items-center gap-1 hover:text-emerald-700 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Link
                  </button>
                </div>
                {formData.links.map((link, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className={`${inputClass} w-1/3`}
                      value={link.label}
                      placeholder="LinkedIn / GitHub / LeetCode"
                      onChange={(e) => {
                        const newLinks = [...formData.links];
                        newLinks[idx] = { ...newLinks[idx], label: e.target.value };
                        setFormData({ ...formData, links: newLinks });
                      }}
                    />
                    <input
                      type="text"
                      className={`${inputClass} flex-1`}
                      value={link.url}
                      placeholder="https://..."
                      onChange={(e) => {
                        const newLinks = [...formData.links];
                        newLinks[idx] = { ...newLinks[idx], url: e.target.value };
                        setFormData({ ...formData, links: newLinks });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, links: formData.links.filter((_, i) => i !== idx) })}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className={labelClass}>Professional Summary</label>
                  <span className="text-xs text-slate-400">{formData.summary.length} chars</span>
                </div>
                <textarea
                  rows="4"
                  className={`${inputClass} resize-none leading-relaxed`}
                  value={formData.summary}
                  placeholder="I am a student of Computer Engineering specializing in AI/ML and full-stack software development..."
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                />
              </div>

              <EnhanceAssistantBox
                boxId="summary-box"
                currentContent={formData.summary}
                onApply={(enhancedText) => {
                  setFormData(prev => ({ ...prev, summary: enhancedText }));
                }}
              />
            </div>
          </div>
        );

      case 'Honors & Awards':
        return (
          <div className="space-y-6 animate-fade-in">
            <button
              type="button"
              onClick={() => addToList('achievements', { title: '', issuer: '', date: '', description: '' })}
              className="w-full py-3 bg-[#F8FAFC] hover:bg-slate-100 border border-dashed border-slate-300 rounded-2xl text-slate-600 font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-500" />
              <span>Add New Honors & Awards</span>
            </button>

            {formData.achievements.map((award, idx) => (
              <div key={award.id} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 relative">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">Award {idx + 1}</span>
                    <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-semibold">
                      <Mic className="w-3 h-3" /> Voice
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFromList('achievements', award.id)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Award Title</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={award.title || ''}
                      placeholder="Dean's List / Hackathon Winner"
                      onChange={(e) => updateList('achievements', award.id, { title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Issuing Organization</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={award.issuer || ''}
                      placeholder="University of Example"
                      onChange={(e) => updateList('achievements', award.id, { issuer: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Date Received</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={award.date || ''}
                    placeholder="May 2024"
                    onChange={(e) => updateList('achievements', award.id, { date: e.target.value })}
                  />
                </div>

                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    rows="3"
                    className={`${inputClass} resize-none`}
                    value={award.description || ''}
                    placeholder="Brief description of the award and its significance"
                    onChange={(e) => updateList('achievements', award.id, { description: e.target.value })}
                  />
                </div>

                <EnhanceAssistantBox
                  boxId={`award-card-${award.id}`}
                  currentContent={`${award.title || ''} from ${award.issuer || ''}\n${award.description || ''}`}
                  onApply={(enhancedText) => {
                    updateList('achievements', award.id, { description: enhancedText });
                  }}
                />
              </div>
            ))}
          </div>
        );

      case 'Certifications':
        return (
          <div className="space-y-6 animate-fade-in">
            <button
              type="button"
              onClick={() => addToList('certifications', { name: '', issuer: '', date: '', link: '', details: '' })}
              className="w-full py-3 bg-[#F8FAFC] hover:bg-slate-100 border border-dashed border-slate-300 rounded-2xl text-slate-600 font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-500" />
              <span>Add New Certifications</span>
            </button>

            {formData.certifications.map((cert, idx) => (
              <div key={cert.id} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 relative">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">Certification {idx + 1}</span>
                    <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-semibold">
                      <Mic className="w-3 h-3" /> Voice
                    </span>
                    {formData.certifications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFromList('certifications', cert.id)}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Certification Name</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={cert.name}
                      placeholder="AWS Certified Solutions Architect"
                      onChange={(e) => updateList('certifications', cert.id, { name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Issuing Organization</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={cert.issuer}
                      placeholder="Amazon Web Services"
                      onChange={(e) => updateList('certifications', cert.id, { issuer: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Date Acquired</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={cert.date || ''}
                      placeholder="June 2024"
                      onChange={(e) => updateList('certifications', cert.id, { date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Verification Link</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={cert.link || ''}
                      placeholder="https://verify.example.com/cert/123"
                      onChange={(e) => updateList('certifications', cert.id, { link: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Additional Details</label>
                  <textarea
                    rows="3"
                    className={`${inputClass} resize-none`}
                    value={cert.details || ''}
                    placeholder="Description or credential ID..."
                    onChange={(e) => updateList('certifications', cert.id, { details: e.target.value })}
                  />
                </div>

                <EnhanceAssistantBox
                  boxId={`cert-card-${cert.id}`}
                  currentContent={`${cert.name} by ${cert.issuer}\n${cert.details || ''}`}
                  onApply={(enhancedText) => {
                    updateList('certifications', cert.id, { details: enhancedText });
                  }}
                />
              </div>
            ))}
          </div>
        );

      case 'Extra-Curricular Activities':
        return (
          <div className="space-y-6 animate-fade-in">
            <button
              type="button"
              onClick={() => addToList('extraCurricular', { title: '', role: '', date: '', description: '' })}
              className="w-full py-3 bg-[#F8FAFC] hover:bg-slate-100 border border-dashed border-slate-300 rounded-2xl text-slate-600 font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-500" />
              <span>Add New Extra-Curricular Activities</span>
            </button>

            {formData.extraCurricular.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No Extra-Curricular Activities added yet. Click the button above to add one.
              </div>
            ) : (
              formData.extraCurricular.map((act, idx) => (
                <div key={act.id} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 relative">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-sm font-bold text-slate-800">Activity {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeFromList('extraCurricular', act.id)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <label className={labelClass}>Activity / Role</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={act.title || ''}
                      placeholder="President, Coding Club"
                      onChange={(e) => updateList('extraCurricular', act.id, { title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Description</label>
                    <textarea
                      rows="2"
                      className={`${inputClass} resize-none`}
                      value={act.description || ''}
                      placeholder="Organized hackathons, managed a team of 30+ volunteers..."
                      onChange={(e) => updateList('extraCurricular', act.id, { description: e.target.value })}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex bg-white" style={{ minHeight: 'calc(100vh - 80px)' }}>
      {/* ===== LEFT ICON SIDEBAR ===== */}
      <div className="w-14 bg-white border-r border-slate-200 flex flex-col items-center py-4 gap-2 shrink-0 select-none">
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
                  ? 'bg-[#10B981] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-5 h-5 stroke-[1.75]" />
              {tab.badge && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ===== CONTENT AREA (Editor on Left, Live Preview on Right) ===== */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* ===== LEFT: FORM EDITOR ===== */}
        <div className="flex-1 min-w-0 overflow-y-auto p-6 sm:p-8 bg-white border-r border-slate-200">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Section Heading matching screenshot */}
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{activeSection}</h2>
              <Edit3 className="w-4 h-4 text-slate-400" />
            </div>

            {/* Dynamic Editor Content */}
            {renderEditor()}

            {/* Export Buttons at Bottom */}
            <div className="pt-6 pb-12 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => handleExport('PDF')}
                className="flex-1 flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white px-5 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button
                type="button"
                onClick={() => handleExport('ATS')}
                className="flex-1 flex items-center justify-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-700 px-5 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                Download ATS Version
              </button>
            </div>
          </div>
        </div>

        {/* ===== RIGHT: A4 LIVE RESUME PREVIEW ===== */}
        <div className="hidden lg:flex flex-col w-[480px] xl:w-[540px] bg-slate-100 shrink-0">
          {/* Zoom Toolbar */}
          <div className="flex items-center justify-end gap-2 px-4 py-2 bg-white border-b border-slate-200">
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.max(40, prev - 10))}
              className="w-7 h-7 flex items-center justify-center rounded border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-bold"
            >
              −
            </button>
            <span className="text-xs text-slate-600 font-medium w-10 text-center">{zoomLevel}%</span>
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.min(100, prev + 10))}
              className="w-7 h-7 flex items-center justify-center rounded border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-bold"
            >
              +
            </button>
          </div>

          {/* Scrollable Preview Canvas */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center">
            <div
              id="resume-preview"
              className="bg-white shadow-xl border border-slate-300 text-slate-900 rounded-sm"
              style={{
                width: '100%',
                maxWidth: '650px',
                minHeight: '850px',
                padding: '40px 48px',
                fontFamily: "'Inter', sans-serif"
              }}
            >
              {/* Header */}
              <div className="text-center pb-4 mb-4 border-b border-slate-800">
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 uppercase mb-1">
                  {formData.name || 'YOUR NAME'}
                </h1>
                <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px] text-slate-600">
                  {formData.location && <span>{formData.location}</span>}
                  {formData.phone && <span>{formData.phone}</span>}
                  {formData.email && <span>{formData.email}</span>}
                </div>
                {formData.links.some(l => l.url) && (
                  <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] text-blue-600 mt-1">
                    {formData.links.filter(l => l.url).map((link, i) => (
                      <span key={i}>{link.url}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary */}
              {formData.summary && (
                <div className="mb-4">
                  <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
                    Summary
                  </h2>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    {formData.summary}
                  </p>
                </div>
              )}

              {/* Education */}
              {formData.education.some(e => e.degree || e.university) && (
                <div className="mb-4">
                  <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
                    Education
                  </h2>
                  {formData.education.filter(e => e.degree || e.university).map((edu) => (
                    <div key={edu.id} className="mb-2">
                      <div className="flex items-baseline justify-between">
                        <h3 className="text-xs font-bold text-slate-900">{edu.university || 'University'}</h3>
                        <span className="text-[10px] text-slate-500 font-medium">{edu.year}</span>
                      </div>
                      <div className="text-[11px] text-slate-700">
                        {edu.degree}{edu.gpa ? ` | GPA: ${edu.gpa}` : ''}
                      </div>
                      {edu.details && (
                        <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">{edu.details}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Experience */}
              {formData.experiences.some(e => e.title || e.company) && (
                <div className="mb-4">
                  <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
                    Experience
                  </h2>
                  {formData.experiences.filter(e => e.title || e.company).map((exp) => (
                    <div key={exp.id} className="mb-3">
                      <div className="flex items-baseline justify-between">
                        <h3 className="text-xs font-bold text-slate-900">{exp.title || 'Role'}</h3>
                        <span className="text-[10px] text-slate-500 font-medium">{exp.duration}</span>
                      </div>
                      <div className="text-[11px] font-semibold text-slate-700">{exp.company}</div>
                      {exp.techStack && (
                        <div className="text-[10px] text-slate-500 italic mb-1">{exp.techStack}</div>
                      )}
                      <ul className="list-disc list-outside ml-4 space-y-0.5">
                        {exp.bullets.filter(b => b.trim()).map((bullet, idx) => (
                          <li key={idx} className="text-[10.5px] text-slate-700 leading-snug pl-0.5">
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Projects */}
              {formData.projects.some(p => p.name) && (
                <div className="mb-4">
                  <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
                    Projects
                  </h2>
                  {formData.projects.filter(p => p.name).map((proj) => (
                    <div key={proj.id} className="mb-2.5">
                      <div className="flex items-baseline justify-between">
                        <h3 className="text-xs font-bold text-slate-900">{proj.name}</h3>
                        {proj.link && <span className="text-[10px] text-blue-600">{proj.link}</span>}
                      </div>
                      {proj.tech && <div className="text-[10px] text-slate-500 italic mb-0.5">{proj.tech}</div>}
                      {proj.description && (
                        <p className="text-[10.5px] text-slate-700 mb-0.5 leading-snug">{proj.description}</p>
                      )}
                      {proj.bullets && proj.bullets.some(b => b.trim()) && (
                        <ul className="list-disc list-outside ml-4 space-y-0.5">
                          {proj.bullets.filter(b => b.trim()).map((bullet, idx) => (
                            <li key={idx} className="text-[10.5px] text-slate-700 leading-snug pl-0.5">
                              {bullet}
                            </li>
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
                  <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
                    Skills
                  </h2>
                  {formData.skillCategories.filter(c => c.skills).map((cat) => (
                    <p key={cat.id} className="text-[10.5px] text-slate-700 mb-1 leading-snug">
                      <span className="font-semibold text-slate-900">{cat.category}: </span>
                      {cat.skills}
                    </p>
                  ))}
                </div>
              )}

              {/* Certifications */}
              {formData.certifications.some(c => c.name) && (
                <div className="mb-4">
                  <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
                    Certifications
                  </h2>
                  <div className="space-y-1">
                    {formData.certifications.filter(c => c.name).map((c) => (
                      <p key={c.id} className="text-[10.5px] text-slate-700 leading-snug">
                        <span className="font-medium text-slate-900">{c.name}</span>
                        {c.issuer ? ` – ${c.issuer}` : ''}
                        {c.date ? ` (${c.date})` : ''}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Honors & Awards */}
              {formData.achievements.some(a => a.title || a.description) && (
                <div className="mb-4">
                  <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
                    Honors & Awards
                  </h2>
                  <ul className="list-disc list-outside ml-4 space-y-0.5">
                    {formData.achievements.map((ach) => (
                      <li key={ach.id} className="text-[10.5px] text-slate-700 leading-snug pl-0.5">
                        <span className="font-medium text-slate-900">{ach.title || ''}</span>
                        {ach.issuer ? ` (${ach.issuer})` : ''}
                        {ach.description ? ` – ${ach.description}` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

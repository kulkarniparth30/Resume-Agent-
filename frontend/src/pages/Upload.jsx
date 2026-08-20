import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUp, Tags, Briefcase, FileText, CheckCircle2, X, UploadCloud, Search, Sparkles, ArrowRight, Info, AlertCircle } from 'lucide-react';
import useAgentStore from '../store/useAgentStore';
import SkillCard from '../components/SkillCard';
import LoadingAgent from '../components/LoadingAgent';
import { uploadResume, analyseResume } from '../api/analyse';

const SUGGESTED_SKILLS = [
  'Python', 'JavaScript', 'React', 'Node.js', 'TypeScript', 'Java', 'C++',
  'AWS', 'Docker', 'Kubernetes', 'SQL', 'MongoDB', 'GraphQL', 'Machine Learning',
  'TensorFlow', 'FastAPI', 'Flask', 'Git', 'Linux', 'PostgreSQL'
];

const SUGGESTED_ROLES = [
  'Data Scientist', 'ML Engineer', 'Backend Developer', 'Frontend Developer',
  'Full Stack Developer', 'DevOps Engineer', 'Data Analyst', 'Cloud Architect'
];

export default function Upload() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const [showRoleSuggestions, setShowRoleSuggestions] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const {
    resumeText,
    setResumeText,
    resumeFileName,
    resumeFile,
    setResumeFile,
    manualSkills = [],
    addSkill,
    removeSkill,
    jobRole,
    setJobRole,
    jdText,
    setJdText,
    setAnalysisResult,
  } = useAgentStore();

  const tabs = [
    { id: 'upload', label: 'Upload Resume', icon: FileUp },
    { id: 'skills', label: 'My Skills', icon: Tags },
    { id: 'role', label: 'Job Role', icon: Briefcase },
    { id: 'jd', label: 'Paste JD', icon: FileText },
  ];

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
  };

  const handleFileInput = (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
  };

  const handleFile = (file) => {
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.docx'))) {
      setResumeFile(file);
    } else {
      alert('Please upload a valid PDF or DOCX file.');
    }
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      addSkill(skillInput.trim());
      setSkillInput('');
      setShowSkillSuggestions(false);
    }
  };

  const handleAddSkill = (skill) => {
    addSkill(skill);
    setSkillInput('');
    setShowSkillSuggestions(false);
  };

  const handleSelectRole = (role) => {
    setJobRole(role);
    setShowRoleSuggestions(false);
  };

  const hasAnyInput = Boolean(resumeFileName) || manualSkills.length > 0 || Boolean(jobRole) || Boolean(jdText);

  const handleAnalyze = async () => {
    setError('');
    setIsLoading(true);

    try {
      // Step 1: Upload file if present
      let parsedText = resumeText;
      if (resumeFile && !resumeText) {
        try {
          const uploadResult = await uploadResume(resumeFile);
          parsedText = uploadResult.text;
          setResumeText(parsedText);
        } catch (uploadErr) {
          console.error('Upload failed:', uploadErr);
          // Continue without file text if upload fails
        }
      }

      // Step 2: Run analysis
      const result = await analyseResume({
        resume_text: parsedText,
        job_role: jobRole,
        jd_text: jdText,
        manual_skills: manualSkills,
      });

      setAnalysisResult(result);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err?.response?.data?.detail || 'Analysis failed. Make sure the backend is running on port 8000.');
      setIsLoading(false);
      return;
    }
  };

  const handleLoadingComplete = () => {
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 500);
  };

  // Filled indicators
  const filledTabs = {
    upload: Boolean(resumeFileName),
    skills: manualSkills.length > 0,
    role: Boolean(jobRole),
    jd: Boolean(jdText),
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <LoadingAgent onComplete={handleLoadingComplete} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            AI-Powered Analysis
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-dark mb-3">Tell Us About Yourself</h1>
          <p className="text-text-secondary text-lg max-w-lg mx-auto">
            Upload your resume or enter details to get tailored career insights
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-danger/10 border border-danger/20 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-danger">Analysis Failed</p>
              <p className="text-sm text-danger/80 mt-0.5">{error}</p>
            </div>
            <button onClick={() => setError('')} className="ml-auto text-danger/50 hover:text-danger cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-border overflow-hidden animate-slide-up">

          {/* Tabs */}
          <div className="flex border-b border-border">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isFilled = filledTabs[tab.id];
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 relative min-w-0 py-4 px-2 sm:px-4 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer
                    ${isActive
                      ? 'text-primary bg-primary/5'
                      : 'text-text-secondary hover:text-dark hover:bg-surface-alt'
                    }`}
                >
                  <div className="relative">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-text-muted'}`} />
                    {isFilled && !isActive && (
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-success ring-2 ring-white" />
                    )}
                  </div>
                  <span className="truncate">{tab.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6 sm:p-8 min-h-[340px]">

            {/* === Upload Resume Tab === */}
            {activeTab === 'upload' && (
              <div className="h-full flex flex-col animate-fade-in">
                {!resumeFileName ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-10 cursor-pointer transition-all duration-200
                      ${isDragging
                        ? 'border-primary bg-primary/5 scale-[1.01]'
                        : 'border-border hover:border-primary/40 hover:bg-surface-alt'
                      }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileInput}
                    />
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-colors ${isDragging ? 'bg-primary/10' : 'bg-surface-alt'}`}>
                      <UploadCloud className={`w-8 h-8 ${isDragging ? 'text-primary' : 'text-text-muted'}`} />
                    </div>
                    <p className="text-dark font-semibold text-center mb-1">
                      Drag & drop your resume here
                    </p>
                    <p className="text-text-secondary text-sm text-center mb-4">
                      or click to browse your files
                    </p>
                    <span className="text-xs text-text-muted bg-surface-alt px-3 py-1.5 rounded-full">
                      Supports PDF and DOCX
                    </span>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center bg-success/5 border border-success/20 rounded-2xl p-10">
                    <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-7 h-7 text-success" />
                    </div>
                    <p className="text-dark font-semibold text-lg mb-1">File uploaded successfully</p>
                    <p className="text-text-secondary text-sm mb-5">{resumeFileName}</p>
                    <button
                      onClick={() => { setResumeFile(null); setResumeText(''); }}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-danger bg-danger/5 hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      Remove File
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* === My Skills Tab === */}
            {activeTab === 'skills' && (
              <div className="animate-fade-in">
                <div className="relative mb-6">
                  <label className="block text-sm font-semibold text-dark mb-2">Add Your Skills</label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                      type="text"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-surface-alt focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-dark placeholder:text-text-muted"
                      placeholder="Type a skill and press Enter..."
                      value={skillInput}
                      onChange={(e) => { setSkillInput(e.target.value); setShowSkillSuggestions(true); }}
                      onKeyDown={handleSkillKeyDown}
                      onFocus={() => setShowSkillSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSkillSuggestions(false), 200)}
                    />
                  </div>

                  {showSkillSuggestions && skillInput && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {SUGGESTED_SKILLS.filter(s => s.toLowerCase().includes(skillInput.toLowerCase()) && !manualSkills.includes(s)).length > 0 ? (
                        SUGGESTED_SKILLS.filter(s => s.toLowerCase().includes(skillInput.toLowerCase()) && !manualSkills.includes(s)).map(skill => (
                          <button
                            key={skill}
                            className="w-full text-left px-4 py-2.5 hover:bg-surface-alt text-dark text-sm transition-colors cursor-pointer"
                            onClick={() => handleAddSkill(skill)}
                          >
                            {skill}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-text-secondary">Press Enter to add "<strong>{skillInput}</strong>"</div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-dark mb-3">Added Skills ({manualSkills?.length || 0})</h3>
                  <div className="flex flex-wrap gap-2 min-h-[100px] items-start">
                    {manualSkills?.map((skill) => (
                      <SkillCard
                        key={skill}
                        name={skill}
                        variant="owned"
                        removable={true}
                        onRemove={() => removeSkill(skill)}
                      />
                    ))}
                    {(!manualSkills || manualSkills.length === 0) && (
                      <p className="text-text-muted text-sm italic w-full">No skills added yet. Start typing above.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* === Job Role Tab === */}
            {activeTab === 'role' && (
              <div className="animate-fade-in">
                <div className="relative">
                  <label className="block text-sm font-semibold text-dark mb-2">Target Job Role</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                      type="text"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-surface-alt focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-dark placeholder:text-text-muted"
                      placeholder="e.g., Data Scientist"
                      value={jobRole || ''}
                      onChange={(e) => { setJobRole(e.target.value); setShowRoleSuggestions(true); }}
                      onFocus={() => setShowRoleSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowRoleSuggestions(false), 200)}
                    />
                  </div>

                  {showRoleSuggestions && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {SUGGESTED_ROLES.filter(r => (jobRole ? r.toLowerCase().includes(jobRole.toLowerCase()) : true)).map(role => (
                        <button
                          key={role}
                          className="w-full text-left px-4 py-2.5 hover:bg-surface-alt text-dark text-sm transition-colors cursor-pointer"
                          onClick={() => handleSelectRole(role)}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 bg-primary/5 p-4 rounded-xl border border-primary/10 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Info className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Specifying your target role helps us provide more accurate skill gap analysis and relevant career recommendations.
                  </p>
                </div>
              </div>
            )}

            {/* === Paste JD Tab === */}
            {activeTab === 'jd' && (
              <div className="h-full flex flex-col animate-fade-in">
                <label className="block text-sm font-semibold text-dark mb-2">Job Description</label>
                <div className="relative flex-1 flex flex-col">
                  <textarea
                    className="w-full flex-1 min-h-[220px] p-4 rounded-xl border border-border bg-surface-alt focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-dark resize-none placeholder:text-text-muted"
                    placeholder="Paste the full job description here..."
                    value={jdText || ''}
                    onChange={(e) => setJdText(e.target.value)}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-text-muted bg-white/80 px-2 py-1 rounded-lg backdrop-blur-sm">
                    {(jdText || '').length} characters
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Summary */}
        {hasAnyInput && (
          <div className="mt-6 flex flex-wrap gap-2 justify-center animate-fade-in">
            {resumeFileName && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-success/10 text-success border border-success/20">
                <CheckCircle2 className="w-3 h-3" /> Resume uploaded
              </span>
            )}
            {manualSkills.length > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                <Tags className="w-3 h-3" /> {manualSkills.length} skills
              </span>
            )}
            {jobRole && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                <Briefcase className="w-3 h-3" /> {jobRole}
              </span>
            )}
            {jdText && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-warning/10 text-warning border border-warning/20">
                <FileText className="w-3 h-3" /> JD pasted
              </span>
            )}
          </div>
        )}

        {/* Analyse Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleAnalyze}
            disabled={!hasAnyInput}
            className={`w-full max-w-md py-4 px-8 rounded-xl text-base font-bold transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer
              ${hasAnyInput
                ? 'bg-primary text-white hover:bg-primary-light shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5'
                : 'bg-border text-text-muted cursor-not-allowed shadow-none'
              }`}
          >
            <Sparkles className="w-5 h-5" />
            Analyse My Resume
            {hasAnyInput && <ArrowRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

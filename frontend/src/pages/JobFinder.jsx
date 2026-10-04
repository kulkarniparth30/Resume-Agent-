import { useState, useMemo, useEffect } from 'react';
import { 
  Search, Filter, MapPin, Briefcase, Clock, Sparkles, RefreshCw, Loader2, 
  ExternalLink, AlertCircle, Bot, FileText, CheckCircle2, Trash2, Eye, 
  Copy, Check, X, Award, Send, Users
} from 'lucide-react';
import useAgentStore from '../store/useAgentStore';
import { fetchJobs, autoApplyToJob, fetchApplications, updateApplicationStatus, deleteApplication } from '../api/jobs';
import JobCard from '../components/JobCard';

const ROLES = ["All Roles", "ML Engineer", "Backend Developer", "Data Scientist", "Frontend Developer", "Full Stack Developer", "DevOps Engineer", "Data Analyst", "Cloud Architect", "Software Engineer"];
const LOCATIONS = ["All Locations", "Remote", "India", "Pune", "Bangalore", "Mumbai", "Hyderabad", "Delhi", "USA", "UK"];
const EXPERIENCES = ["All Levels", "Fresher", "1-3 years", "3-5 years", "5+ years"];
const PLATFORMS = ["All Platforms", "LinkedIn", "Naukri", "Indeed", "Company Portal", "Remotive"];

const STATUSES = [
  { key: 'prepared', label: 'Prepared', bg: 'bg-primary/10', text: 'text-primary' },
  { key: 'applied', label: 'Applied', bg: 'bg-info/10 text-info', text: 'text-blue-600' },
  { key: 'interview', label: 'Interview', bg: 'bg-accent/10', text: 'text-accent' },
  { key: 'offer', label: 'Offer 🎉', bg: 'bg-success/10', text: 'text-success' },
  { key: 'rejected', label: 'Rejected', bg: 'bg-danger/10', text: 'text-danger' },
];

export default function JobFinder() {
  const [activeTab, setActiveTab] = useState('search');
  const [statusFilter, setStatusFilter] = useState('all');
  const [role, setRole] = useState("All Roles");
  const [location, setLocation] = useState("All Locations");
  const [experience, setExperience] = useState("All Levels");
  const [platform, setPlatform] = useState("All Platforms");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoApplyingJobs, setAutoApplyingJobs] = useState({});
  const [autoAppliedJobs, setAutoAppliedJobs] = useState({});
  
  // Applications Tracking State
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [copiedSection, setCopiedSection] = useState('');

  const jobRole = useAgentStore((state) => state.jobRole);
  const analysisResult = useAgentStore((state) => state.analysisResult);
  const user = useAgentStore((state) => state.user);

  const userId = user?.id || user?.email || 'default_user';

  const loadJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const searchRole = jobRole || 'Software Engineer';
      const skills = analysisResult?.candidate_skills || [];
      const data = await fetchJobs(searchRole, 'India', skills, userId);
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setError('Failed to load job listings. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    setAppsLoading(true);
    try {
      const data = await fetchApplications(userId);
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setAppsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    loadApplications();
  }, []);

  useEffect(() => {
    if (activeTab === 'applied') {
      loadApplications();
    }
  }, [activeTab]);

  const handleAutoApply = async (job, index) => {
    setAutoApplyingJobs(prev => ({ ...prev, [index]: true }));
    try {
      const result = await autoApplyToJob({
        userId,
        jobTitle: job.title,
        company: job.company,
        jobUrl: job.url || '',
        jobSkills: job.skills || [],
      });
      setAutoAppliedJobs(prev => ({ ...prev, [index]: true }));
      // Refresh applications list
      loadApplications();
      return result;
    } catch (err) {
      console.error('Auto-apply failed:', err);
      return { error: err.message };
    } finally {
      setAutoApplyingJobs(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateApplicationStatus(appId, newStatus);
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDeleteApplication = async (appId) => {
    if (!window.confirm('Are you sure you want to delete this tracked application?')) return;
    try {
      await deleteApplication(appId);
      setApplications(prev => prev.filter(a => a.id !== appId));
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp(null);
      }
    } catch (err) {
      console.error('Failed to delete application:', err);
    }
  };

  const handleCopy = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(''), 2000);
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      if (role !== "All Roles" && job.title && !job.title.toLowerCase().includes(role.toLowerCase())) return false;
      if (location !== "All Locations" && job.location && !job.location.toLowerCase().includes(location.toLowerCase())) return false;
      if (experience !== "All Levels" && job.experience && !job.experience.toLowerCase().includes(experience.toLowerCase())) return false;
      if (platform !== "All Platforms" && job.source && !job.source.toLowerCase().includes(platform.toLowerCase())) return false;
      return true;
    });
  }, [role, location, experience, platform, jobs]);

  const filteredApplications = useMemo(() => {
    if (statusFilter === 'all') return applications;
    return applications.filter(a => a.status === statusFilter);
  }, [applications, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: applications.length,
      prepared: applications.filter(a => a.status === 'prepared').length,
      applied: applications.filter(a => a.status === 'applied').length,
      interview: applications.filter(a => a.status === 'interview').length,
      offer: applications.filter(a => a.status === 'offer').length,
    };
  }, [applications]);

  return (
    <div className="min-h-screen bg-surface py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="text-center space-y-3 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-2">
            <Sparkles className="w-4 h-4" />
            AI Career Navigator
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-dark tracking-tight">
            Find & Track <span className="text-primary">Target Roles</span>
          </h1>
          <p className="text-base sm:text-lg text-text-secondary max-w-xl mx-auto">
            Personalized job matching with 1-click Auto-Apply and application tracking
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center gap-3 animate-slide-up">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-2xl transition-all cursor-pointer ${
              activeTab === 'search'
                ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]'
                : 'bg-white text-text-secondary hover:bg-surface-alt border border-border'
            }`}
          >
            <Search className="w-4 h-4" />
            Job Listings
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === 'search' ? 'bg-white/20 text-white' : 'bg-surface-alt text-text-muted'
            }`}>
              {filteredJobs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('applied')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-2xl transition-all cursor-pointer ${
              activeTab === 'applied'
                ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]'
                : 'bg-white text-text-secondary hover:bg-surface-alt border border-border'
            }`}
          >
            <Bot className="w-4 h-4" />
            Tracked Applications
            {applications.length > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'applied' ? 'bg-white/20 text-white' : 'bg-accent/10 text-accent'
              }`}>
                {applications.length}
              </span>
            )}
          </button>
        </div>

        {/* ===================== TAB 1: JOB SEARCH ===================== */}
        {activeTab === 'search' && (
          <>
            {/* Filter Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-border p-5 sm:p-6 animate-slide-up">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full flex-1">
                  {/* Role Filter */}
                  <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Briefcase className="h-4.5 w-4.5 text-text-muted" />
                    </div>
                    <select 
                      value={role} 
                      onChange={(e) => setRole(e.target.value)}
                      className="pl-10 pr-8 w-full rounded-xl border border-border py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface-alt appearance-none text-dark outline-none cursor-pointer"
                    >
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  {/* Location Filter */}
                  <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <MapPin className="h-4.5 w-4.5 text-text-muted" />
                    </div>
                    <select 
                      value={location} 
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10 pr-8 w-full rounded-xl border border-border py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface-alt appearance-none text-dark outline-none cursor-pointer"
                    >
                      {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>

                  {/* Experience Filter */}
                  <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Search className="h-4.5 w-4.5 text-text-muted" />
                    </div>
                    <select 
                      value={experience} 
                      onChange={(e) => setExperience(e.target.value)}
                      className="pl-10 pr-8 w-full rounded-xl border border-border py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface-alt appearance-none text-dark outline-none cursor-pointer"
                    >
                      {EXPERIENCES.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>

                  {/* Platform / Source Filter */}
                  <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <ExternalLink className="h-4.5 w-4.5 text-text-muted" />
                    </div>
                    <select 
                      value={platform} 
                      onChange={(e) => setPlatform(e.target.value)}
                      className="pl-10 pr-8 w-full rounded-xl border border-border py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface-alt appearance-none text-dark outline-none cursor-pointer"
                    >
                      {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 lg:pl-6">
                  <div className="flex items-center gap-2 text-text-secondary font-semibold text-sm whitespace-nowrap py-2">
                    <Filter className="w-4 h-4 text-accent" />
                    {loading ? '...' : `${filteredJobs.length} listings`}
                  </div>
                  <button
                    onClick={loadJobs}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-danger">Error Loading Jobs</p>
                  <p className="text-sm text-danger/80 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="bg-white rounded-2xl shadow-sm border border-border p-16 text-center flex flex-col items-center justify-center animate-fade-in">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <h3 className="text-lg font-bold text-dark mb-1">Searching job feeds...</h3>
                <p className="text-sm text-text-secondary">Comparing live openings with your candidate profile</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-2xl shadow-sm border border-border p-12 text-center flex flex-col items-center justify-center animate-fade-in">
                <div className="w-20 h-20 bg-surface-alt rounded-2xl flex items-center justify-center mb-6">
                  <Search className="w-8 h-8 text-text-muted" />
                </div>
                <h3 className="text-xl font-bold text-dark mb-2">No jobs found</h3>
                <p className="text-text-secondary max-w-sm">Try adjusting your filters or refresh to get new listings.</p>
                <button 
                  onClick={() => {
                    setRole("All Roles");
                    setLocation("All Locations");
                    setExperience("All Levels");
                    setPlatform("All Platforms");
                  }}
                  className="mt-6 px-6 py-3 bg-primary/10 text-primary font-semibold rounded-xl hover:bg-primary/20 transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              /* Job Cards Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
                {filteredJobs.map((job, index) => (
                  <JobCard 
                    key={index}
                    title={job.title}
                    company={job.company}
                    location={job.location}
                    match={job.match_percentage || job.match || 0}
                    salary={job.salary}
                    url={job.url}
                    experience={job.experience}
                    posted={job.posted}
                    source={job.source}
                    skills={job.skills}
                    matchedSkills={job.matched_skills}
                    missingSkills={job.missing_skills}
                    autoApplying={autoApplyingJobs[index]}
                    autoApplied={autoAppliedJobs[index]}
                    onApply={() => {
                      if (job.url) {
                        window.open(job.url, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    onAutoApply={() => handleAutoApply(job, index)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ===================== TAB 2: TRACKED APPLICATIONS ===================== */}
        {activeTab === 'applied' && (
          <div className="space-y-6 animate-slide-up">
            
            {/* Quick Metrics Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-border shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Total Tracked</p>
                  <p className="text-2xl font-black text-dark mt-1">{stats.total}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <FileText className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-border shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Ready to Send</p>
                  <p className="text-2xl font-black text-primary mt-1">{stats.prepared}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Bot className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-border shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">In Progress</p>
                  <p className="text-2xl font-black text-accent mt-1">{stats.applied + stats.interview}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  <Send className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-border shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Offers Received</p>
                  <p className="text-2xl font-black text-success mt-1">{stats.offer}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success">
                  <Award className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-border shadow-sm">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === 'all' ? 'bg-primary text-white' : 'bg-surface-alt text-text-secondary hover:bg-border'
                }`}
              >
                All ({applications.length})
              </button>
              {STATUSES.map(s => {
                const count = applications.filter(a => a.status === s.key).length;
                return (
                  <button
                    key={s.key}
                    onClick={() => setStatusFilter(s.key)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      statusFilter === s.key ? 'bg-primary text-white' : 'bg-surface-alt text-text-secondary hover:bg-border'
                    }`}
                  >
                    {s.label} ({count})
                  </button>
                );
              })}
            </div>

            {/* Applications List */}
            {appsLoading ? (
              <div className="bg-white rounded-2xl shadow-sm border border-border p-16 text-center flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <h3 className="text-lg font-bold text-dark mb-1">Loading applications...</h3>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-border p-12 text-center flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-surface-alt rounded-2xl flex items-center justify-center mb-6">
                  <Bot className="w-8 h-8 text-text-muted" />
                </div>
                <h3 className="text-xl font-bold text-dark mb-2">No applications found</h3>
                <p className="text-text-secondary max-w-sm">
                  {statusFilter === 'all' 
                    ? "Click 'Auto-Apply' on any job card in the Job Listings tab to instantly generate a tailored application package."
                    : `No applications with status '${statusFilter}'.`}
                </p>
                <button
                  onClick={() => { setActiveTab('search'); setStatusFilter('all'); }}
                  className="mt-6 flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-light transition-colors cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  Browse Jobs to Auto-Apply
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((app) => {
                  const currentStatus = STATUSES.find(s => s.key === app.status) || STATUSES[0];
                  return (
                    <div key={app.id} className="bg-white rounded-2xl shadow-sm border border-border p-5 card-hover">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-6 h-6 text-accent" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-dark text-base sm:text-lg">{app.job_title}</h3>
                              <span className="text-text-muted font-normal">at</span>
                              <span className="font-semibold text-text-secondary">{app.company}</span>
                            </div>
                            <div className="flex items-center flex-wrap gap-3 mt-2 text-xs text-text-muted">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              {app.job_url && (
                                <a 
                                  href={app.job_url} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-primary hover:underline flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3 h-3" /> Job Link
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status Select & Match Score */}
                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          <span className={`text-sm font-extrabold px-3 py-1.5 rounded-full ring-1 ${
                            app.match_percentage >= 70 ? 'bg-success/10 text-success ring-success/20' :
                            app.match_percentage >= 40 ? 'bg-warning/10 text-warning ring-warning/20' :
                            'bg-danger/10 text-danger ring-danger/20'
                          }`}>
                            {app.match_percentage}% match
                          </span>

                          <select
                            value={app.status || 'prepared'}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                            className="text-xs font-bold px-3 py-1.5 rounded-xl border border-border bg-surface-alt text-dark cursor-pointer outline-none focus:ring-2 focus:ring-primary/20"
                          >
                            {STATUSES.map(s => (
                              <option key={s.key} value={s.key}>{s.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Application Fit Summary */}
                      {app.application_summary && (
                        <p className="mt-4 text-xs sm:text-sm text-text-secondary bg-surface-alt rounded-xl p-3 leading-relaxed">
                          {app.application_summary}
                        </p>
                      )}

                      {/* Tailored Bullets Preview */}
                      {app.custom_bullets?.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Tailored Bullets Preview</p>
                          {app.custom_bullets.slice(0, 2).map((b, i) => (
                            <p key={i} className="text-xs text-text-secondary flex items-start gap-1.5">
                              <span className="text-primary font-bold">•</span>
                              <span className="line-clamp-1">{b}</span>
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Full Package
                          </button>
                          
                          <button
                            onClick={() => handleCopy(app.cover_letter, `cl-${app.id}`)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-accent bg-accent/10 hover:bg-accent/20 rounded-lg transition-colors cursor-pointer"
                          >
                            {copiedSection === `cl-${app.id}` ? (
                              <><Check className="w-3.5 h-3.5 text-success" /> Copied!</>
                            ) : (
                              <><Copy className="w-3.5 h-3.5" /> Copy Cover Letter</>
                            )}
                          </button>
                        </div>

                        <button
                          onClick={() => handleDeleteApplication(app.id)}
                          className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer ml-auto"
                          title="Delete application"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===================== FULL APPLICATION PACKAGE MODAL ===================== */}
        {selectedApp && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in"
            onClick={() => setSelectedApp(null)}
          >
            <div 
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-6 animate-slide-up"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-dark text-lg sm:text-xl">{selectedApp.job_title}</h3>
                    <p className="text-sm text-text-secondary">{selectedApp.company}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedApp(null)}
                  className="p-2 hover:bg-surface-alt rounded-xl transition-colors cursor-pointer text-text-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status and Score Banner */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-alt border border-border">
                <div className="flex items-center gap-3">
                  <span className={`text-2xl font-black ${
                    selectedApp.match_percentage >= 70 ? 'text-success' : selectedApp.match_percentage >= 40 ? 'text-warning' : 'text-danger'
                  }`}>
                    {selectedApp.match_percentage}%
                  </span>
                  <div>
                    <p className="text-xs font-bold text-dark">Profile Match Score</p>
                    <p className="text-[11px] text-text-muted">Calculated by Auto-Apply Agent</p>
                  </div>
                </div>

                <select
                  value={selectedApp.status || 'prepared'}
                  onChange={(e) => handleStatusChange(selectedApp.id, e.target.value)}
                  className="text-xs font-bold px-3 py-2 rounded-xl border border-border bg-white text-dark cursor-pointer outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {STATUSES.map(s => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Cover Letter Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-dark text-sm flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-primary" />
                    Tailored Cover Letter
                  </h4>
                  <button
                    onClick={() => handleCopy(selectedApp.cover_letter, 'modal-cl')}
                    className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedSection === 'modal-cl' ? <><Check className="w-3 h-3 text-success" /> Copied</> : <><Copy className="w-3 h-3" /> Copy Letter</>}
                  </button>
                </div>
                <div className="bg-surface-alt rounded-2xl p-5 text-sm text-text-secondary whitespace-pre-line leading-relaxed font-sans border border-border">
                  {selectedApp.cover_letter || "No cover letter generated."}
                </div>
              </div>

              {/* Custom Resume Bullets */}
              {selectedApp.custom_bullets?.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-dark text-sm flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-accent" />
                      Targeted Resume Accomplishments (Google XYZ)
                    </h4>
                    <button
                      onClick={() => handleCopy(selectedApp.custom_bullets.join('\n• '), 'modal-bullets')}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-accent bg-accent/10 hover:bg-accent/20 rounded-lg transition-colors cursor-pointer"
                    >
                      {copiedSection === 'modal-bullets' ? <><Check className="w-3 h-3 text-success" /> Copied</> : <><Copy className="w-3 h-3" /> Copy Bullets</>}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {selectedApp.custom_bullets.map((bullet, idx) => (
                      <div key={idx} className="bg-surface-alt p-3.5 rounded-xl border border-border flex items-start gap-2 text-xs sm:text-sm text-text-secondary leading-relaxed">
                        <span className="text-primary font-bold mt-0.5">•</span>
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fit Summary */}
              {selectedApp.application_summary && (
                <div className="space-y-2">
                  <h4 className="font-bold text-dark text-sm">💡 Candidate Fit Assessment</h4>
                  <p className="bg-success/5 border border-success/15 text-text-secondary text-xs sm:text-sm p-4 rounded-xl leading-relaxed">
                    {selectedApp.application_summary}
                  </p>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex gap-3 pt-2">
                {selectedApp.job_url && (
                  <button
                    onClick={() => window.open(selectedApp.job_url, '_blank', 'noopener,noreferrer')}
                    className="flex-1 py-3 text-sm font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Application URL
                  </button>
                )}
                <button
                  onClick={() => setSelectedApp(null)}
                  className="flex-1 py-3 text-sm font-bold bg-primary text-white hover:bg-primary-light rounded-xl transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

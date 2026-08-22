import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, MapPin, Briefcase, Clock, Sparkles, RefreshCw, Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import useAgentStore from '../store/useAgentStore';
import { fetchJobs } from '../api/jobs';
import JobCard from '../components/JobCard';

const ROLES = ["All Roles", "ML Engineer", "Backend Developer", "Data Scientist", "Frontend Developer", "Full Stack Developer", "DevOps Engineer", "Data Analyst", "Cloud Architect", "Software Engineer"];
const LOCATIONS = ["All Locations", "Remote", "India", "Pune", "Bangalore", "Mumbai", "Hyderabad", "Delhi", "USA", "UK"];
const EXPERIENCES = ["All Levels", "Fresher", "1-3 years", "3-5 years", "5+ years"];

export default function JobFinder() {
  const [role, setRole] = useState("All Roles");
  const [location, setLocation] = useState("All Locations");
  const [experience, setExperience] = useState("All Levels");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const jobRole = useAgentStore((state) => state.jobRole);
  const analysisResult = useAgentStore((state) => state.analysisResult);

  const loadJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const searchRole = jobRole || 'Software Engineer';
      const skills = analysisResult?.candidate_skills || [];
      const data = await fetchJobs(searchRole, 'India', skills);
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setError('Failed to load job listings. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      if (role !== "All Roles" && job.title && !job.title.toLowerCase().includes(role.toLowerCase())) return false;
      if (location !== "All Locations" && job.location && !job.location.toLowerCase().includes(location.toLowerCase())) return false;
      if (experience !== "All Levels" && job.experience && !job.experience.toLowerCase().includes(experience.toLowerCase())) return false;
      return true;
    });
  }, [role, location, experience, jobs]);

  return (
    <div className="min-h-screen bg-surface py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="text-center space-y-3 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-2">
            <Sparkles className="w-4 h-4" />
            Live Job Listings
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-dark tracking-tight">
            Find Your <span className="text-primary">Perfect Role</span>
          </h1>
          <p className="text-base sm:text-lg text-text-secondary max-w-xl mx-auto">
            Real job openings matched to your skills and target role
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-border p-5 sm:p-6 animate-slide-up">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full flex-1">
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
            </div>

            <div className="flex items-center gap-3 lg:pl-6">
              <div className="flex items-center gap-2 text-text-secondary font-semibold text-sm whitespace-nowrap py-2">
                <Filter className="w-4 h-4 text-accent" />
                {loading ? '...' : `${filteredJobs.length} jobs`}
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
            <h3 className="text-lg font-bold text-dark mb-1">Searching for jobs...</h3>
            <p className="text-sm text-text-secondary">Finding the best opportunities for your profile</p>
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
                match={job.match || 0}
                salary={job.salary}
                url={job.url}
                experience={job.experience}
                posted={job.posted}
                source={job.source}
                onApply={() => {
                  if (job.url) {
                    window.open(job.url, '_blank', 'noopener,noreferrer');
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

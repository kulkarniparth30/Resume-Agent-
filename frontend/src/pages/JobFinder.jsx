import { useState, useMemo } from 'react';
import { Search, Filter, MapPin, Briefcase, Clock, Sparkles } from 'lucide-react';
import JobCard from '../components/JobCard';

const MOCK_JOBS = [
  {title: "ML Engineer", company: "Zepto", location: "Pune", match: 71, salary: "8-12 LPA", experience: "1-3 years", posted: "2 days ago"},
  {title: "Backend Developer", company: "Razorpay", location: "Remote", match: 85, salary: "10-15 LPA", experience: "1-3 years", posted: "1 day ago"},
  {title: "Data Scientist", company: "Swiggy", location: "Bangalore", match: 64, salary: "9-14 LPA", experience: "Fresher", posted: "3 days ago"},
  {title: "Full Stack Developer", company: "Flipkart", location: "Bangalore", match: 78, salary: "12-18 LPA", experience: "3-5 years", posted: "1 week ago"},
  {title: "DevOps Engineer", company: "Ola", location: "Pune", match: 55, salary: "8-14 LPA", experience: "1-3 years", posted: "5 days ago"},
  {title: "Frontend Developer", company: "CRED", location: "Bangalore", match: 92, salary: "14-20 LPA", experience: "1-3 years", posted: "Today"},
  {title: "ML Engineer", company: "Google", location: "Hyderabad", match: 60, salary: "20-35 LPA", experience: "3-5 years", posted: "1 week ago"},
  {title: "Data Analyst", company: "PhonePe", location: "Mumbai", match: 73, salary: "6-10 LPA", experience: "Fresher", posted: "2 days ago"},
  {title: "Backend Developer", company: "Dream11", location: "Mumbai", match: 81, salary: "12-16 LPA", experience: "1-3 years", posted: "3 days ago"}
];

const ROLES = ["All Roles", "ML Engineer", "Backend Developer", "Data Scientist", "Frontend Developer", "Full Stack Developer", "DevOps Engineer"];
const LOCATIONS = ["All Locations", "Pune", "Bangalore", "Remote", "Mumbai", "Hyderabad", "Delhi"];
const EXPERIENCES = ["All Levels", "Fresher", "1-3 years", "3-5 years", "5+ years"];
const DATES_POSTED = ["Any Time", "Last 24 hours", "Last Week", "Last Month"];

export default function JobFinder() {
  const [role, setRole] = useState("All Roles");
  const [location, setLocation] = useState("All Locations");
  const [experience, setExperience] = useState("All Levels");
  const [datePosted, setDatePosted] = useState("Any Time");

  const filteredJobs = useMemo(() => {
    return MOCK_JOBS.filter(job => {
      if (role !== "All Roles" && job.title !== role) return false;
      if (location !== "All Locations" && job.location !== location) return false;
      if (experience !== "All Levels" && job.experience !== experience) return false;
      if (datePosted !== "Any Time") {
        if (datePosted === "Last 24 hours" && !["Today", "1 day ago"].includes(job.posted)) return false;
        if (datePosted === "Last Week" && !["Today", "1 day ago", "2 days ago", "3 days ago", "5 days ago", "1 week ago"].includes(job.posted)) return false;
      }
      return true;
    });
  }, [role, location, experience, datePosted]);

  return (
    <div className="min-h-screen bg-surface py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="text-center space-y-3 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-2">
            <Sparkles className="w-4 h-4" />
            AI-Matched Listings
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-dark tracking-tight">
            Find Your <span className="text-primary">Perfect Role</span>
          </h1>
          <p className="text-base sm:text-lg text-text-secondary max-w-xl mx-auto">
            Discover opportunities tailored to your unique skill profile and target qualifications.
          </p>
        </div>

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

              {/* Date Posted Filter */}
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Clock className="h-4.5 w-4.5 text-text-muted" />
                </div>
                <select 
                  value={datePosted} 
                  onChange={(e) => setDatePosted(e.target.value)}
                  className="pl-10 pr-8 w-full rounded-xl border border-border py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface-alt appearance-none text-dark outline-none cursor-pointer"
                >
                  {DATES_POSTED.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 text-text-secondary font-semibold text-sm whitespace-nowrap lg:pl-6 py-2">
              <Filter className="w-4 h-4 text-accent" />
              Showing {filteredJobs.length} jobs
            </div>
          </div>
        </div>

        {/* Job Cards Grid */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-border p-12 text-center flex flex-col items-center justify-center animate-fade-in">
            <div className="w-20 h-20 bg-surface-alt rounded-2xl flex items-center justify-center mb-6">
              <Search className="w-8 h-8 text-text-muted" />
            </div>
            <h3 className="text-xl font-bold text-dark mb-2">No jobs found</h3>
            <p className="text-text-secondary max-w-sm">We couldn't find any positions matching your current filters. Try adjusting them for more results.</p>
            <button 
              onClick={() => {
                setRole("All Roles");
                setLocation("All Locations");
                setExperience("All Levels");
                setDatePosted("Any Time");
              }}
              className="mt-6 px-6 py-3 bg-primary/10 text-primary font-semibold rounded-xl hover:bg-primary/20 transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            {filteredJobs.map((job, index) => (
              <div key={index} className="group relative">
                <JobCard 
                  title={job.title}
                  company={job.company}
                  location={job.location}
                  match={job.match}
                  salary={job.salary}
                  onApply={() => console.log('Applying to', job.title)}
                />
                
                {/* Match Breakdown Tooltip on Hover */}
                <div className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10 flex items-center justify-center">
                  <div className="absolute inset-0 bg-dark/40 rounded-2xl backdrop-blur-[2px]"></div>
                  <div className="relative bg-white p-5 rounded-2xl shadow-xl border border-border w-11/12 max-w-[280px] pointer-events-auto transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <h4 className="font-bold text-dark mb-3 text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                      AI Match Breakdown
                    </h4>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">Matching Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {["Python", "React", "SQL"].map(s => (
                            <span key={s} className="px-2 py-0.5 bg-success/10 text-success border border-success/20 rounded-md text-[10px] font-semibold">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">Missing Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {["Docker", "Machine Learning"].map(s => (
                            <span key={s} className="px-2 py-0.5 bg-danger/10 text-danger border border-danger/20 rounded-md text-[10px] font-semibold">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

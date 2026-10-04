import { useState } from 'react';
import { MapPin, TrendingUp, ExternalLink, Building2, Clock, Zap, Bot, Loader2, CheckCircle2, X } from 'lucide-react';

const getMatchColor = (match) => {
  if (match >= 80) return { bg: 'bg-success/10', text: 'text-success', ring: 'ring-success/20' };
  if (match >= 60) return { bg: 'bg-warning/10', text: 'text-warning', ring: 'ring-warning/20' };
  return { bg: 'bg-danger/10', text: 'text-danger', ring: 'ring-danger/20' };
};

const getPlatformBadge = (source) => {
  if (!source) return { bg: 'bg-surface-alt', text: 'text-text-muted', border: 'border-border', label: 'Direct' };
  const s = source.toLowerCase();
  if (s.includes('linkedin')) {
    return { bg: 'bg-[#0A66C2]/10', text: 'text-[#0A66C2]', border: 'border-[#0A66C2]/25', label: '💼 LinkedIn' };
  }
  if (s.includes('naukri')) {
    return { bg: 'bg-[#2B6CB0]/10', text: 'text-[#2B6CB0]', border: 'border-[#2B6CB0]/25', label: '🔷 Naukri' };
  }
  if (s.includes('indeed')) {
    return { bg: 'bg-[#2164f3]/10', text: 'text-[#2164f3]', border: 'border-[#2164f3]/25', label: '🟦 Indeed' };
  }
  if (s.includes('company')) {
    return { bg: 'bg-emerald-500/10', text: 'text-emerald-700', border: 'border-emerald-500/25', label: '🏢 Careers' };
  }
  return { bg: 'bg-purple-500/10', text: 'text-purple-700', border: 'border-purple-500/25', label: `🌐 ${source}` };
};

export default function JobCard({ 
  title, company, location, match, salary, url, experience, posted, source, skills,
  matchedSkills, missingSkills, onApply, onAutoApply, autoApplying, autoApplied, compact = false 
}) {
  const [showPackage, setShowPackage] = useState(false);
  const [applicationPackage, setApplicationPackage] = useState(null);
  const matchStyle = getMatchColor(match);

  const handleApply = () => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (onApply) {
      onApply();
    }
  };

  const handleAutoApply = async () => {
    if (onAutoApply) {
      const result = await onAutoApply();
      if (result && !result.error) {
        setApplicationPackage(result);
        setShowPackage(true);
      }
    }
  };

  if (compact) {
    return (
      <div className="bg-white rounded-xl border border-border p-4 card-hover min-w-[280px] flex-shrink-0">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          {match > 0 && (
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ring-1 ${matchStyle.bg} ${matchStyle.text} ${matchStyle.ring}`}>
              {match}% match
            </span>
          )}
        </div>
        <h4 className="font-semibold text-dark text-sm">{title}</h4>
        <p className="text-xs text-text-secondary mt-0.5">{company}</p>
        <div className="flex items-center gap-3 mt-3 text-xs text-text-muted">
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{location}</span>
          {salary && <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{salary}</span>}
        </div>
        <button
          onClick={handleApply}
          className="mt-3 w-full py-2 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary-light transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          <ExternalLink className="w-3 h-3" />
          Apply Now
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-md border border-border p-5 card-hover">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-dark">{title}</h3>
              <p className="text-sm text-text-secondary mt-0.5">{company}</p>
              <div className="flex items-center flex-wrap gap-3 mt-2 text-sm text-text-muted">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{location}</span>
                {salary && <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" />{salary}</span>}
                {experience && <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" />{experience}</span>}
                {posted && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{posted}</span>}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {match > 0 && (
              <span className={`text-sm font-bold px-3 py-1.5 rounded-full ring-1 ${matchStyle.bg} ${matchStyle.text} ${matchStyle.ring}`}>
                {match}% match
              </span>
            )}
            {source && (() => {
              const badge = getPlatformBadge(source);
              return (
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                  {badge.label}
                </span>
              );
            })()}
          </div>
        </div>

        {/* Skill Tags */}
        {(matchedSkills?.length > 0 || missingSkills?.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {matchedSkills?.map((s, i) => (
              <span key={`m-${i}`} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-success/10 text-success ring-1 ring-success/20">
                ✓ {s}
              </span>
            ))}
            {missingSkills?.slice(0, 3).map((s, i) => (
              <span key={`x-${i}`} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface-alt text-text-muted">
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleApply}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary-light transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            Apply Now
          </button>
          
          {/* Auto-Apply Agent Button */}
          <button
            onClick={handleAutoApply}
            disabled={autoApplying || autoApplied}
            className={`flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
              autoApplied 
                ? 'bg-success/10 text-success' 
                : 'text-accent bg-accent/10 hover:bg-accent/20'
            }`}
          >
            {autoApplying ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
            ) : autoApplied ? (
              <><CheckCircle2 className="w-4 h-4" /> Applied</>
            ) : (
              <><Bot className="w-4 h-4" /> Auto-Apply</>
            )}
          </button>

          <button className="px-4 py-2.5 text-sm font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors cursor-pointer">
            Save
          </button>
        </div>
      </div>

      {/* Application Package Modal */}
      {showPackage && applicationPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowPackage(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-5 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-dark text-lg">Application Package</h3>
                  <p className="text-sm text-text-secondary">{applicationPackage.job_title} at {applicationPackage.company}</p>
                </div>
              </div>
              <button onClick={() => setShowPackage(false)} className="p-2 hover:bg-surface-alt rounded-lg transition-colors cursor-pointer">
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>

            {/* Match Score */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-alt">
              <div className={`text-2xl font-extrabold ${applicationPackage.match_percentage >= 70 ? 'text-success' : applicationPackage.match_percentage >= 40 ? 'text-warning' : 'text-danger'}`}>
                {applicationPackage.match_percentage}%
              </div>
              <div>
                <p className="font-semibold text-dark text-sm">Match Score</p>
                <p className="text-xs text-text-secondary">
                  {applicationPackage.matched_skills?.length || 0} matched · {applicationPackage.missing_skills?.length || 0} gaps
                </p>
              </div>
            </div>

            {/* Cover Letter */}
            <div>
              <h4 className="font-semibold text-dark mb-2 text-sm">📝 Tailored Cover Letter</h4>
              <div className="bg-surface-alt rounded-xl p-4 text-sm text-text-secondary whitespace-pre-line leading-relaxed">
                {applicationPackage.cover_letter}
              </div>
            </div>

            {/* Custom Bullets */}
            {applicationPackage.custom_bullets?.length > 0 && (
              <div>
                <h4 className="font-semibold text-dark mb-2 text-sm">🎯 Tailored Resume Bullets</h4>
                <ul className="space-y-2">
                  {applicationPackage.custom_bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-secondary bg-surface-alt rounded-lg p-3">
                      <span className="text-primary font-bold mt-0.5">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Summary */}
            <div>
              <h4 className="font-semibold text-dark mb-2 text-sm">💡 Why You're a Fit</h4>
              <p className="text-sm text-text-secondary bg-success/5 border border-success/10 rounded-xl p-4">
                {applicationPackage.application_summary}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(applicationPackage.cover_letter);
                }}
                className="flex-1 py-2.5 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary-light transition-colors cursor-pointer"
              >
                Copy Cover Letter
              </button>
              {url && (
                <button
                  onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                  className="flex-1 py-2.5 text-sm font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Job Page
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

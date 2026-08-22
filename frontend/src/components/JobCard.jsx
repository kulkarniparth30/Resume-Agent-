import { MapPin, TrendingUp, ExternalLink, Building2, Clock, Zap } from 'lucide-react';

const getMatchColor = (match) => {
  if (match >= 80) return { bg: 'bg-success/10', text: 'text-success', ring: 'ring-success/20' };
  if (match >= 60) return { bg: 'bg-warning/10', text: 'text-warning', ring: 'ring-warning/20' };
  return { bg: 'bg-danger/10', text: 'text-danger', ring: 'ring-danger/20' };
};

export default function JobCard({ title, company, location, match, salary, url, experience, posted, source, onApply, compact = false }) {
  const matchStyle = getMatchColor(match);

  const handleApply = () => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (onApply) {
      onApply();
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
          {source && (
            <span className="text-[10px] font-medium text-text-muted bg-surface-alt px-2 py-0.5 rounded-full">
              via {source}
            </span>
          )}
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={handleApply}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary-light transition-colors cursor-pointer"
        >
          <ExternalLink className="w-4 h-4" />
          Apply Now
        </button>
        <button className="px-4 py-2.5 text-sm font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors cursor-pointer">
          Save
        </button>
      </div>
    </div>
  );
}

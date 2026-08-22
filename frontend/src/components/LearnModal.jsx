import { useState, useEffect } from 'react';
import { X, Loader2, ExternalLink, Play, FileText, BookOpen, Star } from 'lucide-react';
import { fetchLearnResources } from '../api/learn';

const TABS = [
  { id: 'youtube', label: '📺 Videos', icon: Play },
  { id: 'articles', label: '📄 Articles', icon: FileText },
  { id: 'papers', label: '📑 Papers & Docs', icon: BookOpen },
];

const DIFFICULTY_COLORS = {
  beginner: 'bg-success/10 text-success',
  intermediate: 'bg-warning/10 text-warning',
  advanced: 'bg-danger/10 text-danger',
};

function ResourceCard({ resource }) {
  const diffClass = DIFFICULTY_COLORS[resource.difficulty] || DIFFICULTY_COLORS.intermediate;

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-surface-alt hover:bg-white border border-border hover:border-primary/30 rounded-xl p-4 transition-all duration-200 hover:shadow-md group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-dark text-sm group-hover:text-primary transition-colors line-clamp-2">
            {resource.title}
          </h4>
          <p className="text-xs text-text-secondary mt-1.5 line-clamp-2">{resource.description}</p>
          <div className="flex items-center gap-2 mt-2.5">
            <span className="text-xs font-medium text-text-muted">{resource.source}</span>
            {resource.difficulty && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${diffClass}`}>
                {resource.difficulty}
              </span>
            )}
          </div>
        </div>
        <ExternalLink className="w-4 h-4 text-text-muted group-hover:text-primary flex-shrink-0 mt-0.5 transition-colors" />
      </div>
    </a>
  );
}

export default function LearnModal({ skill, jobRole, onClose }) {
  const [activeTab, setActiveTab] = useState('youtube');
  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!skill) return;

    let cancelled = false;
    setLoading(true);
    setError('');

    fetchLearnResources(skill, jobRole || '')
      .then((data) => {
        if (!cancelled) setResources(data);
      })
      .catch((err) => {
        if (!cancelled) setError('Failed to load resources. Please try again.');
        console.error('Learn resources error:', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [skill, jobRole]);

  const currentResources = resources?.[activeTab] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-dark/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-border w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-alt/50">
          <div>
            <h2 className="text-lg font-bold text-dark flex items-center gap-2">
              <Star className="w-5 h-5 text-warning" />
              Learn {skill}
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Curated resources personalized for your skill level
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-alt text-text-muted hover:text-dark transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 cursor-pointer relative ${
                  isActive
                    ? 'text-primary bg-primary/5'
                    : 'text-text-secondary hover:text-dark hover:bg-surface-alt'
                }`}
              >
                {tab.label}
                {isActive && (
                  <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
              <p className="text-sm text-text-secondary">Finding the best resources for {skill}...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-sm text-danger mb-4">{error}</p>
              <button
                onClick={() => { setLoading(true); setError(''); fetchLearnResources(skill, jobRole || '').then(setResources).catch(() => setError('Failed again.')).finally(() => setLoading(false)); }}
                className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-light transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : currentResources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-sm text-text-muted">No resources found in this category.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentResources.map((resource, idx) => (
                <ResourceCard key={idx} resource={resource} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

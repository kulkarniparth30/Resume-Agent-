import React, { useState, useEffect } from 'react';
import { X, Loader2, Play, GitMerge, FileCode, CheckCircle2, Link as LinkIcon, BookOpen, AlertCircle } from 'lucide-react';
import { fetchProjectGuide } from '../api/projects';
import useAgentStore from '../store/useAgentStore';

export default function ProjectGuideModal({ project, onClose }) {
  const projectGuidesCache = useAgentStore((s) => s.projectGuidesCache);
  const setProjectGuideCache = useAgentStore((s) => s.setProjectGuideCache);

  const cachedGuide = project?.name ? projectGuidesCache[project.name] : null;
  const [guide, setGuide] = useState(cachedGuide || null);
  const [loading, setLoading] = useState(!cachedGuide);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!project) return;

    // Check if we already have the guide in cache
    if (projectGuidesCache[project.name]) {
      setGuide(projectGuidesCache[project.name]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');

    fetchProjectGuide(project.name, project.description, project.skills_covered || [])
      .then((data) => {
        if (!cancelled) {
          setGuide(data);
          setProjectGuideCache(project.name, data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(err);
          setError('Failed to generate project guide. Please try again.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [project, projectGuidesCache]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-border w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-alt">
          <div>
            <h2 className="text-xl font-bold text-dark flex items-center gap-2">
              <Play className="w-5 h-5 text-accent" />
              Build: {project.name}
            </h2>
            <p className="text-sm text-text-secondary mt-1 max-w-2xl truncate">
              {project.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-border text-text-muted hover:text-dark transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-surface">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
              <h3 className="text-lg font-bold text-dark mb-1">Generating your build guide...</h3>
              <p className="text-sm text-text-secondary max-w-sm text-center">
                Our AI is putting together a step-by-step roadmap, architecture plan, and gathering resources for this project.
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-danger" />
              </div>
              <p className="text-danger font-semibold mb-4">{error}</p>
              <button
                type="button"
                onClick={() => {
                  setLoading(true); setError('');
                  fetchProjectGuide(project.name, project.description, project.skills_covered || [])
                    .then(setGuide)
                    .catch((err) => {
                      console.error(err);
                      setError(err.response?.data?.detail || 'Failed to generate project guide. Please try again.');
                    })
                    .finally(() => setLoading(false));
                }}
                className="px-6 py-2.5 bg-accent text-white font-semibold rounded-xl hover:bg-accent/90 transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : guide && (
            <div className="space-y-8 animate-slide-up">
              
              {/* Architecture & Prerequisites */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-xl border border-border shadow-sm">
                  <h3 className="text-sm font-bold text-dark flex items-center gap-2 mb-3 uppercase tracking-wider">
                    <GitMerge className="w-4 h-4 text-primary" /> Architecture Overview
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {guide.architecture}
                  </p>
                </div>
                
                <div className="bg-white p-5 rounded-xl border border-border shadow-sm">
                  <h3 className="text-sm font-bold text-dark flex items-center gap-2 mb-3 uppercase tracking-wider">
                    <FileCode className="w-4 h-4 text-warning" /> Prerequisites
                  </h3>
                  <ul className="space-y-2">
                    {guide.prerequisites?.map((prereq, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
                        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                        {prereq}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Step by Step Roadmap */}
              <div>
                <h3 className="text-lg font-bold text-dark mb-4">Implementation Steps</h3>
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {guide.steps?.map((step, index) => (
                    <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface bg-accent text-white font-bold text-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-md z-10">
                        {index + 1}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-xl bg-white border border-border shadow-sm">
                        <h4 className="font-bold text-dark mb-2">{step.title}</h4>
                        <p className="text-sm text-text-secondary mb-3 leading-relaxed">{step.description}</p>
                        {step.tips && step.tips.length > 0 && (
                          <div className="bg-accent/5 p-3 rounded-lg border border-accent/10">
                            <h5 className="text-xs font-bold text-accent mb-1.5 uppercase tracking-wide">Pro Tips</h5>
                            <ul className="space-y-1.5">
                              {step.tips.map((tip, i) => (
                                <li key={i} className="text-xs text-text-secondary flex items-start gap-1.5">
                                  <span className="text-accent">•</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resources */}
              {guide.resources && guide.resources.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                  <h3 className="text-sm font-bold text-dark flex items-center gap-2 mb-4 uppercase tracking-wider">
                    <BookOpen className="w-4 h-4 text-primary" /> Helpful Resources
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {guide.resources.map((res, idx) => (
                      <a
                        key={idx}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-surface-alt transition-colors group"
                      >
                        <span className="text-sm font-medium text-dark group-hover:text-primary transition-colors truncate pr-2">
                          {res.name}
                        </span>
                        <LinkIcon className="w-4 h-4 text-text-muted group-hover:text-primary flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

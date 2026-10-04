import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, BookOpen, Code2, CheckCircle2, Target, MapPin,
  Trophy, Clock, Sparkles, Loader2, ArrowLeft, Trash2, Bot, Layers
} from 'lucide-react';
import useAgentStore from '../store/useAgentStore';
import { generateRoadmap } from '../api/roadmap';

export default function Roadmap() {
  const analysisResult = useAgentStore((s) => s.analysisResult);
  const roadmapData = useAgentStore((s) => s.roadmapData);
  const setRoadmapData = useAgentStore((s) => s.setRoadmapData);
  const savedRoadmaps = useAgentStore((s) => s.savedRoadmaps) || [];
  const activeRoadmapId = useAgentStore((s) => s.activeRoadmapId);
  const setActiveRoadmap = useAgentStore((s) => s.setActiveRoadmap);
  const deleteRoadmap = useAgentStore((s) => s.deleteRoadmap);
  const fetchUserRoadmaps = useAgentStore((s) => s.fetchUserRoadmaps);
  const user = useAgentStore((s) => s.user);

  const userId = user?.id || user?.email || 'default_user';

  // Active roadmap resolution
  const activeEntry = savedRoadmaps.find((r) => r.id === activeRoadmapId) || savedRoadmaps[0] || null;
  const currentRoadmapData = activeEntry ? (activeEntry.roadmap_data || activeEntry.roadmap || []) : (roadmapData || []);
  const currentRole = activeEntry?.role || activeEntry?.title || useAgentStore.getState().jobRole || 'Target Role';
  const currentScore = activeEntry?.rank_score || analysisResult?.rank_score || 60;

  const storageKey = `roadmap_completed_${activeEntry?.id || 'default'}`;

  const [completedItems, setCompletedItems] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Sync saved roadmaps from backend on mount
  useEffect(() => {
    fetchUserRoadmaps(userId);
  }, [userId]);

  // Update completed items when active roadmap changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setCompletedItems(saved ? new Set(JSON.parse(saved)) : new Set());
    } catch {
      setCompletedItems(new Set());
    }
  }, [storageKey]);

  // Save completed items to localStorage when toggled
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify([...completedItems]));
    } catch {}
  }, [completedItems, storageKey]);

  // Auto-generate if coming from a fresh analysis with no roadmap
  useEffect(() => {
    if (analysisResult && savedRoadmaps.length === 0 && !roadmapData && !isGenerating) {
      handleGenerate();
    }
  }, [analysisResult]);

  const handleGenerate = async () => {
    if (!analysisResult) return;
    setIsGenerating(true);
    setError('');
    try {
      const targetRole = useAgentStore.getState().jobRole || 'Software Developer';
      const result = await generateRoadmap({
        candidate_skills: analysisResult.candidate_skills || [],
        skill_gaps: (analysisResult.skill_gap || []).map((g) => g.skill),
        job_role: targetRole,
        rank_score: analysisResult.rank_score || 50,
        user_id: userId,
      });
      const data = result.roadmap || result;
      setRoadmapData(data, targetRole, result.saved_id, analysisResult.rank_score || 50);
      fetchUserRoadmaps(userId);
    } catch (err) {
      console.error('Roadmap generation failed:', err);
      setError('Failed to generate roadmap. Make sure the backend is running.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleItem = (id) => {
    setCompletedItems((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const handleDelete = async () => {
    if (!activeEntry?.id) return;
    await deleteRoadmap(activeEntry.id, userId);
    setDeleteModalOpen(false);
  };

  // Loading state
  if (isGenerating) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="text-center animate-fade-in">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-dark mb-2">Generating Your Roadmap</h2>
          <p className="text-text-secondary text-sm">AI is creating a personalized learning path based on your profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="text-center max-w-md animate-fade-in">
          <p className="text-danger font-semibold mb-4">{error}</p>
          <button
            onClick={handleGenerate}
            className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-light transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const roadmap = Array.isArray(currentRoadmapData) ? currentRoadmapData : [];

  // No saved roadmap & no current roadmap data
  if (roadmap.length === 0 && savedRoadmaps.length === 0) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="text-center max-w-md animate-fade-in">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Target className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-dark mb-3">No Saved Roadmap Yet</h2>
          <p className="text-text-secondary mb-6">
            Generate an interactive learning roadmap by analyzing your resume, or ask Career Copilot anytime (e.g. <em>"Give me an Agentic AI Engineer roadmap"</em>).
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-light transition-colors shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              Analyse Resume
            </Link>
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-dark font-semibold rounded-xl hover:bg-surface-alt transition-colors border border-border shadow-sm"
            >
              <Bot className="w-4 h-4 text-primary" />
              Ask Copilot
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalItems = roadmap.reduce((a, m) => a + (m.items?.length || 0), 0);
  const progressPercent = totalItems > 0 ? Math.round((completedItems.size / totalItems) * 100) : 0;

  const getMonthProgress = (items) => {
    if (!items || items.length === 0) return 0;
    const done = items.filter((i) => completedItems.has(i.id)).length;
    return Math.round((done / items.length) * 100);
  };

  const getRankMessage = () => {
    if (currentScore >= 70) return { text: "You're close! Focus on advanced polish & projects.", months: '1-2' };
    if (currentScore >= 40) return { text: 'Solid foundation. Target your specific skills & builds.', months: '3-4' };
    return { text: 'Build a strong core foundation with step-by-step practice.', months: '4-6' };
  };

  const rankMsg = getRankMessage();

  return (
    <div className="min-h-screen bg-surface py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">

        {/* Multi-Roadmap Tabs / Selector */}
        {savedRoadmaps.length > 1 && (
          <div className="mb-6 bg-white p-3 rounded-2xl border border-border shadow-xs">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-primary" /> Saved Roadmaps ({savedRoadmaps.length})
              </span>
              <Link to="/chat" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                <Bot className="w-3 h-3" /> Ask Copilot for new roadmap
              </Link>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {savedRoadmaps.map((rm) => {
                const isSelected = (activeEntry?.id === rm.id);
                return (
                  <button
                    key={rm.id}
                    onClick={() => setActiveRoadmap(rm)}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-white shadow-sm ring-2 ring-primary/30'
                        : 'bg-surface-alt text-text-secondary hover:text-dark hover:bg-surface border border-border/60'
                    }`}
                  >
                    {rm.role || rm.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Target Role Card */}
        <div className="bg-white rounded-2xl shadow-md border border-border overflow-hidden mb-8">
          <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-success" />
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-2">
                  <Target className="w-4 h-4" />
                  Personalized Learning Roadmap
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-dark">
                  {currentRole}
                </h1>
                <p className="text-text-secondary mt-1 text-sm">
                  {rankMsg.text}
                </p>
              </div>

              {/* Action Buttons & Badges */}
              <div className="flex flex-col sm:items-end gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-xl text-xs font-semibold border border-primary/20">
                    <Clock className="w-3.5 h-3.5" /> Est. {activeEntry?.timeline || `${rankMsg.months} months`}
                  </span>
                  {activeEntry?.id && (
                    <button
                      onClick={() => setDeleteModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-danger/5 hover:bg-danger/15 text-danger border border-danger/20 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                      title="Delete this saved roadmap"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  )}
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
                  <Trophy className="w-3.5 h-3.5 text-warning" /> Readiness Score: {currentScore}/100
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6 pt-4 border-t border-border/60">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-text-secondary">Overall Mastery Progress</span>
                <span className="text-sm font-bold text-primary">{progressPercent}% ({completedItems.size}/{totalItems} items completed)</span>
              </div>
              <div className="w-full bg-surface-alt rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-8">
            {roadmap.map((month) => {
              const items = month.items || [];
              const prog = getMonthProgress(items);
              const isDone = prog === 100;
              const isActive = prog > 0 && prog < 100;

              const dotColor = isDone
                ? 'bg-success ring-success/20'
                : isActive
                ? 'bg-warning ring-warning/20'
                : 'bg-primary ring-primary/20';

              return (
                <div key={month.id} className="relative pl-14">
                  {/* Dot */}
                  <div className={`absolute left-3 top-6 w-4 h-4 rounded-full ring-4 ${dotColor} z-10`} />

                  {/* Card */}
                  <div className="bg-white rounded-xl shadow-xs border border-border overflow-hidden">
                    {/* Header */}
                    <div
                      className={`px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                        isDone ? 'bg-success/5' : isActive ? 'bg-warning/5' : 'bg-primary/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                            isDone
                              ? 'bg-success/10 text-success'
                              : isActive
                              ? 'bg-warning/10 text-warning'
                              : 'bg-primary/10 text-primary'
                          }`}
                        >
                          {month.month}
                        </span>
                        <h3 className="text-base font-bold text-dark">{month.title}</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-text-muted">{prog}%</span>
                        <div className="w-20 bg-border rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                              isDone ? 'bg-success' : isActive ? 'bg-warning' : 'bg-primary'
                            }`}
                            style={{ width: `${prog}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-4">
                      {/* Skills */}
                      {items.filter((i) => i.type === 'skill').length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Code2 className="w-3.5 h-3.5" /> Skills to Master
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {items
                              .filter((i) => i.type === 'skill')
                              .map((skill) => {
                                const checked = completedItems.has(skill.id);
                                return (
                                  <label
                                    key={skill.id}
                                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                                      checked
                                        ? 'bg-success/5 border-success/20'
                                        : 'bg-surface-alt border-border hover:bg-surface'
                                    }`}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => toggleItem(skill.id)}
                                      className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center cursor-pointer transition-colors ${
                                        checked ? 'bg-success text-white' : 'border border-border bg-white'
                                      }`}
                                    >
                                      {checked && <CheckCircle2 className="w-3 h-3" />}
                                    </button>
                                    <span
                                      className={`text-sm ${
                                        checked ? 'text-text-muted line-through' : 'text-dark'
                                      }`}
                                    >
                                      {skill.text}
                                    </span>
                                  </label>
                                );
                              })}
                          </div>
                        </div>
                      )}

                      {/* Project & Course */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {items
                          .filter((i) => i.type === 'project')
                          .map((item) => {
                            const checked = completedItems.has(item.id);
                            return (
                              <div key={item.id}>
                                <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5" /> Hands-On Project
                                </h4>
                                <label
                                  className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                                    checked
                                      ? 'bg-success/5 border-success/20'
                                      : 'bg-accent/5 border-accent/15 hover:bg-accent/10'
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => toggleItem(item.id)}
                                    className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center cursor-pointer transition-colors ${
                                      checked ? 'bg-success text-white' : 'border-2 border-accent/30 bg-white'
                                    }`}
                                  >
                                    {checked && <CheckCircle2 className="w-3.5 h-3.5" />}
                                  </button>
                                  <span
                                    className={`text-sm font-medium ${
                                      checked ? 'text-text-muted line-through' : 'text-dark'
                                    }`}
                                  >
                                    {item.text}
                                  </span>
                                </label>
                              </div>
                            );
                          })}

                        {items
                          .filter((i) => i.type === 'course')
                          .map((item) => {
                            const checked = completedItems.has(item.id);
                            return (
                              <div key={item.id}>
                                <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                  <BookOpen className="w-3.5 h-3.5" /> Recommended Course / Resource
                                </h4>
                                <label
                                  className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                                    checked
                                      ? 'bg-success/5 border-success/20'
                                      : 'bg-primary/5 border-primary/15 hover:bg-primary/10'
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => toggleItem(item.id)}
                                    className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center cursor-pointer transition-colors ${
                                      checked ? 'bg-success text-white' : 'border-2 border-primary/30 bg-white'
                                    }`}
                                  >
                                    {checked && <CheckCircle2 className="w-3.5 h-3.5" />}
                                  </button>
                                  <span
                                    className={`text-sm font-medium ${
                                      checked ? 'text-text-muted line-through' : 'text-dark'
                                    }`}
                                  >
                                    {item.text}
                                  </span>
                                </label>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-light transition-colors shadow-sm"
          >
            <Bot className="w-4 h-4" />
            Discuss Roadmap with Copilot
          </Link>
          {analysisResult && (
            <button
              onClick={() => {
                setRoadmapData(null);
                handleGenerate();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary/5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Regenerate Roadmap
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-border">
            <div className="w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-dark mb-2">Delete this roadmap?</h3>
            <p className="text-text-secondary text-sm mb-6">
              Are you sure you want to delete the <strong>{currentRole}</strong> roadmap? This will permanently remove your tracked progress for this role.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 text-text-secondary hover:text-dark font-medium text-sm rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-danger text-white font-semibold text-sm rounded-xl hover:bg-danger-dark transition-colors cursor-pointer"
              >
                Delete Roadmap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, BookOpen, Code2, CheckCircle2, Target, MapPin,
  Trophy, Clock, Sparkles, Loader2, ArrowLeft
} from 'lucide-react';
import useAgentStore from '../store/useAgentStore';
import { generateRoadmap } from '../api/roadmap';

export default function Roadmap() {
  const analysisResult = useAgentStore((s) => s.analysisResult);
  const roadmapData = useAgentStore((s) => s.roadmapData);
  const setRoadmapData = useAgentStore((s) => s.setRoadmapData);

  const [completedItems, setCompletedItems] = useState(() => {
    const saved = localStorage.getItem('roadmap_completed');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  // Save completed items to localStorage
  useEffect(() => {
    localStorage.setItem('roadmap_completed', JSON.stringify([...completedItems]));
  }, [completedItems]);

  // Generate roadmap when analysis result is available but no roadmap exists
  useEffect(() => {
    if (analysisResult && !roadmapData && !isGenerating) {
      handleGenerate();
    }
  }, [analysisResult]);

  const handleGenerate = async () => {
    if (!analysisResult) return;
    setIsGenerating(true);
    setError('');
    try {
      const result = await generateRoadmap({
        candidate_skills: analysisResult.candidate_skills || [],
        skill_gaps: (analysisResult.skill_gap || []).map(g => g.skill),
        job_role: useAgentStore.getState().jobRole || 'Software Developer',
        rank_score: analysisResult.rank_score || 50,
      });
      setRoadmapData(result.roadmap || result);
    } catch (err) {
      console.error('Roadmap generation failed:', err);
      setError('Failed to generate roadmap. Make sure the backend is running.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleItem = (id) => {
    setCompletedItems(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  // No analysis state
  if (!analysisResult) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="text-center max-w-md animate-fade-in">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Target className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-dark mb-3">No Roadmap Yet</h2>
          <p className="text-text-secondary mb-6">Run a resume analysis first to get a personalized learning roadmap.</p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-light transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Analyse Resume
          </Link>
        </div>
      </div>
    );
  }

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
          <button onClick={handleGenerate} className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-light transition-colors cursor-pointer">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const roadmap = Array.isArray(roadmapData) ? roadmapData : [];

  if (roadmap.length === 0) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="text-center max-w-md animate-fade-in">
          <p className="text-text-secondary mb-4">No roadmap data available.</p>
          <button onClick={handleGenerate} className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-light transition-colors cursor-pointer">
            Generate Roadmap
          </button>
        </div>
      </div>
    );
  }

  const totalItems = roadmap.reduce((a, m) => a + (m.items?.length || 0), 0);
  const progressPercent = totalItems > 0 ? Math.round((completedItems.size / totalItems) * 100) : 0;

  const getMonthProgress = (items) => {
    if (!items || items.length === 0) return 0;
    const done = items.filter(i => completedItems.has(i.id)).length;
    return Math.round((done / items.length) * 100);
  };

  const getRankMessage = () => {
    const rank = analysisResult.rank_score || 50;
    if (rank >= 70) return { text: 'You\'re close! Focus on advanced polish.', months: '1-2' };
    if (rank >= 40) return { text: 'Solid base. Target your specific skill gaps.', months: '3-4' };
    return { text: 'Build a strong foundation first.', months: '4-6' };
  };

  const rankMsg = getRankMessage();

  return (
    <div className="min-h-screen bg-surface py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">

        {/* Target Role Card */}
        <div className="bg-white rounded-2xl shadow-md border border-border overflow-hidden mb-8">
          <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-success" />
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-2">
                  <Target className="w-4 h-4" />
                  Personalized Career Roadmap
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-dark">
                  {useAgentStore.getState().jobRole || 'Your Target Role'}
                </h1>
                <p className="text-text-secondary mt-1 text-sm">
                  {rankMsg.text}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-medium border border-primary/20">
                  <Clock className="w-4 h-4" /> Est. {rankMsg.months} months
                </span>
                <span className="inline-flex items-center gap-2 text-sm text-text-secondary">
                  <Trophy className="w-4 h-4 text-warning" /> Rank Score: {analysisResult.rank_score || 'N/A'}/100
                </span>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-text-secondary">Overall Progress</span>
                <span className="text-sm font-bold text-primary">{progressPercent}%</span>
              </div>
              <div className="w-full bg-surface-alt rounded-full h-2.5 overflow-hidden">
                <div className="bg-primary h-2.5 rounded-full transition-all duration-700" style={{ width: `${progressPercent}%` }} />
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

              const dotColor = isDone ? 'bg-success ring-success/20' : isActive ? 'bg-warning ring-warning/20' : 'bg-primary ring-primary/20';

              return (
                <div key={month.id} className="relative pl-14">
                  {/* Dot */}
                  <div className={`absolute left-3 top-6 w-4 h-4 rounded-full ring-4 ${dotColor} z-10`} />

                  {/* Card */}
                  <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
                    {/* Header */}
                    <div className={`px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${isDone ? 'bg-success/5' : isActive ? 'bg-warning/5' : 'bg-primary/5'}`}>
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${isDone ? 'bg-success/10 text-success' : isActive ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'}`}>
                          {month.month}
                        </span>
                        <h3 className="text-base font-bold text-dark">{month.title}</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-text-muted">{prog}%</span>
                        <div className="w-20 bg-border rounded-full h-1.5 overflow-hidden">
                          <div className={`h-1.5 rounded-full transition-all duration-500 ${isDone ? 'bg-success' : isActive ? 'bg-warning' : 'bg-primary'}`} style={{ width: `${prog}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-4">
                      {/* Skills */}
                      {items.filter(i => i.type === 'skill').length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Code2 className="w-3.5 h-3.5" /> Skills to Learn
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {items.filter(i => i.type === 'skill').map(skill => {
                              const checked = completedItems.has(skill.id);
                              return (
                                <label key={skill.id} className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${checked ? 'bg-success/5 border-success/20' : 'bg-surface-alt border-border hover:bg-surface'}`}>
                                  <button type="button" onClick={() => toggleItem(skill.id)} className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center cursor-pointer transition-colors ${checked ? 'bg-success text-white' : 'border border-border bg-white'}`}>
                                    {checked && <CheckCircle2 className="w-3 h-3" />}
                                  </button>
                                  <span className={`text-sm ${checked ? 'text-text-muted line-through' : 'text-dark'}`}>{skill.text}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Project & Course */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {items.filter(i => i.type === 'project').map(item => {
                          const checked = completedItems.has(item.id);
                          return (
                            <div key={item.id}>
                              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" /> Project
                              </h4>
                              <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${checked ? 'bg-success/5 border-success/20' : 'bg-accent/5 border-accent/15 hover:bg-accent/10'}`}>
                                <button type="button" onClick={() => toggleItem(item.id)} className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center cursor-pointer transition-colors ${checked ? 'bg-success text-white' : 'border-2 border-accent/30 bg-white'}`}>
                                  {checked && <CheckCircle2 className="w-3.5 h-3.5" />}
                                </button>
                                <span className={`text-sm font-medium ${checked ? 'text-text-muted line-through' : 'text-dark'}`}>{item.text}</span>
                              </label>
                            </div>
                          );
                        })}
                        {items.filter(i => i.type === 'course').map(item => {
                          const checked = completedItems.has(item.id);
                          return (
                            <div key={item.id}>
                              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5" /> Course
                              </h4>
                              <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${checked ? 'bg-success/5 border-success/20' : 'bg-primary/5 border-primary/15 hover:bg-primary/10'}`}>
                                <button type="button" onClick={() => toggleItem(item.id)} className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center cursor-pointer transition-colors ${checked ? 'bg-success text-white' : 'border-2 border-primary/30 bg-white'}`}>
                                  {checked && <CheckCircle2 className="w-3.5 h-3.5" />}
                                </button>
                                <span className={`text-sm font-medium ${checked ? 'text-text-muted line-through' : 'text-dark'}`}>{item.text}</span>
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

        {/* Regenerate button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => { setRoadmapData(null); handleGenerate(); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary/5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Regenerate Roadmap
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import {
  Calendar, BookOpen, Code2, CheckCircle2, Target, MapPin,
  Trophy, Clock, Sparkles
} from 'lucide-react';

const ROADMAP_DATA = [
  {
    id: 1, month: 'Month 1', title: 'Foundation',
    items: [
      { id: '1-s1', type: 'skill', text: 'Python Advanced' },
      { id: '1-s2', type: 'skill', text: 'Statistics' },
      { id: '1-s3', type: 'skill', text: 'NumPy/Pandas' },
      { id: '1-p1', type: 'project', text: 'Data Analysis Dashboard' },
      { id: '1-c1', type: 'course', text: 'Python for Data Science (Coursera)' }
    ]
  },
  {
    id: 2, month: 'Month 2', title: 'Core ML',
    items: [
      { id: '2-s1', type: 'skill', text: 'Scikit-learn' },
      { id: '2-s2', type: 'skill', text: 'Linear Algebra' },
      { id: '2-s3', type: 'skill', text: 'Feature Engineering' },
      { id: '2-p1', type: 'project', text: 'ML Classification Model' },
      { id: '2-c1', type: 'course', text: 'ML Specialization (Coursera)' }
    ]
  },
  {
    id: 3, month: 'Month 3', title: 'Deep Learning',
    items: [
      { id: '3-s1', type: 'skill', text: 'TensorFlow' },
      { id: '3-s2', type: 'skill', text: 'Neural Networks' },
      { id: '3-s3', type: 'skill', text: 'Computer Vision' },
      { id: '3-p1', type: 'project', text: 'Image Classification API' },
      { id: '3-c1', type: 'course', text: 'Deep Learning Specialization' }
    ]
  },
  {
    id: 4, month: 'Month 4', title: 'Production & Deployment',
    items: [
      { id: '4-s1', type: 'skill', text: 'Docker' },
      { id: '4-s2', type: 'skill', text: 'FastAPI' },
      { id: '4-s3', type: 'skill', text: 'AWS EC2' },
      { id: '4-s4', type: 'skill', text: 'MLOps' },
      { id: '4-p1', type: 'project', text: 'ML API Service with Docker' },
      { id: '4-c1', type: 'course', text: 'Docker Mastery (Udemy)' }
    ]
  }
];

export default function Roadmap() {
  const [completedItems, setCompletedItems] = useState(new Set(['1-s1', '1-s2']));

  const toggleItem = (id) => {
    setCompletedItems(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const totalItems = ROADMAP_DATA.reduce((a, m) => a + m.items.length, 0);
  const progressPercent = Math.round((completedItems.size / totalItems) * 100);

  const getMonthProgress = (items) => {
    const done = items.filter(i => completedItems.has(i.id)).length;
    return Math.round((done / items.length) * 100);
  };

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
                  Career Target
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-dark">Machine Learning Engineer</h1>
                <p className="text-text-secondary mt-1 flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4" /> From: Junior Developer
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-medium border border-primary/20">
                  <Clock className="w-4 h-4" /> Est. 3-4 months
                </span>
                <span className="inline-flex items-center gap-2 text-sm text-text-secondary">
                  <Trophy className="w-4 h-4 text-warning" /> Goal: Mid-level MLE
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
            {ROADMAP_DATA.map((month) => {
              const prog = getMonthProgress(month.items);
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
                      <div>
                        <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Code2 className="w-3.5 h-3.5" /> Skills to Learn
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {month.items.filter(i => i.type === 'skill').map(skill => {
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

                      {/* Project & Course */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {month.items.filter(i => i.type === 'project').map(item => {
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
                        {month.items.filter(i => i.type === 'course').map(item => {
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
      </div>
    </div>
  );
}

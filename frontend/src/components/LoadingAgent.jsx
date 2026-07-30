import { useEffect, useState } from 'react';
import { Bot, FileSearch, Brain, Target, CheckCircle2, Loader2 } from 'lucide-react';

const AGENT_STEPS = [
  { id: 'parse', label: 'Parsing resume...', icon: FileSearch, duration: 2000 },
  { id: 'extract', label: 'Extracting skills...', icon: Brain, duration: 1500 },
  { id: 'match', label: 'Matching against job requirements...', icon: Target, duration: 2500 },
  { id: 'analyse', label: 'Running skill gap analysis...', icon: Brain, duration: 2000 },
  { id: 'score', label: 'Calculating ATS score...', icon: Target, duration: 1500 },
  { id: 'jobs', label: 'Searching live job listings...', icon: FileSearch, duration: 2000 },
  { id: 'complete', label: 'Analysis complete!', icon: CheckCircle2, duration: 0 },
];

export default function LoadingAgent({ onComplete }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  useEffect(() => {
    if (currentStepIndex >= AGENT_STEPS.length) {
      onComplete?.();
      return;
    }

    const step = AGENT_STEPS[currentStepIndex];
    if (step.duration === 0) {
      setCompletedSteps((prev) => [...prev, step.id]);
      return;
    }

    const timer = setTimeout(() => {
      setCompletedSteps((prev) => [...prev, step.id]);
      setCurrentStepIndex((prev) => prev + 1);
    }, step.duration);

    return () => clearTimeout(timer);
  }, [currentStepIndex, onComplete]);

  return (
    <div className="flex flex-col items-center py-16">
      {/* Agent Avatar */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Bot className="w-10 h-10 text-primary animate-pulse-slow" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-success flex items-center justify-center animate-pulse">
          <span className="w-2 h-2 rounded-full bg-white" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-dark mb-1">Agent is analysing...</h3>
      <p className="text-sm text-text-secondary mb-8">Please wait while our AI processes your data</p>

      {/* Steps */}
      <div className="w-full max-w-md space-y-3">
        {AGENT_STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = index === currentStepIndex && !isCompleted;
          const isPending = index > currentStepIndex;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isCompleted
                  ? 'bg-success/5 border border-success/20'
                  : isCurrent
                  ? 'bg-primary/5 border border-primary/20 shadow-sm'
                  : 'bg-surface-alt border border-transparent opacity-50'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isCompleted
                  ? 'bg-success/10'
                  : isCurrent
                  ? 'bg-primary/10'
                  : 'bg-gray-100'
              }`}>
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : (
                  <Icon className="w-5 h-5 text-text-muted" />
                )}
              </div>
              <span className={`text-sm font-medium ${
                isCompleted ? 'text-success' : isCurrent ? 'text-primary' : 'text-text-muted'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md mt-6">
        <div className="h-1.5 bg-surface-alt rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(completedSteps.length / (AGENT_STEPS.length - 1)) * 100}%` }}
          />
        </div>
        <p className="text-xs text-text-muted text-center mt-2">
          {completedSteps.length}/{AGENT_STEPS.length - 1} steps completed
        </p>
      </div>
    </div>
  );
}

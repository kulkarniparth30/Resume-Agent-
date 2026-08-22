import { useEffect, useState, useCallback } from 'react';
import { Bot, FileSearch, Brain, Target, CheckCircle2, Loader2, ArrowRight, PartyPopper } from 'lucide-react';

const AGENT_STEPS = [
  { id: 'parse', label: 'Parsing resume...', icon: FileSearch, duration: 2000 },
  { id: 'extract', label: 'Extracting skills...', icon: Brain, duration: 1500 },
  { id: 'match', label: 'Matching against job requirements...', icon: Target, duration: 2500 },
  { id: 'analyse', label: 'Running skill gap analysis...', icon: Brain, duration: 2000 },
  { id: 'score', label: 'Calculating ATS score...', icon: Target, duration: 1500 },
  { id: 'jobs', label: 'Searching live job listings...', icon: FileSearch, duration: 2000 },
];

const TOTAL_STEPS = AGENT_STEPS.length;

export default function LoadingAgent({ onComplete }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Step progression
  useEffect(() => {
    if (currentStepIndex >= TOTAL_STEPS) {
      setIsFinished(true);
      return;
    }

    const step = AGENT_STEPS[currentStepIndex];

    const timer = setTimeout(() => {
      setCompletedSteps((prev) => [...prev, step.id]);
      setCurrentStepIndex((prev) => prev + 1);
    }, step.duration);

    return () => clearTimeout(timer);
  }, [currentStepIndex]);

  // Countdown & auto-redirect after all steps finish
  useEffect(() => {
    if (!isFinished) return;

    if (countdown <= 0) {
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isFinished, countdown, onComplete]);

  const handleGoToDashboard = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  const progress = Math.min(completedSteps.length / TOTAL_STEPS, 1) * 100;

  return (
    <div className="flex flex-col items-center py-16">
      {/* Agent Avatar */}
      <div className="relative mb-8">
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${isFinished ? 'bg-success/10' : 'bg-primary/10'}`}>
          {isFinished ? (
            <PartyPopper className="w-10 h-10 text-success" />
          ) : (
            <Bot className="w-10 h-10 text-primary animate-pulse-slow" />
          )}
        </div>
        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center animate-pulse ${isFinished ? 'bg-success' : 'bg-success'}`}>
          <span className="w-2 h-2 rounded-full bg-white" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-dark mb-1">
        {isFinished ? '🎉 Analysis Complete!' : 'Agent is analysing...'}
      </h3>
      <p className="text-sm text-text-secondary mb-8">
        {isFinished
          ? `Redirecting to dashboard in ${countdown}s...`
          : 'Please wait while our AI processes your data'}
      </p>

      {/* Steps */}
      <div className="w-full max-w-md space-y-3">
        {AGENT_STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = index === currentStepIndex && !isCompleted;
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
            className={`h-full rounded-full transition-all duration-500 ease-out ${isFinished ? 'bg-success' : 'bg-primary'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-text-muted text-center mt-2">
          {completedSteps.length}/{TOTAL_STEPS} steps completed
        </p>
      </div>

      {/* View Dashboard Button — appears after completion */}
      {isFinished && (
        <button
          onClick={handleGoToDashboard}
          className="mt-8 flex items-center gap-2.5 px-8 py-4 bg-primary text-white font-bold text-base rounded-xl hover:bg-primary-light shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer animate-fade-in"
        >
          View Dashboard
          <ArrowRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

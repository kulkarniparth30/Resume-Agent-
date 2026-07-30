import { AlertTriangle, X } from 'lucide-react';

export default function FakeSkillAlert({ skill, reason, onDismiss }) {
  return (
    <div className="bg-danger/5 border border-danger/20 rounded-xl p-4 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-danger/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5 text-danger" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-danger">
              Unsupported Skill: {skill}
            </h4>
            {onDismiss && (
              <button
                onClick={() => onDismiss(skill)}
                className="p-1 text-text-muted hover:text-danger transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-sm text-text-secondary mt-1 leading-relaxed">
            {reason}
          </p>
          <div className="mt-3 flex gap-2">
            <button className="text-xs font-semibold px-3 py-1.5 bg-danger/10 text-danger rounded-lg hover:bg-danger/20 transition-colors cursor-pointer">
              Add Proof
            </button>
            <button className="text-xs font-semibold px-3 py-1.5 text-text-secondary hover:text-dark hover:bg-surface-alt rounded-lg transition-colors cursor-pointer">
              Remove Skill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

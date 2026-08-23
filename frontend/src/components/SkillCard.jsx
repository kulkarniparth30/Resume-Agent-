import { X, Sparkles } from 'lucide-react';

const variants = {
  owned: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  matching: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  suggested: {
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
  },
  missing: {
    bg: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500',
  },
  neutral: {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-500',
  },
};

export default function SkillCard({
  name,
  skill,
  children,
  variant,
  type = 'neutral',
  removable = false,
  onRemove,
  onClick,
  onLearnClick,
  className = ''
}) {
  // Resolve skill name from props
  const rawSkill = name || skill || children || '';
  const skillLabel = typeof rawSkill === 'object' ? (rawSkill.name || rawSkill.skill || JSON.stringify(rawSkill)) : String(rawSkill);

  // Resolve variant styling
  const chosenVariantKey = variant || type || 'neutral';
  const v = variants[chosenVariantKey] || variants.neutral;

  const handleClick = (e) => {
    if (onClick) onClick(skillLabel, e);
    if (onLearnClick) onLearnClick(skillLabel, e);
  };

  const isClickable = Boolean(onClick || onLearnClick);

  return (
    <span
      onClick={isClickable ? handleClick : undefined}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 select-none ${v.bg} ${
        isClickable ? 'cursor-pointer hover:shadow-sm hover:scale-105' : ''
      } ${className}`}
      title={onLearnClick ? `Click to find learning resources for ${skillLabel}` : undefined}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${v.dot}`} />
      <span>{skillLabel}</span>
      {onLearnClick && (
        <span className="text-[10px] text-red-500 underline ml-0.5 font-medium hover:text-red-700">
          Learn →
        </span>
      )}
      {removable && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(skillLabel);
          }}
          className="ml-0.5 p-0.5 rounded-full hover:bg-black/10 transition-colors cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}

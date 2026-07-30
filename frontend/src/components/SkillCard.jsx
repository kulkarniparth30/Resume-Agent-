import { X } from 'lucide-react';

const variants = {
  owned: {
    bg: 'bg-success/10',
    text: 'text-success',
    border: 'border-success/20',
    dot: 'bg-success',
  },
  suggested: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    border: 'border-primary/20',
    dot: 'bg-primary',
  },
  missing: {
    bg: 'bg-danger/10',
    text: 'text-danger',
    border: 'border-danger/20',
    dot: 'bg-danger',
  },
  neutral: {
    bg: 'bg-gray-100',
    text: 'text-dark-lighter',
    border: 'border-border',
    dot: 'bg-dark-lighter',
  },
};

export default function SkillCard({ name, variant = 'neutral', removable = false, onRemove, onClick, className = '' }) {
  const v = variants[variant] || variants.neutral;

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${v.bg} ${v.text} ${v.border} ${
        onClick ? 'cursor-pointer hover:shadow-sm hover:scale-105' : ''
      } ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${v.dot}`} />
      {name}
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(name);
          }}
          className="ml-0.5 p-0.5 rounded-full hover:bg-black/10 transition-colors cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}

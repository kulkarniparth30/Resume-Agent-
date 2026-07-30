import { Clock, Lightbulb, ArrowRight } from 'lucide-react';
import SkillCard from './SkillCard';

export default function ProjectCard({ name, description, skills_covered = [], estimated_time, onStart }) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-border p-5 card-hover group">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h4 className="font-bold text-dark group-hover:text-accent transition-colors">{name}</h4>
          <div className="flex items-center gap-1 mt-1 text-xs text-text-muted">
            <Clock className="w-3 h-3" />
            <span>{estimated_time}</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-text-secondary leading-relaxed mb-4">{description}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {skills_covered.map((skill) => (
          <SkillCard key={skill} name={skill} variant="suggested" />
        ))}
      </div>

      <button
        onClick={onStart}
        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-accent/10 text-accent rounded-lg hover:bg-accent hover:text-white transition-all cursor-pointer"
      >
        Start Building
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

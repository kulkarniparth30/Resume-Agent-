import { TrendingUp, DollarSign, Clock, Award } from 'lucide-react';

const roiStyles = {
  highest: { bg: 'bg-success/10', text: 'text-success', label: '🔥 Highest' },
  high: { bg: 'bg-primary/10', text: 'text-primary', label: '⬆ High' },
  medium: { bg: 'bg-warning/10', text: 'text-warning', label: '→ Medium' },
  low: { bg: 'bg-gray-100', text: 'text-text-secondary', label: '↓ Low' },
};

export default function SalaryChart({ data = {}, className = '' }) {
  const { current_range, skills = [] } = data;
  const sortedSkills = [...skills].sort((a, b) => {
    const order = { highest: 0, high: 1, medium: 2, low: 3 };
    return (order[a.roi] ?? 4) - (order[b.roi] ?? 4);
  });

  return (
    <div className={`bg-white rounded-xl shadow-md border border-border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-dark flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-success" />
            Salary Coach
          </h3>
          <p className="text-sm text-text-secondary mt-0.5">
            Current range: <span className="font-semibold text-dark">{current_range}</span>
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs text-text-muted">
          <Award className="w-4 h-4" />
          ROI Analysis
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Skill</th>
              <th className="text-left py-3 px-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />Salary Bump</span>
              </th>
              <th className="text-left py-3 px-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Weeks</span>
              </th>
              <th className="text-left py-3 px-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">ROI</th>
            </tr>
          </thead>
          <tbody>
            {sortedSkills.map((item, index) => {
              const roi = roiStyles[item.roi] || roiStyles.medium;
              const isHighest = item.roi === 'highest';
              return (
                <tr
                  key={item.skill}
                  className={`border-b border-border/50 transition-colors ${
                    isHighest ? 'bg-success/5 hover:bg-success/10' : 'hover:bg-surface-alt'
                  }`}
                >
                  <td className="py-3 px-3">
                    <span className={`font-semibold ${isHighest ? 'text-success' : 'text-dark'}`}>
                      {item.skill}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`font-bold ${isHighest ? 'text-success' : 'text-primary'}`}>
                      {item.bump}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-text-secondary font-medium">{item.weeks}w</td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${roi.bg} ${roi.text}`}>
                      {roi.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

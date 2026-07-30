import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const getBarColor = (importance) => {
  if (importance >= 4.5) return '#DC2626';
  if (importance >= 4.0) return '#D97706';
  if (importance >= 3.5) return '#1D4ED8';
  return '#64748B';
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-dark text-white px-4 py-3 rounded-xl shadow-xl border border-white/10 text-sm">
        <p className="font-semibold">{data.skill}</p>
        <p className="text-gray-300 mt-1">Importance: <span className="text-primary-light font-medium">{data.importance}/5.0</span></p>
        <p className="text-gray-300">Priority Rank: #{data.rank}</p>
      </div>
    );
  }
  return null;
};

export default function SkillGapChart({ data = [], onLearnClick }) {
  const chartData = [...data].sort((a, b) => b.importance - a.importance);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-dark">Skill Gap Analysis</h3>
          <p className="text-sm text-text-secondary mt-0.5">Skills you need to learn, ranked by importance</p>
        </div>
        <span className="text-xs font-medium px-3 py-1.5 bg-danger/10 text-danger rounded-full">
          {data.length} gaps found
        </span>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
            <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="skill" width={120} tick={{ fontSize: 13, fill: '#0F172A', fontWeight: 500 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
            <Bar dataKey="importance" radius={[0, 8, 8, 0]} barSize={28}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.importance)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Skill buttons below chart */}
      <div className="mt-4 space-y-2">
        {chartData.map((item) => (
          <div key={item.skill} className="flex items-center justify-between py-2 px-3 bg-surface-alt rounded-lg hover:bg-surface transition-colors">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-dark text-white text-xs font-bold flex items-center justify-center">
                {item.rank}
              </span>
              <span className="text-sm font-medium">{item.skill}</span>
              <span className="text-xs text-text-secondary">({item.importance}/5)</span>
            </div>
            <button
              onClick={() => onLearnClick?.(item.skill)}
              className="text-xs font-semibold px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors cursor-pointer"
            >
              Learn →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

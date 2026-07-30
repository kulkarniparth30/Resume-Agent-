import { useEffect, useState } from 'react';

export default function ATSScoreRing({ score = 0, size = 140, strokeWidth = 10, label = "ATS Score" }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  const getColor = (score) => {
    if (score >= 80) return '#059669';
    if (score >= 60) return '#D97706';
    return '#DC2626';
  };

  const getGrade = (score) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 200);
    return () => clearTimeout(timer);
  }, [score]);

  const color = getColor(score);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 1.5s ease-out',
              filter: `drop-shadow(0 0 6px ${color}40)`,
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>{Math.round(animatedScore)}</span>
          <span className="text-xs font-medium text-text-secondary">/100</span>
        </div>
      </div>
      <div className="mt-3 text-center">
        <p className="text-sm font-semibold text-dark">{label}</p>
        <span
          className="inline-block mt-1 text-xs font-bold px-2.5 py-0.5 rounded-full"
          style={{ backgroundColor: `${color}15`, color }}
        >
          Grade: {getGrade(score)}
        </span>
      </div>
    </div>
  );
}

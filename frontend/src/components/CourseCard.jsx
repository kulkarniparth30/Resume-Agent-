import { Star, ExternalLink, BookOpen } from 'lucide-react';

const platformColors = {
  Coursera: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Udemy: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  YouTube: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  edX: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  default: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
};

export default function CourseCard({ name, platform, rating, price, skill, link }) {
  const pColor = platformColors[platform] || platformColors.default;
  const isPaid = price && price !== 'Free' && price !== 'free';

  return (
    <div className="bg-white rounded-xl shadow-md border border-border p-5 card-hover group">
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${pColor.bg} ${pColor.text} ${pColor.border}`}>
          {platform}
        </span>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          isPaid ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
        }`}>
          {price || 'Free'}
        </span>
      </div>

      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h4 className="font-semibold text-dark text-sm leading-tight group-hover:text-primary transition-colors">{name}</h4>
          {skill && (
            <p className="text-xs text-text-secondary mt-1">Covers: {skill}</p>
          )}
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= Math.floor(rating) ? 'text-warning fill-warning' : 'text-gray-200'
            }`}
          />
        ))}
        <span className="text-xs font-medium text-text-secondary ml-1">{rating}</span>
      </div>

      <button
        onClick={() => link && window.open(link, '_blank')}
        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all cursor-pointer"
      >
        <ExternalLink className="w-4 h-4" />
        Enroll Now
      </button>
    </div>
  );
}

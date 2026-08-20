import { useState } from 'react';
import { Sparkles, Loader2, Check, X } from 'lucide-react';

export default function AIEnhanceButton({ onEnhance, label = 'Improve with AI', size = 'sm', className = '' }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [enhanced, setEnhanced] = useState('');
  const [error, setError] = useState('');

  const handleClick = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await onEnhance();
      if (result) {
        setEnhanced(result);
        setShowResult(true);
      }
    } catch (err) {
      setError(err?.response?.data?.detail || 'AI enhancement failed. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  if (size === 'icon') {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        title="Improve with AI"
        className={`p-1.5 text-accent/60 hover:text-accent hover:bg-accent/10 rounded-lg transition-all cursor-pointer disabled:opacity-50 ${className}`}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Sparkles className="w-3.5 h-3.5" />
        )}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`flex items-center gap-2 bg-accent hover:bg-accent-light text-white px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Enhancing...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            {label}
          </>
        )}
      </button>
      {error && (
        <div className="absolute top-full left-0 mt-2 w-64 p-3 bg-danger/10 border border-danger/20 rounded-lg text-xs text-danger font-medium z-20 animate-fade-in">
          {error}
        </div>
      )}
    </div>
  );
}

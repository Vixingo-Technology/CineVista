import React from 'react';
import { Star } from 'lucide-react';

interface RatingBadgeProps {
  platform: 'IMDb' | 'TMDB' | 'Letterboxd' | 'Avg';
  score: number;
}

export default function RatingBadge({ platform, score }: RatingBadgeProps) {
  let displayScore = score.toFixed(1);
  let maxScore = platform === 'TMDB' ? 100 : (platform === 'Letterboxd' ? 5 : 10);
  
  if (platform === 'TMDB') displayScore = Math.round(score).toString();

  const colors = {
    IMDb: 'bg-white/5 text-gray-300 border-white/10',
    TMDB: 'bg-white/5 text-gray-300 border-white/10',
    Letterboxd: 'bg-white/5 text-gray-300 border-white/10',
    Avg: 'bg-[#EAB308]/10 text-[#EAB308] border-[#EAB308]/20'
  };

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-semibold ${colors[platform]}`}>
      <span className="font-mono text-[10px] uppercase tracking-wider">{platform}</span>
      <div className="flex items-center gap-0.5">
        <Star className="w-3 h-3 fill-current" />
        <span>{displayScore}<span className="opacity-50 font-normal">/{maxScore}</span></span>
      </div>
    </div>
  );
}

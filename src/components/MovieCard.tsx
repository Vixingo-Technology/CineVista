import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { MovieListType } from '../types';
import RatingBadge from './RatingBadge';
import { useWatchlist } from '../hooks/useWatchlist';

interface MovieCardProps {
  movie: MovieListType;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const ratingImdb = movie.ratingImdb || 0;
  const ratingTmdb = movie.ratingTmdb || 0;
  const ratingLetterboxd = movie.ratingLetterboxd || 0;
  const avg = ((ratingImdb) + (ratingTmdb / 10) + (ratingLetterboxd * 2)) / 3;

  const { toggleWatchlist, isInWatchlist } = useWatchlist();
  const isSaved = isInWatchlist(movie.id || movie.title);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist(movie);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col h-full cursor-pointer"
    >
      <Link to={`/movie/${encodeURIComponent(movie.title)}`} className="flex-1 flex flex-col">
        <div 
          className="aspect-[2/3] w-full relative overflow-hidden flex flex-col items-center justify-center text-center bg-[#1A1A1C] rounded-lg mb-3 border border-white/5 group-hover:border-[#EAB308]/50 transition-colors"
          style={{ backgroundColor: movie.posterColor || '#1A1A1C' }}
        >
          {movie.posterUrl ? (
            <img src={movie.posterUrl} alt={movie.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B]/80 via-transparent to-transparent opacity-80" />
              <h3 className="relative z-10 text-2xl font-serif font-bold italic text-white/80 mix-blend-overlay tracking-tighter leading-tight drop-shadow-lg p-6">
                {movie.title}
              </h3>
            </>
          )}

          <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold border border-white/10 text-[#EAB308] z-20 flex items-center gap-1">
            ★ {avg.toFixed(1)} <span className="opacity-70 font-normal text-white">Avg</span>
          </div>

          <button 
            onClick={handleHeartClick}
            className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-[#EAB308]/20 transition-colors"
          >
            <Heart className={`w-3.5 h-3.5 transition-colors ${isSaved ? 'fill-[#EAB308] text-[#EAB308]' : 'text-white'}`} />
          </button>
        </div>
        
        <div className="flex flex-col flex-1 px-1">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-medium text-sm text-white line-clamp-1 group-hover:text-[#EAB308] transition-colors">
              {movie.title}
            </h3>
          </div>
          <p className="text-[10px] text-gray-500 mb-2">
            IMDb: {ratingImdb.toFixed(1)} • Lbxd: {ratingLetterboxd.toFixed(1)}
          </p>
          <p className="text-xs text-gray-400 line-clamp-2 flex-1">
            {movie.description}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

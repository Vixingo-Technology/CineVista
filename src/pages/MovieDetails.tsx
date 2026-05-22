import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, Film, UserCircle, Loader2, Play, X, Heart, Tv } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MovieDetailType } from '../types';
import RatingBadge from '../components/RatingBadge';
import Chatbot from '../components/Chatbot';
import { useWatchlist } from '../hooks/useWatchlist';

export default function MovieDetails() {
  const { id } = useParams<{ id: string }>(); // 'id' here is actually the movie title from the URL
  const [movie, setMovie] = useState<MovieDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const { toggleWatchlist, isInWatchlist } = useWatchlist();
  const isSaved = movie ? isInWatchlist(movie.id || movie.title) : false;

  useEffect(() => {
    async function fetchDetails() {
      if (!id) return;
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        const decodedTitle = decodeURIComponent(id);
        const apiKey = '15d2ea6d0dc1d476efbca3eba2b9bbfb';
        // id is the TMDB movie ID since we modified the listing to pass tmdb ID
        // wait, the previous code used title as id?
        // Let's check MovieDetails routing.
        let tmdbId = id;
        
        // If it's a fallback m1 style ID or doesn't look like a number, search by title
        if (isNaN(Number(tmdbId))) {
          const searchRes = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(decodedTitle)}`);
          const searchData = await searchRes.json();
          if (searchData.results && searchData.results.length > 0) {
             tmdbId = searchData.results[0].id.toString();
          } else {
             throw new Error("Movie not found on TMDB");
          }
        }

        const tmdbRes = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey}&append_to_response=videos,similar`);
        if (!tmdbRes.ok) throw new Error('TMDB API error');
        const m = await tmdbRes.json();
        
        const trailer = m.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') 
                     || m.videos?.results?.find((v: any) => v.site === 'YouTube');
                     
        let trailerUrl = "";
        let trailerThumbnail = "";
        if (trailer) {
           trailerUrl = `https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&mute=1`;
           trailerThumbnail = `https://img.youtube.com/vi/${trailer.key}/hqdefault.jpg`;
        }
        
        const similarMovies = (m.similar?.results || []).slice(0, 5).map((sim: any) => ({
           id: sim.id.toString(),
           title: sim.title,
           year: sim.release_date ? parseInt(sim.release_date.split('-')[0]) : 0,
           posterColor: "#1a1a1c",
           posterUrl: sim.poster_path ? `https://image.tmdb.org/t/p/w500${sim.poster_path}` : ""
        }));

        setMovie({
          id: m.id.toString(),
          title: m.title,
          year: m.release_date ? parseInt(m.release_date.split('-')[0]) : 0,
          genre: m.genres ? m.genres.map((g: any) => g.name).join(', ') : 'Unknown',
          director: "See credits", // TMDB requires a separate credits call for director, not fetching to save time
          runtime: m.runtime ? `${Math.floor(m.runtime/60)}h ${m.runtime%60}m` : "Unknown",
          ratingImdb: m.vote_average ? Number((m.vote_average).toFixed(1)) : 0,
          ratingTmdb: m.vote_average ? Math.round(m.vote_average * 10) : 0,
          ratingLetterboxd: m.vote_average ? Number((m.vote_average / 2).toFixed(1)) : 0,
          longDescription: m.overview || "No description available.",
          posterColor: "#1a1a1c",
          posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : "",
          trailerUrl: trailerUrl,
          trailerThumbnail: trailerThumbnail,
          similarMovies: similarMovies
        });
        setLoading(false);
        return;
      } catch (err: any) {
        console.warn("Falling back to local details API:", err);
        try {
          const response = await fetch(`/api/movies/${encodeURIComponent(id)}/details`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: decodeURIComponent(id) })
          });
          if (!response.ok) throw new Error('Failed to fetch movie details');
          const data = await response.json();
          setMovie(data);
        } catch (fallbackErr: any) {
          setError(fallbackErr.message);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-[#EAB308] bg-[#0A0A0B]">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="text-gray-400 font-medium">Fetching details...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#0A0A0B]">
        <div className="bg-red-950/30 border border-red-500/20 text-red-400 p-6 rounded-xl text-center max-w-md">
          <p className="mb-4">{error || "Movie not found"}</p>
          <Link to="/" className="inline-flex items-center text-red-300 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const ratingImdb = movie.ratingImdb || 0;
  const ratingTmdb = movie.ratingTmdb || 0;
  const ratingLetterboxd = movie.ratingLetterboxd || 0;
  const avg = ((ratingImdb) + (ratingTmdb / 10) + (ratingLetterboxd * 2)) / 3;

  return (
    <div className="pb-24 bg-[#0A0A0B] flex-1">
      {/* Backdrop */}
      <div 
        className="w-full h-[40vh] md:h-[50vh] relative overflow-hidden bg-[#1A1A1C]"
      >
        {movie.posterUrl && (
          <img src={movie.posterUrl} className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm" alt="Backdrop" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0B]/60 to-[#0A0A0B]" style={!movie.posterUrl ? { backgroundColor: movie.posterColor, opacity: 0.2 } : {}} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/60 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 w-full">
        <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-8 bg-[#0F0F10]/50 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Discover
        </Link>
        
        <div className="flex flex-col md:flex-row gap-10">
          {/* Poster */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full md:w-1/3 lg:w-1/4 shrink-0"
          >
            <div 
              className="aspect-[2/3] w-full rounded-lg border border-white/10 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center bg-[#1A1A1C]"
              style={{ backgroundColor: movie.posterColor || '#1A1A1C' }}
            >
              {movie.posterUrl ? (
                <img src={movie.posterUrl} alt={movie.title} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-transparent to-transparent opacity-80" />
                  <h2 className="relative z-10 text-4xl font-serif font-bold italic text-white/80 mix-blend-overlay tracking-tighter leading-tight drop-shadow-lg p-6">
                    {movie.title}
                  </h2>
                </>
              )}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 pt-4"
          >
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif font-light text-white mb-4 tracking-tight">
              {movie.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-gray-400 mb-8 font-medium text-sm">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[#EAB308]" /> {movie.year}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#EAB308]" /> {movie.runtime}</span>
              <span className="flex items-center gap-1.5"><Film className="w-4 h-4 text-[#EAB308]" /> {movie.genre}</span>
              <span className="flex items-center gap-1.5"><UserCircle className="w-4 h-4 text-[#EAB308]" /> {movie.director}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8">
              <div className="flex items-center gap-4 border border-white/5 bg-white/5 px-4 py-2 rounded-lg">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase font-bold tracking-widest leading-none mb-1">CINEVISTA SCORE</span>
                  <div className="flex items-end gap-1 leading-none">
                    <span className="text-2xl font-serif text-[#EAB308] font-bold">{avg.toFixed(1)}</span>
                    <span className="text-sm text-gray-500 mb-1">/10</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <RatingBadge platform="IMDb" score={ratingImdb} />
                <RatingBadge platform="TMDB" score={ratingTmdb} />
                <RatingBadge platform="Letterboxd" score={ratingLetterboxd} />
              </div>
              
              <button 
                onClick={() => setIsPlayerOpen(true)}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all border-0 w-fit bg-gradient-to-r from-[#EAB308] to-[#F59E0B] text-black hover:from-[#F59E0B] hover:to-[#EAB308] shadow-[0_0_24px_rgba(234,179,8,0.35)] hover:shadow-[0_0_32px_rgba(234,179,8,0.5)] active:scale-95"
              >
                <Tv className="w-4 h-4" />
                Watch Now
              </button>

              <button 
                onClick={() => toggleWatchlist(movie)}
                className={`flex items-center justify-center gap-2 px-6 py-2 rounded-full font-bold text-sm transition-all border w-fit ${
                  isSaved 
                    ? 'bg-[#EAB308]/10 text-[#EAB308] border-[#EAB308]/20 hover:bg-[#EAB308]/20' 
                    : 'bg-white text-black border-white hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#EAB308]' : ''}`} />
                {isSaved ? 'In Watchlist' : 'Add to Watchlist'}
              </button>
            </div>

            <div className="prose prose-invert max-w-none">
              <h3 className="text-xl font-serif text-white mb-4">Synopsis</h3>
              <p className="text-gray-400 text-base leading-relaxed mb-8">
                {movie.longDescription || movie.description}
              </p>
              
              {movie.trailerUrl && (
                <div 
                  onClick={() => setIsTrailerOpen(true)}
                  className="group relative rounded-xl overflow-hidden cursor-pointer aspect-video bg-black max-w-md border border-white/10 hover:border-[#EAB308]/50 transition-all"
                >
                  {movie.trailerThumbnail ? (
                    <img src={movie.trailerThumbnail} alt="Trailer" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                  ) : (
                    <div className="w-full h-full bg-[#1A1A1C] opacity-80" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#EAB308] text-black flex items-center justify-center translate-y-2 group-hover:translate-y-0 opacity-90 group-hover:opacity-100 transition-all shadow-[0_0_20px_rgba(234,179,8,0.4)]">
                      <Play className="w-5 h-5 ml-1" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Similar Movies */}
        {movie.similarMovies && movie.similarMovies.length > 0 && (
          <div className="mt-20 border-t border-white/10 pt-12">
            <h3 className="text-2xl font-serif text-white mb-8">Similar Masterpieces</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {movie.similarMovies.map(sm => (
                <Link 
                  key={sm.id} 
                  to={`/movie/${encodeURIComponent(sm.title)}`}
                  className="group block relative rounded-lg overflow-hidden aspect-[2/3] border border-white/5 hover:border-[#EAB308]/50 transition-all bg-[#1A1A1C]"
                  style={{ backgroundColor: sm.posterColor || '#1A1A1C' }}
                >
                  {sm.posterUrl && (
                     <img src={sm.posterUrl} alt={sm.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/40 to-transparent opacity-90" />
                  <div className="absolute inset-0 p-4 flex flex-col justify-end z-10">
                    <h4 className="text-white font-medium text-sm leading-tight group-hover:text-[#EAB308] transition-colors">{sm.title}</h4>
                    <span className="text-gray-500 text-[10px] font-mono mt-1">{sm.year}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Chatbot />

      {/* Trailer Modal */}
      <AnimatePresence>
        {isTrailerOpen && movie.trailerUrl && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12 bg-[#0A0A0B]/90 backdrop-blur-sm"
            onClick={() => setIsTrailerOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsTrailerOpen(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-[#EAB308] hover:text-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <iframe 
                src={movie.trailerUrl.includes('?') ? movie.trailerUrl.replace('youtube.com', 'youtube-nocookie.com') + '&autoplay=1&mute=1' : movie.trailerUrl.replace('youtube.com', 'youtube-nocookie.com') + '?autoplay=1&mute=1'}
                title="Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
                style={{ backgroundColor: 'black' }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streaming Player Modal */}
      <AnimatePresence>
        {isPlayerOpen && movie && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#000]/95 backdrop-blur-md"
            onClick={() => setIsPlayerOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full h-full max-w-[100vw] max-h-[100vh] md:max-w-[92vw] md:max-h-[90vh] md:rounded-2xl overflow-hidden shadow-2xl border border-white/10"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsPlayerOpen(false)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-[#EAB308] hover:text-black transition-colors backdrop-blur-sm border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                <Tv className="w-3.5 h-3.5 text-[#EAB308]" />
                <span className="text-xs font-semibold text-white/90 tracking-wide">{movie.title}</span>
              </div>
              <iframe width="100%" height="100%" allowFullScreen frameBorder="0"
                src={`https://vidfast.pro/movie/${movie.id}?autoPlay=true`}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

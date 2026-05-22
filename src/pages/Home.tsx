import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { MovieListType } from '../types';
import MovieCard from '../components/MovieCard';
import Chatbot from '../components/Chatbot';

export default function Home() {
  const [movies, setMovies] = useState<MovieListType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'discover';
  const searchQuery = searchParams.get('q') || '';

  const fetchMovies = async (pageNum: number, isNewSearch = false) => {
    setLoading(true);
    try {
      const apiKey = '15d2ea6d0dc1d476efbca3eba2b9bbfb';
      let tmdbUrl = '';
      
      if (searchQuery) {
        tmdbUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(searchQuery)}&page=${pageNum}&include_adult=false`;
      } else {
        if (currentTab === 'top-rated') {
          tmdbUrl = `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=en-US&page=${pageNum}`;
        } else if (currentTab === 'new-releases') {
          // Get movies currently playing or upcoming, sorted by release date
          tmdbUrl = `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=en-US&page=${pageNum}`;
        } else {
          // Discover
          tmdbUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=${pageNum}`;
        }
      }

      const response = await fetch(tmdbUrl);
      if (!response.ok) throw new Error('TMDB API Error');
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const mapped: MovieListType[] = data.results.map((m: any) => ({
          id: m.id.toString(),
          title: m.title,
          year: m.release_date ? parseInt(m.release_date.split('-')[0]) : 0,
          posterColor: "#1a1a1c",
          posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : "",
          ratingImdb: m.vote_average ? Number(m.vote_average.toFixed(1)) : 0,
          ratingTmdb: m.vote_average ? Math.round(m.vote_average * 10) : 0,
          ratingLetterboxd: m.vote_average ? Number((m.vote_average / 2).toFixed(1)) : 0,
          description: m.overview || "No description available."
        }));
        
        if (isNewSearch) {
          setMovies(mapped);
        } else {
          setMovies(prev => [...prev, ...mapped]);
        }
        setHasMore(pageNum < data.total_pages);
      } else {
        if (isNewSearch) setMovies([]);
        setHasMore(false);
      }
    } catch (err: any) {
      console.warn("Failed to fetch movies from TMDB:", err);
      // Fallback
      if (pageNum === 1) {
        try {
          const fallbackRes = await fetch('/api/movies/popular', { method: 'POST' });
          const fallbackData = await fallbackRes.json();
          setMovies(fallbackData);
        } catch (e: any) {
          setError(e.message);
        }
      }
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchMovies(1, true);
  }, [currentTab, searchQuery]);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMovies(nextPage, false);
    }
  };

  const displayedMovies = movies;

  return (
    <div className="relative flex-1 flex flex-col pb-24 bg-[#0A0A0B]">
      {/* Hero Section */}
      <section className="relative sm:mx-8 sm:mt-8 rounded-2xl overflow-hidden bg-[#1A1A1C] border border-white/5 h-[300px] sm:h-[400px]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0B] via-[#0A0A0B]/60 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center" />
        
        <div className="relative z-20 p-8 flex flex-col justify-center h-full max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-[#EAB308] text-black text-[10px] font-bold px-2 py-0.5 rounded">FEATURED</span>
            <span className="text-xs text-gray-300 font-medium tracking-wide">CINEMA CURATED</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-white mb-6">
            Discover your next <span className="text-[#EAB308] italic">masterpiece.</span>
          </h1>
          <p className="text-sm md:text-base text-gray-400 max-w-xl leading-relaxed">
            CineVista combines ratings from IMDb, TMDB, and Letterboxd to bring you the ultimate curated film experience. Chat with our cinematic AI to find exactly what you're looking for.
          </p>
        </div>
      </section>

      {/* Movies Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="flex items-end justify-between border-b border-white/5 pb-3 mb-8">
          <h2 className="text-2xl font-serif text-white">
            {searchQuery 
              ? `Results for "${searchQuery}"` 
              : currentTab === 'top-rated' 
                ? 'Highest Rated' 
                : currentTab === 'new-releases' 
                  ? 'Latest Hits' 
                  : 'Trending This Week'}
          </h2>
          <span className="text-xs text-[#EAB308] uppercase tracking-widest font-medium cursor-pointer">
            {searchQuery ? `${displayedMovies.length} found` : 'View Full Catalog'}
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#EAB308]">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="text-gray-400 font-medium">Curating top movies...</p>
          </div>
        ) : error ? (
          <div className="bg-red-950/30 border border-red-500/20 text-red-400 p-6 rounded-xl text-center">
            <p>Oops! {error}</p>
          </div>
        ) : displayedMovies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <p className="text-lg">No movies found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayedMovies.map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-full font-medium transition-colors border border-white/10 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More Cinema'}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <Chatbot />
    </div>
  );
}

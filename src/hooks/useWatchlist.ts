import { useState, useEffect, useCallback } from 'react';
import { MovieListType } from '../types';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<any[]>(() => {
    try {
      const item = window.localStorage.getItem('stitch_watchlist');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      return [];
    }
  });

  useEffect(() => {
    const handleStorage = () => {
      try {
        const item = window.localStorage.getItem('stitch_watchlist');
        if (item) setWatchlist(JSON.parse(item));
      } catch (e) {}
    };
    window.addEventListener('stitch_watchlist_updated', handleStorage);
    return () => window.removeEventListener('stitch_watchlist_updated', handleStorage);
  }, []);

  const toggleWatchlist = useCallback((movie: any) => {
    try {
      const currentItem = window.localStorage.getItem('stitch_watchlist');
      let currentList: any[] = currentItem ? JSON.parse(currentItem) : [];
      
      const exists = currentList.some(m => (m.id === movie.id || m.title === movie.title));
      if (exists) {
        currentList = currentList.filter(m => !(m.id === movie.id || m.title === movie.title));
      } else {
        currentList.push({
          id: movie.id || movie.title,
          title: movie.title,
          year: movie.year,
          posterColor: movie.posterColor,
          ratingImdb: movie.ratingImdb || 0,
          ratingTmdb: movie.ratingTmdb || 0,
          ratingLetterboxd: movie.ratingLetterboxd || 0,
          description: movie.description || ""
        });
      }
      window.localStorage.setItem('stitch_watchlist', JSON.stringify(currentList));
      setWatchlist(currentList);
      window.dispatchEvent(new Event('stitch_watchlist_updated'));
    } catch (e) {}
  }, []);

  const isInWatchlist = useCallback((idOrTitle: string) => {
    return watchlist.some(m => m.id === idOrTitle || m.title === idOrTitle);
  }, [watchlist]);

  return { watchlist, toggleWatchlist, isInWatchlist };
}

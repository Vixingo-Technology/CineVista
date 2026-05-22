import { Routes, Route, Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Film, User, Search } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'discover';
  const initialSearch = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}&tab=${currentTab}`);
    } else {
      navigate(`/?tab=${currentTab}`);
    }
  };

  const handleTabClick = (tab: string) => {
    setSearchQuery('');
    navigate(`/?tab=${tab}`);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white font-sans selection:bg-[#EAB308]/30 flex flex-col">
      <header className="sticky top-0 z-50 bg-[#0F0F10] border-b border-white/10 h-16 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" onClick={() => handleTabClick('discover')} className="flex items-center gap-2">
              <Film className="w-6 h-6 text-[#EAB308]" />
              <span className="text-2xl font-serif font-bold tracking-tighter text-[#EAB308]">CINE<span className="text-white">VISTA</span></span>
            </Link>
            <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-400">
              <button onClick={() => handleTabClick('discover')} className={`transition-colors ${currentTab === 'discover' ? 'text-white border-b-2 border-[#EAB308] pb-1' : 'hover:text-white'}`}>Discover</button>
              <button onClick={() => handleTabClick('top-rated')} className={`transition-colors ${currentTab === 'top-rated' ? 'text-white border-b-2 border-[#EAB308] pb-1' : 'hover:text-white'}`}>Top Rated</button>
              <button onClick={() => handleTabClick('new-releases')} className={`transition-colors ${currentTab === 'new-releases' ? 'text-white border-b-2 border-[#EAB308] pb-1' : 'hover:text-white'}`}>New Releases</button>
            </nav>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="w-4 h-4 text-gray-400 absolute left-3" />
              <input 
                type="text" 
                placeholder="Search movies..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-sm w-64 focus:outline-none focus:border-[#EAB308]/50 transition-colors placeholder:text-gray-500 text-white" 
              />
            </form>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#EAB308] to-[#92400E] flex items-center justify-center text-xs font-bold text-white shadow-lg overflow-hidden">
              <User className="w-4 h-4 text-white/80" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
        </Routes>
      </main>

      {/* Bottom Micro-Bar */}
      <footer className="h-10 bg-[#0A0A0B] border-t border-white/5 px-4 sm:px-8 flex items-center justify-between text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-auto">
        <div className="flex gap-4 sm:gap-8">
          <span>CineVista Platform</span>
          <span className="hidden sm:inline">Global Database</span>
        </div>
        <div className="flex gap-4">
          <span className="hidden sm:inline">Privacy</span>
          <span className="hidden sm:inline">Terms</span>
          <span className="text-[#EAB308]">v2.1.0 Stable</span>
        </div>
      </footer>
    </div>
  );
}

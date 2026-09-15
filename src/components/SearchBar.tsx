import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Loader2, Compass, History } from 'lucide-react';
import { GeocodingResult } from '../types';
import { searchGeocoding, POPULAR_CITIES } from '../utils/api';

interface SearchBarProps {
  onSelectCity: (city: GeocodingResult) => void;
  onUseCurrentLocation: () => void;
  isLoadingGeo: boolean;
  selectedCity: GeocodingResult | null;
}

const RECENT_SEARCHES_KEY = 'weather_recent_cities_v1';

export const SearchBar: React.FC<SearchBarProps> = ({
  onSelectCity,
  onUseCurrentLocation,
  isLoadingGeo,
  selectedCity,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [recentCities, setRecentCities] = useState<GeocodingResult[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentCities(JSON.parse(stored).slice(0, 5));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveRecentCity = (city: GeocodingResult) => {
    try {
      const filtered = recentCities.filter(
        (c) => c.name.toLowerCase() !== city.name.toLowerCase() || c.country !== city.country
      );
      const updated = [city, ...filtered].slice(0, 5);
      setRecentCities(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!val.trim() || val.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchGeocoding(val, 5);
        setSuggestions(results);
        setIsOpen(true);
      } catch (err) {
        console.error('Failed to search suggestions:', err);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 280);
  };

  const handleSelect = (city: GeocodingResult) => {
    setQuery(`${city.name}${city.country ? `, ${city.country}` : ''}`);
    setSuggestions([]);
    setIsOpen(false);
    saveRecentCity(city);
    onSelectCity(city);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // If suggestions are visible, take the first one
    if (suggestions.length > 0) {
      handleSelect(suggestions[0]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchGeocoding(query.trim(), 1);
      if (results && results.length > 0) {
        handleSelect(results[0]);
      } else {
        // Pass dummy city with original name to trigger city not found in parent
        onSelectCity({
          id: -1,
          name: query.trim(),
          latitude: 0,
          longitude: 0,
        });
      }
    } catch {
      onSelectCity({
        id: -1,
        name: query.trim(),
        latitude: 0,
        longitude: 0,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const clearInput = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <section id="search-section" className="w-full max-w-4xl mx-auto space-y-3">
      {/* Main Search Input Form */}
      <div ref={wrapperRef} className="relative">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <div className="relative w-full flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              id="city-search-input"
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={() => setIsOpen(true)}
              placeholder="Search any city or region worldwide (e.g. Kyoto, Seattle, Oslo)..."
              autoComplete="off"
              className="w-full pl-12 pr-28 py-3.5 bg-slate-900/90 hover:bg-slate-900 text-slate-100 placeholder-slate-400 text-sm md:text-base rounded-2xl border border-slate-700/80 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 shadow-xl shadow-black/20 outline-none transition-all duration-200"
            />
            {query && (
              <button
                type="button"
                onClick={clearInput}
                className="absolute right-20 p-1 text-slate-400 hover:text-slate-200 rounded-full hover:bg-slate-800 transition-colors"
                aria-label="Clear search input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="absolute right-2.5 flex items-center gap-1.5">
              <button
                id="search-submit-btn"
                type="submit"
                disabled={isSearching || !query.trim()}
                aria-label="Submit search"
                className="px-3 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-semibold shadow-md shadow-sky-500/30 transition-all disabled:opacity-40 disabled:hover:bg-sky-500 flex items-center gap-1"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
              </button>
            </div>
          </div>
        </form>

        {/* Suggestion Dropdown */}
        {isOpen && (suggestions.length > 0 || (query.length === 0 && recentCities.length > 0)) && (
          <div
            id="search-suggestions-dropdown"
            className="absolute left-0 right-0 top-full mt-2 bg-slate-900/95 border border-slate-700/90 rounded-2xl shadow-2xl backdrop-blur-xl z-50 overflow-hidden py-2 divide-y divide-slate-800/60"
          >
            {suggestions.length > 0 ? (
              <div>
                <div className="px-4 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Matching Locations
                </div>
                {suggestions.map((city) => (
                  <button
                    key={`${city.id}-${city.name}-${city.latitude}`}
                    type="button"
                    onClick={() => handleSelect(city)}
                    className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-slate-800/80 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-colors">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-100 group-hover:text-sky-300 transition-colors">
                          {city.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {[city.admin1, city.country].filter(Boolean).join(', ')}
                        </div>
                      </div>
                    </div>
                    {city.country_code && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {city.country_code}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ) : null}

            {query.length === 0 && recentCities.length > 0 && (
              <div>
                <div className="px-4 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" />
                  Recent Searches
                </div>
                {recentCities.map((city) => (
                  <button
                    key={`recent-${city.id}-${city.name}`}
                    type="button"
                    onClick={() => handleSelect(city)}
                    className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-slate-800/80 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-colors">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-200 group-hover:text-sky-300">
                          {city.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {[city.admin1, city.country].filter(Boolean).join(', ')}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Select Chips & Geolocation Trigger */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        <button
          id="btn-current-location"
          type="button"
          onClick={onUseCurrentLocation}
          disabled={isLoadingGeo}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-sky-400 hover:text-sky-300 border border-sky-500/20 hover:border-sky-500/40 transition-all font-medium disabled:opacity-50"
        >
          {isLoadingGeo ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Compass className="w-3.5 h-3.5 text-sky-400" />
          )}
          <span>Current Location</span>
        </button>

        <span className="text-slate-500 hidden sm:inline">|</span>
        <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">Trending:</span>

        {POPULAR_CITIES.map((city) => {
          const isSelected = selectedCity?.name.toLowerCase() === city.name.toLowerCase();
          return (
            <button
              key={`popular-${city.id}`}
              id={`popular-city-${city.name.toLowerCase()}`}
              type="button"
              onClick={() => onSelectCity(city)}
              className={`px-3 py-1 rounded-xl transition-all border font-medium ${
                isSelected
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 font-semibold'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
              }`}
            >
              {city.name}
            </button>
          );
        })}
      </div>
    </section>
  );
};

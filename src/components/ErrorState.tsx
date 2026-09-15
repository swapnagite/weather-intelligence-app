import React from 'react';
import { AlertTriangle, RefreshCw, MapPin, Search } from 'lucide-react';
import { POPULAR_CITIES } from '../utils/api';
import { GeocodingResult } from '../types';

interface ErrorStateProps {
  message: string;
  cityName?: string;
  onRetry: () => void;
  onSelectCity: (city: GeocodingResult) => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  cityName,
  onRetry,
  onSelectCity,
}) => {
  const isCityNotFound =
    message.toLowerCase().includes('not found') ||
    message.toLowerCase().includes('no location') ||
    (cityName && cityName.length > 0);

  return (
    <div
      id="weather-error-state"
      className="p-8 md:p-12 rounded-3xl bg-slate-900/90 border border-slate-800 text-center max-w-2xl mx-auto space-y-6 shadow-2xl backdrop-blur-xl"
    >
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
          {isCityNotFound ? 'Location Not Found' : 'Weather Service Error'}
        </h3>
        <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
          {cityName
            ? `We couldn't find any geographical coordinates for "${cityName}". Please double-check spelling or try a larger neighboring municipality.`
            : message || 'Unable to retrieve weather data from Open-Meteo services at this time.'}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          id="btn-error-retry"
          onClick={onRetry}
          className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-all shadow-lg shadow-sky-500/25 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      </div>

      {/* Recommended fallback cities */}
      <div className="pt-4 border-t border-slate-800 space-y-3">
        <span className="text-xs font-semibold text-slate-400 block">
          Or explore weather for one of these major hubs:
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {POPULAR_CITIES.map((city) => (
            <button
              key={`err-pop-${city.id}`}
              onClick={() => onSelectCity(city)}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              <span>{city.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

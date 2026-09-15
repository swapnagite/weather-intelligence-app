import React from 'react';
import { CloudSun, RotateCw, Sparkles } from 'lucide-react';
import { TemperatureUnit } from '../types';

interface HeaderProps {
  tempUnit: TemperatureUnit;
  onToggleUnit: (unit: TemperatureUnit) => void;
  onRefresh: () => void;
  loading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  tempUnit,
  onToggleUnit,
  onRefresh,
  loading,
}) => {
  return (
    <header id="app-header" className="w-full border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white">
            <CloudSun className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white font-['Space_Grotesk']">
                Weather Intelligence
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Sparkles className="w-3 h-3" />
                Live Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Precise Open-Meteo forecasts & daily smart planning
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Unit Toggle */}
          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 shadow-inner">
            <button
              id="unit-celsius-btn"
              onClick={() => onToggleUnit('C')}
              aria-label="Switch to Celsius"
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                tempUnit === 'C'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              °C
            </button>
            <button
              id="unit-fahrenheit-btn"
              onClick={() => onToggleUnit('F')}
              aria-label="Switch to Fahrenheit"
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                tempUnit === 'F'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              °F
            </button>
          </div>

          {/* Refresh Button */}
          <button
            id="refresh-weather-btn"
            onClick={onRefresh}
            disabled={loading}
            aria-label="Refresh weather data"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors disabled:opacity-50"
            title="Refresh forecast"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};

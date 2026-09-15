import React from 'react';
import {
  MapPin,
  Wind,
  Compass,
  ArrowUp,
  ArrowDown,
  Clock,
  Droplets,
  Calendar,
} from 'lucide-react';
import {
  CurrentWeather,
  GeocodingResult,
  TemperatureUnit,
  WeatherConditionMeta,
} from '../types';
import { formatTemp, formatWind, getWindCompass } from '../utils/weatherIntelligence';
import { WeatherIcon } from './WeatherIcon';

interface CurrentWeatherCardProps {
  city: GeocodingResult;
  current: CurrentWeather;
  condition: WeatherConditionMeta;
  todayMax: number;
  todayMin: number;
  timezone?: string;
  tempUnit: TemperatureUnit;
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  city,
  current,
  condition,
  todayMax,
  todayMin,
  timezone,
  tempUnit,
}) => {
  // Format local time from timezone or current time
  const getFormattedLocalTime = () => {
    try {
      if (timezone) {
        return new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }).format(new Date());
      }
    } catch {
      // fallback
    }
    return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getFormattedDate = () => {
    try {
      if (timezone) {
        return new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        }).format(new Date());
      }
    } catch {
      // fallback
    }
    return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const localTime = getFormattedLocalTime();
  const localDate = getFormattedDate();
  const windCompass = getWindCompass(current.winddirection);

  return (
    <div
      id="current-weather-card"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 p-6 md:p-8 shadow-2xl backdrop-blur-xl"
    >
      {/* Dynamic atmospheric ambient glow */}
      <div
        className={`absolute -top-24 -right-24 w-80 h-80 rounded-full bg-gradient-to-br ${condition.accentColor} opacity-15 blur-3xl pointer-events-none`}
      />

      <div className="relative z-10 flex flex-col justify-between h-full gap-6">
        {/* Top bar: City location & Local Time */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight">
                  {city.name}
                </h2>
                {city.country_code && (
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {city.country_code}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {[city.admin1, city.country].filter(Boolean).join(', ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/50">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              <span>{localDate}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/50">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>{localTime}</span>
            </div>
          </div>
        </div>

        {/* Center: Main Temperature, Condition, & Weather Icon */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7 flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/90 border border-slate-700/60 flex items-center justify-center text-white shadow-xl shadow-black/40">
                <WeatherIcon
                  name={condition.iconName}
                  className={`w-14 h-14 md:w-16 md:h-16 ${condition.badgeText}`}
                />
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl md:text-7xl font-black tracking-tighter text-white font-['Space_Grotesk']">
                  {Math.round(tempUnit === 'F' ? (current.temperature * 9) / 5 + 32 : current.temperature)}
                </span>
                <span className="text-2xl md:text-3xl font-light text-slate-400">
                  °{tempUnit}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${condition.badgeBg} ${condition.badgeText}`}
                >
                  {condition.label}
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  {condition.description}
                </span>
              </div>
            </div>
          </div>

          {/* Right Metrics Grid: High/Low, Wind, Day Phase */}
          <div className="md:col-span-5 grid grid-cols-2 gap-3">
            {/* Daily Range */}
            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                Today's Range
              </span>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs font-semibold text-rose-400">
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>{formatTemp(todayMax, tempUnit)}</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-sky-400">
                  <ArrowDown className="w-3.5 h-3.5" />
                  <span>{formatTemp(todayMin, tempUnit)}</span>
                </div>
              </div>
            </div>

            {/* Wind Metrics */}
            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-sky-400" />
                Wind Speed
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-sm font-bold text-white">
                  {formatWind(current.windspeed, tempUnit)}
                </span>
                <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700 flex items-center gap-0.5">
                  <Compass className="w-2.5 h-2.5" />
                  {windCompass} ({current.winddirection}°)
                </span>
              </div>
            </div>

            {/* Daytime/Nighttime */}
            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-slate-400">Day Cycle</span>
              <div className="mt-2 flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    current.is_day ? 'bg-amber-400 shadow-amber-400/50 shadow-sm' : 'bg-indigo-400'
                  }`}
                />
                <span className="text-xs font-semibold text-slate-200">
                  {current.is_day ? 'Daytime' : 'Nighttime'}
                </span>
              </div>
            </div>

            {/* Precipitation indicator */}
            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-sky-400" />
                Condition Type
              </span>
              <div className="mt-2 capitalize text-xs font-semibold text-slate-200">
                {condition.category}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

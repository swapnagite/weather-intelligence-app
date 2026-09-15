import React from 'react';
import { Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { ProcessedDayForecast, TemperatureUnit } from '../types';
import { formatTemp } from '../utils/weatherIntelligence';
import { WeatherIcon } from './WeatherIcon';

interface ForecastSectionProps {
  daily: ProcessedDayForecast[];
  tempUnit: TemperatureUnit;
  selectedIndex: number;
  onSelectDay: (index: number) => void;
}

export const ForecastSection: React.FC<ForecastSectionProps> = ({
  daily,
  tempUnit,
  selectedIndex,
  onSelectDay,
}) => {
  if (!daily || daily.length === 0) return null;

  // Calculate global min and max across all 7 days for the temperature bars
  const allMax = Math.max(...daily.map((d) => d.maxTemp));
  const allMin = Math.min(...daily.map((d) => d.minTemp));
  const globalRange = Math.max(allMax - allMin, 1);

  return (
    <section id="forecast-section" className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Calendar className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
            7-Day Weather Forecast
          </h3>
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">
          Click a day card to inspect details
        </span>
      </div>

      {/* Forecast Cards Grid (7 Days) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {daily.map((day, idx) => {
          const isSelected = selectedIndex === idx;
          const { condition } = day;

          // Compute relative min/max bar percentages
          const leftPercent = Math.max(0, Math.min(100, ((day.minTemp - allMin) / globalRange) * 100));
          const widthPercent = Math.max(15, Math.min(100, ((day.maxTemp - day.minTemp) / globalRange) * 100));

          return (
            <div
              key={day.date}
              id={`forecast-card-day-${idx}`}
              onClick={() => onSelectDay(idx)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelectDay(idx);
                }
              }}
              className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between select-none relative overflow-hidden group ${
                isSelected
                  ? 'bg-slate-850 border-sky-500 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/50 -translate-y-0.5'
                  : 'bg-slate-900/70 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Day Header */}
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      idx === 0 ? 'text-sky-400' : 'text-slate-200'
                    }`}
                  >
                    {day.dayName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {day.fullDateStr.split(',')[0]}
                  </span>
                </div>

                {/* Weather Icon & Condition */}
                <div className="my-3 flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border ${condition.badgeBg} group-hover:scale-105 transition-transform duration-200`}
                  >
                    <WeatherIcon
                      name={condition.iconName}
                      className={`w-7 h-7 ${condition.badgeText}`}
                    />
                  </div>
                  <span className="mt-2 text-[11px] font-semibold text-slate-300 text-center line-clamp-1">
                    {condition.label}
                  </span>
                </div>
              </div>

              {/* Temperatures */}
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-rose-400 flex items-center gap-0.5">
                    <ArrowUp className="w-3 h-3" />
                    {formatTemp(day.maxTemp, tempUnit)}
                  </span>
                  <span className="text-sky-400 flex items-center gap-0.5">
                    <ArrowDown className="w-3 h-3" />
                    {formatTemp(day.minTemp, tempUnit)}
                  </span>
                </div>

                {/* Visual Temperature Range Bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                  <div
                    className="absolute h-full rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-rose-400"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                  />
                </div>
              </div>

              {/* Highlight selection marker */}
              {isSelected && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-sky-500 rounded-b-full shadow-sm shadow-sky-400" />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

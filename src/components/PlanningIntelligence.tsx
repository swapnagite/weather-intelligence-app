import React from 'react';
import {
  Sparkles,
  Umbrella,
  Shirt,
  Wind,
  Compass,
  AlertTriangle,
  Sun,
  Flame,
  CloudSnow,
  TrendingUp,
  TrendingDown,
  CloudRain,
  CheckCircle2,
} from 'lucide-react';
import {
  PlanningRecommendation,
  WeatherIntelligenceSummary,
  TemperatureUnit,
} from '../types';
import { formatTemp } from '../utils/weatherIntelligence';
import { WeatherIcon } from './WeatherIcon';

interface PlanningIntelligenceProps {
  intelligence: WeatherIntelligenceSummary;
  tempUnit: TemperatureUnit;
}

export const PlanningIntelligence: React.FC<PlanningIntelligenceProps> = ({
  intelligence,
  tempUnit,
}) => {
  const { recommendations, warmestDay, coolestDay, rainExpectedDays, outdoorActivityScore } =
    intelligence;

  const getSeverityClasses = (severity: PlanningRecommendation['severity']) => {
    switch (severity) {
      case 'alert':
        return {
          cardBg: 'bg-rose-950/30 border-rose-500/40 hover:border-rose-500/60',
          iconBg: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        };
      case 'warning':
        return {
          cardBg: 'bg-amber-950/30 border-amber-500/40 hover:border-amber-500/60',
          iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
      case 'success':
        return {
          cardBg: 'bg-emerald-950/30 border-emerald-500/40 hover:border-emerald-500/60',
          iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
      case 'info':
      default:
        return {
          cardBg: 'bg-slate-900/70 border-slate-800 hover:border-slate-700',
          iconBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
          badge: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
        };
    }
  };

  return (
    <section id="planning-intelligence-section" className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
            Weather Intelligence & Planning Recommendations
          </h3>
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">
          Contextual advice based on current & 7-day outlook
        </span>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec) => {
          const styling = getSeverityClasses(rec.severity);
          return (
            <div
              key={rec.id}
              id={`rec-card-${rec.id}`}
              className={`p-4 md:p-5 rounded-2xl border ${styling.cardBg} transition-all duration-200 flex flex-col justify-between backdrop-blur-md shadow-lg group`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border ${styling.iconBg}`}
                  >
                    <WeatherIcon name={rec.icon} className="w-5 h-5" />
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${styling.badge}`}
                  >
                    {rec.badge}
                  </span>
                </div>

                <h4 className="mt-3.5 text-sm font-bold text-white tracking-tight">
                  {rec.title}
                </h4>
                <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                  {rec.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly Intelligence Digest Strip */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/90 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Warmest Day */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400">Warmest Peak</div>
            <div className="text-xs font-bold text-slate-100">
              {warmestDay.dayName} ({formatTemp(warmestDay.temp, tempUnit)})
            </div>
          </div>
        </div>

        {/* Coolest Day */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
            <TrendingDown className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400">Coolest Low</div>
            <div className="text-xs font-bold text-slate-100">
              {coolestDay.dayName} ({formatTemp(coolestDay.temp, tempUnit)})
            </div>
          </div>
        </div>

        {/* Rain Outlook */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <CloudRain className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400">7-Day Rain Outlook</div>
            <div className="text-xs font-bold text-slate-100">
              {rainExpectedDays.length > 0 ? rainExpectedDays.join(', ') : 'Dry throughout week'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

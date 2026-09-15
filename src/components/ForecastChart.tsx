import React, { useState } from 'react';
import { ProcessedDayForecast, TemperatureUnit } from '../types';
import { formatTemp, toFahrenheit } from '../utils/weatherIntelligence';
import { WeatherIcon } from './WeatherIcon';

interface ForecastChartProps {
  daily: ProcessedDayForecast[];
  tempUnit: TemperatureUnit;
  selectedIndex: number;
  onSelectDay: (index: number) => void;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({
  daily,
  tempUnit,
  selectedIndex,
  onSelectDay,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!daily || daily.length === 0) return null;

  // Convert values based on selected unit
  const maxTemps = daily.map((d) =>
    tempUnit === 'F' ? toFahrenheit(d.maxTemp) : d.maxTemp
  );
  const minTemps = daily.map((d) =>
    tempUnit === 'F' ? toFahrenheit(d.minTemp) : d.minTemp
  );

  const absoluteMax = Math.max(...maxTemps);
  const absoluteMin = Math.min(...minTemps);
  const tempRange = Math.max(absoluteMax - absoluteMin, 4);
  const paddingY = tempRange * 0.25;
  const chartMax = absoluteMax + paddingY;
  const chartMin = absoluteMin - paddingY;

  // SVG Chart Geometry
  const width = 760;
  const height = 240;
  const margin = { top: 35, right: 35, bottom: 45, left: 35 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const getX = (index: number) => {
    return margin.left + (index / (daily.length - 1)) * innerWidth;
  };

  const getY = (temp: number) => {
    return (
      margin.top +
      innerHeight -
      ((temp - chartMin) / (chartMax - chartMin)) * innerHeight
    );
  };

  // Generate smooth SVG Path (Monotone / Catmull-Rom like cubic bezier)
  const generateCurvedPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? i : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;

      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const maxPoints = maxTemps.map((temp, i) => ({ x: getX(i), y: getY(temp) }));
  const minPoints = minTemps.map((temp, i) => ({ x: getX(i), y: getY(temp) }));

  const maxPath = generateCurvedPath(maxPoints);
  const minPath = generateCurvedPath(minPoints);

  // Closed area path for temperature range
  const areaPath =
    maxPath +
    ` L ${minPoints[minPoints.length - 1].x} ${minPoints[minPoints.length - 1].y}` +
    generateCurvedPath([...minPoints].reverse()).replace(/^M [^ ]+ [^ ]+/, '') +
    ' Z';

  const activeIdx = hoveredIdx !== null ? hoveredIdx : selectedIndex;
  const activeDay = daily[activeIdx];

  return (
    <div
      id="forecast-chart-card"
      className="p-5 md:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl space-y-4"
    >
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm md:text-base font-bold text-white font-['Space_Grotesk']">
            7-Day Temperature Trend Curve
          </h4>
          <p className="text-xs text-slate-400">
            Interactive high & low temperature envelope across the week
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-rose-500/50 shadow-sm" />
            <span>Highs (Max)</span>
          </div>
          <div className="flex items-center gap-1.5 text-sky-400">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-sky-500/50 shadow-sm" />
            <span>Lows (Min)</span>
          </div>
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="tempRangeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.08" />
            </linearGradient>

            <linearGradient id="maxStrokeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>

            <linearGradient id="minStrokeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
          </defs>

          {/* Horizontal grid guide lines */}
          {[0, 0.5, 1].map((ratio) => {
            const y = margin.top + innerHeight * ratio;
            return (
              <line
                key={`grid-${ratio}`}
                x1={margin.left}
                y1={y}
                x2={width - margin.right}
                y2={y}
                stroke="#334155"
                strokeDasharray="4 4"
                strokeOpacity="0.4"
              />
            );
          })}

          {/* Range Area */}
          <path d={areaPath} fill="url(#tempRangeGradient)" />

          {/* Max Temperature Line */}
          <path
            d={maxPath}
            fill="none"
            stroke="url(#maxStrokeGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Min Temperature Line */}
          <path
            d={minPath}
            fill="none"
            stroke="url(#minStrokeGradient)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Vertical Guides and Interactive Column Overlays */}
          {daily.map((day, idx) => {
            const x = getX(idx);
            const isHovered = hoveredIdx === idx;
            const isSelected = selectedIndex === idx;
            const maxY = getY(maxTemps[idx]);
            const minY = getY(minTemps[idx]);

            return (
              <g
                key={`col-${idx}`}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => onSelectDay(idx)}
              >
                {/* Column Hover Highlight */}
                {(isHovered || isSelected) && (
                  <rect
                    x={x - innerWidth / (daily.length - 1) / 2}
                    y={margin.top - 10}
                    width={innerWidth / (daily.length - 1)}
                    height={innerHeight + 30}
                    fill={isSelected ? '#38bdf8' : '#64748b'}
                    fillOpacity={isSelected ? '0.12' : '0.07'}
                    rx="8"
                  />
                )}

                {/* Vertical dash line */}
                <line
                  x1={x}
                  y1={margin.top - 5}
                  x2={x}
                  y2={height - margin.bottom + 5}
                  stroke={isSelected ? '#38bdf8' : isHovered ? '#94a3b8' : '#475569'}
                  strokeWidth={isSelected ? '1.5' : '1'}
                  strokeDasharray={isSelected ? '0' : '3 3'}
                  strokeOpacity={isSelected ? '0.8' : '0.5'}
                />

                {/* Max Point Node */}
                <circle
                  cx={x}
                  cy={maxY}
                  r={isSelected ? 6 : isHovered ? 5.5 : 4}
                  fill="#f43f5e"
                  stroke="#0f172a"
                  strokeWidth="2.5"
                  className="transition-all duration-150"
                />

                {/* Max Temp Label above node */}
                <text
                  x={x}
                  y={maxY - 10}
                  textAnchor="middle"
                  fill="#fda4af"
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="Space Grotesk, sans-serif"
                >
                  {Math.round(maxTemps[idx])}°
                </text>

                {/* Min Point Node */}
                <circle
                  cx={x}
                  cy={minY}
                  r={isSelected ? 5.5 : isHovered ? 5 : 3.5}
                  fill="#38bdf8"
                  stroke="#0f172a"
                  strokeWidth="2"
                  className="transition-all duration-150"
                />

                {/* Min Temp Label below node */}
                <text
                  x={x}
                  y={minY + 16}
                  textAnchor="middle"
                  fill="#7dd3fc"
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="Space Grotesk, sans-serif"
                >
                  {Math.round(minTemps[idx])}°
                </text>

                {/* Day Name Label at bottom */}
                <text
                  x={x}
                  y={height - margin.bottom + 32}
                  textAnchor="middle"
                  fill={isSelected ? '#38bdf8' : isHovered ? '#f1f5f9' : '#94a3b8'}
                  fontSize="11"
                  fontWeight={isSelected ? '800' : '600'}
                >
                  {day.dayName}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Day Quick Inspector */}
      {activeDay && (
        <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
              <WeatherIcon name={activeDay.condition.iconName} className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-100">
                {activeDay.dayName} ({activeDay.fullDateStr})
              </span>
              <span className="text-slate-400 ml-2">
                {activeDay.condition.label} — {activeDay.condition.description}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 font-semibold">
            <span className="text-rose-400">
              High: {formatTemp(activeDay.maxTemp, tempUnit)}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-sky-400">
              Low: {formatTemp(activeDay.minTemp, tempUnit)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

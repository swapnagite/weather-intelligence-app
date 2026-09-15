export type TemperatureUnit = 'C' | 'F';
export type WindUnit = 'kmh' | 'mph';

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  feature_code?: string;
  country_code?: string;
  country?: string;
  admin1?: string;
  admin2?: string;
  timezone?: string;
  population?: number;
}

export interface GeocodingResponse {
  results?: GeocodingResult[];
  generationtime_ms?: number;
}

export interface CurrentWeather {
  temperature: number;
  windspeed: number;
  winddirection: number;
  weathercode: number;
  is_day: number;
  time: string;
}

export interface DailyForecastData {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weathercode: number[];
}

export interface DailyUnits {
  time: string;
  temperature_2m_max: string;
  temperature_2m_min: string;
  weathercode: string;
}

export interface WeatherApiResponse {
  latitude: number;
  longitude: number;
  utc_offset_seconds?: number;
  timezone?: string;
  timezone_abbreviation?: string;
  elevation?: number;
  current_weather: CurrentWeather;
  daily: DailyForecastData;
  daily_units?: DailyUnits;
}

export interface ProcessedDayForecast {
  date: string; // "2026-09-14"
  dayName: string; // "Mon", "Today", "Tomorrow"
  fullDateStr: string; // "Sep 14, 2026"
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  condition: WeatherConditionMeta;
}

export type WeatherCategory = 'clear' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'thunderstorm';

export interface WeatherConditionMeta {
  code: number;
  label: string;
  description: string;
  category: WeatherCategory;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  iconName: string;
}

export interface PlanningRecommendation {
  id: string;
  category: 'umbrella' | 'clothing' | 'activity' | 'wind' | 'sun' | 'highlight';
  title: string;
  description: string;
  badge: string;
  severity: 'info' | 'warning' | 'alert' | 'success';
  icon: string;
}

export interface WeatherIntelligenceSummary {
  recommendations: PlanningRecommendation[];
  warmestDay: { dayName: string; temp: number };
  coolestDay: { dayName: string; temp: number };
  rainExpectedDays: string[];
  outdoorActivityScore: number; // 0 to 100
  outdoorSuitabilityText: string;
}

export interface AppState {
  selectedCity: GeocodingResult | null;
  weatherData: WeatherApiResponse | null;
  processedDaily: ProcessedDayForecast[];
  intelligence: WeatherIntelligenceSummary | null;
  loading: boolean;
  error: string | null;
  tempUnit: TemperatureUnit;
}

import {
  CurrentWeather,
  DailyForecastData,
  PlanningRecommendation,
  WeatherIntelligenceSummary,
  TemperatureUnit,
} from '../types';
import { isRainOrDrizzle, isSnow, isThunderstorm, getWeatherCondition } from './weatherCodes';

export function toFahrenheit(celsius: number): number {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

export function formatTemp(celsius: number, unit: TemperatureUnit): string {
  if (unit === 'F') {
    return `${Math.round(toFahrenheit(celsius))}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

export function formatWind(kmh: number, unit: TemperatureUnit): string {
  if (unit === 'F') {
    const mph = Math.round(kmh * 0.621371);
    return `${mph} mph`;
  }
  return `${Math.round(kmh)} km/h`;
}

export function getWindCompass(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((degrees % 360) / 22.5) % 16;
  return directions[index];
}

export function getDayName(dateString: string, index: number): string {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export function getFormattedDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function generateWeatherIntelligence(
  current: CurrentWeather,
  daily: DailyForecastData,
  unit: TemperatureUnit = 'C'
): WeatherIntelligenceSummary {
  const recommendations: PlanningRecommendation[] = [];

  const currentCode = current.weathercode;
  const currentTemp = current.temperature;
  const currentWind = current.windspeed;

  const todayMax = daily.temperature_2m_max[0] ?? currentTemp;
  const todayMin = daily.temperature_2m_min[0] ?? currentTemp;
  const todayCode = daily.weathercode[0] ?? currentCode;

  // 1. Umbrella & Precipitation Alert
  const isRainingNow = isRainOrDrizzle(currentCode);
  const isRainingToday = isRainOrDrizzle(todayCode);
  const isSnowingNow = isSnow(currentCode) || isSnow(todayCode);
  const isStormNow = isThunderstorm(currentCode) || isThunderstorm(todayCode);

  const rainDays: string[] = [];
  daily.time.forEach((dateStr, idx) => {
    const code = daily.weathercode[idx];
    if (isRainOrDrizzle(code) || isThunderstorm(code) || isSnow(code)) {
      rainDays.push(getDayName(dateStr, idx));
    }
  });

  if (isStormNow) {
    recommendations.push({
      id: 'storm-alert',
      category: 'umbrella',
      title: 'Thunderstorm Warning',
      description: 'Active lightning and heavy rain showers reported. Stay indoors and avoid open elevated areas.',
      badge: 'Severe Weather',
      severity: 'alert',
      icon: 'CloudLightning',
    });
  } else if (isSnowingNow) {
    recommendations.push({
      id: 'snow-alert',
      category: 'umbrella',
      title: 'Snow & Icy Conditions',
      description: 'Snowfall or freezing precipitation expected. Wear non-slip insulated boots and waterproof outerwear.',
      badge: 'Snow Alert',
      severity: 'warning',
      icon: 'Snowflake',
    });
  } else if (isRainingNow || isRainingToday) {
    recommendations.push({
      id: 'umbrella-alert',
      category: 'umbrella',
      title: 'Carry an Umbrella',
      description: isRainingNow
        ? 'Precipitation is active now. Keep an umbrella or hooded waterproof shell ready when heading out.'
        : 'Rain is forecasted for today. Pack a compact umbrella or raincoat for your commute.',
      badge: 'Rain Alert',
      severity: 'warning',
      icon: 'Umbrella',
    });
  } else if (rainDays.length > 0) {
    const nextRainDay = rainDays.find((d) => d !== 'Today') || rainDays[0];
    recommendations.push({
      id: 'upcoming-rain',
      category: 'umbrella',
      title: `No Rain Today (Rain on ${nextRainDay})`,
      description: `Conditions remain dry today. Note that showers are forecasted later in the week on ${rainDays.join(', ')}.`,
      badge: 'Dry Today',
      severity: 'info',
      icon: 'Umbrella',
    });
  } else {
    recommendations.push({
      id: 'dry-week',
      category: 'umbrella',
      title: 'Dry Week Ahead',
      description: 'No precipitation forecasted over the 7-day window. Clear skies and no umbrella required.',
      badge: 'Dry Forecast',
      severity: 'success',
      icon: 'Sun',
    });
  }

  // 2. Wardrobe & Clothing Suggestions
  let clothingTitle = '';
  let clothingDesc = '';
  let clothingBadge = '';
  let clothingSeverity: 'info' | 'warning' | 'alert' | 'success' = 'info';

  const effectiveTemp = currentTemp;
  if (effectiveTemp <= 0) {
    clothingTitle = 'Heavy Winter Gear Required';
    clothingDesc = 'Sub-zero temperatures. Wear thermal base layers, a heavy insulated parka, wool gloves, and a beanie.';
    clothingBadge = 'Freezing';
    clothingSeverity = 'alert';
  } else if (effectiveTemp <= 8) {
    clothingTitle = 'Warm Winter Jacket';
    clothingDesc = 'Chilly air. We recommend a padded coat, scarf, and layered knitwear to stay comfortable.';
    clothingBadge = 'Cold';
    clothingSeverity = 'warning';
  } else if (effectiveTemp <= 16) {
    clothingTitle = 'Light Jacket or Fleece';
    clothingDesc = 'Crisp conditions. A medium pullover, hoodie, denim/leather jacket, or fleece is optimal today.';
    clothingBadge = 'Cool';
    clothingSeverity = 'info';
  } else if (effectiveTemp <= 23) {
    clothingTitle = 'Comfortable Casual Layers';
    clothingDesc = 'Pleasant ambient temperatures. Standard t-shirt with an optional light cardigan or long-sleeve.';
    clothingBadge = 'Pleasant';
    clothingSeverity = 'success';
  } else if (effectiveTemp <= 29) {
    clothingTitle = 'Light Summer Wear';
    clothingDesc = 'Warm conditions. Breathable cotton or linen fabrics, shorts, and sunglasses are recommended.';
    clothingBadge = 'Warm';
    clothingSeverity = 'info';
  } else {
    clothingTitle = 'Extreme Heat Precautions';
    clothingDesc = 'High temperatures. Wear ultra-lightweight clothing, a wide-brim hat, apply SPF sunscreen, and drink plenty of water.';
    clothingBadge = 'Hot Weather';
    clothingSeverity = 'warning';
  }

  recommendations.push({
    id: 'clothing-recommendation',
    category: 'clothing',
    title: clothingTitle,
    description: clothingDesc,
    badge: clothingBadge,
    severity: clothingSeverity,
    icon: 'Shirt',
  });

  // 3. Wind Advisory
  if (currentWind >= 45) {
    recommendations.push({
      id: 'wind-warning',
      category: 'wind',
      title: 'Strong Gale Advisory',
      description: `Wind speeds reach ${formatWind(currentWind, unit)}. Secure loose outdoor items and anticipate strong buffeting gusts.`,
      badge: 'High Wind',
      severity: 'alert',
      icon: 'Wind',
    });
  } else if (currentWind >= 25) {
    recommendations.push({
      id: 'wind-breezy',
      category: 'wind',
      title: 'Breezy Conditions',
      description: `Winds around ${formatWind(currentWind, unit)}. A windbreaker or jacket will help prevent wind chill.`,
      badge: 'Breezy',
      severity: 'info',
      icon: 'Wind',
    });
  }

  // 4. Sun & UV / Clear sky
  if ([0, 1].includes(currentCode) && currentTemp >= 16) {
    recommendations.push({
      id: 'sun-advisory',
      category: 'sun',
      title: 'High Sun Exposure',
      description: 'Clear skies allow direct sunlight. Don sunglasses and apply UV protection for extended outdoor exposure.',
      badge: 'Sun Protection',
      severity: 'info',
      icon: 'Sparkles',
    });
  }

  // 5. Outdoor Activity Suitability Score calculation (0-100)
  let activityScore = 90;

  // Temperature penalty
  if (currentTemp < 0) activityScore -= 40;
  else if (currentTemp < 10) activityScore -= 20;
  else if (currentTemp > 34) activityScore -= 35;
  else if (currentTemp > 28) activityScore -= 15;

  // Weather condition penalty
  if (isThunderstorm(currentCode)) activityScore -= 60;
  else if (isRainOrDrizzle(currentCode)) activityScore -= 40;
  else if (isSnow(currentCode)) activityScore -= 35;
  else if (currentCode === 3) activityScore -= 10; // overcast

  // Wind penalty
  if (currentWind > 40) activityScore -= 30;
  else if (currentWind > 25) activityScore -= 15;

  activityScore = Math.max(10, Math.min(100, activityScore));

  let suitabilityText = '';
  let activitySeverity: 'info' | 'warning' | 'alert' | 'success' = 'info';

  if (activityScore >= 80) {
    suitabilityText = 'Ideal for running, outdoor dining, cycling, and park visits.';
    activitySeverity = 'success';
  } else if (activityScore >= 60) {
    suitabilityText = 'Good for outdoor strolls and exercise with appropriate layered gear.';
    activitySeverity = 'info';
  } else if (activityScore >= 40) {
    suitabilityText = 'Fair conditions. Short walks are fine, but consider indoor workouts.';
    activitySeverity = 'warning';
  } else {
    suitabilityText = 'Poor outdoor conditions. Indoor activities and cozy indoor plans recommended.';
    activitySeverity = 'alert';
  }

  recommendations.push({
    id: 'activity-index',
    category: 'activity',
    title: `Outdoor Suitability: ${activityScore}%`,
    description: suitabilityText,
    badge: activityScore >= 75 ? 'Prime Outdoor Day' : activityScore >= 50 ? 'Moderate' : 'Indoor Preferred',
    severity: activitySeverity,
    icon: 'Compass',
  });

  // Calculate warmest and coolest days across the 7-day forecast
  let maxIdx = 0;
  let minIdx = 0;
  daily.temperature_2m_max.forEach((t, i) => {
    if (t > daily.temperature_2m_max[maxIdx]) maxIdx = i;
  });
  daily.temperature_2m_min.forEach((t, i) => {
    if (t < daily.temperature_2m_min[minIdx]) minIdx = i;
  });

  return {
    recommendations,
    warmestDay: {
      dayName: getDayName(daily.time[maxIdx], maxIdx),
      temp: daily.temperature_2m_max[maxIdx],
    },
    coolestDay: {
      dayName: getDayName(daily.time[minIdx], minIdx),
      temp: daily.temperature_2m_min[minIdx],
    },
    rainExpectedDays: rainDays,
    outdoorActivityScore: activityScore,
    outdoorSuitabilityText: suitabilityText,
  };
}

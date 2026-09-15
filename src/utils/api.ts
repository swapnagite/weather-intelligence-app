import { GeocodingResponse, GeocodingResult, WeatherApiResponse } from '../types';

export const POPULAR_CITIES: GeocodingResult[] = [
  {
    id: 5128581,
    name: 'New York',
    country: 'United States',
    admin1: 'New York',
    latitude: 40.7128,
    longitude: -74.006,
    country_code: 'US',
    timezone: 'America/New_York',
  },
  {
    id: 2643743,
    name: 'London',
    country: 'United Kingdom',
    admin1: 'England',
    latitude: 51.5085,
    longitude: -0.1257,
    country_code: 'GB',
    timezone: 'Europe/London',
  },
  {
    id: 1850147,
    name: 'Tokyo',
    country: 'Japan',
    admin1: 'Tokyo',
    latitude: 35.6895,
    longitude: 139.6917,
    country_code: 'JP',
    timezone: 'Asia/Tokyo',
  },
  {
    id: 2988507,
    name: 'Paris',
    country: 'France',
    admin1: 'Île-de-France',
    latitude: 48.8534,
    longitude: 2.3488,
    country_code: 'FR',
    timezone: 'Europe/Paris',
  },
  {
    id: 2147714,
    name: 'Sydney',
    country: 'Australia',
    admin1: 'New South Wales',
    latitude: -33.8678,
    longitude: 151.2073,
    country_code: 'AU',
    timezone: 'Australia/Sydney',
  },
  {
    id: 2921044,
    name: 'Germany',
    country: 'Germany',
    admin1: 'Berlin',
    latitude: 52.5244,
    longitude: 13.4105,
    country_code: 'DE',
    timezone: 'Europe/Berlin',
  },
];

/**
 * Searches for coordinates given a city query using Open-Meteo Geocoding API.
 */
export async function searchGeocoding(query: string, count: number = 1): Promise<GeocodingResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=${count}&language=en&format=json`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Geocoding service returned status ${res.status}`);
    }
    const data: GeocodingResponse = await res.json();
    if (!data.results || data.results.length === 0) {
      return [];
    }
    return data.results;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return [];
    }
    console.error('Error fetching geocoding:', error);
    throw new Error(error.message || 'Failed to search for location');
  }
}

/**
 * Fetches forecast weather data from Open-Meteo API.
 */
export async function fetchWeatherForecast(lat: number, lon: number): Promise<WeatherApiResponse> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Weather forecast service returned status ${res.status}`);
    }
    const data: WeatherApiResponse = await res.json();
    if (!data.current_weather || !data.daily) {
      throw new Error('Incomplete weather payload returned by service');
    }
    return data;
  } catch (error: any) {
    console.error('Error fetching forecast:', error);
    throw new Error(error.message || 'Unable to retrieve weather forecast');
  }
}

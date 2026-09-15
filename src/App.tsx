/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  GeocodingResult,
  WeatherApiResponse,
  ProcessedDayForecast,
  WeatherIntelligenceSummary,
  TemperatureUnit,
} from './types';
import {
  searchGeocoding,
  fetchWeatherForecast,
  POPULAR_CITIES,
} from './utils/api';
import { getWeatherCondition } from './utils/weatherCodes';
import {
  generateWeatherIntelligence,
  getDayName,
  getFormattedDate,
} from './utils/weatherIntelligence';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { PlanningIntelligence } from './components/PlanningIntelligence';
import { ForecastSection } from './components/ForecastSection';
import { ForecastChart } from './components/ForecastChart';
import { ErrorState } from './components/ErrorState';
import { LoadingSkeleton } from './components/LoadingSkeleton';

export default function App() {
  const [selectedCity, setSelectedCity] = useState<GeocodingResult | null>(POPULAR_CITIES[0]);
  const [weatherData, setWeatherData] = useState<WeatherApiResponse | null>(null);
  const [processedDaily, setProcessedDaily] = useState<ProcessedDayForecast[]>([]);
  const [intelligence, setIntelligence] = useState<WeatherIntelligenceSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchedCityName, setSearchedCityName] = useState<string>('');
  const [tempUnit, setTempUnit] = useState<TemperatureUnit>('C');
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);
  const [isLoadingGeo, setIsLoadingGeo] = useState<boolean>(false);

  // Load weather for a given city
  const loadWeatherForCity = useCallback(
    async (city: GeocodingResult) => {
      // If city is marked with invalid id -1, handle not found error
      if (city.id === -1) {
        setSearchedCityName(city.name);
        setError(`No location found matching "${city.name}".`);
        setWeatherData(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setSearchedCityName(city.name);

      try {
        let lat = city.latitude;
        let lon = city.longitude;

        // If coordinates aren't set, call geocoding API first
        if (!lat || !lon) {
          const results = await searchGeocoding(city.name, 1);
          if (!results || results.length === 0) {
            throw new Error(`Location "${city.name}" was not found.`);
          }
          lat = results[0].latitude;
          lon = results[0].longitude;
          city = results[0];
        }

        setSelectedCity(city);

        // Fetch Weather Forecast from Open-Meteo
        const weather = await fetchWeatherForecast(lat, lon);
        setWeatherData(weather);

        // Process 7-day daily forecast
        const dailyItems: ProcessedDayForecast[] = weather.daily.time.map((dateStr, idx) => {
          const code = weather.daily.weathercode[idx];
          return {
            date: dateStr,
            dayName: getDayName(dateStr, idx),
            fullDateStr: getFormattedDate(dateStr),
            maxTemp: weather.daily.temperature_2m_max[idx],
            minTemp: weather.daily.temperature_2m_min[idx],
            weatherCode: code,
            condition: getWeatherCondition(code),
          };
        });

        setProcessedDaily(dailyItems);

        // Compute Intelligence recommendations
        const intel = generateWeatherIntelligence(
          weather.current_weather,
          weather.daily,
          tempUnit
        );
        setIntelligence(intel);
        setSelectedDayIdx(0);
      } catch (err: any) {
        console.error('Failed to load weather:', err);
        setError(err.message || 'Unable to fetch weather forecast');
      } finally {
        setLoading(false);
      }
    },
    [tempUnit]
  );

  // Initial load
  useEffect(() => {
    loadWeatherForCity(POPULAR_CITIES[0]);
  }, []);

  // Update recommendations if unit changes
  useEffect(() => {
    if (weatherData) {
      const intel = generateWeatherIntelligence(
        weatherData.current_weather,
        weatherData.daily,
        tempUnit
      );
      setIntelligence(intel);
    }
  }, [tempUnit, weatherData]);

  // Handle Current Geolocation
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoadingGeo(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Attempt reverse geocoding via Open-Meteo or create location record
          const detectedCity: GeocodingResult = {
            id: 999999,
            name: 'My Location',
            latitude,
            longitude,
            admin1: 'Current GPS',
            country: '',
          };
          await loadWeatherForCity(detectedCity);
        } catch {
          setError('Failed to retrieve forecast for current coordinates.');
        } finally {
          setIsLoadingGeo(false);
        }
      },
      (geoErr) => {
        setIsLoadingGeo(false);
        if (geoErr.code === geoErr.PERMISSION_DENIED) {
          setError('Location permission was denied. You can search any city by name.');
        } else {
          setError('Could not determine current location. Try searching for your city.');
        }
      },
      { timeout: 10000 }
    );
  };

  const handleRefresh = () => {
    if (selectedCity) {
      loadWeatherForCity(selectedCity);
    }
  };

  const currentCondition = weatherData
    ? getWeatherCondition(weatherData.current_weather.weathercode)
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Header */}
      <Header
        tempUnit={tempUnit}
        onToggleUnit={setTempUnit}
        onRefresh={handleRefresh}
        loading={loading}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-8">
        {/* Search Bar & Location Controls */}
        <SearchBar
          onSelectCity={loadWeatherForCity}
          onUseCurrentLocation={handleUseCurrentLocation}
          isLoadingGeo={isLoadingGeo}
          selectedCity={selectedCity}
        />

        {/* Error State */}
        {error && !loading && (
          <ErrorState
            message={error}
            cityName={searchedCityName}
            onRetry={handleRefresh}
            onSelectCity={loadWeatherForCity}
          />
        )}

        {/* Loading State */}
        {loading && <LoadingSkeleton />}

        {/* Main Weather Intelligence View */}
        {!loading && !error && weatherData && selectedCity && currentCondition && (
          <div className="space-y-8">
            {/* Top Grid: Current Weather Display */}
            <CurrentWeatherCard
              city={selectedCity}
              current={weatherData.current_weather}
              condition={currentCondition}
              todayMax={weatherData.daily.temperature_2m_max[0]}
              todayMin={weatherData.daily.temperature_2m_min[0]}
              timezone={weatherData.timezone}
              tempUnit={tempUnit}
            />

            {/* Smart Planning Recommendations & Alerts */}
            {intelligence && (
              <PlanningIntelligence
                intelligence={intelligence}
                tempUnit={tempUnit}
              />
            )}

            {/* 7-Day Forecast Cards */}
            <ForecastSection
              daily={processedDaily}
              tempUnit={tempUnit}
              selectedIndex={selectedDayIdx}
              onSelectDay={setSelectedDayIdx}
            />

            {/* 7-Day Interactive Temperature Trend Chart */}
            <ForecastChart
              daily={processedDaily}
              tempUnit={tempUnit}
              selectedIndex={selectedDayIdx}
              onSelectDay={setSelectedDayIdx}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Powered by{' '}
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noreferrer"
              className="text-sky-400 hover:underline font-medium"
            >
              Open-Meteo
            </a>{' '}
            Geocoding & Forecast APIs.
          </div>
          <div className="text-slate-400 text-[11px]">
            Real-time atmospheric modeling with WMO meteorological classification.
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudFog, CloudDrizzle, Wind } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";

type DayForecast = { date: string; code: number; high: number; low: number };

type WeatherState = {
  temperature: number;
  code: number;
  aqi: number | null;
  days: DayForecast[];
} | null;

function describeWeather(code: number): { label: string; Icon: typeof Sun } {
  if (code === 0) return { label: "Clear sky", Icon: Sun };
  if ([1, 2].includes(code)) return { label: "Partly cloudy", Icon: Sun };
  if (code === 3) return { label: "Overcast", Icon: Cloud };
  if ([45, 48].includes(code)) return { label: "Foggy", Icon: CloudFog };
  if ([51, 53, 55, 56, 57].includes(code)) return { label: "Drizzle", Icon: CloudDrizzle };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { label: "Rain", Icon: CloudRain };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: "Snow", Icon: CloudSnow };
  if ([95, 96, 99].includes(code)) return { label: "Thunderstorm", Icon: CloudLightning };
  return { label: "Clear", Icon: Sun };
}

function aqiLabel(aqi: number): { label: string; color: string } {
  if (aqi <= 50) return { label: "Good", color: "text-emerald-300" };
  if (aqi <= 100) return { label: "Moderate", color: "text-yellow-300" };
  if (aqi <= 150) return { label: "Unhealthy (Sensitive)", color: "text-orange-300" };
  if (aqi <= 200) return { label: "Unhealthy", color: "text-red-300" };
  if (aqi <= 300) return { label: "Very Unhealthy", color: "text-purple-300" };
  return { label: "Hazardous", color: "text-rose-400" };
}

const DEFAULT_COORDS = { latitude: 40.7128, longitude: -74.006 }; // New York fallback

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherState>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    function fetchWeather(lat: number, lon: number) {
      Promise.all([
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=7&temperature_unit=fahrenheit&timezone=auto`
        ).then((res) => res.json()),
        fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`)
          .then((res) => res.json())
          .catch(() => null),
      ])
        .then(([data, aqiData]) => {
          const days: DayForecast[] = data.daily.time.map((date: string, i: number) => ({
            date,
            code: data.daily.weather_code[i],
            high: Math.round(data.daily.temperature_2m_max[i]),
            low: Math.round(data.daily.temperature_2m_min[i]),
          }));
          setWeather({
            temperature: Math.round(data.current.temperature_2m),
            code: data.current.weather_code,
            aqi: aqiData?.current?.us_aqi ?? null,
            days,
          });
        })
        .catch(() => setError(true));
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(DEFAULT_COORDS.latitude, DEFAULT_COORDS.longitude),
        { timeout: 5000 }
      );
    } else {
      fetchWeather(DEFAULT_COORDS.latitude, DEFAULT_COORDS.longitude);
    }
  }, []);

  const { label, Icon } = describeWeather(weather?.code ?? 0);
  const aqi = weather?.aqi != null ? aqiLabel(weather.aqi) : null;

  return (
    <GlassCard glow="radial-gradient(circle, #f59e0b, transparent 70%)" className="flex flex-col justify-between">
      <div className="mb-2 flex items-start justify-between">
        <p className="text-sm italic font-medium text-white/60">Weather</p>
        <Icon className="size-7 animate-float-slow text-amber-300" />
      </div>
      {error ? (
        <p className="text-sm text-white/50 italic">Unavailable</p>
      ) : weather ? (
        <>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="font-ayuthaya text-4xl font-bold">{weather.temperature}°</p>
              <p className="text-sm text-white/60">{label}</p>
            </div>
            {aqi ? (
              <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1">
                <Wind className="size-3.5 text-white/50" />
                <span className={`text-xs font-semibold ${aqi.color}`}>AQI {weather.aqi}</span>
              </div>
            ) : null}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {weather.days.map((d, i) => {
              const DayIcon = describeWeather(d.code).Icon;
              const dayLabel =
                i === 0 ? "Today" : new Date(`${d.date}T00:00:00`).toLocaleDateString([], { weekday: "short" });
              return (
                <div key={d.date} className="flex flex-col items-center gap-0.5 rounded-lg bg-white/5 px-1 py-1.5 text-center">
                  <span className="text-[9px] text-white/40">{dayLabel}</span>
                  <DayIcon className="size-3.5 text-amber-200" />
                  <span className="text-[10px] font-semibold">{d.high}°</span>
                  <span className="text-[10px] text-white/40">{d.low}°</span>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <p className="text-sm text-white/50 italic">Loading…</p>
      )}
    </GlassCard>
  );
}

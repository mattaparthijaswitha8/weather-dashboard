// The backend. Its jobs:
//   1. /api/search  -> turn a city name into coordinates
//   2. /api/weather -> fetch the forecast, tidy it up, send it to the frontend
// Weather data comes from Open-Meteo, which is free and needs no API key.

import express from "express";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const app = express();
const PORT = process.env.PORT || 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// A tiny memory cache: if someone asks for the same place twice within
// 10 minutes, we reply instantly instead of calling Open-Meteo again.
const cache = new Map();
const TEN_MINUTES = 10 * 60 * 1000;

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`The weather service replied with status ${response.status}.`);
  }
  return response.json();
}

// 1. Search for a city -------------------------------------------------------
app.get("/api/search", async (req, res) => {
  const q = String(req.query.q || "").trim();
  if (q.length < 2) {
    return res.status(400).json({ error: "Type at least 2 letters of a city name." });
  }

  try {
    const data = await getJson(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=en&format=json`
    );
    const places = (data.results || []).map((p) => ({
      id: p.id,
      name: p.name,
      region: p.admin1 || "",
      country: p.country || "",
      lat: p.latitude,
      lon: p.longitude,
    }));
    res.json(places);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// 2. Get the forecast --------------------------------------------------------
app.get("/api/weather", async (req, res) => {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return res.status(400).json({ error: "Latitude and longitude are required." });
  }

  const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.savedAt < TEN_MINUTES) {
    return res.json(hit.data);
  }

  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day",
    hourly: "temperature_2m,precipitation_probability,relative_humidity_2m,wind_speed_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset,uv_index_max",
    timezone: "auto",
    forecast_days: "7",
  });

  try {
    const raw = await getJson(`https://api.open-meteo.com/v1/forecast?${params}`);

    // Find "right now" inside the hourly list, then keep the next 24 hours.
    const nowHour = raw.current.time.slice(0, 13); // e.g. "2026-10-12T14"
    let start = raw.hourly.time.findIndex((t) => t.startsWith(nowHour));
    if (start < 0) start = 0;

    const hourly = raw.hourly.time.slice(start, start + 24).map((time, i) => ({
      time,
      temp: raw.hourly.temperature_2m[start + i],
      rain: raw.hourly.precipitation_probability[start + i],
      humidity: raw.hourly.relative_humidity_2m[start + i],
      wind: raw.hourly.wind_speed_10m[start + i],
    }));

    const daily = raw.daily.time.map((date, i) => ({
      date,
      code: raw.daily.weather_code[i],
      max: raw.daily.temperature_2m_max[i],
      min: raw.daily.temperature_2m_min[i],
      rain: raw.daily.precipitation_sum[i],
      sunrise: raw.daily.sunrise[i],
      sunset: raw.daily.sunset[i],
      uv: raw.daily.uv_index_max[i],
    }));

    const data = {
      timezone: raw.timezone,
      current: {
        temp: raw.current.temperature_2m,
        feelsLike: raw.current.apparent_temperature,
        humidity: raw.current.relative_humidity_2m,
        wind: raw.current.wind_speed_10m,
        code: raw.current.weather_code,
        isDay: raw.current.is_day === 1,
      },
      hourly,
      daily,
    };

    cache.set(key, { data, savedAt: Date.now() });
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// 3. In production, serve the built React app too ------------------------------
const dist = path.join(__dirname, "../client/dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get("*", (req, res) => res.sendFile(path.join(dist, "index.html")));
}

app.listen(PORT, () => {
  console.log(`Nimbus server running on http://localhost:${PORT}`);
});

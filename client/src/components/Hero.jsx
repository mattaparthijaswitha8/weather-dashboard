import { Thermometer, Droplets, Wind, Sun, Sunrise, Sunset } from "lucide-react";
import WeatherIcon from "./WeatherIcon.jsx";
import { describe } from "../lib/weather.js";

export default function Hero({ place, current, today, unit, toUnit }) {
  const info = describe(current.code);
  const deg = (value) => `${Math.round(toUnit(value))}°`;

  const stats = [
    { icon: Thermometer, label: "Feels like", value: deg(current.feelsLike) },
    { icon: Droplets, label: "Humidity", value: `${current.humidity}%` },
    { icon: Wind, label: "Wind", value: `${Math.round(current.wind)} km/h` },
    { icon: Sun, label: "UV index today", value: today.uv == null ? "-" : Math.round(today.uv) },
    { icon: Sunrise, label: "Sunrise", value: today.sunrise.slice(11, 16) },
    { icon: Sunset, label: "Sunset", value: today.sunset.slice(11, 16) },
  ];

  return (
    <section className="hero">
      <div className="hero-main">
        <h1 className="place">{place.name}</h1>
        <p className="place-sub">{[place.region, place.country].filter(Boolean).join(", ")}</p>
        <div className="temp">
          {Math.round(toUnit(current.temp))}
          <sup>°{unit}</sup>
        </div>
        <p className="condition">
          <WeatherIcon code={current.code} isDay={current.isDay} size={26} />
          {info.label}
        </p>
        <p className="range">
          Today: high {deg(today.max)}, low {deg(today.min)}
        </p>
      </div>

      <dl className="stats">
        {stats.map(({ icon: Icon, label, value }) => (
          <div className="stat" key={label}>
            <Icon size={18} aria-hidden="true" />
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

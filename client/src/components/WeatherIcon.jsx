import { Sun, Moon, CloudSun, CloudMoon, Cloud, CloudFog, CloudRain, CloudSnow, CloudLightning } from "lucide-react";
import { describe } from "../lib/weather.js";

export default function WeatherIcon({ code, isDay = true, size = 24 }) {
  const { kind } = describe(code);
  const icons = {
    clear: isDay ? Sun : Moon,
    partly: isDay ? CloudSun : CloudMoon,
    cloud: Cloud,
    fog: CloudFog,
    rain: CloudRain,
    snow: CloudSnow,
    storm: CloudLightning,
  };
  const Icon = icons[kind];
  return <Icon size={size} aria-hidden="true" />;
}

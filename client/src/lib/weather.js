// Helpers that turn raw weather numbers into words and colours.

// Open-Meteo describes the sky with a number (a "WMO code"). We translate it.
export function describe(code) {
  if (code === 0) return { label: "Clear sky", kind: "clear" };
  if (code === 1) return { label: "Mostly clear", kind: "clear" };
  if (code === 2) return { label: "Partly cloudy", kind: "partly" };
  if (code === 3) return { label: "Overcast", kind: "cloud" };
  if (code === 45 || code === 48) return { label: "Fog", kind: "fog" };
  if (code >= 51 && code <= 57) return { label: "Drizzle", kind: "rain" };
  if (code >= 61 && code <= 67) return { label: "Rain", kind: "rain" };
  if (code >= 71 && code <= 77) return { label: "Snow", kind: "snow" };
  if (code >= 80 && code <= 82) return { label: "Rain showers", kind: "rain" };
  if (code === 85 || code === 86) return { label: "Snow showers", kind: "snow" };
  if (code >= 95) return { label: "Thunderstorm", kind: "storm" };
  return { label: "Unknown", kind: "cloud" };
}

// The whole page changes colour with the weather. Each theme is a small set of colours.
const THEMES = {
  clear:  { bg1: "#BFE0F5", bg2: "#F9E7C2", ink: "#10283D", soft: "#3F5C74", panel: "rgba(255,255,255,0.55)", menu: "#FFFFFF", line: "rgba(16,40,61,0.14)", accent: "#E8871E", accent2: "#2F7FC1" },
  cloud:  { bg1: "#C5D1DC", bg2: "#E9EEF2", ink: "#1E2B38", soft: "#4A5C6D", panel: "rgba(255,255,255,0.55)", menu: "#FFFFFF", line: "rgba(30,43,56,0.14)", accent: "#5B7C99", accent2: "#2F7FC1" },
  rain:   { bg1: "#9DB4C8", bg2: "#D2DEE8", ink: "#14212D", soft: "#3D5368", panel: "rgba(255,255,255,0.5)", menu: "#FFFFFF", line: "rgba(20,33,45,0.16)", accent: "#2F6FA8", accent2: "#1B4B7A" },
  snow:   { bg1: "#D8E4F2", bg2: "#F5F8FC", ink: "#1C2A3D", soft: "#506683", panel: "rgba(255,255,255,0.6)", menu: "#FFFFFF", line: "rgba(28,42,61,0.14)", accent: "#5A7FC4", accent2: "#3B5E9E" },
  storm:  { bg1: "#262E4B", bg2: "#4A4F73", ink: "#F1F3FA", soft: "#B9C0DA", panel: "rgba(255,255,255,0.09)", menu: "#2B3358", line: "rgba(241,243,250,0.18)", accent: "#F5C84B", accent2: "#8FB4FF" },
  night:  { bg1: "#0F1B35", bg2: "#2A2F5C", ink: "#EEF1FB", soft: "#A9B3D6", panel: "rgba(255,255,255,0.08)", menu: "#1C2650", line: "rgba(238,241,251,0.16)", accent: "#FFC76B", accent2: "#7FA8FF" },
};

export function getTheme(code, isDay) {
  const { kind } = describe(code);
  if (kind === "storm") return THEMES.storm;
  if (!isDay) return THEMES.night;
  if (kind === "partly") return THEMES.clear;
  if (kind === "fog") return THEMES.cloud;
  return THEMES[kind];
}

// Turns a theme into CSS variables that styles.css can use.
export function themeVars(t) {
  return {
    "--bg1": t.bg1, "--bg2": t.bg2, "--ink": t.ink, "--soft": t.soft,
    "--panel": t.panel, "--menu": t.menu, "--line": t.line,
    "--accent": t.accent, "--accent2": t.accent2,
  };
}

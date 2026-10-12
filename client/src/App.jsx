import { useEffect, useState } from "react";
import SearchBar from "./components/SearchBar.jsx";
import Hero from "./components/Hero.jsx";
import HourlyChart from "./components/HourlyChart.jsx";
import WeekPanel from "./components/WeekPanel.jsx";
import { getTheme, themeVars } from "./lib/weather.js";

// The city shown when the app first opens. Change it to any place you like.
const DEFAULT_PLACE = {
  name: "London",
  region: "England",
  country: "United Kingdom",
  lat: 51.5072,
  lon: -0.1276,
};

export default function App() {
  const [place, setPlace] = useState(DEFAULT_PLACE);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState("");
  const [unit, setUnit] = useState("C");

  // Whenever "place" changes, ask our Express server for that place's weather.
  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    fetch(`/api/weather?lat=${place.lat}&lon=${place.lon}`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Something went wrong.");
        return body;
      })
      .then((body) => {
        if (cancelled) return;
        setData(body);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setStatus("error");
      });

    return () => {
      cancelled = true; // ignore the answer if the user already picked another city
    };
  }, [place]);

  const theme = data ? getTheme(data.current.code, data.current.isDay) : getTheme(0, true);
  const toUnit = (celsius) => (unit === "C" ? celsius : (celsius * 9) / 5 + 32);

  return (
    <div className="app" style={themeVars(theme)}>
      <div className="shell">
        <header className="topbar">
          <span className="brand">Nimbus</span>
          <div className="topbar-tools">
            <SearchBar onPick={setPlace} />
            <div className="unit-toggle" role="group" aria-label="Temperature unit">
              {["C", "F"].map((u) => (
                <button key={u} aria-pressed={unit === u} onClick={() => setUnit(u)}>
                  °{u}
                </button>
              ))}
            </div>
          </div>
        </header>

        {status === "loading" && !data && <p className="notice">Loading the forecast…</p>}

        {status === "error" && (
          <div className="notice">
            <p>Could not load the forecast. {error}</p>
            <button onClick={() => setPlace({ ...place })}>Try again</button>
          </div>
        )}

        {data && (
          <main className={status === "loading" ? "is-refreshing" : ""}>
            <Hero place={place} current={data.current} today={data.daily[0]} unit={unit} toUnit={toUnit} />
            <HourlyChart hourly={data.hourly} unit={unit} toUnit={toUnit} theme={theme} />
            <WeekPanel daily={data.daily} unit={unit} toUnit={toUnit} theme={theme} />
          </main>
        )}

        <footer className="footer">Weather data by Open-Meteo.com</footer>
      </div>
    </div>
  );
}

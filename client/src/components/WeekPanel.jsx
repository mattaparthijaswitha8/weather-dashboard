import {
  ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip,
} from "recharts";
import WeatherIcon from "./WeatherIcon.jsx";
import ChartTooltip from "./ChartTooltip.jsx";

const reduceMotion =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function dayName(dateString, index) {
  if (index === 0) return "Today";
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("en-US", { weekday: "short" });
}

export default function WeekPanel({ daily, unit, toUnit, theme }) {
  // Find the coldest and hottest values of the week so every bar uses the same scale.
  const weekMin = Math.min(...daily.map((d) => toUnit(d.min)));
  const weekMax = Math.max(...daily.map((d) => toUnit(d.max)));
  const span = Math.max(weekMax - weekMin, 1);

  const rainRows = daily.map((d, i) => ({ label: dayName(d.date, i), value: d.rain ?? 0 }));
  const axisTick = { fill: theme.soft, fontSize: 12 };

  return (
    <div className="week">
      <section className="panel">
        <h2>7-day forecast</h2>
        <p className="muted">Each bar spans the low to the high of that day.</p>
        <ul className="days">
          {daily.map((d, i) => {
            const low = toUnit(d.min);
            const high = toUnit(d.max);
            return (
              <li className="day" key={d.date}>
                <span className="day-name">{dayName(d.date, i)}</span>
                <WeatherIcon code={d.code} size={20} />
                <span className="day-low">{Math.round(low)}°</span>
                <div className="track" aria-hidden="true">
                  <div
                    className="fill"
                    style={{
                      left: `${((low - weekMin) / span) * 100}%`,
                      width: `${Math.max(((high - low) / span) * 100, 4)}%`,
                    }}
                  />
                </div>
                <span className="day-high">{Math.round(high)}°</span>
              </li>
            );
          })}
        </ul>
        <p className="muted unit-note">Temperatures in °{unit}</p>
      </section>

      <section className="panel">
        <h2>Rainfall this week</h2>
        <p className="muted">Total expected rain per day, in millimetres.</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={rainRows} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={theme.line} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick} />
            <YAxis tickLine={false} axisLine={false} tick={axisTick} width={36} allowDecimals={false} />
            <Tooltip content={<ChartTooltip suffix=" mm" decimals={1} />} cursor={{ fill: theme.line }} />
            <Bar dataKey="value" fill={theme.accent2} radius={[6, 6, 0, 0]} isAnimationActive={!reduceMotion} />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}

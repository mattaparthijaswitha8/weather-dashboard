import { useState } from "react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  CartesianGrid, XAxis, YAxis, Tooltip,
} from "recharts";
import ChartTooltip from "./ChartTooltip.jsx";

const reduceMotion =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function HourlyChart({ hourly, unit, toUnit, theme }) {
  const [tab, setTab] = useState("temp");

  // One entry per tab: how to read the value, what to call it, how to draw it.
  const metrics = {
    temp:     { label: "Temperature", suffix: `°${unit}`, kind: "area", color: theme.accent,  pick: (h) => toUnit(h.temp) },
    rain:     { label: "Rain chance", suffix: "%",        kind: "bar",  color: theme.accent2, pick: (h) => h.rain ?? 0 },
    humidity: { label: "Humidity",    suffix: "%",        kind: "area", color: theme.accent2, pick: (h) => h.humidity },
    wind:     { label: "Wind",        suffix: " km/h",    kind: "area", color: theme.accent,  pick: (h) => h.wind },
  };
  const metric = metrics[tab];

  const rows = hourly.map((h) => ({ label: h.time.slice(11, 16), value: metric.pick(h) }));
  const peak = rows.reduce((best, row) => (row.value > best.value ? row : best), rows[0]);

  const axisTick = { fill: theme.soft, fontSize: 12 };
  const margin = { top: 10, right: 12, left: 0, bottom: 0 };

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Next 24 hours</h2>
          <p className="muted">
            Highest {metric.label.toLowerCase()}: {Math.round(peak.value)}
            {metric.suffix} at {peak.label}
          </p>
        </div>

        <div className="tabs" role="tablist" aria-label="Chart type">
          {Object.entries(metrics).map(([key, m]) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={290}>
        {metric.kind === "bar" ? (
          <BarChart data={rows} margin={margin}>
            <CartesianGrid vertical={false} stroke={theme.line} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick} minTickGap={24} />
            <YAxis tickLine={false} axisLine={false} tick={axisTick} width={40} domain={[0, 100]} unit="%" />
            <Tooltip content={<ChartTooltip suffix={metric.suffix} />} cursor={{ fill: theme.line }} />
            <Bar dataKey="value" fill={metric.color} radius={[6, 6, 0, 0]} isAnimationActive={!reduceMotion} />
          </BarChart>
        ) : (
          <AreaChart data={rows} margin={margin}>
            <defs>
              <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={metric.color} stopOpacity={0.45} />
                <stop offset="100%" stopColor={metric.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={theme.line} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick} minTickGap={24} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={axisTick}
              width={40}
              tickFormatter={(v) => Math.round(v)}
              domain={[(min) => Math.floor(min - 2), (max) => Math.ceil(max + 2)]}
            />
            <Tooltip content={<ChartTooltip suffix={metric.suffix} />} cursor={{ stroke: theme.line }} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={metric.color}
              strokeWidth={3}
              fill="url(#fillGradient)"
              isAnimationActive={!reduceMotion}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </section>
  );
}

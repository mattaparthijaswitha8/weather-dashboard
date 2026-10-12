// The little box that appears when you hover over a chart.
export default function ChartTooltip({ active, payload, label, suffix = "", decimals = 0 }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="tip">
      <strong>
        {Number(payload[0].value).toFixed(decimals)}
        {suffix}
      </strong>
      <span>{label}</span>
    </div>
  );
}

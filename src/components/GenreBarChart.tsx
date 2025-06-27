"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface GenreBarChartProps {
  data: { genre: string; count: number }[];
  maxBars?: number;
  title?: string;
  subtitle?: string;
}

export default function GenreBarChart({
  data,
  maxBars = 12,
  title = "Genre Distribution",
  subtitle = "",
}: GenreBarChartProps) {
  const chartData = data
    .sort((a, b) => b.count - a.count)
    .slice(0, maxBars);

  if (!chartData.length) return null;

  return (
    <div className="mb-10">
      {title && (
        <h2 className="text-lg font-bold text-white">{title}</h2>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <XAxis dataKey="genre" tick={{ fill: "white", fontSize: 12 }} />
          <YAxis tick={{ fill: "white", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#222",
              border: "none",
              color: "white",
            }}
            cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
          />
          <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      {subtitle && (
        <p className="text-white/60 text-xs mt-2">{subtitle}</p>
      )}
    </div>
  );
}

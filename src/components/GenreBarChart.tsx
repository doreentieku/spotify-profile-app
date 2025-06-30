"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

type ClickedBar = {
  payload: {
    genre: string;
    count: number;
  };
};

import { useGenreFilter } from "@/context/GenreFilterContext";

interface GenreBarChartProps {
  data: { genre: string; count: number }[];
  maxBars?: number;
  title?: string;
  subtitle?: string;
}

export default function GenreBarChart({
  data,
  maxBars = 20,
  title = "Genre Distribution",
  subtitle = "",
}: GenreBarChartProps) {
  const { setSelectedGenre } = useGenreFilter();
  const chartData = data.sort((a, b) => b.count - a.count).slice(0, maxBars);

  if (!chartData.length) return null;

  return (
    <div className="mb-10">
      {title && (
        <h3 className="text-white font-semibold text-sm mb-2">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} barSize={40}>
          <XAxis dataKey="genre" tick={{ fill: "white", fontSize: 11 }} />
          <YAxis tick={{ fill: "white", fontSize: 12 }} />
          <Tooltip
            labelClassName="backdrop-blur-lg"
            contentStyle={{
              backgroundColor: "#222",
              border: "none",
            }}
            cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
          />
          <Bar
            dataKey="count"
            fill="#22c55e"
            radius={[10, 10, 0, 0]}
            onClick={(data) => {
              const { payload } = data as unknown as ClickedBar;
              if (payload?.genre) {
                setSelectedGenre(payload.genre);
              }
            }}
            className="cursor-pointer"
          />
        </BarChart>
      </ResponsiveContainer>
      {subtitle && <p className="text-white/60 text-xs mt-2">{subtitle}</p>}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import useSpotifyLogout from "@/lib/useSpotifyLogout";
import GenreBarChart from "./GenreBarChart";

type TimeRange = "short_term" | "medium_term" | "long_term";

interface TopGenresProps {
  accessToken: string;
}

interface Artist {
  genres: string[];
}

export default function TopGenres({ accessToken }: TopGenresProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("medium_term");
  const [genreData, setGenreData] = useState<
    { genre: string; count: number }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const logout = useSpotifyLogout();

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch(
          `https://api.spotify.com/v1/me/top/artists?limit=50&time_range=${timeRange}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          const msg = data.error?.message || "";
          if (
            msg.toLowerCase().includes("token") ||
            msg.toLowerCase().includes("expired") ||
            res.status === 401
          ) {
            logout();
            return;
          }
          throw new Error(msg || "Failed to fetch top genres");
        }

        const allGenres = data.items.flatMap((artist: Artist) => artist.genres);
        const genreFrequency: Record<string, number> = {};

        for (const genre of allGenres) {
          genreFrequency[genre] = (genreFrequency[genre] || 0) + 1;
        }

        const topGenres = Object.entries(genreFrequency)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 12)
          .map(([genre, count]) => ({ genre, count }));

        setGenreData(topGenres);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    };

    if (accessToken) fetchGenres();
  }, [accessToken, timeRange]);

  return (
    <div className="max-w-8xl mx-auto px-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-white">Top Played Genres</h2>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as TimeRange)}
          className="bg-zinc-800 text-white border border-white/30 text-sm rounded-md px-2 py-1 focus:outline-none"
        >
          <option value="short_term">Last 4 weeks</option>
          <option value="medium_term">Last 6 months</option>
          <option value="long_term">All time</option>
        </select>
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      {!genreData.length && !error && (
        <p className="text-gray-300 text-sm text-center">Loading...</p>
      )}

      <GenreBarChart
        data={genreData}
        title=""
        subtitle="Top 12 genres based on your most-played artists"
      />
    </div>
  );
}

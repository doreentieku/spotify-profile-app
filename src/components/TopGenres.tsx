"use client";

import { useEffect, useState } from "react";
import useSpotifyLogout from "@/lib/useSpotifyLogout";

type TimeRange = "short_term" | "medium_term" | "long_term";

interface TopGenresProps {
  accessToken: string;
}

interface Artist {
  genres: string[];
}

export default function TopGenres({ accessToken }: TopGenresProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("medium_term");
  const [genreCounts, setGenreCounts] = useState<Record<string, number>>({});
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
          throw new Error(msg || "Failed to fetch top genre");
        }
        const allGenres = data.items.flatMap((artist: Artist) => artist.genres);

        const genreFrequency: Record<string, number> = {};
        for (const genre of allGenres) {
          genreFrequency[genre] = (genreFrequency[genre] || 0) + 1;
        }

        setGenreCounts(
          Object.fromEntries(
            Object.entries(genreFrequency)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 10)
          )
        );
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
      {!Object.keys(genreCounts).length && !error && (
        <p className="text-gray-300 text-sm text-center">Loading...</p>
      )}

      <ul className="space-y-2">
        {Object.entries(genreCounts).map(([genre, count]) => (
          <li
            key={genre}
            className="flex items-center space-x-4 bg-white/10 px-4 py-2 rounded-md"
          >
            <div className="w-40 text-white text-sm capitalize">{genre}</div>
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div
                className="bg-green-400 h-2 rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${
                    (count / genreCounts[Object.keys(genreCounts)[0]]) * 100
                  }%`,
                }}
              ></div>
            </div>
            <div className="text-white/60 text-xs">{count}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

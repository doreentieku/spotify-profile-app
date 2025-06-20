"use client";

import { useEffect, useState } from "react";

interface MostActiveHourProps {
  accessToken: string;
}

interface RecentlyPlayedItem {
  played_at: string;
}

export default function MostActiveHour({ accessToken }: MostActiveHourProps) {
  const [activeHour, setActiveHour] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentlyPlayed = async () => {
      try {
        const res = await fetch(
          "https://api.spotify.com/v1/me/player/recently-played?limit=50",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch recently played tracks");

        const data = await res.json();
        const hours: number[] = data.items.map((item: RecentlyPlayedItem) =>
          new Date(item.played_at).getHours()
        );

        const frequencyMap: Record<number, number> = {};
        for (const hour of hours) {
          frequencyMap[hour] = (frequencyMap[hour] || 0) + 1;
        }

        const mostActive = Object.entries(frequencyMap).reduce(
          (acc, [hour, count]) =>
            count > acc.count ? { hour: +hour, count } : acc,
          { hour: 0, count: 0 }
        );

        setActiveHour(mostActive.hour);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err));
        }
      }
    };

    if (accessToken) fetchRecentlyPlayed();
  }, [accessToken]);

  return (
    <div className="text-center text-white mt-6">
      {error && <p className="text-red-500">{error}</p>}
      {activeHour !== null ? (
        <p className="text-white/80 text-md">
          You most often listen to music around{" "}
          <span className="font-semibold">
            {activeHour % 12 || 12} {activeHour >= 12 ? "PM" : "AM"}
          </span>
        </p>
      ) : (
        <p className="text-white/70">Loading listening activity...</p>
      )}
    </div>
  );
}

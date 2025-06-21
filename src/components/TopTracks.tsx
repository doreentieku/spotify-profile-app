"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
type TimeRange = "short_term" | "medium_term" | "long_term";
interface SpotifyTopTracksResponse {
  items: Track[];
}

interface TopTracksProps {
  accessToken: string;
  deviceId: string | null;
}

interface Track {
  popularity: number;
  id: string;
  name: string;
  uri: string;
  album: {
    images: { url: string }[];
  };
  artists: { name: string }[];
  external_urls: { spotify: string };
}

export default function TopTracks({ accessToken, deviceId }: TopTracksProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("medium_term");

  const [tracks, setTracks] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopTracks = async () => {
      try {
        const res = await fetch(
          `https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=${timeRange}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch top tracks");

        const data: SpotifyTopTracksResponse = await res.json();
        setTracks(data.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    };

    if (accessToken) fetchTopTracks();
  }, [accessToken, timeRange]);

  function getPopularityColor(popularity: number) {
    if (popularity >= 70) return "bg-green-400";
    if (popularity >= 40) return "bg-yellow-400";
    if (popularity < 40) return "bg-red-400";
    return "bg-red-400";
  }

  const scrollContainerTopTracks = (direction: "left" | "right") => {
    const container = document.getElementById("track-scroll-container");
    if (!container) return;
    const scrollAmount = 300;
    container.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  async function playTrack(uri: string) {
    if (!accessToken || !deviceId) return;

    try {
      // 1. Transfer playback to Web SDK device
      await fetch("https://api.spotify.com/v1/me/player", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_ids: [deviceId],
          play: false, // Don't play yet — we'll load the track manually
        }),
      });

      // 2. Play the track on that device
      await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uris: [uri] }),
        }
      );
    } catch (err) {
      console.error("Failed to play track", err);
    }
  }


  return (
    <div className="max-w-8xl mx-auto">
      <div className="flex justify-between items-center mb-4 px-4">
        <h2 className="text-lg font-bold text-white pl-5">Top Tracks</h2>
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
      {!tracks.length && !error && (
        <p className="text-gray-300 text-sm text-center">Loading...</p>
      )}

      <div className="relative px-4">
        <button
          onClick={() => scrollContainerTopTracks("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full hidden md:block cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>

        <div
          id="track-scroll-container"
          className="overflow-x-auto flex space-x-4 scroll-smooth"
        >
          <div className="flex space-x-4">
            {tracks.map((track, index) => (
              <div
                key={track.id}
                className="w-64 min-w-[16rem] p-4 bg-white/10 backdrop-blur-none border border-white/20 rounded-xl shadow-md text-white hover:bg-white/20 transition"
                
              >
                <Image
                  src={track.album.images[0]?.url}
                  alt={track.name}
                  width={300}
                  height={300}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
                <h3 className="text-md font-bold mb-1">
                  #{index + 1} {track.name}
                </h3>
                <p className="text-sm text-white/70 mb-1">
                  {track.artists.map((a) => a.name).join(", ")}
                </p>

                {/* Popularity bar */}
                <div className="mt-2 group relative">
                  <div className="text-xs text-white/60 mb-1">
                    Global Popularity
                  </div>

                  {/* Popularity Bar Background */}
                  <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                    {/* Colored and Animated Popularity Bar */}
                    <div
                      className={`${getPopularityColor(
                        track.popularity
                      )} h-2 rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${track.popularity}%` }}
                    ></div>
                  </div>

                  {/* Tooltip */}
                  <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    Popularity: {track.popularity}/100
                  </div>
                </div>

                <button
                  onClick={() => playTrack(track.uri)}
                  className="mt-3 px-4 py-2 text-sm font-medium text-white rounded-full backdrop-blur-md bg-white/10 hover:bg-green-300/80 transition duration-200 shadow-lg cursor-pointer"
                >
                  ▶ Play
                </button>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => scrollContainerTopTracks("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full hidden md:block cursor-pointer"
        >
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}

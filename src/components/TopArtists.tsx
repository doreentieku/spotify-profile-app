"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface TopArtistsProps {
  accessToken: string;
}

interface Artist {
  popularity: number;
  id: string;
  name: string;
  genres: string[];
  images: { url: string }[];
  external_urls: { spotify: string };
}

export default function TopArtists({ accessToken }: TopArtistsProps) {
  const [timeRange, setTimeRange] = useState<
    "short_term" | "medium_term" | "long_term"
  >("medium_term");
  const [artists, setArtists] = useState<Artist[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopArtists = async () => {
      try {
        const res = await fetch(
          `https://api.spotify.com/v1/me/top/artists?limit=10&time_range=${timeRange}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch top artists");

        const data = await res.json();
        setArtists(data.items);
      } catch (err: any) {
        setError(err.message);
      }
    };

    if (accessToken) fetchTopArtists();
  }, [accessToken, timeRange]);
  // console.log("Artists", artists)

  function getPopularityColor(popularity: number) {
    if (popularity >= 70) return "bg-green-400";
    if (popularity >= 40) return "bg-yellow-400";
    if (popularity < 40) return "bg-red-400";
    return "bg-red-400";
  }
  const scrollContainer = (direction: "left" | "right") => {
    const container = document.getElementById("artists-scroll-container");
    if (!container) return;
    const scrollAmount = 300;
    container.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="max-w-8xl mx-auto">
      <div className="flex justify-between items-center mb-4 px-4">
        <h2 className="text-lg font-bold text-white pl-5">Top Artists</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="bg-zinc-800 text-white border border-white/30 text-sm rounded-md px-2 py-1 focus:outline-none"
        >
          <option value="short_term">Last 4 weeks</option>
          <option value="medium_term">Last 6 months</option>
          <option value="long_term">All time</option>
        </select>
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      {!artists.length && !error && (
        <p className="text-gray-300 text-sm text-center">Loading...</p>
      )}

      <div className="relative px-4">
        <button
          onClick={() => scrollContainer("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full hidden md:block cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>

        <div
          id="artists-scroll-container"
          className="overflow-x-auto flex space-x-4 scroll-smooth"
        >
          <div className="flex space-x-4">
            {artists.map((artist) => (
              <div
                key={artist.id}
                className="w-60 min-w-[15rem] p-4 bg-white/10 backdrop-blur-none border border-white/20 rounded-xl shadow-md text-white hover:bg-white/20 transition"
              >
                <img
                  src={artist.images[0]?.url}
                  alt={artist.name}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
                <h3 className="text-lg font-semibold">{artist.name}</h3>
                <p className="text-sm text-white/70 mb-2">
                  {artist.genres.slice(0, 2).join(", ") || ""}
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
                        artist.popularity
                      )} h-2 rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${artist.popularity}%` }}
                    ></div>
                  </div>

                  {/* Tooltip */}
                  <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    Popularity: {artist.popularity}/100
                  </div>
                </div>
                <a
                  href={artist.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-white/70 hover:text-white underline"
                >
                  View on Spotify
                </a>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => scrollContainer("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full hidden md:block cursor-pointer"
        >
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}

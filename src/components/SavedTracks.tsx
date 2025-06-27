"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import PlayButton from "@/components/PlayButton";
import useSpotifyLogout from "@/lib/useSpotifyLogout";

interface SavedTracksProps {
  accessToken: string;
  deviceId: string | null;
}

interface Track {
  id: string;
  name: string;
  uri: string;
  popularity: number;
  album: {
    images: { url: string }[];
  };
  artists: { name: string }[];
}

interface SavedTrackItem {
  added_at: string;
  track: Track;
}

interface SpotifySavedTracksResponse {
  items: SavedTrackItem[];
  total: number;
  limit: number;
  offset: number;
  next: string | null;
  previous: string | null;
}

export default function SavedTracks({ accessToken, deviceId }: SavedTracksProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 20;
  const logout = useSpotifyLogout();

  useEffect(() => {
    const fetchSavedTracks = async () => {
      try {
        const res = await fetch(
          `https://api.spotify.com/v1/me/tracks?limit=${limit}&offset=${offset}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const data: SpotifySavedTracksResponse & { error?: { message?: string } } = await res.json();

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
          throw new Error(msg || "Failed to fetch saved tracks");
        }

        setTracks(data.items.map((item) => item.track));
        setTotal(data.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    };

    if (accessToken) fetchSavedTracks();
  }, [accessToken, offset]);

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h2 className="text-lg font-bold text-white mb-4">Your Saved Tracks</h2>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      {!tracks.length && !error && (
        <p className="text-gray-300 text-sm text-center">Loading...</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {tracks.map((track, index) => (
          <div
            key={track.id}
            className="p-4 bg-white/10 border border-white/20 rounded-xl shadow-md text-white hover:bg-white/20 transition"
          >
            <Image
              src={track.album.images[0]?.url}
              alt={track.name}
              width={300}
              height={300}
              className="w-full h-40 object-cover rounded-lg mb-3"
            />
            <h3 className="text-md font-bold mb-1">
              #{offset + index + 1} {track.name}
            </h3>
            <p className="text-sm text-white/70 mb-2">
              {track.artists.map((a) => a.name).join(", ")}
            </p>
            <PlayButton uri={track.uri} accessToken={accessToken} deviceId={deviceId} />
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center space-x-4 text-white">
        <button
          disabled={offset === 0}
          onClick={() => setOffset((prev) => Math.max(prev - limit, 0))}
          className={`px-4 py-2 rounded bg-zinc-700 hover:bg-zinc-600 disabled:opacity-30`}
        >
          Previous
        </button>
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <button
          disabled={offset + limit >= total}
          onClick={() => setOffset((prev) => prev + limit)}
          className={`px-4 py-2 rounded bg-zinc-700 hover:bg-zinc-600 disabled:opacity-30`}
        >
          Next
        </button>
      </div>
    </div>
  );
}

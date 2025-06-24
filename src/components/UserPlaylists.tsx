"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import useSpotifyLogout from "@/lib/useSpotifyLogout";

interface Playlist {
  id: string;
  name: string;
  images: { url: string }[];
  tracks: { total: number };
  external_urls: { spotify: string };
}

export default function UserPlaylists({
  accessToken,
}: {
  accessToken: string;
}) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [error, setError] = useState<string | null>(null);
  const logout = useSpotifyLogout();

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const res = await fetch("https://api.spotify.com/v1/me/playlists", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

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
          throw new Error(msg || "Failed to fetch playlists");
        }

        setPlaylists(data.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    };

    if (accessToken) {
      fetchPlaylists();
    }
  }, [accessToken]);

  return (
    <div className="py-8 space-y-6 max-w-6xl mx-auto text-white">
      <h2 className="text-2xl font-bold">Your Playlists</h2>

      {error && <p className="text-red-400">{error}</p>}
      {!error && playlists.length === 0 && (
        <p className="text-gray-400">No playlists found.</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {playlists.map((playlist) => (
          <a
            key={playlist.id}
            href={playlist.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/10 hover:bg-white/20 transition p-4 rounded-lg shadow"
          >
            <Image
              src={playlist.images?.[0]?.url || "/placeholder.jpg"}
              alt={playlist.name}
              width={300}
              height={300}
              className="w-full h-40 object-cover rounded-md mb-2"
            />

            <div className="font-semibold text-sm truncate">
              {playlist.name}
            </div>
            <div className="text-xs text-white/60">
              {playlist.tracks.total} tracks
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import PlayButton from "@/components/PlayButton";
import { IoIosAddCircleOutline } from "react-icons/io";
import useSpotifyProfile from "@/lib/useSpotifyProfile";
import useSpotifyLogout from "@/lib/useSpotifyLogout";
import CreatePlaylist from "@/components/CreatePlaylist";
import { Track } from "@/types/spotify";

interface SearchProps {
  accessToken: string;
  deviceId: string | null;
}

const GENRES = [
  "chill",
  "afrobeat",
  "khaleeji",
  "rock",
  "jazz",
  "lofi",
  "edm",
  "k-pop",
  "classical",
  "trap",
  "ambient",
  "egyptian-pop",
  "pop",
];

export default function SearchWithPlaylist({
  accessToken,
  deviceId,
}: SearchProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTracks, setSelectedTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playlistName, setPlaylistName] = useState("");
  const [playlistDesc, setPlaylistDesc] = useState("");
  const [message, setMessage] = useState("");
  const [genres, setGenres] = useState<string[]>(["chill"]);
  const profile = useSpotifyProfile(accessToken);
  const logout = useSpotifyLogout();

  useEffect(() => {
    if (selectedTracks.length === 0 && genres.length > 0) {
      const title =
        genres.length === 1
          ? `${genres[0][0].toUpperCase() + genres[0].slice(1)
          } Search from Spoticizr`
          : `${genres
            .slice(0, 2)
            .map((g) => g[0].toUpperCase() + g.slice(1))
            .join(" + ")} Search Mix from Spoticizr`;
      setPlaylistName(title);
    }
  }, [genres, selectedTracks]);

  const fetchSearchResult = async () => {
    if (genres.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const genreParam = genres.join(",");
      const res = await fetch(`/api/search?genre=${genreParam}`, {
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
        throw new Error(msg || "Failed to fetch tracks");
      }

      setTracks(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken && genres.length > 0) {
      fetchSearchResult();
    }
  }, [genres, accessToken]);

  const addToPlaylist = (track: Track) => {
    if (!selectedTracks.find((t) => t.id === track.id)) {
      setSelectedTracks((prev) => [...prev, track]);
    }
  };

  const removeFromPlaylist = (id: string) => {
    setSelectedTracks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="py-8 space-y-10 max-w-8xl mx-auto text-white">
      <div className="flex flex-col lg:flex-row gap-6 mb-10">
        {/* Playlist Builder */}
        {selectedTracks && (
          <div className="flex-1 space-y-6">
            <div className="p-4 bg-white/10 rounded-xl border border-white/10 space-y-4">
              <h3 className="text-xl font-bold">Selected Tracks</h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {selectedTracks.map((track) => (
                  <div
                    key={track.id}
                    className="bg-black/40 p-3 rounded-lg text-sm text-white flex flex-col gap-1"
                  >
                    <div className="truncate font-semibold">{track.name}</div>
                    <div className="text-xs text-white/60 truncate">
                      {track.artists.map((a) => a.name).join(", ")}
                    </div>
                    <button
                      onClick={() => removeFromPlaylist(track.id)}
                      className="text-red-400 text-xs underline mt-1 cursor-pointer"
                    >
                      ❌ Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <CreatePlaylist
              accessToken={accessToken}
              profile={profile}
              selectedTracks={selectedTracks}
              setSelectedTracks={setSelectedTracks}
              onSuccess={(name) => {
                setMessage(`Playlist "${name}" created!`);
                setTimeout(() => setMessage(""), 5000);
              }}
            />
          </div>
        )}

        {message && (
          <div className="fixed top-28 left-1/2 -translate-x-1/2 px-5 py-3 text-lg text-white text-center bg-black/70 rounded-md border border-white/10 z-50">
            {message}
          </div>
        )}
      </div>

      {/* Track Cards */}
      {loading && <p className="text-gray-300">Loading...</p>}

      {!loading && !error && tracks.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition shadow"
            >
              <Image
                src={track.album.images[0]?.url}
                alt={track.name}
                width={300}
                height={300}
                className="rounded-lg w-full h-36 object-cover mb-2"
              />
              <div className="font-semibold text-sm truncate">{track.name}</div>
              <div className="text-xs text-white/60 truncate">
                {track.artists.map((a) => a.name).join(", ")}
              </div>

              <div className="flex gap-4 mt-2">
                <PlayButton
                  uri={track.uri}
                  accessToken={accessToken}
                  deviceId={deviceId}
                />
                <button
                  onClick={() => addToPlaylist(track)}
                  className="mt-3 px-4 py-2 text-sm font-medium text-white rounded-full bg-green-500/20 hover:bg-green-800/80 transition duration-200 shadow-lg cursor-pointer"
                >
                  <IoIosAddCircleOutline />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

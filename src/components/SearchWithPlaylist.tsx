"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import PlayButton from "@/components/PlayButton";
import { IoIosAddCircleOutline } from "react-icons/io";
import useSpotifyProfile from "@/lib/useSpotifyProfile";
import CreatePlaylist from "@/components/CreatePlaylist";
import { Track } from "@/types/spotify";

interface SearchProps {
  accessToken: string;
  deviceId: string | null;
}

const GENRES = [
  "chill", "afrobeat", "khaleeji", "rock", "jazz",
  "lofi", "edm", "k-pop", "classical", "trap",
  "ambient", "egyptian-pop", "pop"
];

const SEARCH_TYPES = [
  "tracks", "playlist", "acoustic", "relaxing", "top hits", "live"
];

const TIME_RANGES = [
  { label: "Last 4 Weeks", value: "short_term" },
  { label: "Last 6 Months", value: "medium_term" },
  { label: "All Time", value: "long_term" },
];


export default function SearchWithPlaylist({
  accessToken,
  deviceId,
}: SearchProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["tracks"]);
  const [selectedTracks, setSelectedTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playlistName, setPlaylistName] = useState("");
  const [message, setMessage] = useState("");
  const profile = useSpotifyProfile(accessToken);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(["chill"]);
  const [timeRange, setTimeRange] = useState("short_term");

  // Toggle genre multi-select
  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  // Toggle type multi-select
  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Update playlist name based on selected genres and types
  useEffect(() => {
    if (selectedGenres.length === 0) {
      setPlaylistName("Custom Playlist from Spoticizr");
      return;
    }

    const genresPart =
      selectedGenres.length === 1
        ? selectedGenres[0][0].toUpperCase() + selectedGenres[0].slice(1)
        : selectedGenres
          .slice(0, 3) // max 3 genres in title
          .map((g) => g[0].toUpperCase() + g.slice(1))
          .join(" + ");

    const typesPart = selectedTypes.length > 0 ? selectedTypes.join(", ") : "";

    setPlaylistName(`SPOTICIZR - ${genresPart} ${typesPart}`);
  }, [selectedGenres, selectedTypes]);

  const fetchSearchResult = async () => {
    setLoading(true);
    setError(null);

    // Join genres with spaces for search query
    const genresString = selectedGenres.join(" ");
    const typesString = selectedTypes.join(" ");
    const query = `${genresString} ${typesString}`.trim();

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to fetch results");
      }

      setTracks(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  // Fetch data whenever selected genres/types or accessToken change
  useEffect(() => {
    if (accessToken) {
      fetchSearchResult();
    }
  }, [selectedGenres, selectedTypes, accessToken]);

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
      <div>
        {/* Genres multi-select */}
        <div className="flex flex-wrap gap-3 mb-4">
          {GENRES.map((genre) => {
            const isSelected = selectedGenres.includes(genre);
            return (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`px-3 py-1 rounded-full text-sm border transition
                ${isSelected
                    ? "bg-green-600 text-white"
                    : "bg-zinc-800 text-gray-300"
                  }
                hover:bg-green-700`}
              >
                {genre}
              </button>
            );
          })}
        </div>

        {/* Search types multi-select */}
        <div className="flex flex-wrap gap-3 mb-6">
          {SEARCH_TYPES.map((type) => {
            const isSelected = selectedTypes.includes(type);
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`px-3 py-1 rounded-full text-sm border transition
                ${isSelected
                    ? "bg-green-600 text-white"
                    : "bg-zinc-800 text-gray-300"
                  }
                hover:bg-green-700`}
              >
                {type}
              </button>
            );
          })}
        </div>

        {/* Playlist Name */}
        <div className="mb-6 text-white font-semibold text-lg">
          {playlistName}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-10">
          {/* Playlist Builder */}
          {selectedTracks.length > 0 && (
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
                playlistName={playlistName}
                onSuccess={() => {
                  setMessage(`Playlist "${playlistName}" created!`);
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

        {error && <p className="text-red-400">{error}</p>}
      </div>
    </div>
  );
}

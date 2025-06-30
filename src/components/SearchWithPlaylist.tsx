"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import PlayButton from "@/components/PlayButton";
import { IoIosAddCircleOutline } from "react-icons/io";
import { Track } from "@/types/spotify";
import SelectedTracks from "@/components/SelectedTracks";
import Toast from "@/components/Toast";

interface SearchProps {
  accessToken: string;
  deviceId: string | null;
}

export default function SearchWithPlaylist({
  accessToken,
  deviceId,
}: SearchProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTracks, setSelectedTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playlistName, setPlaylistName] = useState(
    "SPOTICIZR - Custom Playlist"
  );
  const [message, setMessage] = useState("");
  // const profile = useSpotifyProfile(accessToken);
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState<Track[]>([]);
  const suggestionRef = useRef<HTMLUListElement>(null);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target as Node)
      ) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initial fetch for suggested tracks and updates on accessToken change
  useEffect(() => {
    if (accessToken) {
      fetchSearchResult("afrobeat tracks");
    }
  }, [accessToken]);

  // Update playlist name whenever searchInput or suggestion is used
  useEffect(() => {
    if (searchInput.trim()) {
      const title = searchInput.trim();
      setPlaylistName(
        `SPOTICIZR - ${title[0].toUpperCase() + title.slice(1)} MIX`
      );
    } else {
      setPlaylistName("SPOTICIZR - Custom Playlist");
    }
  }, [searchInput]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchInput.trim().length > 1) {
        fetchTrackSuggestions(searchInput);
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchInput]);

  const fetchTrackSuggestions = async (term: string) => {
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(term)}&type=track&limit=5`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await res.json();
      setSuggestions(data.items || []);
    } catch (err) {
      console.error("Suggestion error", err);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (trackName: string) => {
    setSearchInput(trackName);
    setSuggestions([]);
    setPlaylistName(
      `SPOTICIZR - ${trackName[0].toUpperCase() + trackName.slice(1)} MIX`
    );
    fetchSearchResult(trackName);
  };

  const fetchSearchResult = async (queryOverride?: string) => {
    setLoading(true);
    setError(null);
    const query = queryOverride ?? searchInput.trim();
    if (!query) return;

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error?.message || "Failed to fetch results");
      setTracks(data.items || []);

      // Set playlist name based on fetched query
      setPlaylistName(
        `SPOTICIZR - ${query[0].toUpperCase() + query.slice(1)} MIX`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken && searchInput.trim()) {
      fetchSearchResult(searchInput);
    }
  }, [accessToken]);

  const addToPlaylist = (track: Track) => {
    if (!selectedTracks.find((t) => t.id === track.id)) {
      setSelectedTracks((prev) => [...prev, track]);
    }
  };

  const addAllToPlaylist = () => {
    const newTracks = tracks.filter(
      (track) => !selectedTracks.some((t) => t.id === track.id)
    );
    setSelectedTracks((prev) => [...prev, ...newTracks]);
  };


  return (
    <div className="py-8 space-y-10 max-w-8xl mx-auto text-white">
      <div>Search for tracks</div>

      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search for a track..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full px-4 py-2 rounded-md bg-zinc-900 text-white border border-zinc-700 focus:outline-none focus:ring focus:ring-green-500"
        />
        {suggestions.length > 0 && (
          <ul
            ref={suggestionRef}
            className="absolute z-50 w-full bg-zinc-800 border border-zinc-700 mt-1 rounded-md shadow-lg max-h-60 overflow-y-auto"
          >
            {suggestions.map((track) => (
              <li
                key={track.id}
                onClick={() => handleSuggestionClick(track.name)}
                className="px-4 py-2 cursor-pointer hover:bg-green-600 text-white text-sm"
              >
                {track.name}
                <span className="text-white/60">
                  {" "}
                  – {track.artists[0]?.name}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {tracks.length > 0 && (
        <div className="flex justify-end mb-4">
          <button
            onClick={addAllToPlaylist}
            className="px-4 py-2 text-sm font-semibold rounded-full bg-green-700 hover:bg-green-800 text-white transition shadow cursor-pointer"
          >
            + Add All to Playlist
          </button>
        </div>
      )}

      {selectedTracks.length > 0 && (
        <SelectedTracks
          selectedTracks={selectedTracks}
          setSelectedTracks={setSelectedTracks}
          accessToken={accessToken}
          playlistName={playlistName}
          setMessage={setMessage}
        />
      )}

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
      {message && (
        <Toast
          message={message}
          type="success"
          onClear={() => setMessage("")}
        />
      )}
      {error && <p className="text-red-400">{error}</p>}
    </div>
  );
}

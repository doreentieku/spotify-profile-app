"use client";

import { useEffect, useState } from "react";
import { Track } from "@/types/spotify";

interface SpotifyProfile {
  id: string;
}

interface Props {
  accessToken: string;
  profile: SpotifyProfile | null;
  selectedTracks: Track[];
  setSelectedTracks: React.Dispatch<React.SetStateAction<Track[]>>;
  playlistName: string;
  onSuccess?: (playlistName: string) => void;
}

export default function CreatePlaylist({
  accessToken,
  profile,
  selectedTracks,
  setSelectedTracks,
  playlistName,
  onSuccess,
}: Props) {
  const [name, setName] = useState(playlistName);
  const [playlistDesc, setPlaylistDesc] = useState("");
  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Sync parent-provided playlist name when it changes
  useEffect(() => {
    setName(playlistName);
  }, [playlistName]);

  const createPlaylist = async () => {
    if (!name || !profile || selectedTracks.length === 0) return;

    try {
      const res = await fetch(
        `https://api.spotify.com/v1/users/${profile.id}/playlists`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            description: playlistDesc,
            public: false,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Playlist creation failed");

      await fetch(`https://api.spotify.com/v1/playlists/${data.id}/tracks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: selectedTracks.map((t) => t.uri),
        }),
      });
      setSelectedTracks([]);
      setName(""); // reset
      setPlaylistDesc("");
      onSuccess?.(data.name);

      setMessage(`Playlist "${data.name}" created!`);
      setToastType("success");
      setTimeout(() => setMessage(""), 5000);

    } catch (err) {
      console.error(err);

      setMessage("Failed to create playlist");
      setToastType("error");
      setTimeout(() => setMessage(""), 5000);

    }
  };

  return (
    <div className="flex-1 p-4 bg-white/10 rounded-xl border border-white/10 space-y-4">
      <h3 className="text-xl font-bold">Build Your Playlist</h3>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Playlist Name"
        className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-md"
      />

      <textarea
        value={playlistDesc}
        onChange={(e) => setPlaylistDesc(e.target.value)}
        placeholder="Playlist Description (Optional)"
        className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-md"
      />

      <button
        onClick={createPlaylist}
        className="bg-green-500 hover:bg-green-600 cursor-pointer px-4 py-2 rounded-md text-white font-semibold"
      >
        Create Playlist
      </button>

    </div>
  );
}

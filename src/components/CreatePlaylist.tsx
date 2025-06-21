"use client";

import { useState, useEffect } from "react";

interface CreatePlaylistProps {
  accessToken: string;
}

export default function CreatePlaylist({ accessToken }: CreatePlaylistProps) {
  const [playlistName, setPlaylistName] = useState("");
  const [playlistDesc, setPlaylistDesc] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  // Get the current user's Spotify ID
  useEffect(() => {
    async function fetchUserProfile() {
      const res = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setUserId(data.id);
    }
    if (accessToken) fetchUserProfile();
  }, [accessToken]);

  async function createPlaylist() {
    if (!playlistName || !userId) return;

    try {
      const res = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: playlistName,
          description: playlistDesc,
          public: false, // or true if you want it public
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ Playlist "${data.name}" created!`);
      } else {
        setMessage(`❌ Failed to create playlist: ${data.error?.message}`);
      }
    } catch (err) {
      console.error("Error creating playlist", err);
      setMessage("❌ An error occurred");
    }
  }

  return (
    <div className="p-6 bg-black/50 text-white rounded-xl w-full max-w-lg mx-auto space-y-4">
      <h2 className="text-xl font-semibold">Create a New Playlist</h2>

      <input
        type="text"
        placeholder="Playlist Name"
        value={playlistName}
        onChange={(e) => setPlaylistName(e.target.value)}
        className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-md focus:outline-none"
      />

      <textarea
        placeholder="Playlist Description"
        value={playlistDesc}
        onChange={(e) => setPlaylistDesc(e.target.value)}
        className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-md focus:outline-none"
      />

      <button
        onClick={createPlaylist}
        className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-md text-white font-semibold"
      >
        ➕ Create Playlist
      </button>

      {message && <p className="text-sm mt-2">{message}</p>}
    </div>
  );
}

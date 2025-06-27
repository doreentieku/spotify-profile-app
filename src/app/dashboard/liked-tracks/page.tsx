"use client";

import { useEffect, useState } from "react";
import { initializeSpotifyPlayer } from "@/lib/spotifyPlayer";
import useSpotifyProfile from "@/lib/useSpotifyProfile";
import UserProfile from "@/components/UserProfile";
import useSpotifyToken from "@/hooks/useSpotifyToken";
import SavedTracks from "@/components/SavedTracks";

export default function PlaylistPage() {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const { token } = useSpotifyToken();
  const profile = useSpotifyProfile(token || "");

    useEffect(() => {
      if (token) {
        initializeSpotifyPlayer(token, setDeviceId);
      }
    }, [token]);

  if (!token || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p className="animate-pulse text-xl">Loading your playlists...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-black via-zinc-900 to-black min-h-screen text-white pb-28">
      <header className="flex justify-between items-center px-6 py-4 text-sm">
        <UserProfile
          displayName={profile.display_name}
          country={profile.country}
          product={profile.product}
          accessToken={token}
        />
      </header>

      <main className="p-8">
        <SavedTracks accessToken={token} deviceId={deviceId} />
      </main>
    </div>
  );
}

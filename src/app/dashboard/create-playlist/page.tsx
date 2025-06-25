"use client";

import { useEffect, useState } from "react";
import UserProfile from "@/components/UserProfile";
import { initializeSpotifyPlayer } from "@/lib/spotifyPlayer";
import SearchWithPlaylist from "@/components/SearchWithPlaylist";
import useSpotifyProfile from "@/lib/useSpotifyProfile";
import useSpotifyToken from "@/hooks/useSpotifyToken";

interface SpotifyProfile {
  display_name: string;
  country: string;
  product: string;
}

export default function AIPlaylistPage() {
  const { token } = useSpotifyToken();
  const profile = useSpotifyProfile(token || "");
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    if (token) initializeSpotifyPlayer(token, setDeviceId);
  }, [token]);

  if (!token || !profile) {
    return (
      <div className="text-white text-center mt-10">
        Loading Spotify access and profile...
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-br from-black via-zinc-900 to-black text-white pb-24">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 text-sm">
        <UserProfile
          displayName={profile.display_name}
          country={profile.country}
          product={profile.product}
          accessToken={token}
        />
      </header>

      <section className="space-y-100 px-6">
        <SearchWithPlaylist accessToken={token} deviceId={deviceId} />
      </section>
    </div>
  );
}

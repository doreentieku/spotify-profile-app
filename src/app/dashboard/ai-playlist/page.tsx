'use client';

import { useEffect, useState } from 'react';
import CreatePlaylist from '@/components/CreatePlaylist';
import UserProfile from "@/components/UserProfile";

interface SpotifyProfile {
  display_name: string;
  country: string;
  product: string;
}

export default function AIPlaylistPage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<SpotifyProfile | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('spotify_access_token');
    if (!token) return;
    
    setAccessToken(token);

    fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setProfile)
      .catch(() => setProfile(null));
  }, []);

  if (!accessToken || !profile) {
    return (
      <div className="text-white text-center mt-10">
        Loading Spotify access and profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white pb-24">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 text-sm">
        <UserProfile
          displayName={profile.display_name}
          country={profile.country}
          product={profile.product}
          onLogout={() => {
            localStorage.removeItem("spotify_access_token");
            localStorage.removeItem("spotify_code_verifier");
            localStorage.removeItem("spotify_pkce_state");
            window.location.href = "/login";
          }}
        />
      </header>

      {/* Playlist Tools */}
      <section className="space-y-10 px-6">
        <CreatePlaylist accessToken={accessToken} />
      </section>
    </div>
  );
}

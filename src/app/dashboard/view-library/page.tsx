"use client";

import useSpotifyProfile from "@/lib/useSpotifyProfile";
import UserPlaylists from "@/components/UserPlaylists";
import UserProfile from "@/components/UserProfile";
import useSpotifyToken from "@/hooks/useSpotifyToken";

export default function PlaylistPage() {
  const { token } = useSpotifyToken();
  const profile = useSpotifyProfile(token || "");

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
        <UserPlaylists accessToken={token} />
      </main>
    </div>
  );
}

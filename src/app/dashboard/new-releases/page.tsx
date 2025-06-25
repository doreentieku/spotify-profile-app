"use client";

import { useEffect, useState } from "react";
import { initializeSpotifyPlayer } from "@/lib/spotifyPlayer";
import UserProfile from "@/components/UserProfile";
import useSpotifyProfile from "@/lib/useSpotifyProfile";
import NewReleases from "@/components/NewReleases";
import useSpotifyToken from "@/hooks/useSpotifyToken";


export default function DashboardPage() {
  const { token } = useSpotifyToken();

  // Get user profile using the token
  const profile = useSpotifyProfile(token || "");

  if (!profile || !token)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-zinc-900 text-white">
        <p className="text-xl animate-pulse">
          Loading your Spotify dashboard...
        </p>
      </div>
    );

  return (
    <div className="bg-gradient-to-br from-black via-zinc-900 to-black min-h-screen text-white relative pb-28">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 text-sm">
        <UserProfile
          displayName={profile.display_name}
          country={profile.country}
          product={profile.product}
          accessToken={token}
        />
      </header>

      <section className="pb-8 mx-auto">
        <div className="rounded-2xl backdrop-blur-md  border-white/10 p-6 shadow-inner">
          <NewReleases accessToken={token} />
        </div>
      </section>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { initializeSpotifyPlayer } from "@/lib/spotifyPlayer";
// import MostActiveHour from "@/components/MostActiveHour";
import RecentlyPlayedTracks from "@/components/RecentlyPlayedTracks";
import TopTracks from "@/components/TopTracks";
import TopArtists from "@/components/TopArtists";
import TopArtistHighlight from "@/components/TopArtistHighlight";
import UserProfile from "@/components/UserProfile";
import TopGenres from "@/components/TopGenres";
import useSpotifyProfile from "@/lib/useSpotifyProfile";

export default function DashboardPage() {
  const [token, setToken] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  // Load token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("spotify_access_token");
    if (!storedToken) return;
    setToken(storedToken);
  }, []);

  // Get user profile using the token
  const profile = useSpotifyProfile(token || "");

  // Initialize player once token is set
  useEffect(() => {
    if (token) {
      initializeSpotifyPlayer(token, setDeviceId);
    }
  }, [token]);

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

      <TopArtistHighlight token={token} />

      <section className="pb-8 mx-auto">
        <div className="rounded-2xl backdrop-blur-md  border-white/10 p-6 shadow-inner">
          <RecentlyPlayedTracks accessToken={token} deviceId={deviceId} />
        </div>
      </section>

      <section className="space-y-10 px-6 mx-auto">
        <TopTracks accessToken={token} deviceId={deviceId} />
        <TopArtists accessToken={token} deviceId={deviceId} />
        <TopGenres accessToken={token} />
      </section>
    </div>
  );
}

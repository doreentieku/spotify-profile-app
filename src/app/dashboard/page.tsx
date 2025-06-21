"use client";

import { useEffect, useState } from "react";
import { initializeSpotifyPlayer } from "@/lib/spotifyPlayer";
import MostActiveHour from "@/components/MostActiveHour";
import RecentlyPlayedTracks from "@/components/RecentlyPlayedTracks";
import TopTracks from "@/components/TopTracks";
import TopArtists from "@/components/TopArtists";
import LogoutButton from "@/components/LogoutButton";
import PlayerBar from "@/components/PlayerBar";
import TopArtistHighlight from "@/components/TopArtistHighlight";

interface SpotifyProfile {
  display_name: string;
  country: string;
  product: string;
}

export default function DashboardPage() {
  // const [profile, setProfile] = useState<any>(null);
  const [profile, setProfile] = useState<SpotifyProfile | null>(null);

  const [token, setToken] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("spotify_access_token");
    if (!storedToken) return;
    setToken(storedToken);

    fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then((res) => res.json())
      .then(setProfile);
  }, []);

  useEffect(() => {
    if (token) initializeSpotifyPlayer(token, setDeviceId);
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
        <div>
          <nav className="space-x-6 md:flex">
            <a href="#" className="text-gray-400 hover:text-white">
              Home
            </a>
            <a href="#" className="hover:text-white">
              Work
            </a>
          </nav>
          <h1 className="text-6xl font-extrabold tracking-tight uppercase mb-1">
            Welcome, {profile.display_name}
          </h1>
          <p className="text-white/70 text-sm uppercase">
            account: {profile.product}{" "}
          </p>
          <p className="text-white/70 text-sm uppercase">
            {" "}
            country: {profile.country}
          </p>
        </div>
        <LogoutButton
          onLogout={() => {
            localStorage.removeItem("spotify_access_token");
            localStorage.removeItem("spotify_code_verifier");
            localStorage.removeItem("spotify_pkce_state");
            window.location.href = "/login";
          }}
        />
      </header>

      {/* Grid layout: Most Active Hour + Recently Played */}
      <TopArtistHighlight token={token} />

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-6 pb-8  mx-auto">
        <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6 shadow-inner">
          <h2 className="text-xl font-semibold mb-4">
            Your Active Listening Hour
          </h2>
          <MostActiveHour accessToken={token} />
        </div>

        <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6 shadow-inner">
          <RecentlyPlayedTracks accessToken={token} deviceId={deviceId} />
        </div>
      </section>

      {/* Top Tracks and Top Artists */}
      <section className="space-y-10 px-6 mx-auto">
        <div>
          <TopTracks accessToken={token} deviceId={deviceId} />
        </div>
        <div>
          <TopArtists accessToken={token} />
        </div>
      </section>

      {/* PlayerBar */}
      <PlayerBar accessToken={token} />
    </div>
  );
}

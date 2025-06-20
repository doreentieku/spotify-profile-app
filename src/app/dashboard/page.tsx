'use client';

import { useEffect, useState } from 'react';
import { initializeSpotifyPlayer } from '@/lib/spotifyPlayer';
import MostActiveHour from '@/components/MostActiveHour';
import RecentlyPlayedTracks from '@/components/RecentlyPlayedTracks';
import TopTracks from '@/components/TopTracks';
import TopArtists from '@/components/TopArtists';
import LogoutButton from '@/components/LogoutButton';
import PlayerBar from '@/components/PlayerBar';

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('spotify_access_token');
    if (!storedToken) return;
    setToken(storedToken);

    fetch('https://api.spotify.com/v1/me', {
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
        <p className="text-xl animate-pulse">Loading your Spotify dashboard...</p>
      </div>
    );

  return (
    <div className="bg-gradient-to-br from-black via-zinc-900 to-black min-h-screen text-white relative pb-28">
      {/* Header */}
      <header className="px-6 pt-10 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight uppercase mb-1">
            Welcome, {profile.display_name}
          </h1>
          <p className="text-white/70 text-sm">Country: {profile.country}</p>
        </div>
        <LogoutButton
          onLogout={() => {
            localStorage.removeItem('spotify_access_token');
            localStorage.removeItem('spotify_code_verifier');
            localStorage.removeItem('spotify_pkce_state');
            window.location.href = '/login';
          }}
        />
      </header>

      {/* Grid layout: Most Active Hour + Recently Played */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-6 pb-8 max-w-7xl mx-auto">
        <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6 shadow-inner">
          <h2 className="text-xl font-semibold mb-4">Your Active Listening Hour</h2>
          <MostActiveHour accessToken={token} />
        </div>
        <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6 shadow-inner">
          <h2 className="text-xl font-semibold mb-4">Recently Played</h2>
          <RecentlyPlayedTracks accessToken={token} deviceId={deviceId} />
        </div>
      </section>

      {/* Top Tracks and Top Artists */}
      <section className="space-y-10 px-6 max-w-7xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold mb-4">Top Tracks</h2>
          <TopTracks accessToken={token} deviceId={deviceId} />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Top Artists</h2>
          <TopArtists accessToken={token} />
        </div>
      </section>

      {/* PlayerBar */}
      <PlayerBar accessToken={token} />
    </div>
  );
}

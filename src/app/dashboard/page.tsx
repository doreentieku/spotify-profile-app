"use client";
import { useEffect, useState } from 'react';
import { initializeSpotifyPlayer } from '@/lib/spotifyPlayer';
import MostActiveHour from '@/components/MostActiveHour';
import RecentlyPlayedTracks from '@/components/RecentlyPlayedTracks';
import TopTracks from '@/components/TopTracks';
import TopArtists from '@/components/TopArtists';
import LogoutButton from '@/components/LogoutButton';
import SpotifyControls from '@/components/SpotifyControls';

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
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
    return <p className="text-white">Loading profile...</p>;

  return (
    <div className="text-white">
      <h1 className="text-2xl font-bold mb-2 pt-10 uppercase">
        Welcome, {profile.display_name}
      </h1>
      <p>{profile.country}</p>
      <div className="">
        <LogoutButton
          onLogout={() => {
            localStorage.removeItem("spotify_access_token");
            localStorage.removeItem("spotify_code_verifier");
            localStorage.removeItem("spotify_pkce_state");
            window.location.href = "/login";
          }}
        />
      </div>

      <MostActiveHour accessToken={token} />
      <RecentlyPlayedTracks accessToken={token} />
      <TopTracks accessToken={token} deviceId={deviceId} />
      <TopArtists accessToken={token} />

      <SpotifyControls />
    </div>
  );
}

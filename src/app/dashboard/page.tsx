'use client';
import { useEffect, useState } from 'react';
import MostActiveHour from '@/components/MostActiveHour';
import RecentlyPlayedTracks from '@/components/RecentlyPlayedTracks';

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('spotify_access_token');
    if (!storedToken) return;
    setToken(storedToken);

    fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then(res => res.json())
      .then(setProfile);
  }, []);

  if (!profile || !token) return <p className="text-white">Loading profile...</p>;

  return (
    <div className="text-white">
      <h1 className="text-2xl font-bold mb-2 pt-10 uppercase">Welcome, {profile.display_name}</h1>
      <p>{profile.country}</p>

      <MostActiveHour accessToken={token} />
      <RecentlyPlayedTracks accessToken={token} />
    </div>
  );
}

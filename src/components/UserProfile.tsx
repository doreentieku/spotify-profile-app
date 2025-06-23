'use client';

import LogoutButton from './LogoutButton';
import PlayerBar from "@/components/PlayerBar";

interface Props {
  displayName: string;
  country: string;
  product: string;
  accessToken: string;
}

export default function UserProfile({
  displayName,
  country,
  product,
}: Props) {
  const token = localStorage.getItem('spotify_access_token') || '';

  return (
    <div>
      <nav className="space-x-6 md:flex mb-2">
        <a href="/dashboard" className="text-gray-400 hover:text-white">
          Home
        </a>
        <a href="/dashboard/playlist" className="text-gray-400 hover:text-white">
          Create Playlist
        </a>
      </nav>

      <h1 className="text-7xl font-bold tracking-wider uppercase mb-1">
        Welcome, {displayName}
      </h1>
      <p className="text-white/70 text-sm uppercase">{product}</p>
      <p className="text-white/70 text-sm uppercase">country: {country}</p>

      {/* Self-contained logout button */}
      <LogoutButton />

      {/* PlayerBar */}
      <PlayerBar accessToken={token} />
    </div>
  );
}

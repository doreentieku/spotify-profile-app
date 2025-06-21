'use client';

import LogoutButton from './LogoutButton';

interface Props {
  displayName: string;
  country: string;
  product: string;
  onLogout: () => void;
}

export default function UserProfile({
  displayName,
  country,
  product,
  onLogout,
}: Props) {
  return (
    <div>
      <nav className="space-x-6 md:flex mb-2">
        <a href="/dashboard" className="text-gray-400 hover:text-white">
          Home
        </a>
        <a href="/dashboard/ai-playlist" className="text-gray-400 hover:text-white">
          Playlist
        </a>
      </nav>
      <h1 className="text-6xl font-extrabold tracking-tight uppercase mb-1">
        Welcome, {displayName}
      </h1>
      <p className="text-white/70 text-sm uppercase">{product}</p>
      <p className="text-white/70 text-sm uppercase">country: {country}</p>
      <LogoutButton onLogout={onLogout} />
    </div>
  );
}

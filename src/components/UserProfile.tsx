"use client";

import LogoutButton from "./LogoutButton";
import PlayerBar from "@/components/PlayerBar";

interface Props {
  displayName: string;
  country: string;
  product: string;
  accessToken: string;
}

export default function UserProfile({ displayName, country, product }: Props) {
  const token = localStorage.getItem("spotify_access_token") || "";

  return (
    <div>
      <nav className="space-x-6 md:flex mb-2">
        <a href="/dashboard" className="text-gray-400 hover:text-white">
          Home
        </a>
        <a href="/dashboard/liked-tracks" className="text-gray-400 hover:text-white">
          Liked Tracks
        </a>
        <a
          href="/dashboard/saved-playlists"
          className="text-gray-400 hover:text-white"
        >
          Saved Playlists
        </a>
        <a
          href="/dashboard/search-tracks"
          className="text-gray-400 hover:text-white"
        >
          Search Tracks
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
      <footer className="absolute bottom-4 w-full flex flex-col items-center justify-center text-white text-sm opacity-80 space-y-2 z-100">
        <p className="text-xs text-gray-400">© 2025 Doreen Tieku.</p>
      </footer>
    </div>
  );
}

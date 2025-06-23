// LogoutButton.tsx
"use client";
import useSpotifyLogout from "@/lib/useSpotifyLogout";

export default function LogoutButton() {
  const logout = useSpotifyLogout();

  return (
    <button
      onClick={logout}
      className="bg-red-500/50 hover:bg-red-600/60 backdrop-blur-lg mb-30 mt-4 text-white font-bold py-2 px-4 cursor-pointer justify-center items-center rounded transition"
    >
      Logout
    </button>
  );
}

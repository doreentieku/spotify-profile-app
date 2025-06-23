"use client";
import { useRouter } from "next/navigation";

export default function useSpotifyLogout() {
  const router = useRouter();

  return () => {
    localStorage.clear(); 
    router.push("/login");
  };
}

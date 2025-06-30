"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { FaSpotify } from "react-icons/fa";

const generateRandomString = (length: number) => {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((x) => possible[x % possible.length])
    .join("");
};

const sha256 = async (plain: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

export default function LoginPage() {
  const router = useRouter();
  const topRef = useRef(null);
  const bottomRef = useRef(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const returnedState = url.searchParams.get("state");
    const storedState = localStorage.getItem("spotify_pkce_state");
    const codeVerifier = localStorage.getItem("spotify_code_verifier");

    if (!code || !codeVerifier || returnedState !== storedState) return;

    const exchangeToken = async () => {
      try {
        const res = await fetch("/api/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, codeVerifier }),
        });

        if (!res.ok) throw new Error(await res.text());
        const { access_token, expires_in, refresh_token } = await res.json();
        const expiresAt = Date.now() + expires_in * 1000;

        localStorage.setItem("spotify_access_token", access_token);
        localStorage.setItem("spotify_refresh_token", refresh_token);
        localStorage.setItem("spotify_expires_at", expiresAt.toString());

        localStorage.removeItem("spotify_code_verifier");
        localStorage.removeItem("spotify_pkce_state");

        router.replace("/dashboard"); // This must happen after token saved
      } catch (err) {
        console.error("Token exchange failed:", err);
      }
    };

    exchangeToken();
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem("spotify_access_token");
    if (token) router.replace("/dashboard");
  }, [router]);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(
      topRef.current,
      { y: -800, opacity: 0 },
      { y: 0, opacity: 0.4, duration: 3, ease: "power3.out" }
    );

    tl.fromTo(
      bottomRef.current,
      { y: 410, opacity: 0 },
      { y: 0, opacity: 1, duration: 3, ease: "power3.out" },
      "<0.2"
    );
  }, []);

  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, scale: 1 },
      {
        opacity: 1,
        scale: 1,
        duration: 1.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 50%",
          toggleActions: "play none none none",
        },
      }
    );

    // Scroll-based background rotation
    if (backgroundRef.current) {
      gsap.to(backgroundRef.current, {
        rotate: 620,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 3,
        },
      });
    }
  });

  // Manual login trigger
  const loginWithSpotify = async () => {
    const state = generateRandomString(16);
    const codeVerifier = generateRandomString(64);
    const codeChallenge = await sha256(codeVerifier);

    localStorage.setItem("spotify_pkce_state", state);
    localStorage.setItem("spotify_code_verifier", codeVerifier);

    const scope = [
      "user-read-private",
      "user-read-email",
      "user-top-read",
      "playlist-read-private",
      "playlist-modify-private",
      "playlist-modify-public",
      "streaming",
      "user-modify-playback-state",
      "user-read-playback-state",
      "user-read-currently-playing",
      "user-read-recently-played",
      "user-library-read"
    ].join(" ");

    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
      scope,
      redirect_uri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI!,
      state,
      code_challenge_method: "S256",
      code_challenge: codeChallenge,
    });

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
  };

  return (
    <main className="relative flex flex-grow h-screen overflow-hidden">
      {/* 🔹 Foreground Content */}
      <div className="relative bg-gray-800 w-full h-screen flex flex-col items-center justify-center px-10 lg:px-24 py-10 space-y-6">
        <div ref={topRef} className="text-center space-y-2">
          <div className="text-white text-lg">
            Unleash the full potential of your music data.
          </div>
          <h1 className="text-[21vw] font-extrabold bg-slate-600 backdrop-blur-lg tracking-wider text-center bg-clip-text text-transparent">
            spoticizr.
          </h1>
        </div>

        <button
          ref={bottomRef}
          onClick={loginWithSpotify}
          className="flex items-center gap-2 bg-green-500/20 hover:bg-green-700/20 backdrop-blur-md rounded-lg px-6 py-3 text-white font-bold cursor-pointer"
        >
          <FaSpotify />
          <span>Login with Spotify</span>
        </button>
      </div>

      {/* Animated SVG overlay */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-1">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <circle
            cx="20"
            cy="20"
            r="40"
            fill="none"
            stroke="white"
            strokeWidth="2"
            opacity="0.08"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 50 50"
              to="360 50 50"
              dur="30s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </div>
    </main>
  );
}

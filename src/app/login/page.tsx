"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { FaSpotify } from "react-icons/fa";
import Image from "next/image";


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
  const leftRef = useRef(null);
  const rightRef = useRef(null);

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
        const { access_token } = await res.json();

        localStorage.setItem("spotify_access_token", access_token);
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
      leftRef.current,
      { x: -200, opacity: 0 },
      { x: 0, opacity: 1, duration: 1, ease: "power3.out" }
    );
    tl.fromTo(
      rightRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
      "<0.2"
    );
  }, []);

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
      "streaming",
      "user-modify-playback-state",
      "user-read-playback-state",
      "user-read-currently-playing",
      "user-read-recently-played",
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
    <main className="relative flex flex-grow h-screen text-white overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover blur-[5px] z-0"
      >
        <source src="/video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* <Image src={"/window.png"} alt={""} width={200} height={300} className="absolute inset-0 w-full h-full object-cover blur-none z-0"></Image> */}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 z-0" />

      {/* Content Container */}
      <div className="relative z-10 w-full flex items-center justify-between px-10 lg:px-24">
        {/* Left Side Title */}
        <div ref={leftRef} className="w-1/2">
          <h1 className="text-[18vw] font-extrabold tracking-tighter leading-none select-none">
            spot
            <br />
            icizr
          </h1>
        </div>

        {/* Right Side Content */}
        <div
          ref={rightRef}
          className="w-1/2 flex flex-col items-start space-y-8 max-w-xl"
        >
          <p className="text-sm md:text-xl lg:text-xl text-gray-200">
            Dive deep into your listening habits with a custom, high-resolution
            dashboard built just for you. Unleash the full potential of your
            music data.
          </p>

          <button
            onClick={loginWithSpotify}
            className="bg-green-500/20 hover:bg-green-600/50 backdrop-blur-md rounded-lg px-5 py-3 font-bold inline-flex items-center space-x-3 text-xl md:text-2xl cursor-pointer"
          >
            <FaSpotify />
            <span>Login with Spotify</span>
          </button>

        </div>
      </div>
    </main>
  );
}

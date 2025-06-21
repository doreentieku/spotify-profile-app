"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Artist {
  name: string;
  images: { url: string }[];
  genres: string[];
  popularity: number;
  external_urls: { spotify: string };
  id: string;
}

interface Album {
  id: string;
  name: string;
  popularity: number;
  release_date: string;
  images: { url: string }[];
  external_urls: { spotify: string };
}

export default function TopArtistHighlight({ token }: { token: string }) {
  const [topArtist, setTopArtist] = useState<Artist | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const [latestRelease, setLatestRelease] = useState<Album | null>(null);

  useEffect(() => {
    async function fetchTopArtistAndLatestRelease() {
      try {
        // Step 1: Get Top Artist
        const artistRes = await fetch(
          "https://api.spotify.com/v1/me/top/artists?limit=5",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const artistData = await artistRes.json();
        const topArtist = artistData.items?.[0];
        setTopArtist(topArtist);

        // Step 2: Fetch latest album or single
        if (topArtist?.id) {
          const releaseRes = await fetch(
            `https://api.spotify.com/v1/artists/${topArtist.id}/albums?include_groups=album,single&market=US&limit=1`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const releaseData = await releaseRes.json();
          const latest = releaseData.items?.[0];
          setLatestRelease(latest);
        }
      } catch (err) {
        console.error("Failed to fetch artist or release:", err);
      }
    }

    fetchTopArtistAndLatestRelease();
  }, [token]);

  useEffect(() => {
    if (!topArtist || !containerRef.current) return;

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

    gsap.fromTo(
      titleRef.current,
      { opacity: 0, letterSpacing: "1em", y: 50 },
      {
        opacity: 1,
        letterSpacing: "0.2em",
        y: 0,
        duration: 1.2,
        delay: 0.3,
        ease: "power2.out",
      }
    );

    // Scroll-based background rotation
    if (backgroundRef.current) {
      gsap.to(backgroundRef.current, {
        rotate: 500,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 3,
        },
      });
    }
  }, [topArtist]);

  function getPopularityColor(popularity: number) {
    if (popularity >= 70) return "bg-green-400";
    if (popularity >= 40) return "bg-yellow-400";
    if (popularity < 40) return "bg-red-400";
    return "bg-red-400";
  }

  if (!topArtist) return null;

  const backgroundImage = topArtist.images[0]?.url;

  return (
    <div
      ref={containerRef}
      className="relative w-full flex items-center justify-center  aspect-square rounded-full overflow-hidden will-change-transform shadow-[0_0_60px_rgba(255,255,255,0.2)]"
    >
      {/* Background wrapper that rotates */}
      <div
        ref={backgroundRef}
        className="absolute inset-0 will-change-transform rounded-full"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/10  z-0" />

      {/* Content */}
      <div className="relative z-10 text-center px-6">
        <h2 className="text-[1vw] md:text-[1vw] text-white font-extrabold tracking-[0.5em] uppercase">
          Your top artist
        </h2>
        <h1
          ref={titleRef}
          className="text-[10vw] md:text-[7vw] text-white font-extrabold tracking-[0.5em] uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
        >
          {topArtist.name}
        </h1>
        <p className="text-sm md:text-lg text-gray-300 mt-4 tracking-wide">
          {topArtist.genres.slice(0, 3).join(" • ")}
        </p>

        <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
          {/* Colored and Animated Popularity Bar */}
          <div
            className={`${getPopularityColor(
              topArtist.popularity
            )} h-2 rounded-full transition-all duration-700 ease-out`}
            style={{ width: `${topArtist.popularity}%` }}
          ></div>
        </div>

        {latestRelease && (
          <div className="mt-8 flex flex-col items-center justify-center">
            <p className="text-sm text-gray-300">
              {latestRelease.release_date}
            </p>

            {/* Album cover */}
            <a
              href={latestRelease.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-110 transition-transform duration-300"
            >
              <img
                src={latestRelease.images[0]?.url}
                alt={latestRelease.name}
                className="w-32 h-32 md:w-40 md:h-40 rounded-lg shadow-xl border border-white/20"
              />
            </a>

            {/* Album name */}
            <p className="text-white text-lg mt-4 font-semibold">
              {latestRelease.name}
            </p>
            <p className="text-sm text-gray-300">
              {latestRelease.release_date}
            </p>
          </div>
        )}
      </div>

      {/* Animated SVG overlay */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="white"
            strokeWidth="1.3"
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
    </div>
  );
}

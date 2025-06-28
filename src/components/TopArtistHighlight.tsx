"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Track, Artist } from "@/types/spotify";
import { AlbumTracksModal } from "@/components/AlbumTracksModal";

gsap.registerPlugin(ScrollTrigger);

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
  const [latestRelease, setLatestRelease] = useState<Album | null>(null);
  const [isTracksModalOpen, setIsTracksModalOpen] = useState(false);
  const [albumTracks, setAlbumTracks] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchTopArtistAndRelease() {
      try {
        const artistRes = await fetch(
          "https://api.spotify.com/v1/me/top/artists?limit=6",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const artistData = await artistRes.json();
        const artist = artistData.items?.[0];
        setTopArtist(artist);

        if (artist?.id) {
          const releaseRes = await fetch(
            `https://api.spotify.com/v1/artists/${artist.id}/albums?include_groups=album,single&market=US&limit=1`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const releaseData = await releaseRes.json();
          setLatestRelease(releaseData.items?.[0]);
        }
      } catch (err) {
        console.error("Failed to fetch artist or release", err);
      }
    }

    fetchTopArtistAndRelease();
  }, [token]);

  const handleAlbumClick = async () => {
    if (!latestRelease) return;

    try {
      const res = await fetch(
        `https://api.spotify.com/v1/albums/${latestRelease.id}/tracks`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch album tracks");
      const data = await res.json();
      setAlbumTracks(data.items);
      setIsTracksModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  useEffect(() => {
    if (!topArtist || !containerRef.current) return;

    gsap.fromTo(
      containerRef.current,
      { opacity: 1, scale: 0.8 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.6,
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
      { opacity: 0, letterSpacing: "0.5em", y: 50 },
      {
        opacity: 1,
        letterSpacing: "0.5em",
        y: 0,
        duration: 1.2,
        delay: 1,
        ease: "power2.out",
      }
    );

    if (backgroundRef.current) {
      gsap.to(backgroundRef.current, {
        rotate: 620,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 4,
        },
      });
    }
  }, [topArtist]);

  function getPopularityColor(popularity: number) {
    if (popularity >= 70) return "bg-green-400";
    if (popularity >= 40) return "bg-yellow-400";
    return "bg-red-400";
  }

  if (!topArtist) return null;

  const backgroundImage = topArtist.images[0]?.url;

  return (
    <div
      ref={containerRef}
      className="relative w-full flex items-center justify-center aspect-square rounded-full overflow-hidden will-change-transform shadow-[0_0_60px_rgba(255,255,255,0.2)]"
    >
      {/* Rotating background */}
      <div
        ref={backgroundRef}
        className="absolute inset-0 rounded-full"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/20 z-0" />

      {/* Main content */}
      <div className="relative z-10 text-center px-6">
        <h2 className="text-[1vw] text-white font-extrabold tracking-[0.5em] uppercase">
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

        <p>Global population</p>
        <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
          <div
            className={`${getPopularityColor(
              topArtist.popularity
            )} h-2 rounded-full transition-all duration-700 ease-out`}
            style={{ width: `${topArtist.popularity}%` }}
          ></div>
        </div>

        {latestRelease && (
          <div className="mt-8 flex flex-col items-center justify-center">
            <p className="text-sm text-gray-300">Latest album</p>

            <div
              onClick={handleAlbumClick}
              className="hover:scale-110 transition-transform duration-300 cursor-pointer"
            >
              <img
                src={latestRelease.images[0]?.url}
                alt={latestRelease.name}
                className="w-32 h-32 md:w-40 md:h-40 rounded-lg shadow-xl border border-white/20"
              />
            </div>

            <p className="text-white text-lg mt-4 font-semibold">
              {latestRelease.name}
            </p>
            <p className="text-sm text-gray-300">{latestRelease.release_date}</p>
          </div>
        )}
      </div>

      {isTracksModalOpen && latestRelease && (
        <AlbumTracksModal
          album={latestRelease}
          albumTracks={albumTracks}
          accessToken={token}
          deviceId={null}
          onClose={() => setIsTracksModalOpen(false)}
        />

      )}

      {/* SVG overlay ring */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
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

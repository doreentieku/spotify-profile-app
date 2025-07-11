"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import useSpotifyLogout from "@/lib/useSpotifyLogout";
import { Track,Artist,Album } from "@/types/spotify";
import { ArtistAlbumsModal } from "@/components/ArtistAlbumsModal";
import { AlbumTracksModal } from "@/components/AlbumTracksModal";

type TimeRange = "short_term" | "medium_term" | "long_term";

interface TopArtistsProps {
  accessToken: string;
  deviceId: string | null;
}

interface SpotifyTopArtistsResponse {
  items: Artist[];
}

export default function TopArtists({ accessToken, deviceId }: TopArtistsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("medium_term");

  const [artists, setArtists] = useState<Artist[]>([]);
  const [error, setError] = useState<string | null>(null);
  const logout = useSpotifyLogout();

  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [artistAlbums, setArtistAlbums] = useState<Album[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [albumTracks, setAlbumTracks] = useState<Track[]>([]);
  const [isTracksModalOpen, setIsTracksModalOpen] = useState(false);

  useEffect(() => {
    const fetchTopArtists = async () => {
      try {
        const res = await fetch(
          `https://api.spotify.com/v1/me/top/artists?limit=30&time_range=${timeRange}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch top artists");

        const data: SpotifyTopArtistsResponse & {
          error?: { message?: string };
        } = await res.json();

        if (!res.ok) {
          const msg = data.error?.message || "";
          if (
            msg.toLowerCase().includes("token") ||
            msg.toLowerCase().includes("expired") ||
            res.status === 401
          ) {
            logout();
            return;
          }
          throw new Error(msg || "Failed to fetch top artists");
        }
        setArtists(data.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    };

    if (accessToken) fetchTopArtists();
  }, [accessToken, timeRange]);

  function getPopularityColor(popularity: number) {
    if (popularity >= 70) return "bg-green-400";
    if (popularity >= 40) return "bg-yellow-400";
    if (popularity < 40) return "bg-red-400";
    return "bg-red-400";
  }
  const scrollContainer = (direction: "left" | "right") => {
    const container = document.getElementById("artists-scroll-container");
    if (!container) return;
    const scrollAmount = 300;
    container.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  const fetchArtistAlbums = async (artistId: string) => {
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch artist albums");

      const data = await res.json();
      setArtistAlbums(data.items);
      setIsModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleArtistClick = (artist: Artist) => {
    setSelectedArtist(artist);
    fetchArtistAlbums(artist.id);
  };

  const fetchAlbumTracks = async (albumId: string) => {
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/albums/${albumId}/tracks`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch album tracks");

      const data = await res.json();
      setAlbumTracks(data.items);
      setIsTracksModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleAlbumClick = (album: Album) => {
    setSelectedAlbum(album);
    fetchAlbumTracks(album.id);
  };

  return (
    <div className="max-w-8xl mx-auto">
      <div className="flex justify-between items-center mb-4 px-4">
        <h2 className="text-lg font-bold text-white pl-5">
          Top Played Artists
        </h2>
        <p>Click to view artist albums</p>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as TimeRange)}
          className="bg-zinc-800 text-white border border-white/30 text-sm rounded-md px-2 py-1 focus:outline-none"
        >
          <option value="short_term">Last 4 weeks</option>
          <option value="medium_term">Last 6 months</option>
          <option value="long_term">All time</option>
        </select>
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      {!artists.length && !error && (
        <p className="text-gray-300 text-sm text-center">Loading...</p>
      )}

      <div className="relative px-4">
        <button
          onClick={() => scrollContainer("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full hidden md:block cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>

        <div
          id="artists-scroll-container"
          className="overflow-x-auto flex space-x-4 scroll-smooth"
        >
          <div className="flex space-x-4">
            {artists.map((artist, index) => (
              <div
                key={artist.id}
                onClick={() => handleArtistClick(artist)}
                className="cursor-pointer w-60 min-w-[15rem] p-4 bg-white/10 backdrop-blur-none border border-white/20 rounded-xl shadow-md text-white hover:bg-white/20 transition"
              >
                <Image
                  src={artist.images[0]?.url}
                  alt={artist.name}
                  width={300}
                  height={300}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
                <h3 className="text-lg font-semibold">
                  {" "}
                  #{index + 1} {artist.name}
                </h3>
                <p className="text-sm text-white/70 mb-2">
                  {artist.genres.slice(0, 2).join(", ") || ""}
                </p>
                {/* Popularity bar */}
                <div className="mt-2 group relative">
                  <div className="text-xs text-white/60 mb-1">
                    Global Popularity
                  </div>

                  {/* Popularity Bar Background */}
                  <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                    {/* Colored and Animated Popularity Bar */}
                    <div
                      className={`${getPopularityColor(
                        artist.popularity
                      )} h-2 rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${artist.popularity}%` }}
                    ></div>
                  </div>

                  {/* Tooltip */}
                  <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    Popularity: {artist.popularity}/100
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => scrollContainer("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full hidden md:block cursor-pointer"
        >
          <ArrowRight size={20} />
        </button>
        {isModalOpen && selectedArtist && (
          <ArtistAlbumsModal
            selectedArtist={selectedArtist}
            artistAlbums={artistAlbums}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedArtist(null);
              setArtistAlbums([]);
            }}
            onAlbumClick={handleAlbumClick}
          />
        )}

        {isTracksModalOpen && selectedAlbum && (
          <AlbumTracksModal
            album={selectedAlbum}
            albumTracks={albumTracks}
            accessToken={accessToken}
            deviceId={deviceId}
            onClose={() => {
              setIsTracksModalOpen(false);
              setSelectedAlbum(null);
              setAlbumTracks([]);
            }}
          />
        )}

        {error && (
          <p className="text-red-500 text-sm text-center mt-4">{error}</p>
        )}
      </div>
    </div>
  );
}

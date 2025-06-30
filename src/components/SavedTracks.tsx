// src/components/SavedTracks
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import PlayButton from "@/components/PlayButton";
import useSpotifyLogout from "@/lib/useSpotifyLogout";
import { Track,Artist } from "@/types/spotify";
import GenreBarChart from "./GenreBarChart";
import { useGenreFilter } from "@/context/GenreFilterContext";
import SelectedTracks from "@/components/SelectedTracks";
import Toast from "@/components/Toast";
import { IoIosAddCircleOutline } from "react-icons/io";

interface SavedTracksProps {
  accessToken: string;
  deviceId: string | null;
}

interface SavedTrackItem {
  added_at: string;
  track: Track;
}

interface SpotifySavedTracksResponse {
  items: SavedTrackItem[];
  total: number;
  next: string | null;
}

export default function SavedTracks({
  accessToken,
  deviceId,
}: SavedTracksProps) {
  const [genreChartData, setGenreChartData] = useState<
    { genre: string; count: number }[]
  >([]);

  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);
  const [allGenres, setAllGenres] = useState<string[]>([]);
  const { selectedGenre, setSelectedGenre } = useGenreFilter();
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const pageSize = 40;
  const pageCount = Math.ceil(filteredTracks.length / pageSize);
  const paginatedTracks = filteredTracks.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const [selectedTracks, setSelectedTracks] = useState<Track[]>([]);
  const [playlistName, setPlaylistName] = useState(
    "SPOTICIZR - Filtered Playlist"
  );
  const [message, setMessage] = useState("");

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const logout = useSpotifyLogout();

  useEffect(() => {
    const fetchAllSavedTracks = async () => {
      try {
        setIsLoading(true);
        setLoadingProgress(5);

        let nextUrl:
          | string
          | null = `https://api.spotify.com/v1/me/tracks?limit=50`;
        const allItems: SavedTrackItem[] = [];
        let totalFetched = 0;
        let totalExpected = 0;

        while (nextUrl) {
          const res = await fetch(nextUrl, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const data: SpotifySavedTracksResponse & {
            error?: { message: string };
          } = await res.json();

          if (!res.ok) {
            const msg = data.error?.message || "";
            if (msg.toLowerCase().includes("token") || res.status === 401) {
              logout();
              return;
            }
            throw new Error(msg || "Failed to fetch saved tracks");
          }

          if (!totalExpected && data.total) totalExpected = data.total;

          allItems.push(...data.items);
          totalFetched += data.items.length;

          setLoadingProgress(Math.min(50, (totalFetched / totalExpected) * 50));

          nextUrl = data.next;
        }

        const artistIds = allItems.flatMap((item) =>
          item.track.artists.map((a) => a.id)
        );
        const genreMap = await fetchArtistGenres(
          artistIds,
          accessToken,
          setLoadingProgress
        );

        const enrichedTracks = allItems.map((item) => ({
          ...item.track,
          genres: item.track.artists.flatMap((a) => genreMap[a.id] || []),
        }));

        setAllTracks(enrichedTracks);
        const allGenreSet = new Set(
          enrichedTracks.flatMap((t) => t.genres || [])
        );
        setAllGenres(Array.from(allGenreSet).sort());

        const genreCountMap: Record<string, number> = {};

        enrichedTracks.forEach((track) => {
          (track.genres || []).forEach((genre) => {
            genreCountMap[genre] = (genreCountMap[genre] || 0) + 1;
          });
        });

        const genreChartData = Object.entries(genreCountMap)
          .map(([genre, count]) => ({ genre, count }))
          .sort((a, b) => b.count - a.count);

        setFilteredTracks(enrichedTracks);
        setGenreChartData(genreChartData);

        setLoadingProgress(100);
        setTimeout(() => setIsLoading(false), 300);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setIsLoading(false);
      }
    };

    if (accessToken) fetchAllSavedTracks();
  }, [accessToken]);

  useEffect(() => {
    if (selectedGenre === "") {
      setFilteredTracks(allTracks);
      setPlaylistName("SPOTICIZR - Customized Saved Tracks");
    } else {
      const genreFiltered = allTracks.filter((t) =>
        t.genres?.includes(selectedGenre)
      );
      setFilteredTracks(genreFiltered);
      setPlaylistName(`SPOTICIZR - ${selectedGenre} Tracks`);
    }
    setPage(1);
  }, [selectedGenre, allTracks]);

  const fetchArtistGenres = async (
    artistIds: string[],
    token: string,
    progressCb: (n: number) => void
  ) => {
    const uniqueIds = [...new Set(artistIds)];
    const chunks = [];
    while (uniqueIds.length) chunks.push(uniqueIds.splice(0, 50));

    const genreMap: Record<string, string[]> = {};
    const totalChunks = chunks.length;

    for (let i = 0; i < totalChunks; i++) {
      const res = await fetch(
        `https://api.spotify.com/v1/artists?ids=${chunks[i].join(",")}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      data.artists.forEach((artist: Artist) => {
        genreMap[artist.id] = artist.genres;
      });

      progressCb(50 + ((i + 1) / totalChunks) * 50);
    }

    return genreMap;
  };

  function getPopularityColor(popularity: number) {
    if (popularity >= 70) return "bg-green-400";
    if (popularity >= 40) return "bg-yellow-400";
    return "bg-red-400";
  }

  return (
    <div className="max-w-8xl mx-auto px-4">
      {isLoading && (
        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-green-500 transition-all duration-200 ease-out"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
      )}

      {selectedTracks.length > 0 && (
        <SelectedTracks
          selectedTracks={selectedTracks}
          setSelectedTracks={setSelectedTracks}
          accessToken={accessToken}
          playlistName={playlistName}
          setMessage={setMessage}
        />
      )}

      <GenreBarChart
        data={genreChartData}
        title="Top Genre in Saved Tracks"
        subtitle="Top 12 genres in your saved tracks"
      />

      {filteredTracks.length > 0 && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() =>
              setSelectedTracks((prev) => [
                ...prev,
                ...filteredTracks.filter(
                  (track) => !prev.some((t) => t.id === track.id)
                ),
              ])
            }
            className="px-4 py-2 text-sm font-semibold rounded-full bg-green-700 hover:bg-green-800 text-white transition shadow cursor-pointer"
          >
            + Add Filtered Tracks to Playlist
          </button>
        </div>
      )}

      <h2 className="text-lg font-bold text-white mb-4">Your Saved Tracks</h2>

      <div className="mb-6">
        <label className="text-white text-sm mr-2">Filter by Genre:</label>
        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="bg-zinc-800 text-white border border-white/30 text-sm rounded-md px-2 py-1"
        >
          <option value="">All Genres</option>
          {allGenres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      {!allTracks.length && !error && !isLoading && (
        <p className="text-gray-300 text-sm text-center">
          No saved tracks found.
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {paginatedTracks.map((track, index) => (
          <div
            key={track.id}
            className="p-4 bg-white/10 border border-white/20 rounded-xl shadow-md text-white hover:bg-white/20 transition"
          >
            <Image
              src={track.album.images[0]?.url}
              alt={track.name}
              width={300}
              height={300}
              className="w-full h-40 object-cover rounded-lg mb-3"
            />
            <h3 className="text-md font-bold mb-1">
              #{(page - 1) * pageSize + index + 1} {track.name}
            </h3>
            <p className="text-sm text-white/70 mb-2">
              {track.artists.map((a) => a.name).join(", ")}
            </p>

            <div className="mt-2 group relative">
              <div className="text-xs text-white/60 mb-1">
                Global Popularity
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <div
                  className={`${getPopularityColor(
                    track.popularity
                  )} h-2 rounded-full transition-all duration-700 ease-out`}
                  style={{ width: `${track.popularity}%` }}
                ></div>
              </div>
              <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                Popularity: {track.popularity}/100
              </div>
            </div>
            <div className="flex gap-4 mt-2">
              <PlayButton
                uri={track.uri}
                accessToken={accessToken}
                deviceId={deviceId}
              />
              <button
                onClick={() =>
                  setSelectedTracks((prev) =>
                    prev.some((t) => t.id === track.id) ? prev : [...prev, track]
                  )
                }
                className="mt-3 px-4 py-2 text-sm font-medium text-white rounded-full bg-green-500/20 hover:bg-green-800/80 transition duration-200 shadow-lg cursor-pointer"
              >
                <IoIosAddCircleOutline />
              </button>
            </div>
          </div>
        ))}
      </div>

      {pageCount > 1 && (
        <div className="flex justify-center items-center space-x-4 text-white">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 rounded bg-zinc-700 cursor-pointer hover:bg-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm">
            Page {page} of {pageCount}
          </span>
          <button
            disabled={page === pageCount}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded bg-zinc-700 cursor-pointer hover:bg-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
      {message && (
        <Toast
          message={message}
          type="success"
          onClear={() => setMessage("")}
        />
      )}
    </div>
  );
}

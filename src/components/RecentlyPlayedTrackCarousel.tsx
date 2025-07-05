"use client";

import { useEffect, useState } from "react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";
import PlayButton from "@/components/PlayButton";

interface RecentlyPlayedTrackCarouselProps {
  accessToken: string;
  deviceId: string | null;
}

interface Track {
  uri: string;
  popularity: number;
  id: string;
  name: string;
  album: {
    images: { url: string }[];
    name: string;
  };
  artists: { name: string }[];
  external_urls: { spotify: string };
}

interface SpotifyRecentlyPlayedResponse {
  items: {
    track: Track;
    played_at: string;
  }[];
}

export default function RecentlyPlayedTrackCarousel({
  accessToken,
  deviceId,
}: RecentlyPlayedTrackCarouselProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    const fetchRecentlyPlayed = async () => {
      try {
        const res = await fetch(
          "https://api.spotify.com/v1/me/player/recently-played?limit=30",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch recently played tracks");

        const data: SpotifyRecentlyPlayedResponse = await res.json();
        const uniqueTracks = Array.from(
          new Map(data.items.map((item) => [item.track.id, item.track])).values()
        );
        setTracks(uniqueTracks);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    };

    if (accessToken) fetchRecentlyPlayed();
  }, [accessToken]);

  const filteredTracks = tracks.filter((track) =>
    track.artists.some((artist) =>
      artist.name.toLowerCase().includes(filter.toLowerCase())
    )
  );

  const cards = filteredTracks.map((track) => ({
    category: track.album.name,
    title: track.name,
    src: track.album.images[0]?.url,
    content: (
      <div className="text-orange-500 p-2 space-y-4 text-center">
        <p className="text-base font-semibold">
          {track.artists.map((a) => a.name).join(", ")}
        </p>
        <div className="text-sm italic text-white/70">
          Popularity: {track.popularity}/100
        </div>
        <PlayButton
          uri={track.uri}
          accessToken={accessToken}
          deviceId={deviceId}
        />
      </div>
    ),
  }));

  return (
    <div className="w-full h-full py-20">
      <h2 className="text-xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-sans text-center mb-8">
        Your Recently Played Tracks
      </h2>

      <input
        type="text"
        placeholder="Filter by artist"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full max-w-md mx-auto mb-10 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg placeholder-white/60 block"
      />

      {error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : !tracks.length ? (
        <p className="text-gray-300 text-center">Loading...</p>
      ) : (
        <Carousel items={cards.map((card, idx) => <Card key={card.src} card={card} index={idx} />)} />
      )}
    </div>
  );
}

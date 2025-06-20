'use client';
import { useEffect, useState } from 'react';
import Image from "next/image";

interface SpotifyArtist {
  name: string;
}

interface SpotifyAlbum {
  images: { url: string; width: number; height: number }[];
}

interface SpotifyTrack {
  name: string;
  album: SpotifyAlbum;
  artists: SpotifyArtist[];
}

export default function NowPlayingInfo({ accessToken }: { accessToken: string }) {
  const [track, setTrack] = useState<SpotifyTrack | null>(null);

  useEffect(() => {
    const fetchNowPlaying = async () => {
      const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.status === 204 || res.status > 400) {
        setTrack(null);
        return;
      }

      const data = await res.json();
      setTrack(data.item);
    };

    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 5000);
    return () => clearInterval(interval);
  }, [accessToken]);

  if (!track) {
    return (
      <div className="w-[300px] text-white/50 text-sm">
        Nothing is currently playing
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4 w-[300px]">
      <Image src={track.album.images[0].url} alt={track.name} width={300} height={300} className="w-16 h-16 rounded" />
      <div>
        <p className="text-white text-sm font-semibold truncate">{track.name}</p>
        <p className="text-white/70 text-xs truncate">
          {track.artists.map((a) => a.name).join(', ')}
        </p>
      </div>
    </div>
  );
}
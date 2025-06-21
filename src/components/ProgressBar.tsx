'use client';
import { useEffect, useState } from 'react';
import { getSpotifyPlayer } from '@/lib/spotifyPlayer';

function formatTime(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

export default function ProgressBar() {
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);
  const player = getSpotifyPlayer();

  useEffect(() => {
    if (!player) return;
    const update = async () => {
      const state = await player.getCurrentState();
      if (!state) return;
      setPosition(state.position);
      setDuration(state.duration);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [player]);

  return (
    <div className="w-full flex items-center space-x-2 text-white text-xs">
      <span>{formatTime(position)}</span>
      <div className="relative w-full h-1 bg-white/30 rounded overflow-hidden">
        <div
          className="absolute top-0 left-0 h-1 bg-white transition-all"
          style={{ width: `${(position / duration) * 100}%` }}
        />
      </div>
      <span>{formatTime(duration)}</span>
    </div>
  );
}

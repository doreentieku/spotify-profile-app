// components/SpotifyControls.tsx
'use client';

import { useEffect, useState } from 'react';
import { getSpotifyPlayer } from '@/lib/spotifyPlayer';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';

export default function SpotifyControls() {
  const [isPaused, setIsPaused] = useState<boolean>(true);

  const player = getSpotifyPlayer();

  useEffect(() => {
    if (!player) return;

    player.addListener('player_state_changed', (state: any) => {
      setIsPaused(state.paused);
    });
  }, [player]);

  const handlePlayPause = async () => {
    if (!player) return;
    const state = await player.getCurrentState();
    if (!state) return;
    state.paused ? await player.resume() : await player.pause();
  };

  const handleSkipNext = async () => {
    if (player) await player.nextTrack();
  };

  const handleSkipPrev = async () => {
    if (player) await player.previousTrack();
  };

  return (
    <div className="flex justify-center items-center space-x-6 p-4 mt-6 bg-black/40 rounded-lg w-fit mx-auto">
      <button onClick={handleSkipPrev} className="text-white">
        <SkipBack />
      </button>
      <button onClick={handlePlayPause} className="text-white">
        {isPaused ? <Play /> : <Pause />}
      </button>
      <button onClick={handleSkipNext} className="text-white">
        <SkipForward />
      </button>
    </div>
  );
}

// components/SpotifyControls.tsx
"use client";

import { useEffect, useState } from "react";
import { getSpotifyPlayer } from "@/lib/spotifyPlayer";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react";

export default function SpotifyControls() {
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [hasLoadedTrack, setHasLoadedTrack] = useState(false);

  const player = getSpotifyPlayer();

  useEffect(() => {
    if (!player) return;

    player.addListener("player_state_changed", (state) => {
      if (state && state.track_window && state.track_window.current_track) {
        setHasLoadedTrack(true);
      }
    });
  }, [player]);

  useEffect(() => {
    if (!player) return;

    player.addListener("player_state_changed", (state: any) => {
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
      <div className="flex justify-center items-center space-x-6">
        <button className="cursor-pointer" onClick={handleSkipPrev}>
          <SkipBack />
        </button>
        <button className="cursor-pointer" onClick={handlePlayPause}>
          {isPaused ? <Play /> : <Pause />}
        </button>
        <button className="cursor-pointer" onClick={handleSkipNext}>
          <SkipForward />
        </button>
      </div>
    </div>
  );
}

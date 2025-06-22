'use client';
import SpotifyControls from './SpotifyControls';
import NowPlayingInfo from './NowPlayingInfo';
import ProgressBar from './ProgressBar';

export default function PlayerBar({ accessToken }: { accessToken: string }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/70 backdrop-blur-md text-white p-4 flex flex-col space-y-2 border-t border-zinc-700 z-10">
      <ProgressBar />

      {/* Display horizontally */}
      <div className="flex justify-between">
        <NowPlayingInfo accessToken={accessToken} />
        <div><SpotifyControls /></div>

      </div>
    </div>
  );
}

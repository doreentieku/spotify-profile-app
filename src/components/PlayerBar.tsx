'use client';
import SpotifyControls from './SpotifyControls';
import NowPlayingInfo from './NowPlayingInfo';
import ProgressBar from './ProgressBar';

export default function PlayerBar({ accessToken }: { accessToken: string }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 text-white p-4 flex flex-col space-y-2 border-t border-zinc-700">
      <ProgressBar />
      <div className="flex justify-between items-center">
        <NowPlayingInfo accessToken={accessToken} />
        <SpotifyControls />
        <div className="w-[300px] text-right pr-4 text-green-400 text-xs">
          <span>Playing on Doreen Web Player</span>
        </div>
      </div>
    </div>
  );
}

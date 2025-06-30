"use client";

import { Track,Album } from "@/types/spotify";
import PlayButton from "@/components/PlayButton";

interface AlbumTracksModalProps {
  album: Album;
  albumTracks: Track[];
  accessToken: string;
  deviceId: string | null;
  onClose: () => void;
}

export function AlbumTracksModal({
  album,
  albumTracks,
  accessToken,
  deviceId,
  onClose,
}: AlbumTracksModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 p-6 rounded-lg max-w-6xl w-full max-h-[80vh] overflow-y-auto text-white space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">
            Tracks in &quot;{album.name}&quot;
          </h3>
          <p className="text-white/60 text-xs mt-2">
            Click outside to close modal
          </p>
        </div>

        {albumTracks.length === 0 ? (
          <p className="text-gray-400">No tracks found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {albumTracks.map((track, idx) => (
              <div
                key={track.id}
                className="bg-white/10 px-4 py-3 rounded-lg flex flex-col justify-between"
              >
                <div className="mb-2 text-sm font-medium">
                  {idx + 1}. {track.name}
                </div>
                <div className="flex justify-end">
                  <PlayButton
                    uri={track.uri}
                    accessToken={accessToken}
                    deviceId={deviceId}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

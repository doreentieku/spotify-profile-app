"use client";

import { Track } from "@/types/spotify";
import PlayButton from "@/components/PlayButton";

interface AlbumTracksModalProps {
    album: any;
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-10">
            <div className="bg-zinc-900 p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto text-white space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">Tracks in "{album.name}"</h3>
                    <button
                        onClick={onClose}
                        className="text-red-400 hover:text-red-600 text-lg"
                    >
                        ✖
                    </button>
                </div>

                {albumTracks.length === 0 && (
                    <p className="text-gray-400">No tracks found.</p>
                )}

                <ul className="space-y-2">
                    {albumTracks.map((track, idx) => (
                        <li
                            key={track.id}
                            className="flex justify-between items-center bg-white/10 px-4 py-2 rounded"
                        >
                            <span>
                                {idx + 1}. {track.name}
                            </span>
                            <PlayButton
                                uri={track.uri}
                                accessToken={accessToken}
                                deviceId={deviceId}
                            />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
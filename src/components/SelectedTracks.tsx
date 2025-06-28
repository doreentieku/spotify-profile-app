"use client";

import { Track } from "@/types/spotify";
import useSpotifyProfile from "@/lib/useSpotifyProfile";
import CreatePlaylist from "@/components/CreatePlaylist";

interface SelectedTracksProps {
    selectedTracks: Track[];
    setSelectedTracks: React.Dispatch<React.SetStateAction<Track[]>>;
    accessToken: string;
    playlistName: string;
    setMessage: (msg: string) => void;
}


export default function SelectedTracks({
    selectedTracks,
    setSelectedTracks,
    accessToken,
    playlistName,
    setMessage,
}: SelectedTracksProps) {
    const removeFromPlaylist = (id: string) => {
        setSelectedTracks((prev) => prev.filter((t) => t.id !== id));
    };
    const profile = useSpotifyProfile(accessToken);


    return (
        <div className="flex-1 space-y-6">
            <div className="p-4 bg-white/10 rounded-xl border border-white/10 space-y-4">
                <h3 className="text-xl font-bold">Selected Tracks</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedTracks.map((track) => (
                        <div
                            key={track.id}
                            className="bg-black/40 p-3 rounded-lg text-sm text-white flex flex-col gap-1"
                        >
                            <div className="truncate font-semibold">{track.name}</div>
                            <div className="text-xs text-white/60 truncate">
                                {track.artists.map((a) => a.name).join(", ")}
                            </div>
                            <button
                                onClick={() => removeFromPlaylist(track.id)}
                                className="text-red-400 text-xs underline mt-1 cursor-pointer"
                            >
                                ❌ Remove
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <CreatePlaylist
                accessToken={accessToken}
                profile={profile}
                selectedTracks={selectedTracks}
                setSelectedTracks={setSelectedTracks}
                playlistName={playlistName}
                onSuccess={(createdName) => {
                    setMessage(`Playlist "${createdName}" created!`);
                    setTimeout(() => setMessage(""), 5000);
                }}
            />
        </div>
    );
}

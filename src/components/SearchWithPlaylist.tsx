"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Track {
    id: string;
    name: string;
    uri: string;
    popularity: number;
    artists: { name: string }[];
    album: {
        images: { url: string }[];
    };
    external_urls: { spotify: string };
}

interface SearchProps {
    accessToken: string;
    deviceId: string | null;
}

const GENRES = [
    "chill", "afrobeat", "khaleeji", "rock", "jazz", "lofi", "edm",
    "k-pop", "classical", "trap", "ambient", "egyptian-pop", "pop"
];

export default function SearchWithPlaylist({
    accessToken,
    deviceId,
}: SearchProps) {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [selectedTracks, setSelectedTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [playlistName, setPlaylistName] = useState("");
    const [playlistDesc, setPlaylistDesc] = useState("");
    const [userId, setUserId] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [genres, setGenres] = useState<string[]>(["chill"]);

    // Fetch User ID
    useEffect(() => {
        if (!accessToken) return;
        fetch("https://api.spotify.com/v1/me", {
            headers: { Authorization: `Bearer ${accessToken}` },
        })
            .then(res => res.json())
            .then(data => setUserId(data.id));
    }, [accessToken]);

    // Fetch Search Result
    const fetchSearchResult = async () => {
        if (genres.length === 0) return;

        setLoading(true);
        setError(null);

        try {
            const genreParam = genres.join(",");
            const res = await fetch(`/api/search?genre=${genreParam}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error?.message || "Failed to fetch tracks");

            setTracks(data.items);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (accessToken && genres.length > 0) {
            fetchSearchResult();
        }
    }, [genres, accessToken]);

    useEffect(() => {
        if (selectedTracks.length === 0 && genres.length > 0) {
            const title =
                genres.length === 1
                    ? `${genres[0][0].toUpperCase() + genres[0].slice(1)} Search from Spoticizr`
                    : `${genres.slice(0, 2).map(g => g[0].toUpperCase() + g.slice(1)).join(" + ")} Search Mix from Spoticizr`;
            setPlaylistName(title);
        }
    }, [genres, selectedTracks]);

    const addToPlaylist = (track: Track) => {
        if (!selectedTracks.find((t) => t.id === track.id)) {
            setSelectedTracks((prev) => [...prev, track]);
        }
    };

    const removeFromPlaylist = (id: string) => {
        setSelectedTracks((prev) => prev.filter((t) => t.id !== id));
    };

    const createPlaylist = async () => {
        if (!playlistName || !userId || selectedTracks.length === 0) return;

        try {
            const res = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: playlistName,
                    description: playlistDesc,
                    public: false,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error?.message || "Failed to create playlist");

            await fetch(`https://api.spotify.com/v1/playlists/${data.id}/tracks`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    uris: selectedTracks.map((t) => t.uri),
                }),
            });

            setMessage(`Playlist "${data.name}" created!`);
            setTimeout(() => setMessage(""), 5000); // <-- clear message after 4s

            setSelectedTracks([]);
            setPlaylistName("");
            setPlaylistDesc("");
        } catch (err) {
            console.error(err);
            setMessage("Failed to create playlist");
            setTimeout(() => setMessage(""), 5000);
        }
    };


    async function playTrack(uri: string) {
        if (!accessToken || !deviceId) return;

        try {
            await fetch("https://api.spotify.com/v1/me/player", {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    device_ids: [deviceId],
                    play: false,
                }),
            });

            await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ uris: [uri] }),
            });
        } catch (err) {
            console.error("Failed to play track", err);
        }
    }

    return (
        <div className="px-6 py-8 space-y-10 max-w-7xl mx-auto text-white">
            <div className="flex flex-col lg:flex-row gap-6 mb-10">
                {/* Genre Selection */}
                <div className="flex-1 p-4 bg-zinc-900 rounded-xl border border-white/10">
                    <h2 className="text-lg font-bold text-white mb-4">Select Genres</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {GENRES.map((g) => {
                            const selected = genres.includes(g);
                            return (
                                <label
                                    key={g}
                                    className={`flex items-center gap-2 text-sm cursor-pointer px-3 py-2 rounded-md border ${selected
                                        ? "bg-green-600 border-green-400"
                                        : "bg-zinc-800 border-white/20"
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selected}
                                        onChange={() => {
                                            setGenres((prev) =>
                                                selected
                                                    ? prev.filter((gen) => gen !== g)
                                                    : [...prev, g]
                                            );
                                        }}
                                        className="accent-green-500"
                                    />
                                    {g[0].toUpperCase() + g.slice(1)}
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Playlist Builder */}
                {selectedTracks && (
                    <div className="flex-1 p-4 bg-white/10 rounded-xl border border-white/10 space-y-4">
                        <h3 className="text-xl font-bold">Build Your Playlist</h3>

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

                        <input
                            type="text"
                            value={playlistName}
                            onChange={(e) => setPlaylistName(e.target.value)}
                            placeholder="Playlist Name"
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-md"
                        />

                        <textarea
                            value={playlistDesc}
                            onChange={(e) => setPlaylistDesc(e.target.value)}
                            placeholder="Playlist Description (Optional)"
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-md"
                        />

                        <button
                            onClick={createPlaylist}
                            className="bg-green-500 hover:bg-green-600 cursor-pointer px-4 py-2 rounded-md text-white font-semibold"
                        >
                            Create Playlist
                        </button>
                    </div>
                )}
            </div>

            {message && (
                <div className="fixed top-0 mt-2 text-sm text-center text-white bg-black/40 px-3 py-2 rounded-md border border-white/10 z-10">
                    {message}
                </div>
            )}

            {/* Track Cards Always Visible */}
            {error && <p className="text-red-400">{error}</p>}
            {loading && <p className="text-gray-300">Loading...</p>}

            {!loading && !error && tracks.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {tracks.map((track) => (
                        <div
                            key={track.id}
                            className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition shadow"
                        >
                            <Image
                                src={track.album.images[0]?.url}
                                alt={track.name}
                                width={300}
                                height={300}
                                className="rounded-lg w-full h-36 object-cover mb-2"
                            />
                            <div className="font-semibold text-sm truncate">{track.name}</div>
                            <div className="text-xs text-white/60 truncate">
                                {track.artists.map((a) => a.name).join(", ")}
                            </div>

                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={() => playTrack(track.uri)}
                                    className="bg-green-500 hover:bg-green-600 text-xs px-2 py-1 rounded-full cursor-pointer"
                                >
                                    ▶ Play
                                </button>
                                <button
                                    onClick={() => addToPlaylist(track)}
                                    className="bg-blue-500 hover:bg-blue-600 text-xs px-2 py-1 rounded-full cursor-pointer"
                                >
                                    ➕ Add
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

}

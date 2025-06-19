'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface RecentlyPlayedTracksProps {
    accessToken: string;
}

interface Track {
    popularity: number;
    id: string;
    name: string;
    album: {
        images: { url: string }[];
        name: string;
    };
    artists: { name: string }[];
    external_urls: { spotify: string };
    played_at: string;
}

export default function RecentlyPlayedTracks({ accessToken }: RecentlyPlayedTracksProps) {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>('');

    useEffect(() => {
        const fetchRecentlyPlayed = async () => {
            try {
                const res = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=30', {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                if (!res.ok) throw new Error('Failed to fetch recently played tracks');

                const data = await res.json();
                // console.log("data", data)
                const uniqueTracks = Array.from(
                    new Map(data.items.map((item: { track: Track }) => [item.track.id, item.track])).values()
                ) as Track[];
                setTracks(uniqueTracks);

            } catch (err: any) {
                setError(err.message);
            }
        };

        if (accessToken) fetchRecentlyPlayed();
    }, [accessToken]);

    const filteredTracks = tracks.filter(track =>
        track.artists.some(artist => artist.name.toLowerCase().includes(filter.toLowerCase()))
    );

    function getPopularityColor(popularity: number) {
        if (popularity >= 70) return 'bg-green-400';
        if (popularity >= 40) return 'bg-yellow-400';
        if (popularity < 40) return 'bg-red-400';
        return 'bg-red-400';
    }
    const scrollContainer = (direction: 'left' | 'right') => {
        const container = document.getElementById('track-scroll-container');
        if (!container) return;
        const scrollAmount = 300;
        container.scrollBy({ left: direction === 'right' ? scrollAmount : -scrollAmount, behavior: 'smooth' });
    };

    return (
        <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-lg font-bold text-white mb-2">Recently Played Tracks</h2>

            <input
                type="text"
                placeholder="Filter by artist"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full mb-4 px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg placeholder-white/60"
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {!tracks.length && !error && <p className="text-gray-300 text-sm">Loading...</p>}

            <div className="relative px-4">
                <button
                    onClick={() => scrollContainer('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full hidden md:block"
                >
                    <ArrowLeft size={20} />
                </button>

                <div
                    id="track-scroll-container"
                    className="overflow-x-auto flex space-x-4 scroll-smooth"
                >
                    <div className="flex space-x-4">
                        {filteredTracks.map((track) => (
                            <div
                                key={track.id}
                                className="w-60 min-w-[15rem] p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-md text-white hover:bg-white/20 transition"
                            >
                                <img
                                    src={track.album.images[0]?.url}
                                    alt={track.name}
                                    className="w-full h-40 object-cover rounded-lg mb-2"
                                />
                                <h3 className="text-md font-semibold mb-1">{track.name}</h3>
                                <p className="text-sm text-white/70 mb-2">
                                    {track.artists.map((a) => a.name).join(', ')}
                                </p>
                                <p className="text-xs text-white/40 italic mb-2">
                                    Album: {track.album.name}
                                </p>
                                {/* Popularity bar */}
                                <div className="mt-2 group relative">
                                    <div className="text-xs text-white/60 mb-1">Global Popularity</div>

                                    {/* Popularity Bar Background */}
                                    <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                                        {/* Colored and Animated Popularity Bar */}
                                        <div
                                            className={`${getPopularityColor(track.popularity)} h-2 rounded-full transition-all duration-700 ease-out`}
                                            style={{ width: `${track.popularity}%` }}
                                        ></div>
                                    </div>

                                    {/* Tooltip */}
                                    <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                        Popularity: {track.popularity}/100
                                    </div>
                                </div>
                                <a
                                    href={track.external_urls.spotify}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-white/70 hover:text-white underline"
                                >
                                    Listen on Spotify
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
                <button
                    onClick={() => scrollContainer('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full hidden md:block"
                >
                    <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
}

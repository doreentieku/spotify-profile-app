"use client";

import Image from "next/image";
import { Artist } from "@/types/spotify";

interface ArtistAlbumsModalProps {
    selectedArtist: Artist;
    artistAlbums: any[];
    onClose: () => void;
    onAlbumClick: (album: any) => void;
}

export function ArtistAlbumsModal({
    selectedArtist,
    artistAlbums,
    onClose,
    onAlbumClick,
}: ArtistAlbumsModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-10">
            <div className="bg-zinc-900 p-6 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto text-white space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">Albums by {selectedArtist.name}</h3>
                    <button
                        onClick={onClose}
                        className="text-red-400 hover:text-red-600 text-lg"
                    >
                        ✖
                    </button>
                </div>

                {artistAlbums.length === 0 && (
                    <p className="text-gray-400">No albums found.</p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {artistAlbums.map((album) => (
                        <button
                            key={album.id}
                            onClick={() => onAlbumClick(album)}
                            className="block bg-white/10 rounded-md p-2 hover:bg-white/20 transition text-left"
                        >
                            <Image
                                src={album.images[0]?.url}
                                alt={album.name}
                                width={300}
                                height={300}
                                className="w-full h-40 object-cover rounded cursor-pointer"
                            />
                            <div className="text-sm font-medium mt-2 truncate">{album.name}</div>
                            <div className="text-xs text-white/60 truncate">
                                {album.release_date}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
"use client";

import Image from "next/image";
import { Artist, Album } from "@/types/spotify";

interface ArtistAlbumsModalProps {
  selectedArtist: Artist;
  artistAlbums: Album[];
  onClose: () => void;
  onAlbumClick: (album: Album) => void;
}

export function ArtistAlbumsModal({
  selectedArtist,
  artistAlbums,
  onClose,
  onAlbumClick,
}: ArtistAlbumsModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
      onClick={onClose} // if clicked on the backdrop, close
    >
      <div
        className="bg-zinc-900 p-6 rounded-lg max-w-6xl w-full max-h-[80vh] overflow-y-auto text-white space-y-4"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
      >
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">
            Albums in &quot;{selectedArtist.name}&quot;
          </h3>
          <p className="text-white/60 text-xs mt-2">
            Click outside to close modal
          </p>
        </div>

        {artistAlbums.length === 0 && (
          <p className="text-gray-400">No albums found.</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
              <div className="text-sm font-medium mt-2 truncate">
                {album.name}
              </div>
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

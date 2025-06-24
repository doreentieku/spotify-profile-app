"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Album {
  id: string;
  name: string;
  images: { url: string }[];
  artists: { name: string }[];
  external_urls: { spotify: string };
}

export default function NewReleases({ accessToken }: { accessToken: string }) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewReleases = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/new-releases", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error?.message || "Failed to fetch new releases");
        }

        setAlbums(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchNewReleases();
    }
  }, [accessToken]);

  if (loading) return <p className="text-gray-400">Loading new releases...</p>;
  if (error) return <p className="text-red-400">{error}</p>;

  return (
    <div className="py-8 space-y-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-white">New Releases</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {albums.map((album) => (
          <Link
            key={album.id}
            href={album.external_urls.spotify}
            target="_blank"
            className="bg-white/10 hover:bg-white/20 transition p-3 rounded-lg shadow"
          >
            <Image
              src={album.images[0]?.url}
              alt={album.name}
              width={300}
              height={300}
              className="rounded-md object-cover w-full h-40 mb-3"
            />
            <div className="text-sm font-semibold truncate">{album.name}</div>
            <div className="text-xs text-white/60 truncate">
              {album.artists.map((a) => a.name).join(", ")}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

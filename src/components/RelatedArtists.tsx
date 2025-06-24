"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Artist {
  id: string;
  name: string;
  images: { url: string }[];
  genres: string[];
  external_urls: { spotify: string };
}

export default function RelatedArtists({
  accessToken,
  artistId,
}: {
  accessToken: string;
  artistId: string;
}) {
  const [relatedArtists, setRelatedArtists] = useState<Artist[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const res = await fetch(
          `https://api.spotify.com/v1/artists/${artistId}/related-artists`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const data = await res.json();
        console.log("data",data)

        if (!res.ok) {
          throw new Error(data.error?.message || "Failed to fetch related artists");
        }

        setRelatedArtists(data.artists);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    };

    if (accessToken && artistId) {
      fetchRelated();
    }
  }, [accessToken, artistId]);

  if (error) return <p className="text-red-400">{error}</p>;
  if (relatedArtists.length === 0) return <p className="text-white/50">Loading related artists...</p>;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">Related Artists</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {relatedArtists.map((artist) => (
          <a
            key={artist.id}
            href={artist.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/10 hover:bg-white/20 transition p-4 rounded-lg shadow"
          >
            <Image
              src={artist.images?.[0]?.url || "/placeholder.jpg"}
              alt={artist.name}
              width={300}
              height={300}
              className="w-full h-40 object-cover rounded-md mb-2"
            />
            <div className="font-semibold">{artist.name}</div>
            <div className="text-xs text-white/60">
              {artist.genres?.slice(0, 2).join(", ")}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

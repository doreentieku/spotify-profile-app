// types/spotify.ts
export interface Track {
  id: string;
  name: string;
  uri: string;
  popularity: number;
  duration_ms: number;
  artists: { id: string; name: string }[];
  album: {
    images: { url: string }[];
  };
  external_urls: { spotify: string };
  genres?: string[];
}

export interface Artist {
  popularity: number;
  id: string;
  name: string;
  genres: string[];
  images: { url: string }[];
  external_urls: { spotify: string };
}

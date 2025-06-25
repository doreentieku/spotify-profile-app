// types/spotify.ts
export interface Track {
    id: string;
    name: string;
    uri: string;
    popularity: number;
    duration_ms: number;
    artists: { name: string }[];
    album: {
        images: { url: string }[];
    };
    external_urls: { spotify: string };
}

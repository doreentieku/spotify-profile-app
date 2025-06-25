// types/spotify.ts
export interface Track {
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

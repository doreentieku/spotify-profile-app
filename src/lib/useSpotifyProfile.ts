// lib/useSpotifyProfile.ts
import { useEffect, useState } from "react";

interface SpotifyProfile {
    id: string;
    display_name: string;
    email: string;
    images: { url: string }[];
    country:string
    product:string
}

export default function useSpotifyProfile(accessToken: string) {
    const [profile, setUserProfile] = useState<SpotifyProfile | null>(null);

    useEffect(() => {
        if (!accessToken) return;

        const fetchProfile = async () => {
            try {
                const res = await fetch("https://api.spotify.com/v1/me", {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                const data = await res.json();
                if (res.ok) setUserProfile(data);
                else console.error("Failed to fetch Spotify profile:", data);
            } catch (err) {
                console.error("Error fetching Spotify profile:", err);
            }
        };

        fetchProfile();
    }, [accessToken]);

    return profile;
}

'use client';
import { useEffect, useState } from 'react';

export function useSpotifyAuth() {
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('spotify_access_token');
        if (stored) setToken(stored);
        setLoading(false);
    }, []);

    return { token, loading };
}

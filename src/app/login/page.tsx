'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const generateRandomString = (length: number) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
        .map(x => possible[x % possible.length])
        .join('');
};

const sha256 = async (plain: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
};

export default function LoginPage() {
    const router = useRouter();

    useEffect(() => {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const returnedState = url.searchParams.get('state');
        const storedState = localStorage.getItem('spotify_pkce_state');
        const codeVerifier = localStorage.getItem('spotify_code_verifier');

        if (!code || !codeVerifier || returnedState !== storedState) return;

        const exchangeToken = async () => {
            try {
                const res = await fetch('/api/callback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, codeVerifier }),
                });

                if (!res.ok) throw new Error(await res.text());
                const { access_token } = await res.json();

                localStorage.setItem('spotify_access_token', access_token);
                localStorage.removeItem('spotify_code_verifier');
                localStorage.removeItem('spotify_pkce_state');

                router.replace('/dashboard'); // ✅ This must happen after token saved
            } catch (err) {
                console.error('Token exchange failed:', err);
            }
        };

        exchangeToken();
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('spotify_access_token');
        if (token) router.replace('/dashboard');
    }, []);



    // Manual login trigger
    const loginWithSpotify = async () => {
        const state = generateRandomString(16);
        const codeVerifier = generateRandomString(64);
        const codeChallenge = await sha256(codeVerifier);

        localStorage.setItem('spotify_pkce_state', state);
        localStorage.setItem('spotify_code_verifier', codeVerifier);

        const scope = [
            'user-read-private',
            'user-read-email',
            'user-top-read',
            'playlist-read-private',
            'user-read-recently-played',
            'streaming',
            'user-modify-playback-state',
            'user-read-playback-state',
            'user-read-currently-playing'

        ].join(' ');

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
            scope,
            redirect_uri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI!,
            state,
            code_challenge_method: 'S256',
            code_challenge: codeChallenge,
        });

        window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
    };

    return (
        <div className="h-screen flex items-center justify-center bg-black text-white">
            <button
                onClick={loginWithSpotify}
                className="bg-green-500 px-6 py-3 rounded text-lg font-bold cursor-pointer"
            >
                Login with Spotify
            </button>
        </div>
    );
}

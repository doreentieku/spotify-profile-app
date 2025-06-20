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
    }, [router]);

    useEffect(() => {
        const token = localStorage.getItem('spotify_access_token');
        if (token) router.replace('/dashboard');
    }, [router]);



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

    // return (
    //     <div className="h-screen flex items-center justify-center bg-black text-white">
    //         <button
    //             onClick={loginWithSpotify}
    //             className="bg-green-500 px-6 py-3 rounded text-lg font-bold cursor-pointer"
    //         >
    //             Login with Spotify
    //         </button>
    //     </div>
    // );

    return (
    <div className="flex flex-col min-h-screen">
      {/* Header / Navbar (Subtle and stark) */}
      <header className="w-full py-4 px-8 md:px-16 lg:px-24 flex justify-between items-center bg-transparent relative z-10">
        <div className="text-3xl font-extrabold text-white tracking-widest text-outline-dark rounded-md p-2 uppercase">
          spot-icizr
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 relative z-0 frank-miller-bg">
        <div className="max-w-4xl w-full text-center bg-black bg-opacity-70 backdrop-blur-sm p-8 md:p-12 lg:p-16 rounded-xl shadow-2xl border-2 border-gray-700">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 text-white text-outline-dark">
            Orchestrate Your <br /> Spotify Experience.
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto">
            Dive deep into your listening habits with a custom, high-resolution dashboard built just for you.
            Unleash the full potential of your music data.
          </p>
          <button  onClick={loginWithSpotify} className="bg-green-500 px-6 py-3 rounded text-lg font-bold cursor-pointer inline-flex items-center space-x-3 text-xl md:text-2xl">
            {/* Spotify Icon (SVG for Frank Miller style) */}
            <svg viewBox="0 0 167.7 167.7" className="h-8 w-8 md:h-10 md:w-10">
              <path fill="#fff" d="M83.85 0C37.53 0 0 37.53 0 83.85c0 46.32 37.53 83.85 83.85 83.85 46.32 0 83.85-37.53 83.85-83.85C167.7 37.53 130.17 0 83.85 0zM122.97 120.3c-2.47 4.04-7.55 5.23-11.59 2.76-14.73-9.02-37.2-11.83-49.27-8.3-4.6 1.34-9.35-1.12-10.69-5.72-1.34-4.6 1.12-9.35 5.72-10.69 16.36-4.75 42.17-1.46 59.3 9.07 4.04 2.47 5.23 7.55 2.76 11.59zM132.8 97.43c-3.1 5.07-9.52 6.55-14.59 3.44-17.76-10.87-44.82-14.15-60.98-9.42-6.07 1.88-12.27-1.57-14.15-7.64-1.88-6.07 1.57-12.27 7.64-14.15 20.94-6.47 50.97-3.2 71.93 9.42 5.07 3.1 6.55 9.52 3.44 14.59zM133.4 75.39c-3.88 6.34-11.95 8.2-18.29 4.31-20.9-12.8-52.79-16.59-71.85-10.98-7.64 2.37-15.54-2-17.91-9.66-2.37-7.64 2-15.54 9.66-17.91 23.95-7.4 58.74-3.52 82.75 11.1 6.34 3.88 8.2 11.95 4.31 18.29z"/>
            </svg>
            <span>Login with Spotify</span>
          </button>
          <p className="mt-8 text-gray-400 text-sm md:text-base">
            Your data, reimagined. Securely powered by Spotify's API.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-8 md:px-16 lg:px-24 text-center text-gray-500 text-sm bg-black relative z-10">
        &copy; 2025 Spot-icizr. All rights reserved. Not affiliated with Spotify.
      </footer>
    </div>
  );
}

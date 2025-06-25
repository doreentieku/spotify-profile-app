// src/hooks/useSpotifyToken.ts
'use client';

import { useEffect, useState } from "react";

interface TokenResponse {
    access_token: string;
    expires_in: number;
}

export default function useSpotifyToken() {
    const [token, setToken] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState<number | null>(null); // in seconds

    // Helper to logout
    const logout = () => {
        localStorage.removeItem("spotify_access_token");
        localStorage.removeItem("spotify_refresh_token");
        localStorage.removeItem("spotify_expires_at");
        setToken(null);
        setTimeLeft(null);
        window.location.href = "/login"; // Optional
    };

    // Refresh token
    const refreshSpotifyToken = async (refreshToken: string) => {
        console.log("Refreshing token in:", timeLeft)

        try {
            const res = await fetch("/api/spotify/refresh-token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken }),
            });

            if (!res.ok) throw new Error("Refresh failed");

            const data: TokenResponse = await res.json();

            const newAccessToken = data.access_token;
            const expiresAt = Date.now() + data.expires_in * 1000;

            localStorage.setItem("spotify_access_token", newAccessToken);
            localStorage.setItem("spotify_expires_at", expiresAt.toString());

            setToken(newAccessToken);
            setTimeLeft(data.expires_in);
        } catch (err) {
            console.error("Token refresh error:", err);
            logout();
        }
    };

    // Load and setup countdown
    useEffect(() => {
        const accessToken = localStorage.getItem("spotify_access_token");
        const refreshToken = localStorage.getItem("spotify_refresh_token");

        const expiresAt = localStorage.getItem("spotify_expires_at");

        if (!accessToken || !expiresAt) return;

        const expiresAtNum = parseInt(expiresAt);
        const now = Date.now();

        if (now >= expiresAtNum) {
            // Already expired
            if (refreshToken) refreshSpotifyToken(refreshToken);
            else logout();
            return;
        }

        // Token is valid
        setToken(accessToken);

        const secondsUntilExpiry = Math.floor((expiresAtNum - now) / 1000);
        setTimeLeft(secondsUntilExpiry);

        // Set a timer to auto-refresh 60 seconds before expiry
        const refreshTimeout = setTimeout(() => {
            if (refreshToken) {
                refreshSpotifyToken(refreshToken);
            } else {
                logout();
            }
        }, (secondsUntilExpiry - 60) * 1000); // refresh 1 min early

        return () => clearTimeout(refreshTimeout);
    }, []);


    // Tick countdown every second
    useEffect(() => {
        if (timeLeft === null) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev !== null && prev > 0) return prev - 1;
                return prev;
            });
        }, 10000);

        return () => clearInterval(interval);
    }, [timeLeft]);

    return { token };
}
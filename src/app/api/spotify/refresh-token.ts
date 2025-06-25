// pages/api/spotify/refresh-token.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { refreshToken } = req.body;

    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", refreshToken);
    params.append("client_id", process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!);

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
    });

    const data = await response.json();

    if (!response.ok) {
        return res.status(400).json({ error: data });
    }

    res.status(200).json({
        access_token: data.access_token,
        expires_in: data.expires_in,
    });
}

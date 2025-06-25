// src/app/api/callback/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const { code, codeVerifier } = body;

  // Exchange code for token using Spotify API
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI!,
      client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
      code_verifier: codeVerifier,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json({ error: data.error_description || 'Token exchange failed' }, { status: 400 });
  }

  return NextResponse.json(data);
}

// src/app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const accessToken = req.headers.get("Authorization")?.replace("Bearer ", "");
  const url = new URL(req.url);

  const genre = url.searchParams.get("genre") || "pop";
  const query = `${genre} tracks`;
  // const query = `chill relaxing acoustic`;
  // const query = `${genre} playlist`;

  const q = url.searchParams.get("q") || "pop tracks";
  console.log("query", q)

  const encodedQuery = encodeURIComponent(q);

  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodedQuery}&type=track,artist,playlist&limit=20`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({ error: data.error }, { status: res.status });
  }

  return NextResponse.json(data.tracks);
}

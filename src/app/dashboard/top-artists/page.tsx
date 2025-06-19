'use client';
import TopArtists from '@/components/TopArtists';

export default function Page() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('spotify_access_token') : null;
    if (!token) return null;
    return <TopArtists accessToken={token} />;
}

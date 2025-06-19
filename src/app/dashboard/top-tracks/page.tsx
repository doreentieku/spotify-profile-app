'use client';
import TopTracks from '@/components/TopTracks';

export default function Page() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('spotify_access_token') : null;
    if (!token) return null;
    return <TopTracks accessToken={token} />;
}

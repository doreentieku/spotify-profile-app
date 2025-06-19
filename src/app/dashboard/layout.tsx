//app/layout.tsx
'use client';

import { useSpotifyAuth } from '@/lib/useSpotifyAuth';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useEffect, useState } from 'react';


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { token: accessToken, loading } = useSpotifyAuth(); // Renamed `token` to `accessToken` for clarity
    const router = useRouter();
    const [deviceId, setDeviceId] = useState<string | null>(null); // Add this state

    useEffect(() => {
        if (!loading && !accessToken) {
            router.push('/login');
        }
    }, [loading, accessToken, router]);

    if (loading || !accessToken) return <div className="text-white p-6">Loading...</div>;

    return (
        <div className="flex h-screen bg-violet-900 text-white">
            <Sidebar accessToken={accessToken} />
            <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
    );
}

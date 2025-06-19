//app/component/Sidebar

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import LogoutButton from '@/components/LogoutButton';


interface SidebarProps {
    accessToken: string;
}

export default function Sidebar({ accessToken }: SidebarProps) {
    const pathname = usePathname();
    const links = [
        { name: 'Top Artists', href: '/dashboard/top-artists' },
        { name: 'Top Tracks', href: '/dashboard/top-tracks' },
    ];

    const [mobileOpen, setMobileOpen] = useState(false);

    const toggleMobile = () => setMobileOpen(prev => !prev);

    const SidebarContent = (
        <>
            <Link href="/dashboard">
                <div className="p-6 text-xl font-bold cursor-pointer hover:text-white/80 transition">
                    Your Dashboard
                </div>
            </Link>
            <nav className="flex flex-col space-y-2 px-4">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`px-4 py-2 rounded-lg hover:bg-white/20 transition ${pathname === link.href ? 'bg-white/20 font-semibold' : 'text-white/70'}`}
                    >
                        {link.name}
                    </Link>
                ))}
            </nav>
        </>
    );


    function setDeviceId(id: string): void {
        throw new Error('Function not implemented.');
    }

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="w-64 min-w-[200px] bg-white/5 backdrop-blur-none border-r border-white/20 hidden md:flex flex-col justify-between">
                <div>{SidebarContent}</div>
                {/* <div>
                    <SpotifyPlayer accessToken={accessToken} setDeviceId={setDeviceId} />


                </div> */}

                <div className="flex justify-center">
                    <LogoutButton
                        onLogout={() => {
                            localStorage.removeItem('spotify_access_token');
                            localStorage.removeItem('spotify_code_verifier');
                            localStorage.removeItem('spotify_pkce_state');
                            window.location.href = '/login';
                        }}
                    />
                </div>
            </aside>

            {/* Mobile Toggle Button */}
            <button
                onClick={toggleMobile}
                className="fixed top-4 left-4 z-50 md:hidden bg-white/10 border border-white/20 p-2 rounded-md text-white"
            >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile Sidebar */}
            {mobileOpen && (
                <div className="fixed top-0 left-0 z-40 w-1.5/4 h-full bg-black/60 backdrop-blur-md border-r border-white/20 p-4 md:hidden flex flex-col justify-between">
                    <div>{SidebarContent}</div>

                    <div className="flex justify-center">
                        <LogoutButton
                            onLogout={() => {
                                localStorage.removeItem('spotify_access_token');
                                localStorage.removeItem('spotify_code_verifier');
                                localStorage.removeItem('spotify_pkce_state');
                                window.location.href = '/login';
                            }}
                        />
                    </div>
                </div>
            )}

        </>
    );
}

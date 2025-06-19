'use client';

interface LogoutButtonProps {
    onLogout: () => void;
}

export default function LogoutButton({ onLogout }: LogoutButtonProps) {
    return (
        <button
            onClick={onLogout}
            className="mb-30 mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 cursor-pointer justify-center items-center rounded transition"
        >
            Logout
        </button>
    );
}

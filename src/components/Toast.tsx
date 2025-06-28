// components/Toast.tsx
"use client";

export default function Toast({
    message,
    onClear,
    type = "success", // "success" or "error"
}: {
    message: string;
    onClear: () => void;
    type?: "success" | "error";
}) {
    const bgColor =
        type === "success" ? "bg-green-600" : "bg-red-600";

    return (
        <div className="fixed top-5 right-5 z-50">
            <div
                className={`${bgColor} text-white px-4 py-2 rounded-md shadow-lg animate-slide-in`}
            >
                {message}
            </div>
        </div>
    );
}

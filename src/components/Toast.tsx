// components/Toast.tsx
"use client";

export default function Toast({
  message,
  type = "success",
  onClear,
}: {
  message: string;
  onClear: () => void;
  type?: "success" | "error";
}) {
  const bgColor = type === "success" ? "bg-green-600" : "bg-red-600";

  return (
    <div className="fixed top-5 right-5 z-50">
      <div
        className={`${bgColor} text-white px-4 py-2 rounded-md shadow-lg animate-slide-in`}
      >
        {message}
        <button
          onClick={onClear}
          className="ml-3 text-white underline text-xs hover:text-gray-200"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold text-white">Something went wrong</h2>
          <button
            onClick={() => reset()}
            className="bg-green-600 hover:bg-green-500 text-white font-medium px-6 py-2.5 rounded-lg transition"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

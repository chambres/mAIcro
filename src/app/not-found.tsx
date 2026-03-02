import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Page Not Found</h2>
        <p className="text-gray-400">The page you are looking for does not exist.</p>
        <Link
          href="/dashboard"
          className="inline-block bg-green-600 hover:bg-green-500 text-white font-medium px-6 py-2.5 rounded-lg transition"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 p-1">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
              <span className="text-5xl font-black text-gradient">404</span>
            </div>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-black mb-4 text-gradient">
          Page Not Found
        </h1>
        <p className="text-zinc-400 text-lg mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-lg transition-all"
          >
            Go Home
          </Link>
          <Link
            href="/leaderboard"
            className="px-6 py-3 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white font-semibold rounded-lg transition-all"
          >
            View Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}

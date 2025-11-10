import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Investment Hub
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your personal financial analytics platform powered by advanced data analysis and machine learning
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Link
            href="/dashboard"
            className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Dashboard</h2>
            <p className="text-gray-600">
              View your portfolio overview, key metrics, and performance at a glance
            </p>
          </Link>
          <Link
            href="/analytics"
            className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Analytics</h2>
            <p className="text-gray-600">
              Deep dive into risk metrics, optimization strategies, and ML-powered insights
            </p>
          </Link>
          <Link
            href="/research"
            className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Research</h2>
            <p className="text-gray-600">
              Screen stocks, analyze opportunities, and compare investment options
            </p>
          </Link>
        </div>
        <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">🚧 MVP Development Mode</h3>
          <p className="text-blue-800">
            Currently using mock data for development. Schwab API integration coming soon!
          </p>
        </div>
      </div>
    </div>
  );
}
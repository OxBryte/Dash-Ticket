export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
              🎫 Ticketing App
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              A modern ticket management system built with Next.js, Tailwind CSS, and TanStack Query
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Next.js 15
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Built with the latest Next.js features and App Router
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Tailwind CSS
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Beautiful, responsive design with utility-first CSS
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                TanStack Query
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Powerful data fetching and state management
              </p>
            </div>
          </div>

          {/* Getting Started */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
              Getting Started
            </h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                  1
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Start the development server
                  </h3>
                  <code className="block mt-2 bg-gray-100 dark:bg-gray-900 p-2 rounded text-sm">
                    npm run dev
                  </code>
                </div>
              </div>

              <div className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                  2
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Run auto-commit script (optional)
                  </h3>
                  <code className="block mt-2 bg-gray-100 dark:bg-gray-900 p-2 rounded text-sm">
                    ./auto-commit.sh
                  </code>
                </div>
              </div>

              <div className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                  3
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Start building your features
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Edit app/page.tsx to begin customizing this application
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

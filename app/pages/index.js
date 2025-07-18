export default function MemoryBoxApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-4xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Memory Box</h1>
          <p className="text-xl text-gray-600 mb-8">Your Personal Memory Collection</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-purple-50 p-6 rounded-lg">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-purple-800 mb-2">Upload Memory</h3>
              <p className="text-purple-600">Add new photos, videos, or notes</p>
            </div>

            <div className="bg-pink-50 p-6 rounded-lg">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-pink-800 mb-2">My Memories</h3>
              <p className="text-pink-600">Browse your saved memories</p>
            </div>

            <div className="bg-red-50 p-6 rounded-lg">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-red-800 mb-2">Share</h3>
              <p className="text-red-600">Share moments with family</p>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Memory Box v1</h3>
            <p className="text-gray-600 mb-6">
              This is your personal space to collect, organize, and cherish your most precious memories. 
              Start by creating an account and begin building your digital collection.
            </p>
            <button className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition duration-200 text-lg font-medium">
              Get Started
            </button>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <p className="text-gray-600 text-sm mb-4">Explore Memory Box Platform</p>
            <div className="flex justify-center space-x-6">
              <a
                href="https://memory-box-landing-final-o3s097fz4-eduardo-inoas-projects.vercel.app"
                className="text-purple-600 hover:text-purple-800 font-medium"
              >
                ← Landing Page
              </a>
              <a
                href="https://memory-box-admin-final-ch9zzl7en-eduardo-inoas-projects.vercel.app"
                className="text-purple-600 hover:text-purple-800 font-medium"
              >
                Admin Portal →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

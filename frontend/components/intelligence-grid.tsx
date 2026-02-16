'use client'

export function IntelligenceGrid() {
  return (
    <section id="features" className="relative py-20 bg-white dark:bg-slate-950 transition-colors duration-500">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-blue-200 dark:border-blue-800">
            SPLIT-BRAIN ARCHITECTURE
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-slate-50 mb-4">
            Intelligence Powered by Speed <span className="block text-transparent bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text">and Depth</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-slate-400">
            Groq handles instant scoring while Gemini provides deep career analysis. The perfect balance for campus placement readiness.
          </p>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Speed Engine - Groq */}
          <div className="group">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-8 border border-blue-200 dark:border-blue-900 hover:shadow-xl dark:hover:shadow-blue-900/20 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-slate-50">Speed Engine</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">Powered by Groq</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-slate-300 mb-6">
                Instant feedback for real-time student readiness. Lightning-fast scoring across all evaluation modules.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-slate-50">Instant PRS Scoring</p>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Real-time recalculation on every profile update</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-slate-50">Weekly Micro-Tasks</p>
                    <p className="text-sm text-gray-600 dark:text-slate-400">5-minute actionable goals every Monday</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-slate-50">Instant Notifications</p>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Get alerts the moment your score changes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reasoning Engine - Gemini */}
          <div className="group">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-2xl p-8 border border-purple-200 dark:border-purple-900 hover:shadow-xl dark:hover:shadow-purple-900/20 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-slate-50">Reasoning Engine</h3>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold">Powered by Gemini</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-slate-300 mb-6">
                Deep analysis for nuanced career guidance. Strategic insights for placement success.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-slate-50">Resume ATS Auditor</p>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Deep critique of impact metrics and action verbs</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-slate-50">Company Lens</p>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Strategic matching against deep company requirements</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-slate-50">Career Gap Analysis</p>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Personalized roadmap for placement readiness</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

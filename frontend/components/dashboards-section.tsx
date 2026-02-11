'use client'

export function DashboardsSection() {
  return (
    <section id="dashboards" className="relative py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            DUAL PLATFORM
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Dashboards Built for Students & Placement Officers
          </h2>
          <p className="text-lg text-gray-600">
            Purpose-built interfaces designed to empower students with actionable insights and give institutions strategic oversight.
          </p>
        </div>

        {/* Two Dashboard Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Student Dashboard */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border-2 border-blue-200 p-10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            {/* Icon */}
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Student Dashboard</h3>
            
            {/* Description */}
            <p className="text-gray-700 mb-6 leading-relaxed">
              Your personal readiness command center. Track placement progress in real-time with intelligent scoring and personalized improvement paths.
            </p>

            {/* Features List */}
            <div className="space-y-4">
              {[
                {
                  title: 'Real-Time PRS Scoring',
                  desc: 'Instant Placement Readiness Score with category breakdown'
                },
                {
                  title: 'Micro-Task Planner',
                  desc: '5-minute weekly goals aligned to your readiness gaps'
                },
                {
                  title: 'Company Lens Mode',
                  desc: 'See your profile against company requirements instantly'
                },
                {
                  title: 'Progress Analytics',
                  desc: 'Trend analysis and personalized improvement recommendations'
                }
              ].map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Dashboard */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border-2 border-purple-200 p-10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            {/* Icon */}
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Admin Dashboard</h3>
            
            {/* Description */}
            <p className="text-gray-700 mb-6 leading-relaxed">
              Strategic oversight for placement officers. Data-driven insights to optimize campus readiness and predict placement success outcomes.
            </p>

            {/* Features List */}
            <div className="space-y-4">
              {[
                {
                  title: 'Branch-wise Heatmaps',
                  desc: 'Campus readiness visualization across departments and years'
                },
                {
                  title: 'Gap Analysis Engine',
                  desc: 'Identify skill gaps and training needs across cohorts'
                },
                {
                  title: 'Training Recommendations',
                  desc: 'AI-powered suggestions like "Java Bootcamp for TY ECS"'
                },
                {
                  title: 'Placement Risk Index',
                  desc: 'Predict Tier-1 vs Tier-2 eligible students in advance'
                }
              ].map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

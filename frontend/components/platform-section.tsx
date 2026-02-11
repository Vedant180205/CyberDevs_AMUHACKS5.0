'use client'

export function PlatformSection() {
  return (
    <section id="students" className="relative py-20 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            TWO-SIDED PLATFORM
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Built for Students and Administrators
          </h2>
          <p className="text-lg text-gray-600">
            A unified platform that empowers students with actionable insights while giving institutions strategic oversight.
          </p>
        </div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Student Portal */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-10 hover:shadow-xl transition-all duration-300">
            {/* Icon */}
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3">Student Portal</h3>
            <p className="text-gray-700 mb-6 leading-relaxed">
              A minimal-burden dashboard that tracks your readiness journey with real-time scoring and personalized improvement paths.
            </p>

            {/* Features */}
            <div className="space-y-4">
              {[
                {
                  title: 'Readiness Dashboard',
                  desc: 'Real-time PRS with category breakdown and trend analysis'
                },
                {
                  title: 'Digital Twin Mode',
                  desc: 'Simulate eligibility for specific roles and companies'
                },
                {
                  title: 'Micro-Task Planner',
                  desc: '5-minute weekly goals to improve placement readiness'
                },
                {
                  title: 'Company Lens',
                  desc: 'See your profile against company requirements instantly'
                }
              ].map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Dashboard */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200 p-10 hover:shadow-xl transition-all duration-300">
            {/* Icon */}
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
              </svg>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3">Admin Command Center</h3>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Data-driven insights for Training and Placement Officers to optimize campus readiness and predict placement success.
            </p>

            {/* Features */}
            <div className="space-y-4">
              {[
                {
                  title: 'Branch-wise Heatmaps',
                  desc: 'Campus readiness visualization across departments and years'
                },
                {
                  title: 'Gap Analysis',
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
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.desc}</p>
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

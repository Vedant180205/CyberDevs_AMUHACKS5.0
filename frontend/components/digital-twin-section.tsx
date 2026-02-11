'use client'

export function DigitalTwinSection() {
  return (
    <section id="digitaltwin" className="relative py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl"></div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Placement Readiness Digital Twin
          </h2>
          <p className="text-lg text-blue-100">
            Simulate campus-wide interventions and predict Tier-1 eligibility outcomes before implementation.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              label: 'Expected Tier-1 Eligible',
              value: '78%',
              description: 'With current readiness',
              icon: '📈'
            },
            {
              label: 'Avg PRS Improvement',
              value: '+12',
              description: 'Points per semester',
              icon: '⚡'
            },
            {
              label: 'High-Risk Students',
              value: '24',
              description: 'Below 40 threshold needing support',
              icon: '🎯'
            }
          ].map((metric, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all hover:bg-white/15 hover:shadow-xl"
            >
              <div className="space-y-4">
                <p className="text-blue-100 text-sm font-semibold uppercase tracking-wider">
                  {metric.label}
                </p>
                <div className="text-5xl font-bold text-white">
                  {metric.value}
                </div>
                <p className="text-blue-100 text-sm leading-relaxed">
                  {metric.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="text-center mt-16 max-w-3xl mx-auto">
          <p className="text-blue-100 text-lg leading-relaxed">
            Test strategies before implementation. Use predictive analytics to optimize campus placement outcomes with confidence.
          </p>
        </div>
      </div>
    </section>
  )
}

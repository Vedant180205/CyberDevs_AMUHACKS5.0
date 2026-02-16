'use client'

import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section id="contact" className="relative py-20 bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-950 transition-colors duration-500">
      <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
        {/* Main Heading */}
        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-slate-50 leading-tight">
          Ready to Transform Campus
          <span className="block bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            Placement Outcomes?
          </span>
        </h2>

        {/* Subheading */}
        <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Join leading institutions using CampusIQ to make placement readiness predictable with real-time intelligence, deep analytics, and proven results.
        </p>

        {/* CTA Button */}
        <div className="flex justify-center pt-8">
          <Button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full px-8 py-6 text-lg font-semibold hover:shadow-xl hover:shadow-blue-200 transition-all">
            Get Started Free
          </Button>
        </div>

        {/* Trust Text */}
        <div className="pt-8 space-y-2">
          <p className="text-gray-600 dark:text-slate-400 text-sm font-medium">
            Trusted by colleges and universities across India
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-500">
            Designed by engineers at QuantDevs for SAKEC and beyond
          </p>
        </div>
      </div>
    </section>
  )
}

'use client'

import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'

export function HeroSection() {
  const badgeRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    // Text stagger animation on mount
    gsap.fromTo(
      badgeRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    )

    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.1, ease: 'power2.out' }
    )

    gsap.fromTo(
      subtitleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, delay: 0.2, ease: 'power2.out' }
    )

    if (featuresRef.current) {
      gsap.fromTo(
        featuresRef.current.querySelectorAll('.feature-row'),
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, delay: 0.3, ease: 'power2.out' }
      )
    }

    gsap.fromTo(
      ctaRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, delay: 0.5, ease: 'power2.out' }
    )

    // Image entrance with slight tilt on hover
    gsap.fromTo(
      imageRef.current,
      { opacity: 0, scale: 0.9, y: 30 },
      { opacity: 1, scale: 1, y: 0, duration: 0.8, delay: 0.2, ease: 'back.out(1.2)' }
    )



    // Floating dots animation
    dotsRef.current.forEach((dot) => {
      const randomX = gsap.utils.random(-30, 30)
      const randomY = gsap.utils.random(-30, 30)
      const randomDuration = gsap.utils.random(6, 10)

      gsap.to(dot, {
        x: randomX,
        y: randomY,
        duration: randomDuration,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      })
    })
  }, [])

  const features = [
    {
      title: 'PRS Score Engine',
      description: '0–100 real-time readiness scoring',
      icon: (
        <div className="relative w-16 h-16">
          {/* Animated circular progress with glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 dark:from-blue-500 dark:via-blue-600 dark:to-blue-700 animate-pulse shadow-xl shadow-blue-500/50"></div>
          <div className="absolute inset-2 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xl font-black bg-gradient-to-br from-blue-600 to-blue-700 bg-clip-text text-transparent">72</div>
              <div className="text-[6px] text-gray-500 dark:text-slate-400 font-bold">PRS</div>
            </div>
          </div>
          {/* Floating particles */}
          <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-400 animate-bounce"></div>
          <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></div>
        </div>
      )
    },
    {
      title: 'GitHub + LinkedIn Intelligence',
      description: 'Live profile analysis powered by APIs',
      icon: (
        <div className="relative w-16 h-16">
          {/* Lightning bolt with electric effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-400 via-purple-500 to-pink-500 dark:from-purple-500 dark:via-purple-600 dark:to-pink-600 shadow-xl shadow-purple-500/50 flex items-center justify-center transform hover:rotate-6 transition-transform duration-300">
            <svg className="w-10 h-10 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 2L3 14h8l-2 8 10-12h-8z" />
            </svg>
          </div>
          {/* Electric sparks */}
          <div className="absolute top-0 left-0 w-1 h-1 rounded-full bg-yellow-300 animate-ping"></div>
          <div className="absolute bottom-2 right-1 w-1.5 h-1.5 rounded-full bg-purple-300 animate-pulse"></div>
          <div className="absolute top-3 right-0 w-1 h-1 rounded-full bg-pink-300 animate-bounce delay-75"></div>
        </div>
      )
    },
    {
      title: 'Company Lens Eligibility',
      description: 'Match your profile with real company criteria',
      icon: (
        <div className="relative w-16 h-16">
          {/* Magnifying glass with scan lines */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400 via-cyan-500 to-teal-500 dark:from-cyan-500 dark:via-cyan-600 dark:to-teal-600 shadow-xl shadow-cyan-500/50 flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
            <svg className="w-9 h-9 text-white drop-shadow-lg" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              <path d="M11 8v6M8 11h6" strokeLinecap="round" />
            </svg>
          </div>
          {/* Scan effect */}
          <div className="absolute inset-4 rounded-full border-2 border-white/30 animate-ping"></div>
          <div className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse"></div>
        </div>
      )
    }
  ]

  return (
    <section id="home" className="relative w-full bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden transition-colors duration-500">
      {/* Premium Background */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        {/* Gradient blobs */}
        <div className="absolute -top-40 right-0 w-96 h-96 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-200 to-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-gradient-to-tl from-indigo-200 to-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15"></div>

        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'linear-gradient(0deg, transparent 24%, rgba(59, 130, 246, 0.3) 25%, rgba(59, 130, 246, 0.3) 26%, transparent 27%, transparent 74%, rgba(59, 130, 246, 0.3) 75%, rgba(59, 130, 246, 0.3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(59, 130, 246, 0.3) 25%, rgba(59, 130, 246, 0.3) 26%, transparent 27%, transparent 74%, rgba(59, 130, 246, 0.3) 75%, rgba(59, 130, 246, 0.3) 76%, transparent 77%, transparent)',
            backgroundSize: '50px 50px'
          }}
        ></div>

        {/* Floating dots */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) dotsRef.current[i] = el
            }}
            className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-20"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`
            }}
          ></div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* LEFT SIDE - PREMIUM TEXT & CTA */}
          <div className="space-y-8">
            {/* Badge with glow */}
            <div
              ref={badgeRef}
              className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-semibold relative border border-blue-200 dark:border-blue-800"
              style={{
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
              }}
            >
              AI-POWERED PLACEMENT INTELLIGENCE
            </div>

            {/* Main Title - Premium Typography */}
            <div ref={titleRef}>
              <h1 className="text-5xl lg:text-7xl font-black text-gray-900 dark:text-slate-50 leading-tight">
                CampusIQ
              </h1>
              <div className="mt-2 flex flex-wrap items-baseline gap-3">
                <span className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-slate-50">Placement Readiness</span>
                <span className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Made Predictable
                </span>
              </div>
              {/* Animated underline */}
              <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full mt-4"></div>
            </div>

            {/* Subheading */}
            <p
              ref={subtitleRef}
              className="text-lg text-gray-600 dark:text-slate-400 max-w-lg leading-relaxed"
            >
              Track LinkedIn, GitHub, Resume, Aptitude, Coding and Soft Skills using a real-time Placement Readiness Score (PRS).
            </p>

            {/* Feature Rows - Premium Cards */}
            <div ref={featuresRef} className="space-y-3">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="feature-row group bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/40 dark:border-slate-800 rounded-xl p-4 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-slate-50 text-sm">{feature.title}</h3>
                      <p className="text-xs text-gray-600 dark:text-slate-400">{feature.description}</p>
                    </div>
                    <svg className="w-5 h-5 text-blue-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div ref={ctaRef}>
              <Link href="/login">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-6 rounded-full font-semibold hover:shadow-2xl hover:shadow-blue-400 transition-all duration-300 text-lg">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Trust Line */}
            <p className="text-sm text-gray-600 dark:text-slate-400 font-medium">
              Trusted by Placement Cells • <span className="font-semibold text-blue-600">7500+ Students Tracked</span>
            </p>
          </div>

          {/* RIGHT SIDE - PREMIUM IMAGE */}
          <div className="relative h-full flex items-center justify-center">
            {/* Image Card */}
            <div
              ref={imageRef}
              className="relative w-full max-w-md"
            >
              {/* Subtle glow glow behind */}
              <div className="absolute -inset-8 bg-gradient-to-br from-blue-200/30 via-purple-200/20 to-cyan-200/30 rounded-3xl blur-3xl -z-10"></div>

              <div className="relative rounded-3xl overflow-hidden shadow-2xl"
                style={{
                  boxShadow: '0 20px 60px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                }}
              >
                {/* Gradient border */}
                <div className="absolute inset-0 rounded-3xl p-px bg-gradient-to-br from-blue-400/30 via-transparent to-cyan-400/30 pointer-events-none"></div>

                {/* Image */}
                <Image
                  src="/college-boy.png"
                  alt="College student using CampusIQ"
                  width={400}
                  height={500}
                  className="w-full h-auto object-cover"
                  priority
                />

                {/* Overlay blur */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/5 to-transparent pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white dark:from-slate-950 to-transparent pointer-events-none transition-colors duration-500"></div>
    </section>
  )
}

'use client'

import { Button } from "@/components/ui/button"

import React from "react"

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface ModuleCard {
  title: string
  description: string
  tag: string
  tags: string[]
  accentColor: string
  accentBg: string
  borderColor: string
  diagram: React.ReactNode
}

export function ModulesSection() {
  const containerRef = useRef(null)
  const cardsRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Stagger card reveal on scroll
      gsap.fromTo(
        cardsRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 60%',
            toggleActions: 'play none none none'
          }
        }
      )

      // Hover glow effect
      cardsRef.current.forEach((card) => {
        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            boxShadow: '0 0 40px rgba(59, 130, 246, 0.15)',
            duration: 0.3
          })
        })
        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            duration: 0.3
          })
        })
      })
    })

    return () => ctx.revert()
  }, [])

  const modules: ModuleCard[] = [
    {
      title: 'PRS Readiness Dashboard',
      description: 'Real-time Placement Readiness Score with category breakdown and tier prediction',
      tag: 'AI MODULE',
      tags: ['Real-time', 'AI Powered', 'Instant Scoring'],
      accentColor: 'from-blue-600 to-blue-700',
      accentBg: 'bg-blue-50',
      borderColor: 'border-blue-200',
      diagram: (
        <svg viewBox="0 0 200 140" className="w-full h-20">
          <circle cx="50" cy="50" r="30" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
          <circle cx="50" cy="50" r="28" fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="43 86" />
          <text x="50" y="56" textAnchor="middle" className="text-xs fill-gray-900 font-bold">72</text>
          <line x1="100" y1="30" x2="140" y2="30" stroke="#3b82f6" strokeWidth="1.5" />
          <line x1="100" y1="40" x2="130" y2="40" stroke="#3b82f6" strokeWidth="1.5" />
          <line x1="100" y1="50" x2="135" y2="50" stroke="#3b82f6" strokeWidth="1.5" />
          <line x1="100" y1="60" x2="120" y2="60" stroke="#3b82f6" strokeWidth="1.5" />
          <line x1="100" y1="70" x2="125" y2="70" stroke="#3b82f6" strokeWidth="1.5" />
        </svg>
      )
    },
    {
      title: 'GitHub Analyzer',
      description: 'Real API-based GitHub scoring with tech stack alignment and contribution quality',
      tag: 'API MODULE',
      tags: ['Live API', 'Real Data', 'Instant'],
      accentColor: 'from-slate-600 to-slate-700',
      accentBg: 'bg-slate-50',
      borderColor: 'border-slate-200',
      diagram: (
        <svg viewBox="0 0 200 140" className="w-full h-20">
          <line x1="20" y1="100" x2="50" y2="60" stroke="#475569" strokeWidth="2" />
          <line x1="50" y1="60" x2="80" y2="80" stroke="#475569" strokeWidth="2" />
          <line x1="80" y1="80" x2="110" y2="40" stroke="#475569" strokeWidth="2" />
          <line x1="110" y1="40" x2="140" y2="70" stroke="#475569" strokeWidth="2" />
          <circle cx="20" cy="100" r="3" fill="#475569" />
          <circle cx="50" cy="60" r="3" fill="#475569" />
          <circle cx="80" cy="80" r="3" fill="#475569" />
          <circle cx="110" cy="40" r="3" fill="#475569" />
          <circle cx="140" cy="70" r="3" fill="#475569" />
        </svg>
      )
    },
    {
      title: 'LinkedIn Analyzer',
      description: 'Deep profile assessment with headline optimization and skill endorsement analysis',
      tag: 'AI MODULE',
      tags: ['Profile Scan', 'AI Analysis', 'Instant'],
      accentColor: 'from-cyan-600 to-cyan-700',
      accentBg: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      diagram: (
        <svg viewBox="0 0 200 140" className="w-full h-20">
          <rect x="20" y="30" width="160" height="90" fill="none" stroke="#06b6d4" strokeWidth="1.5" rx="4" opacity="0.3" />
          <line x1="30" y1="50" x2="180" y2="50" stroke="#06b6d4" strokeWidth="1" />
          <circle cx="35" cy="65" r="5" fill="#06b6d4" />
          <line x1="45" y1="62" x2="75" y2="62" stroke="#06b6d4" strokeWidth="1" />
          <line x1="45" y1="68" x2="65" y2="68" stroke="#06b6d4" strokeWidth="0.5" opacity="0.6" />
          <rect x="30" y="80" width="150" height="6" fill="none" stroke="#06b6d4" strokeWidth="1" rx="1" />
        </svg>
      )
    },
    {
      title: 'Resume ATS Scoring',
      description: 'Advanced ATS optimization with keyword matching and impact metric scoring',
      tag: 'STUDENT',
      tags: ['ATS Score', 'AI Powered', 'Real-time'],
      accentColor: 'from-orange-600 to-orange-700',
      accentBg: 'bg-orange-50',
      borderColor: 'border-orange-200',
      diagram: (
        <svg viewBox="0 0 200 140" className="w-full h-20">
          <rect x="25" y="25" width="90" height="110" fill="none" stroke="#ea580c" strokeWidth="1.5" rx="2" />
          <line x1="30" y1="35" x2="110" y2="35" stroke="#ea580c" strokeWidth="1" opacity="0.6" />
          <line x1="30" y1="45" x2="110" y2="45" stroke="#ea580c" strokeWidth="0.8" opacity="0.6" />
          <line x1="30" y1="55" x2="105" y2="55" stroke="#ea580c" strokeWidth="0.8" opacity="0.5" />
          <line x1="30" y1="65" x2="100" y2="65" stroke="#ea580c" strokeWidth="0.8" opacity="0.5" />
          <text x="140" y="75" className="text-xs fill-orange-600 font-bold">92</text>
        </svg>
      )
    },
    {
      title: 'Company Lens Mode',
      description: 'Strategic matching against company requirements and role eligibility prediction',
      tag: 'AI MODULE',
      tags: ['Smart Matching', 'Live Data', 'Prediction'],
      accentColor: 'from-purple-600 to-purple-700',
      accentBg: 'bg-purple-50',
      borderColor: 'border-purple-200',
      diagram: (
        <svg viewBox="0 0 200 140" className="w-full h-20">
          <text x="20" y="50" className="text-xs fill-gray-700 font-semibold">You</text>
          <line x1="20" y1="60" x2="70" y2="60" stroke="#a855f7" strokeWidth="3" />
          <text x="120" y="50" className="text-xs fill-gray-700 font-semibold">Req</text>
          <line x1="120" y1="60" x2="170" y2="60" stroke="#a855f7" strokeWidth="1.5" opacity="0.4" />
          <line x1="20" y1="80" x2="70" y2="80" stroke="#a855f7" strokeWidth="2.5" />
          <line x1="120" y1="80" x2="170" y2="80" stroke="#a855f7" strokeWidth="1" opacity="0.4" />
          <line x1="20" y1="100" x2="70" y2="100" stroke="#a855f7" strokeWidth="1.5" opacity="0.5" />
          <line x1="120" y1="100" x2="170" y2="100" stroke="#a855f7" strokeWidth="2" />
        </svg>
      )
    },
    {
      title: 'Admin Heatmap Engine',
      description: 'Branch-wise readiness heatmap with training recommendations and risk forecasting',
      tag: 'ADMIN',
      tags: ['Heatmap', 'Analytics', 'Prediction'],
      accentColor: 'from-red-600 to-red-700',
      accentBg: 'bg-red-50',
      borderColor: 'border-red-200',
      diagram: (
        <svg viewBox="0 0 200 140" className="w-full h-20">
          <g opacity="0.4">
            <rect x="20" y="30" width="12" height="80" fill="#dc2626" />
            <rect x="35" y="40" width="12" height="70" fill="#ef4444" />
            <rect x="50" y="50" width="12" height="60" fill="#f87171" />
            <rect x="65" y="35" width="12" height="75" fill="#dc2626" />
            <rect x="80" y="45" width="12" height="65" fill="#ef4444" />
            <rect x="95" y="55" width="12" height="55" fill="#fca5a5" />
            <rect x="110" y="40" width="12" height="70" fill="#ef4444" />
            <rect x="125" y="50" width="12" height="60" fill="#f87171" />
          </g>
          <circle cx="165" cy="70" r="15" fill="none" stroke="#dc2626" strokeWidth="2" opacity="0.5" />
        </svg>
      )
    }
  ]

  return (
    <section id="modules" ref={containerRef} className="relative py-20 bg-white overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-100 to-transparent rounded-full filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-gradient-to-tr from-purple-100 to-transparent rounded-full filter blur-3xl opacity-10"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            CORE INTELLIGENCE MODULES
          </div>
          <h2 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
            Advanced Placement <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Analytics</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Six premium modules built for student success and institutional intelligence. Each powered by cutting-edge AI and real-time data.
          </p>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-6">
          {modules.map((module, index) => (
            <div
              key={index}
              ref={(el) => {
                if (el) cardsRef.current[index] = el
              }}
              className="group relative h-full cursor-pointer"
            >
              {/* Glassmorphism Card */}
              <div className="relative h-full bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl p-8 overflow-hidden transition-all duration-300 hover:bg-white/60"
                style={{
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
              >
                {/* Gradient border on hover */}
                <div className="absolute inset-0 rounded-2xl p-px bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${
                      module.accentColor === 'from-blue-600 to-blue-700' ? '#3b82f6' :
                      module.accentColor === 'from-slate-600 to-slate-700' ? '#475569' :
                      module.accentColor === 'from-cyan-600 to-cyan-700' ? '#06b6d4' :
                      module.accentColor === 'from-orange-600 to-orange-700' ? '#ea580c' :
                      module.accentColor === 'from-purple-600 to-purple-700' ? '#a855f7' :
                      '#dc2626'
                    }, transparent)`
                  }}
                ></div>

                {/* Content */}
                <div className="relative z-10 space-y-6">
                  {/* Top: Diagram */}
                  <div className={`w-full p-6 rounded-xl ${module.accentBg} border border-gray-200/50 flex items-center justify-center`}>
                    {module.diagram}
                  </div>

                  {/* Middle: Title & Description */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {module.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {module.description}
                    </p>
                  </div>

                  {/* Bottom: Tags & Metadata */}
                  <div className="space-y-4 pt-2">
                    {/* Tag pills */}
                    <div className="flex flex-wrap gap-2">
                      {module.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className={`px-3 py-1 rounded-full text-xs font-medium text-white`}
                          style={{
                            background: module.accentColor === 'from-blue-600 to-blue-700' ? '#3b82f6' :
                              module.accentColor === 'from-slate-600 to-slate-700' ? '#475569' :
                              module.accentColor === 'from-cyan-600 to-cyan-700' ? '#06b6d4' :
                              module.accentColor === 'from-orange-600 to-orange-700' ? '#ea580c' :
                              module.accentColor === 'from-purple-600 to-purple-700' ? '#a855f7' :
                              '#dc2626'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* View Details link */}
                    <div className="pt-2 flex items-center gap-2 text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors cursor-pointer">
                      <span>View Details</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

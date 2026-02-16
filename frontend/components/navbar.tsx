'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState } from 'react'
import { ModeToggle } from '@/components/mode-toggle'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    element?.scrollIntoView({ behavior: 'smooth' })
    setIsOpen(false)
  }

  const navLinks = [
    { label: 'Home', id: 'home' },
    { label: 'Features', id: 'features' },
    { label: 'Modules', id: 'modules' },
    { label: 'Dashboards', id: 'dashboards' },
    { label: 'Digital Twin', id: 'digitaltwin' },
    { label: 'Contact', id: 'contact' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => scrollToSection('home')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center font-bold text-white text-lg shadow-md">
              CQ
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900 dark:text-slate-50">CampusIQ</h1>
              <p className="text-xs text-gray-500 dark:text-slate-400 -mt-1">Placement Intelligence</p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-all duration-200"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:shadow-blue-200 transition-all hidden sm:inline-flex rounded-full">
                Login / Signup
              </Button>
            </Link>

            <ModeToggle />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}

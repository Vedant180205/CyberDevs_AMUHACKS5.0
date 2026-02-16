'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-gray-400 py-16 transition-colors duration-500">
      <div className="max-w-6xl mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Product Column */}
          <div className="space-y-4">
            <h4 className="font-bold text-white text-sm uppercase tracking-wide">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#features" className="hover:text-white transition duration-200">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#modules" className="hover:text-white transition duration-200">
                  Modules
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition duration-200">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition duration-200">
                  Security
                </Link>
              </li>
            </ul>
          </div>

          {/* Students Column */}
          <div className="space-y-4">
            <h4 className="font-bold text-white text-sm uppercase tracking-wide">Students</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#students" className="hover:text-white transition duration-200">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition duration-200">
                  Micro Tasks
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition duration-200">
                  Company Lens
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition duration-200">
                  Learning Path
                </Link>
              </li>
            </ul>
          </div>

          {/* Admin Column */}
          <div className="space-y-4">
            <h4 className="font-bold text-white text-sm uppercase tracking-wide">Admin</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#admin" className="hover:text-white transition duration-200">
                  Heatmaps
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition duration-200">
                  Analytics
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition duration-200">
                  Training Engine
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition duration-200">
                  Predictions
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="space-y-4">
            <h4 className="font-bold text-white text-sm uppercase tracking-wide">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-white transition duration-200">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition duration-200">
                  API Docs
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition duration-200">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition duration-200">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-4">
            <h4 className="font-bold text-white text-sm uppercase tracking-wide">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-white transition duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition duration-200">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition duration-200">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition duration-200">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 dark:border-slate-800 pt-8">
          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo & Copyright */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CQ</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">CampusIQ</p>
                <p className="text-xs text-gray-500">© 2026 Built by QuantDevs</p>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-6">
              <Link href="#" className="hover:text-white transition duration-200 text-sm font-medium">
                Twitter
              </Link>
              <Link href="#" className="hover:text-white transition duration-200 text-sm font-medium">
                LinkedIn
              </Link>
              <Link href="#" className="hover:text-white transition duration-200 text-sm font-medium">
                GitHub
              </Link>
              <Link href="#" className="hover:text-white transition duration-200 text-sm font-medium">
                Discord
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

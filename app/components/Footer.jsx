'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on interactive chat story player
  if (pathname?.match(/^\/stories\/\d+\/\d+\/chat-story$/)) {
    return null;
  }

  return (
    <footer className="bg-[#171A20] text-white border-t border-white/10 pt-12 pb-8 w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-10">
          {/* Brand Column */}
          <div className="space-y-3">
            <Link href="/" className="inline-block">
              <img
                src="/Transparentlogo.png"
                alt="Qatha Logo"
                className="max-w-[150px] max-h-[45px] object-contain"
              />
            </Link>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Interactive chat stories, choice-driven narratives, and immersive audio books.
            </p>
          </div>

          {/* Discover Column */}
          <div className="md:pl-8">
            <h3 className="text-xs font-bold text-gray-200 uppercase tracking-widest mb-4">
              Discover
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/" className="text-gray-400 hover:text-orange-400 transition-colors inline-block">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/stories" className="text-gray-400 hover:text-orange-400 transition-colors inline-block">
                  Chat & Audio Stories
                </Link>
              </li>
              <li>
                <Link href="/create-story" className="text-gray-400 hover:text-orange-400 transition-colors inline-block">
                  Create Story
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="md:pl-8">
            <h3 className="text-xs font-bold text-gray-200 uppercase tracking-widest mb-4">
              Company
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/our-story" className="text-gray-400 hover:text-orange-400 transition-colors inline-block">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="text-gray-400 hover:text-orange-400 transition-colors inline-block">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Qatha. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/our-story" className="hover:text-gray-300 transition-colors">
              Our Story
            </Link>
            <Link href="/contact-us" className="hover:text-gray-300 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

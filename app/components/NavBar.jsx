'use client';
import React, { useState } from 'react'
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export default function NavBar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigateTo = (path) => {
    router.push(path);
    setIsMenuOpen(false); // Close menu after navigation
  };

  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 shadow-md">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo or App Title */}
          <h1 className="text-2xl font-bold">Fictional Chats</h1>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex gap-6 text-base">
              <li
                className="hover:text-gray-300 cursor-pointer"
                onClick={() => navigateTo('/')}
              >
                Home
              </li>
              <li
                className="hover:text-gray-300 cursor-pointer"
                onClick={() => navigateTo('/your-stories')}
              >
                Your Stories
              </li>
              <li
                className="hover:text-gray-300 cursor-pointer"
                onClick={() => navigateTo('/profile')}
              >
                Profile
              </li>
            </ul>
          </nav>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4">
            <ul className="flex flex-col gap-4 text-base">
              <li
                className="hover:text-gray-300 cursor-pointer py-2 border-b border-gray-700"
                onClick={() => navigateTo('/')}
              >
                Home
              </li>
              <li
                className="hover:text-gray-300 cursor-pointer py-2 border-b border-gray-700"
                onClick={() => navigateTo('/your-stories')}
              >
                Your Stories
              </li>
              <li
                className="hover:text-gray-300 cursor-pointer py-2"
                onClick={() => navigateTo('/profile')}
              >
                Profile
              </li>
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
};

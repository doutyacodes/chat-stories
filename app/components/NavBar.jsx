'use client';
import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Home, Book, User, Plus, Sparkles, Gamepad2, Info, Mail } from 'lucide-react';
import Link from 'next/link';

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

 
  // Check if the current path should have a transparent navbar
  const shouldBeTransparent = () => {
    if (pathname === '/' || pathname === '/home') return true;
    // Check for story-overview pages with dynamic IDs
    if (pathname.match(/^\/stories\/\d+\/story-overview$/)) return true;
    return false;
  };

  const isTransparent = shouldBeTransparent();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigateTo = (path) => {
    router.push(path);
    setIsMenuOpen(false);
  };
  
  return (
    <>
     {/* Desktop and Mobile Top Navigation */}
     <div className="relative">
        <div className={`
          ${isTransparent ? 'md:absolute md:top-0 md:left-0 md:right-0 md:z-50 md:bg-black/85' : 'bg-black'}
          ${!isTransparent ? 'bg-black' : 'bg-black md:bg-black/85'}
        `}>
          <div className={`${isTransparent ? 'md:h-24' : ''} md:py-4`}>
            <div className="container mx-auto">
              <div className="flex md:justify-between justify-center items-center">
                {/* Logo - centered on mobile, left-aligned on desktop */}
                <div className="flex items-center">
                  <img 
                    src="/Transparentlogo.png" 
                    alt="Ping Tales Logo" 
                    className="max-w-[167px] max-h-[77px] object-contain md:max-w-[220px] md:max-h-[80px]"
                  />
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:block">
                  <ul className="flex gap-6 text-lg font-medium">
                    <li 
                      className="text-white hover:text-gray-300 cursor-pointer transition-colors"
                      onClick={() => router.push('/')}
                    >
                      Home
                    </li>
                    <li 
                      className="text-white hover:text-gray-300 cursor-pointer transition-colors"
                      onClick={() => router.push('/stories')}
                    >
                      Stories
                    </li>

                    <li 
                      className="text-white hover:text-gray-300 cursor-pointer transition-colors"
                      // onClick={() => router.push('/stories')}
                    >
                      Games
                    </li>

                    <li 
                      className="text-white hover:text-gray-300 cursor-pointer transition-colors"
                      onClick={() => router.push('/search-story')}
                    >
                      Create
                    </li>

                    <li 
                      className="text-white hover:text-gray-300 cursor-pointer transition-colors"
                      onClick={() => router.push('/profile')}
                    >
                      Profile
                    </li>

                    <li className='relative'>
                      <div onClick={() => setIsOpen(!isOpen)}>
                        <Menu 
                          className={`text-white hover:text-gray-300 cursor-pointer transition-colors ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                      {isOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-[999] transform opacity-100 scale-100 transition-all duration-200 origin-top-right ring-1 ring-black ring-opacity-5">
                          <div className="absolute right-3 -top-2 w-4 h-4 bg-white transform rotate-45 border-l border-t border-black/5" />
                          
                          <div className="relative bg-white rounded-lg">
                            <Link
                              href="/"
                              className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors duration-200"
                            >
                              <Info className="w-4 h-4" />
                              <span className="font-medium">Our Story</span>
                            </Link>
                            
                            <Link 
                              href="/"
                              className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors duration-200"
                            >
                              <Mail className="w-4 h-4" />
                              <span className="font-medium">Contact Us</span>
                            </Link>
                          </div>
                        </div>
                      )}
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden bg-[#111111] fixed pt-1 pb-2.5 -bottom-1 left-0 right-0 z-[100] text-white shadow-lg">
        <div className="flex justify-around items-center h-16 px-4">
          <button
            onClick={() => navigateTo('/')}
            className="flex flex-col items-center space-y-1 text-xs"
          >
            <Home size={20} />
            <span>Home</span>
          </button>
          
          <button
            onClick={() => navigateTo('/stories')}
            className="flex flex-col items-center space-y-1 text-xs"
          >
            <Book size={20} />
            <span>Stories</span>
          </button>
          
          <button
            onClick={() => navigateTo('/search-story')}
            className="flex flex-col items-center space-y-1 text-xs"
          >
            <div className="bg-gradient-to-r from-[rgb(4,188,100)] to-[rgb(4,188,100)] p-3 rounded-full shadow-lg">
              <Plus size={24} />
            </div>
            <span>Create</span>
          </button>
          
          {/* <button
            onClick={() => navigateTo('/create-story')}
            className="flex flex-col items-center space-y-1 text-sm"
          >
            <Sparkles size={20} />
          </button> */}
          
          <button
            onClick={() => navigateTo('/games')}
            className="flex flex-col items-center space-y-1 text-xs"
          >
            <Gamepad2 size={20} />
            <span>Games</span>
          </button>
          
          <button
            onClick={() => navigateTo('/profile')}
            className="flex flex-col items-center space-y-1 text-xs"
          >
            <img
              // src="./user.png"
              src="https://www.pingtales.com/user.png"
              alt="Profile"
              className="w-7 h-7 rounded-full object-cover"
            />
            <span>Profile</span>
          </button>
        </div>
      </div>
    </>
  );
};

'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Home, Book, User, Sparkles, Gamepad2, Info, Mail, Plus, LogOut, LogIn } from 'lucide-react';
import {ChevronDown, PenLine, Layout } from 'lucide-react';
import Link from 'next/link';
import useAuth from '@/app/hooks/useAuth';

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();

  // Refs for click-outside detection
  const createDropdownRef = useRef(null);
  const menuDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Check if the current path should have a transparent navbar
  const shouldBeTransparent = () => {
    if (pathname === '/' || pathname === '/home') return true;
    // Check for story-overview pages with dynamic IDs
    if (pathname.match(/^\/stories\/\d+\/story-overview$/)) return true;
    return false;
  };

  const isTransparent = shouldBeTransparent();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isMobileCreateOpen, setIsMobileCreateOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close all desktop dropdowns
  const closeAllDropdowns = useCallback(() => {
    setIsCreateOpen(false);
    setIsMenuOpen(false);
  }, []);

  // Toggle a specific dropdown, closing the other one first
  const toggleCreateDropdown = () => {
    setIsMenuOpen(false);
    setIsCreateOpen(prev => !prev);
  };

  const toggleMenuDropdown = () => {
    setIsCreateOpen(false);
    setIsMenuOpen(prev => !prev);
  };

  // Click outside handler for desktop dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside all dropdown refs
      const isOutsideCreate = !createDropdownRef.current || !createDropdownRef.current.contains(event.target);
      const isOutsideMenu = !menuDropdownRef.current || !menuDropdownRef.current.contains(event.target);

      if (isOutsideCreate && isOutsideMenu) {
        closeAllDropdowns();
      }
    };

    if (isCreateOpen || isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCreateOpen, isMenuOpen, closeAllDropdowns]);

  const navigateTo = (path) => {
    setIsMobileCreateOpen(false);
    setIsMobileMenuOpen(false);
    closeAllDropdowns();
    router.push(path);
  };

  const handleLogout = () => {
    closeAllDropdowns();
    setIsMobileMenuOpen(false);
    logout();
  };

  //function to check if we're on a chat story page
  const isChatStoryPage = () => {
    return pathname.match(/^\/stories\/\d+\/\d+\/chat-story$/);
  };

  // Whether any desktop dropdown is open (used for overlay)
  const isAnyDesktopDropdownOpen = isCreateOpen || isMenuOpen;
    
  return (
    <>
    <div className={`relative ${isChatStoryPage() ? 'hidden' : ''}`}>
      {/* Desktop and Mobile Top Navigation */}
      <div className="relative">
        <div className={`
          ${isTransparent ? 'md:absolute md:top-0 md:left-0 md:right-0 md:z-50 md:bg-black/85' : 'bg-black'}
          ${!isTransparent ? 'bg-black' : 'bg-black md:bg-black/85'}
        `}>
          <div className={`${isTransparent ? 'md:h-24' : ''} flex items-center py-2 md:py-0`}>
            <div className="w-full max-w-[1920px] mx-auto px-4 md:px-9 h-full">
              <div className="relative flex justify-between items-center h-full min-h-[80px]">
                {/* Left Logo (ByRoice) - Hidden on Mobile, Shown on Desktop (50% size of Qatha / matches nav text size) */}
                <div className="hidden md:flex items-center z-10">
                  <a 
                    href="https://www.byroice.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center transition-opacity hover:opacity-85"
                  >
                    <img 
                      src="/ByRoice-white-transp.png" 
                      alt="ByRoice Logo" 
                      className="max-h-[28px] md:max-h-[34px] w-auto object-contain"
                    />
                  </a>
                </div>

                {/* Main Logo (Centered Vertically and Horizontally) */}
                <div 
                  className="flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
                  onClick={() => router.push('/')}
                >
                  <img 
                    src="/Transparentlogo.png" 
                    alt="Ping Tales Logo" 
                    className="max-w-[140px] max-h-[60px] xs:max-w-[170px] object-contain md:max-w-[260px] md:max-h-[92px]"
                  />
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:block ml-auto z-10">
                  <ul className="flex gap-6 text-lg font-medium items-center">
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
                      onClick={() => router.push('/games')}
                    >
                      Games
                    </li>

                    {/* Create Dropdown */}
                    <li className="relative" ref={createDropdownRef}>
                      <div 
                        className="flex items-center gap-1 text-white hover:text-gray-300 cursor-pointer transition-colors"
                        onClick={toggleCreateDropdown}
                      >
                        Create
                        <ChevronDown className={`w-4 h-4 transition-transform ${isCreateOpen ? 'rotate-180' : ''}`} />
                      </div>
                      
                      {isCreateOpen && (
                        <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-[999] transform opacity-100 scale-100 transition-all duration-200 origin-top-left ring-1 ring-black ring-opacity-5">
                          <div className="absolute left-4 -top-2 w-4 h-4 bg-white transform rotate-45 border-l border-t border-black/5" />
                          
                          <div className="relative bg-white rounded-lg">
                            <Link
                              onClick={() => setIsCreateOpen(false)}
                              href="/your-stories"
                              className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors duration-200"
                            >
                              <Layout className="w-4 h-4" />
                              <span className="font-medium">Your Stories</span>
                            </Link>
                            
                            <Link 
                              onClick={() => setIsCreateOpen(false)}
                              href="/create-story"
                              className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors duration-200"
                            >
                              <PenLine className="w-4 h-4" />
                              <span className="font-medium">Create Story/Game</span>
                            </Link>
                          </div>
                        </div>
                      )}
                    </li>

                    {/* Menu Dropdown (now includes Profile + Logout) */}
                    <li className="relative" ref={menuDropdownRef}>
                      <div onClick={toggleMenuDropdown}>
                        <Menu 
                          className={`text-white hover:text-gray-300 cursor-pointer transition-colors ${
                            isMenuOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                      {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-[999] transform opacity-100 scale-100 transition-all duration-200 origin-top-right ring-1 ring-black ring-opacity-5">
                          <div className="absolute right-3 -top-2 w-4 h-4 bg-white transform rotate-45 border-l border-t border-black/5" />
                          
                          <div className="relative bg-white rounded-lg">
                            <Link
                              onClick={() => setIsMenuOpen(false)}
                              href="/profile"
                              className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors duration-200"
                            >
                              <User className="w-4 h-4" />
                              <span className="font-medium">Profile</span>
                            </Link>

                            <Link
                              onClick={() => setIsMenuOpen(false)}
                              href="/our-story"
                              className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors duration-200"
                            >
                              <Info className="w-4 h-4" />
                              <span className="font-medium">Our Story</span>
                            </Link>
                            
                            <Link 
                              onClick={() => setIsMenuOpen(false)}
                              href="/contact-us"
                              className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors duration-200"
                            >
                              <Mail className="w-4 h-4" />
                              <span className="font-medium">Contact Us</span>
                            </Link>

                            <div className="my-1 border-t border-gray-100" />

                             {isAuthenticated ? (
                              <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors duration-200"
                              >
                                <LogOut className="w-4 h-4" />
                                <span className="font-medium">Logout</span>
                              </button>
                            ) : (
                              <Link
                                onClick={() => setIsMenuOpen(false)}
                                href="/login"
                                className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors duration-200"
                              >
                                <LogIn className="w-4 h-4" />
                                <span className="font-medium">Login</span>
                              </Link>
                            )}

                            <div className="my-1 border-t border-gray-100" />

                            <a
                              href="https://www.byroice.com/"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setIsMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors duration-200"
                            >
                              <div className="bg-black p-1 rounded flex items-center justify-center">
                                <img 
                                  src="/ByRoice-white-transp.png" 
                                  alt="ByRoice Logo" 
                                  className="w-3.5 h-3.5 object-contain"
                                />
                              </div>
                              <span className="font-medium">ByRoice</span>
                            </a>
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
    </div>

    <div className={`md:hidden bg-[#111111] fixed pt-1 pb-2.5 -bottom-1 left-0 right-0 z-[100] text-white shadow-lg ${isChatStoryPage() ? 'hidden' : ''}`}>
      {/* Mobile Create Menu Overlay */}
      {isMobileCreateOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-[101]"
          onClick={() => setIsMobileCreateOpen(false)}
        />
      )}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-[101]"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Create Menu */}
      <div className={`
        md:hidden fixed left-0 right-0 bottom-0 bg-white rounded-t-3xl z-[102] transition-transform duration-300 ease-out
        ${isMobileCreateOpen ? 'translate-y-0' : 'translate-y-full'}
      `}>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Create</h3>
            <button 
              onClick={() => setIsMobileCreateOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={() => navigateTo('/your-stories')}
              className="w-full flex items-center gap-3 p-4 text-left text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded-xl transition-colors"
            >
              <div className="bg-orange-100 p-2 rounded-lg">
                <Layout size={24} className="text-orange-500" />
              </div>
              <div>
                <div className="font-semibold">Your Stories</div>
                <div className="text-sm text-gray-500">View and manage your stories</div>
              </div>
            </button>

            <button
              onClick={() => navigateTo('/create-story')}
              className="w-full flex items-center gap-3 p-4 text-left text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded-xl transition-colors"
            >
              <div className="bg-orange-100 p-2 rounded-lg">
                <PenLine size={24} className="text-orange-500" />
              </div>
              <div>
                <div className="font-semibold">Create Story/Game</div>
                <div className="text-sm text-gray-500">Start creating a new story</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Profile, Our Story, Contact, Logout) */}
      <div ref={mobileMenuRef} className={`
        md:hidden fixed left-0 right-0 bottom-0 bg-white rounded-t-3xl z-[102] transition-transform duration-300 ease-out
        ${isMobileMenuOpen ? 'translate-y-0' : 'translate-y-full'}
      `}>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Menu</h3>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={() => navigateTo('/profile')}
              className="w-full flex items-center gap-3 p-4 text-left text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded-xl transition-colors"
            >
              <div className="bg-orange-100 p-2 rounded-lg">
                <User size={24} className="text-orange-500" />
              </div>
              <div>
                <div className="font-semibold">Profile</div>
                <div className="text-sm text-gray-500">View your profile</div>
              </div>
            </button>

            <button
              onClick={() => navigateTo('/our-story')}
              className="w-full flex items-center gap-3 p-4 text-left text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded-xl transition-colors"
            >
              <div className="bg-orange-100 p-2 rounded-lg">
                <Info size={24} className="text-orange-500" />
              </div>
              <div>
                <div className="font-semibold">Our Story</div>
                <div className="text-sm text-gray-500">Learn more about us</div>
              </div>
            </button>

            <button
              onClick={() => navigateTo('/contact-us')}
              className="w-full flex items-center gap-3 p-4 text-left text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded-xl transition-colors"
            >
              <div className="bg-orange-100 p-2 rounded-lg">
                <Mail size={24} className="text-orange-500" />
              </div>
              <div>
                <div className="font-semibold">Contact Us</div>
                <div className="text-sm text-gray-500">Get in touch with us</div>
              </div>
            </button>

            <div className="my-1 border-t border-gray-100" />

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-4 text-left text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <div className="bg-red-100 p-2 rounded-lg">
                  <LogOut size={24} className="text-red-500" />
                </div>
                <div>
                  <div className="font-semibold">Logout</div>
                  <div className="text-sm text-red-400">Sign out of your account</div>
                </div>
              </button>
            ) : (
              <button
                onClick={() => navigateTo('/login')}
                className="w-full flex items-center gap-3 p-4 text-left text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded-xl transition-colors"
              >
                <div className="bg-orange-100 p-2 rounded-lg">
                  <LogIn size={24} className="text-orange-500" />
                </div>
                <div>
                  <div className="font-semibold">Login</div>
                  <div className="text-sm text-gray-500">Sign in to your account</div>
                </div>
              </button>
            )}

            <div className="my-1 border-t border-gray-100" />

            <a
              href="https://www.byroice.com/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full flex items-center gap-3 p-4 text-left text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded-xl transition-colors"
            >
              <div className="bg-black p-2 rounded-lg flex items-center justify-center">
                <img 
                  src="/ByRoice-white-transp.png" 
                  alt="ByRoice Logo" 
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div>
                <div className="font-semibold">ByRoice</div>
                <div className="text-sm text-gray-500">Visit byroice.com</div>
              </div>
            </a>
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
            onClick={() => { setIsMobileMenuOpen(false); setIsMobileCreateOpen(true); }}
            className="flex flex-col items-center space-y-1 text-xs"
          >
            <div className="bg-gradient-to-r from-[rgb(4,188,100)] to-[rgb(4,188,100)] p-3 rounded-full shadow-lg">
              <Plus size={24} />
            </div>
            <span>Create</span>
          </button>
          
          <button
            onClick={() => navigateTo('/games')}
            className="flex flex-col items-center space-y-1 text-xs"
          >
            <Gamepad2 size={20} />
            <span>Games</span>
          </button>
          
          <button
            onClick={() => { setIsMobileCreateOpen(false); setIsMobileMenuOpen(true); }}
            className="flex flex-col items-center space-y-1 text-xs"
          >
            <Menu size={20} />
            <span>Menu</span>
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

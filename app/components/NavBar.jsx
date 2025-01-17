'use client';
import React, { useState } from 'react'
import { useRouter } from 'next/navigation';
import { Menu, X, Home, Book, User, Plus, Sparkles } from 'lucide-react';

export default function NavBar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigateTo = (path) => {
    router.push(path);
    setIsMenuOpen(false); // Close menu after navigation
  };

  return (
    // <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 shadow-md">
    //   <div className="container mx-auto">
    //     <div className="flex justify-between items-center">
    //       {/* Logo or App Title */}
    //       <h1 className="text-2xl font-bold">Fictional Chats</h1>

    //       {/* Mobile Menu Button */}
    //       <button 
    //         className="md:hidden"
    //         onClick={() => setIsMenuOpen(!isMenuOpen)}
    //       >
    //         {isMenuOpen ? (
    //           <X size={24} />
    //         ) : (
    //           <Menu size={24} />
    //         )}
    //       </button>

    //       {/* Desktop Navigation */}
    //       <nav className="hidden md:block">
    //         <ul className="flex gap-6 text-base">
    //           <li
    //             className="hover:text-gray-300 cursor-pointer"
    //             onClick={() => navigateTo('/')}
    //           >
    //             Home
    //           </li>
    //           <li
    //             className="hover:text-gray-300 cursor-pointer"
    //             onClick={() => navigateTo('/your-stories')}
    //           >
    //             Your Stories
    //           </li>
    //           <li
    //             className="hover:text-gray-300 cursor-pointer"
    //             onClick={() => navigateTo('/profile')}
    //           >
    //             Profile
    //           </li>
    //         </ul>
    //       </nav>
    //     </div>

    //     {/* Mobile Navigation */}
    //     {isMenuOpen && (
    //       <nav className="md:hidden mt-4">
    //         <ul className="flex flex-col gap-4 text-base">
    //           <li
    //             className="hover:text-gray-300 cursor-pointer py-2 border-b border-gray-700"
    //             onClick={() => navigateTo('/')}
    //           >
    //             Home
    //           </li>
    //           <li
    //             className="hover:text-gray-300 cursor-pointer py-2 border-b border-gray-700"
    //             onClick={() => navigateTo('/your-stories')}
    //           >
    //             Your Stories
    //           </li>
    //           <li
    //             className="hover:text-gray-300 cursor-pointer py-2"
    //             onClick={() => navigateTo('/profile')}
    //           >
    //             Profile
    //           </li>
    //         </ul>
    //       </nav>
    //     )}
    //   </div>
    // </div>
    <>
      {/* Desktop and Mobile Top Navigation */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <div className="flex justify-center md:justify-between items-center">
            {/* Logo or App Title */}
            <h1 className="text-2xl font-bold">Fictional Chats</h1>

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
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg">
        <div className="flex justify-around items-center h-16 px-4">
          <button
            onClick={() => navigateTo('/')}
            className="flex flex-col items-center space-y-1 text-sm"
          >
            <Home size={20} />
            <span>Home</span>
          </button>
          
          <button
            onClick={() => navigateTo('/your-stories')}
            className="flex flex-col items-center space-y-1 text-sm"
          >
            <Book size={20} />
            <span>Stories</span>
          </button>
          
          <button
            onClick={() => navigateTo('/search-story')}
            className="flex flex-col items-center space-y-1 text-sm"
          >
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full -mt-8 shadow-lg">
              <Plus size={24} />
            </div>
            <span className="mt-1">Create</span>
          </button>
          
          <button
            onClick={() => navigateTo('/create-story')}
            className="flex flex-col items-center space-y-1 text-sm"
          >
            <Sparkles size={20} />
            <span>Creators</span>
          </button>
          
          <button
            onClick={() => navigateTo('/profile')}
            className="flex flex-col items-center space-y-1 text-sm"
          >
            <User size={20} />
            <span>Profile</span>
          </button>
        </div>
      </div>
    </>
  );
};

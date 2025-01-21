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
    // <>
    //   {/* Desktop and Mobile Top Navigation */}
    //   <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 shadow-md">
    //     <div className="container mx-auto">
    //       <div className="flex justify-center md:justify-between items-center">
    //         {/* Logo or App Title */}
    //         <h1 className="text-2xl font-bold">Fictional Chats</h1>

    //         {/* Desktop Navigation */}
    //         <nav className="hidden md:block">
    //           <ul className="flex gap-6 text-base">
    //             <li
    //               className="hover:text-gray-300 cursor-pointer"
    //               onClick={() => navigateTo('/')}
    //             >
    //               Home
    //             </li>
    //             <li
    //               className="hover:text-gray-300 cursor-pointer"
    //               onClick={() => navigateTo('/your-stories')}
    //             >
    //               Your Stories
    //             </li>
    //             <li
    //               className="hover:text-gray-300 cursor-pointer"
    //               onClick={() => navigateTo('/profile')}
    //             >
    //               Profile
    //             </li>
    //           </ul>
    //         </nav>
    //       </div>
    //     </div>
    //   </div>

    //   {/* Mobile Bottom Navigation */}
    //   <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg">
    //     <div className="flex justify-around items-center h-16 px-4">
    //       <button
    //         onClick={() => navigateTo('/')}
    //         className="flex flex-col items-center space-y-1 text-sm"
    //       >
    //         <Home size={20} />
    //         <span>Home</span>
    //       </button>
          
    //       <button
    //         onClick={() => navigateTo('/your-stories')}
    //         className="flex flex-col items-center space-y-1 text-sm"
    //       >
    //         <Book size={20} />
    //         <span>Stories</span>
    //       </button>
          
    //       <button
    //         onClick={() => navigateTo('/search-story')}
    //         className="flex flex-col items-center space-y-1 text-sm"
    //       >
    //         <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full -mt-8 shadow-lg">
    //           <Plus size={24} />
    //         </div>
    //         <span className="mt-1">Create</span>
    //       </button>
          
    //       <button
    //         onClick={() => navigateTo('/create-story')}
    //         className="flex flex-col items-center space-y-1 text-sm"
    //       >
    //         <Sparkles size={20} />
    //         <span>Creators</span>
    //       </button>
          
    //       <button
    //         onClick={() => navigateTo('/profile')}
    //         className="flex flex-col items-center space-y-1 text-sm"
    //       >
    //         <User size={20} />
    //         <span>Profile</span>
    //       </button>
    //     </div>
    //   </div>
    // </>
    <>
      {/* Desktop and Mobile Top Navigation */}
      <div className="bg-black text-white p-4 shadow-md border-b border-white/50">
        <div className="container mx-auto">
          <div className="flex justify-center md:justify-between items-center">
             {/* Logo */}
              <div className="flex items-center">
                <img 
                  src="/pingtaleslogo.png" 
                  alt="Ping Tales Logo" 
                  className="max-w-[140px] max-h-[65px] object-contain md:max-w-[220px] md:max-h-[80px]"

                />
              </div>

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
                  onClick={() => navigateTo('/stories')}
                >
                  All Stories
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
      <div className="md:hidden bg-black fixed bottom-0 left-0 right-0 z-[100] text-white shadow-lg border-t border-[rgb(4,188,100)]">
        <div className="flex justify-around items-center h-16 px-4">
          <button
            onClick={() => navigateTo('/')}
            className="flex flex-col items-center space-y-1 text-sm"
          >
            <Home size={20} />
          </button>
          
          <button
            onClick={() => navigateTo('/stories')}
            className="flex flex-col items-center space-y-1 text-sm"
          >
            <Book size={20} />
          </button>
          
          <button
            onClick={() => navigateTo('/search-story')}
            className="flex flex-col items-center space-y-1 text-sm"
          >
            <div className="bg-gradient-to-r from-[rgb(4,188,100)] to-[rgb(4,188,100)] p-3 rounded-full shadow-lg">
              <Plus size={24} />
            </div>
          </button>
          
          {/* <button
            onClick={() => navigateTo('/create-story')}
            className="flex flex-col items-center space-y-1 text-sm"
          >
            <Sparkles size={20} />
          </button> */}

          <div className="flex flex-col items-center space-y-1 text-sm invisible">
            <Sparkles size={20} />
          </div>
          
          <button
            onClick={() => navigateTo('/profile')}
            className="w-7 h-7 rounded-full overflow-hidden focus:outline-none"
          >
            <img
              // src={`${BASE_IMAGE_URL}${userProfileImage || 'default-profile.png'}`}
              src={`./user.png`}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>
    </>
  );
};

"use client"
import React from 'react';
import { Search, Home, MessageCircle, PlusCircle, Layout, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const StoryCarousel = () => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const stories = [
    {
      title: "The Wolf Boy & Lion Pride",
      image: "https://plus.unsplash.com/premium_photo-1664361480677-d19cf6a3af9f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
    title: "The Wolf Boy & Lion Pride",
    image: "https://images.unsplash.com/photo-1504006833117-8886a355efbf?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
    title: "The Wolf Boy & Lion Pride",
    image: "https://images.unsplash.com/photo-1501707305551-9b2adda5e527?q=80&w=2053&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
  ];

  return (
    <div className="relative w-full mb-4">
      <div className="absolute inset-0">
        <img 
          src={stories[currentSlide].image} 
          alt={stories[currentSlide].title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-black text-2xl font-semibold">{stories[currentSlide].title}</h3>
        </div>
      </div>
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-1">
        {stories.map((_, idx) => (
          <div 
            key={idx}
            className={`w-1.5 h-1.5 rounded-full ${idx === currentSlide ? 'bg-purple-600' : 'bg-gray-300'}`}
          />
        ))}
      </div>
    </div>
  );
};


const HomePage = () => {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-white">
      <div className="pb-20">
        {/* Header */}
        <div className="px-4 pt-4">
          <h1 className="text-xl font-semibold mb-4">StoryFlix</h1>

          {/* Story Carousel */}
          <div className="h-48 mb-4">
            <StoryCarousel />
          </div>

        {/* Search Bar */}
        <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search Stories..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-100 text-sm"
            />
          </div>

          {/* AI Story Creation Cards */}
          <div className="space-y-2 mb-6">
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="flex items-center">
                <div>
                  <h3 className="text-base font-semibold mb-1">Make Your Own Stories with A.I</h3>
                  <p className="text-xs text-gray-600">Create unique stories using AI assistance</p>
                </div>
                <img src="/api/placeholder/80/80" alt="AI Writing" className="w-20 h-20 ml-auto" />
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl">
              <div className="flex items-center">
                <div>
                  <h3 className="text-base font-semibold mb-1">Creator's Corner</h3>
                  <p className="text-xs text-gray-600">Write and publish your original stories</p>
                </div>
                <img src="/api/placeholder/80/80" alt="Create Stories" className="w-20 h-20 ml-auto" />
              </div>
            </div>
          </div>


        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="flex justify-around py-2">
          <Link href="/" className={`flex flex-col items-center ${pathname === '/' ? 'text-purple-600' : 'text-gray-400'}`}>
            <Home size={22} />
            <span className="text-[10px] mt-0.5">Home</span>
          </Link>
          <Link href="/messages" className={`flex flex-col items-center ${pathname === '/messages' ? 'text-purple-600' : 'text-gray-400'}`}>
            <MessageCircle size={22} />
            <span className="text-[10px] mt-0.5">Messages</span>
          </Link>
          <Link href="/create" className="flex flex-col items-center">
            <div className="bg-purple-600 rounded-full p-3">
              <PlusCircle size={22} className="text-white" />
            </div>
          </Link>
          <Link href="/library" className={`flex flex-col items-center ${pathname === '/library' ? 'text-purple-600' : 'text-gray-400'}`}>
            <Layout size={22} />
            <span className="text-[10px] mt-0.5">Library</span>
          </Link>
          <Link href="/profile" className={`flex flex-col items-center ${pathname === '/profile' ? 'text-purple-600' : 'text-gray-400'}`}>
            <User size={22} />
            <span className="text-[10px] mt-0.5">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default HomePage;
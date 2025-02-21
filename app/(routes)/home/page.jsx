"use client"
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Search, Loader2, GamepadIcon, BookOpen, Gamepad2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import StoryCardsSlider from './_components/StoryCardsSlider';
import Image from 'next/image';

const BASE_IMAGE_URL = 'https://wowfy.in/testusr/images/';

const ImageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [carouselStories, setCarouselStories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const router = useRouter();
  const customLoader = ({ src }) => `${src}?w=500&q=75`;


  const fetchStories = async () => {
    let sessionId = null;
    const token = localStorage.getItem('token');

    if (!token) {
      sessionId = sessionStorage.getItem('session_id');
      if (!sessionId) {
        sessionId = 'sess_' + Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('session_id', sessionId);
      }
    }

    try {
      setIsLoading(true);

      const response = await fetch(`/api/fetchAllData?session_id=${sessionId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stories');
      }
      
      const data = await response.json();
      setCarouselStories(data.carouselStories || []);
      setCategories(data.categories?.filter(category => category.data?.length > 0) || []);
    } catch (err) {
      console.error('Error fetching stories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  useEffect(() => {
    if (carouselStories.length === 0) return;

    let interval;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % carouselStories.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, carouselStories.length]);

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (Math.abs(distance) < minSwipeDistance) return;

    if (distance > 0) {
      // Swiped left
      setCurrentIndex((prev) => (prev + 1) % carouselStories.length);
    } else {
      // Swiped right
      setCurrentIndex((prev) => (prev - 1 + carouselStories.length) % carouselStories.length);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  const StoryCard = ({ story, size = "large" }) => {
    const handleClick = () => {
      // router.push(
      //   story.story_type === 'chat'
      //     ? `/stories/${story.story_id}/chat-story`
      //     : `/stories/${story.story_id}/normal-story`
      // );
      router.push(`/stories/${story.story_id}/story-overview`);
    };

    const sizeClasses = {
      small: "w-24 md:w-40",
      large: "w-32 md:w-56"
    };

    const imageClasses = {
      small: "h-20 md:h-32",
      large: "h-28 md:h-44"
    };

    const iconSizeClasses = {
      small: "w-4 h-4 md:w-5 md:h-5",
      large: "w-5 h-5 md:w-6 md:h-6"
    };

    return (
      <div 
        className={`flex-none ${sizeClasses[size]} cursor-pointer transition-transform hover:scale-105 relative`}
        onClick={handleClick}
      >
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm z-10 px-2 py-1 rounded-full">
          <p className="text-xs text-purple-400 font-medium">
            {story.story_type === 'game' ? (
              <Gamepad2
                className={`${iconSizeClasses[size]} text-white/90 stroke-[2.5] drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]`} 
              />
            ) : (
              <BookOpen 
                className={`${iconSizeClasses[size]} text-white/90 stroke-[2.5] drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]`} 
              />
            )}
          </p>
        </div>
        {/* <div className="absolute top-3 right-3 z-10 drop-shadow-lg">
          {story.story_type === 'game' ? (
            <Gamepad2
              className={`${iconSizeClasses[size]} text-white/90 stroke-[2.5] drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]`} 
            />
          ) : (
            <BookOpen 
              className={`${iconSizeClasses[size]} text-white/90 stroke-[2.5] drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]`} 
            />
          )}
        </div> */}
        <img 
          src={`${BASE_IMAGE_URL}${story.cover_img}`}
          alt={story.title}
          className={`w-full ${imageClasses[size]} object-cover rounded-2xl border-[6px] border-white mb-2`}
        />
        {/* <Image
         loader={customLoader}
          src={`${BASE_IMAGE_URL}${story.cover_img}?t=${new Date().getTime()}`}
          // src={`${BASE_IMAGE_URL}${story.cover_img}`}
          alt={story.title}
          width={500}  // Adjust based on your largest expected image width
          height={800} // Adjust based on your largest expected image height
          className={`w-full ${imageClasses[size]} object-cover rounded-2xl border-[6px] border-white mb-2`}
          priority={true}
          sizes={size === "small" ? "160px" : "224px"}
        /> */}
        <p className="text-xs md:text-sm text-center text-white font-medium line-clamp-2">
          {story.title}
        </p>
    </div>
    );
  };

  return (
    <div className="min-h-screen bg-black pb-16">
      <div className="w-full max-w-[1920px] mx-auto">
          {/* Main Carousel */}
          <div className="relative mx-auto h-[300px] md:h-[95vh] overflow-hidden "
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}>
            {carouselStories.length > 0 && (
                <div 
                  className="relative h-full w-full"
                  onClick={() =>
                      // router.push(
                      //     carouselStories[currentIndex]?.story_type === 'chat'
                      //     ? `/stories/${carouselStories[currentIndex]?.story_id}/chat-story`
                      //     : `/stories/${carouselStories[currentIndex]?.story_id}/normal-story`
                      // )
                      router.push(`/stories/${carouselStories[currentIndex]?.story_id}/story-overview`)
                    }
                  >
                  <img
                      src={`${BASE_IMAGE_URL}${carouselStories[currentIndex].cover_img}`}
                      alt={carouselStories[currentIndex].title}
                      className="w-full h-full object-cover"
                  />

                    {/* <Image 
                      loader={customLoader}
                      // src={`${BASE_IMAGE_URL}${carouselStories[currentIndex].cover_img}`}
                      src={`${BASE_IMAGE_URL}${carouselStories[currentIndex].cover_img}?t=${new Date().getTime()}`}
                      alt={carouselStories[currentIndex].title}
                      width={500} 
                      height={800}
                      className="w-full h-full object-cover"
                      priority={true}
                      // sizes={size === "small" ? "160px" : "224px"}
                    /> */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
                      <h2 className="text-white text-2xl md:text-5xl font-bold mb-2">
                      {carouselStories[currentIndex].title}
                      </h2>
                      {/* <p className="text-white/90 text-sm md:text-xl max-w-3xl">
                      {carouselStories[currentIndex].synopsis}
                      </p> */}
                  </div>
                  
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                      {carouselStories.map((_, index) => (
                      <button
                          key={index}
                          onClick={() => {
                          setCurrentIndex(index);
                          setIsAutoPlaying(false);
                          }}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          currentIndex === index ? 'bg-white scale-125' : 'bg-white/50'
                          }`}
                      />
                      ))}
                  </div>
                </div>
            )}
          </div>
            {/* Add this line */}
          <div className="border-b border-white/30 " />

        {/* AI Story Creation Cards */}
        {/* <div className='p-7 pt-0 sm:p-0'>
            <div className="space-y-2 my-8">
                <StoryCardsSlider />
            </div>
        </div> */}

        {/* Categories */}
        {/* <div className="space-y-8">
          {categories.map((category) => (
            <div key={category.id} className="mb-8">
              <h2 className="text-base md:text-2xl text-white font-medium mb-4 px-4">
                {category.title}
              </h2>
              <div className="flex overflow-x-auto scrollbar-hide px-4 space-x-4 pb-4">
                {category.data.map((story, idx) => (
                  <StoryCard 
                    key={idx} 
                    story={story} 
                    // size={category.id === "trending" || category.id === "latest" ? "large" : "small"}
                  />
                ))}
              </div>
            </div>
          ))}
        </div> */}

        {/* Categories */}
        <div className="space-y-8 md:px-8 mt-4">
          {categories.map((category) => (
            <div key={category.id} className="mb-8">
              <div className="flex items-center justify-between mb-4 px-4">
                <h2 className="text-base md:text-2xl text-white font-medium">
                  {category.title}
                </h2>
                
                {category.id !== 'continue-reading' && (
                  <button
                    onClick={() => {
                      // If category.id is 'trending' or 'latest', use that in the URL
                      // Otherwise, use the numeric ID
                      const path = typeof category.id === 'string' && 
                        (category.id === 'trending' || category.id === 'latest')
                        ? `/view-all/${category.id}`
                        : `/view-all/${Number(category.id)}`;
                      router.push(path);
                    }}
                    className="text-white/70 hover:text-white text-sm md:text-base 
                      font-medium transition-colors duration-200 flex items-center gap-1"
                  >
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex overflow-x-auto scrollbar-hide px-4 space-x-4 pb-4">
                {category.data.map((story, idx) => (
                  <StoryCard 
                    key={idx} 
                    story={story} 
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;
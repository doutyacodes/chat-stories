"use client";
import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Gamepad2, BookOpen } from 'lucide-react';
import StoryCardSkeleton from './StoryCardSkeleton';

const BASE_IMAGE_URL = 'https://wowfy.in/testusr/images/';

const LazyCategoryRow = ({ category, onOpenStory, router }) => {
  const [stories, setStories] = useState(category.data || []);
  const [isLoading, setIsLoading] = useState(!category.data);
  const [isVisible, setIsVisible] = useState(!!category.data);
  const containerRef = useRef(null);

  useEffect(() => {
    if (category.data) {
      setStories(category.data);
      setIsLoading(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [category]);

  useEffect(() => {
    if (!isVisible || category.data) return;

    let isMounted = true;
    const fetchCategoryStories = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/sections?section=category&categoryId=${category.id}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setStories(data.data || []);
          }
        }
      } catch (err) {
        console.error(`Error fetching category ${category.id}:`, err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchCategoryStories();

    return () => { isMounted = false; };
  }, [isVisible, category]);

  if (!isVisible && !category.data) {
    return (
      <div ref={containerRef} className="min-h-[160px] mb-8">
        <StoryCardSkeleton count={5} />
      </div>
    );
  }

  if (isLoading) {
    return <StoryCardSkeleton count={5} />;
  }

  if (stories.length === 0) return null;

  const isContinueReading = String(category.id).startsWith('continue-reading');

  const handleViewAll = () => {
    const idStr = String(category.id).toLowerCase();
    let targetPath = '';

    if (idStr.includes('trending')) {
      targetPath = '/view-all/trending';
    } else if (idStr.includes('latest')) {
      targetPath = '/view-all/latest';
    } else {
      targetPath = `/view-all/${category.id}`;
    }

    router.push(targetPath);
  };

  return (
    <div ref={containerRef} className="mb-8">
      <div className="flex items-center justify-between mb-4 px-4">
        <h2 className="text-base md:text-2xl text-white font-medium">
          {category.title}
        </h2>
        
        {!isContinueReading && (
          <button
            onClick={handleViewAll}
            className="text-white/70 hover:text-white text-sm md:text-base 
              font-medium transition-colors duration-200 flex items-center gap-1"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="flex overflow-x-auto scrollbar-hide px-4 space-x-4 pb-4">
        {stories.map((story, idx) => (
          <div 
            key={idx}
            className="flex-none w-32 md:w-56 cursor-pointer transition-transform hover:scale-105 relative"
            onClick={() => onOpenStory(story)}
          >
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm z-10 px-2 py-1 rounded-full">
              <p className="text-xs text-purple-400 font-medium">
                {story.story_type === 'game' ? (
                  <Gamepad2 className="w-5 h-5 md:w-6 md:h-6 text-white/90 stroke-[2.5] drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]" />
                ) : (
                  <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-white/90 stroke-[2.5] drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]" />
                )}
              </p>
            </div>
            <img 
              src={`${BASE_IMAGE_URL}${story.cover_img}`}
              alt={story.title}
              loading="lazy"
              decoding="async"
              className="w-full h-28 md:h-44 object-cover rounded-2xl border-[6px] border-white mb-2 bg-neutral-900"
            />
            <p className="text-xs md:text-sm text-center text-white font-medium line-clamp-2">
              {story.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LazyCategoryRow;

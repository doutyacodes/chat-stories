"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Search, ChevronDown, SlidersHorizontal, Gamepad2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import GridSkeleton from '../../components/GridSkeleton';

const SortOptions = {
  LATEST: 'latest',
  MOST_VIEWED: 'most_viewed',
  MOST_LIKED: 'most_liked'
};

const BASE_IMAGE_URL = 'https://wowfy.in/testusr/images/';

const GamesPage = () => {
  const router = useRouter();
  const [stories, setStories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState(SortOptions.LATEST);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const searchRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const observerTarget = useRef(null);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchStories = async (query = searchQuery, pageNum = 1, isAppend = false) => {
    if (isAppend) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const queryParams = new URLSearchParams({
        sort: sortBy,
        category: selectedCategory,
        search: query,
        type: 'game',
        page: pageNum.toString(),
        limit: '20'
      });
      
      const endpoint = `/api/view-all/stories?${queryParams}`;
      const response = await fetch(endpoint);
      const data = await response.json();
      
      const newStories = data.stories || [];
      if (isAppend) {
        setStories(prev => [...prev, ...newStories]);
      } else {
        setStories(newStories);
      }
      setHasMore(data.hasMore ?? newStories.length === 20);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchStories(searchQuery, 1, false);
  }, [selectedCategory, sortBy]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNextPage = useCallback(() => {
    if (!loading && !loadingMore && hasMore) {
      fetchStories(searchQuery, page + 1, true);
    }
  }, [loading, loadingMore, hasMore, page, searchQuery]);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadNextPage();
        }
      },
      { rootMargin: '250px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [loadNextPage]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length > 2) {
      try {
        const response = await fetch(`/api/search-suggestions?q=${query}`);
        const data = await response.json();
        setSearchSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const applySuggestion = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    fetchStories(suggestion, 1, false);
  };

  const handleMouseDown = (e) => {
    const ele = scrollContainerRef.current;
    if (!ele) return;
    const startX = e.pageX - ele.offsetLeft;
    const scrollLeft = ele.scrollLeft;
    
    const handleMouseMove = (e) => {
      const x = e.pageX - ele.offsetLeft;
      const walk = (x - startX);
      ele.scrollLeft = scrollLeft - walk;
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="min-h-screen bg-black pb-24 md:pt-8">
      <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8">

        {/* Header Title Section */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-1">Games</h1>
          <p className="text-sm md:text-base text-neutral-400">Discover interactive stories, choices, and text adventures</p>
        </div>

        {/* Filter Toolbar: Categories & Sort */}
        <div className={`flex flex-col md:flex-row justify-between items-center gap-4 pt-2 ${!showSearch ? 'mb-8' : ''}`}>
          {/* Category Chips Scroll Container */}
          <div className="relative w-full overflow-hidden">
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-2 w-full no-scrollbar touch-pan-x cursor-grab active:cursor-grabbing py-1"
              onMouseDown={handleMouseDown}
            >
              <div className="flex gap-2 px-1">
                <button
                  onClick={() => {
                    setShowSearch(!showSearch);
                    setSearchQuery('');
                    setSearchSuggestions([]);
                    fetchStories('', 1, false);
                  }}
                  className={`whitespace-nowrap px-4 py-2 text-xs md:text-sm rounded-full font-medium transition-all flex items-center gap-1.5 flex-shrink-0
                    ${showSearch ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40' : 'bg-neutral-900 text-white/80 border border-neutral-800 hover:border-purple-500/50'}`}
                >
                  <Search className="w-3.5 h-3.5" />
                  Search
                </button>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`whitespace-nowrap px-4 py-2 text-xs md:text-sm rounded-full font-medium transition-all flex-shrink-0
                    ${selectedCategory === 'all' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40' : 'bg-neutral-900 text-white/80 border border-neutral-800 hover:border-purple-500/50'}`}
                >
                  All Games
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`whitespace-nowrap px-4 py-2 text-xs md:text-sm rounded-full font-medium transition-all flex-shrink-0
                      ${selectedCategory === category.id ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40' : 'bg-neutral-900 text-white/80 border border-neutral-800 hover:border-purple-500/50'}`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Sort Dropdown */}
          <div className="relative inline-flex items-center self-end md:self-auto flex-shrink-0">
            <div className="absolute left-3.5 pointer-events-none text-purple-400 z-10">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-neutral-900 text-white text-xs md:text-sm font-semibold pl-9 pr-9 py-2 rounded-full border border-neutral-800 hover:border-purple-500/50 focus:border-purple-500 focus:outline-none cursor-pointer transition-all duration-300 shadow-md"
            >
              <option value={SortOptions.LATEST} className="bg-neutral-900 text-white">Latest</option>
              <option value={SortOptions.MOST_VIEWED} className="bg-neutral-900 text-white">Most Played</option>
              <option value={SortOptions.MOST_LIKED} className="bg-neutral-900 text-white">Most Liked</option>
            </select>
            <div className="pointer-events-none absolute right-3 text-neutral-400 z-10">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Search Input Bar */}
        {showSearch && (
          <div className="max-w-2xl mx-auto mb-8 py-2" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search Games by title or synopsis..."
                className="w-full bg-neutral-900/90 text-white border border-neutral-800 focus:border-purple-500 rounded-xl py-2.5 pl-10 pr-4 outline-none transition-all placeholder:text-neutral-500 text-sm"
              />
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute w-full bg-neutral-900 border border-neutral-800 mt-2 rounded-xl shadow-xl z-50 overflow-hidden">
                  {searchSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-2.5 hover:bg-purple-950/50 cursor-pointer text-sm text-neutral-200"
                      onClick={() => applySuggestion(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Initial Loading Skeleton */}
        {loading && <GridSkeleton count={10} />}

        {/* Games Grid */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {stories.map((story, idx) => (
              <GameCard key={`${story.story_id}-${idx}`} storyData={story} router={router} />
            ))}
          </div>
        )}

        {/* Infinite Scroll Bottom Sentinel */}
        <div ref={observerTarget} className="h-10 w-full flex justify-center items-center mt-6">
          {loadingMore && (
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent" />
          )}
        </div>

        {/* Empty State */}
        {!loading && stories.length === 0 && (
          <div className="text-center py-20 bg-neutral-950/50 rounded-2xl border border-neutral-900 my-8">
            <p className="text-white text-lg font-medium">No games found.</p>
            <p className="text-neutral-500 text-sm mt-1">Try selecting a different category or adjusting your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const GameCard = ({ storyData, router }) => {
  const handleClick = () => {
    router.push(`/stories/${storyData.story_id}/story-overview`);
  };

  return (
    <div 
      className="flex-none cursor-pointer transition-all hover:scale-105 group"
      onClick={handleClick}
    >
      <div className="relative">
        <img 
          src={`${BASE_IMAGE_URL}${storyData.cover_img}`}
          alt={storyData.title}
          loading="lazy"
          decoding="async"
          className="w-full aspect-[3/2.5] object-cover rounded-2xl border-[6px] border-neutral-900 group-hover:border-purple-500 transition-colors bg-neutral-900"
        />
      </div>
      <p className="text-xs md:text-sm text-center text-white/90 font-medium line-clamp-2 group-hover:text-purple-400 transition-colors">
        {storyData.title}
      </p>
    </div>
  );
};

export default GamesPage;
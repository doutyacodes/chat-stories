"use client"
import React, { useEffect, useState, useRef } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

const SortOptions = {
  LATEST: 'latest',
  MOST_VIEWED: 'most_viewed',
  MOST_LIKED: 'most_liked'
};

const BASE_IMAGE_URL = 'https://wowfy.in/testusr/images/';

const ViewAllPage = () => {
  const router = useRouter();
  const [stories, setStories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState(SortOptions.LATEST);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const searchRef = useRef(null);
  const scrollContainerRef = useRef(null);

  console.log("searchSuggestions", searchSuggestions)
  console.log("searchQuery", searchQuery)

  useEffect(() => {
    fetchCategories();
    fetchStories(searchQuery);

    // Click outside handler for search suggestions
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedCategory, sortBy]);

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

  const fetchStories = async (currentQuery) => {
    setLoading(true);
    console.log("Before sending the pi", searchQuery)
    try {
      const queryParams = new URLSearchParams({
        sort: sortBy,
        category: selectedCategory,
        search: currentQuery,
        type: 'game'
      });
      
      const endpoint = `/api/view-all/stories?${queryParams}`;
      const response = await fetch(endpoint);
      const data = await response.json();
      setStories(data.stories);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length > 2) {
      try {
        const response = await fetch(`/api/search-suggestions?q=${query}`);
        const data = await response.json();
        setSearchSuggestions(data.suggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
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

  const applySuggestion = (suggestion) => {
    console.log("suggetion from apply", suggestion)
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    fetchStories(suggestion);
  };

  return (
    <div className="min-h-screen bg-black pb-16 md:pt-28">
      <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8">
        {/* Categories and Sort Section */}
        <div className={`flex flex-col md:flex-row justify-between items-center gap-4 pt-4 ${!showSearch ? 'mb-8' : ''}`}>          {/* Categories */}
          <div className="relative w-full">
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-2 w-full no-scrollbar touch-pan-x cursor-grab active:cursor-grabbing"
              style={{
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
              onMouseDown={handleMouseDown}
            >
              <div className="flex gap-2 px-1">
                <button
                  onClick={() => {
                    setShowSearch(!showSearch);
                    setSearchQuery('');
                    setSearchSuggestions([])
                  }}
                  className={`whitespace-nowrap px-4 py-2 text-sm md:px-6 md:py-3 md:text-base rounded-full font-medium transition-all flex-shrink-0
                    ${showSearch ? 'bg-white text-gray-900' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                >
                  Search
                </button>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`whitespace-nowrap px-4 py-2 text-sm md:px-6 md:py-3 md:text-base rounded-full font-medium transition-all flex-shrink-0
                    ${selectedCategory === 'all' ? 'bg-white text-gray-900' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                >
                  All Stories
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`whitespace-nowrap px-4 py-2 text-sm md:px-6 md:py-3 md:text-base rounded-full font-medium transition-all flex-shrink-0
                      ${selectedCategory === category.id ? 'bg-white text-gray-900' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Sort Options */}
          <div className="relative min-w-[150px] self-end">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-gray-800 text-white w-full px-4 py-2 text-sm md:px-6 md:py-3 md:text-base rounded-full focus:outline-none pr-10"
            >
              <option value={SortOptions.LATEST}>Latest</option>
              <option value={SortOptions.MOST_VIEWED}>Most Viewed</option>
              <option value={SortOptions.MOST_LIKED}>Most Liked</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4">
              <svg className="h-4 w-4 fill-current text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Search Bar - Only shown when search is active */}
        {showSearch && (
          <div className="max-w-2xl mx-auto mb-8 py-4" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search Stories..."
                className="w-full bg-transparent text-white/90 border-b border-white/30 focus:border-white/70 
                  py-2 pl-8 pr-4 outline-none transition-colors placeholder:text-white/50 
                  text-base font-light"
              />
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute w-full bg-gray-900 mt-2 rounded-lg shadow-lg z-50">
                  {searchSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-gray-800 cursor-pointer text-white/90"
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

        {/* Stories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {stories.map((story) => (
            <StoryCard key={story.story_id} storyData={story} />
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white" />
          </div>
        )}

        {/* No Results */}
        {!loading && stories.length === 0 && (
          <div className="text-center py-20">
            <p className="text-white text-lg">No stories found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StoryCard = ({ storyData }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/stories/${storyData.story_id}/story-overview`);
  };

  return (
    <div 
      className="flex-none cursor-pointer transition-transform hover:scale-105"
      onClick={handleClick}
    >
      <img 
        src={`${BASE_IMAGE_URL}${storyData.cover_img}`}
        alt={storyData.title}
        className="w-full aspect-[3/2.5] object-cover rounded-2xl border-[6px] border-white mb-2"
      />
      <p className="text-xs md:text-sm text-center text-white font-medium line-clamp-2">
        {storyData.title}
      </p>
    </div>
  );
};

export default ViewAllPage;
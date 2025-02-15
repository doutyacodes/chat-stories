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

/* original */
//   return (
//     <div className="min-h-screen bg-black pb-16 md:pt-28">
//       <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8">
//         {/* Categories and Sort Section */}
//         <div className={`flex flex-col md:flex-row justify-between items-center gap-4 pt-4 ${!showSearch ? 'mb-8' : ''}`}>          {/* Categories */}
//           <div className="relative w-full">
//             <div
//               ref={scrollContainerRef}
//               className="flex overflow-x-auto gap-2 w-full no-scrollbar touch-pan-x cursor-grab active:cursor-grabbing"
//               style={{
//                 WebkitOverflowScrolling: 'touch',
//                 scrollbarWidth: 'none',
//                 msOverflowStyle: 'none'
//               }}
//               onMouseDown={handleMouseDown}
//             >
//               <div className="flex gap-2 px-1">
//                 <button
//                   onClick={() => {
//                     setShowSearch(!showSearch);
//                     setSearchQuery('');
//                     setSearchSuggestions([])
//                   }}
//                   className={`whitespace-nowrap px-4 py-2 text-sm md:px-6 md:py-3 md:text-base rounded-full font-medium transition-all flex-shrink-0
//                     ${showSearch ? 'bg-white text-gray-900' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
//                 >
//                   Search
//                 </button>
//                 <button
//                   onClick={() => setSelectedCategory('all')}
//                   className={`whitespace-nowrap px-4 py-2 text-sm md:px-6 md:py-3 md:text-base rounded-full font-medium transition-all flex-shrink-0
//                     ${selectedCategory === 'all' ? 'bg-white text-gray-900' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
//                 >
//                   All Stories
//                 </button>
//                 {categories.map((category) => (
//                   <button
//                     key={category.id}
//                     onClick={() => setSelectedCategory(category.id)}
//                     className={`whitespace-nowrap px-4 py-2 text-sm md:px-6 md:py-3 md:text-base rounded-full font-medium transition-all flex-shrink-0
//                       ${selectedCategory === category.id ? 'bg-white text-gray-900' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
//                   >
//                     {category.name}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>
          
//           {/* Sort Options */}
//           <div className="relative min-w-[150px] self-end">
//             <select
//               value={sortBy}
//               onChange={(e) => setSortBy(e.target.value)}
//               className="appearance-none bg-gray-800 text-white w-full px-4 py-2 text-sm md:px-6 md:py-3 md:text-base rounded-full focus:outline-none pr-10"
//             >
//               <option value={SortOptions.LATEST}>Latest</option>
//               <option value={SortOptions.MOST_VIEWED}>Most Viewed</option>
//               <option value={SortOptions.MOST_LIKED}>Most Liked</option>
//             </select>
//             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4">
//               <svg className="h-4 w-4 fill-current text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
//                 <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
//               </svg>
//             </div>
//           </div>
//         </div>

//         {/* Search Bar - Only shown when search is active */}
//         {showSearch && (
//           <div className="max-w-2xl mx-auto mb-8 py-4" ref={searchRef}>
//             <div className="relative">
//               <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
//               <input
//                 type="text"
//                 value={searchQuery}
//                 onChange={(e) => handleSearch(e.target.value)}
//                 placeholder="Search Stories..."
//                 className="w-full bg-transparent text-white/90 border-b border-white/30 focus:border-white/70 
//                   py-2 pl-8 pr-4 outline-none transition-colors placeholder:text-white/50 
//                   text-base font-light"
//               />
//               {showSuggestions && searchSuggestions.length > 0 && (
//                 <div className="absolute w-full bg-gray-900 mt-2 rounded-lg shadow-lg z-50">
//                   {searchSuggestions.map((suggestion, index) => (
//                     <div
//                       key={index}
//                       className="px-4 py-2 hover:bg-gray-800 cursor-pointer text-white/90"
//                       onClick={() => applySuggestion(suggestion)}
//                     >
//                       {suggestion}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Stories Grid */}
//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
//           {stories.map((story) => (
//             <StoryCard key={story.story_id} storyData={story} />
//           ))}
//         </div>

//         {/* Loading State */}
//         {loading && (
//           <div className="flex justify-center items-center py-20">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white" />
//           </div>
//         )}

//         {/* No Results */}
//         {!loading && stories.length === 0 && (
//           <div className="text-center py-20">
//             <p className="text-white text-lg">No stories found.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

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

/* Professional */
// return (
//   <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pb-16 md:pt-28">
//     {/* Subtle animated background overlay */}
//     <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent animate-pulse-slow pointer-events-none" />
    
//     <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 relative">
//       {/* Categories and Sort Section */}
//       <div className={`flex flex-col md:flex-row justify-between items-center gap-4 pt-4 ${!showSearch ? 'mb-8' : ''}`}>
//         {/* Categories */}
//         <div className="relative w-full">
//           <div
//             ref={scrollContainerRef}
//             className="flex overflow-x-auto gap-2 w-full no-scrollbar touch-pan-x cursor-grab active:cursor-grabbing"
//             style={{
//               WebkitOverflowScrolling: 'touch',
//               scrollbarWidth: 'none',
//               msOverflowStyle: 'none'
//             }}
//             onMouseDown={handleMouseDown}
//           >
//             <div className="flex gap-2 px-1">
//               <button
//                 onClick={() => {
//                   setShowSearch(!showSearch);
//                   setSearchQuery('');
//                   setSearchSuggestions([])
//                 }}
//                 className={`whitespace-nowrap px-4 py-2 text-sm md:px-6 md:py-3 md:text-base rounded-full font-medium transition-all flex-shrink-0
//                   ${showSearch 
//                     ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/40' 
//                     : 'bg-gray-800/80 text-white hover:bg-gray-700 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105'}`}
//               >
//                 <span className="flex items-center gap-2">
//                   <Search className="w-4 h-4" />
//                   Search
//                 </span>
//               </button>
//               <button
//                 onClick={() => setSelectedCategory('all')}
//                 className={`whitespace-nowrap px-4 py-2 text-sm md:px-6 md:py-3 md:text-base rounded-full font-medium transition-all flex-shrink-0
//                   ${selectedCategory === 'all' 
//                     ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/40' 
//                     : 'bg-gray-800/80 text-white hover:bg-gray-700 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105'}`}
//               >
//                 All Games
//               </button>
//               {categories.map((category) => (
//                 <button
//                   key={category.id}
//                   onClick={() => setSelectedCategory(category.id)}
//                   className={`whitespace-nowrap px-4 py-2 text-sm md:px-6 md:py-3 md:text-base rounded-full font-medium transition-all flex-shrink-0
//                     ${selectedCategory === category.id 
//                       ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/40' 
//                       : 'bg-gray-800/80 text-white hover:bg-gray-700 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105'}`}
//                 >
//                   {category.name}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
        
//         {/* Sort Options */}
//         <div className="relative min-w-[150px] self-end">
//           <select
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value)}
//             className="appearance-none bg-gray-800/80 text-white w-full px-4 py-2 text-sm md:px-6 md:py-3 md:text-base rounded-full 
//               focus:outline-none focus:ring-2 focus:ring-blue-500/50 pr-10 hover:shadow-lg hover:shadow-blue-500/20 transition-all"
//           >
//             <option value={SortOptions.LATEST}>Latest</option>
//             <option value={SortOptions.MOST_VIEWED}>Most Played</option>
//             <option value={SortOptions.MOST_LIKED}>Most Liked</option>
//           </select>
//           <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4">
//             <svg className="h-4 w-4 fill-current text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
//               <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
//             </svg>
//           </div>
//         </div>
//       </div>

//       {/* Search Bar */}
//       {showSearch && (
//         <div className="max-w-2xl mx-auto mb-8 py-4" ref={searchRef}>
//           <div className="relative">
//             <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
//             <input
//               type="text"
//               value={searchQuery}
//               onChange={(e) => handleSearch(e.target.value)}
//               placeholder="Search Games..."
//               className="w-full bg-gray-800/30 text-white/90 border-b-2 border-blue-500/30 focus:border-blue-500/70 
//                 py-3 pl-8 pr-4 outline-none transition-all placeholder:text-white/50 
//                 text-base font-light rounded-t-lg focus:bg-gray-800/50"
//             />
//             {showSuggestions && searchSuggestions.length > 0 && (
//               <div className="absolute w-full bg-gray-900/95 mt-0 rounded-b-lg shadow-lg shadow-blue-500/20 z-50 backdrop-blur-sm 
//                 border-x-2 border-b-2 border-blue-500/30">
//                 {searchSuggestions.map((suggestion, index) => (
//                   <div
//                     key={index}
//                     className="px-4 py-2 hover:bg-blue-500/10 cursor-pointer text-white/90 transition-colors"
//                     onClick={() => applySuggestion(suggestion)}
//                   >
//                     {suggestion}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Games Grid */}
//       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 relative">
//         {stories.map((story) => (
//           <GameCard key={story.story_id} gameData={story} />
//         ))}
//       </div>

//       {/* Loading State */}
//       {loading && (
//         <div className="flex justify-center items-center py-20">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 shadow-lg shadow-blue-500/50" />
//         </div>
//       )}

//       {/* No Results */}
//       {!loading && stories.length === 0 && (
//         <div className="text-center py-20">
//           <p className="text-white text-lg">No games found</p>
//           <p className="text-blue-400 text-sm mt-2">Try adjusting your search or filters</p>
//         </div>
//       )}
//     </div>
//   </div>
// );
// };

// const GameCard = ({ gameData }) => {
//   const router = useRouter();

//   const handleClick = () => {
//     router.push(`/stories/${gameData.story_id}/story-overview`);
//   };

//   return (
//     <div 
//       className="group flex-none cursor-pointer transition-all duration-300 hover:scale-105 relative"
//       onClick={handleClick}
//     >
//       <div className="relative overflow-hidden rounded-2xl">
//         <img 
//           src={`${BASE_IMAGE_URL}${gameData.cover_img}`}
//           alt={gameData.title}
//           className="w-full aspect-[3/2.5] object-cover rounded-2xl border-4 border-gray-800/80 group-hover:border-blue-500/50 
//             transition-all duration-300 transform group-hover:brightness-110"
//         />
//         {/* Animated overlay */}
//         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 
//           transition-all duration-300 rounded-2xl">
//           <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
//             <p className="text-xs text-blue-300">Click to Start</p>
//             <p className="text-xs text-gray-400 mt-1">Multiple Episodes</p>
//           </div>
//         </div>
        
//         {/* Glowing edge effect on hover */}
//         <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
//           bg-gradient-to-r from-blue-500/20 via-transparent to-blue-500/20 pointer-events-none" />
//       </div>
//       <div className="mt-2 text-center relative">
//         <p className="text-xs md:text-sm text-white font-medium line-clamp-2 group-hover:text-blue-400 transition-colors">
//           {gameData.title}
//         </p>
//         {/* Optional: Add game-specific labels */}
//         <div className="flex justify-center gap-1 mt-1">
//           <span className="text-[10px] text-blue-400/70 bg-blue-500/10 px-2 py-0.5 rounded-full">
//             Interactive
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// };

/* last */

return (
  <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 pb-16 md:pt-10">
    <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8">
      {/* Title Section */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white/90 mb-2">Games</h1>
        <p className="text-purple-400/80 text-sm md:text-base">Discover interactive stories and adventures</p>
      </div>

      {/* Categories and Sort Section */}
      <div className={`flex flex-col md:flex-row justify-between items-center gap-4 pt-4 ${!showSearch ? 'mb-8' : ''}`}>
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
                  ${showSearch ? 'bg-purple-500 text-white' : 'bg-gray-800/80 text-white hover:bg-gray-700'}`}
              >
                Search
              </button>
              <button
                onClick={() => setSelectedCategory('all')}
                className={`whitespace-nowrap px-4 py-2 text-sm md:px-6 md:py-3 md:text-base rounded-full font-medium transition-all flex-shrink-0
                  ${selectedCategory === 'all' ? 'bg-purple-500 text-white' : 'bg-gray-800/80 text-white hover:bg-gray-700'}`}
              >
                All Games
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`whitespace-nowrap px-4 py-2 text-sm md:px-6 md:py-3 md:text-base rounded-full font-medium transition-all flex-shrink-0
                    ${selectedCategory === category.id ? 'bg-purple-500 text-white' : 'bg-gray-800/80 text-white hover:bg-gray-700'}`}
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
            className="appearance-none bg-gray-800/80 text-white w-full px-4 py-2 text-sm md:px-6 md:py-3 md:text-base rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500/50 pr-10"
          >
            <option value={SortOptions.LATEST}>Latest</option>
            <option value={SortOptions.MOST_VIEWED}>Most Played</option>
            <option value={SortOptions.MOST_LIKED}>Most Liked</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4">
            <svg className="h-4 w-4 fill-current text-purple-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="max-w-2xl mx-auto mb-8 py-4" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search Games..."
              className="w-full bg-transparent text-white/90 border-b border-purple-500/30 focus:border-purple-500/70 
                py-2 pl-8 pr-4 outline-none transition-colors placeholder:text-purple-400/50 
                text-base font-light"
            />
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute w-full bg-gray-900/95 mt-2 rounded-lg shadow-lg shadow-purple-500/10 z-50 border border-purple-500/20">
                {searchSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-purple-500/10 cursor-pointer text-white/90"
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

      {/* Games Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {stories.map((story) => (
          <GameCard key={story.story_id} storyData={story} />
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
        </div>
      )}

      {/* No Results */}
      {!loading && stories.length === 0 && (
        <div className="text-center py-20">
          <p className="text-white/90 text-lg">No games found.</p>
        </div>
      )}
    </div>
  </div>
);
}

const GameCard = ({ storyData }) => {
  const router = useRouter();

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
          className="w-full aspect-[3/2.5] object-cover rounded-2xl border-[6px] border-gray-800/80 mb-2 group-hover:border-purple-500/80 transition-colors"
        />
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
          <p className="text-xs text-purple-400 font-medium">
            {storyData.episodes_count} EP
          </p>
        </div>
      </div>
      <p className="text-xs md:text-sm text-center text-white/90 font-medium line-clamp-2 group-hover:text-purple-400 transition-colors">
        {storyData.title}
      </p>
    </div>
  );
};

export default ViewAllPage;
// "use client"
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { ChevronLeft, ChevronRight, Loader2, BookOpen, Gamepad2, Bookmark, Volume2, VolumeX } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import SignInRequiredDialog from '../../components/SignInRequiredDialog';

// const BASE_IMAGE_URL = 'https://wowfy.in/testusr/images/';
// const BASE_VIDEO_URL = 'https://wowfy.in/testusr/videos/';

// const ImageCarousel = () => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [carouselStories, setCarouselStories] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isMuted, setIsMuted] = useState(true);
//   const [savedStories, setSavedStories] = useState({});
//   const [showAuthDialog, setShowAuthDialog] = useState(false);
//   const [touchStart, setTouchStart] = useState(0);
//   const [touchEnd, setTouchEnd] = useState(0);
//   const router = useRouter();
//   const videoRef = useRef(null);
//   const autoAdvanceTimer = useRef(null);
//   const thumbnailContainerRef = useRef(null);
//   const [isDragging, setIsDragging] = useState(false);
//   const [dragStartX, setDragStartX] = useState(0);
//   const [dragScrollLeft, setDragScrollLeft] = useState(0);

//   const isLoggedIn = () => {
//     return typeof window !== 'undefined' && !!localStorage.getItem('token');
//   };

//   const fetchStories = async () => {
//     let sessionId = null;
//     const token = localStorage.getItem('token');

//     if (!token) {
//       sessionId = sessionStorage.getItem('session_id');
//       if (!sessionId) {
//         sessionId = 'sess_' + Math.random().toString(36).substring(2, 15);
//         sessionStorage.setItem('session_id', sessionId);
//       }
//     }

//     try {
//       setIsLoading(true);
//       const response = await fetch(`/api/fetchAllData?session_id=${sessionId}`, {
//         headers: {
//           'Content-Type': 'application/json',
//           ...(token && { 'Authorization': `Bearer ${token}` })
//         }
//       });

//       if (!response.ok) throw new Error('Failed to fetch stories');
      
//       const data = await response.json();
//       setCarouselStories(data.carouselStories || []);
//       setCategories(data.categories?.filter(category => category.data?.length > 0) || []);
//     } catch (err) {
//       console.error('Error fetching stories:', err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchStories();
//   }, []);

//   // Determine if a trailer is a video based on extension
//   const isTrailerVideo = (trailer) => {
//     if (!trailer) return false;
//     const ext = trailer.split('.').pop().toLowerCase();
//     return ['mp4', 'webm', 'ogg', 'mov'].includes(ext);
//   };

//   // Get the current story
//   const currentStory = carouselStories[currentIndex];

//   // Clear any existing timer
//   const clearAutoAdvance = useCallback(() => {
//     if (autoAdvanceTimer.current) {
//       clearTimeout(autoAdvanceTimer.current);
//       autoAdvanceTimer.current = null;
//     }
//   }, []);

//   // Advance to the next carousel item
//   const advanceCarousel = useCallback(() => {
//     setCurrentIndex(prev => (prev + 1) % carouselStories.length);
//   }, [carouselStories.length]);

//   // Start a timer for image-based carousel items (5 seconds)
//   const startImageTimer = useCallback(() => {
//     clearAutoAdvance();
//     autoAdvanceTimer.current = setTimeout(() => {
//       advanceCarousel();
//     }, 5000);
//   }, [clearAutoAdvance, advanceCarousel]);

//   // Handle video ended — wait 2 seconds then advance
//   const handleVideoEnded = useCallback(() => {
//     clearAutoAdvance();
//     autoAdvanceTimer.current = setTimeout(() => {
//       advanceCarousel();
//     }, 2000);
//   }, [clearAutoAdvance, advanceCarousel]);

//   // When currentIndex changes, setup the appropriate timer
//   useEffect(() => {
//     if (carouselStories.length === 0) return;

//     const story = carouselStories[currentIndex];
//     clearAutoAdvance();

//     if (story?.trailer && isTrailerVideo(story.trailer)) {
//       // Video — timer will be set via onEnded handler
//       // But also set a fallback in case video fails to load
//       autoAdvanceTimer.current = setTimeout(() => {
//         advanceCarousel();
//       }, 30000); // 30s fallback
//     } else {
//       // Image (cover_img or trailer image) — 5 second display
//       startImageTimer();
//     }

//     return () => clearAutoAdvance();
//   }, [currentIndex, carouselStories, clearAutoAdvance, startImageTimer, advanceCarousel]);

//   // Handle manual carousel item selection
//   const goToSlide = (index) => {
//     clearAutoAdvance();
//     setCurrentIndex(index);
//   };

//   // Save/bookmark handler
//   const handleSave = async (e, storyId) => {
//     e.stopPropagation();
    
//     if (!isLoggedIn()) {
//       setShowAuthDialog(true);
//       return;
//     }

//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`/api/${storyId}/save`, {
//         method: 'POST',
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       const data = await response.json();
//       setSavedStories(prev => ({ ...prev, [storyId]: data.isSaved }));
//     } catch (error) {
//       console.error('Error saving story:', error);
//     }
//   };

//   // Touch handlers for main carousel
//   const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
//   const handleTouchMove = (e) => setTouchEnd(e.touches[0].clientX);
//   const handleTouchEnd = () => {
//     if (!touchStart || !touchEnd) return;
//     const distance = touchStart - touchEnd;
//     if (Math.abs(distance) < 50) return;
//     if (distance > 0) {
//       goToSlide((currentIndex + 1) % carouselStories.length);
//     } else {
//       goToSlide((currentIndex - 1 + carouselStories.length) % carouselStories.length);
//     }
//     setTouchStart(0);
//     setTouchEnd(0);
//   };

//   // Thumbnail drag handlers
//   const handleMouseDown = (e) => {
//     setIsDragging(true);
//     setDragStartX(e.pageX - thumbnailContainerRef.current.offsetLeft);
//     setDragScrollLeft(thumbnailContainerRef.current.scrollLeft);
//   };
//   const handleMouseMove = (e) => {
//     if (!isDragging) return;
//     e.preventDefault();
//     const x = e.pageX - thumbnailContainerRef.current.offsetLeft;
//     const walk = (x - dragStartX) * 1.5;
//     thumbnailContainerRef.current.scrollLeft = dragScrollLeft - walk;
//   };
//   const handleMouseUp = () => setIsDragging(false);

//   // Scroll thumbnail into view when index changes
//   useEffect(() => {
//     if (thumbnailContainerRef.current) {
//       const thumb = thumbnailContainerRef.current.children[currentIndex];
//       if (thumb) {
//         thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
//       }
//     }
//   }, [currentIndex]);

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-black flex items-center justify-center">
//         <Loader2 className="w-8 h-8 text-white animate-spin" />
//       </div>
//     );
//   }

//   const StoryCard = ({ story }) => {
//     const handleClick = () => {
//       router.push(`/stories/${story.story_id}/story-overview`);
//     };

//     return (
//       <div 
//         className="flex-none w-32 md:w-56 cursor-pointer transition-transform hover:scale-105 relative"
//         onClick={handleClick}
//       >
//         <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm z-10 px-2 py-1 rounded-full">
//           <p className="text-xs text-purple-400 font-medium">
//             {story.story_type === 'game' ? (
//               <Gamepad2
//                 className="w-5 h-5 md:w-6 md:h-6 text-white/90 stroke-[2.5] drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]" 
//               />
//             ) : (
//               <BookOpen 
//                 className="w-5 h-5 md:w-6 md:h-6 text-white/90 stroke-[2.5] drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]" 
//               />
//             )}
//           </p>
//         </div>
//         <img 
//           src={`${BASE_IMAGE_URL}${story.cover_img}`}
//           alt={story.title}
//           className="w-full h-28 md:h-44 object-cover rounded-2xl border-[6px] border-white mb-2"
//         />
//         <p className="text-xs md:text-sm text-center text-white font-medium line-clamp-2">
//           {story.title}
//         </p>
//       </div>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-black pb-16">
//       <div className="w-full max-w-[1920px] mx-auto">
//         {/* === JioHotstar-style Carousel === */}
//         <div 
//           className="relative mx-auto h-[300px] md:h-[95vh] overflow-hidden"
//           onTouchStart={handleTouchStart}
//           onTouchMove={handleTouchMove}
//           onTouchEnd={handleTouchEnd}
//         >
//           {carouselStories.length > 0 && currentStory && (
//             <>
//               {/* Background Media */}
//               <div 
//                 className="absolute inset-0 cursor-pointer"
//                 onClick={() => router.push(`/stories/${currentStory.story_id}/story-overview`)}
//               >
//                 {currentStory.trailer && isTrailerVideo(currentStory.trailer) ? (
//                   <video
//                     ref={videoRef}
//                     key={`video-${currentIndex}`}
//                     src={`${BASE_VIDEO_URL}${currentStory.trailer}`}
//                     className="w-full h-full object-cover"
//                     autoPlay
//                     muted={isMuted}
//                     playsInline
//                     onEnded={handleVideoEnded}
//                     onError={() => startImageTimer()}
//                   />
//                 ) : currentStory.trailer ? (
//                   <img
//                     src={`${BASE_IMAGE_URL}${currentStory.trailer}`}
//                     alt={currentStory.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <img
//                     src={`${BASE_IMAGE_URL}${currentStory.cover_img}`}
//                     alt={currentStory.title}
//                     className="w-full h-full object-cover"
//                   />
//                 )}
//               </div>

//               {/* Gradient overlays */}
//               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none" />
//               <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent pointer-events-none" />

//               {/* Mute/Unmute toggle (only for video) */}
//               {currentStory.trailer && isTrailerVideo(currentStory.trailer) && (
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setIsMuted(!isMuted);
//                   }}
//                   className="absolute top-4 right-4 md:top-6 md:right-6 z-20 bg-black/50 backdrop-blur-sm 
//                     rounded-full p-2 md:p-2.5 text-white/80 hover:text-white hover:bg-black/70 
//                     transition-all duration-200"
//                 >
//                   {isMuted ? <VolumeX className="w-4 h-4 md:w-5 md:h-5" /> : <Volume2 className="w-4 h-4 md:w-5 md:h-5" />}
//                 </button>
//               )}

//               {/* Bottom-left content overlay */}
//               <div className="absolute bottom-16 md:bottom-10 left-0 right-0 md:right-auto p-4 md:p-10 md:max-w-[55%] z-10">
//                 {/* Title */}
//                 <h2 className="text-white text-3xl md:text-6xl font-black mb-3 md:mb-5 leading-tight tracking-tight drop-shadow-2xl">
//                   {currentStory.title}
//                 </h2>

//                 {/* Metadata line */}
//                 <div className="flex items-center gap-2.5 md:gap-3 text-white/70 text-sm md:text-base font-semibold mb-4 md:mb-5">
//                   <span className="border border-white/40 px-2 py-0.5 rounded text-xs md:text-sm font-semibold">
//                     13+
//                   </span>
//                   <span className="text-white/30">·</span>
//                   <span>{currentStory.episode_count || 0} Episodes</span>
//                   <span className="text-white/30">·</span>
//                   <span>English</span>
//                 </div>

//                 {/* Synopsis — max 3 lines */}
//                 {currentStory.synopsis && (
//                   <p className="text-white/80 text-sm md:text-base leading-relaxed line-clamp-3 mb-4 md:mb-5 max-w-lg md:max-w-xl">
//                     {currentStory.synopsis}
//                   </p>
//                 )}

//                 {currentStory.genres && currentStory.genres.length > 0 && (
//                   <div className="flex flex-wrap items-center gap-x-2 text-white/90 text-sm md:text-base font-bold mb-4 md:mb-6">
//                     {currentStory.genres.map((genre, idx) => (
//                       <React.Fragment key={idx}>
//                         {idx > 0 && <span className="text-white/30 font-normal">|</span>}
//                         <span>{genre}</span>
//                       </React.Fragment>
//                     ))}
//                   </div>
//                 )}
//                 {/* Action buttons */}
//                 <div className="flex items-center gap-3">
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       router.push(`/stories/${currentStory.story_id}/story-overview`);
//                     }}
//                     className="bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 
//                       hover:from-blue-400 hover:via-purple-500 hover:to-pink-400 text-white font-bold 
//                       px-8 md:px-10 h-11 md:h-14 rounded-md text-base md:text-xl 
//                       transition-all duration-200 active:scale-[0.97] shadow-lg shadow-purple-500/20"
//                   >
//                     Read Now
//                   </button>

//                   <button
//                       onClick={(e) => handleSave(e, currentStory.story_id)}
//                       className={`flex items-center justify-center h-11 md:h-14 w-11 md:w-14 rounded-md transition-all duration-200 active:scale-[0.9]
//                         ${savedStories[currentStory.story_id]
//                           ? 'bg-white text-black'
//                           : 'bg-white/15 backdrop-blur-sm text-white hover:bg-white/25'
//                         }`}
//                     >
//                     <Bookmark 
//                       className={`w-4 h-4 md:w-5 md:h-5 ${savedStories[currentStory.story_id] ? 'fill-current' : ''}`} 
//                     />
//                   </button>
//                 </div>
//               </div>

//             {/* Bottom-right mini thumbnail carousel */}
//             <div className="absolute bottom-3 md:bottom-8 right-2 md:right-8 z-20">
//               <div className="relative flex items-center">
//                 {currentIndex > 0 && (
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       goToSlide((currentIndex - 1 + carouselStories.length) % carouselStories.length);
//                     }}
//                     className="hidden md:flex absolute left-0 -translate-x-1/2 z-30 items-center justify-center w-6 h-6 rounded-full 
//                       bg-black/60 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/80 
//                       transition-all duration-200"
//                   >
//                     <ChevronLeft className="w-3.5 h-3.5" />
//                   </button>
//                 )}

//                 <div
//                   ref={thumbnailContainerRef}
//                   className="flex gap-1.5 md:gap-2 overflow-x-auto scrollbar-hide max-w-[220px] md:max-w-[420px]"
//                   onMouseDown={handleMouseDown}
//                   onMouseMove={handleMouseMove}
//                   onMouseUp={handleMouseUp}
//                   onMouseLeave={handleMouseUp}
//                   style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
//                 >
//                   {carouselStories.map((story, index) => (
//                     <button
//                       key={story.id}
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         if (!isDragging) goToSlide(index);
//                       }}
//                       className={`flex-shrink-0 w-20 h-9 md:w-28 md:h-12 rounded-xl md:rounded-2xl overflow-hidden 
//                         transition-all duration-300 
//                         ${currentIndex === index 
//                           ? 'ring-2 ring-white scale-100 opacity-100' 
//                           : 'opacity-80 hover:opacity-100 hover:scale-105'
//                         }`}
//                     >
//                       <img
//                         src={`${BASE_IMAGE_URL}${story.cover_img}`}
//                         alt={story.title}
//                         className="w-full h-full object-cover"
//                         draggable={false}
//                       />
//                     </button>
//                   ))}
//                 </div>

//                 {currentIndex < carouselStories.length - 1 && (
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       goToSlide((currentIndex + 1) % carouselStories.length);
//                     }}
//                     className="hidden md:flex absolute right-0 translate-x-1/2 z-30 items-center justify-center w-6 h-6 rounded-full 
//                       bg-black/60 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/80 
//                       transition-all duration-200"
//                   >
//                     <ChevronRight className="w-3.5 h-3.5" />
//                   </button>
//                 )}
//               </div>
//             </div>
//             </>
//           )}
//         </div>

//         {/* Divider */}
//         <div className="border-b border-white/30" />

//         {/* Categories */}
//         <div className="space-y-8 md:px-8 mt-4">
//           {categories.map((category) => (
//             <div key={category.id} className="mb-8">
//               <div className="flex items-center justify-between mb-4 px-4">
//                 <h2 className="text-base md:text-2xl text-white font-medium">
//                   {category.title}
//                 </h2>
                
//                 {category.id !== 'continue-reading' && (
//                   <button
//                     onClick={() => {
//                       const path = typeof category.id === 'string' && 
//                         (category.id === 'trending' || category.id === 'latest')
//                         ? `/view-all/${category.id}`
//                         : `/view-all/${Number(category.id)}`;
//                       router.push(path);
//                     }}
//                     className="text-white/70 hover:text-white text-sm md:text-base 
//                       font-medium transition-colors duration-200 flex items-center gap-1"
//                   >
//                     View All
//                     <ChevronRight className="w-4 h-4" />
//                   </button>
//                 )}
//               </div>
//               <div className="flex overflow-x-auto scrollbar-hide px-4 space-x-4 pb-4">
//                 {category.data.map((story, idx) => (
//                   <StoryCard 
//                     key={idx} 
//                     story={story} 
//                   />
//                 ))}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Auth Dialog */}
//       <SignInRequiredDialog
//         showAuthDialog={showAuthDialog}
//         setShowAuthDialog={setShowAuthDialog}
//         actionType="save"
//         router={router}
//       />
//     </div>
//   );
// };

// export default ImageCarousel;

"use client"
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Loader2, BookOpen, Gamepad2, Bookmark, Volume2, VolumeX } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SignInRequiredDialog from '../../components/SignInRequiredDialog';
import AgeWarningModal from '../../components/AgeWarningModal';

const BASE_IMAGE_URL = 'https://wowfy.in/testusr/images/';
const BASE_VIDEO_URL = 'https://wowfy.in/testusr/videos/';

const ImageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [carouselStories, setCarouselStories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [savedStories, setSavedStories] = useState({});
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [selectedStoryForWarning, setSelectedStoryForWarning] = useState(null);
  const [showAgeWarningModal, setShowAgeWarningModal] = useState(false);

  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const router = useRouter();
  const videoRef = useRef(null);
  const autoAdvanceTimer = useRef(null);
  const thumbnailContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragScrollLeft, setDragScrollLeft] = useState(0);

  const handleOpenStory = (story) => {
    if (!story) return;
    const rating = story.age_rating || story.ageRating || '13+';
    if (rating === '18+') {
      setSelectedStoryForWarning(story);
      setShowAgeWarningModal(true);
    } else {
      const targetId = story.story_id || story.id || story.storyId;
      router.push(`/stories/${targetId}/story-overview`);
    }
  };

  const confirmOpenStory = () => {
    if (selectedStoryForWarning) {
      const targetId = selectedStoryForWarning.story_id || selectedStoryForWarning.id || selectedStoryForWarning.storyId;
      router.push(`/stories/${targetId}/story-overview`);
    }
  };

  const StoryCard = ({ story }) => {
    const handleClick = () => {
      handleOpenStory(story);
    };

    return (
      <div 
        className="flex-none w-32 md:w-56 cursor-pointer transition-transform hover:scale-105 relative"
        onClick={handleClick}
      >
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm z-10 px-2 py-1 rounded-full">
          <p className="text-xs text-purple-400 font-medium">
            {story.story_type === 'game' ? (
              <Gamepad2
                className="w-5 h-5 md:w-6 md:h-6 text-white/90 stroke-[2.5] drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]" 
              />
            ) : (
              <BookOpen 
                className="w-5 h-5 md:w-6 md:h-6 text-white/90 stroke-[2.5] drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]" 
              />
            )}
          </p>
        </div>
        <img 
          src={`${BASE_IMAGE_URL}${story.cover_img}`}
          alt={story.title}
          className="w-full h-28 md:h-44 object-cover rounded-2xl border-[6px] border-white mb-2"
        />
        <p className="text-xs md:text-sm text-center text-white font-medium line-clamp-2">
          {story.title}
        </p>
      </div>
    );
  };

  const isLoggedIn = () => {
    return typeof window !== 'undefined' && !!localStorage.getItem('token');
  };

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

      if (!response.ok) throw new Error('Failed to fetch stories');
      
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

  // Determine if a trailer is a video based on extension
  const isTrailerVideo = (trailer) => {
    if (!trailer) return false;
    const ext = trailer.split('.').pop().toLowerCase();
    return ['mp4', 'webm', 'ogg', 'mov'].includes(ext);
  };

  // Get the current story
  const currentStory = carouselStories[currentIndex];

  // Clear any existing timer
  const clearAutoAdvance = useCallback(() => {
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
  }, []);

  // Advance to the next carousel item
  const advanceCarousel = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % carouselStories.length);
  }, [carouselStories.length]);

  // Start a timer for image-based carousel items (5 seconds)
  const startImageTimer = useCallback(() => {
    clearAutoAdvance();
    autoAdvanceTimer.current = setTimeout(() => {
      advanceCarousel();
    }, 5000);
  }, [clearAutoAdvance, advanceCarousel]);

  // Handle video ended — wait 2 seconds then advance
  const handleVideoEnded = useCallback(() => {
    clearAutoAdvance();
    autoAdvanceTimer.current = setTimeout(() => {
      advanceCarousel();
    }, 2000);
  }, [clearAutoAdvance, advanceCarousel]);

  // When currentIndex changes, setup the appropriate timer
  useEffect(() => {
    if (carouselStories.length === 0) return;

    const story = carouselStories[currentIndex];
    clearAutoAdvance();

    if (story?.trailer && isTrailerVideo(story.trailer)) {
      // Video — timer will be set via onEnded handler
      // But also set a fallback in case video fails to load
      autoAdvanceTimer.current = setTimeout(() => {
        advanceCarousel();
      }, 30000); // 30s fallback
    } else {
      // Image (cover_img or trailer image) — 5 second display
      startImageTimer();
    }

    return () => clearAutoAdvance();
  }, [currentIndex, carouselStories, clearAutoAdvance, startImageTimer, advanceCarousel]);

  // Handle manual carousel item selection
  const goToSlide = (index) => {
    clearAutoAdvance();
    setCurrentIndex(index);
  };

  // Save/bookmark handler
  const handleSave = async (e, storyId) => {
    e.stopPropagation();
    
    if (!isLoggedIn()) {
      setShowAuthDialog(true);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/${storyId}/save`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSavedStories(prev => ({ ...prev, [storyId]: data.isSaved }));
    } catch (error) {
      console.error('Error saving story:', error);
    }
  };

  // Touch handlers for main carousel
  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
  const handleTouchMove = (e) => setTouchEnd(e.touches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) < 50) return;
    if (distance > 0) {
      goToSlide((currentIndex + 1) % carouselStories.length);
    } else {
      goToSlide((currentIndex - 1 + carouselStories.length) % carouselStories.length);
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  // Thumbnail drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStartX(e.pageX - thumbnailContainerRef.current.offsetLeft);
    setDragScrollLeft(thumbnailContainerRef.current.scrollLeft);
  };
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - thumbnailContainerRef.current.offsetLeft;
    const walk = (x - dragStartX) * 1.5;
    thumbnailContainerRef.current.scrollLeft = dragScrollLeft - walk;
  };
  const handleMouseUp = () => setIsDragging(false);

  // Scroll thumbnail into view when index changes
  useEffect(() => {
    if (thumbnailContainerRef.current) {
      const thumb = thumbnailContainerRef.current.children[currentIndex];
      if (thumb) {
        thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentIndex]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-black pb-16">
      <div className="w-full max-w-[1920px] mx-auto">
        {/* === JioHotstar-style Carousel === */}
        <div
          className="
          group
          relative
          mx-auto
          h-[340px]
          md:h-screen
          overflow-hidden
          bg-black
          "
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {carouselStories.length > 0 && currentStory && (
            <>
              {/* Background Media */}
              <div
                className="
                absolute
                inset-0
                cursor-pointer
                transition-all
                duration-700
                "
                onClick={() => handleOpenStory(currentStory)}
              >
                {currentStory.trailer && isTrailerVideo(currentStory.trailer) ? (
                  <video
                    ref={videoRef}
                    key={`video-${currentIndex}`}
                    src={`${BASE_VIDEO_URL}${currentStory.trailer}`}
                    className="w-full h-full object-cover transition-opacity duration-700"
                    autoPlay
                    muted={isMuted}
                    playsInline
                    onEnded={handleVideoEnded}
                    onError={() => startImageTimer()}
                  />
                ) : currentStory.trailer ? (
                  <img
                    src={`${BASE_IMAGE_URL}${currentStory.trailer}`}
                    alt={currentStory.title}
                    className="w-full h-full object-cover transition-opacity duration-700"
                  />
                ) : (
                  <img
                    src={`${BASE_IMAGE_URL}${currentStory.cover_img}`}
                    alt={currentStory.title}
                    className="w-full h-full object-cover transition-opacity duration-700"
                  />
                )}
              </div>

              {/* Gradient overlays */}
              <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />
             <div className="absolute left-0 top-0 h-full w-[42%] bg-gradient-to-r from-black/65 via-black/25 to-transparent pointer-events-none" />
              {/* Mute/Unmute toggle (only for video) */}
              {currentStory.trailer && isTrailerVideo(currentStory.trailer) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMuted(!isMuted);
                  }}
                  className="absolute top-5 right-5 md:top-8 md:right-8 z-30 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full p-3 text-white hover:bg-white/20 transition-all duration-300"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 md:w-5 md:h-5" /> : <Volume2 className="w-4 h-4 md:w-5 md:h-5" />}
                </button>
              )}

            {/* ================= HERO CONTENT ================= */}
            <div className="absolute left-6 md:left-16 bottom-12 md:bottom-20 z-20 w-[90%] md:max-w-[560px] group">
              {/* Title */}
              <h1
                style={{ textShadow: "0 8px 35px rgba(0,0,0,.55)" }}
                className="
                  text-white
                  text-4xl
                  md:text-7xl
                  font-extrabold
                  tracking-[-0.04em]
                  leading-[0.92]
                  drop-shadow-2xl
                  mb-7
                "
              >
                {currentStory.title}
              </h1>

              {/* Metadata */}
              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-3
                  text-sm
                  md:text-base
                  mb-6
                  text-white/75 transition-opacity duration-300 group-hover:text-white
                "
              >
                <span
                  className="
                    rounded-md
                    border
                    border-white/25
                    bg-white/5
                    px-2.5
                    py-[2px]
                    text-white/85
                    font-medium
                  "
                >
                  {currentStory.age_rating || '13+'}
                </span>

                <span className="text-white/20">•</span>

                <span className="text-white/70 font-semibold">
                  {currentStory.episode_count || 0} Episodes
                </span>

                <span className="text-white/20">•</span>

                <span className="text-white/70">
                  {currentStory.language || 'English'}
                </span>

                {currentStory.release_year && (
                  <>
                    <span className="text-white/20">•</span>

                    <span className="text-white/70">
                      {currentStory.release_year}
                    </span>
                  </>
                )}
              </div>

              {/* Synopsis */}
              {currentStory.synopsis && (
                <p
                  className="
                    max-w-[560px]
                    text-[15px]
                    md:text-[17px]
                    leading-8
                    text-white/65
                    mb-8
                    line-clamp-3
                    text-white/60 transition-opacity duration-300 group-hover:text-white/80
                  "
                >
                  {currentStory.synopsis}
                </p>
              )}

              {/* Genres */}
              {currentStory.genres &&
                currentStory.genres.length > 0 && (
                  <div
                    className="
                      flex
                      flex-wrap
                      items-center
                      gap-2
                      mb-9
                      transition-opacity duration-300 text-white/80 group-hover:text-white
                    "
                  >
                    {currentStory.genres.map((genre, index) => (
                      <React.Fragment key={index}>
                        {index !== 0 && (
                          <span className="text-white/20">
                            |
                          </span>
                        )}

                        <span
                          className="
                            text-white/90
                            font-semibold
                            text-sm
                            md:text-base
                          "
                        >
                          {genre}
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                )}

              {/* Buttons */}
              <div className="flex items-center gap-4">

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenStory(currentStory);
                  }}
                  className="h-14 min-w-[200px] md:min-w-[280px] px-8 md:px-12 rounded-xl bg-gradient-to-r from-[#0066FF] via-[#9900FF] to-[#E60073] hover:from-[#1A75FF] hover:via-[#A61AFF] hover:to-[#FF1A82] text-white font-bold text-lg md:text-xl tracking-wide shadow-lg shadow-purple-900/40 hover:shadow-[0_0_30px_rgba(153,0,255,0.5)] transition-all duration-300 active:scale-95 flex items-center justify-center"
                >
                  Read Now
                </button>

                <button
                  onClick={(e) =>
                    handleSave(e, currentStory.story_id)
                  }
                  className={`
                    h-14
                    w-14
                    rounded-xl
                    backdrop-blur-xl
                    border
                    border-white/10
                    transition-all
                    duration-300

                    ${
                      savedStories[currentStory.story_id]
                        ? "bg-white text-black"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }
                  `}
                >
                  <Bookmark
                    className={`w-5 h-5 mx-auto ${
                      savedStories[currentStory.story_id]
                        ? "fill-current"
                        : ""
                    }`}
                  />
                </button>

              </div>
            </div>
            {/* Bottom-right mini thumbnail carousel */}
            <div className="absolute bottom-4 md:bottom-10 right-4 md:right-12 z-20">
              <div className="relative flex items-center">
                {/* Left arrow button (only when index > 0) */}
                {currentIndex > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goToSlide((currentIndex - 1 + carouselStories.length) % carouselStories.length);
                    }}
                    className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-30 items-center justify-center w-8 h-8 rounded-full bg-black/70 backdrop-blur-md text-white/90 hover:text-white hover:bg-black/90 transition-all duration-200 shadow-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}

                <div
                  ref={thumbnailContainerRef}
                  className="flex gap-2.5 overflow-x-auto scrollbar-hide max-w-[240px] md:max-w-[520px] py-1 px-1"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                >
                  {carouselStories.map((story, index) => (
                    <button
                      key={story.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isDragging) goToSlide(index);
                      }}
                      className={`flex-shrink-0 w-20 h-11 md:w-28 md:h-16 rounded-lg md:rounded-xl overflow-hidden transition-all duration-300 ${
                        currentIndex === index
                          ? 'ring-2 ring-white opacity-100 shadow-lg scale-100'
                          : 'opacity-50 hover:opacity-85 hover:scale-[1.03]'
                      }`}
                    >
                      <img
                        src={`${BASE_IMAGE_URL}${story.cover_img}`}
                        alt={story.title}
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    </button>
                  ))}
                </div>

                {/* Right arrow button (only when index < length - 1) */}
                {currentIndex < carouselStories.length - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goToSlide((currentIndex + 1) % carouselStories.length);
                    }}
                    className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-30 items-center justify-center w-8 h-8 rounded-full bg-black/70 backdrop-blur-md text-white/90 hover:text-white hover:bg-black/90 transition-all duration-200 shadow-lg"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="border-b border-white/30" />

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

      {/* Auth Dialog */}
      <SignInRequiredDialog
        showAuthDialog={showAuthDialog}
        setShowAuthDialog={setShowAuthDialog}
        actionType="save"
        router={router}
      />

      {/* Age Warning & Content Warning Modal */}
      <AgeWarningModal
        isOpen={showAgeWarningModal}
        onClose={() => setShowAgeWarningModal(false)}
        onConfirm={confirmOpenStory}
        story={selectedStoryForWarning}
      />
    </div>
  );
};

export default ImageCarousel;
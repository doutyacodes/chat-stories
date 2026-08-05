"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Bookmark, Volume2, VolumeX } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SignInRequiredDialog from '../../components/SignInRequiredDialog';
import AgeWarningModal from '../../components/AgeWarningModal';
import StoryCardSkeleton from '../../components/StoryCardSkeleton';
import LazyCategoryRow from '../../components/LazyCategoryRow';

const BASE_IMAGE_URL = 'https://wowfy.in/testusr/images/';
const BASE_VIDEO_URL = 'https://wowfy.in/testusr/videos/';

const ImageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [carouselStories, setCarouselStories] = useState([]);
  const [staticSections, setStaticSections] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [isCarouselLoading, setIsCarouselLoading] = useState(true);
  const [isSectionsLoading, setIsSectionsLoading] = useState(true);
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
  const mobileThumbnailContainerRef = useRef(null);
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

  const isLoggedIn = () => {
    return typeof window !== 'undefined' && !!localStorage.getItem('token');
  };

  // API 1: Fetch Hero Carousel (~50ms)
  const fetchCarousel = async () => {
    try {
      setIsCarouselLoading(true);
      const response = await fetch('/api/carousel');
      if (response.ok) {
        const data = await response.json();
        setCarouselStories(data.carouselStories || []);
      }
    } catch (err) {
      console.error('Error fetching carousel:', err);
    } finally {
      setIsCarouselLoading(false);
    }
  };

  // API 2: Fetch Modular Sections Independently
  const fetchModularSections = async () => {
    let sessionId = null;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token && typeof window !== 'undefined') {
      sessionId = sessionStorage.getItem('session_id');
      if (!sessionId) {
        sessionId = 'sess_' + Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('session_id', sessionId);
      }
    }

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    try {
      setIsSectionsLoading(true);

      const [continueRes, trendingRes, latestRes, categoriesListRes] = await Promise.all([
        fetch(`/api/sections?section=continue-reading&session_id=${sessionId}`, { headers }),
        fetch(`/api/sections?section=trending`, { headers }),
        fetch(`/api/sections?section=latest`, { headers }),
        fetch(`/api/sections?section=categories-list`, { headers })
      ]);

      const [continueData, trendingData, latestData, categoriesListData] = await Promise.all([
        continueRes.ok ? continueRes.json() : { categories: [] },
        trendingRes.ok ? trendingRes.json() : { categories: [] },
        latestRes.ok ? latestRes.json() : { categories: [] },
        categoriesListRes.ok ? categoriesListRes.json() : { categories: [] }
      ]);

      const mainStaticSections = [
        ...(continueData.categories || []),
        ...(trendingData.categories || []),
        ...(latestData.categories || [])
      ];

      setStaticSections(mainStaticSections);
      setCustomCategories(categoriesListData.categories || []);
    } catch (err) {
      console.error('Error fetching modular sections:', err);
    } finally {
      setIsSectionsLoading(false);
    }
  };

  useEffect(() => {
    fetchCarousel();
    fetchModularSections();
  }, []);

  const isTrailerVideo = (trailer) => {
    if (!trailer) return false;
    const ext = trailer.split('.').pop().toLowerCase();
    return ['mp4', 'webm', 'ogg', 'mov'].includes(ext);
  };

  const currentStory = carouselStories[currentIndex];

  const clearAutoAdvance = useCallback(() => {
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
  }, []);

  const advanceCarousel = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % (carouselStories.length || 1));
  }, [carouselStories.length]);

  const startImageTimer = useCallback(() => {
    clearAutoAdvance();
    autoAdvanceTimer.current = setTimeout(() => {
      advanceCarousel();
    }, 5000);
  }, [clearAutoAdvance, advanceCarousel]);

  const handleVideoEnded = useCallback(() => {
    clearAutoAdvance();
    autoAdvanceTimer.current = setTimeout(() => {
      advanceCarousel();
    }, 2000);
  }, [clearAutoAdvance, advanceCarousel]);

  useEffect(() => {
    if (carouselStories.length === 0) return;

    const story = carouselStories[currentIndex];
    clearAutoAdvance();

    if (story?.trailer && isTrailerVideo(story.trailer)) {
      autoAdvanceTimer.current = setTimeout(() => {
        advanceCarousel();
      }, 30000);
    } else {
      startImageTimer();
    }

    return () => clearAutoAdvance();
  }, [currentIndex, carouselStories, clearAutoAdvance, startImageTimer, advanceCarousel]);

  const goToSlide = (index) => {
    clearAutoAdvance();
    setCurrentIndex(index);
  };

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

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStartX(e.pageX - (thumbnailContainerRef.current?.offsetLeft || 0));
    setDragScrollLeft(thumbnailContainerRef.current?.scrollLeft || 0);
  };
  const handleMouseMove = (e) => {
    if (!isDragging || !thumbnailContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - thumbnailContainerRef.current.offsetLeft;
    const walk = (x - dragStartX) * 1.5;
    thumbnailContainerRef.current.scrollLeft = dragScrollLeft - walk;
  };
  const handleMouseUp = () => setIsDragging(false);

  // Scroll active thumbnail inside container quietly
  useEffect(() => {
    [thumbnailContainerRef.current, mobileThumbnailContainerRef.current].forEach(container => {
      if (container) {
        const thumb = container.children[currentIndex];
        if (thumb) {
          const containerWidth = container.clientWidth;
          const thumbOffset = thumb.offsetLeft;
          const thumbWidth = thumb.clientWidth;
          const targetScrollLeft = thumbOffset - (containerWidth / 2) + (thumbWidth / 2);
          container.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
        }
      }
    });
  }, [currentIndex]);

  return (
    <div className="min-h-screen bg-black pb-16">
      <div className="w-full max-w-[1920px] mx-auto">
        {/* ======================================================== */}
        {/* DESKTOP VIEW (lg:block) — Fullscreen Hero Banner        */}
        {/* ======================================================== */}
        <div
          className="
            hidden lg:block
            group
            relative
            w-full
            h-[calc(100vh-64px)] lg:h-[calc(100vh-72px)] min-h-[560px]
            overflow-hidden
            bg-neutral-950
          "
        >
          {isCarouselLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-950 animate-pulse">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
          ) : carouselStories.length > 0 && currentStory && (
            <>
              {/* Background Media */}
              <div
                className="absolute inset-0 cursor-pointer transition-all duration-700"
                onClick={() => handleOpenStory(currentStory)}
              >
                {currentStory.trailer && isTrailerVideo(currentStory.trailer) ? (
                  <video
                    ref={videoRef}
                    key={`video-desktop-${currentIndex}`}
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
                    decoding="async"
                    className="w-full h-full object-cover transition-opacity duration-700"
                  />
                ) : (
                  <img
                    src={`${BASE_IMAGE_URL}${currentStory.cover_img}`}
                    alt={currentStory.title}
                    decoding="async"
                    className="w-full h-full object-cover transition-opacity duration-700"
                  />
                )}
              </div>

              {/* Gradient overlays */}
              <div className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
              <div className="absolute left-0 top-0 h-full w-[52%] bg-gradient-to-r from-black/85 via-black/35 to-transparent pointer-events-none" />

              {/* Mute toggle */}
              {currentStory.trailer && isTrailerVideo(currentStory.trailer) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMuted(!isMuted);
                  }}
                  className="absolute top-6 right-8 z-30 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full p-2.5 text-white hover:bg-white/20 transition-all duration-300"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              )}

              {/* HERO CONTENT — Positioned Upward for Laptop Screens */}
              <div className="absolute left-8 sm:left-12 lg:left-16 bottom-8 lg:bottom-12 xl:bottom-16 z-20 w-[90%] max-w-[560px] group">
                <h1
                  style={{ textShadow: "0 8px 35px rgba(0,0,0,.55)" }}
                  className="text-white text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-[-0.03em] leading-[1.05] drop-shadow-2xl mb-3 lg:mb-4"
                >
                  {currentStory.title}
                </h1>

                <div className="flex flex-wrap items-center gap-2.5 text-xs lg:text-sm mb-3 lg:mb-4 text-white/80 transition-opacity duration-300 group-hover:text-white font-semibold">
                  <span className="rounded-md border border-white/25 bg-white/10 backdrop-blur-md px-2.5 py-0.5 text-white font-medium">
                    {(currentStory?.story_type === 'game' || currentStory?.storyType === 'game' || currentStory?.type === 'game' || currentStory?.story_type === 'interactive' || currentStory?.storyType === 'interactive') ? 'Game' : 'Story'}
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="rounded-md border border-white/25 bg-white/10 backdrop-blur-md px-2.5 py-0.5 text-white font-medium">
                    {currentStory.age_rating || '13+'}
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="text-white/80 font-semibold">
                    {currentStory.episode_count || 0} Episodes
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="text-white/80">
                    {currentStory.language || 'English'}
                  </span>
                </div>

                {currentStory.synopsis && (
                  <p className="max-w-[520px] text-xs sm:text-sm lg:text-base leading-relaxed text-white/80 mb-4 lg:mb-6 line-clamp-2 lg:line-clamp-3 transition-opacity duration-300 group-hover:text-white">
                    {currentStory.synopsis}
                  </p>
                )}

                {currentStory.genres && currentStory.genres.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mb-4 lg:mb-6 transition-opacity duration-300 text-white/80 group-hover:text-white">
                    {currentStory.genres.map((genre, index) => (
                      <React.Fragment key={index}>
                        {index !== 0 && <span className="text-white/20">|</span>}
                        <span className="text-white/90 font-semibold text-xs lg:text-sm">
                          {genre}
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3 lg:gap-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenStory(currentStory);
                    }}
                    className="h-12 lg:h-14 min-w-[200px] lg:min-w-[240px] px-8 rounded-xl bg-gradient-to-r from-[#0066FF] via-[#9900FF] to-[#E60073] hover:from-[#1A75FF] hover:via-[#A61AFF] hover:to-[#FF1A82] text-white font-bold text-base lg:text-lg tracking-wide shadow-lg shadow-purple-900/40 hover:shadow-[0_0_30px_rgba(153,0,255,0.5)] transition-all duration-300 active:scale-95 flex items-center justify-center"
                  >
                    {(currentStory?.story_type === 'game' || currentStory?.storyType === 'game' || currentStory?.type === 'game' || currentStory?.story_type === 'interactive' || currentStory?.storyType === 'interactive') ? 'Play Now' : 'Read Now'}
                  </button>

                  <button
                    onClick={(e) => handleSave(e, currentStory.story_id)}
                    className={`h-12 w-12 lg:h-14 lg:w-14 rounded-xl backdrop-blur-xl border border-white/10 transition-all duration-300 ${
                      savedStories[currentStory.story_id]
                        ? "bg-white text-black"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    <Bookmark className={`w-5 h-5 mx-auto ${savedStories[currentStory.story_id] ? "fill-current" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Bottom-right thumbnail carousel — Moved Upward */}
              <div className="absolute bottom-6 lg:bottom-10 right-6 lg:right-12 z-20">
                <div className="relative flex items-center">
                  {currentIndex > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        goToSlide((currentIndex - 1 + carouselStories.length) % carouselStories.length);
                      }}
                      className="absolute -left-4 top-1/2 -translate-y-1/2 z-30 items-center justify-center w-8 h-8 rounded-full bg-black/70 backdrop-blur-md text-white/90 hover:text-white hover:bg-black/90 transition-all duration-200 shadow-lg"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}

                  <div
                    ref={thumbnailContainerRef}
                    className="flex gap-2.5 overflow-x-auto scrollbar-hide max-w-[520px] py-1 px-1"
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
                        className={`flex-shrink-0 w-28 h-16 rounded-xl overflow-hidden transition-all duration-300 ${
                          currentIndex === index
                            ? 'ring-2 ring-white opacity-100 shadow-lg scale-100'
                            : 'opacity-50 hover:opacity-85 hover:scale-[1.03]'
                        }`}
                      >
                        <img
                          src={`${BASE_IMAGE_URL}${story.cover_img}`}
                          alt={story.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                      </button>
                    ))}
                  </div>

                  {currentIndex < carouselStories.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        goToSlide((currentIndex + 1) % carouselStories.length);
                      }}
                      className="absolute -right-4 top-1/2 -translate-y-1/2 z-30 items-center justify-center w-8 h-8 rounded-full bg-black/70 backdrop-blur-md text-white/90 hover:text-white hover:bg-black/90 transition-all duration-200 shadow-lg"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>


        {/* ======================================================== */}
        {/* MOBILE & TABLET VIEW (block lg:hidden) — Structured 3-Tier Stack */}
        {/* ======================================================== */}
        <div className="block lg:hidden bg-black overflow-hidden">
          {isCarouselLoading ? (
            <div className="h-[280px] flex items-center justify-center bg-neutral-950 animate-pulse">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
          ) : carouselStories.length > 0 && currentStory && (
            <div>
              {/* 1. TOP MEDIA SECTION */}
              <div 
                className="relative h-[250px] xs:h-[300px] w-full bg-neutral-950 overflow-hidden cursor-pointer"
                onClick={() => handleOpenStory(currentStory)}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {currentStory.trailer && isTrailerVideo(currentStory.trailer) ? (
                  <video
                    key={`video-mobile-${currentIndex}`}
                    src={`${BASE_VIDEO_URL}${currentStory.trailer}`}
                    className="w-full h-full object-cover"
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
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={`${BASE_IMAGE_URL}${currentStory.cover_img}`}
                    alt={currentStory.title}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Subtle bottom fade */}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

                {/* Mute button */}
                {currentStory.trailer && isTrailerVideo(currentStory.trailer) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMuted(!isMuted);
                    }}
                    className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md rounded-full p-2.5 text-white/90"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                )}
              </div>

              {/* 2. MIDDLE THUMBNAIL TRACK (Based on user layout sketch) */}
              <div className="bg-neutral-950 py-3 border-y border-neutral-900 px-2">
                <div className="flex items-center justify-between gap-1">
                  {/* Left arrow indicator */}
                  <button
                    onClick={() => goToSlide((currentIndex - 1 + carouselStories.length) % carouselStories.length)}
                    className="p-1 text-white/60 hover:text-white disabled:opacity-30"
                    disabled={currentIndex === 0}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div
                    ref={mobileThumbnailContainerRef}
                    className="flex gap-2 overflow-x-auto scrollbar-hide max-w-[85vw] py-1 px-1"
                  >
                    {carouselStories.map((story, index) => (
                      <button
                        key={`mob-thumb-${story.id}`}
                        onClick={() => goToSlide(index)}
                        className={`flex-shrink-0 w-20 h-12 rounded-lg overflow-hidden border transition-all duration-300 ${
                          currentIndex === index
                            ? 'border-purple-500 ring-2 ring-purple-500 scale-105 opacity-100 shadow-md'
                            : 'border-white/10 opacity-50'
                        }`}
                      >
                        <img
                          src={`${BASE_IMAGE_URL}${story.cover_img}`}
                          alt={story.title}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>

                  {/* Right arrow indicator */}
                  <button
                    onClick={() => goToSlide((currentIndex + 1) % carouselStories.length)}
                    className="p-1 text-white/60 hover:text-white disabled:opacity-30"
                    disabled={currentIndex === carouselStories.length - 1}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* 3. BOTTOM DETAILS & ACTION PANEL */}
              <div className="p-5 bg-gradient-to-b from-black via-neutral-950 to-black">
                {/* Title */}
                <h1 className="text-2xl font-black text-white leading-tight mb-2.5">
                  {currentStory.title}
                </h1>

                {/* Metadata Badges */}
                <div className="flex flex-wrap items-center gap-2 text-xs mb-3 text-neutral-300 font-medium">
                  <span className="rounded bg-white/10 border border-white/20 px-2 py-0.5 text-white font-semibold">
                    {(currentStory?.story_type === 'game' || currentStory?.storyType === 'game' || currentStory?.type === 'game' || currentStory?.story_type === 'interactive' || currentStory?.storyType === 'interactive') ? 'Game' : 'Story'}
                  </span>
                  <span>•</span>
                  <span className="rounded bg-white/10 border border-white/20 px-2 py-0.5 text-white font-semibold">
                    {currentStory.age_rating || '13+'}
                  </span>
                  <span>•</span>
                  <span>{currentStory.episode_count || 0} Episodes</span>
                  <span>•</span>
                  <span>{currentStory.language || 'English'}</span>
                </div>

                {/* Synopsis */}
                {currentStory.synopsis && (
                  <p className="text-xs md:text-sm leading-relaxed text-neutral-400 line-clamp-3 mb-3.5">
                    {currentStory.synopsis}
                  </p>
                )}

                {/* Genres */}
                {currentStory.genres && currentStory.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {currentStory.genres.map((genre, idx) => (
                      <span key={idx} className="bg-neutral-900 text-purple-300 text-[11px] px-2.5 py-0.5 rounded-full border border-neutral-800 font-medium">
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleOpenStory(currentStory)}
                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-[#0066FF] via-[#9900FF] to-[#E60073] active:from-[#1A75FF] active:to-[#FF1A82] text-white font-bold text-base tracking-wide shadow-lg shadow-purple-900/30 flex items-center justify-center active:scale-95 transition-transform"
                  >
                    {(currentStory?.story_type === 'game' || currentStory?.storyType === 'game' || currentStory?.type === 'game' || currentStory?.story_type === 'interactive' || currentStory?.storyType === 'interactive') ? 'Play Now' : 'Read Now'}
                  </button>

                  <button
                    onClick={(e) => handleSave(e, currentStory.story_id)}
                    className={`h-12 w-12 rounded-xl border border-neutral-800 flex items-center justify-center transition-all ${
                      savedStories[currentStory.story_id]
                        ? "bg-white text-black"
                        : "bg-neutral-900 text-white"
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${savedStories[currentStory.story_id] ? "fill-current" : ""}`} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-b border-white/10" />

        {/* Categories Section */}
        <div className="space-y-8 md:px-8 mt-6">
          {isSectionsLoading ? (
            <>
              <StoryCardSkeleton count={5} />
              <StoryCardSkeleton count={5} />
              <StoryCardSkeleton count={5} />
            </>
          ) : (
            <>
              {/* Static Sections (Continue Reading, Trending, Latest) */}
              {staticSections.map((section) => (
                <LazyCategoryRow
                  key={section.id}
                  category={section}
                  onOpenStory={handleOpenStory}
                  router={router}
                />
              ))}

              {/* Custom Categories (Lazy loaded on scroll) */}
              {customCategories.map((cat) => (
                <LazyCategoryRow
                  key={`cat-${cat.id}`}
                  category={cat}
                  onOpenStory={handleOpenStory}
                  router={router}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Auth Dialog */}
      <SignInRequiredDialog
        showAuthDialog={showAuthDialog}
        setShowAuthDialog={setShowAuthDialog}
        actionType="save"
        router={router}
      />

      {/* Age Warning Modal */}
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
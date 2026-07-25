"use client"
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronDown, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import AgeWarningModal from '../../../components/AgeWarningModal';

const SortOptions = {
  LATEST: 'latest',
  MOST_VIEWED: 'most_viewed',
  MOST_LIKED: 'most_liked'
};
const BASE_IMAGE_URL = 'https://wowfy.in/testusr/images/';

const ViewAllPage = () => {
  const { section } = useParams();
  const router = useRouter();
  const [stories, setStories] = useState([]);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [sortBy, setSortBy] = useState(SortOptions.LATEST);
  const [loading, setLoading] = useState(true);
  const [selectedStoryForWarning, setSelectedStoryForWarning] = useState(null);
  const [showAgeWarningModal, setShowAgeWarningModal] = useState(false);

  const handleOpenStory = (story, isEpisode) => {
    if (!story) return;
    if (isEpisode) {
      router.push(
        story.story_type === 'chat'
          ? `/stories/${story.id}/${story.id}/chat-story`
          : `/stories/${story.id}/normal-story`
      );
      return;
    }
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

  const fetchStories = async () => {
    setLoading(true);
    try {
      let endpoint;
      const queryParams = new URLSearchParams({ sort: sortBy });

      if (section === 'trending' || section === 'latest') {
        endpoint = `/api/view-all/${section}?${queryParams}`;
      } else {
        endpoint = `/api/view-all/genre/${section}?${queryParams}`;
      }
      const response = await fetch(endpoint);
      const data = await response.json();
      setStories(data.stories || []);
      setCategoryInfo(data.categoryInfo);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [section, sortBy]);

  return (
    <div className="min-h-screen bg-black pb-16">
      <div className="w-full max-w-[1920px] mx-auto md:px-8 pt-4">
        {/* Back Button */}
        <div className="px-4 mb-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        {/* Cover Image Section - Only rendered if cover_img exists */}
        {categoryInfo?.cover_img && (
          <div className="relative mx-auto h-[250px] md:h-[450px] overflow-hidden md:rounded-3xl mb-4">
            <div className="relative h-full w-full">
              <img
                src={`${BASE_IMAGE_URL}${categoryInfo.cover_img}`}
                alt={categoryInfo?.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
            </div>
          </div>
        )}

        {/* Title and Synopsis */}
        <div className={`md:max-w-4xl md:mx-8 p-4 sm:p-0 ${categoryInfo?.cover_img ? 'pt-0 md:mb-8' : 'pt-2 md:pt-4 md:mb-6'}`}>
          <h2 className="text-white text-2xl md:text-5xl font-extrabold mb-2">
            {categoryInfo?.title || (section ? section.charAt(0).toUpperCase() + section.slice(1) : '')}
          </h2>
          {categoryInfo?.description && (
            <p className="text-gray-400 text-sm md:text-lg">
              {categoryInfo.description}
            </p>
          )}
        </div>

        {/* Sort / Filter Options */}
        <div className="flex items-center justify-between px-4 md:px-8 mb-6">
          <p className="text-xs md:text-sm text-neutral-400 font-medium">
            Showing <span className="text-white font-semibold">{stories.length}</span> stories
          </p>

          <div className="relative inline-flex items-center">
            <div className="absolute left-3.5 pointer-events-none text-purple-400 z-10">
              <SlidersHorizontal className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-neutral-900/90 text-white text-xs md:text-sm font-semibold pl-9 pr-9 py-2 md:py-2.5 rounded-full border border-neutral-800 hover:border-purple-500/50 focus:border-purple-500 focus:outline-none cursor-pointer transition-all duration-300 shadow-lg shadow-black/40"
            >
              <option value={SortOptions.LATEST} className="bg-neutral-900 text-white">Latest</option>
              <option value={SortOptions.MOST_VIEWED} className="bg-neutral-900 text-white">Most Viewed</option>
              <option value={SortOptions.MOST_LIKED} className="bg-neutral-900 text-white">Most Liked</option>
            </select>
            <div className="pointer-events-none absolute right-3 text-neutral-400 z-10">
              <ChevronDown className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </div>
          </div>
        </div>
 
        {/* Stories Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-4">
          {stories.map((story) => (
            <StoryCard key={story.story_id} storyData={story} onOpenStory={handleOpenStory} />
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white" />
          </div>
        )}
      </div>

      <AgeWarningModal
        isOpen={showAgeWarningModal}
        onClose={() => setShowAgeWarningModal(false)}
        onConfirm={confirmOpenStory}
        story={selectedStoryForWarning}
      />
    </div>
  );
};

const StoryCard = ({ storyData, isEpisode = false, onOpenStory }) => {
  const isGame = storyData.story_type === 'game' || storyData.storyType === 'game' || storyData.type === 'game' || storyData.story_type === 'interactive';

  return (
    <div 
      className="flex-none cursor-pointer transition-transform hover:scale-105 group relative"
      onClick={() => onOpenStory ? onOpenStory(storyData, isEpisode) : null}
    >
      {isEpisode ? (
        <div className="w-full aspect-[3/2.5] bg-gray-800 rounded-2xl border-[6px] border-white mb-2 flex items-center justify-center">
          <span className="text-white text-xl">Episode {storyData.episodeNumber}</span>
        </div>
      ) : (
        <div className="relative">
          {storyData.age_rating === '18+' && (
            <div className="absolute top-2.5 right-2.5 bg-red-600/90 text-white z-10 px-1.5 py-0.5 rounded text-[10px] font-bold">
              18+
            </div>
          )}
          <img 
            src={`${BASE_IMAGE_URL}${storyData.cover_img}`}
            alt={storyData.title}
            className="w-full aspect-[3/2.5] object-cover rounded-2xl border-[6px] border-white mb-2"
          />
        </div>
      )}
      <p className="text-xs md:text-sm text-center text-white font-medium line-clamp-2">
        {isEpisode ? storyData.name : storyData.title}
      </p>
    </div>
  );
};

export default ViewAllPage;
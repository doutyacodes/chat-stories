"use client"
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

const SortOptions = {
  LATEST: 'latest',
  MOST_VIEWED: 'most_viewed',
  MOST_LIKED: 'most_liked'
};
const BASE_IMAGE_URL = 'https://wowfy.in/testusr/images/';

const ViewAllPage = () => {
  const { section } = useParams();
  // const { section } = params;
  const router = useRouter();
  const [stories, setStories] = useState([]);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [sortBy, setSortBy] = useState(SortOptions.LATEST);
  const [loading, setLoading] = useState(true);

  const fetchStories = async () => {
    setLoading(true);
    try {
      let endpoint;
      const queryParams = new URLSearchParams({ sort: sortBy });

      if (section === 'trending' || section === 'latest') {
        endpoint = `/api/view-all/${section}?${queryParams}`;
      } else {
        // Assuming section contains the genre ID for genre-based categories
        endpoint = `/api/view-all/genre/${section}?${queryParams}`;
      }
      // Placeholder for API call
      const response = await fetch(endpoint);
      const data = await response.json();
      setStories(data.stories);
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
      <div className="w-full max-w-[1920px] mx-auto md:px-8">
        {/* Cover Image Section */}
        <div className="relative mx-auto h-[250px] md:h-[600px] overflow-hidden md:rounded-3xl mb-4">
          <div className="relative h-full w-full">
            {categoryInfo?.cover_img && (
              <img
                src={`${BASE_IMAGE_URL}${categoryInfo.cover_img}`}
                alt={categoryInfo?.title}
                className="w-full h-full object-cover"
              />
            )}
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
          </div>
        </div>

        {/* Title and Synopsis */}
        <div className="md:max-w-4xl md:mx-8 p-7 sm:p-0 pt-0 md:mb-10">
          <h2 className="text-white text-2xl md:text-5xl font-extrabold mb-2">
            {categoryInfo?.title}
          </h2>
          <p className="text-gray-400 text-sm md:text-lg">
            {categoryInfo?.description}
          </p>
        </div>

        {/* Sort Options */}
        <div className="flex items-center justify-end px-4 mb-6">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none"
          >
            <option value={SortOptions.LATEST}>Latest</option>
            <option value={SortOptions.MOST_VIEWED}>Most Viewed</option>
            <option value={SortOptions.MOST_LIKED}>Most Liked</option>
          </select>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-4">
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
      </div>
    </div>
  );
};

const StoryCard = ({ storyData, isEpisode = false }) => {
  const router = useRouter();

  const handleClick = () => {
    if (isEpisode) {
      router.push(
        storyData.story_type === 'chat'
          ? `/stories/${storyData.id}/${storyData.id}/chat-story`
          : `/stories/${storyData.id}/normal-story`
      );
    } else {
      router.push(`/stories/${storyData.story_id}/story-overview`);
    }
  };

  return (
    <div 
      className="flex-none cursor-pointer transition-transform hover:scale-105"
      onClick={handleClick}
    >
      {isEpisode ? (
        <div className="w-full aspect-[3/2.5] bg-gray-800 rounded-2xl border-[6px] border-white mb-2 flex items-center justify-center">
          <span className="text-white text-xl">Episode {storyData.episodeNumber}</span>
        </div>
      ) : (
        <img 
          src={`${BASE_IMAGE_URL}${storyData.cover_img}`}
          alt={storyData.title}
          className="w-full aspect-[3/2.5] object-cover rounded-2xl border-[6px] border-white mb-2"
        />
      )}
      <p className="text-xs md:text-sm text-center text-white font-medium line-clamp-2">
        {isEpisode ? storyData.name : storyData.title}
      </p>
    </div>
    // <div 
    //   className="flex-none w-32 md:w-56 cursor-pointer transition-transform hover:scale-105"
    //   onClick={handleClick}
    // >
    //   {isEpisode ? (
    //     <div className="w-full h-28 md:h-44 bg-gray-800 rounded-2xl border-[6px] border-white mb-2 flex items-center justify-center">
    //       <span className="text-white text-xl">Episode {storyData.episodeNumber}</span>
    //     </div>
    //   ) : (
    //     <img 
    //       src={`${BASE_IMAGE_URL}${storyData.cover_img}`}
    //       alt={storyData.title}
    //       className="w-full h-28 md:h-44 object-cover rounded-2xl border-[6px] border-white mb-2"
    //     />
    //   )}
    //   <p className="text-xs md:text-sm text-center text-white font-medium line-clamp-2">
    //     {isEpisode ? storyData.name : storyData.title}
    //   </p>
    // </div>
  );
};

export default ViewAllPage;
"use client"
import React, { useState, useEffect } from 'react';
import { Heart, Bookmark, Share2, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import StoryUserActions from '../../_components/StoryUserActions';

const BASE_IMAGE_URL = 'https://wowfy.in/testusr/images/';

const StoryOverview = () => {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [similarStories, setSimilarStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const fetchStoryData = async () => {
      try {
        const response = await fetch(`/api/stories/${id}/story-overview`);
        if (!response.ok) throw new Error('Failed to fetch story data');
        const data = await response.json();
        
        setStory(data.story);
        setEpisodes(data.episodes);
        setSimilarStories(data.similarStories.data);
      } catch (err) {
        console.error('Error fetching story:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchStoryData();
  }, [id]);


  const StoryCard = ({ storyData, isEpisode = false, hasEpisode }) => {
    const handleClick = () => {
      if (isEpisode) {
        router.push(
          story.story_type === 'chat'
            ? `/stories/${storyData.id}/${id}/chat-story`
            : `/stories/${id}/normal-story`
        );
      } else {
        router.push(`/stories/${storyData.story_id}/story-overview`);
      }
    };

    return (
      <div 
        className="flex-none w-32 md:w-56 cursor-pointer transition-transform hover:scale-105"
        onClick={handleClick}
      >
        {isEpisode ? (
          <div className="w-full h-28 md:h-44 bg-gray-800 rounded-2xl border-[6px] border-white mb-2 flex items-center justify-center">
            <span className="text-white text-xl"> 
              { hasEpisode ? `Episode ${storyData.episodeNumber}`
              : 'Full Story'}
            </span>
          </div>
        ) : (
          <img 
            src={`${BASE_IMAGE_URL}${storyData.cover_img}`}
            alt={storyData.title}
            className="w-full h-28 md:h-44 object-cover rounded-2xl border-[6px] border-white mb-2"
          />
        )}
        <p className="text-xs md:text-sm text-center text-white font-medium line-clamp-2">
          {isEpisode ? storyData.name : storyData.title}
        </p>
      </div>
    );
  };

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
         {/* Back Button */}
        {/* <div className="md:px-7 pt-4 md:pt-8">
          <button 
            onClick={() => window.history.back()} 
            className="text-white flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6"/>
            </svg>
            <span className="text-sm font-medium">Back</span>
          </button>
        </div> */}

        {/* Cover Image */}
        {/* <div className="relative mx-auto h-[250px] md:h-[600px] overflow-hidden md:rounded-3xl mb-4"> */}
        {/* <div className="relative mx-auto h-[300px] md:h-[95vh] overflow-hidden">

          <div className="relative h-full w-full">
            <img
              src={`${BASE_IMAGE_URL}${story?.cover_img}`}
              alt={story?.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div> */}
            <div className="relative mx-auto h-[300px] md:h-[95vh] overflow-hidden">
              <div className="relative h-full w-full"> 
                <img
                      src={`${BASE_IMAGE_URL}${story?.cover_img}`}
                      alt={story?.title}
                      className="w-full h-full object-cover"
                  />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
                  <h2 className="text-white text-2xl md:text-5xl font-bold mb-2">
                  {story?.title}
                  </h2>
                  <p className="text-white/90 text-sm md:text-xl max-w-3xl">
                  {story?.synopsis}
                  </p>
              </div>
            </div>

        <div className="md:max-w-4xl md:mx-8 p-7 sm:p-0 pt-0 md:mb-10">
          {/* <h2 className="text-white text-2xl md:text-5xl font-extrabold mb-2">
            {story?.title}
          </h2> */}

          <StoryUserActions story={story} />

          {/* Synopsis Section */}
          <div className="text-white text-justify">
            <h3 className="text-xl font-bold mb-3">Synopsis</h3>
            <p className="text-gray-300 text-xs leading-relaxed">
              {story?.synopsis}
            </p>
          </div>
        </div>

        {/* Episodes and Similar Stories */}
        <div className="space-y-8">
          {/* Episodes Section */}
          <div className="mb-8">
            <h2 className="text-base md:text-2xl text-white font-medium mb-4 px-4">
            {story?.has_episodes ? 'Episodes' : 'Full Story'}
            </h2>
            <div className="flex overflow-x-auto scrollbar-hide px-4 space-x-4 pb-4">
              {episodes.map((episode) => (
                <StoryCard 
                  key={episode.id} 
                  storyData={episode}
                  isEpisode={true}
                  hasEpisode={story?.has_episodes}
                />
              ))}
            </div>
          </div>

          {/* Similar Stories Section */}
          <div className="mb-8">
            <h2 className="text-base md:text-2xl text-white font-medium mb-4 px-4">
              Similar Stories
            </h2>
            <div className="flex overflow-x-auto scrollbar-hide px-4 space-x-4 pb-4">
              {similarStories.map((story) => (
                <StoryCard 
                  key={story.story_id} 
                  storyData={story}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryOverview;
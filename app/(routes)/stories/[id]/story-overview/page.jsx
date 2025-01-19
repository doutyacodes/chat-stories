"use client"
import React, { useState, useEffect } from 'react';
import { Heart, Bookmark, Share2, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

const BASE_IMAGE_URL = 'https://wowfy.in/testusr/images/';

const StoryOverview = () => {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [similarStories, setSimilarStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
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

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: story?.title,
        text: story?.synopsis,
        url: window.location.href,
      });
    }
  };

  const StoryCard = ({ storyData, isEpisode = false }) => {
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
            <span className="text-white text-xl">Episode {storyData.episodeNumber}</span>
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
      <div className="w-full max-w-[1920px] mx-auto md:px-8">
        <div className='p-7 sm:p-0 md:mb-10'>
          {/* Cover Image */}
          <div className="relative mx-auto h-[250px] md:h-[600px] overflow-hidden rounded-3xl mb-4">
            <div className="relative h-full w-full">
              <img
                src={`${BASE_IMAGE_URL}${story?.cover_img}`}
                alt={story?.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          <div className="md:max-w-4xl md:mx-8">
            <h2 className="text-white text-2xl md:text-5xl font-extrabold mb-2">
              {story?.title}
            </h2>

            {/* User Info Section */}
            <div className="flex items-center gap-3 my-4 text-white">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img 
                  src='https://chat-stories.vercel.app/user.png'
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-grow">
                <h2 className="text-xs font-semibold">{capitalizeFirstLetter(story?.author)}</h2>
                <p className="text-[8px] text-gray-400">3,258 Subscribers</p>
              </div>
              <button className="bg-red-600 text-white px-4 py-1 rounded-full text-sm">
                SUBSCRIBE
              </button>
            </div>

            {/* Action Icons */}
            <div className="flex justify-between items-center my-4 text-white">
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                  <span className="text-sm">6</span>
                </div>
                <span className="text-[8px]">Age & Above</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 flex items-center justify-center">
                  <span className="text-2xl font-bold">EN</span>
                </div>
                <span className="text-[8px]">Language</span>
              </div>

              <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => setIsLiked(!isLiked)}>
                <Heart className={`w-8 h-8 ${isLiked ? 'fill-current text-red-500' : ''}`} />
                <span className="text-[8px]">Like</span>
              </div>

              <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => setIsSaved(!isSaved)}>
                <Bookmark className={`w-8 h-8 ${isSaved ? 'fill-current' : ''}`} />
                <span className="text-[8px]">Save</span>
              </div>

              <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={handleShare}>
                <Share2 className="w-8 h-8" />
                <span className="text-[8px]">Share</span>
              </div>
            </div>

            {/* Synopsis Section */}
            <div className="text-white text-justify">
              <h3 className="text-xl font-bold mb-3">Synopsis</h3>
              <p className="text-gray-300 text-xs leading-relaxed">
                {story?.synopsis}
              </p>
            </div>
          </div>
        </div>

        {/* Episodes and Similar Stories */}
        <div className="space-y-8">
          {/* Episodes Section */}
          <div className="mb-8">
            <h2 className="text-base md:text-2xl text-white font-medium mb-4 px-4">
              Episodes
            </h2>
            <div className="flex overflow-x-auto scrollbar-hide px-4 space-x-4 pb-4">
              {episodes.map((episode) => (
                <StoryCard 
                  key={episode.id} 
                  storyData={episode}
                  isEpisode={true}
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
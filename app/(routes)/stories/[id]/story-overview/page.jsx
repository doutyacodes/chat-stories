"use client"
import React, { useState, useEffect } from 'react';
import { Heart, Bookmark, Share2, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import StoryUserActions from '../../_components/StoryUserActions';
import AgeWarningModal from '@/app/components/AgeWarningModal';


const BASE_IMAGE_URL = 'https://wowfy.in/testusr/images/';

const StoryOverview = () => {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [similarStories, setSimilarStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStoryForWarning, setSelectedStoryForWarning] = useState(null);
  const [showAgeWarningModal, setShowAgeWarningModal] = useState(false);

  const handleOpenStory = (targetStory) => {
    if (!targetStory) return;
    const rating = targetStory.age_rating || targetStory.ageRating || '13+';
    if (rating === '18+') {
      setSelectedStoryForWarning(targetStory);
      setShowAgeWarningModal(true);
    } else {
      const targetId = targetStory.story_id || targetStory.id || targetStory.storyId;
      router.push(`/stories/${targetId}/story-overview`);
    }
  };

  const confirmOpenStory = () => {
    if (selectedStoryForWarning) {
      const targetId = selectedStoryForWarning.story_id || selectedStoryForWarning.id || selectedStoryForWarning.storyId;
      router.push(`/stories/${targetId}/story-overview`);
    }
  };

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
    const isGame = storyData.story_type === 'game' || storyData.storyType === 'game' || storyData.type === 'game' || storyData.story_type === 'interactive';

    const handleClick = () => {
      if (isEpisode) {
        router.push(
          (story?.story_type === 'chat' || story?.story_type === 'game')
            ? `/stories/${storyData.id}/${id}/chat-story`
            : `/stories/${id}/normal-story`
        );
      } else {
        handleOpenStory(storyData);
      }
    };

    return (
      <div 
        className="flex-none w-32 md:w-56 cursor-pointer transition-transform hover:scale-105 group relative"
        onClick={handleClick}
      >
        {isEpisode ? (
          <div className="w-full h-28 md:h-44 bg-gray-800 rounded-2xl border-[6px] border-white mb-2 flex items-center justify-center">
            <span className="text-white text-xl"> 
              { `Episode ${storyData.episodeNumber}`}
            </span>
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
              className="w-full h-28 md:h-44 object-cover rounded-2xl border-[6px] border-white mb-2"
            />
          </div>
        )}
        <p className="text-xs md:text-sm text-center text-white font-medium line-clamp-2 group-hover:text-purple-400 transition-colors">
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
            <div className="relative mx-auto h-[300px] md:h-[95vh] overflow-hidden">
              <div className="relative h-full w-full"> 
                <img
                      src={`${BASE_IMAGE_URL}${story?.cover_img}`}
                      alt={story?.title}
                      className="w-full h-full object-cover"
                  />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 px-4 md:px-9 pb-4 md:pb-12">
                  <h2 className="text-white text-2xl md:text-5xl font-bold mb-2">
                  {story?.title}
                  </h2>
                  {/* <p className="text-white/90 text-sm md:text-xl max-w-3xl">
                  {story?.synopsis}
                  </p> */}
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
            {/* {story?.has_episodes ? 'Episodes' : 'Full Story'} */}
            Episodes
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

      <AgeWarningModal
        isOpen={showAgeWarningModal}
        onClose={() => setShowAgeWarningModal(false)}
        onConfirm={confirmOpenStory}
        story={selectedStoryForWarning}
      />
    </div>
  );
};

export default StoryOverview;
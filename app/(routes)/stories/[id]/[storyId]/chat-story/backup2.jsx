'use client';

import { useState, useEffect } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useParams, useRouter } from 'next/navigation';

const StorySlides = () => {
  const router = useRouter();
  const { storyId, id:episodeId } = useParams();
  const [slides, setSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slideContent, setSlideContent] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLastSlide, setIsLastSlide] = useState(false);
  const [nextEpisode, setNextEpisode] = useState(null);

  const BASE_IMAGE_URL = 'https://wowfy.in/testusr/images/';

  useEffect(() => {
    const fetchInitialSlides = async () => {
      try {
        const slidesResponse = await fetch(`/api/slides/${storyId}/${episodeId}`);
        if (!slidesResponse.ok) throw new Error('Failed to fetch slides');
        
        const slidesData = await slidesResponse.json();
        setSlides(slidesData.slides);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (storyId && episodeId) {
      fetchInitialSlides();
    }
  }, [storyId, episodeId]);

  const fetchSlideContent = async (slideId, slideType) => {
    try {
      setLoading(true);
      
      if (slideType === 'image') {
        const contentResponse = await fetch(`/api/slide-content/${slideId}`);
        if (!contentResponse.ok) throw new Error('Failed to fetch slide content');
        const contentData = await contentResponse.json();
        setSlideContent(contentData);
      } else if (slideType === 'chat') {
        const chatResponse = await fetch(`/api/chat-messages/${storyId}/${episodeId}`);
        if (!chatResponse.ok) throw new Error('Failed to fetch chat messages');
        const chatData = await chatResponse.json();
        setChatMessages(chatData);
      }
      
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleNextSlide = async () => {
    const nextIndex = currentSlideIndex + 1;
    
    if (nextIndex < slides.length) {
      await fetchSlideContent(slides[nextIndex].id, slides[nextIndex].slide_type);
      setCurrentSlideIndex(nextIndex);
    } else {
      try {
        const nextEpisodeResponse = await fetch(`/api/next-episode/${storyId}/${episodeId}`);
        if (nextEpisodeResponse.ok) {
          const nextEpisodeData = await nextEpisodeResponse.json();
          setNextEpisode(nextEpisodeData);
        }
      } catch (err) {
        console.error('Error fetching next episode:', err);
      }
      setIsLastSlide(true);
    }
  };

  const handlePreviousSlide = async () => {
    const prevIndex = currentSlideIndex - 1;
    
    if (prevIndex >= 0) {
      await fetchSlideContent(slides[prevIndex].id, slides[prevIndex].slide_type);
      setCurrentSlideIndex(prevIndex);
      setIsLastSlide(false);
    }
  };

  const handleNextEpisode = () => {
    if (nextEpisode) {
      router.push(`/stories/${nextEpisode.id}/${storyId}/chat-story`);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Error: {error}</p>
      </div>
    );
  }

  const currentSlide = slides[currentSlideIndex];

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      <div className="flex-1 relative">
        {currentSlide.slide_type === 'image' && slideContent && (
          <div className="h-full flex flex-col">
            <div className="relative flex-1">
              <img
                src={`${BASE_IMAGE_URL}${slideContent.media_url}`}
                alt="Slide Image"
                className="w-full h-full object-cover"
              />
              {slideContent.description && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4">
                  <p className="text-white text-lg">{slideContent.description}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {currentSlide.slide_type === 'chat' && chatMessages.length > 0 && (
          <div className="h-full flex flex-col overflow-y-auto p-4">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 max-w-xs ${
                  message.character.is_sender
                    ? 'self-end bg-green-700 text-white'
                    : 'self-start bg-gray-800 text-gray-300'
                } p-3 rounded-lg`}
              >
                <strong>{message.character.name}: </strong>
                <p>{message.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between p-4">
          {currentSlideIndex > 0 && (
            <button 
              onClick={handlePreviousSlide}
              className="bg-gray-700 p-2 rounded-full hover:bg-gray-600 transition-colors"
            >
              <FaArrowLeft className="text-white" />
            </button>
          )}

          {!isLastSlide ? (
            <button 
              onClick={handleNextSlide}
              className="ml-auto bg-gray-700 p-2 rounded-full hover:bg-gray-600 transition-colors"
            >
              <FaArrowRight className="text-white" />
            </button>
          ) : nextEpisode ? (
            <button 
              onClick={handleNextEpisode}
              className="ml-auto bg-blue-700 p-2 rounded-full hover:bg-blue-600 transition-colors"
            >
              Next Episode
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default StorySlides;
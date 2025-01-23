'use client';

import { useState, useEffect } from 'react';
import { FaVideo, FaPhone, FaEllipsisV, FaArrowLeft, FaArrowRight, FaArrowCircleRight } from 'react-icons/fa';
import { useParams, useRouter } from 'next/navigation';

const ChatPage = () => {
  const router = useRouter();
  const { id, storyId } = useParams();
  const [episode, setEpisode] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [currentDetailIndex, setCurrentDetailIndex] = useState(0);
  const [isMobileView, setIsMobileView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_IMAGE_URL = 'https://wowfy.in/testusr/images/';

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 640);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchEpisodeData = async () => {
      try {
        const response = await fetch(`/api/episodes/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch episode data');
        }

        const data = await response.json();
        setEpisode(data);

        // Track story view after 5 seconds
        setTimeout(() => {
          trackStoryView(storyId);
        }, 5000);

        // Track user read immediately
        trackUserRead(storyId);

      } catch (err) {
        console.error('Error fetching episode:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEpisodeData();
    }
  }, [id, storyId]);

  const trackStoryView = async (storyId) => {
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
      const response = await fetch('/api/analytics/story-views', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          story_id: storyId,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        console.error('Failed to record story view');
      }
    } catch (error) {
      console.error('Error recording view:', error);
    }
  };

  const trackUserRead = async (storyId) => {
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
      const response = await fetch('/api/analytics/user-reads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          story_id: storyId,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        console.error('Failed to record user read');
      }
    } catch (error) {
      console.error('Error recording user read:', error);
    }
  };

  const handleNextDetail = () => {
    if (currentDetailIndex < episode.details.length - 1) {
      setCurrentDetailIndex(prev => prev + 1);
    } else {
      setShowChat(true);
    }
  };

  const handlePrevDetail = () => {
    if (currentDetailIndex > 0) {
      setCurrentDetailIndex(prev => prev - 1);
    }
  };

  const handleNextEpisode = () => {
    if (episode.nextEpisode) {
      router.push(`/stories/${episode.nextEpisode.id}/${storyId}/chat-story`);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !episode) {
    return (
      <div className="h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Error loading episode: {error}</p>
      </div>
    );
  }

  // const CurrentDetail = () => {
  //   if (!episode.details?.length) return null;
    
  //   const detail = episode.details[currentDetailIndex];
    
  //   return (
  //     <div className="flex-1 bg-gray-900 p-6 overflow-y-auto">
  //       <div className="max-w-2xl mx-auto">
  //         <div className="relative bg-gray-800 rounded-lg p-4">
  //           {/* Navigation Arrows */}
  //           <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-4 z-10">
  //             {currentDetailIndex > 0 && (
  //               <button
  //                 onClick={handlePrevDetail}
  //                 className="bg-gray-700 p-2 rounded-full hover:bg-gray-600 transition-colors"
  //               >
  //                 <FaArrowLeft className="text-white" />
  //               </button>
  //             )}
  //             {(currentDetailIndex < episode.details.length - 1 || !showChat) && (
  //               <button
  //                 onClick={handleNextDetail}
  //                 className="bg-gray-700 p-2 rounded-full hover:bg-gray-600 transition-colors ml-auto"
  //               >
  //                 <FaArrowRight className="text-white" />
  //               </button>
  //             )}
  //           </div>

  //           {/* Media Content */}
  //           <div className="mb-4">
  //             {detail.media_type === 'video' ? (
  //               <video
  //                 src={`${BASE_IMAGE_URL}${detail.media_url}`}
  //                 controls
  //                 className="w-full rounded-lg"
  //               />
  //             ) : (
  //               <img
  //                 src={`${BASE_IMAGE_URL}${detail.media_url}`}
  //                 alt="Episode detail"
  //                 className="w-full rounded-lg"
  //               />
  //             )}
  //           </div>

  //           {/* Description */}
  //           <p className="text-white text-lg">{detail.description}</p>

  //           {/* Progress Indicators */}
  //           <div className="flex justify-center mt-4 gap-2">
  //             {episode.details.map((_, index) => (
  //               <div
  //                 key={index}
  //                 className={`h-2 w-2 rounded-full ${
  //                   index === currentDetailIndex ? 'bg-purple-600' : 'bg-gray-600'
  //                 }`}
  //               />
  //             ))}
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // };

  // const CurrentDetail = () => {
  //   if (!episode.details?.length) return null;
    
  //   const detail = episode.details[currentDetailIndex];
  //   const isMobileView = window.innerWidth < 640;
    
  //   return (
  //     <div className="flex-1 bg-gray-900 p-6 overflow-y-auto">
  //       <div className="max-w-4xl mx-auto h-[70vh] flex flex-col">
  //         <div className="relative bg-gray-800 rounded-lg p-4 flex-1">
  //           {/* Media Content */}
  //           <div className={`mb-4 ${isMobileView ? 'h-[60vh]' : 'h-full'}`}>
  //             {detail.media_type === 'video' ? (
  //               <video
  //                 src={`${BASE_IMAGE_URL}${detail.media_url}`}
  //                 controls
  //                 className="w-full h-full object-contain rounded-lg"
  //               />
  //             ) : (
  //               <img
  //                 src={`${BASE_IMAGE_URL}${detail.media_url}`}
  //                 alt="Episode detail"
  //                 className="w-full h-full object-contain rounded-lg"
  //               />
  //             )}
  //           </div>
  
  //           {/* Navigation Arrows */}
  //           <div className="absolute bottom-4 w-full flex justify-between px-4 z-10 left-0">
  //             {/* Left Arrow */}
  //             <div className="w-1/2 flex justify-start">
  //               {currentDetailIndex > 0 && (
  //                 <button
  //                   onClick={handlePrevDetail}
  //                   className="bg-gray-700 p-2 rounded-full hover:bg-gray-600 transition-colors"
  //                 >
  //                   <FaArrowLeft className="text-white" />
  //                 </button>
  //               )}
  //             </div>
              
  //             {/* Right Arrow */}
  //             <div className="w-1/2 flex justify-end">
  //               {(currentDetailIndex < episode.details.length - 1 || !showChat) && (
  //                 <button
  //                   onClick={handleNextDetail}
  //                   className="bg-gray-700 p-2 rounded-full hover:bg-gray-600 transition-colors"
  //                 >
  //                   <FaArrowRight className="text-white" />
  //                 </button>
  //               )}
  //             </div>
  //           </div>

  
  //           {/* Progress Indicators */}
  //           <div className="flex justify-center mt-4 gap-2">
  //             {episode.details.map((_, index) => (
  //               <div
  //                 key={index}
  //                 className={`h-2 w-2 rounded-full ${
  //                   index === currentDetailIndex ? 'bg-purple-600' : 'bg-gray-600'
  //                 }`}
  //               />
  //             ))}
  //           </div>
  //         </div>
  
  //         {/* Description */}
  //         <div className="mt-4 bg-gray-800 rounded-lg p-4">
  //           <p className="text-white text-lg">{detail.description}</p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // };

  const CurrentDetail = () => {
    if (!episode.details?.length) return null;
    
    const detail = episode.details[currentDetailIndex];
    const isMobileView = window.innerWidth < 640;
    
    return (
      <div className="flex-1 bg-gray-900 overflow-y-auto md:pt-28">
        <div className="relative h-full flex flex-col">
          {/* Header */}
          <div className="bg-gray-800 p-4">
            <h1 className="text-xl font-bold text-center">{episode.story.title}</h1>
            <p className="text-sm text-gray-400 text-center">Episode {episode.episode_number}</p>
          </div>
  
          {/* Media Section */}
          <div className="relative flex-1">
            <div className="relative h-[70vh]">
              {detail.media_type === 'video' ? (
                <video
                  src={`${BASE_IMAGE_URL}${detail.media_url}`}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="relative h-[70vh]">
                  <img
                    src={`${BASE_IMAGE_URL}${detail.media_url}`}
                    alt="Episode detail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4">
                    <p className="text-white text-lg">{detail.description}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Arrows */}
            <div className="w-full flex justify-between px-4 mt-5">
              {/* Left Arrow */}
                  <div className="w-1/2 flex justify-start">
                          {currentDetailIndex > 0 && (
                              <button
                              onClick={handlePrevDetail}
                              className={`bg-gray-700 p-2 rounded-full hover:bg-gray-600 transition-colors`}
                            >
                              <FaArrowLeft className="text-white" />
                            </button>
                              )}
                  </div>
            {/* Right Arrow */}
  <div className="w-1/2 flex justify-end">
  {(currentDetailIndex < episode.details.length - 1 || !showChat) && (
                <button
                  onClick={handleNextDetail}
                  className={`bg-gray-700 p-2 rounded-full hover:bg-gray-600 transition-colors`}
                >
                <FaArrowRight className="text-white" />
              </button>
              )}
  </div>
              
            </div>
        </div>
      </div>
    );
  };
  
  const ChatView = () => (
    <div className="flex-1 bg-gray-900 flex flex-col">
      {/* Navbar */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <img
            src={`${BASE_IMAGE_URL}${episode.story.image_url}`}
            alt="Profile"
            className="w-10 h-10 rounded-full mr-2"
          />
          <div>
            <h2 className="text-lg font-bold">{episode.story.title}</h2>
            <p className="text-sm text-gray-400">Episode {episode.episode_number}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-gray-300">
          <FaVideo className="w-5 h-5 cursor-pointer hover:text-white" title="Video Call" />
          <FaPhone className="w-5 h-5 cursor-pointer hover:text-white" title="Voice Call" />
          <FaEllipsisV className="w-5 h-5 cursor-pointer hover:text-white" title="Options" />
        </div>
      </div>
      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex flex-col space-y-4">
          {episode.messages.map((message) => (
            <div
              key={message.id}
              className={`relative p-3 rounded-lg max-w-xs ${
                message.is_sender
                  ? 'bg-green-700 text-white self-end'
                  : 'bg-gray-800 text-gray-300 self-start'
              }`}
            >
              <p>{message.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  return (
    <div className={`h-screen bg-gray-900 text-white flex flex-col sm:flex-row ${ showChat && 'md:pt-28'}`}>
      {/* Story Info Sidebar - Desktop only */}
      {!isMobileView && (
        <div className="w-1/4 min-w-[250px] bg-gray-800 p-4 border-r border-gray-700">
          <img
            src={`${BASE_IMAGE_URL}${episode.story.image_url}`}
            alt={episode.story.title}
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
          <h2 className="text-lg font-bold mb-2">{episode.story.title}</h2>
          <p className="text-sm text-gray-300">{episode.story.synopsis}</p>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 relative">
        {!showChat ? <CurrentDetail /> : 
        <>
          <ChatView />
            {/* Next Episode Button */}
            {episode.nextEpisode && (
              <div className="absolute w-full bottom-0 mb-20 md:mb-0 px-4 flex justify-end bg-gray-700">
                <button
                  onClick={handleNextEpisode}
                  className="bg-gray-700 p-2 rounded-full hover:bg-gray-600 transition-colors"
                >
                  <FaArrowCircleRight className="text-xl text-white" />
                </button>
              </div>
            )}
        </>

        }

      </div>
    </div>
  );
};

export default ChatPage;
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaVideo, FaPhone, FaEllipsisV } from 'react-icons/fa';
import { useParams } from 'next/navigation';

const ChatPage = () => {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [currentEpisodeId, setCurrentEpisodeId] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 640);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

useEffect(() => {
  // If there's only a general chat episode, show it automatically
  if (story && story.episodes.length === 1 && story.episodes[0].id === null) {
    setCurrentEpisodeId(0); // Using 0 for general chat
  }
}, [story]);

  useEffect(() => {
    const fetchStoryData = async () => {
      try {
        const response = await fetch(`/api/stories/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch story data');
        }

        const data = await response.json();
        setStory(data);
      } catch (err) {
        console.error('Error fetching story:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStoryData();
    }
  }, [id]);

  const handleEpisodeSelect = (episodeId) => {
    setCurrentEpisodeId(episodeId);
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Error loading story: {error}</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col sm:flex-row">
      {/* Sidebar */}
      {(currentEpisodeId === null || !isMobileView) && (
        <div className="sm:w-1/4 w-full bg-gray-800 p-4 border-r border-gray-700">
          <h2 className="text-lg font-bold mb-4">{story.title}</h2>
          <div className="ml-4 mt-2">
            {story.episodes[0].id === null ? (
              <div
                className="p-2 bg-gray-600 text-white rounded mb-2"
              >
                General Chat
              </div>
            ) : (
              story.episodes.map((episode) => (
                <div
                  key={episode.id}
                  onClick={() => handleEpisodeSelect(episode.id)}
                  className="p-2 bg-gray-600 hover:bg-gray-500 text-white cursor-pointer rounded mb-2"
                >
                  Episode {episode.episode_number}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Chat Window */}
      {(currentEpisodeId !== null || !isMobileView) && (
        <div className="flex flex-col w-full sm:w-3/4">
          {/* Navbar */}
          {currentEpisodeId && (
            <div className="bg-gray-800 p-4 flex items-center justify-between">
              <div className="flex items-center">
                <img
                  src={`https://wowfy.in/testusr/images/${story.image}`}
                  alt="Profile"
                  className="w-10 h-10 rounded-full mr-2"
                />
                <div>
                  <h2 className="text-lg font-bold">{story.title}</h2>
                  <p className="text-sm text-gray-400">Online</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-gray-300">
                <FaVideo className="w-5 h-5 cursor-pointer hover:text-white" title="Video Call" />
                <FaPhone className="w-5 h-5 cursor-pointer hover:text-white" title="Voice Call" />
                <FaEllipsisV className="w-5 h-5 cursor-pointer hover:text-white" title="Options" />
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 bg-gray-900 p-6 overflow-y-auto">
            {story.episodes[0].id === null ? (
              // For general chat
              <div className="flex flex-col space-y-4">
                {story.episodes[0].messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`relative p-3 rounded-lg max-w-xs ${
                      message.is_sender
                        ? 'bg-green-700 text-white self-end'
                        : 'bg-gray-800 text-gray-300 self-start'
                    }`}
                  >
                    <strong>{message.sender_name}: </strong>
                    <p>{message.content}</p>
                    {/* <p className="text-xs text-gray-400 absolute bottom-1 right-2">
                      {new Date(message.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit'
                      })}
                    </p> */}
                  </div>
                ))}
              </div>
            ) : currentEpisodeId ? (
              // For regular episodes
              <div className="flex flex-col space-y-4">
                {story.episodes
                  .find(ep => ep.id === parseInt(currentEpisodeId))
                  ?.messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`relative p-3 rounded-lg max-w-xs ${
                        message.is_sender
                          ? 'bg-green-700 text-white self-end'
                          : 'bg-gray-800 text-gray-300 self-start'
                      }`}
                    >
                      <strong>{message.sender_name}: </strong>
                      <p>{message.content}</p>
                      {/* <p className="text-xs text-gray-400 absolute bottom-1 right-2">
                        {new Date(message.created_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit'
                        })}
                      </p> */}
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center mt-6">Select an episode to view messages.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
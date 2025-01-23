'use client';

import { useState, useEffect } from 'react';
import { FaVideo, FaPhone, FaEllipsisV } from 'react-icons/fa';
import { useParams } from 'next/navigation';

const ChatPage = () => {
  const { id, storyId } = useParams(); // id is now episodeId, storyId for analytics
  const [episode, setEpisode] = useState(null);
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

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col sm:flex-row md:pt-28">
      {/* Story Info Sidebar - Only shown in desktop view */}
      {!isMobileView && (
        <div className="w-1/4 bg-gray-800 p-4 border-r border-gray-700">
          <img
            src={`${BASE_IMAGE_URL}${episode.story.image_url}`}
            alt={episode.story.title}
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
          <h2 className="text-lg font-bold mb-2">{episode.story.title}</h2>
          <p className="text-sm text-gray-300">{episode.story.synopsis}</p>
        </div>
      )}

      {/* Chat Window */}
      <div className="flex flex-col flex-1">
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
        <div className="flex-1 bg-gray-900 p-6 overflow-y-auto">
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
                <strong>{message.sender_name}: </strong>
                <p>{message.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
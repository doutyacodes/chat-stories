"use client"
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';

const StoryDisplayPage = () => {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [isEpisodesOpen, setIsEpisodesOpen] = useState(false);


  useEffect(() => {
    const fetchStoryData = async () => {
      try {
        const response = await fetch(`/api/stories/${id}/get-normal-story`, {
          // headers: {
          //   'Authorization': `Bearer ${localStorage.getItem('token')}`
          // }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch story data');
        }

        const data = await response.json();
        setStory(data);
        // Set first episode as default if episodes exist
        if (data.episodes && data.episodes.length > 0) {
          setSelectedEpisode(data.episodes[0]);
        }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1F2937]">
        <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1F2937] text-white">
        <div className="p-4 bg-[#EF4444] rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!story) return null;

  return (
    <div className="min-h-screen bg-[#1F2937] pb-12">
      {/* Hero Section with Cover Image */}
      <div className="relative h-96">
        <img
          src={`https://wowfy.in/testusr/images/${story.image}`}
          alt={story.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F2937] to-transparent" />
        
        {/* Title and Synopsis Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-4xl font-bold mb-2">{story.title}</h1>
          <p className="text-[#D1D5DB] text-lg">{story.synopsis}</p>
        </div>
      </div>

      {/* Episodes Section (if episodes exist) */}
      {story.episodes && story.episodes.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 mt-8">
          <button
            onClick={() => setIsEpisodesOpen(!isEpisodesOpen)}
            className="w-full flex items-center justify-between p-4 bg-[#374151] rounded-lg text-white hover:bg-[#4B5563] transition-colors"
          >
            <span className="font-semibold">Episodes</span>
            {isEpisodesOpen ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>

          {isEpisodesOpen && (
            <div className="mt-2 space-y-2 bg-[#374151] rounded-lg p-4">
              {story.episodes.map((episode) => (
                <button
                  key={episode.id}
                  onClick={() => setSelectedEpisode(episode)}
                  className={`w-full p-3 rounded text-left transition-colors ${
                    selectedEpisode?.id === episode.id
                      ? 'bg-[#7C3AED] text-white'
                      : 'bg-[#4B5563] text-[#D1D5DB] hover:bg-[#6B7280]'
                  }`}
                >
                  {episode.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Story Content */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="bg-[#374151] rounded-lg p-6">
          {story.episodes && story.episodes.length > 0 ? (
            selectedEpisode && (
              <div className="prose prose-invert max-w-none">
                <h2 className="text-2xl font-bold text-white mb-4">
                  {selectedEpisode.title}
                </h2>
                {selectedEpisode.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="text-[#D1D5DB] mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            )
          ) : (
            // Display full story if no episodes
            <div className="prose prose-invert max-w-none">
              {story.content.split('\n').map((paragraph, index) => (
                <p key={index} className="text-[#D1D5DB] mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryDisplayPage;
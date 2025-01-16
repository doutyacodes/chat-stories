"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-gray-800 p-8 rounded-lg shadow-xl flex flex-col items-center">
      <Loader2 className="h-12 w-12 text-purple-600 animate-spin" />
      <p className="mt-4 text-white text-lg">Saving story content...</p>
    </div>
  </div>
);

const NormalStoryContentForm = ({ params }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [episodes, setEpisodes] = useState([]);
  const { storyId } = use(params);

  const [contentData, setContentData] = useState({
    selectedEpisode: "",
    content: ""
  });

  useEffect(() => {
    fetchStoryData();
  }, [storyId]);

  const fetchStoryData = async () => {
    try {
      const response = await fetch(`/api/stories/${storyId}/data`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch story data');
      }
      const { episodes } = await response.json();
      setEpisodes(episodes);
    } catch (error) {
      setError("Failed to load story data. Please try again.");
      console.error("Error fetching story data:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validate episode selection if episodes exist
      if (episodes.length > 0 && !contentData.selectedEpisode) {
        setError("Please select an episode");
        setIsLoading(false);
        return;
      }

      // Validate content
      if (!contentData.content.trim()) {
        setError("Please enter story content");
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('storyId', storyId);
      formData.append('selectedEpisode', contentData.selectedEpisode);
      formData.append('content', contentData.content);
      formData.append('storyType', 'normal');

      const response = await fetch('/api/stories/normal-content', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to save story content');

      await response.json();
      router.push("/your-stories");
    } catch (error) {
      setError("Failed to save story content. Please try again.");
      console.error("Error saving story content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      {isLoading && <LoadingSpinner />}
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Add Story Content</h1>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Episode Selection - Only show if episodes exist */}
          {episodes.length > 0 && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <label className="block text-sm font-medium mb-2">Select Episode</label>
              <select
                value={contentData.selectedEpisode}
                onChange={(e) => setContentData(prev => ({ ...prev, selectedEpisode: e.target.value }))}
                className="w-full p-3 rounded-lg bg-gray-700 focus:ring-2 focus:ring-purple-600"
              >
                <option value="">Select an episode</option>
                {episodes.map(episode => (
                  <option key={episode.id} value={episode.id}>
                    {episode.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Story Content Input */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Story Content</h2>
            <textarea
              value={contentData.content}
              onChange={(e) => setContentData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Write your story content here..."
              className="w-full p-4 rounded-lg bg-gray-700 focus:ring-2 focus:ring-purple-600 min-h-[300px]"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 
              disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold text-lg 
              transition duration-200"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving Content...
              </span>
            ) : (
              "Save Story Content"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NormalStoryContentForm;
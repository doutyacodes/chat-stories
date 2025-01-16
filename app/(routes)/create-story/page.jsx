"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// LoadingSpinner Component
const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-gray-800 p-8 rounded-lg shadow-xl flex flex-col items-center">
      <Loader2 className="h-12 w-12 text-purple-600 animate-spin" />
      <p className="mt-4 text-white text-lg">Creating your story...</p>
    </div>
  </div>
);

const CreateStoryForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);

  // Story Details State
  const [storyData, setStoryData] = useState({
    storyName: "",
    storySynopsis: "",
    category: "",
    storyType: "chat", // Default to chat story
    coverImage: null,
    coverImagePreview: null,
    episodes: [],
    characters: ["", ""],
    characterSenders: [true, false],
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      setError("Failed to load categories. Please try again later.");
      console.error("Error fetching categories:", error);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setStoryData(prev => ({
          ...prev,
          coverImage: file,
          coverImagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Character Handlers
  const handleCharacterChange = (index, value) => {
    const updatedCharacters = [...storyData.characters];
    updatedCharacters[index] = value;
    setStoryData(prev => ({ ...prev, characters: updatedCharacters }));
  };

  const handleAddCharacter = () => {
    setStoryData(prev => ({
      ...prev,
      characters: [...prev.characters, ""],
      characterSenders: [...prev.characterSenders, false]
    }));
  };

  const handleSenderToggle = (index) => {
    setStoryData(prev => ({
      ...prev,
      characterSenders: prev.characterSenders.map((isSender, i) => i === index ? true : false)
    }));
  };

  const handleRemoveCharacter = (index) => {
    if (storyData.characters.length <= 2) {
      setError("Minimum two characters are required");
      return;
    }
    
    const newCharacters = storyData.characters.filter((_, i) => i !== index);
    const newSenders = storyData.characterSenders.filter((_, i) => i !== index);
    
    if (storyData.characterSenders[index]) {
      newSenders[0] = true;
    }
    
    setStoryData(prev => ({
      ...prev,
      characters: newCharacters,
      characterSenders: newSenders
    }));
  };

  // Episode Handlers
  const handleEpisodeChange = (index, field, value) => {
    const updatedEpisodes = [...storyData.episodes];
    updatedEpisodes[index][field] = value;
    setStoryData(prev => ({ ...prev, episodes: updatedEpisodes }));
  };

  const handleAddEpisode = () => {
    setStoryData(prev => ({
      ...prev,
      episodes: [...prev.episodes, { name: "", synopsis: "" }]
    }));
  };

  const handleRemoveEpisode = (index) => {
    setStoryData(prev => ({
      ...prev,
      episodes: prev.episodes.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    if (!storyData.storyName.trim()) {
      setError("Story name is required");
      return false;
    }
    if (!storyData.storySynopsis.trim()) {
      setError("Story synopsis is required");
      return false;
    }
    if (!storyData.category) {
      setError("Please select a category");
      return false;
    }
    if (!storyData.coverImage) {
      setError("Please upload a cover image");
      return false;
    }

    // Only validate characters for chat stories
    if (storyData.storyType === "chat") {
      const validCharacters = storyData.characters.filter(char => char.trim());
      if (validCharacters.length < 2) {
        setError("Please add at least two characters with names");
        return false;
      }
    }
    
    return true;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append('storyName', storyData.storyName);
      formData.append('storySynopsis', storyData.storySynopsis);
      formData.append('category', storyData.category);
      formData.append('storyType', storyData.storyType);
      formData.append('coverImage', storyData.coverImage);
      formData.append('episodes', JSON.stringify(storyData.episodes));

      // Only include characters data for chat stories
      if (storyData.storyType === "chat") {
        const charactersWithSender = storyData.characters.map((char, index) => ({
          name: char,
          is_sender: storyData.characterSenders[index]
        }));
        formData.append('characters', JSON.stringify(charactersWithSender));
      }

      const response = await fetch('/api/stories', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to create story');

      await response.json();
      router.push("/your-stories");
    } catch (error) {
      setError("Failed to create story. Please try again.");
      console.error("Error creating story:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      {isLoading && <LoadingSpinner />}
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create Your Story</h1>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Story Type Selection */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Story Type</h2>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStoryData(prev => ({ ...prev, storyType: "chat" }))}
                className={`px-6 py-3 rounded-lg transition ${
                  storyData.storyType === "chat"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                Chat Story
              </button>
              <button
                type="button"
                onClick={() => setStoryData(prev => ({ ...prev, storyType: "normal" }))}
                className={`px-6 py-3 rounded-lg transition ${
                  storyData.storyType === "normal"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                Normal Story
              </button>
            </div>
          </div>

          {/* Basic Details */}
          <div className="bg-gray-800 p-6 rounded-lg space-y-4">
            <h2 className="text-xl font-semibold mb-4">Basic Details</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">Story Name</label>
              <input
                type="text"
                value={storyData.storyName}
                onChange={(e) => setStoryData(prev => ({ ...prev, storyName: e.target.value }))}
                className="w-full p-3 rounded-lg bg-gray-700 focus:ring-2 focus:ring-purple-600"
                placeholder="Enter story name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Synopsis</label>
              <textarea
                value={storyData.storySynopsis}
                onChange={(e) => setStoryData(prev => ({ ...prev, storySynopsis: e.target.value }))}
                className="w-full p-3 rounded-lg bg-gray-700 focus:ring-2 focus:ring-purple-600 h-32"
                placeholder="Write your story synopsis"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={storyData.category}
                onChange={(e) => setStoryData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-3 rounded-lg bg-gray-700 focus:ring-2 focus:ring-purple-600"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cover Image */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Cover Image</h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full p-3 rounded-lg bg-gray-700"
                />
                <p className="text-sm text-gray-400 mt-2">Maximum file size: 5MB</p>
              </div>
              {storyData.coverImagePreview && (
                <div className="w-32 h-32">
                  <img
                    src={storyData.coverImagePreview}
                    alt="Cover Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Episodes Section */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Episodes (Optional)</h2>
              <button
                type="button"
                onClick={handleAddEpisode}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm"
              >
                Add Episode
              </button>
            </div>
            
            <div className="space-y-4">
              {storyData.episodes.map((episode, index) => (
                <div key={index} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium">Episode {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => handleRemoveEpisode(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Episode Name"
                      value={episode.name}
                      onChange={(e) => handleEpisodeChange(index, 'name', e.target.value)}
                      className="w-full p-3 rounded-lg bg-gray-600 focus:ring-2 focus:ring-purple-600"
                    />
                    <textarea
                      placeholder="Episode Synopsis"
                      value={episode.synopsis}
                      onChange={(e) => handleEpisodeChange(index, 'synopsis', e.target.value)}
                      className="w-full p-3 rounded-lg bg-gray-600 focus:ring-2 focus:ring-purple-600 h-24"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Characters Section */}
          {/* Characters Section - Only show for chat stories */}
          {storyData.storyType === "chat" && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Characters</h2>
                <button
                  type="button"
                  onClick={handleAddCharacter}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm"
                >
                  Add Character
                </button>
              </div>
              
              <div className="space-y-3">
                {storyData.characters.map((character, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-3">
                    <input
                      type="text"
                      value={character}
                      onChange={(e) => handleCharacterChange(index, e.target.value)}
                      placeholder={`Character ${index + 1}`}
                      className="flex-1 p-3 rounded-lg bg-gray-700 focus:ring-2 focus:ring-purple-600"
                    />
                    <button
                      type="button"
                      onClick={() => handleSenderToggle(index)}
                      className={`px-4 py-2 rounded-lg transition ${
                        storyData.characterSenders[index]
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      Sender
                    </button>
                    {index >= 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCharacter(index)}
                        className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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
                Creating Story...
              </span>
            ) : (
              "Create Story"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateStoryForm;
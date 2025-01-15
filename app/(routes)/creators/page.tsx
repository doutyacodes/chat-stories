"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const CreateStoryPage = () => {
  const router = useRouter();
  const [storyId, setStoryId] = useState(null); // State to store the storyId
  const [addedCharacters, setAddedCharacters] = useState(null)
  const [currentStep, setCurrentStep] = useState("details");
  const [error, setError] = useState("");

  // Story Details State
  const [storyData, setStoryData] = useState({
    storyName: "",
    storySynopsis: "",
    category: "",
    coverImage: null,
    coverImagePreview: null,
    episodes: [],
    characters: ["", ""], // Initialize with two empty character fields
    characterSenders: [true, false], // Add this new line - first character is default sender
  });

  // Story Content State
  // const [contentData, setContentData] = useState({
  //   selectedEpisode: "",
  //   storyLines: [{ character: "", line: "" }],
  // });

  const [contentData, setContentData] = useState({
    selectedEpisode: "",
    inputType: "manual", // "manual" or "pdf"
    storyLines: [{ character: "", line: "" }],
    pdfFile: null
  });

  // Categories State
  const [categories, setCategories] = useState([]);

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

  // Image Upload Handler with Preview
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
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

  // Story Details Validation
  const validateDetails = () => {
    setError("");

    // Required fields validation
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

    // Character validation - at least two characters required
    const validCharacters = storyData.characters.filter(char => char.trim());
    if (validCharacters.length < 2) {
      setError("Please add at least two characters with names");
      return false;
    }

    // Cover image validation
    if (!storyData.coverImage) {
      setError("Please upload a cover image");
      return false;
    }

    return true;
  };

  const handleSubmitDetails = async () => {
    if (!validateDetails()) return;

    try {
      const formData = new FormData();
      formData.append('storyName', storyData.storyName);
      formData.append('storySynopsis', storyData.storySynopsis);
      formData.append('category', storyData.category);
      formData.append('coverImage', storyData.coverImage);
      formData.append('episodes', JSON.stringify(storyData.episodes));

      // Create characters array with sender information
      const charactersWithSender = storyData.characters.map((char, index) => ({
        name: char,
        is_sender: storyData.characterSenders[index]
      }));

      formData.append('characters', JSON.stringify(charactersWithSender));


      const response = await fetch('/api/stories', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to save story details');

      const data = await response.json();
       // Save the storyId to state
      setStoryId(data.storyId);
      setAddedCharacters(data.characters)

      setCurrentStep("content");
    } catch (error) {
      setError("Failed to save story details. Please try again.");
      console.error("Error saving story details:", error);
    }
  };

  const handleEpisodeChange = (index, field, value) => {
    const updatedEpisodes = [...storyData.episodes];
    updatedEpisodes[index][field] = value;
    setStoryData((prev) => ({ ...prev, episodes: updatedEpisodes }));
  };

  const handleAddEpisode = () => {
    setStoryData((prev) => ({
      ...prev,
      episodes: [...prev.episodes, { name: "", synopsis: "" }],
    }));
  };

  const handleRemoveEpisode = (index) => {
    setStoryData((prev) => ({
      ...prev,
      episodes: prev.episodes.filter((_, i) => i !== index),
    }));
  };


  // Character Handlers
  const handleCharacterChange = (index, value) => {
    const updatedCharacters = [...storyData.characters];
    updatedCharacters[index] = value;
    setStoryData(prev => ({ ...prev, characters: updatedCharacters }));
  };

  // Modify the handleAddCharacter function
  const handleAddCharacter = () => {
    setStoryData(prev => ({
      ...prev,
      characters: [...prev.characters, ""],
      characterSenders: [...prev.characterSenders, false]
    }));
  };

  // Add a new handler for sender toggle
const handleSenderToggle = (index) => {
  setStoryData(prev => ({
    ...prev,
    characterSenders: prev.characterSenders.map((isSender, i) => i === index ? true : false)
  }));
};

// Modify the handleRemoveCharacter function
const handleRemoveCharacter = (index) => {
  if (storyData.characters.length <= 2) {
    setError("Minimum two characters are required");
    return;
  }
  
  const newCharacters = storyData.characters.filter((_, i) => i !== index);
  const newSenders = storyData.characterSenders.filter((_, i) => i !== index);
  
  // If we removed the sender, make the first character the sender
  if (storyData.characterSenders[index]) {
    newSenders[0] = true;
  }
  
  setStoryData(prev => ({
    ...prev,
    characters: newCharacters,
    characterSenders: newSenders
  }));
};

  const handleRemoveLine = (index) => {
    setContentData((prev) => ({
      ...prev,
      storyLines: prev.storyLines.filter((_, i) => i !== index),
    }));
  };

  const handleLineChange = (index, field, value) => {
    const updatedLines = [...contentData.storyLines];
    updatedLines[index][field] = value;
    setContentData((prev) => ({ ...prev, storyLines: updatedLines }));
  };

  // Story Content Handlers
  const handleAddLine = () => {
    setContentData((prev) => ({
      ...prev,
      storyLines: [...prev.storyLines, { character: "", line: "" }],
    }));
  };

    // Add the new PDF upload handler
    const handlePDFUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          setError("PDF size should be less than 10MB");
          return;
        }
  
        if (file.type !== "application/pdf") {
          setError("Please upload a PDF file");
          return;
        }
  
        setContentData(prev => ({
          ...prev,
          pdfFile: file
        }));
      }
    };

  // Content Submission
  // const handleSubmitContent = async () => {
  //   try {

  //     const payload = {
  //       ...contentData,
  //       storyId: storyId,
  //     };

  //     const response = await fetch('/api/stories/content', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(payload),
  //     });

  //     if (!response.ok) throw new Error('Failed to save story content');

  //     await response.json();
  //     router.push("/home");
  //   } catch (error) {
  //     setError("Failed to save story content. Please try again.");
  //     console.error("Error saving story content:", error);
  //   }
  // };

  const handleSubmitContent = async () => {
    try {
      if (!contentData.selectedEpisode) {
        setError("Please select an episode");
        return;
      }

      const formData = new FormData();
      formData.append('storyId', storyId);
      formData.append('selectedEpisode', contentData.selectedEpisode);
      formData.append('inputType', contentData.inputType);

      if (contentData.inputType === "manual") {
        formData.append('storyLines', JSON.stringify(contentData.storyLines));
      } else {
        if (!contentData.pdfFile) {
          setError("Please upload a PDF file");
          return;
        }
        formData.append('pdfFile', contentData.pdfFile);
      }

      const response = await fetch('/api/content', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to save story content');

      await response.json();
      router.push("/home");
    } catch (error) {
      setError("Failed to save story content. Please try again.");
      console.error("Error saving story content:", error);
    }
  };

  if (currentStep === "details") {
    return (
      <div className="bg-gray-900 text-white min-h-screen p-8">
        <h1 className="text-3xl font-bold mb-6">Create Your Story</h1>
        
        {error && (
          <div className="bg-red-500 text-white p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Story Name */}
          <input
            type="text"
            placeholder="Story Name"
            value={storyData.storyName}
            onChange={(e) => setStoryData(prev => ({ ...prev, storyName: e.target.value }))}
            className="w-full p-3 rounded bg-gray-800 text-white"
          />

          {/* Story Synopsis */}
          <textarea
            placeholder="Synopsis of Story"
            value={storyData.storySynopsis}
            onChange={(e) => setStoryData(prev => ({ ...prev, storySynopsis: e.target.value }))}
            className="w-full p-4 rounded bg-gray-800 text-white h-24"
          />

          {/* Cover Image Upload with Preview */}
          <div>
            <label className="block text-lg font-semibold mb-2">Cover Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full p-2 rounded bg-gray-800"
            />
            {storyData.coverImagePreview && (
              <div className="mt-4">
                <img 
                  src={storyData.coverImagePreview} 
                  alt="Cover Preview" 
                  className="w-32 h-32 object-cover rounded-md"
                />
              </div>
            )}
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-lg font-semibold mb-2">Category:</label>
            <select
              value={storyData.category}
              onChange={(e) => setStoryData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full p-3 rounded bg-gray-800"
            >
              <option value="">Select a category</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>

        {/* Episodes */}
         <div>
           <label className="text-lg font-semibold mb-2 block">Episodes:</label>
           {storyData.episodes.map((episode, index) => (
            <div key={index} className="space-y-3 mb-4">
              <input
                type="text"
                placeholder={`Episode ${index + 1} Name`}
                value={episode.name}
                onChange={(e) => handleEpisodeChange(index, 'name', e.target.value)}
                className="w-full p-3 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <textarea
                placeholder={`Episode ${index + 1} Synopsis`}
                value={episode.synopsis}
                onChange={(e) => handleEpisodeChange(index, 'synopsis', e.target.value)}
                className="w-full p-4 rounded bg-gray-800 text-white h-24 focus:outline-none focus:ring-2 focus:ring-purple-600"
              ></textarea>
              {index > 0 && (
                <button
                  onClick={() => handleRemoveEpisode(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✖ Remove Episode
                </button>
              )}
            </div>
          ))}
          <button
            onClick={handleAddEpisode}
            className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold"
          >
            + Add Episode
          </button>
        </div>

          {/* Characters */}
            <div>
              {storyData.characters.map((character, index) => (
                <div key={index} className="flex items-center space-x-3 mb-3">
                  <input
                    type="text"
                    value={character}
                    onChange={(e) => handleCharacterChange(index, e.target.value)}
                    placeholder={`Character ${index + 1}`}
                    className="w-full p-2 rounded bg-gray-800"
                  />
                  <button
                    onClick={() => handleSenderToggle(index)}
                    className={`px-3 py-1 rounded ${
                      storyData.characterSenders[index]
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    Sender
                  </button>
                  {index >= 2 && (
                    <button 
                      onClick={() => handleRemoveCharacter(index)}
                      className="text-red-500 hover:text-red-400"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              <button 
                onClick={handleAddCharacter}
                className="mt-2 bg-green-600 px-4 py-2 rounded-md hover:bg-green-700"
              >
                Add Character
              </button>
          </div>


          <button
            onClick={handleSubmitDetails}
            className="bg-purple-600 px-6 py-3 rounded-md font-bold text-lg mt-4 hover:bg-purple-700"
          >
            Continue to Story Content
          </button>
        </div>
      </div>
    );
  }
  

  return (
    <div className="bg-gray-900 text-white min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Add Story Content</h1>
      
      {error && (
        <div className="bg-red-500 text-white p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Episode Selection */}
        <select
          value={contentData.selectedEpisode}
          onChange={(e) => setContentData(prev => ({ ...prev, selectedEpisode: e.target.value }))}
          className="w-full p-3 rounded bg-gray-800 mb-4"
        >
          <option value="">Select an episode</option>
          {storyData.episodes.map((ep, index) => (
            <option key={index} value={ep.name}>{ep.name}</option>
          ))}
        </select>

        {/* Input Type Toggle */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setContentData(prev => ({ ...prev, inputType: "manual" }))}
            className={`px-4 py-2 rounded-md ${
              contentData.inputType === "manual"
                ? "bg-purple-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            Manual Entry
          </button>
          <button
            onClick={() => setContentData(prev => ({ ...prev, inputType: "pdf" }))}
            className={`px-4 py-2 rounded-md ${
              contentData.inputType === "pdf"
                ? "bg-purple-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            Upload PDF
          </button>
        </div>

        {contentData.inputType === "manual" ? (
          // Manual Entry Section
          <div className="space-y-4">
            {contentData.storyLines.map((line, index) => (
              <div key={index} className="space-y-3 mb-4">
                <select
                  value={line.character}
                  onChange={(e) => handleLineChange(index, "character", e.target.value)}
                  className="w-full p-3 rounded bg-gray-800"
                >
                  <option value="">Select a character</option>
                  {addedCharacters.map(({id, name}) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
                <textarea
                  value={line.line}
                  onChange={(e) => handleLineChange(index, "line", e.target.value)}
                  placeholder="Add line"
                  className="w-full p-4 rounded bg-gray-800 h-24"
                />
                {index > 0 && (
                  <button 
                    onClick={() => handleRemoveLine(index)}
                    className="text-red-500 hover:text-red-400"
                  >
                    Remove Line
                  </button>
                )}
              </div>
            ))}

            <button 
              onClick={handleAddLine}
              className="mt-2 bg-green-600 px-4 py-2 rounded-md hover:bg-green-700"
            >
              Add Line
            </button>
          </div>
        ) : (
          // PDF Upload Section
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".pdf"
                onChange={handlePDFUpload}
                className="hidden"
                id="pdfUpload"
              />
              <label
                htmlFor="pdfUpload"
                className="cursor-pointer block"
              >
                <div className="space-y-2">
                  <p className="text-lg">Click to upload PDF</p>
                  <p className="text-sm text-gray-400">Maximum file size: 10MB</p>
                </div>
              </label>
              {contentData.pdfFile && (
                <p className="mt-2 text-green-500">
                  File selected: {contentData.pdfFile.name}
                </p>
              )}
            </div>
          </div>
        )}

        <button
          onClick={handleSubmitContent}
          className="bg-purple-600 px-6 py-3 rounded-md font-bold text-lg mt-4 hover:bg-purple-700"
        >
          Save Story
        </button>
      </div>
    </div>
  );
};

export default CreateStoryPage;
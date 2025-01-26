"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, X, Plus, Image, Video } from "lucide-react";

// LoadingSpinner Component (same as before)
const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-gray-800 p-8 rounded-lg shadow-xl flex flex-col items-center">
      <Loader2 className="h-12 w-12 text-purple-600 animate-spin" />
      <p className="mt-4 text-white text-lg">Saving story content...</p>
    </div>
  </div>
);

const StoryContentForm = ({ params }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [episodes, setEpisodes] = useState([]);
  const [characters, setCharacters] = useState([]);
  const { storyId } = use(params); // Unwrap the params object

  const [contentData, setContentData] = useState({
    selectedEpisode: "",
    inputType: "manual",
    storyLines: [{ character: "", line: "" }],
    pdfFile: null,
    episodeDetails: [] // New state for episode details
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
    const { episodes, characters } = await response.json();

    setEpisodes(episodes);
    setCharacters(characters);
    } catch (error) {
      setError("Failed to load story data. Please try again.");
      console.error("Error fetching story data:", error);
    }
  };

  const handleLineChange = (index, field, value) => {
    const updatedLines = [...contentData.storyLines];
    updatedLines[index][field] = value;
    setContentData(prev => ({ ...prev, storyLines: updatedLines }));
  };

  const handleAddLine = () => {
    setContentData(prev => ({
      ...prev,
      storyLines: [...prev.storyLines, { character: "", line: "" }]
    }));
  };

  const handleRemoveLine = (index) => {
    if (contentData.storyLines.length === 1) return;
    setContentData(prev => ({
      ...prev,
      storyLines: prev.storyLines.filter((_, i) => i !== index)
    }));
  };

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

  const handleAddEpisodeDetail = () => {
    setContentData(prev => ({
      ...prev,
      episodeDetails: [
        ...prev.episodeDetails,
        {
          mediaType: "image", // Default to image
          mediaFile: null,
          description: "",
          order: prev.episodeDetails.length + 1,
          position: "before" // Default position
        }
      ]
    }));
  };

  const handleRemoveEpisodeDetail = (index) => {
    setContentData(prev => ({
      ...prev,
      episodeDetails: prev.episodeDetails.filter((_, i) => i !== index)
    }));
  };

  const handleEpisodeDetailChange = (index, field, value) => {
    const updatedDetails = [...contentData.episodeDetails];
    updatedDetails[index][field] = value;
    setContentData(prev => ({ ...prev, episodeDetails: updatedDetails }));
  };

  const handleMediaUpload = (index, file) => {
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size should be less than 10MB");
      return;
    }

    // Validate file type
    const fileType = file.type.split('/')[0];
    if (fileType !== 'image' && fileType !== 'video') {
      setError("Please upload an image or video file");
      return;
    }

    const updatedDetails = [...contentData.episodeDetails];
    updatedDetails[index].mediaFile = file;
    updatedDetails[index].mediaType = fileType;
    setContentData(prev => ({ ...prev, episodeDetails: updatedDetails }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validate episode details if any exist
      if (contentData.episodeDetails.length > 0) {
        const hasIncompleteDetail = contentData.episodeDetails.some(
          detail => !detail.mediaFile || !detail.description.trim()
        );
        if (hasIncompleteDetail) {
          setError("Please complete all episode details with both media and description");
          setIsLoading(false);
          return;
        }
      }

      const formData = new FormData();
      formData.append('storyId', storyId);
      formData.append('selectedEpisode', contentData.selectedEpisode);
      formData.append('inputType', contentData.inputType);

      // Add story lines or PDF based on input type
      if (contentData.inputType === "manual") {
        formData.append('storyLines', JSON.stringify(contentData.storyLines));
      } else {
        formData.append('pdfFile', contentData.pdfFile);
      }

      // Add episode details
      formData.append('episodeDetails', JSON.stringify(
        contentData.episodeDetails.map(detail => ({
          mediaType: detail.mediaType,
          description: detail.description,
          order: detail.order,
          position: detail.position // New field
        }))
      ));

      // Append media files separately
      contentData.episodeDetails.forEach((detail, index) => {
        if (detail.mediaFile) {
          formData.append(`mediaFile${index}`, detail.mediaFile);
        }
      });

      const response = await fetch('/api/stories/chat-content', {
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
                  <option key={episode.id} value={episode.id}>{episode.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Input Type Selection */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Content Type</h2>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setContentData(prev => ({ ...prev, inputType: "manual" }))}
                className={`px-6 py-3 rounded-lg transition ${
                  contentData.inputType === "manual"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                Manual Entry
              </button>
              <button
                type="button"
                onClick={() => setContentData(prev => ({ ...prev, inputType: "pdf" }))}
                className={`px-6 py-3 rounded-lg transition ${
                  contentData.inputType === "pdf"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                Upload PDF
              </button>
            </div>
          </div>

          {/* Episode Details Section */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Episode Details</h2>
              <button
                type="button"
                onClick={handleAddEpisodeDetail}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm"
              >
                <Plus className="h-4 w-4" />
                Add Detail
              </button>
            </div>

            <div className="space-y-6">
              {contentData.episodeDetails.map((detail, index) => (
                <div key={index} className="bg-gray-700 p-4 rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Detail {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => handleRemoveEpisodeDetail(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Position Selection */}
                  <div className="flex items-center space-x-4 mb-4">
                    <label className="text-sm">Position:</label>
                    <div className="flex items-center space-x-2">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          value="before"
                          checked={detail.position === "before"}
                          onChange={() => handleEpisodeDetailChange(index, "position", "before")}
                          className="form-radio text-purple-600"
                        />
                        <span className="ml-2">Before Story</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          value="after"
                          checked={detail.position === "after"}
                          onChange={() => handleEpisodeDetailChange(index, "position", "after")}
                          className="form-radio text-purple-600"
                        />
                        <span className="ml-2">After Story</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Media Upload */}
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-4">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => handleMediaUpload(index, e.target.files[0])}
                        className="hidden"
                        id={`mediaUpload${index}`}
                      />
                      <label
                        htmlFor={`mediaUpload${index}`}
                        className="cursor-pointer block text-center"
                      >
                        {detail.mediaFile ? (
                          <div className="flex items-center justify-center gap-2 text-green-500">
                            {detail.mediaType === 'image' ? (
                              <Image className="h-6 w-6" />
                            ) : (
                              <Video className="h-6 w-6" />
                            )}
                            <span>{detail.mediaFile.name}</span>
                          </div>
                        ) : (
                          <div className="text-gray-400">
                            <Upload className="mx-auto h-8 w-8 mb-2" />
                            <p>Click to upload image or video</p>
                            <p className="text-sm">Maximum file size: 10MB</p>
                          </div>
                        )}
                      </label>
                    </div>

                    {/* Description */}
                    <textarea
                      value={detail.description}
                      onChange={(e) => handleEpisodeDetailChange(index, "description", e.target.value)}
                      placeholder="Enter description for this scene..."
                      className="w-full p-3 rounded-lg bg-gray-600 focus:ring-2 focus:ring-purple-600 h-24"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Input Section */}
          <div className="bg-gray-800 p-6 rounded-lg">
            {contentData.inputType === "manual" ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Story Lines</h2>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm"
                  >
                    Add Line
                  </button>
                </div>

                {contentData.storyLines.map((line, index) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Line {index + 1}</h3>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <select
                      value={line.character}
                      onChange={(e) => handleLineChange(index, "character", e.target.value)}
                      className="w-full p-3 rounded-lg bg-gray-600 focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="">Select a character</option>
                      {characters.map(char => (
                        <option key={char.id} value={char.id}>{char.name}</option>
                      ))}
                    </select>

                    <textarea
                      value={line.line}
                      onChange={(e) => handleLineChange(index, "line", e.target.value)}
                      placeholder="Enter the character's line"
                      className="w-full p-3 rounded-lg bg-gray-600 focus:ring-2 focus:ring-purple-600 h-24"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-8">
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
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg mb-2">Click to upload PDF</p>
                    <p className="text-sm text-gray-400">Maximum file size: 10MB</p>
                  </label>
                  {contentData.pdfFile && (
                    <p className="mt-4 text-green-500">
                      Selected: {contentData.pdfFile.name}
                    </p>
                  )}
                </div>
              </div>
            )}
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

export default StoryContentForm;
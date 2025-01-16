"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";

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
    pdfFile: null
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Only validate episode selection if episodes exist
      if (episodes.length > 0 && !contentData.selectedEpisode) {
        setError("Please select an episode");
        return;
      }

      const formData = new FormData();
      formData.append('storyId', storyId);
      formData.append('selectedEpisode', contentData.selectedEpisode);
      formData.append('inputType', contentData.inputType);

      if (contentData.inputType === "manual") {
        // Validate that at least one line has both character and content
        const hasValidLine = contentData.storyLines.some(
          line => line.character && line.line.trim()
        );
        if (!hasValidLine) {
          setError("Please add at least one complete story line");
          return;
        }
        formData.append('storyLines', JSON.stringify(contentData.storyLines));
      } else {
        if (!contentData.pdfFile) {
          setError("Please upload a PDF file");
          return;
        }
        formData.append('pdfFile', contentData.pdfFile);
      }

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
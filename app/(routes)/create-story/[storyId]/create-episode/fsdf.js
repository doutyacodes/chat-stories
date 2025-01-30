"use client"

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Plus, X, Upload } from "lucide-react";

const CreateEpisode = () => {
  const router = useRouter();
  const { storyId } = useParams();
  const [error, setError] = useState("");
  const [characters, setCharacters] = useState([]);
  const [fetchedCharacters, setFetchedCharacters] = useState([]); // Store fetched characters
  const [slides, setSlides] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [ episodeData, setEpisodeData] = useState({
    name: "",
    synopsis: "",
    slideType: "",
    slides: []
  });

  console.log(episodeData)

  const slideTypes = [
    { value: "image", label: "Image Slide" },
    { value: "chat", label: "Chat Slide" },
    { value: "quiz", label: "Quiz Slide" }
  ];

    useEffect(() => {
        fetchCharacters();
    }, []);


    const handleAddSlide = (type) => {
        const defaultCharacterCount = 2; // Minimum required characters

        const fetchedCount = fetchedCharacters.length;
        const emptySlotsToAdd = Math.max(0, defaultCharacterCount - fetchedCount);
    
        // Create empty character objects based on remaining slots
        const emptyCharacters = Array.from({ length: emptySlotsToAdd }, (_, index) => ({
        name: "",
        isSender: index === 0 && fetchedCount === 0 // Default first empty character as sender if no fetched characters
        }));
    
        // Merge fetched and empty characters
        const mergedCharacters =
        type === "chat"
            ? [
                ...fetchedCharacters.map((char) => ({
                name: char.name,
                isSender: char.is_sender // Map API is_sender to isSender
                })),
                ...emptyCharacters
            ]
            : [];
    
        const newSlide = {
        type,
        content: type === "quiz" ? {
          media: null,
          question: "",
          options: [
            { text: "", is_correct: false },
            { text: "", is_correct: false }
          ],
          audio: null // Add audio field
        } : type === "image"
            ? { 
              media: null, 
              description: "",
              audio: null // Add audio field
              }
            : {
                characters: mergedCharacters,
                inputType: "manual",
                storyLines: [{ character: "", line: "" }],
                pdfFile: null,
                audio: null 
              }
        };
    
        setEpisodeData((prev) => ({
        ...prev,
        slides: [...prev.slides, newSlide]
        }));
    };
    

  const handleRemoveSlide = (index) => {
    const updatedSlides = episodeData.slides.filter((_, i) => i !== index);
    setEpisodeData(prev => ({ ...prev, slides: updatedSlides }));
  };

  const handleImageSlideChange = (index, field, value) => {
    const updatedSlides = [...episodeData.slides];
    updatedSlides[index].content[field] = value;
    setEpisodeData(prev => ({ ...prev, slides: updatedSlides }));
  };

  const handleImageUpload = (index, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleImageSlideChange(index, 'media', {
          file: file,
          preview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 md:pt-28">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create Episode</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Episode Basic Details */}
          <div className="bg-gray-800 p-6 rounded-lg space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Episode Name</label>
              <input
                type="text"
                value={episodeData.name}
                onChange={(e) => setEpisodeData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 rounded-lg bg-gray-700 focus:ring-2 focus:ring-purple-600"
                placeholder="Enter episode name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Episode Synopsis</label>
              <textarea
                value={episodeData.synopsis}
                onChange={(e) => setEpisodeData(prev => ({ ...prev, synopsis: e.target.value }))}
                className="w-full p-3 rounded-lg bg-gray-700 focus:ring-2 focus:ring-purple-600 h-24"
                placeholder="Brief description of the episode"
              />
            </div>
          </div>

          {/* Slide Types Selector */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Add Slides</h2>
            <div className="flex gap-4 mb-6">
              {slideTypes.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleAddSlide(type.value)}
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg"
                >
                  Add {type.label}
                </button>
              ))}
            </div>

            {/* Slides Preview and Edit */}
            {episodeData.slides.map((slide, index) => (
              <React.Fragment key={`slide-${index}`}>
                    <div
                        className="p-4 bg-gray-700 text-white rounded-lg shadow-md flex justify-between items-center"
                    >
                        <h1 className="text-3xl font-bold">
                            Slide {index + 1}
                        </h1>
                        <span className="text-sm italic">{slide.type}</span>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg mb-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-medium capitalize">{slide.type} Slide</h3>
                          <button
                              type="button"
                              onClick={() => handleRemoveSlide(index)}
                              className="text-red-400 hover:text-red-300"
                          >
                              <X className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="mb-6">
                          <label className="block text-sm font-medium mb-2">Audio (Optional)</label>
                          <div className="flex items-center gap-4">
                            <input
                              type="file"
                              accept="audio/*"
                              onChange={(e) => handleAudioUpload(index, e.target.files[0])}
                              className="hidden"
                              id={`audio-${index}`}
                            />
                            <label 
                              htmlFor={`audio-${index}`}
                              className="flex items-center gap-2 px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 cursor-pointer"
                            >
                              <Upload className="h-5 w-5" />
                              <span>Upload Audio</span>
                            </label>
                            
                            {slide.content.audio && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{slide.content.audio.name}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAudio(index)}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {slide.type === 'image' && (
                        <div className="space-y-4">
                            {/* Image Upload */}
                            <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(index, e.target.files[0])}
                                className="hidden"
                                id={`imageUpload-${index}`}
                                />
                                <label 
                                htmlFor={`imageUpload-${index}`} 
                                className="w-full p-3 rounded-lg bg-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-500 transition"
                                >
                                <Upload className="mr-2 h-5 w-5" />
                                {slide.content.media ? 'Change Image' : 'Upload Image/Gif'}
                                </label>
                            </div>
                            {slide.content.media && (
                                <div className="w-32 h-32">
                                <img 
                                    src={slide.content.media.preview} 
                                    alt="Preview" 
                                    className="w-full h-full object-cover rounded-lg" 
                                />
                                </div>
                            )}
                            </div>
                            
                            {/* Image Description */}
                            <textarea
                            value={slide.content.description}
                            onChange={(e) => handleImageSlideChange(index, 'description', e.target.value)}
                            placeholder="Optional image description"
                            className="w-full p-3 rounded-lg bg-gray-600 focus:ring-2 focus:ring-purple-600 h-24"
                            />
                        </div>
                        )}

                        {slide.type === 'quiz' && (
                          <div className="space-y-4">
                            {/* Image Upload (same as image slide) */}
                            <div className="flex items-center gap-4">
                              {/* Reuse image upload code from image slide */}
                                <div className="flex-1">
                                  <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(index, e.target.files[0])}
                                  className="hidden"
                                  id={`imageUpload-${index}`}
                                  />
                                  <label 
                                  htmlFor={`imageUpload-${index}`} 
                                  className="w-full p-3 rounded-lg bg-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-500 transition"
                                  >
                                  <Upload className="mr-2 h-5 w-5" />
                                  {slide.content.media ? 'Change Image' : 'Upload Image'}
                                  </label>
                                </div>
                                  {slide.content.media && (
                                  <div className="w-32 h-32">
                                      <img 
                                          src={slide.content.media.preview} 
                                          alt="Preview" 
                                          className="w-full h-full object-cover rounded-lg" 
                                      />
                                      </div>
                                  )}
                            </div>

                            {/* Question Input */}
                            <input
                              type="text"
                              value={slide.content.question}
                              onChange={(e) => handleQuizChange(index, 'question', e.target.value)}
                              placeholder="Enter question"
                              className="w-full p-3 rounded-lg bg-gray-600"
                            />

                            {/* Options */}
                            {slide.content.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-4 bg-gray-600 p-3 rounded-lg">
                                <input
                                  type="text"
                                  value={option.text}
                                  onChange={(e) => handleOptionChange(index, optIndex, 'text', e.target.value)}
                                  placeholder={`Option ${optIndex + 1}`}
                                  className="flex-1 p-2 rounded-lg bg-gray-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => toggleCorrectAnswer(index, optIndex)}
                                  className={`px-4 py-2 rounded-lg ${
                                    option.is_correct ? 'bg-green-600' : 'bg-gray-500'
                                  }`}
                                >
                                  Correct
                                </button>
                                {slide.content.options.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOption(index, optIndex)}
                                    className="text-red-500 hover:text-red-400"
                                  >
                                    <X className="h-5 w-5" />
                                  </button>
                                )}
                              </div>
                            ))}

                            {slide.content.options.length < 4 && (
                              <button
                                type="button"
                                onClick={() => handleAddOption(index)}
                                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                              >
                                Add Option
                              </button>
                            )}
                          </div>
                        )}
                    </div>
                </React.Fragment>
            ))}
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateEpisode;
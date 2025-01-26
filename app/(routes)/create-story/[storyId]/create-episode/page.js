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

  const [ episodeData, setEpisodeData] = useState({
    name: "",
    synopsis: "",
    slideType: "",
    slides: []
  });

  console.log(episodeData)

  const slideTypes = [
    { value: "image", label: "Image Slide" },
    { value: "chat", label: "Chat Slide" }
  ];

    useEffect(() => {
        fetchCharacters();
    }, []);

    const fetchCharacters = async () => {
        try {
        const response = await fetch(`/api/stories/${storyId}/characters`);
        if (!response.ok) throw new Error('Failed to fetch characters');
        const data = await response.json();
        setFetchedCharacters(data.characters); // Store fetched characters in state
        } catch (error) {
        setError("Failed to load characters");
        console.error(error);
        }
    };
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
        content:
            type === "image"
            ? { media: null, description: "" }
            : {
                characters: mergedCharacters,
                inputType: "manual",
                storyLines: [{ character: "", line: "" }],
                pdfFile: null
                }
        };
    
        setEpisodeData((prev) => ({
        ...prev,
        slides: [...prev.slides, newSlide]
        }));
    };
    
  const handleInputTypeChange = (index, inputType) => {
    setEpisodeData(prev => {
      const updatedSlides = prev.slides.map((slide, i) =>
        i === index
          ? { ...slide, content: { ...slide.content, inputType } }
          : slide
      );
      return { ...prev, slides: updatedSlides };
    });
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

  const handleAddCharacter = (slideIndex) => {
    const updatedSlides = [...episodeData.slides];
    updatedSlides[slideIndex].content.characters.push({ name: "", isSender: false });
    setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
  };
  
  const handleRemoveCharacter = (slideIndex, charIndex) => {
    const updatedSlides = [...episodeData.slides];
    const characters = updatedSlides[slideIndex].content.characters;
  
    // Ensure minimum of 2 characters
    if (characters.length > 2) {
      characters.splice(charIndex, 1);
      updatedSlides[slideIndex].content.characters = characters;
      setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
    }
  };

  const handleSetSender = (slideIndex, characterIndex) => {
    const updatedSlides = [...episodeData.slides];
  
    updatedSlides[slideIndex].content.characters = updatedSlides[slideIndex].content.characters.map((char, index) => ({
      ...char,
      isSender: index === characterIndex, // Only the selected character becomes the sender
    }));
  
    setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
  };

  const handleChatCharacterChange = (slideIndex, characterIndex, field, value) => {
    const updatedSlides = [...episodeData.slides];
    updatedSlides[slideIndex].content.characters[characterIndex][field] = value;
  
    setEpisodeData((prev) => ({
      ...prev,
      slides: updatedSlides,
    }));
  };
  
  const handleAddChatCharacter = (slideIndex) => {
    const updatedSlides = [...episodeData.slides];
    updatedSlides[slideIndex].content.characters.push({
      name: "",
      isSender: false
    });
    setEpisodeData(prev => ({ ...prev, slides: updatedSlides }));
  };

  const handleLineChange = (slideIndex, lineIndex, field, value) => {
    const updatedSlides = [...episodeData.slides];
    updatedSlides[slideIndex].content.storyLines[lineIndex][field] = value;
    setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
  };

  const handleAddLine = (slideIndex) => {
    const updatedSlides = [...episodeData.slides];
    updatedSlides[slideIndex].content.storyLines.push({ character: "", line: "" });
    setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
  };

  const handleRemoveLine = (slideIndex, lineIndex) => {
    const updatedSlides = [...episodeData.slides];
    const storyLines = updatedSlides[slideIndex].content.storyLines;
  
    if (storyLines.length > 1) {
      storyLines.splice(lineIndex, 1);
      updatedSlides[slideIndex].content.storyLines = storyLines;
      setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
    }
  };

  const handlePDFUpload = (slideIndex, event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("PDF size should be less than 10MB");
        return;
      }
  
      if (file.type !== "application/pdf") {
        setError("Please upload a PDF file");
        return;
      }
  
      const updatedSlides = [...episodeData.slides];
      updatedSlides[slideIndex].content.pdfFile = file;
      setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
    }
  };
  
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError("");
  
  //   // Basic validation
  //   if (!episodeData.name.trim()) {
  //     setError("Episode name is required");
  //     return;
  //   }
  
  //   const formData = new FormData();
  //   formData.append('storyId', storyId);
  //   formData.append('name', episodeData.name);
  //   formData.append('synopsis', episodeData.synopsis);
  //   formData.append('slides', JSON.stringify(slides));
  //   formData.append('characters', JSON.stringify(
  //     slides
  //       .filter(slide => slide.type === 'chat')
  //       .flatMap(slide => slide.content.characters)
  //   ));
  
  //   slides.forEach((slide, index) => {
  //     if (slide.type === 'image' && slide.content.media.file) {
  //       formData.append(`slides[${index}].file`, slide.content.media.file);
  //     }
  //     if (slide.type === 'chat' && slide.content.pdfFile) {
  //       formData.append(`slides[${index}].pdfFile`, slide.content.pdfFile);
  //     }
  //   });
    
  //   try {
  //     const response = await fetch('/api/stories/story-slides', {
  //       method: 'POST',
  //       body: formData, // Send the FormData
  //     });
  
  //     if (!response.ok) throw new Error('Failed to create episode');
  
  //     router.push('/your-stories');
  //   } catch (error) {
  //     setError("Failed to create episode. Please try again.");
  //     console.error(error);
  //   }
  // };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    // Basic validation
    if (!episodeData.name.trim()) {
      setError("Episode name is required");
      return;
    }
  
    const formData = new FormData();
    formData.append('storyId', storyId);
    formData.append('name', episodeData.name);
    formData.append('synopsis', episodeData.synopsis);
    
    // Correctly set slides and characters
    formData.append('slides', JSON.stringify(episodeData.slides));
    formData.append('characters', JSON.stringify(
      episodeData.slides
        .filter(slide => slide.type === 'chat')
        .flatMap(slide => slide.content.characters)
    ));
  
    episodeData.slides.forEach((slide, index) => {
      if (slide.type === 'image' && slide.content.media?.file) {
        formData.append(`slides[${index}].file`, slide.content.media.file);
      }
      if (slide.type === 'chat' && slide.content.pdfFile) {
        formData.append(`slides[${index}].pdfFile`, slide.content.pdfFile);
      }
    });
    
    try {
      const response = await fetch('/api/stories/story-slides', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) throw new Error('Failed to create episode');
  
      router.push('/your-stories');
    } catch (error) {
      setError("Failed to create episode. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
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
                            
                            {/* Image Description */}
                            <textarea
                            value={slide.content.description}
                            onChange={(e) => handleImageSlideChange(index, 'description', e.target.value)}
                            placeholder="Optional image description"
                            className="w-full p-3 rounded-lg bg-gray-600 focus:ring-2 focus:ring-purple-600 h-24"
                            />
                        </div>
                        )}

                        {slide.type === 'chat' && (
                        <div className="space-y-4">
                            {/* Characters Section */}
                            <div>
                            {slide.content.characters.map((character, charIndex) => (
                                <div key={charIndex} className="bg-gray-600 p-3 rounded-lg mb-2">
                                    <div className="flex gap-4 items-center">
                                        <input
                                        type="text"
                                        value={character.name}
                                        onChange={(e) =>
                                            handleChatCharacterChange(index, charIndex, "name", e.target.value)
                                        }
                                        placeholder="Character Name"
                                        className="flex-1 p-2 rounded-lg bg-gray-500"
                                        />
                                        <button
                                        type="button"
                                        onClick={() => handleSetSender(index, charIndex)}
                                        className={`px-4 py-2 rounded-lg ${
                                            character.isSender
                                            ? "bg-green-600 hover:bg-green-700"
                                            : "bg-gray-500 hover:bg-gray-600"
                                        }`}
                                        >
                                        {character.isSender ? "Sender" : "Set as Sender"}
                                        </button>
                                        {slide.content.characters.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveCharacter(index, charIndex)}
                                            className="text-red-500 hover:text-red-400 px-4 py-2 rounded-lg"
                                        >
                                            Remove
                                        </button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={() => handleAddCharacter(index)}
                                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg mt-4"
                            >
                                Add Character
                            </button>
                            </div>


                            {/* Input Type Selection */}
                            <div className="bg-gray-800 p-6 rounded-lg">
                                <h2 className="text-xl font-semibold mb-4">Content Type</h2>
                                <div className="flex gap-4">
                                    <button
                                    type="button"
                                    onClick={() => handleInputTypeChange(index, "manual")} // Use the correct index
                                    className={`px-6 py-3 rounded-lg transition ${
                                        slide.content.inputType === "manual"
                                        ? "bg-purple-600 text-white"
                                        : "bg-gray-700 text-gray-300"
                                    }`}
                                    >
                                    Manual Entry
                                    </button>
                                    <button
                                    type="button"
                                    onClick={() => handleInputTypeChange(index, "pdf")} // Use the correct index
                                    className={`px-6 py-3 rounded-lg transition ${
                                        slide.content.inputType === "pdf"
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
                                {slide.content.inputType === "manual" ? (
                                <div className="space-y-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">Story Lines</h2>
                                    <button
                                    type="button"
                                    onClick={() => handleAddLine(index)}
                                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm"
                                    >
                                    Add Line
                                    </button>
                                </div>

                                {slide.content.storyLines.map((line, lineIndex) => (
                                    <div key={lineIndex} className="bg-gray-700 p-4 rounded-lg space-y-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-medium">Line {lineIndex + 1}</h3>
                                            {lineIndex > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveLine(index, lineIndex)}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                Remove
                                            </button>
                                            )}
                                        </div>

                                    <select
                                        value={line.character}
                                        onChange={(e) =>
                                        handleLineChange(index, lineIndex, "character", e.target.value)
                                        }
                                        className="w-full p-3 rounded-lg bg-gray-600 focus:ring-2 focus:ring-purple-600"
                                    >
                                        <option value="">Select a character</option>
                                        {slide.content.characters.map((char, keyIndex) => (
                                            <option key={keyIndex} value={char.name}>
                                                {char.name}
                                            </option>
                                        ))}
                                    </select>

                                    <textarea
                                        value={line.line}
                                        onChange={(e) =>
                                        handleLineChange(index, lineIndex, "line", e.target.value)
                                        }
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
                                    onChange={(e) => handlePDFUpload(index, e)}
                                    className="hidden"
                                    id={`pdfUpload-${index}`}
                                    />
                                    <label htmlFor={`pdfUpload-${index}`} className="cursor-pointer block">
                                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <p className="text-lg mb-2">Click to upload PDF</p>
                                    <p className="text-sm text-gray-400">Maximum file size: 10MB</p>
                                    </label>
                                    {slide.content.pdfFile && (
                                    <p className="mt-4 text-green-500">Selected: {slide.content.pdfFile.name}</p>
                                    )}
                                </div>
                                </div>
                            )}
                            </div>
                        </div>
                        )}
                    </div>
                </React.Fragment>
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold text-lg transition duration-200"
          >
            Create Episode
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEpisode;
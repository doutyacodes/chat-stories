"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Plus, X, Upload, ArrowUp, ArrowDown } from "lucide-react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const EditEpisode = () => {
  const router = useRouter();
  const { storyId } = useParams();
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState("");
  const [error, setError] = useState("");
  const [fetchedCharacters, setFetchedCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [episodeData, setEpisodeData] = useState({
    id: "",
    name: "",
    synopsis: "",
    slides: [],
  });
  const [modifications, setModifications] = useState({
    nameModified: false,
    synopsisModified: false,
    slides: {},
  });

  console.log('modifications', modifications)

  const BASE_IMAGE_URL = 'https://wowfy.in/testusr/images/';
  const BASE_VIDEO_URL = 'https://wowfy.in/testusr/videos/';
  const BASE_AUDIO_URL = 'https://wowfy.in/testusr/audio/';

  useEffect(() => {
    fetchEpisodes();
  }, []);

  const fetchEpisodes = async () => {
    try {
      const response = await fetch(`/api/episodes/${storyId}/fetch-episodes`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!response.ok) throw new Error("Failed to fetch episodes");
      const data = await response.json();
      setEpisodes(data);
    } catch (error) {
      setError("Failed to load episodes");
      console.error(error);
    }
  };

  const fetchEpisodeDetails = async (episodeId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/episodes/${episodeId}/fetch-edit-data`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!response.ok) throw new Error("Failed to fetch episode details");
      const data = await response.json();

      const processedSlides = data.slides.map((slide) => ({
        id: String(slide.id),
        type: slide.type,
        position: slide.position,
        content:
          slide.type === "image"
            ? {
                media: slide.content.media
                  ? { 
                      preview: slide.content.media.type === 'video'
                      ? `${BASE_VIDEO_URL}${slide.content.media.preview}`
                      : `${BASE_IMAGE_URL}${slide.content.media.preview}`,
                      type: slide.content.media.type,
                      file: null
                    }
                  : null,
                description: slide.content.description || "",
                audio: slide.content.audio ? { name: slide.content.audio.name } : null
              }
            : slide.type === "chat"
            ? {
                characters: slide.content.characters.map((char) => ({
                  name: char.name,
                  isSender: char.isSender,
                })),
                inputType: slide.content.inputType || "manual",
                storyLines: slide.content.storyLines.map((line) => ({
                  character: line.character || "",
                  line: line.line || "",
                })),
                pdfFile: slide.content.pdfFile ? { name: slide.content.pdfFile.name } : null,
                audio: slide.content.audio ? { name: slide.content.audio.name } : null
              }
            : slide.type === "quiz"
            ? {
                media: slide.content.media
                  ? { 
                    preview: slide.content.media.type === 'video'
                      ? `${BASE_VIDEO_URL}${slide.content.media.preview}`
                      : `${BASE_IMAGE_URL}${slide.content.media.preview}`,
                    type: slide.content.media.type,
                    file: null
                    }
                  : null,
                question: slide.content.question || "",
                options: slide.content.options.map((option) => ({
                  text: option.text || "",
                  is_correct: !!option.is_correct,
                })),
                audio: slide.content.audio ? { name: slide.content.audio.name } : null
              }
            : {},
      }));

      setEpisodeData({
        id: data.id,
        name: data.name,
        synopsis: data.synopsis,
        slides: processedSlides,
      });
      setModifications({
        nameModified: false,
        synopsisModified: false,
        slides: {}, // Reset modifications tracking
      });
    } catch (error) {
      setError("Failed to load episode details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEpisodeId) {
      fetchEpisodeDetails(selectedEpisodeId);
      fetchCharacters();
    }
  }, [selectedEpisodeId]);

  const fetchCharacters = async () => {
    try {
      const response = await fetch(`/api/stories/${storyId}/characters`);
      if (!response.ok) throw new Error("Failed to fetch characters");
      const data = await response.json();
      setFetchedCharacters(data.characters);
    } catch (error) {
      setError("Failed to load characters");
      console.error(error);
    }
  };

  // const handleDragEnd = (result) => {
  //   if (!result.destination) return;
    
  //   const items = Array.from(episodeData.slides);
  //   const [reorderedItem] = items.splice(result.source.index, 1);
  //   items.splice(result.destination.index, 0, reorderedItem);
    
  //   const updatedSlides = items.map((slide, index) => ({ 
  //     ...slide, 
  //     position: index 
  //   }));
    
  //   setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
    
  //   // Track position changes for all affected slides
  //   const newModifications = { ...modifications };
  //   const startIdx = Math.min(result.source.index, result.destination.index);
  //   const endIdx = Math.max(result.source.index, result.destination.index);
    
  //   updatedSlides.slice(startIdx, endIdx + 1).forEach((slide) => {
  //     newModifications.slides[slide.id] = {
  //       ...newModifications.slides[slide.id],
  //       positionModified: true,
  //       previousPosition: result.source.index,
  //       newPosition: slide.position
  //     };
  //   });
    
  //   setModifications(newModifications);
  // };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(episodeData.slides);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    const updatedSlides = items.map((slide, index) => ({ 
      ...slide, 
      position: index 
    }));
    
    setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
    
    // Enhanced position change tracking
    const newModifications = { ...modifications };
    updatedSlides.forEach((slide, index) => {
      const originalIndex = episodeData.slides.findIndex(s => s.id === slide.id);
      if (originalIndex !== index) {
        newModifications.slides[slide.id] = {
          ...newModifications.slides[slide.id],
          positionModified: true,
          previousPosition: originalIndex,
          newPosition: index
        };
      }
    });
    
    setModifications(newModifications);
  };

  const handleAddSlide = (type) => {
    const newSlideId = `temp-${Date.now()}`;
    const defaultCharacterCount = 2;
    const emptyCharacters = Array.from({ length: defaultCharacterCount }, (_, index) => ({
      name: "",
      isSender: index === 0,
    }));
    
    const newSlide = {
      id: newSlideId,
      type,
      position: episodeData.slides.length,
      isNew: true, // Add this flag
      content:
        type === "image"
          ? { media: null, description: "", audio: null }
          : type === "quiz"
          ? {
              media: null,
              question: "",
              options: [{ text: "", is_correct: false }, { text: "", is_correct: false }],
              audio: null,
            }
          : {
              characters: emptyCharacters,
              inputType: "manual",
              storyLines: [{ character: "", line: "" }],
              pdfFile: null,
              audio: null,
            },
    };
    
    setEpisodeData((prev) => ({ ...prev, slides: [...prev.slides, newSlide] }));
    
    // Update modifications state to track the new slide
    setModifications((prev) => ({
      ...prev,
      slides: { 
        ...prev.slides, 
        [newSlideId]: { 
          isNew: true,
          type: type,
          position: episodeData.slides.length,
          contentModified: true,
          initialContent: true // Add this to track that this is the initial content
        } 
      },
    }));
  };

  const handleRemoveSlide = async (index) => {
    const slideToRemove = episodeData.slides[index];
    if (!slideToRemove.id.startsWith("temp-")) {
      try {
        const response = await fetch(`/api/slides/${slideToRemove.id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Failed to delete slide");
      } catch (error) {
        setError("Failed to delete slide");
        console.error(error);
        return;
      }
    }
    const updatedSlides = episodeData.slides.filter((_, i) => i !== index);
    setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
  };

  // const handleMediaUpload = async (index, file) => {
  //   if (file) {
  //     try {
  //       const reader = new FileReader();
  //       reader.onloadend = () => {
  //         const updatedSlides = [...episodeData.slides];
  //         updatedSlides[index].content.media = {
  //           file: file,
  //           preview: reader.result,
  //           type: file.type.split("/")[0],
  //         };
  //         setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
  //         setModifications((prev) => ({
  //           ...prev,
  //           slides: { ...prev.slides, [updatedSlides[index].id]: { mediaModified: true } },
  //         }));
  //       };
  //       reader.readAsDataURL(file);
  //     } catch (error) {
  //       setError("Failed to upload media");
  //       console.error(error);
  //     }
  //   }
  // };

  const validateImage = (file) => {
    if (file.type.startsWith("video/")) return true; // Skip validation for videos
  
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
  
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        const width = img.width;
        const height = img.height;
  
        // Validate 4:5 aspect ratio for any type
        const aspectRatio = width / height;
        const expectedRatio = 4 / 5;
        const tolerance = 0.1; // 10% tolerance
  
        if (Math.abs(aspectRatio - expectedRatio) > tolerance) {
          reject("Image must have a 4:5 aspect ratio (recommended: 1080x1350px)");
        } else if (width < 1080 || height < 1350) {
          reject("Image resolution is too low. Recommended: 1080x1350px");
        }
  
        resolve(true);
      };
  
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject("Error loading image");
      };
    });
  };
  

  const handleMediaUpload = async (index, file) => {
    if (file) {

      try {

        // Only validate images (skip validation for videos/gifs)
        if (file.type.startsWith('image/') && !file.type.includes('gif')) {
          await validateImage(file);
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          const updatedSlides = [...episodeData.slides];
          const currentSlide = updatedSlides[index];
          const prevMediaType = currentSlide.content.media?.type;
          const prevMediaPath = currentSlide.content.media?.preview;
          const newMediaType = file.type.split("/")[0];
          
          updatedSlides[index].content.media = {
            file: file,
            preview: reader.result,
            type: newMediaType,
          };
          
          setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
          
          // Enhanced media modification tracking
          setModifications((prev) => ({
            ...prev,
            slides: { 
              ...prev.slides, 
              [currentSlide.id]: { 
                ...prev.slides[currentSlide.id],
                mediaModified: true,
                mediaTypeChanged: prevMediaType !== newMediaType,
                prevMediaType,
                prevMediaPath,
                newMediaType,
                fileChanged: true
              } 
            },
          }));
        };
        reader.readAsDataURL(file);
      } catch (error) {
        setError(error);
        // console.error(error);
      }
    }
  };

  const handleQuizOptionChange = (slideIndex, optionIndex, field, value) => {
    const updatedSlides = [...episodeData.slides];
    const currentSlide = updatedSlides[slideIndex];
    const prevValue = currentSlide.content.options[optionIndex][field];
    
    currentSlide.content.options[optionIndex][field] = value;
    
    setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
    
    // Enhanced option modification tracking
    setModifications((prev) => ({
      ...prev,
      slides: { 
        ...prev.slides, 
        [currentSlide.id]: { 
          ...prev.slides[currentSlide.id],
          optionsModified: true,
          optionChanges: {
            ...(prev.slides[currentSlide.id]?.optionChanges || {}),
            [optionIndex]: {
              field,
              prevValue,
              newValue: value,
              modified: true
            }
          }
        } 
      },
    }));
  };
 // Issue 2: Fix story line change tracking
  const handleStoryLineChange = (slideIndex, lineIndex, field, value) => {
    const updatedSlides = [...episodeData.slides];
    const currentSlide = updatedSlides[slideIndex];
    
    if (!currentSlide.content.storyLines[lineIndex]) {
      currentSlide.content.storyLines[lineIndex] = {};
    }
    currentSlide.content.storyLines[lineIndex][field] = value;
    
    setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
    
    // Enhanced modification tracking
    setModifications((prev) => ({
      ...prev,
      slides: { 
        ...prev.slides, 
        [currentSlide.id]: { 
          ...prev.slides[currentSlide.id],
          contentModified: true,
          storyLineChanges: {
            ...(prev.slides[currentSlide.id]?.storyLineChanges || {}),
            [lineIndex]: {
              ...(prev.slides[currentSlide.id]?.storyLineChanges?.[lineIndex] || {}),
              [field]: value,
              modified: true
            }
          }
        } 
      },
    }));
  };

  const handleAudioUpload = (index, file) => {
    if (file) {
      const updatedSlides = [...episodeData.slides];
      updatedSlides[index].content.audio = { file: file, name: file.name };
      setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
      setModifications((prev) => ({
        ...prev,
        slides: { ...prev.slides, [updatedSlides[index].id]: { audioModified: true } },
      }));
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError("");
  //   setLoading(true);
  //   try {
  //     const formData = new FormData();
  //     formData.append("storyId", storyId);
  //     formData.append("episodeId", episodeData.id);
  //     if (modifications.nameModified) formData.append("name", episodeData.name);
  //     if (modifications.synopsisModified) formData.append("synopsis", episodeData.synopsis);

  //     const modifiedSlides = Object.entries(modifications.slides)
  //       .filter(([_, changes]) => Object.values(changes).some((v) => v))
  //       .map(([slideId, changes]) => ({
  //         id: slideId,
  //         changes,
  //         ...episodeData.slides.find((s) => s.id === slideId),
  //       }));

  //     formData.append("modifiedSlides", JSON.stringify(modifiedSlides));

  //     for (const slide of modifiedSlides) {
  //       if (slide.content.media?.file) {
  //         const mediaPath = await uploadMediaToCPanel(slide.content.media.file);
  //         console.log("niggera", mediaPath)
  //         slide.content.media = { ...slide.content.media, file: mediaPath };
  //       }
  //       if (slide.content.audio?.file) {
  //         const audioPath = await uploadAudioToCPanel(slide.content.audio.file);
  //         slide.content.audio = { ...slide.content.audio, file: audioPath };
  //       }
  //       if (slide.content.pdfFile) {
  //         formData.append(`slides.${slide.id}.pdfFile`, slide.content.pdfFile);
  //       }
  //     }

  //     // console.log('submittede formData', formData)
  //     const formObject = {};
  //     formData.forEach((value, key) => {
  //       if (formObject[key]) {
  //         formObject[key] = [].concat(formObject[key], value); // Convert to array if multiple values exist
  //       } else {
  //         formObject[key] = value;
  //       }
  //     });
  //     console.log('submittede formData',formObject);

  //     const response = await fetch(`/api/episodes/${episodeData.id}/update-episode`, {
  //       headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  //       method: "PUT",
  //       body: formData,
  //     });
  //     if (!response.ok) throw new Error("Failed to update episode");
  //     // router.push("/your-stories");
  //   } catch (error) {
  //     setError("Failed to update episode. Please try again.");
  //     console.error(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("storyId", storyId);
      formData.append("episodeId", episodeData.id);
      if (modifications.nameModified) formData.append("name", episodeData.name);
      if (modifications.synopsisModified) formData.append("synopsis", episodeData.synopsis);
  
      let modifiedSlides = Object.entries(modifications.slides)
        .filter(([_, changes]) => Object.values(changes).some((v) => v))
        .map(([slideId, changes]) => ({
          id: slideId,
          changes,
          ...episodeData.slides.find((s) => s.id === slideId),
        }));
  
      // **Upload media & audio before appending to FormData**
      for (const slide of modifiedSlides) {
        if (slide.content.media?.file) {
          const mediaPath = await uploadMediaToCPanel(slide.content.media.file);
          slide.content.media.file = mediaPath; // Update file path
        }
        if (slide.content.audio?.file) {
          const audioPath = await uploadAudioToCPanel(slide.content.audio.file);
          slide.content.audio.file = audioPath; // Update file path
        }
      }
  
      // **Now append modifiedSlides with updated paths**
      formData.append("modifiedSlides", JSON.stringify(modifiedSlides));
  
      for (const slide of modifiedSlides) {
        if (slide.content.pdfFile) {
          formData.append(`slides.${slide.id}.pdfFile`, slide.content.pdfFile);
        }
      }
  
      // Debugging FormData
      const formObject = {};
      formData.forEach((value, key) => {
        if (formObject[key]) {
          formObject[key] = [].concat(formObject[key], value);
        } else {
          formObject[key] = value;
        }
      });
      console.log("Submitted FormData", formObject);
  
      // API Call
      const response = await fetch(`/api/episodes/${episodeData.id}/update-episode`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        method: "PUT",
        body: formData,
      });
  
      if (!response.ok) throw new Error("Failed to update episode");
  
    } catch (error) {
      setError("Failed to update episode. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  
  const uploadMediaToCPanel = async (file) => {
    const isVideo = file.type.startsWith("video/");
    const formData = new FormData();
    formData.append(isVideo ? "videoFile" : "coverImage", file);
    try {
      const response = await axios.post(
        `https://wowfy.in/testusr/${isVideo ? "upload2.php" : "upload.php"}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      console.log("logger", response.data.success, response.data.filePath);
      
      if (response.data.success) return response.data.filePath;
      throw new Error(response.data.error);
    } catch (error) {
      console.error("Upload error:", error);
      setError(`Failed to upload ${isVideo ? "video" : "image"}`);
      return null;
    }
  };

  const uploadAudioToCPanel = async (file) => {
    const formData = new FormData();
    formData.append("audioFile", file);
    try {
      const response = await axios.post("https://wowfy.in/testusr/audioUpload.php", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.success) return response.data.filePath;
      throw new Error(response.data.error);
    } catch (error) {
      console.error("Audio upload error:", error);
      setError("Failed to upload audio");
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 md:pt-28">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Edit Episode</h1>
      
        {/* Always show error if present */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            {error}
          </div>
        )}

        {/* Episode selection always visible */}
        <div className="mb-4">
          <label className="block mb-2">Select Episode to Edit</label>
          <select
            value={selectedEpisodeId}
            onChange={(e) => setSelectedEpisodeId(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-700 focus:ring-2 focus:ring-purple-600"
          >
            <option value="">Select an episode</option>
            {episodes.map((episode) => (
              <option key={episode.id} value={episode.id}>
                {episode.name}
              </option>
            ))}
          </select>
        </div>

        {/* Loading state for initial fetch */}
        {!selectedEpisodeId && episodes.length === 0 && (
          <div className="text-center text-gray-500">
            Loading episodes...
          </div>
        )}

        {/* Content when episode is selected */}
        {selectedEpisodeId && loading && (
          <div className="text-center text-gray-500">
            Loading episode details...
          </div>
        )}

        {selectedEpisodeId && !loading && (
          <form onSubmit={handleSubmit}>
            <label>Episode Name</label>
            <input
              type="text"
              value={episodeData.name}
              onChange={(e) => {
                setEpisodeData((prev) => ({ ...prev, name: e.target.value }));
                setModifications((prev) => ({ ...prev, nameModified: true }));
              }}
              className="w-full p-3 rounded-lg bg-gray-700 focus:ring-2 focus:ring-purple-600"
            />

            <label>Episode Synopsis</label>
            <textarea
              value={episodeData.synopsis}
              onChange={(e) => {
                setEpisodeData((prev) => ({ ...prev, synopsis: e.target.value }));
                setModifications((prev) => ({ ...prev, synopsisModified: true }));
              }}
              className="w-full p-3 rounded-lg bg-gray-700 focus:ring-2 focus:ring-purple-600 h-24"
            />

            <button
              type="button"
              onClick={() => handleAddSlide("image")}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg mr-2"
            >
              Add Image Slide
            </button>
            <button
              type="button"
              onClick={() => handleAddSlide("chat")}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg mr-2"
            >
              Add Chat Slide
            </button>
            <button
              type="button"
              onClick={() => handleAddSlide("quiz")}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg"
            >
              Add Quiz Slide
            </button>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="slides">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {episodeData.slides.map((slide, index) => (
                      <Draggable key={slide.id} draggableId={slide.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="mt-4 p-4 border border-gray-600 rounded-lg"
                          >
                            <h3>
                              Slide {index + 1} - {slide.type.charAt(0).toUpperCase() + slide.type.slice(1)} Slide
                            </h3>
                            <button
                              type="button"
                              onClick={() => handleRemoveSlide(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              Remove
                            </button>

                            {slide.type === "image" && (
                              <>
                                <div className="flex items-center gap-4 mb-4">
                                  <div className="flex-1">
                                    <input
                                      type="file"
                                      accept="image/*, video/*, image/gif"
                                      onChange={(e) => handleMediaUpload(index, e.target.files[0])}
                                      className="hidden"
                                      id={`mediaUpload-${index}`}
                                    />
                                    <label
                                      htmlFor={`mediaUpload-${index}`}
                                      className="w-full p-3 rounded-lg bg-gray-600 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-500 transition"
                                    >
                                      <Upload className="mr-2 h-5 w-5" />
                                      <span>{slide.content.media ? 'Change Media' : 'Upload Image/GIF/Video'}</span>
                                      {!slide.content.media?.type?.startsWith('video/') && (
                                        <span className="text-xs text-gray-400 mt-1">
                                          4:5 aspect ratio required
                                        </span>
                                      )}
                                    </label>
                                  </div>
                                  {slide.content.media && (
                                    <div className="w-32 h-32">
                                      {slide.content.media.type === 'video' ? (
                                        <video 
                                          controls 
                                          className="w-full h-full object-cover rounded-lg"
                                        >
                                          <source src={slide.content.media.preview} type="video/mp4" />
                                        </video>
                                      ) : (
                                        <img 
                                          src={slide.content.media.preview} 
                                          alt="Preview" 
                                          className="w-full h-full object-cover rounded-lg" 
                                        />
                                      )}
                                    </div>
                                  )}
                                </div>
                                {/* Rest of image slide content */}
                                  <textarea
                                    value={slide.content.description}
                                    onChange={(e) => {
                                      const updatedSlides = [...episodeData.slides];
                                      updatedSlides[index].content.description = e.target.value;
                                      setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
                                      setModifications((prev) => ({
                                        ...prev,
                                        slides: { ...prev.slides, [slide.id]: { descriptionModified: true } },
                                      }));
                                    }}
                                    placeholder="Image description"
                                    className="w-full p-3 rounded-lg bg-gray-600 focus:ring-2 focus:ring-purple-600 h-24 mt-2"
                                  />
                              </>
                            )}

                            {/* {slide.type === "image" && (
                              <>
                                <input
                                  type="file"
                                  onChange={(e) => handleMediaUpload(index, e.target.files[0])}
                                  className="hidden"
                                  id={`mediaUpload-${index}`}
                                />
                                <label htmlFor={`mediaUpload-${index}`} className="cursor-pointer">
                                  {slide.content.media ? "Change Media" : "Upload Image/GIF/Video"}
                                </label>
                                {slide.content.media?.preview && (
                                  <img
                                    src={slide.content.media.preview}
                                    alt="Preview"
                                    className="mt-2 w-full h-48 object-cover"
                                  />
                                )}
                                <textarea
                                  value={slide.content.description}
                                  onChange={(e) => {
                                    const updatedSlides = [...episodeData.slides];
                                    updatedSlides[index].content.description = e.target.value;
                                    setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
                                    setModifications((prev) => ({
                                      ...prev,
                                      slides: { ...prev.slides, [slide.id]: { descriptionModified: true } },
                                    }));
                                  }}
                                  placeholder="Image description"
                                  className="w-full p-3 rounded-lg bg-gray-600 focus:ring-2 focus:ring-purple-600 h-24 mt-2"
                                />
                              </>
                            )} */}

                            {slide.type === "chat" && (
                              <>
                                <h4>Expand/Collapse Chats</h4>
                                {slide.content.storyLines.map((line, lineIndex) => (
                                  <div key={lineIndex} className="mt-2">
                                    <select
                                      value={line.character}
                                      onChange={(e) => {
                                        const updatedSlides = [...episodeData.slides];
                                        updatedSlides[index].content.storyLines[lineIndex].character = e.target.value;
                                        setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
                                        setModifications((prev) => ({
                                          ...prev,
                                          slides: { ...prev.slides, [slide.id]: { contentModified: true } },
                                        }));
                                      }}
                                      className="w-full p-2 rounded-lg bg-gray-500"
                                    >
                                      <option value="">Select Character</option>
                                      {fetchedCharacters.map((char) => (
                                        <option key={char.id} value={char.name}>
                                          {char.name}
                                        </option>
                                      ))}
                                    </select>
                                    <textarea
                                      value={line.line}
                                      // onChange={(e) => {
                                      //   const updatedSlides = [...episodeData.slides];
                                      //   updatedSlides[index].content.storyLines[lineIndex].line = e.target.value;
                                      //   setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
                                      //   setModifications((prev) => ({
                                      //     ...prev,
                                      //     slides: { ...prev.slides, [slide.id]: { contentModified: true } },
                                      //   }));
                                      // }}
                                      onChange={(e) => handleStoryLineChange(index, lineIndex, 'character', e.target.value)}
                                      placeholder="Enter dialogue"
                                      className="w-full p-2 rounded-lg bg-gray-500 h-20 mt-2"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updatedSlides = [...episodeData.slides];
                                        updatedSlides[index].content.storyLines.splice(lineIndex, 1);
                                        setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
                                      }}
                                      className="text-red-400 hover:text-red-300"
                                    >
                                      Remove Line
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedSlides = [...episodeData.slides];
                                    updatedSlides[index].content.storyLines.push({ character: "", line: "" });
                                    setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
                                  }}
                                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg mt-2"
                                >
                                  Add Line
                                </button>
                                <input
                                  type="file"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      const updatedSlides = [...episodeData.slides];
                                      updatedSlides[index].content.pdfFile = file;
                                      setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
                                      setModifications((prev) => ({
                                        ...prev,
                                        slides: { ...prev.slides, [slide.id]: { pdfModified: true } },
                                      }));
                                    }
                                  }}
                                  className="hidden"
                                  id={`pdfUpload-${index}`}
                                />
                                <label htmlFor={`pdfUpload-${index}`} className="cursor-pointer">
                                  Upload PDF
                                </label>
                                {slide.content.pdfFile?.name && <p>Selected: {slide.content.pdfFile.name}</p>}
                              </>
                            )}

                            {slide.type === "quiz" && (
                              <>
                              <div className="flex items-center gap-4 mb-4">
                                <div className="flex-1">
                                <input
                                  type="file"
                                  accept="image/*, video/*, image/gif"
                                  onChange={(e) => handleMediaUpload(index, e.target.files[0])}
                                  className="hidden"
                                  id={`mediaUpload-${index}`}
                                />
                                <label
                                  htmlFor={`mediaUpload-${index}`}
                                  className="w-full p-3 rounded-lg bg-gray-600 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-500 transition"
                                >
                                  <Upload className="mr-2 h-5 w-5" />
                                  <span>{slide.content.media ? 'Change Media' : 'Upload Image/GIF/Video'}</span>
                                  {!slide.content.media?.type?.startsWith('video/') && (
                                    <span className="text-xs text-gray-400 mt-1">
                                      4:5 aspect ratio required
                                    </span>
                                  )}
                                </label>
                                </div>
                                {slide.content.media && (
                                    <div className="w-32 h-32">
                                      {slide.content.media.type === 'video' ? (
                                        <video 
                                          controls 
                                          className="w-full h-full object-cover rounded-lg"
                                        >
                                          <source src={slide.content.media.preview} type="video/mp4" />
                                        </video>
                                      ) : (
                                        <img 
                                          src={slide.content.media.preview} 
                                          alt="Preview" 
                                          className="w-full h-full object-cover rounded-lg" 
                                        />
                                      )}
                                    </div>
                                  )}
                              </div>
                                {/* <input
                                  type="file"
                                  onChange={(e) => handleMediaUpload(index, e.target.files[0])}
                                  className="hidden"
                                  id={`mediaUpload-${index}`}
                                />
                                <label htmlFor={`mediaUpload-${index}`} className="cursor-pointer">
                                  {slide.content.media ? "Change Media" : "Upload Image/GIF/Video"}
                                </label>
                                {slide.content.media?.preview && (
                                  <img
                                    src={slide.content.media.preview}
                                    alt="Preview"
                                    className="mt-2 w-full h-48 object-cover"
                                  />
                                )} */}
                                <textarea
                                  value={slide.content.question}
                                  onChange={(e) => {
                                    const updatedSlides = [...episodeData.slides];
                                    updatedSlides[index].content.question = e.target.value;
                                    setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
                                    setModifications((prev) => ({
                                      ...prev,
                                      slides: { ...prev.slides, [slide.id]: { questionModified: true } },
                                    }));
                                  }}
                                  placeholder="Enter question"
                                  className="w-full p-3 rounded-lg bg-gray-600 focus:ring-2 focus:ring-purple-600 mt-2"
                                />
                                {slide.content.options.map((option, optIndex) => (
                                  <div key={optIndex} className="flex items-center mt-2">
                                    <input
                                      type="text"
                                      value={option.text}
                                      onChange={(e) => handleQuizOptionChange(index, optIndex, 'text', e.target.value)}
                                      // onChange={(e) => {
                                      //   const updatedSlides = [...episodeData.slides];
                                      //   updatedSlides[index].content.options[optIndex].text = e.target.value;
                                      //   setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
                                      //   setModifications((prev) => ({
                                      //     ...prev,
                                      //     slides: { ...prev.slides, [slide.id]: { optionsModified: true } },
                                      //   }));
                                      // }}
                                      placeholder={`Option ${optIndex + 1}`}
                                      className="flex-1 p-2 rounded-lg bg-gray-500"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updatedSlides = [...episodeData.slides];
                                        updatedSlides[index].content.options[optIndex].is_correct =
                                          !updatedSlides[index].content.options[optIndex].is_correct;
                                        setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
                                        setModifications((prev) => ({
                                          ...prev,
                                          slides: { ...prev.slides, [slide.id]: { optionsModified: true } },
                                        }));
                                      }}
                                      className={`px-4 py-2 rounded-lg ml-2 ${
                                        option.is_correct ? "bg-green-600" : "bg-gray-500"
                                      }`}
                                    >
                                      Correct
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedSlides = [...episodeData.slides];
                                    updatedSlides[index].content.options.push({ text: "", is_correct: false });
                                    setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg mt-2"
                                >
                                  Add Option
                                </button>
                              </>
                            )}

                            {/* <input
                              type="file"
                              onChange={(e) => handleAudioUpload(index, e.target.files[0])}
                              className="hidden"
                              id={`audioUpload-${index}`}
                            />
                            <label htmlFor={`audioUpload-${index}`} className="cursor-pointer">
                              Upload Audio
                            </label>
                            {slide.content.audio && (
                              <div>
                                <p>{slide.content.audio.name}</p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedSlides = [...episodeData.slides];
                                    updatedSlides[index].content.audio = null;
                                    setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
                                  }}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  Remove Audio
                                </button>
                              </div>
                            )} */}

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
                                    <span className="text-sm">
                                      {slide.content.audio.name.startsWith('http') 
                                        ? slide.content.audio.name.split('/').pop()
                                        : slide.content.audio.name}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updatedSlides = [...episodeData.slides];
                                        updatedSlides[index].content.audio = null;
                                        setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
                                      }}
                                      className="text-red-400 hover:text-red-300"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            <button type="submit" className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg mt-4">
              {loading ? "Saving Changes..." : "Save Changes"}
            </button>
          </form>
        )}

        {loading && <p>Loading episode details...</p>}
      </div>
    </div>
  );
};

export default EditEpisode;
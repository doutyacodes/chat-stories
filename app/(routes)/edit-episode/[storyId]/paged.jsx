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

  // const fetchEpisodeDetails = async (episodeId) => {
  //   setLoading(true);
  //   try {
  //     const response = await fetch(`/api/episodes/${episodeId}/fetch-edit-data`, {
  //       headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  //     });
  //     if (!response.ok) throw new Error("Failed to fetch episode details");
  //     const data = await response.json();
  //     setEpisodeData({
  //       id: data.id,
  //       name: data.name,
  //       synopsis: data.synopsis,
  //       slides: data.slides.map((slide) => ({
  //         id: String(slide.id),
  //         type: slide.type,
  //         position: slide.position,
  //         content:
  //           slide.type === "image"
  //             ? { media: { preview: slide.imageUrl }, description: slide.content.description }
  //             : slide.type === "quiz"
  //             ? {
  //                 media: { preview: slide.imageUrl },
  //                 question: slide.content.question,
  //                 options: slide.content.options,
  //               }
  //             : {
  //                 characters: slide.characters,
  //                 inputType: slide.inputType || "manual",
  //                 storyLines: slide.storyLines || [],
  //                 pdfFile: null,
  //               },
  //       })),
  //     });
  //     setModifications({
  //       nameModified: false,
  //       synopsisModified: false,
  //       slides: {},
  //     });
  //   } catch (error) {
  //     setError("Failed to load episode details");
  //     console.error(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
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

  const handleLineChange = (slideIndex, lineIndex, field, value) => {
    const updatedSlides = [...episodeData.slides];
    updatedSlides[slideIndex].content.storyLines[lineIndex][field] = value;
    setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
  }; /* ------- */

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

  /* quizzz */
  // Quiz Question Change
  const handleQuizChange = (slideIndex, field, value) => {
    const updatedSlides = [...episodeData.slides];
    updatedSlides[slideIndex].content[field] = value;
    setEpisodeData(prev => ({ ...prev, slides: updatedSlides }));
  };

  // Option Change Handler
  const handleOptionChange = (slideIndex, optionIndex, field, value) => {
    const updatedSlides = [...episodeData.slides];
    updatedSlides[slideIndex].content.options[optionIndex][field] = value;
    setEpisodeData(prev => ({ ...prev, slides: updatedSlides }));
  };

  // Toggle Correct Answer
  const toggleCorrectAnswer = (slideIndex, optionIndex) => {
    const updatedSlides = [...episodeData.slides];
    updatedSlides[slideIndex].content.options = updatedSlides[slideIndex].content.options.map(
      (opt, idx) => ({
        ...opt,
        is_correct: idx === optionIndex ? !opt.is_correct : false
      })
    );
    setEpisodeData(prev => ({ ...prev, slides: updatedSlides }));
  };

  // Add Option
  const handleAddOption = (slideIndex) => {
    const updatedSlides = [...episodeData.slides];
    updatedSlides[slideIndex].content.options.push({ text: "", is_correct: false });
    setEpisodeData(prev => ({ ...prev, slides: updatedSlides }));
  };

  const handleRemoveAudio = (slideIndex) => {
    const updatedSlides = [...episodeData.slides];
    updatedSlides[slideIndex].content.audio = null;
    setEpisodeData(prev => ({ ...prev, slides: updatedSlides }));
  };

  // Remove Option
  const handleRemoveOption = (slideIndex, optionIndex) => {
    const updatedSlides = [...episodeData.slides];
    if (updatedSlides[slideIndex].content.options.length > 2) {
      updatedSlides[slideIndex].content.options.splice(optionIndex, 1);
      setEpisodeData(prev => ({ ...prev, slides: updatedSlides }));
    }
  };

  /* quizzzz end */

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
  
// Update your handler function name if needed
  const fetchEpisodeDetails = async (episodeId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/episodes/${episodeId}/fetch-edit-data`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!response.ok) throw new Error("Failed to fetch episode details");
      const data = await response.json();
  
      // Map slides with proper content structure
      const processedSlides = data.slides.map((slide) => ({
        id: String(slide.id),
        type: slide.type,
        position: slide.position,
        content:
          slide.type === "image"
            ? {
                media: slide.content.media
                  ? { preview: slide.content.media.preview, file: null }
                  : null,
                description: slide.content.description || "",
                audio: slide.content.audio ? { name: slide.content.audio } : null,
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
                pdfFile: slide.content.pdfFile ? { name: slide.content.pdfFile } : null,
                audio: slide.content.audio ? { name: slide.content.audio } : null,
              }
            : slide.type === "quiz"
            ? {
                media: slide.content.media
                  ? { preview: slide.content.media.preview, file: null }
                  : null,
                question: slide.content.question || "",
                options: slide.content.options.map((option) => ({
                  text: option.text || "",
                  is_correct: !!option.is_correct,
                })),
                audio: slide.content.audio ? { name: slide.content.audio } : null,
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
      fetchCharacters(selectedEpisodeId);
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

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(episodeData.slides);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    const updatedSlides = items.map((slide, index) => ({ ...slide, position: index }));
    setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
    const newModifications = { ...modifications };
    updatedSlides.forEach((slide) => {
      newModifications.slides[slide.id] = { ...newModifications.slides[slide.id], positionModified: true };
    });
    setModifications(newModifications);
  };

  const handleAddSlide = (type) => {
    const defaultCharacterCount = 2;
    const emptyCharacters = Array.from({ length: defaultCharacterCount }, (_, index) => ({
      name: "",
      isSender: index === 0,
    }));
    const newSlide = {
      id: `temp-${Date.now()}`,
      type,
      position: episodeData.slides.length,
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
    setModifications((prev) => ({
      ...prev,
      slides: { ...prev.slides, [newSlide.id]: { isNew: true } },
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

  const handleMediaUpload = async (index, file) => {
    if (file) {
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          const updatedSlides = [...episodeData.slides];
          updatedSlides[index].content.media = {
            file: file,
            preview: reader.result,
            type: file.type.split("/")[0],
          };
          setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
          setModifications((prev) => ({
            ...prev,
            slides: { ...prev.slides, [updatedSlides[index].id]: { mediaModified: true } },
          }));
        };
        reader.readAsDataURL(file);
      } catch (error) {
        setError("Failed to upload media");
        console.error(error);
      }
    }
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

      const modifiedSlides = Object.entries(modifications.slides)
        .filter(([_, changes]) => Object.values(changes).some((v) => v))
        .map(([slideId, changes]) => ({
          id: slideId,
          changes,
          ...episodeData.slides.find((s) => s.id === slideId),
        }));

      formData.append("modifiedSlides", JSON.stringify(modifiedSlides));

      for (const slide of modifiedSlides) {
        if (slide.content.media?.file) {
          const mediaPath = await uploadMediaToCPanel(slide.content.media.file);
          slide.content.media = { ...slide.content.media, file: mediaPath };
        }
        if (slide.content.audio?.file) {
          const audioPath = await uploadAudioToCPanel(slide.content.audio.file);
          slide.content.audio = { ...slide.content.audio, file: audioPath };
        }
        if (slide.content.pdfFile) {
          formData.append(`slides.${slide.id}.pdfFile`, slide.content.pdfFile);
        }
      }

      const response = await fetch(`/api/episodes/${episodeData.id}/update-episode`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        method: "PUT",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to update episode");
      router.push("/your-stories");
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
        {error && <div className="text-red-500">{error}</div>}
        <div className="mb-4">
          <label className="block mb-2">Select Episode to Edit</label>
          <select
            value={selectedEpisodeId}
            onChange={(e) => setSelectedEpisodeId(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-700 focus:ring-2 focus:ring-purple-600"
          >
            <option>Select an episode</option>
            {episodes.map((episode) => (
              <option key={episode.id} value={episode.id}>
                {episode.name}
              </option>
            ))}
          </select>
        </div>
        {selectedEpisodeId && !loading && (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-2">Episode Name</label>
              <input
                type="text"
                value={episodeData.name}
                onChange={(e) => {
                  setEpisodeData((prev) => ({ ...prev, name: e.target.value }));
                  setModifications((prev) => ({ ...prev, nameModified: true }));
                }}
                className="w-full p-3 rounded-lg bg-gray-700 focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Episode Synopsis</label>
              <textarea
                value={episodeData.synopsis}
                onChange={(e) => {
                  setEpisodeData((prev) => ({ ...prev, synopsis: e.target.value }));
                  setModifications((prev) => ({ ...prev, synopsisModified: true }));
                }}
                className="w-full p-3 rounded-lg bg-gray-700 focus:ring-2 focus:ring-purple-600 h-24"
              />
            </div>
            <div className="mb-4">
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
            </div>
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
                            className="border border-gray-600 rounded-lg p-4 mb-4"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span>
                                Slide {index + 1} - {slide.type.charAt(0).toUpperCase() + slide.type.slice(1)} Slide
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSlide(index)}
                                className="text-red-400 hover:text-red-300"
                              >
                                Remove
                              </button>
                            </div>
                            {slide.type === "image" && (
                              <>
                              <div className="flex items-center gap-4">
                                <div className="flex-1">
                                  <input
                                      type="file"
                                      accept="image/*, video/*, image/gif"
                                      onChange={(e) => handleMediaUpload(index, e.target.files[0])}
                                      className="hidden"
                                      id={`mediaUpload-${index}`} // Changed ID to match
                                    />
                                    <label 
                                      htmlFor={`mediaUpload-${index}`} // Match the input ID
                                      className="w-full p-3 rounded-lg bg-gray-600 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-500 transition"
                                    >
                                      <Upload className="mr-2 h-5 w-5" />
                                      <span>{slide.content.media ? 'Change Media' : 'Upload Image/GIF/Video'}</span>
                                      {slide.content.media?.file && !slide.content.media.file.type.startsWith('video/') && (
                                        <span className="text-xs text-gray-400 mt-1">
                                          {slide.type === 'image' ? '16:9' : '3:2'} aspect ratio required
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
                                        <source src={slide.content.media.preview} type={slide.content.media.file.type} />
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
                                  className="w-full p-3 rounded-lg bg-gray-600 focus:ring-2 focus:ring-purple-600 h-24"
                                />
                              </>
                            )}
                            {slide.type === "chat" && (
                              <>
                                <div className="mb-4">
                                  <button
                                    type="button"
                                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                                  >
                                    Expand/Collapse Chats
                                  </button>
                                </div>
                                {slide.content.storyLines.map((line, lineIndex) => (
                                  <div key={lineIndex} className="mb-2">
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
                                      <option>Select Character</option>
                                      {slide.content.characters.map((char, idx) => (
                                        <option key={idx} value={char.name}>
                                          {char.name}
                                        </option>
                                      ))}
                                    </select>
                                    <textarea
                                      value={line.line}
                                      onChange={(e) => {
                                        const updatedSlides = [...episodeData.slides];
                                        updatedSlides[index].content.storyLines[lineIndex].line = e.target.value;
                                        setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
                                        setModifications((prev) => ({
                                          ...prev,
                                          slides: { ...prev.slides, [slide.id]: { contentModified: true } },
                                        }));
                                      }}
                                      placeholder="Enter dialogue"
                                      className="w-full p-2 rounded-lg bg-gray-500 h-20"
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
                                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
                                >
                                  Add Line
                                </button>
                                <input
                                  type="file"
                                  accept=".pdf"
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
                                <label htmlFor={`pdfUpload-${index}`} className="block mt-2">
                                  Upload PDF
                                </label>
                                {slide.content.pdfFile && <div>Selected: {slide.content.pdfFile.name}</div>}
                              </>
                            )}
                            {slide.type === "quiz" && (
                              <>
                                <div className="flex items-center gap-4">
                                  <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*, video/*, image/gif"
                                        onChange={(e) => handleMediaUpload(index, e.target.files[0])}
                                        className="hidden"
                                        id={`mediaUpload-${index}`} // Changed ID to match
                                      />
                                      <label 
                                        htmlFor={`mediaUpload-${index}`} // Match the input ID
                                        className="w-full p-3 rounded-lg bg-gray-600 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-500 transition"
                                      >
                                        <Upload className="mr-2 h-5 w-5" />
                                        <span>{slide.content.media ? 'Change Media' : 'Upload Image/GIF/Video'}</span>
                                        {slide.content.media?.file && !slide.content.media.file.type.startsWith('video/') && (
                                          <span className="text-xs text-gray-400 mt-1">
                                            {slide.type === 'image' ? '16:9' : '3:2'} aspect ratio required
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
                                          <source src={slide.content.media.preview} type={slide.content.media.file.type} />
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
                                <input
                                  type="text"
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
                                  className="w-full p-3 rounded-lg bg-gray-600 focus:ring-2 focus:ring-purple-600"
                                />
                                {slide.content.options.map((option, optIndex) => (
                                  <div key={optIndex} className="flex items-center mb-2">
                                    <input
                                      type="text"
                                      value={option.text}
                                      onChange={(e) => {
                                        const updatedSlides = [...episodeData.slides];
                                        updatedSlides[index].content.options[optIndex].text = e.target.value;
                                        setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
                                        setModifications((prev) => ({
                                          ...prev,
                                          slides: { ...prev.slides, [slide.id]: { optionsModified: true } },
                                        }));
                                      }}
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
                                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                                >
                                  Add Option
                                </button>
                              </>
                            )}
                            {/* <div className="mt-4">
                              <input
                                type="file"
                                accept="audio/*"
                                onChange={(e) => handleAudioUpload(index, e.target.files[0])}
                                className="hidden"
                                id={`audioUpload-${index}`}
                              />
                              <label htmlFor={`audioUpload-${index}`} className="block">
                                Upload Audio
                              </label>
                              {slide.content.audio && <div>Selected: {slide.content.audio.name}</div>}
                            </div> */}
                            <div className="my-6">
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
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg w-full"
            >
              {loading ? "Saving Changes..." : "Save Changes"}
            </button>
          </form>
        )}
        {loading && <div>Loading episode details...</div>}
      </div>
    </div>
  );
};

export default EditEpisode;
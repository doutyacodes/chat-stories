"use client"

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, X, Upload, ArrowUp, ArrowDown } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const EditEpisode = () => {
  const router = useRouter();
  const { storyId } = useParams();
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState("");
  const [error, setError] = useState("");
  const [fetchedCharacters, setFetchedCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedChatIndex, setExpandedChatIndex] = useState(-1);
  
  const [episodeData, setEpisodeData] = useState({
    id: "",
    name: "",
    synopsis: "",
    slides: []
  });

  const BASE_IMAGE_URL = 'https://wowfy.in/testusr/images/';
  const BASE_VIDEO_URL = 'https://wowfy.in/testusr/videos/';

  console.log(episodeData)
  // Track modifications
  const [modifications, setModifications] = useState({
    nameModified: false,
    synopsisModified: false,
    slides: {} // Will store slideId: { modified: boolean, type: string }
  });

  console.log(modifications)


  useEffect(() => {
    fetchEpisodes();
  }, []);

  const fetchEpisodes = async () => {
    try {
      const response = await fetch(`/api/episodes/${storyId}/fetch-episodes`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
      });
      if (!response.ok) throw new Error('Failed to fetch episodes');
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
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
      });
      if (!response.ok) throw new Error('Failed to fetch episode details');
      
    // In the fetchEpisodeDetails function, modify the slides mapping:
    const data = await response.json();
    setEpisodeData({
    id: data.id,
    name: data.name,
    synopsis: data.synopsis,
    slides: data.slides.map(slide => ({
        id: String(slide.id), // Convert ID to string here
        type: slide.type,
        position: slide.position,
        content: slide.type === 'image' 
        ? {
            media: { preview: slide.imageUrl },
            description: slide.description
            }
        : {
            characters: slide.characters,
            inputType: slide.inputType || "manual",
            storyLines: slide.storyLines || [],
            pdfFile: null
            }
    }))
    });
      // Reset modifications tracking
      setModifications({
        nameModified: false,
        synopsisModified: false,
        slides: {}
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

  const fetchCharacters = async (episodeId) => {
    try {
      const response = await fetch(`/api/stories/${storyId}/characters`);
      if (!response.ok) throw new Error('Failed to fetch characters');
      const data = await response.json();
      setFetchedCharacters(data.characters);
    } catch (error) {
      setError("Failed to load characters");
      console.error(error);
    }
  };

//   const handleDragEnd = (result) => {
//     if (!result.destination) return;

//     const items = Array.from(episodeData.slides);
//     const [reorderedItem] = items.splice(result.source.index, 1);
//     items.splice(result.destination.index, 0, reorderedItem);

//     // Update positions
//     const updatedSlides = items.map((slide, index) => ({
//       ...slide,
//       position: index
//     }));

//     setEpisodeData(prev => ({
//       ...prev,
//       slides: updatedSlides
//     }));

//     // Mark all affected slides as modified
//     const newModifications = { ...modifications };
//     updatedSlides.forEach(slide => {
//       if (slide.position !== result.source.index) {
//         newModifications.slides[slide.id] = {
//           ...newModifications.slides[slide.id],
//           positionModified: true
//         };
//       }
//     });
//     setModifications(newModifications);
//   };

const handleDragEnd = (result) => {
    if (!result.destination) return;
  
    const items = Array.from(episodeData.slides);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
  
    // Update positions
    const updatedSlides = items.map((slide, index) => ({
      ...slide,
      position: index
    }));
  
    setEpisodeData(prev => ({
      ...prev,
      slides: updatedSlides
    }));
  
    // Mark all slides as position modified since their positions have changed
    const newModifications = { ...modifications };
    updatedSlides.forEach(slide => {
      newModifications.slides[slide.id] = {
        ...newModifications.slides[slide.id],
        positionModified: true
      };
    });
    setModifications(newModifications);
  };

  
  const handleAddSlide = (type) => {
    const defaultCharacterCount = 2;
    const emptyCharacters = Array.from({ length: defaultCharacterCount }, (_, index) => ({
      name: "",
      isSender: index === 0
    }));

    const newSlide = {
      id: `temp-${Date.now()}`, // This is already a string, but make sure it stays this way
      type,
      position: episodeData.slides.length,
      content: type === "image"
        ? { media: null, description: "" }
        : {
            characters: emptyCharacters,
            inputType: "manual",
            storyLines: [{ character: "", line: "" }],
            pdfFile: null
          }
    };

    setEpisodeData(prev => ({
      ...prev,
      slides: [...prev.slides, newSlide]
    }));

    setModifications(prev => ({
      ...prev,
      slides: {
        ...prev.slides,
        [newSlide.id]: { isNew: true }
      }
    }));
  };

  const handleRemoveSlide = async (index) => {
    const slideToRemove = episodeData.slides[index];
    
    if (!slideToRemove.id.startsWith('temp-')) {
      try {
        const response = await fetch(`/api/slides/${slideToRemove.id}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete slide');
      } catch (error) {
        setError("Failed to delete slide");
        console.error(error);
        return;
      }
    }

    const updatedSlides = episodeData.slides.filter((_, i) => i !== index);
    setEpisodeData(prev => ({ ...prev, slides: updatedSlides }));
  };

  const handleImageUpload = (index, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedSlides = [...episodeData.slides];
        updatedSlides[index].content.media = {
          file: file,
          preview: reader.result
        };
        setEpisodeData(prev => ({ ...prev, slides: updatedSlides }));

        // Mark slide as modified
        const slideId = episodeData.slides[index].id;
        setModifications(prev => ({
          ...prev,
          slides: {
            ...prev.slides,
            [slideId]: { ...prev.slides[slideId], imageModified: true }
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChatChange = (slideIndex, type, value) => {
    const updatedSlides = [...episodeData.slides];
    const slideId = updatedSlides[slideIndex].id;

    if (type === 'inputType') {
      // If switching to PDF, clear existing chat data
      if (value === 'pdf') {
        updatedSlides[slideIndex].content = {
          ...updatedSlides[slideIndex].content,
          inputType: value,
          storyLines: [],
          pdfFile: null
        };
      } else {
        updatedSlides[slideIndex].content.inputType = value;
      }
    }

    setEpisodeData(prev => ({ ...prev, slides: updatedSlides }));

    setModifications(prev => ({
      ...prev,
      slides: {
        ...prev.slides,
        [slideId]: { ...prev.slides[slideId], chatModified: true }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('storyId', storyId);
      formData.append('episodeId', episodeData.id);
      
      if (modifications.nameModified) {
        formData.append('name', episodeData.name);
      }
      if (modifications.synopsisModified) {
        formData.append('synopsis', episodeData.synopsis);
      }

      // Handle modified slides
      const modifiedSlides = Object.entries(modifications.slides)
        .filter(([_, changes]) => Object.values(changes).some(v => v))
        .map(([slideId, changes]) => ({
          id: slideId,
          ...changes,
          ...episodeData.slides.find(s => s.id === slideId)
        }));

      formData.append('modifiedSlides', JSON.stringify(modifiedSlides));

      // Append files for modified slides
      modifiedSlides.forEach(slide => {
        if (slide.type === 'image' && slide.imageModified) {
          formData.append(`slides.${slide.id}.file`, slide.content.media.file);
        }
        if (slide.type === 'chat' && slide.content.pdfFile) {
          formData.append(`slides.${slide.id}.pdfFile`, slide.content.pdfFile);
        }
      });

      const response = await fetch(`/api/episodes/${episodeData.id}/update-episode`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
        method: 'PUT',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to update episode');

      router.push('/your-stories');
    } catch (error) {
      setError("Failed to update episode. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Other handler functions (handleInputTypeChange, handleLineChange, etc.) remain similar to CreateEpisode
  // but should include modification tracking

  const QuizSlide = ({ slide, index, onUpdate }) => {
    const handleOptionChange = (optIndex, field, value) => {
      const updatedOptions = [...slide.content.options];
      updatedOptions[optIndex][field] = value;
      onUpdate(index, { options: updatedOptions });
    };
  
    const addOption = () => {
      onUpdate(index, { 
        options: [...slide.content.options, { text: '', is_correct: false }]
      });
    };
  
    return (
      <div className="space-y-4">
        <input
          value={slide.content?.question}
          onChange={(e) => onUpdate(index, { question: e.target.value })}
          placeholder="Quiz Question"
        />
        
        {slide.content.options.map((option, optIndex) => (
          <div key={optIndex} className="flex items-center gap-2">
            <input
              value={option.text}
              onChange={(e) => handleOptionChange(optIndex, 'text', e.target.value)}
            />
            <button
              onClick={() => handleOptionChange(optIndex, 'is_correct', !option.is_correct)}
              className={`p-2 ${option.is_correct ? 'bg-green-600' : 'bg-gray-600'}`}
            >
              Correct
            </button>
          </div>
        ))}
        
        <button onClick={addOption}>Add Option</button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 md:pt-28">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Edit Episode</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Episode Selection */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <label className="block text-sm font-medium mb-2">Select Episode to Edit</label>
          <select
            value={selectedEpisodeId}
            onChange={(e) => setSelectedEpisodeId(e.target.value)}
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

        {selectedEpisodeId && !loading && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Episode Basic Details */}
            <div className="bg-gray-800 p-6 rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Episode Name</label>
                <input
                  type="text"
                  value={episodeData.name}
                  onChange={(e) => {
                    setEpisodeData(prev => ({ ...prev, name: e.target.value }));
                    setModifications(prev => ({ ...prev, nameModified: true }));
                  }}
                  className="w-full p-3 rounded-lg bg-gray-700 focus:ring-2 focus:ring-purple-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Episode Synopsis</label>
                <textarea
                  value={episodeData.synopsis}
                  onChange={(e) => {
                    setEpisodeData(prev => ({ ...prev, synopsis: e.target.value }));
                    setModifications(prev => ({ ...prev, synopsisModified: true }));
                  }}
                  className="w-full p-3 rounded-lg bg-gray-700 focus:ring-2 focus:ring-purple-600 h-24"
                />
              </div>
            </div>

            {/* Slides Section */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Slides</h2>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleAddSlide("image")}
                    className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg"
                  >
                    Add Image Slide
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddSlide("chat")}
                    className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg"
                  >
                    Add Chat Slide
                  </button>
                </div>
              </div>

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="slides">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4"
                    >
                      {episodeData.slides.map((slide, index) => (
                        <Draggable
                          key={slide.id}
                          draggableId={slide.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-gray-700 p-4 rounded-lg"
                            >
                                {/* Slide content similar to CreateEpisode but with modification tracking */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-medium">
                                        Slide {index + 1} - {slide.type.charAt(0).toUpperCase() + slide.type.slice(1)}
                                        </h3>
                                        <button
                                        type="button"
                                        onClick={() => handleRemoveSlide(index)}
                                        className="text-red-400 hover:text-red-300"
                                        >
                                        <X className="h-5 w-5" />
                                        </button>
                                    </div>

                                    {slide.type === 'quiz' && <QuizSlide slide={slide} index={index} onUpdate />}

                                    {slide.type === 'image' && (
                                        <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*,video/*"
                                                onChange={(e) => handleImageUpload(index, e.target.files[0])}
                                                className="hidden"
                                                id={`imageUpload-${index}`}
                                            />
                                            <label 
                                                htmlFor={`imageUpload-${index}`}
                                                className="w-full p-3 rounded-lg bg-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-500 transition"
                                            >
                                                <Upload className="mr-2 h-5 w-5" />
                                                {slide.content.media?.preview ? 'Change Image' : 'Upload Image'}
                                            </label>
                                            </div>
                                            {/* {slide.content.media?.preview && (
                                            <div className="w-32 h-32">
                                                <img 
                                                src={slide.content.media.preview}
                                                alt="Preview"
                                                className="w-full h-full object-cover rounded-lg"
                                                />
                                            </div>
                                            )} */}
                                            {slide.content.media?.preview && (
                                              slide.content.media.type === 'video' ? (
                                                <video controls className="w-full h-64 object-cover rounded-lg">
                                                  <source src={`${BASE_VIDEO_URL}${slide.content.media.preview}`} />
                                                </video>
                                              ) : (
                                                <img src={`${BASE_IMAGE_URL}${slide.content.media.preview}`} />
                                              )
                                            )}
                                        </div>
                                        <textarea
                                            value={slide.content.description}
                                            onChange={(e) => {
                                            const updatedSlides = [...episodeData.slides];
                                            updatedSlides[index].content.description = e.target.value;
                                            setEpisodeData(prev => ({ ...prev, slides: updatedSlides }));
                                            setModifications(prev => ({
                                                ...prev,
                                                slides: {
                                                ...prev.slides,
                                                [slide.id]: { ...prev.slides[slide.id], descriptionModified: true }
                                                }
                                            }));
                                            }}
                                            placeholder="Image description"
                                            className="w-full p-3 rounded-lg bg-gray-600 focus:ring-2 focus:ring-purple-600 h-24"
                                        />
                                        </div>
                                    )}

                                    {slide.type === 'chat' && (
                                        <div className="space-y-4">
                                        <div className="bg-gray-600 p-4 rounded-lg">
                                            <h4 className="font-medium mb-4">Chat Characters</h4>
                                            {slide?.content?.characters?.map((character, charIndex) => (
                                            <div key={charIndex} className="mb-2 flex gap-4 items-center">
                                                <input
                                                type="text"
                                                value={character.name}
                                                onChange={(e) => {
                                                    const updatedSlides = [...episodeData.slides];
                                                    updatedSlides[index].content.characters[charIndex].name = e.target.value;
                                                    setEpisodeData(prev => ({ ...prev, slides: updatedSlides }));
                                                    setModifications(prev => ({
                                                    ...prev,
                                                    slides: {
                                                        ...prev.slides,
                                                        [slide.id]: { ...prev.slides[slide.id], charactersModified: true }
                                                    }
                                                    }));
                                                }}
                                                placeholder="Character Name"
                                                className="flex-1 p-2 rounded-lg bg-gray-500"
                                                />
                                                <button
                                                type="button"
                                                onClick={() => {
                                                    const updatedSlides = [...episodeData.slides];
                                                    updatedSlides[index].content.characters = updatedSlides[index].content.characters.map(
                                                    (char, idx) => ({ ...char, isSender: idx === charIndex })
                                                    );
                                                    setEpisodeData(prev => ({ ...prev, slides: updatedSlides }));
                                                    setModifications(prev => ({
                                                    ...prev,
                                                    slides: {
                                                        ...prev.slides,
                                                        [slide.id]: { ...prev.slides[slide.id], charactersModified: true }
                                                    }
                                                    }));
                                                }}
                                                className={`px-4 py-2 rounded-lg ${
                                                    character.isSender ? "bg-green-600" : "bg-gray-500"
                                                }`}
                                                >
                                                {character.isSender ? "Sender" : "Set as Sender"}
                                                </button>
                                            </div>
                                            ))}
                                        </div>

                                        <div className="bg-gray-600 p-4 rounded-lg">
                                            <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-medium">Chat Content</h4>
                                            <div className="flex gap-2">
                                                <button
                                                type="button"
                                                onClick={() => handleChatChange(index, 'inputType', 'manual')}
                                                className={`px-4 py-2 rounded-lg ${
                                                    slide.content.inputType === 'manual' ? 'bg-purple-600' : 'bg-gray-500'
                                                }`}
                                                >
                                                Manual
                                                </button>
                                                <button
                                                type="button"
                                                onClick={() => handleChatChange(index, 'inputType', 'pdf')}
                                                className={`px-4 py-2 rounded-lg ${
                                                    slide.content.inputType === 'pdf' ? 'bg-purple-600' : 'bg-gray-500'
                                                }`}
                                                >
                                                PDF
                                                </button>
                                            </div>
                                          </div>

                                            {slide.content.inputType === 'manual' ? (
                                            <div className="space-y-4">
                                                {slide.content.storyLines.map((line, lineIndex) => (
                                                <div key={lineIndex} className="space-y-2">
                                                    <select
                                                    value={line.character}
                                                    onChange={(e) => {
                                                        const updatedSlides = [...episodeData.slides];
                                                        updatedSlides[index].content.storyLines[lineIndex].character = e.target.value;
                                                        setEpisodeData(prev => ({ ...prev, slides: updatedSlides }));
                                                        setModifications(prev => ({
                                                        ...prev,
                                                        slides: {
                                                            ...prev.slides,
                                                            [slide.id]: { ...prev.slides[slide.id], contentModified: true }
                                                        }
                                                        }));
                                                    }}
                                                    className="w-full p-2 rounded-lg bg-gray-500"
                                                    >
                                                    <option value="">Select Character</option>
                                                    {slide.content.characters.map((char, idx) => (
                                                        <option key={idx} value={char.name}>{char.name}</option>
                                                    ))}
                                                    </select>
                                                    <textarea
                                                    value={line.line}
                                                    onChange={(e) => {
                                                        const updatedSlides = [...episodeData.slides];
                                                        updatedSlides[index].content.storyLines[lineIndex].line = e.target.value;
                                                        setEpisodeData(prev => ({ ...prev, slides: updatedSlides }));
                                                        setModifications(prev => ({
                                                        ...prev,
                                                        slides: {
                                                            ...prev.slides,
                                                            [slide.id]: { ...prev.slides[slide.id], contentModified: true }
                                                        }
                                                        }));
                                                    }}
                                                    placeholder="Enter dialogue"
                                                    className="w-full p-2 rounded-lg bg-gray-500 h-20"
                                                    />
                                                </div>
                                                ))}
                                            </div>
                                            ) : (
                                            <div className="text-center p-4">
                                                <input
                                                type="file"
                                                accept=".pdf"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                    const updatedSlides = [...episodeData.slides];
                                                    updatedSlides[index].content.pdfFile = file;
                                                    setEpisodeData(prev => ({ ...prev, slides: updatedSlides }));
                                                    setModifications(prev => ({
                                                        ...prev,
                                                        slides: {
                                                        ...prev.slides,
                                                        [slide.id]: { ...prev.slides[slide.id], pdfModified: true }
                                                        }
                                                    }));
                                                    }
                                                }}
                                                className="hidden"
                                                id={`pdfUpload-${index}`}
                                                />
                                                <label
                                                htmlFor={`pdfUpload-${index}`}
                                                className="cursor-pointer inline-block"
                                                >
                                                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                                                <p className="text-gray-400">Click to upload PDF</p>
                                                </label>
                                                {slide.content.pdfFile && (
                                                <p className="mt-2 text-green-500">Selected: {slide.content.pdfFile.name}</p>
                                                )}
                                            </div>
                                            )}
                                        </div>
                                        </div>
                                    )}
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold text-lg transition duration-200 disabled:opacity-50"
            >
              {loading ? "Saving Changes..." : "Save Changes"}
            </button>
          </form>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading episode details...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditEpisode;
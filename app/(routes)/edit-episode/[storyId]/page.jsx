"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Plus, X, Upload, ArrowUp, ArrowDown } from "lucide-react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const EditEpisode = () => {
  const router = useRouter();
  const { storyId } = useParams();
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState("");
  const [error, setError] = useState("");
  const [fetchedCharacters, setFetchedCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [storyType, setStoryType] = useState(null);
  const [episodeAudio, setEpisodeAudio] = useState(null);
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
  // this state for PDF upload confirmation
  const [pdfUploadConfirm, setPdfUploadConfirm] = useState({
    show: false,
    slideIndex: null,
    file: null
  });

  const [cropState, setCropState] = useState({
    slideIndex: null,
    showCropModal: false,
    imgSrc: null,
    crop: {
      unit: '%',
      width: 90,
      aspect: 9 / 16
    },
    completedCrop: null
  });

  const BASE_IMAGE_URL = 'https://wowfy.in/testusr/images/';
  const BASE_VIDEO_URL = 'https://wowfy.in/testusr/videos/';

  // Then update the PDF upload handler:
  const handlePdfFileSelect = (index, file) => {
    if (file) {
      setPdfUploadConfirm({
        show: true,
        slideIndex: index,
        file: file
      });
    }
  };


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

      // Handle episode audio if it exists
      if (data.audio) {
        setEpisodeAudio({
          name: data.audio.name,
          preview: data.audio.preview // Assuming the audio URL is stored here
        });
      }

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
                  id: line.id, // Add message ID
                  character: line.character || "",
                  line: line.line || "",
                })),
                pdfFile: slide.content.pdfFile ? { name: slide.content.pdfFile.name } : null,
                audio: slide.content.audio ? { name: slide.content.audio.name } : null
              }
              : slide.type === "conversation"
                ? {
                  characters: slide.content.characters.map((char) => ({
                    name: char.name,
                    isSender: char.isSender,
                  })),
                  inputType: slide.content.inputType || "manual",
                  storyLines: slide.content.storyLines.map((line) => ({
                    id: line.id, // Add message ID
                    character: line.character || "",
                    line: line.line || "",
                  })),
                  pdfFile: slide.content.pdfFile ? { name: slide.content.pdfFile.name } : null,
                  audio: slide.content.audio ? { name: slide.content.audio.name } : null,
                  backgroundImage: slide.content.backgroundImage ? { preview: slide.content.backgroundImage.preview } : null
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
              } : slide.type === "pedometer" ? {
                description: slide.content.description || "",
                targetSteps: slide.content.targetSteps || 0,
                audio: slide.content.audio ? { name: slide.content.audio.name } : null
              } :
              slide.type === "location" ? {
                description: slide.content.description || "",
                latitude: slide.content.latitude || 0,
                longitude: slide.content.longitude || 0,
                radius: slide.content.radius || 0,
                audio: slide.content.audio ? { name: slide.content.audio.name } : null
              } :
             {},
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

  // Add these handlers for episode audio
const handleEpisodeAudioUpload = (file) => {
  if (file) {
    if (!file.type.startsWith('audio/')) {
      setError('Please upload an audio file (MP3, WAV, etc.)');
      return;
    }
    setEpisodeAudio({
      file: file,
      name: file.name
    });
    setModifications(prev => ({
      ...prev,
      episodeAudioModified: true
    }));
  }
};

const handleRemoveEpisodeAudio = () => {
  setEpisodeAudio(null);
  setModifications(prev => ({
    ...prev,
    episodeAudioModified: true,
    episodeAudioRemoved: true
  }));
};


  const fetchCharacters = async () => {
    try {
      const response = await fetch(`/api/stories/${storyId}/characters`);
      if (!response.ok) throw new Error("Failed to fetch characters");
      const data = await response.json();
      setFetchedCharacters(data.characters);
      setStoryType(data.storyType[0].storyType); // Add this line
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

  // const handleAddSlide = (type) => {
  //   const newSlideId = `temp-${Date.now()}`;
  //   const defaultCharacterCount = 2;
  //   const emptyCharacters = Array.from({ length: defaultCharacterCount }, (_, index) => ({
  //     name: "",
  //     isSender: index === 0,
  //   }));
    
  //   const newSlide = {
  //     id: newSlideId,
  //     type,
  //     position: episodeData.slides.length,
  //     isNew: true, // Add this flag
  //     content:
  //       type === "image"
  //         ? { media: null, description: "", audio: null }
  //         : type === "quiz"
  //         ? {
  //             media: null,
  //             question: "",
  //             options: [{ text: "", is_correct: false }, { text: "", is_correct: false }],
  //             audio: null,
  //           } : type === "pedometer" ? {
  //             description: "",
  //             targetSteps: 0,
  //             audio: null
  //           } :
  //           type === "location" ? {
  //             description: "",
  //             latitude: 0,
  //             longitude: 0,
  //             radius: 0,
  //             audio: null
  //           }
  //         : {
  //             characters: emptyCharacters,
  //             inputType: "manual",
  //             storyLines: [{ character: "", line: "" }],
  //             pdfFile: null,
  //             audio: null,
  //           },
  //   };
    
  //   setEpisodeData((prev) => ({ ...prev, slides: [...prev.slides, newSlide] }));
    
  //   // Update modifications state to track the new slide
  //   setModifications((prev) => ({
  //     ...prev,
  //     slides: { 
  //       ...prev.slides, 
  //       [newSlideId]: { 
  //         isNew: true,
  //         type: type,
  //         position: episodeData.slides.length,
  //         contentModified: true,
  //         initialContent: true // Add this to track that this is the initial content
  //       } 
  //     },
  //   }));
  // };

  // 1. First, update the handleAddSlide function to include the conversation type
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
      isNew: true,
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
          : type === "conversation"
          ? {
              backgroundImage: null,
              characters: emptyCharacters,
              inputType: "manual",
              storyLines: [{ character: "", line: "" }],
              pdfFile: null,
              audio: null,
            }
          : type === "chat"
          ? {
              characters: emptyCharacters,
              inputType: "manual",
              storyLines: [{ character: "", line: "" }],
              pdfFile: null,
              audio: null,
            }
          : type === "pedometer"
          ? {
              description: "",
              targetSteps: 0,
              audio: null,
            }
          : type === "location"
          ? {
              description: "",
              latitude: 0,
              longitude: 0,
              radius: 0,
              audio: null,
            }
          : {}
    };
    
    setEpisodeData((prev) => ({ ...prev, slides: [...prev.slides, newSlide] }));
    
    setModifications((prev) => ({
      ...prev,
      slides: { 
        ...prev.slides, 
        [newSlideId]: { 
          isNew: true,
          type: type,
          position: episodeData.slides.length,
          contentModified: true,
          initialContent: true
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


  // const handleMediaUploadWithCrop = async (index, file) => {
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setCropState(prev => ({
  //         ...prev,
  //         slideIndex: index,
  //         showCropModal: true,
  //         imgSrc: reader.result
  //       }));
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };
  
  const handleMediaUploadWithCrop = async (index, file) => {
    if (file) {
      if (file.type.startsWith('video/')) {
        // Handle video directly without cropping
        const reader = new FileReader();
        reader.onloadend = () => {
          const updatedSlides = [...episodeData.slides];
          const currentSlide = updatedSlides[index];
          
          currentSlide.content.media = {
            file: file,
            preview: reader.result,
            type: 'video'
          };
          
          setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
          
          setModifications((prev) => ({
            ...prev,
            slides: { 
              ...prev.slides, 
              [currentSlide.id]: { 
                mediaModified: true,
                fileChanged: true
              } 
            },
          }));
        };
        reader.readAsDataURL(file);
      } else {
        // Existing image handling with crop
        const reader = new FileReader();
        reader.onloadend = () => {
          setCropState(prev => ({
            ...prev,
            slideIndex: index,
            showCropModal: true,
            imgSrc: reader.result
          }));
        };
        reader.readAsDataURL(file);
      }
    }
  };
  
  const getCroppedImg = async () => {
    const image = document.createElement('img');
    image.src = cropState.imgSrc;
    
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      
      canvas.width = cropState.completedCrop.width;
      canvas.height = cropState.completedCrop.height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        image,
        cropState.completedCrop.x * scaleX,
        cropState.completedCrop.y * scaleY,
        cropState.completedCrop.width * scaleX,
        cropState.completedCrop.height * scaleY,
        0,
        0,
        cropState.completedCrop.width,
        cropState.completedCrop.height
      );
  
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Canvas is empty');
          return;
        }
        const croppedFile = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
        resolve(croppedFile);
      }, 'image/jpeg', 0.95);
    });
  };
  
  const handleCropComplete = async () => {
    if (cropState.completedCrop?.width && cropState.completedCrop?.height) {
      const croppedFile = await getCroppedImg();
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedSlides = [...episodeData.slides];
        const currentSlide = updatedSlides[cropState.slideIndex];
        
        currentSlide.content.media = {
          file: croppedFile,
          preview: reader.result,
          type: croppedFile.type.split("/")[0],
        };
        
        setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
        
        setModifications((prev) => ({
          ...prev,
          slides: { 
            ...prev.slides, 
            [currentSlide.id]: { 
              mediaModified: true,
              fileChanged: true
            } 
          },
        }));
      };
      reader.readAsDataURL(croppedFile);
    }
    
    setCropState(prev => ({
      ...prev,
      showCropModal: false,
      slideIndex: null,
      completedCrop: null
    }));
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
//  // Issue 2: Fix story line change tracking
//   const handleStoryLineChange = (slideIndex, lineIndex, field, value) => {
//     const updatedSlides = [...episodeData.slides];
//     const currentSlide = updatedSlides[slideIndex];
    
//     if (!currentSlide.content.storyLines[lineIndex]) {
//       currentSlide.content.storyLines[lineIndex] = {};
//     }
//     currentSlide.content.storyLines[lineIndex][field] = value;
    
//     setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
    
//     // Enhanced modification tracking
//     setModifications((prev) => ({
//       ...prev,
//       slides: { 
//         ...prev.slides, 
//         [currentSlide.id]: { 
//           ...prev.slides[currentSlide.id],
//           contentModified: true,
//           storyLineChanges: {
//             ...(prev.slides[currentSlide.id]?.storyLineChanges || {}),
//             [lineIndex]: {
//               ...(prev.slides[currentSlide.id]?.storyLineChanges?.[lineIndex] || {}),
//               [field]: value,
//               modified: true
//             }
//           }
//         } 
//       },
//     }));
//   };

    const handleStoryLineChange = (slideIndex, lineIndex, field, value) => {
      console.log(slideIndex, lineIndex, field, value)
      const updatedSlides = [...episodeData.slides];
      const currentSlide = updatedSlides[slideIndex];
      
      if (!currentSlide.content.storyLines[lineIndex]) {
        currentSlide.content.storyLines[lineIndex] = {};
      }
      
      const messageId = currentSlide.content.storyLines[lineIndex].id;
      console.log("messageId", messageId)

      currentSlide.content.storyLines[lineIndex][field] = value;
      
      setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
      
      // Enhanced modification tracking including message ID
      setModifications((prev) => ({
        ...prev,
        slides: { 
          ...prev.slides, 
          [currentSlide.id]: { 
            ...prev.slides[currentSlide.id],
            contentModified: true,
            storyLineChanges: {
              ...(prev.slides[currentSlide.id]?.storyLineChanges || {}),
              [messageId || lineIndex]: {
                ...(prev.slides[currentSlide.id]?.storyLineChanges?.[messageId || lineIndex] || {}),
                [field]: value,
                modified: true,
                id: messageId
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
      if (modifications.episodeAudioModified) {
        
        formData.append("episodeAudioModified", true);

        if (episodeAudio?.file) {
          const audioUpload = await uploadAudioToCPanel(episodeAudio.file)
          console.log("audioUpload", audioUpload)
          formData.append("episodeAudio", audioUpload);
        } else if (modifications.episodeAudioRemoved) {
          formData.append("removeEpisodeAudio", "true");
        }
      }
  
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
          // slide.content.media.file = mediaPath; // Update file path
          slide.content.media = {
            file: mediaPath,  // Only send file name
            type: slide.content.media.type, // Keep the type
          };
        }
        if (slide.content.audio?.file) {
          const audioPath = await uploadAudioToCPanel(slide.content.audio.file);
          // slide.content.audio.file = audioPath; // Update file path
          slide.content.media = {
            file: audioPath,  // Only send file name
            type: 'audio' // Keep the type
            // type: slide.content.media.type,
          };
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

            {/* Episode Audio */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Episode Audio (Optional)</label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleEpisodeAudioUpload(e.target.files[0])}
                  className="hidden"
                  id="episode-audio"
                />
                <label 
                  htmlFor="episode-audio"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 cursor-pointer"
                >
                  <Upload className="h-5 w-5" />
                  <span>Upload Episode Audio</span>
                </label>
                
                {episodeAudio && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{episodeAudio.name}</span>
                    <button
                      type="button"
                      onClick={handleRemoveEpisodeAudio}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

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
            {storyType === "game" && (
              <>
                <button
                  type="button"
                  onClick={() => handleAddSlide("quiz")}
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg mr-2"
                >
                  Add Quiz Slide
                </button>
                <button
                  type="button"
                  onClick={() => handleAddSlide("pedometer")}
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg mr-2"
                >
                  Add Step Task Slide
                </button>
                <button
                  type="button"
                  onClick={() => handleAddSlide("location")}
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg"
                >
                  Add Location Task Slide
                </button>
              </>
            )}

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
                                      onChange={(e) => handleMediaUploadWithCrop(index, e.target.files[0])}
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
                                          Recommended: 1080x1920px (9:16 aspect ratio)
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
                                  <div className="flex items-center gap-2 mt-4">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updatedSlides = [...episodeData.slides];
                                        updatedSlides[index].content.characters.push({
                                          name: "",
                                          isSender: false
                                        });
                                        setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
                                        setModifications((prev) => ({
                                          ...prev,
                                          slides: { 
                                            ...prev.slides, 
                                            [slide.id]: { 
                                              ...prev.slides[slide.id],
                                              charactersModified: true,
                                              characterAdded: true
                                            }
                                          },
                                        }));
                                      }}
                                      className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg"
                                    >
                                      <Plus className="w-4 h-4 mr-1 inline" /> Add Character
                                    </button>
                                  </div>
                              </div>

                                <h4>Expand/Collapse Chats</h4>
                                {slide.content.storyLines.map((line, lineIndex) => (
                                  <div key={lineIndex} className="mt-2">
                                    <select
                                      value={line.character}
                                      // onChange={(e) => {
                                      //   const updatedSlides = [...episodeData.slides];
                                      //   updatedSlides[index].content.storyLines[lineIndex].character = e.target.value;
                                      //   setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
                                      //   setModifications((prev) => ({
                                      //     ...prev,
                                      //     slides: { ...prev.slides, [slide.id]: { contentModified: true } },
                                      //   }));
                                      // }}
                                      onChange={(e) => handleStoryLineChange(index, lineIndex, 'character', e.target.value)}
                                      className="w-full p-2 rounded-lg bg-gray-500"
                                    >
                                      <option value="">Select Character</option>
                                      {/* {fetchedCharacters.map((char) => (
                                        <option key={char.id} value={char.name}>
                                          {char.name}
                                        </option>
                                      ))} */}
                                      {slide.content.characters.map((char, idx) => (
                                          <option key={idx} value={char.name}>{char.name}</option>
                                      ))}
                                    </select>
                                    <textarea
                                      value={line.line}
                                      onChange={(e) => handleStoryLineChange(index, lineIndex, 'line', e.target.value)}
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
                                  // onChange={(e) => {
                                  //   const file = e.target.files[0];
                                  //   if (file) {
                                  //     const updatedSlides = [...episodeData.slides];
                                  //     updatedSlides[index].content.pdfFile = file;
                                  //     setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
                                  //     setModifications((prev) => ({
                                  //       ...prev,
                                  //       slides: { ...prev.slides, [slide.id]: { pdfModified: true } },
                                  //     }));
                                  //   }
                                  // }}
                                  onChange={(e) => handlePdfFileSelect(index,  e.target.files[0])}
                                   
                                  className="hidden"
                                  id={`pdfUpload-${index}`}
                                />
                                <label htmlFor={`pdfUpload-${index}`} className="cursor-pointer">
                                  Upload PDF
                                </label>
                                {slide.content.pdfFile?.name && <p>Selected: {slide.content.pdfFile.name}</p>}
                              </>
                            )}

                            {slide.type === "conversation" && (
                              <>
                                <div className="bg-gray-600 p-4 rounded-lg">
                                  <h4 className="font-medium mb-4">Background Image</h4>
                                  <div className="flex items-center gap-4 mb-4">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleMediaUploadWithCrop(index, e.target.files[0])}
                                      className="hidden"
                                      id={`bgImage-${index}`}
                                    />
                                    <label 
                                      htmlFor={`bgImage-${index}`}
                                      className="flex items-center gap-2 px-4 py-2 bg-gray-500 rounded-lg hover:bg-gray-400 cursor-pointer"
                                    >
                                      <Upload className="h-5 w-5" />
                                      <span>Upload Background Image</span>
                                    </label>
                                    
                                    {slide.content.backgroundImage && (
                                      <div className="flex items-center gap-2">
                                        <img 
                                          src={`${BASE_IMAGE_URL}${slide.content.backgroundImage.preview}`}
                                          alt="Background Preview" 
                                          className="h-10 w-10 object-cover rounded"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updatedSlides = [...episodeData.slides];
                                            updatedSlides[index].content.backgroundImage = null;
                                            setEpisodeData(prev => ({ ...prev, slides: updatedSlides }));
                                            setModifications(prev => ({
                                              ...prev,
                                              slides: {
                                                ...prev.slides,
                                                [slide.id]: {
                                                  ...prev.slides[slide.id],
                                                  backgroundImageModified: true,
                                                  backgroundImageRemoved: true
                                                }
                                              }
                                            }));
                                          }}
                                          className="text-red-400 hover:text-red-300"
                                        >
                                          <X className="h-4 w-4" />
                                        </button>
                                      </div>
                                    )}
                                  </div>

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

                                {/* Rest of the chat functionality remains the same */}
                                <h4>Story Lines</h4>
                                {slide?.content?.storyLines?.map((line, lineIndex) => (
                                  <div key={lineIndex} className="mt-2">
                                    <select
                                      value={line.character}
                                      onChange={(e) => handleStoryLineChange(index, lineIndex, 'character', e.target.value)}
                                      className="w-full p-2 rounded-lg bg-gray-500"
                                    >
                                      <option value="">Select Character</option>
                                      {slide.content.characters.map((char, idx) => (
                                        <option key={idx} value={char.name}>{char.name}</option>
                                      ))}
                                    </select>
                                    <textarea
                                      value={line.line}
                                      onChange={(e) => handleStoryLineChange(index, lineIndex, 'line', e.target.value)}
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
                              </>
                            )}

                            {slide.type === "quiz" && (
                              <>
                              <div className="flex items-center gap-4 mb-4">
                                <div className="flex-1">
                                <input
                                  type="file"
                                  accept="image/*, video/*, image/gif"
                                  onChange={(e) => handleMediaUploadWithCrop(index, e.target.files[0])}
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
                                      Recommended: 1080x1920px (9:16 aspect ratio)
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

                            {slide.type === "pedometer" && (
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium mb-2">Challenge Description</label>
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
                                    className="w-full p-3 rounded-lg bg-gray-600 focus:ring-2 focus:ring-purple-600 h-24"
                                    placeholder="Describe the step challenge"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">Target Steps</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={slide.content.targetSteps}
                                    onChange={(e) => {
                                      const updatedSlides = [...episodeData.slides];
                                      updatedSlides[index].content.targetSteps = parseInt(e.target.value) || 0;
                                      setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
                                      setModifications((prev) => ({
                                        ...prev,
                                        slides: { ...prev.slides, [slide.id]: { targetStepsModified: true } },
                                      }));
                                    }}
                                    className="w-full p-3 rounded-lg bg-gray-600 focus:ring-2 focus:ring-purple-600"
                                    placeholder="Enter number of steps required"
                                  />
                                </div>
                              </div>
                            )}

                            {slide.type === "location" && (
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium mb-2">Challenge Description</label>
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
                                    className="w-full p-3 rounded-lg bg-gray-600 focus:ring-2 focus:ring-purple-600 h-24"
                                    placeholder="Describe the location challenge"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium mb-2">Latitude</label>
                                    <input
                                      type="number"
                                      step="0.000001"
                                      value={slide.content.latitude}
                                      onChange={(e) => {
                                        const updatedSlides = [...episodeData.slides];
                                        updatedSlides[index].content.latitude = parseFloat(e.target.value) || 0;
                                        setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
                                        setModifications((prev) => ({
                                          ...prev,
                                          slides: { ...prev.slides, [slide.id]: { latitudeModified: true } },
                                        }));
                                      }}
                                      className="w-full p-3 rounded-lg bg-gray-600 focus:ring-2 focus:ring-purple-600"
                                      placeholder="Enter latitude coordinate"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-2">Longitude</label>
                                    <input
                                      type="number"
                                      step="0.000001"
                                      value={slide.content.longitude}
                                      onChange={(e) => {
                                        const updatedSlides = [...episodeData.slides];
                                        updatedSlides[index].content.longitude = parseFloat(e.target.value) || 0;
                                        setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
                                        setModifications((prev) => ({
                                          ...prev,
                                          slides: { ...prev.slides, [slide.id]: { longitudeModified: true } },
                                        }));
                                      }}
                                      className="w-full p-3 rounded-lg bg-gray-600 focus:ring-2 focus:ring-purple-600"
                                      placeholder="Enter longitude coordinate"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">Radius (meters)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={slide.content.radius}
                                    onChange={(e) => {
                                      const updatedSlides = [...episodeData.slides];
                                      updatedSlides[index].content.radius = parseInt(e.target.value) || 0;
                                      setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
                                      setModifications((prev) => ({
                                        ...prev,
                                        slides: { ...prev.slides, [slide.id]: { radiusModified: true } },
                                      }));
                                    }}
                                    className="w-full p-3 rounded-lg bg-gray-600 focus:ring-2 focus:ring-purple-600"
                                    placeholder="Enter radius in meters"
                                  />
                                </div>
                              </div>
                            )}

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

      {cropState.showCropModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full">
            <h3 className="text-xl font-semibold mb-4">Adjust Image Crop</h3>
            <div className="relative max-h-[60vh] overflow-auto mb-4">
              <ReactCrop
                crop={cropState.crop}
                onChange={(c) => setCropState(prev => ({ ...prev, crop: c }))}
                onComplete={(c) => setCropState(prev => ({ ...prev, completedCrop: c }))}
                aspect={9 / 16}
              >
                <img
                  src={cropState.imgSrc}
                  alt="Crop Preview"
                  className="max-w-full"
                />
              </ReactCrop>
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setCropState(prev => ({ 
                  ...prev, 
                  showCropModal: false, 
                  slideIndex: null,
                  completedCrop: null 
                }))}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropComplete}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors"
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}

    {/* pdf the confirmation modal*/}  
    {pdfUploadConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md">
            <h3 className="text-xl font-bold mb-4">Warning</h3>
            <p className="mb-4">Uploading a new PDF will replace all existing chat messages. Do you want to continue?</p>
            <div className="flex justify-end gap-4">
              <button 
                className="bg-gray-600 px-4 py-2 rounded-lg"
                onClick={() => setPdfUploadConfirm({show: false, slideIndex: null, file: null})}
              >
                Cancel
              </button>
              <button 
                className="bg-red-600 px-4 py-2 rounded-lg"
                onClick={() => {
                  const updatedSlides = [...episodeData.slides];
                  updatedSlides[pdfUploadConfirm.slideIndex].content.pdfFile = pdfUploadConfirm.file;
                  updatedSlides[pdfUploadConfirm.slideIndex].content.inputType = 'pdf';
                  setEpisodeData((prev) => ({ ...prev, slides: updatedSlides }));
                  setModifications((prev) => ({
                    ...prev,
                    slides: { 
                      ...prev.slides, 
                      [updatedSlides[pdfUploadConfirm.slideIndex].id]: { 
                        pdfModified: true,
                        contentModified: true,
                        // Clear any existing story line changes since they'll be replaced
                        storyLineChanges: {}
                      }
                    },
                  }));
                  setPdfUploadConfirm({show: false, slideIndex: null, file: null});
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditEpisode;
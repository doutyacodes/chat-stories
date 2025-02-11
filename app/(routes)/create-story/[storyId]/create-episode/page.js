"use client"

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Plus, X, Upload } from "lucide-react";
import axios from 'axios'; // Make sure to install axios
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Alert, AlertDescription } from "@/components/ui/alert";


const CreateEpisode = () => {
  const router = useRouter();
  const { storyId } = useParams();
  const [error, setError] = useState("");
  const [characters, setCharacters] = useState([]);
  const [fetchedCharacters, setFetchedCharacters] = useState([]); // Store fetched characters
  const [storyType, setStoryType] = useState(null);
  const [slides, setSlides] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showCropModal, setShowCropModal] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(null);
  const [episodeAudio, setEpisodeAudio] = useState(null);
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);
  const [crop, setCrop] = useState({
    unit: '%',
    width: 90,
    aspect: 9 / 16 // Note: Changed to 9:16 ratio
  });
  const [completedCrop, setCompletedCrop] = useState(null);
console.log(storyType)
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
    ...(storyType === "game" ? [{ value: "quiz", label: "Quiz Slide" }] : [])
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
        setStoryType(data.storyType[0].storyType); // Store fetched characters in state
        } catch (error) {
        setError("Failed to load characters");
        console.error(error);
        }
    };

    // Add these new utility functions
    const setFieldError = (field, message) => {
      setErrors(prev => ({ ...prev, [field]: message }));
    };

    const clearFieldError = (field) => {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
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
        content: type === "quiz" ? {
          media: null,
          quizType: "multiple",
          question: "",
          options: [
            { text: "", is_correct: false },
            { text: "", is_correct: false }
          ],
          answer: "", // For normal quiz type
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

  const validateImage = (file) => {
    if (file.type.startsWith("video/")) return true; // Skip validation for videos
  
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
  
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        const width = img.width;
        const height = img.height;
  
        // Validate 9:16 aspect ratio for any type
        const aspectRatio = width / height;
        const expectedRatio = 9 / 16;
        const tolerance = 0.1; // 10% tolerance
  
        if (Math.abs(aspectRatio - expectedRatio) > tolerance) {
          reject("Image must have a 9:16 aspect ratio (recommended: 1080x1920px)");
        } else if (width < 1080 || height < 1920) {
          reject("Image resolution is too low. Recommended: 1080x1920px");
        }
        resolve(true);
      };
  
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject("Error loading image");
      };
    });
  };
  

  const handleImageUpload = async (index, file) => {
    if (file) {
      try {
        // Get the slide type for validation
        const slideType = episodeData.slides[index].type;
        
        // Validate the image
        await validateImage(file, slideType);
        
        // If validation passes, proceed with upload
        const reader = new FileReader();
        reader.onloadend = () => {
          handleImageSlideChange(index, 'media', {
            file: file,
            preview: reader.result
          });
        };
        reader.readAsDataURL(file);
      } catch (error) {
        setError(error);
        // Clear the error after 5 seconds
        setTimeout(() => setError(''), 5000);
      }
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
  // Add a new handler for quiz type change
  const handleQuizTypeChange = (slideIndex, value) => {
    const updatedSlides = [...episodeData.slides];
    updatedSlides[slideIndex].content.quizType = value;
    // Reset the quiz content based on type
    if (value === "normal") {
      updatedSlides[slideIndex].content.options = [];
      updatedSlides[slideIndex].content.answer = "";
    } else {
      updatedSlides[slideIndex].content.options = [
        { text: "", is_correct: false },
        { text: "", is_correct: false }
      ];
      updatedSlides[slideIndex].content.answer = "";
    }
    setEpisodeData(prev => ({ ...prev, slides: updatedSlides }));
  };

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

  // Add these new handler functions
  const handleAudioUpload = (slideIndex, file) => {
    if (file) {
      if (!file.type.startsWith('audio/')) {
        setError('Please upload an audio file (MP3, WAV, etc.)');
        return;
      }
      
      const updatedSlides = [...episodeData.slides];
      updatedSlides[slideIndex].content.audio = {
        file: file,
        name: file.name
      };
      setEpisodeData(prev => ({ ...prev, slides: updatedSlides }));
    }
  };

  const handleRemoveAudio = (slideIndex) => {
    const updatedSlides = [...episodeData.slides];
    updatedSlides[slideIndex].content.audio = null;
    setEpisodeData(prev => ({ ...prev, slides: updatedSlides }));
  };

  /* episode audio */

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
    }
  };
  
  const handleRemoveEpisodeAudio = () => {
    setEpisodeAudio(null);
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
// const handleMediaUpload = async (index, file) => {
//   if (file) {
//     try {
//       const slideType = episodeData.slides[index].type;
      
//       // Only validate images (skip validation for videos/gifs)
//       if (file.type.startsWith('image/') && !file.type.includes('gif')) {
//         await validateImage(file, slideType);
//       }

//       const reader = new FileReader();
//       reader.onloadend = () => {
//         handleImageSlideChange(index, 'media', {
//           file: file,
//           preview: reader.result,
//           type: file.type.split('/')[0] // 'image' or 'video'
//         });
//       };
//       reader.readAsDataURL(file);
//     } catch (error) {
//       setError(error);
//       setTimeout(() => setError(''), 5000);
//     }
//   }
// };

const handleMediaUpload = async (index, file) => {
  if (file) {
    if (file.type.startsWith('video/')) {
      // Handle video directly without cropping
      const reader = new FileReader();
      reader.onloadend = () => {
        handleImageSlideChange(index, 'media', {
          file: file,
          preview: reader.result,
          type: 'video'
        });
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('image/')) {
      setCurrentSlideIndex(index);
      const reader = new FileReader();
      reader.onloadend = () => {
        handleImageSlideChange(index, 'media', {
          file: file,
          preview: reader.result,
          type: 'image'
        });
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  }
};

  const uploadMediaToCPanel = async (file) => {
    const isVideo = file.type.startsWith('video/');
    const formData = new FormData();
    formData.append(isVideo ? 'videoFile' : 'coverImage', file);
  
    try {
      const response = await axios.post(
        `https://wowfy.in/testusr/${isVideo ? 'upload2.php' : 'upload.php'}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
  
      if (response.data.success) {
        return response.data.filePath;
      }
      throw new Error(response.data.error);
    } catch (error) {
      console.error('Upload error:', error);
      setError(`Failed to upload ${isVideo ? 'video' : 'image'}`);
      return null;
    }
  };

  // Add these new image cropping related functions
const onImageLoad = (image) => {
  imgRef.current = image.target;
  const { width, height } = image.target;
  const crop = {
    unit: '%',
    width: 90,
    x: 5,
    y: 5,
    aspect: 9 / 16
  };
  setCrop(crop);
};

const getCroppedImg = async () => {
  try {
    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error('Canvas is empty');
            return;
          }
          blob.name = 'cropped.jpeg';
          resolve(blob);
        },
        'image/jpeg',
        0.95
      );
    });
  } catch (e) {
    console.error('Error creating cropped image:', e);
    return null;
  }
};

const handleCropComplete = async () => {
  try {
    if (completedCrop?.width && completedCrop?.height) {
      const croppedBlob = await getCroppedImg();
      if (croppedBlob) {
        const croppedFile = new File([croppedBlob], 'cropped-image.jpg', { 
          type: 'image/jpeg' 
        });
        const previewUrl = URL.createObjectURL(croppedBlob);
        handleImageSlideChange(currentSlideIndex, 'media', {
          file: croppedFile,
          preview: previewUrl,
          type: 'image'
        });
      }
    }
  } catch (e) {
    setFieldError(`slide${currentSlideIndex}Image`, "Failed to crop image. Please try again.");
  }
  setShowCropModal(false);
};

const handleModalClose = () => {
  setShowCropModal(false);
  handleImageSlideChange(currentSlideIndex, 'media', null);
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
};

  const uploadAudioToCPanel = async (file) => {
    const formData = new FormData();
    formData.append('audioFile', file);
  
    try {
      const response = await axios.post('https://wowfy.in/testusr/audioUpload.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
  
      if (response.data.success) {
        return response.data.filePath;
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('Audio upload error:', error);
      setError('Failed to upload audio');
      return null;
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setIsSubmitting(true);

  // Basic validation
  if (!episodeData.name.trim()) {
    setError("Episode name is required");
    setIsSubmitting(false);
    return;
  }

  try {
    // First, upload all files and clean up media data

    let episodeAudioFileName = null;
    if (episodeAudio?.file) {
      episodeAudioFileName = await uploadAudioToCPanel(episodeAudio.file);
    }

    const slidesWithUploadedFiles = await Promise.all(episodeData.slides.map(async (slide, index) => {
      const updatedSlide = { ...slide };

      // Upload Audio
      if (slide.content.audio?.file) {
        const audioFileName = await uploadAudioToCPanel(slide.content.audio.file);
        updatedSlide.content.audio = audioFileName ? { name: audioFileName } : null;
      }

      // Handle media uploads and clean up preview data
      if ((slide.type === 'image' || slide.type === 'quiz') && slide.content.media?.file) {
        const mediaFileName = await uploadMediaToCPanel(slide.content.media.file);
        // Only include the necessary media data, excluding preview
        updatedSlide.content.media = mediaFileName ? {
          name: mediaFileName,
          type: slide.content.media.type // Keep only essential metadata
        } : null;
      }

      return updatedSlide;
    }));

    // Create a new episodeData with uploaded file names and cleaned up media data
    const updatedEpisodeData = {
      ...episodeData,
      slides: slidesWithUploadedFiles
    };

    // Validate quiz slides before submission
    updatedEpisodeData.slides.forEach((slide, index) => {
      if (slide.type === 'quiz') {
        if (!slide.content.question.trim()) {
          setError('Quiz question is required');
          setIsSubmitting(false);
          throw new Error('Validation failed');
        }
        if (slide.content.quizType === 'multiple') {
          if (slide.content.options.some(opt => !opt.text.trim())) {
            setError('All quiz options must have text');
            setIsSubmitting(false);
            throw new Error('Validation failed');
          }
          if (!slide.content.options.some(opt => opt.is_correct)) {
            setError('Please select a correct answer for quiz');
            setIsSubmitting(false);
            throw new Error('Validation failed');
          }
        } else if (!slide.content.answer.trim()) {
          setError('Answer is required for normal quiz');
          setIsSubmitting(false);
          throw new Error('Validation failed');
        }
      }
    });

    const formData = new FormData();
    formData.append('storyId', storyId);
    formData.append('name', updatedEpisodeData.name);
    formData.append('synopsis', updatedEpisodeData.synopsis);
    formData.append('episodeAudio', episodeAudioFileName);
    formData.append('slides', JSON.stringify(updatedEpisodeData.slides));
    formData.append('characters', JSON.stringify(
      updatedEpisodeData.slides
        .filter(slide => slide.type === 'chat')
        .flatMap(slide => slide.content.characters)
    ));

    // Handle PDF files separately
    updatedEpisodeData.slides.forEach((slide, index) => {
      if (slide.type === 'chat' && slide.content.pdfFile) {
        formData.append(`slides[${index}].pdfFile`, slide.content.pdfFile);
      }
    });

    const response = await fetch('/api/stories/story-slides', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Failed to create episode');

    router.push('/your-stories');
  } catch (error) {
    setError("Failed to create episode. Please try again.");
    console.error(error);
  } finally {
    setIsSubmitting(false);
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
              {errors.name && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{errors.name}</AlertDescription>
                </Alert>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Episode Synopsis</label>
              <textarea
                value={episodeData.synopsis}
                onChange={(e) => setEpisodeData(prev => ({ ...prev, synopsis: e.target.value }))}
                className="w-full p-3 rounded-lg bg-gray-700 focus:ring-2 focus:ring-purple-600 h-24"
                placeholder="Brief description of the episode"
              />
               {errors.name && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertDescription>{errors.name}</AlertDescription>
                  </Alert>
                )}
            </div>

            <div>
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
                              {/* Update the file input section for both image and quiz slides */}
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
                                      9:16 aspect ratio required
                                    </span>
                                  )}
                                </label>
                                {errors.name && (
                                  <Alert variant="destructive" className="mt-2">
                                    <AlertDescription>{errors.name}</AlertDescription>
                                  </Alert>
                                )}
                              </div>
                            {/* {slide.content.media && (
                                <div className="w-32 h-32">
                                <img 
                                    src={slide.content.media.preview} 
                                    alt="Preview" 
                                    className="w-full h-full object-cover rounded-lg" 
                                />
                                </div>
                            )} */}

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
                                 {errors.name && (
                                    <Alert variant="destructive" className="mt-2">
                                      <AlertDescription>{errors.name}</AlertDescription>
                                    </Alert>
                                  )}
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

                        {(slide.type === 'quiz' && storyType == 'game') && (
                          <div className="space-y-4">
                            {/* Image Upload (same as image slide) */}
                            <div className="flex items-center gap-4">
                              {/* Reuse image upload code from image slide */}
                                {/* Update the file input section for both image and quiz slides */}
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
                                        9:16 aspect ratio required
                                      </span>
                                    )}
                                  </label>
                                  {errors.name && (
                                    <Alert variant="destructive" className="mt-2">
                                      <AlertDescription>{errors.name}</AlertDescription>
                                    </Alert>
                                  )}
                                </div>

                                  {/* {slide.content.media && (
                                  <div className="w-32 h-32">
                                      <img 
                                          src={slide.content.media.preview} 
                                          alt="Preview" 
                                          className="w-full h-full object-cover rounded-lg" 
                                      />
                                      </div>
                                  )} */}

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

                             {/* Quiz Type Selector */}
                            <div className="flex items-center gap-4">
                              <label className="text-sm font-medium">Quiz Type:</label>
                              <select
                                value={slide.content.quizType}
                                onChange={(e) => handleQuizTypeChange(index, e.target.value)}
                                className="p-2 rounded-lg bg-gray-600"
                              >
                                <option value="multiple">Multiple Choice</option>
                                <option value="normal">Question & Answer</option>
                              </select>
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
                            {/* {slide.content.options.map((option, optIndex) => (
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
                            )} */}
                            {/* Conditional rendering based on quiz type */}
                            {slide.content.quizType === "multiple" ? (
                              // Existing multiple choice options code
                              <>
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
                              </>
                            ) : (
                              // Normal quiz answer input
                              <input
                                type="text"
                                value={slide.content.answer}
                                onChange={(e) => handleQuizChange(index, 'answer', e.target.value)}
                                placeholder="Enter answer"
                                className="w-full p-3 rounded-lg bg-gray-600"
                              />
                            )}
                          </div>
                        )}
                    </div>
                </React.Fragment>
            ))}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold text-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </div>
            ) : (
              'Create Episode'
            )}
          </button>
        </form>
      </div>
      {showCropModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full">
            <h3 className="text-xl font-semibold mb-4">Adjust Image (Recommended: 9:16 ratio)</h3>
            <div className="relative max-h-[60vh] overflow-auto mb-4">
              <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                onComplete={c => setCompletedCrop(c)}
                aspect={9/16}
              >
                <img
                  ref={imgRef}
                  src={episodeData.slides[currentSlideIndex]?.content?.media?.preview}
                  alt="Crop Preview"
                  onLoad={onImageLoad}
                  className="max-w-full"
                />
              </ReactCrop>
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={handleModalClose}
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
    </div>
  );
};

export default CreateEpisode;
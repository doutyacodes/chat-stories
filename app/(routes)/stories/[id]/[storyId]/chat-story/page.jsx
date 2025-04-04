'use client';

import { useState, useEffect, useRef } from 'react';
import { FaArrowLeft, FaArrowRight, FaCompressAlt, FaEllipsisV, FaExpandAlt, FaPhone, FaVideo, FaVolumeMute, FaVolumeUp, FaTimes  } from 'react-icons/fa';
import { useParams, useRouter } from 'next/navigation';
import AdDisplay from '@/app/components/AdDisplay';
import SlideContainer from '../../../_components/SlideContainer';
// import { SlideContainer } from '../../../_components/SlideContainer';
// import { SlideContainer } from '../../../_components/SlideContainer';

const StorySlides = () => {
  const router = useRouter();
  const { storyId, id:episodeId } = useParams();
  const [slides, setSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [previousSlideIndex, setPreviousSlideIndex] = useState(0);
  const [slideContent, setSlideContent] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatAudio, setChatAudio] = useState(null);
  
  const [conversation, setConversation] = useState([]);
  const [conversationAudio, setConversationAudio] = useState(null);
  const [bgImage, setBgImage] = useState([]);

  const [storyData, setStoryData] = useState([]);
  const [episodeAudio, setEpisodeAudio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLastSlide, setIsLastSlide] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [nextEpisode, setNextEpisode] = useState(null);

  const [showAd, setShowAd] = useState(false);

  /* ----------------------- */
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);

  const [quizData, setQuizData] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showError, setShowError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentAudio, setCurrentAudio] = useState(null); 
  const audioRef = useRef(null);

  const [isEpisodeMuted, setIsEpisodeMuted] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const episodeAudioRef = useRef(null);  
  const [nextSlideType, setNextSlideType] = useState(null);

  const [showWrongAnswerModal, setShowWrongAnswerModal] = useState(false);
  const [showCorrectAnswerModal, setShowCorrectAnswerModal] = useState(false);
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(true);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(() => {
    // Check localStorage for saved preference
    const savedPreference = localStorage.getItem('fullscreenPreference');
    // Show prompt only if no preference is saved
    return savedPreference === null;
  });

  const [pedometerData, setPedometerData] = useState(null);
  const [currentSteps, setCurrentSteps] = useState(0);
  const [isPedometerStarted, setIsPedometerStarted] = useState(false);
  const [pedometerCompleted, setPedometerCompleted] = useState(false);
  const [locationData, setLocationData] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [locationCompleted, setLocationCompleted] = useState(false);
  const [watchId, setWatchId] = useState(null);

  const [showLocationCompletedModal, setShowLocationCompletedModal] = useState(false);


  const BASE_IMAGE_URL = 'https://wowfy.in/testusr/images/';
  const BASE_VIDEO_URL = 'https://wowfy.in/testusr/videos/';

  const currentSlide = slides[currentSlideIndex];

  // Define calculateDistance inside the component but outside any other functions
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  // Then define startLocationTracking, which can now access calculateDistance
  const startLocationTracking = (locationData) => {
    if (!navigator.geolocation) {
      setLocationPermissionDenied(true);
      return;
    }
    console.log("inside the latitude calculation");
    
    const id = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          
          // Calculate distance between user and target
          const distance = calculateDistance(
            position.coords.latitude,
            position.coords.longitude,
            locationData.latitude,
            locationData.longitude
          );

          console.log("distance", distance)
          
          if (distance <= locationData.radius) {
            setLocationCompleted(true);
            setShowLocationCompletedModal(true);
            clearInterval(id); // Stop tracking
            setWatchId(null);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationPermissionDenied(true);
        },
        { enableHighAccuracy: true }
      );
    }, 3000);

    setWatchId(id);
  };
  

  // const toggleFullscreen = async () => {
  //   try {
  //     if (!document.fullscreenElement && !document.webkitFullscreenElement) {
  //       // Enter fullscreen
  //       if (document.documentElement.requestFullscreen) {
  //         await document.documentElement.requestFullscreen();
  //       } else if (document.documentElement.webkitRequestFullscreen) {
  //         await document.documentElement.webkitRequestFullscreen();
  //       }
  //     } else {
  //       // Exit fullscreen
  //       if (document.exitFullscreen) {
  //         await document.exitFullscreen();
  //       } else if (document.webkitExitFullscreen) {
  //         await document.webkitExitFullscreen();
  //       }
  //     }
  //   } catch (err) {
  //     console.error('Error toggling fullscreen:', err);
  //   }
  // };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        // Enter fullscreen
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          await document.documentElement.webkitRequestFullscreen();
        }
        localStorage.setItem('fullscreenPreference', 'fullscreen');
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        }
        localStorage.setItem('fullscreenPreference', 'normal');
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 640);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const savedPreference = localStorage.getItem('fullscreenPreference');
    if (savedPreference === 'fullscreen' && !document.fullscreenElement) {
      toggleFullscreen();
    }
  }, []); // Run once on mount
  
  // 3. Update your audio useEffect to this:
  useEffect(() => {
    // Clean up previous audio
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audioUrl =
    slideContent?.audio_url ||
    chatAudio ||
    conversationAudio ||
    quizData?.audio_url;

    if (audioUrl) {
      // Create new audio instance
      const newAudio = new Audio(`https://wowfy.in/testusr/audio/${audioUrl}`);
      newAudio.volume = isMuted ? 0 : 1;
      
      // Store in ref for cleanup
      audioRef.current = newAudio;

      // Add play attempt after user interaction
      const handleFirstInteraction = () => {
        newAudio.play().catch(console.error);
        document.removeEventListener('click', handleFirstInteraction);
      };

      // Try to play automatically if possible
      newAudio.play().catch(() => {
        // If autoplay blocked, wait for user interaction
        console.log('Autoplay blocked, waiting for user interaction...');
        document.addEventListener('click', handleFirstInteraction);
      });

      // Cleanup audio on unmount
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        document.removeEventListener('click', handleFirstInteraction);
      };
    }
  }, [slideContent, chatMessages, quizData, conversation]);

  // 4. Update volume effect
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : 1;
    }
  }, [isMuted]);

  // useEffect(() => {
  //   validateAnswer()
  // }, [hasSubmittedAnswer]);

  useEffect(() => {
    if (hasSubmittedAnswer) {
      if (isAnswerCorrect) {
        setShowCorrectAnswerModal(true);
      } else {
        validateAnswer(); 
      }
    }
  }, [hasSubmittedAnswer, isAnswerCorrect]);

  /* episode audio */
  useEffect(() => {
    // Clean up previous episode audio
    if (episodeAudioRef.current) {
      episodeAudioRef.current.pause();
    }
  console.log("episodeAudio", episodeAudio)
    if (episodeAudio) {
      console.log("inside iff")
      // Create new episode audio instance
      const newAudio = new Audio(`https://wowfy.in/testusr/audio/${episodeAudio}`);
      newAudio.volume = isEpisodeMuted ? 0 : 1;
      newAudio.loop = true; // Make it loop throughout the episode
      
      episodeAudioRef.current = newAudio;
  
      // Add play attempt after user interaction
      const handleFirstInteraction = () => {
        newAudio.play().catch(console.error);
        document.removeEventListener('click', handleFirstInteraction);
      };
  
      // Try to play automatically if possible
      newAudio.play().catch(() => {
        console.log('Episode autoplay blocked, waiting for user interaction...');
        document.addEventListener('click', handleFirstInteraction);
      });
  
      // Cleanup audio on unmount
      return () => {
        if (episodeAudioRef.current) {
          episodeAudioRef.current.pause();
          episodeAudioRef.current = null;
        }
        document.removeEventListener('click', handleFirstInteraction);
      };
    }
  }, [episodeAudio]);
  
  // Update episode audio volume when mute state changes
  useEffect(() => {
    if (episodeAudioRef.current) {
      episodeAudioRef.current.volume = isEpisodeMuted ? 0 : 1;
    }
  }, [isEpisodeMuted]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSettingsOpen && !event.target.closest('.settings-menu')) {
        setIsSettingsOpen(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSettingsOpen]);

  /* episode audio  end*/
  useEffect(() => {
    const fetchInitialSlides = async () => {
      try {
        const slidesResponse = await fetch(`/api/slides/${storyId}/${episodeId}`);
        if (!slidesResponse.ok) throw new Error('Failed to fetch slides');
        
        const slidesData = await slidesResponse.json();
        setSlides(slidesData.slides);
        setStoryData(slidesData.story)
        if(!slidesData.episode_audio === 'null'){
          setEpisodeAudio(slidesData.episode_audio)
        }
        // Fetch content for the first slide using existing function
        if (slidesData.slides.length > 0) {
          const firstSlide = slidesData.slides[0];
          await fetchSlideContent(firstSlide.id, firstSlide.slide_type);
        }
        setLoading(false);

        // Track story view after 5 seconds
        setTimeout(() => {
          trackStoryView(storyId);
        }, 5000);

        // Track user read immediately
        trackUserRead(storyId);

      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
  
    if (storyId && episodeId) {
      fetchInitialSlides();
    }
  }, [storyId, episodeId]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement || document.webkitFullscreenElement));
    };
  
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const checkLocationPermission = async () => {
    if (!navigator.geolocation) {
      setLocationPermissionDenied(true);
      return false;
    }
  
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      if (permission.state === 'denied') {
        setLocationPermissionDenied(true);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking location permission:', error);
      return false;
    }
  };
  
  const fetchSlideContent = async (slideId, slideType) => {
    try {
      setSlideContent(null)
      setChatMessages([])
      setQuizData(null) /* clearning old  */

      setLoading(true);
      setUserAnswer('');
      setIsAnswerCorrect(false);
      setShowError(false);
      
      if (slideType === 'image') {
        const contentResponse = await fetch(`/api/slide-content/${slideId}`);
        if (!contentResponse.ok) throw new Error('Failed to fetch slide content');
        const contentData = await contentResponse.json();
        setSlideContent(contentData);
      } else if (slideType === 'chat') {
        // const chatResponse = await fetch(`/api/chat-messages/${storyId}/${episodeId}`);
        const chatResponse = await fetch(`/api/chat-messages/${storyId}/${episodeId}?slideId=${slideId}`);
        if (!chatResponse.ok) throw new Error('Failed to fetch chat messages');
        const chatData = await chatResponse.json();
        setChatMessages(chatData.chatMessages);
        setChatAudio(chatData.audio_url);
      } else if (slideType === 'conversation') {
        // const chatResponse = await fetch(`/api/chat-messages/${storyId}/${episodeId}`);
        const chatResponse = await fetch(`/api/conversation/${storyId}/${episodeId}?slideId=${slideId}`);
        if (!chatResponse.ok) throw new Error('Failed to fetch chat messages');
        const conversationData = await chatResponse.json();
        setConversation(conversationData.conversation);
        setBgImage(conversationData.bgImage);
        setConversationAudio(conversationData.audio_url);
      } else if (slideType === 'quiz') {
        const quizResponse = await fetch(`/api/quiz-content/${slideId}`);
        if (!quizResponse.ok) throw new Error('Failed to fetch quiz content');
        const quizData = await quizResponse.json();
        setQuizData(quizData);
      } else if (slideType === 'pedometer') {
        const pedometerResponse = await fetch(`/api/pedometer-content/${slideId}`);
        if (!pedometerResponse.ok) throw new Error('Failed to fetch pedometer content');
        const pedometerData = await pedometerResponse.json();
        setPedometerData(pedometerData);
        setCurrentSteps(0);
        setIsPedometerStarted(false);
      } else if (slideType === 'location') {
        const locationResponse = await fetch(`/api/location-content/${slideId}`);
        if (!locationResponse.ok) throw new Error('Failed to fetch location content');
        console.log("log 1")
        const locationData = await locationResponse.json();
        console.log("log 2")
        setLocationData(locationData);
        console.log("log 3")
        
        const hasPermission = await checkLocationPermission();
        if (hasPermission && locationData) {
          startLocationTracking(locationData);
        }
      }
      
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  console.log('locationData', locationData)

  // cleanup 
  useEffect(() => {
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);


  const trackStoryView = async (storyId) => {
    let sessionId = null;
    const token = localStorage.getItem('token');
    
    if (!token) {
      sessionId = sessionStorage.getItem('session_id');
      if (!sessionId) {
        sessionId = 'sess_' + Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('session_id', sessionId);
      }
    }

    try {
      const response = await fetch('/api/analytics/story-views', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          story_id: storyId,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        console.error('Failed to record story view');
      }
    } catch (error) {
      console.error('Error recording view:', error);
    }
  };

  const trackUserRead = async (storyId) => {
    let sessionId = null;
    const token = localStorage.getItem('token');

    if (!token) {
      sessionId = sessionStorage.getItem('session_id');
      if (!sessionId) {
        sessionId = 'sess_' + Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('session_id', sessionId);
      }
    }

    try {
      const response = await fetch('/api/analytics/user-reads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          story_id: storyId,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        console.error('Failed to record user read');
      }
    } catch (error) {
      console.error('Error recording user read:', error);
    }
  };
  
  const validateAnswer = () => {

    if (!userAnswer || !hasSubmittedAnswer) {
      setShowError(true);
      return false;
    }
    
    if (!isAnswerCorrect) {
      console.log("in the not corrcet");

      setShowWrongAnswerModal(true);
      return false;
    }
    
    return true;
  };

  const handleSlideChange = async (direction) => {
    setHasSubmittedAnswer(false);
    setPreviousSlideIndex(currentSlideIndex);
    setPedometerCompleted(false);
  
    // Set next slide type
      //   // Set the next slide type before loading
    if (direction === 'next' && currentSlideIndex < slides.length - 1) {
      setNextSlideType(slides[currentSlideIndex + 1].slide_type);
    } else if (direction === 'previous' && currentSlideIndex > 0) {
      setNextSlideType(slides[currentSlideIndex - 1].slide_type);
    }
    
    try {
      if (direction === 'next') {
        await handleNextSlide();
      } else {
        await handlePreviousSlide();
      }
    } catch (error) {
      console.error('Error changing slide:', error);
    }
  };

  const handleNextSlide = async () => {
    // Stop current audio immediately
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (currentSlide.slide_type === 'quiz' && !validateAnswer()) {
      return;
    }

    const nextIndex = currentSlideIndex + 1;

    // Check if this is the last slide
  if (nextIndex === slides.length - 1) {
    // Fetch next episode data
    try {
      const nextEpisodeResponse = await fetch(`/api/next-episode/${storyId}/${episodeId}`);
      if (nextEpisodeResponse.ok) {
        const nextEpisodeData = await nextEpisodeResponse.json();
        setNextEpisode(nextEpisodeData);
      }
    } catch (err) {
      console.error('Error fetching next episode:', err);
    }
  }

  
  if (nextIndex < slides.length) {
    setLoading(true);
    await fetchSlideContent(slides[nextIndex].id, slides[nextIndex].slide_type);
    setCurrentSlideIndex(nextIndex);
    setIsLastSlide(nextIndex === slides.length - 1);
    setLoading(false);
  }

  };

  const handlePreviousSlide = async () => {

    // Stop current audio immediately
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const prevIndex = currentSlideIndex - 1;
    
    if (prevIndex >= 0) {
      await fetchSlideContent(slides[prevIndex].id, slides[prevIndex].slide_type);
      setCurrentSlideIndex(prevIndex);
      setIsLastSlide(false);
    }
  };

  const handleNextEpisode = () => {
    setHasSubmittedAnswer(false)
    if (nextEpisode) {
      setShowAd(true);
      // router.push(`/stories/${nextEpisode.id}/${storyId}/chat-story`);
    }
  };

  const handleRestart = () => {
    setShowWrongAnswerModal(false);
    window.location.href = `/stories/${episodeId}/${storyId}/chat-story`;
  };
  
  const handleWatchAdForRetry = () => {
    setShowWrongAnswerModal(false);
    setShowAd(true);
    setHasSubmittedAnswer(false);
    setUserAnswer('');
    setShowError(false);
  };
  
  // Modify handleAdComplete
  const handleAdComplete = () => {
    setShowAd(false);
    if (nextEpisode) {
      router.push(`/stories/${nextEpisode.id}/${storyId}/chat-story`);
    }
  };

  // const handleAdComplete = () => {
  //   setShowAd(false);
  //   router.push(`/stories/${nextEpisode.id}/${storyId}/chat-story`);
  // };

  if (error) {
    return (
      <div className="h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Error: {error}</p>
      </div>
    );
  }

  const WrongAnswerModal = ({ isOpen, onRestart, onWatchAd }) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-100">
        <div className="bg-gray-800 p-6 rounded-lg max-w-sm w-full mx-4">
          <h3 className="text-xl font-bold mb-4">Incorrect Answer</h3>
          <p className="mb-6">Your answer was incorrect. Choose an option to continue:</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={onRestart}
              className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Restart Episode
            </button>
            <button
              onClick={onWatchAd}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Watch Ad to Try Again
            </button>
          </div>
        </div>
      </div>
    );
  };

  const CorrectAnswerModal = ({ isOpen, onContinue, isLastSlide, nextEpisode }) => {
    if (!isOpen) return null;
    
    const getModalContent = () => {
      if (!isLastSlide) {
        return {
          message: "You've successfully answered the quiz. You can now proceed to the next slide.",
          buttonText: "Continue to Next Slide"
        };
      } else if (nextEpisode) {
        return {
          message: "You've successfully answered the quiz. Ready to start the next episode?",
          buttonText: "Go to Next Episode"
        };
      } else {
        return {
          message: "You've successfully completed this quiz!",
          buttonText: "Close"
        };
      }
    };
  
    const { message, buttonText } = getModalContent();
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-100">
        <div className="bg-green-800 p-6 rounded-lg max-w-sm w-full mx-4">
          <h3 className="text-xl font-bold mb-4 text-white">Correct Answer!</h3>
          <p className="mb-6 text-gray-200">{message}</p>
          <div className="flex justify-center">
            <button
              onClick={onContinue}
              className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-white"
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const LocationCompletedModal = ({ isOpen, onContinue, isLastSlide, nextEpisode }) => {
    if (!isOpen) return null;
    
    const getModalContent = () => {
      if (!isLastSlide) {
        return {
          message: "You've successfully reached the location! Ready to continue your journey?",
          buttonText: "Continue to Next Slide"
        };
      } else if (nextEpisode) {
        return {
          message: "Location challenge completed! Ready to start the next episode?",
          buttonText: "Go to Next Episode"
        };
      } else {
        return {
          message: "You've successfully completed this location challenge!",
          buttonText: "Close"
        };
      }
    };
  
    const { message, buttonText } = getModalContent();
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-100">
        <div className="bg-green-800 p-6 rounded-lg max-w-sm w-full mx-4">
          <h3 className="text-xl font-bold mb-4 text-white">Location Reached!</h3>
          <p className="mb-6 text-gray-200">{message}</p>
          <div className="flex justify-center">
            <button
              onClick={onContinue}
              className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-white"
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const Navigation = ({ 
    onNext, 
    onPrevious, 
    loading, 
    currentSlideIndex, 
    isLastSlide, 
    nextEpisode, 
    handleNextEpisode,
    isAnswerCorrect 
  }) => (
    <div className="fixed inset-y-0 left-0 right-0 pointer-events-none flex items-center sm:left-[25%]">
      <div className="max-w-[500px] mx-auto w-full px-2">
        <div className="flex justify-between items-center">
          {currentSlideIndex > 0 && (
            <button 
              onClick={onPrevious}
              disabled={loading}
              className={`pointer-events-auto bg-green-600/80 p-4 rounded-full transition-colors shadow-lg backdrop-blur-sm ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700/80'
              }`}
            >
              <FaArrowLeft className="text-white w-6 h-6" />
            </button>
          )}

          {!isLastSlide ? (
            <button 
              onClick={onNext}
              disabled={loading || (currentSlide?.slide_type === 'quiz' && (!isAnswerCorrect || !hasSubmittedAnswer)) ||
                (currentSlide?.slide_type === 'pedometer' && !pedometerCompleted) }
              className={`pointer-events-auto ml-auto p-4 rounded-full transition-colors shadow-lg backdrop-blur-sm ${
                loading || (currentSlide?.slide_type === 'quiz' && (!isAnswerCorrect || !hasSubmittedAnswer))
                  ? 'bg-green-600/80 opacity-50 cursor-not-allowed'
                  : 'bg-green-600/80 hover:bg-green-700/80'
              }`}
            >
              <FaArrowRight className="text-white w-6 h-6" />
            </button>
          ) : nextEpisode ? (
            <button 
              onClick={handleNextEpisode}
              className="pointer-events-auto ml-auto bg-blue-700/80 px-6 py-4 rounded-full hover:bg-blue-600/80 transition-colors shadow-lg backdrop-blur-sm text-white font-medium"
            >
              Next Episode
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );

  // Add this component within your file, before your main component
  const FullscreenPrompt = ({ onAccept, onDecline }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <div className="bg-gray-800 p-6 rounded-lg max-w-sm mx-4">
        <h3 className="text-lg font-semibold mb-2">Enter Fullscreen Mode?</h3>
        <p className="text-gray-300 mb-4">For the best experience, we recommend viewing this story in fullscreen mode.</p>
        <div className="flex gap-3">
          <button
            onClick={onAccept}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
          >
            Enter Fullscreen
          </button>
          <button
            onClick={onDecline}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors"
          >
            Continue Normal
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen relative bg-gray-900 text-white flex flex-col sm:flex-row overflow-hidden">
      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors settings-menu"
        >
          <FaEllipsisV className="text-white w-6 h-6" />
        </button>

        {/* Settings Dropdown */}
        {isSettingsOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg p-2 border border-gray-700 settings-menu">
            <div className="space-y-3">
              {/* Episode Audio Control */}
              <div className="flex items-center justify-between p-2 hover:bg-gray-700 rounded">
                <span className="text-sm">Episode Audio</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEpisodeMuted(!isEpisodeMuted);
                  }}
                  className={`p-2 rounded-full transition-colors ${
                    episodeAudio 
                      ? 'hover:bg-gray-600 bg-gray-700' 
                      : 'bg-gray-600 opacity-50 cursor-not-allowed'
                  }`}
                  disabled={!episodeAudio}
                  title={!episodeAudio ? 'No episode audio available' : ''}
                >
                  {isEpisodeMuted ? (
                    <FaVolumeMute className="text-white w-4 h-4" />
                  ) : (
                    <FaVolumeUp className="text-white w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Slide Audio Control */}
              <div className="flex items-center justify-between p-2 hover:bg-gray-700 rounded">
                <span className="text-sm">Slide Audio</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMuted(!isMuted);
                  }}
                  className={`p-2 rounded-full transition-colors ${
                    (slideContent?.audio_url || chatAudio || quizData?.audio_url)
                      ? 'hover:bg-gray-600 bg-gray-700'
                      : 'bg-gray-600 opacity-50 cursor-not-allowed'
                  }`}
                  disabled={!(slideContent?.audio_url || chatAudio || quizData?.audio_url)}
                  title={!(slideContent?.audio_url || chatAudio || quizData?.audio_url) ? 'No slide audio available' : ''}
                >
                  {isMuted ? (
                    <FaVolumeMute className="text-white w-4 h-4" />
                  ) : (
                    <FaVolumeUp className="text-white w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between p-2 hover:bg-gray-700 rounded">
                <span className="text-sm">
                  {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                </span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFullscreen();
                  }}
                  className="p-2 rounded-full hover:bg-gray-600 bg-gray-700 transition-colors"
                >
                  {isFullscreen ? (
                    <FaCompressAlt className="text-white w-4 h-4" />
                  ) : (
                    <FaExpandAlt className="text-white w-4 h-4" />
                  )}
                </button>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      {!isMobileView && (
        <div className="w-1/4 min-w-[250px] bg-gray-800 p-4 border-r border-gray-700 h-screen">
          <div className="absolute w-[inherit] min-w-[inherit] pr-8">
            <img
              src={`${BASE_IMAGE_URL}${storyData.cover_img}`}
              alt={storyData.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h2 className="text-lg font-bold mb-2">{storyData.title}</h2>
            <p className="text-sm text-gray-300">{storyData.synopsis}</p>
          </div>
        </div>
      )}

      <div className="flex-1 relative overflow-hidden">
        {showAd ? (
          <AdDisplay
            onAdComplete={handleAdComplete}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
          />
        ) : (
          <>
             <SlideContainer
                currentSlide={currentSlide}
                nextSlideType={nextSlideType}
                loading={loading}
                storyData={storyData}
                slideContent={slideContent}
                chatMessages={chatMessages}
                conversation={conversation}
                conversationAudio={conversationAudio}
                bgImage={bgImage}
                quizData={quizData}
                currentSlideIndex={currentSlideIndex}
                previousSlideIndex={previousSlideIndex}
                setIsAnswerCorrect={setIsAnswerCorrect}
                isAnswerCorrect = {isAnswerCorrect}
                userAnswer={userAnswer}
                setUserAnswer={setUserAnswer}
                showError={showError}
                setShowError={setShowError}
                hasSubmittedAnswer={hasSubmittedAnswer}
                setHasSubmittedAnswer={setHasSubmittedAnswer}
                pedometerData={pedometerData}
                currentSteps={currentSteps}
                setCurrentSteps={setCurrentSteps}
                isPedometerStarted={isPedometerStarted}
                setIsPedometerStarted={setIsPedometerStarted}
                setPedometerCompleted={setPedometerCompleted}
                locationData={locationData}
                userLocation={userLocation}
                locationPermissionDenied={locationPermissionDenied}
                calculateDistance={calculateDistance}
                // locationCompleted={locationCompleted}
              />
            <Navigation 
              onNext={() => handleSlideChange('next')}
              onPrevious={() => handleSlideChange('previous')}
              loading={loading}
              currentSlideIndex={currentSlideIndex}
              isLastSlide={isLastSlide}
              nextEpisode={nextEpisode}
              handleNextEpisode={handleNextEpisode}
              isAnswerCorrect={isAnswerCorrect}
            />
          </>
        )}
      </div>

      <WrongAnswerModal 
        isOpen={showWrongAnswerModal}
        onRestart={handleRestart}
        onWatchAd={handleWatchAdForRetry}
      />

    <CorrectAnswerModal 
      isOpen={showCorrectAnswerModal}
      onContinue={() => {
        setShowCorrectAnswerModal(false);
        if (!isLastSlide) {
          handleSlideChange('next');
        } else if (nextEpisode) {
          handleNextEpisode();
        }
      }}
      isLastSlide={isLastSlide}
      nextEpisode={nextEpisode}
    />

    <LocationCompletedModal 
      isOpen={showLocationCompletedModal}
      onContinue={() => {
        setShowLocationCompletedModal(false);
        if (!isLastSlide) {
          handleSlideChange('next');
        } else if (nextEpisode) {
          handleNextEpisode();
        }
      }}
      isLastSlide={isLastSlide}
      nextEpisode={nextEpisode}
    />

      {/* {showFullscreenPrompt && (
        <FullscreenPrompt 
          onAccept={() => {
            toggleFullscreen();
            setShowFullscreenPrompt(false);
          }}
          onDecline={() => {
            setShowFullscreenPrompt(false);
          }}
        />
      )} */}

    {showFullscreenPrompt && (
      <FullscreenPrompt 
        onAccept={() => {
          toggleFullscreen();
          setShowFullscreenPrompt(false);
          localStorage.setItem('fullscreenPreference', 'fullscreen');
        }}
        onDecline={() => {
          setShowFullscreenPrompt(false);
          localStorage.setItem('fullscreenPreference', 'normal');
        }}
      />
    )}

    </div>
  );
};


export default StorySlides;
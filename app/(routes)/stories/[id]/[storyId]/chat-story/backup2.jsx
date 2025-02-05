'use client';

import { useState, useEffect, useRef } from 'react';
import { FaArrowLeft, FaArrowRight, FaEllipsisV, FaPhone, FaVideo, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { useParams, useRouter } from 'next/navigation';
import AdDisplay from '@/app/components/AdDisplay';

const StorySlides = () => {
  const router = useRouter();
  const { storyId, id:episodeId } = useParams();
  const [slides, setSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slideContent, setSlideContent] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatAudio, setChatAudio] = useState(null);
  const [storyData, setStoryData] = useState([]);
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


  const BASE_IMAGE_URL = 'https://wowfy.in/testusr/images/';
  const BASE_VIDEO_URL = 'https://wowfy.in/testusr/videos/';

  console.log('slideContent',slideContent, 'currentSlideIndex', currentSlideIndex)

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 640);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 3. Update your audio useEffect to this:
  useEffect(() => {
    // Clean up previous audio
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audioUrl =
    slideContent?.audio_url ||
    chatAudio ||
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
  }, [slideContent, chatMessages, quizData]);

  // 4. Update volume effect
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : 1;
    }
  }, [isMuted]);


  const fetchSlideContent = async (slideId, slideType) => {
    console.log("log4 slideType",slideId, slideType);

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
        const chatResponse = await fetch(`/api/chat-messages/${storyId}/${episodeId}`);
        if (!chatResponse.ok) throw new Error('Failed to fetch chat messages');
        const chatData = await chatResponse.json();
        setChatMessages(chatData.chatMessages);
        setChatAudio(chatData.audio_url);
      } else if (slideType === 'quiz') {
        const quizResponse = await fetch(`/api/quiz-content/${slideId}`);
        if (!quizResponse.ok) throw new Error('Failed to fetch quiz content');
        const quizData = await quizResponse.json();
        setQuizData(quizData);
      }
      
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialSlides = async () => {
      try {
        const slidesResponse = await fetch(`/api/slides/${storyId}/${episodeId}`);
        if (!slidesResponse.ok) throw new Error('Failed to fetch slides');
        
        const slidesData = await slidesResponse.json();
        setSlides(slidesData.slides);
        setStoryData(slidesData.story)
  
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
  
  const handleQuizAnswer = (answer) => {
    setUserAnswer(answer);
    setShowError(false);
    
    if (quizData.quiz.answer_type === 'multiple_choice') {
      const isCorrect = quizData.quiz.options.find(opt => 
        opt.id === answer && opt.is_correct
      );
      setIsAnswerCorrect(!!isCorrect);
    } else {
      setIsAnswerCorrect(answer === quizData.quiz.correct_answer);
    }
  };

  const validateAnswer = () => {
    if (!userAnswer) {
      setShowError(true);
      return false;
    }
    
    if (!isAnswerCorrect) {
      setShowError(true);
      return false;
    }
    
    return true;
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
    
    if (nextIndex < slides.length) {      
      await fetchSlideContent(slides[nextIndex].id, slides[nextIndex].slide_type);
      setCurrentSlideIndex(nextIndex);
    } else {
      try {
        console.log("log3");
        const nextEpisodeResponse = await fetch(`/api/next-episode/${storyId}/${episodeId}`);
        if (nextEpisodeResponse.ok) {
          const nextEpisodeData = await nextEpisodeResponse.json();
          setNextEpisode(nextEpisodeData);
        }
      } catch (err) {
        console.error('Error fetching next episode:', err);
      }
      setIsLastSlide(true);
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
    if (nextEpisode) {
      setShowAd(true);
      // router.push(`/stories/${nextEpisode.id}/${storyId}/chat-story`);
    }
  };

  const handleAdComplete = () => {
    setShowAd(false);
    router.push(`/stories/${nextEpisode.id}/${storyId}/chat-story`);
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Error: {error}</p>
      </div>
    );
  }

  const currentSlide = slides[currentSlideIndex];

  const ChatView = () => (
    <div className="flex-1 h-full bg-gray-900 overflow-hidden">
      <div className="max-w-[500px] mx-auto h-full flex flex-col bg-gray-800 shadow-lg">
        {/* Fixed Header */}
        <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center">
            <img
              src={`${BASE_IMAGE_URL}${storyData.cover_img}`}
              alt="Profile"
              className="w-10 h-10 rounded-full mr-2"
            />
            <div>
              <h2 className="text-lg font-bold">{storyData.title}</h2>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-gray-300">
            <FaVideo className="w-5 h-5 cursor-pointer hover:text-white" title="Video Call" />
            <FaPhone className="w-5 h-5 cursor-pointer hover:text-white" title="Voice Call" />
            <FaEllipsisV className="w-5 h-5 cursor-pointer hover:text-white" title="Options" />
          </div>
        </div>

        {/* Scrollable Chat Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="p-4">
            <div className="flex flex-col space-y-4">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`relative p-3 rounded-lg max-w-xs ${
                    message.character.is_sender
                      ? 'bg-green-700 text-white self-end'
                      : 'bg-gray-700 text-gray-300 self-start'
                  }`}
                >
                  <strong>{message.character.name}: </strong>
                  <p>{message.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const DetailView = () => (
    <div className="flex-1 h-full bg-gray-900 relative">
      <div className="max-w-[500px] mx-auto h-full relative">
        {slideContent.media_url && (
          <div className="w-full h-full relative">
            {slideContent.media_type === 'video' ? (
              <video
                src={`${BASE_VIDEO_URL}${slideContent.media_url}`}
                autoPlay
                muted
                loop
                controls
                className="w-full h-full object-cover"
                controlsList="nodownload nofullscreen"
                onLoadedMetadata={(e) => e.target.play()}
              />
            ) : (
              <img
                src={`${BASE_IMAGE_URL}${slideContent.media_url}`}
                alt="Slide content"
                className="w-full h-full object-cover"
              />
            )}
            {slideContent.description && (
              <div className="absolute bottom-0 left-0 right-0 h-[37.5%]"> {/* 75% of bottom half */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute inset-0 backdrop-blur-sm bg-black/30" />
                <div className="relative h-full p-6 flex items-center">
                  <p className="text-white text-sm leading-relaxed">
                    {slideContent.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
  
  const QuizView = () => {
    const renderOptions = () => {
      if (quizData.quiz.answer_type === 'multiple_choice') {
        return (
          <div className="grid grid-cols-2 gap-2">
            {quizData.quiz.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleQuizAnswer(option.id)}
                className={`p-2 text-sm text-left rounded-lg transition-colors ${
                  userAnswer === option.id
                    ? option.is_correct
                      ? 'bg-green-700 text-white'
                      : 'bg-red-700 text-white'
                    : 'bg-gray-700/80 hover:bg-gray-600/80'
                }`}
              >
                {option.option_text}
              </button>
            ))}
          </div>
        );
      }
  
      return (
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => handleQuizAnswer(e.target.value)}
          className="w-full p-2 bg-gray-700/80 rounded-lg text-white text-sm"
          placeholder="Type your answer here..."
        />
      );
    };
  
    return (
      <div className="flex-1 h-full bg-gray-900 relative">
        <div className="max-w-[500px] mx-auto h-full relative">
          {quizData.media_url && (
            <div className="w-full h-full relative">
              {quizData.media_type === 'video' ? (
                <video
                  src={`${BASE_VIDEO_URL}${quizData.media_url}`}
                  autoPlay
                  muted
                  loop
                  controls
                  className="w-full h-full object-cover"
                  controlsList="nodownload nofullscreen"
                  onLoadedMetadata={(e) => e.target.play()}
                />
              ) : (
                <img
                  src={`${BASE_IMAGE_URL}${quizData.media_url}`}
                  alt="Quiz visual"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 h-[37.5%]">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute inset-0 backdrop-blur-sm bg-black/30" />
                <div className="relative h-full p-6">
                  <h3 className="text-base font-bold mb-3 text-white">{quizData.quiz.question}</h3>
                  {renderOptions()}
                  {showError && (
                    <p className="text-red-500 mt-2 text-sm">
                      {!userAnswer ? 'Please answer the question to continue!' : 'Incorrect answer, please try again!'}
                    </p>
                  )}
                  {isAnswerCorrect && (
                    <p className="text-green-500 mt-2 text-sm">Correct answer!</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const Navigation = () => (
    <div className="fixed inset-y-0 left-0 right-0 pointer-events-none flex items-center sm:left-[25%]">
      <div className="max-w-[500px] mx-auto w-full px-2">
        <div className="flex justify-between items-center">
          {currentSlideIndex > 0 && (
            <button 
              onClick={handlePreviousSlide}
              className="pointer-events-auto bg-green-600/80 p-4 rounded-full hover:bg-green-700/80 transition-colors shadow-lg backdrop-blur-sm"
            >
              <FaArrowLeft className="text-white w-6 h-6" />
            </button>
          )}
  
          {!isLastSlide ? (
            <button 
              onClick={handleNextSlide}
              className={`pointer-events-auto ml-auto p-4 rounded-full transition-colors shadow-lg backdrop-blur-sm ${
                (currentSlide.slide_type === 'quiz' && !isAnswerCorrect)
                  ? 'bg-green-600/80 cursor-not-allowed'
                  : 'bg-green-600/80 hover:bg-green-700/80'
              }`}
              disabled={currentSlide.slide_type === 'quiz' && !isAnswerCorrect}
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
  

  return (
    <div className="h-screen relative bg-gray-900 text-white flex flex-col sm:flex-row overflow-hidden">
      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
          aria-label={isMuted ? "Unmute audio" : "Mute audio"}
        >
          {isMuted ? (
            <FaVolumeMute className="text-white w-6 h-6" />
          ) : (
            <FaVolumeUp className="text-white w-6 h-6" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      {!isMobileView && (
        <div className="w-1/4 min-w-[250px] bg-gray-800 p-4 border-r border-gray-700 h-screen ">
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
            <div className="h-full">
              {currentSlide.slide_type === 'image' && slideContent && <DetailView />}
              {currentSlide.slide_type === 'chat' && chatMessages.length > 0 && <ChatView />}
              {currentSlide.slide_type === 'quiz' && quizData && <QuizView />}
            </div>
            <Navigation />
          </>
        )
      }
      </div>
    </div>
  );
};

export default StorySlides;
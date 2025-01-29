'use client';

import { useState, useEffect, useRef } from 'react';
import { FaArrowLeft, FaArrowRight, FaEllipsisV, FaPhone, FaVideo, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { useParams, useRouter } from 'next/navigation';

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

  /* ----------------------- */
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);

  const [quizData, setQuizData] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showError, setShowError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentAudio, setCurrentAudio] = useState(null); 
  const audioRef = useRef(null);


  const BASE_IMAGE_URL = 'https://wowfy.in/testusr/images/';

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
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
  
    if (storyId && episodeId) {
      fetchInitialSlides();
    }
  }, [storyId, episodeId]);

  
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
      router.push(`/stories/${nextEpisode.id}/${storyId}/chat-story`);
    }
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

    const DetailView = () => {
      
      return (
        <div className="flex-1 bg-gray-900 overflow-y-auto md:pt-28">
          {/* Navbar */}
          <div className="bg-gray-800 p-4 flex items-center justify-center">
              <h2 className="text-2xl font-bold">{storyData.title}</h2>
          </div>
          <div className="relative h-full flex flex-col">
            {/* Header */}
            <div className="bg-gray-800 p-4">
              <h1 className="text-xl font-bold text-center">{slideContent.title}</h1>
              {/* <p className="text-sm text-gray-400 text-center">Episode {slideContent.episode_number}</p> */}
            </div>

            {/* Media Section */}
            <div className="relative flex-1">
              <div className="relative h-[70vh]">
                <div className="relative h-[70vh]">
                  <img
                    src={`${BASE_IMAGE_URL}${slideContent.media_url}`}
                    alt="Episode detail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4">
                    <p className="text-white text-lg">{slideContent.description}</p>
                  </div>
                </div>
                {/* {detail.media_type === 'video' ? (
                  <video
                    src={`${BASE_IMAGE_URL}${slideContent.media_url}`}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="relative h-[70vh]">
                    <img
                      src={`${BASE_IMAGE_URL}${slideContent.media_url}`}
                      alt="Episode detail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4">
                      <p className="text-white text-lg">{slideContent.description}</p>
                    </div>
                  </div>
                )} */}
              </div>
            </div>
          </div>
        </div>
      );
    };

    const ChatView = () => (
      <div className="flex-1 bg-gray-900 flex flex-col md:pt-28">
        {/* Navbar */}
        <div className="bg-gray-800 p-4 flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={`${BASE_IMAGE_URL}${storyData.cover_img}`}
              alt="Profile"
              className="w-10 h-10 rounded-full mr-2"
            />
            <div>
              <h2 className="text-lg font-bold">{storyData.title}</h2>
              {/* <p className="text-sm text-gray-400">Episode {episode.episode_number}</p> */}
            </div>
          </div>
          <div className="flex items-center space-x-4 text-gray-300">
            <FaVideo className="w-5 h-5 cursor-pointer hover:text-white" title="Video Call" />
            <FaPhone className="w-5 h-5 cursor-pointer hover:text-white" title="Voice Call" />
            <FaEllipsisV className="w-5 h-5 cursor-pointer hover:text-white" title="Options" />
          </div>
        </div>
        {/* Chat Messages */}
        <div className="flex-1 max-h-[80vh] p-4 overflow-y-auto">
          <div className="flex flex-col space-y-4">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`relative p-3 rounded-lg max-w-xs ${
                  message.character.is_sender
                    ? 'bg-green-700 text-white self-end'
                    : 'bg-gray-800 text-gray-300 self-start'
                }`}
              >
                <strong>{message.character.name}: </strong>
                <p>{message.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    const QuizView = () => {
      const renderOptions = () => {
        if (quizData.quiz.answer_type === 'multiple_choice') {
          return quizData.quiz.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleQuizAnswer(option.id)}
              className={`p-3 text-left rounded-lg transition-colors ${
                userAnswer === option.id
                  ? option.is_correct
                    ? 'bg-green-700 text-white'
                    : 'bg-red-700 text-white'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {option.option_text}
            </button>
          ));
        }
    
        return (
          <div className="w-full">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => handleQuizAnswer(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded-lg text-white"
              placeholder="Type your answer here..."
            />
            {isAnswerCorrect && (
              <p className="text-green-500 mt-2">Correct answer!</p>
            )}
          </div>
        );
      };
    
      return (
        <div className="flex-1 bg-gray-900 flex flex-col items-center justify-center p-4 md:pt-28">
          {/* Media Section */}
          {quizData.media_url && (
            <div className="w-full max-w-5xl mb-8">
              <img
                src={`${BASE_IMAGE_URL}${quizData.media_url}`}
                alt="Quiz visual"
                className="w-full aspect-[3/2] object-cover rounded-lg"
              />
            </div>
          )}
    
          {/* Quiz Content */}
          <div className="w-full max-w-2xl bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">{quizData.quiz.question}</h3>
            <div className="grid gap-3">
              {renderOptions()}
            </div>
            
            {showError && (
              <p className="text-red-500 mt-4">
                {!userAnswer ? 'Please answer the question to continue!' : 'Incorrect answer, please try again!'}
              </p>
            )}
          </div>
        </div>
      );
    };


  return (
    <div className={`h-screen relative bg-gray-900 text-white flex flex-col sm:flex-row`}>
      <div className="absolute top-4 pt-28 right-4 z-50">
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
        // Existing sidebar code
        <div className="w-1/4 min-w-[250px] bg-gray-800 p-4 border-r border-gray-700 md:pt-32">
          <img
            src={`${BASE_IMAGE_URL}${storyData.cover_img}`}
            alt={storyData.title}
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
          <h2 className="text-lg font-bold mb-2">{storyData.title}</h2>
          <p className="text-sm text-gray-300">{storyData.synopsis}</p>
        </div>
      )}

      <div className="flex-1 relative">
        {currentSlide.slide_type === 'image' && slideContent && (
            <DetailView />
          )}

        {currentSlide.slide_type === 'chat' && chatMessages.length > 0 && (
          <>
            <ChatView />
          </>
        )}

        {currentSlide.slide_type === 'quiz' && quizData && (
          <QuizView />
        )}
      </div>

      {/* Navigation */}
      <div className="absolute bottom-16 md:bottom-0 left-0 right-0 flex justify-between p-4">
          {currentSlideIndex > 0 && (
            <button 
              onClick={handlePreviousSlide}
              className="bg-gray-700 p-2 rounded-full hover:bg-gray-600 transition-colors"
            >
              <FaArrowLeft className="text-white" />
            </button>
          )}

          {!isLastSlide ? (
            // <button 
            //   onClick={handleNextSlide}
            //   className="ml-auto bg-gray-700 p-2 rounded-full hover:bg-gray-600 transition-colors"
            // >
            //   <FaArrowRight className="text-white" />
            // </button>
            <button 
                onClick={handleNextSlide}
                className={`ml-auto p-2 rounded-full transition-colors ${
                  (currentSlide.slide_type === 'quiz' && !isAnswerCorrect)
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                disabled={currentSlide.slide_type === 'quiz' && !isAnswerCorrect}
              >
                <FaArrowRight className="text-white" />
              </button>
          ) : nextEpisode ? (
            <button 
              onClick={handleNextEpisode}
              className="ml-auto bg-blue-700 p-2 rounded-full hover:bg-blue-600 transition-colors"
            >
              Next Episode
            </button>
          ) : null}
        </div>
    </div>
  );
};

export default StorySlides;
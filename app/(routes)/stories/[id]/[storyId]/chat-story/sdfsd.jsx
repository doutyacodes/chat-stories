'use client';

import { useState, useEffect, useRef } from 'react';
import { FaArrowLeft, FaArrowRight, FaEllipsisV, FaPhone, FaVideo, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { useParams, useRouter } from 'next/navigation';
import AdDisplay from '@/app/components/AdDisplay';
import SlideContainer from '../../../_components/SlideContainer';

const StorySlides = () => {
  const router = useRouter();
  const { storyId, id:episodeId } = useParams();
  const [slides, setSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [previousSlideIndex, setPreviousSlideIndex] = useState(0);
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
  
  const [nextSlideType, setNextSlideType] = useState(null);

  const [showWrongAnswerModal, setShowWrongAnswerModal] = useState(false);
  const [showCorrectAnswerModal, setShowCorrectAnswerModal] = useState(false);
const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);

  const currentSlide = slides[currentSlideIndex];

  useEffect(() => {
    if (hasSubmittedAnswer) {
      if (isAnswerCorrect) {
        setShowCorrectAnswerModal(true);
      } else {
        validateAnswer(); 
      }
    }
  }, [hasSubmittedAnswer, isAnswerCorrect]);



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

//   const CorrectAnswerModal = ({ isOpen, onContinue }) => {
//     if (!isOpen) return null;
    
//     return (
//       <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-100">
//         <div className="bg-green-800 p-6 rounded-lg max-w-sm w-full mx-4">
//           <h3 className="text-xl font-bold mb-4 text-white">Correct Answer!</h3>
//           <p className="mb-6 text-gray-200">You&apos;ve successfully answered the quiz. You can now proceed to the next slide.</p>
//           <div className="flex justify-center">
//             <button
//               onClick={onContinue}
//               className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-white"
//             >
//               Continue to Next Slide
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };
  

  // Updated Navigation component
 

  const CorrectAnswerModal = ({ isOpen, onContinue, isLastSlide, nextEpisode }) => {
    if (!isOpen) return null;
    
    const getModalContent = () => {
      if (!isLastSlide) {
        return {
          message: "You've successfully answered the quiz. You can now proceed to the next slide.",
          buttonText: "Continue to Next Slide adas"
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
              disabled={loading || (currentSlide?.slide_type === 'quiz' && (!isAnswerCorrect || !hasSubmittedAnswer)) }
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

  return (
    <div className="h-screen relative bg-gray-900 text-white flex flex-col sm:flex-row overflow-hidden">
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

      {/* <CorrectAnswerModal 
        isOpen={showCorrectAnswerModal}
        onContinue={() => {
          setShowCorrectAnswerModal(false);
          handleSlideChange('next');
        }}
      /> */}

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

    </div>
  );
};


export default StorySlides;
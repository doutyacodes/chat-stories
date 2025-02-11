import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaArrowRight, FaEllipsisV, FaPhone, FaVideo, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';

const SlideContainer = ({ 
    currentSlide, 
    nextSlideType, 
    loading, 
    storyData,
    slideContent, 
    chatMessages, 
    quizData,
    currentSlideIndex,
    previousSlideIndex,
    isAnswerCorrect,
    setIsAnswerCorrect,
    userAnswer,
    setUserAnswer,
    showError,
    setShowError,
    hasSubmittedAnswer,
    setHasSubmittedAnswer
    }) => {

        // const [slideDirection, setSlideDirection] = useState('right');

        // useEffect(() => {
        //     if (currentSlideIndex > previousSlideIndex) {
        //         setSlideDirection('left');
        //     } else if (currentSlideIndex < previousSlideIndex) {
        //         setSlideDirection('right');
        //     }
        // }, [currentSlideIndex, previousSlideIndex]);
    
        // const slideVariants = {
        //     enter: (direction) => ({
        //         x: direction === 'left' ? 1000 : -1000,
        //         opacity: 0
        //     }),
        //     center: {
        //         x: 0,
        //         opacity: 1
        //     }
        // };

    const [slideDirection, setSlideDirection] = useState('right');

    
    useEffect(() => {
        // Update slide direction whenever currentSlideIndex changes
        if (currentSlideIndex > previousSlideIndex) {
            // Moving forward - content should enter from right
            setSlideDirection('right');
        } else if (currentSlideIndex < previousSlideIndex) {
            // Moving backward - content should enter from left
            setSlideDirection('left');
        }
    }, [currentSlideIndex, previousSlideIndex]);

    const slideVariants = {
        enter: (direction) => ({
            x: direction === 'right' ? 500 : -500,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            x: direction === 'right' ? -500 : 500,
            opacity: 0
        })
    };

    const BASE_IMAGE_URL = 'https://wowfy.in/testusr/images/';
    const BASE_VIDEO_URL = 'https://wowfy.in/testusr/videos/';


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

      const handleTextInput = (e) => {
        const value = e.target.value;
        setUserAnswer(value);  // Update the input value directly
    };
      
    const handleSubmit = (e) => {
        e.preventDefault();
        setHasSubmittedAnswer(true);
        
        // Normalize both strings: convert to lowercase, trim spaces, and normalize apostrophes
        const normalizeString = (str) => {
            return str
                .toLowerCase()
                .trim()
                .replace(/[\u2018\u2019']/g, "'"); // Replace all types of apostrophes with a simple one
        };
        
        const isCorrect = normalizeString(userAnswer) === normalizeString(quizData.quiz.correct_answer);
        setIsAnswerCorrect(isCorrect);
    };



    const PlaceholderSlide = ({ type }) => {
        switch(type) {
        case 'image':
            return (
            <div className="flex-1 h-full bg-gray-900 relative">
                <div className="max-w-[500px] mx-auto h-full relative">
                <div className="w-full h-full bg-gray-800 animate-pulse" />
                <div className="absolute bottom-0 left-0 right-0">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute inset-0 backdrop-blur-sm bg-black/30" />
                    <div className="relative h-full p-6 flex items-center">
                    <div className="w-3/4 h-4 bg-gray-700 rounded animate-pulse" />
                    </div>
                </div>
                </div>
            </div>
            );
        
        case 'quiz':
            return (
            <div className="flex-1 h-full bg-gray-900 relative">
                <div className="max-w-[500px] mx-auto h-full relative">
                <div className="w-full h-full bg-gray-800 animate-pulse" />
                <div className="absolute bottom-0 left-0 right-0">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute inset-0 backdrop-blur-sm bg-black/30" />
                    <div className="relative h-full p-6">
                    <div className="w-3/4 h-4 bg-gray-700 rounded animate-pulse mb-4" />
                    <div className="grid grid-cols-2 gap-2">
                        {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-10 bg-gray-700 rounded animate-pulse" />
                        ))}
                    </div>
                    </div>
                </div>
                </div>
            </div>
            );

        case 'chat':
            return (
            <div className="flex-1 h-full bg-gray-900 overflow-hidden">
                <div className="max-w-[500px] mx-auto h-full flex flex-col bg-gray-800 shadow-lg">
                <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
                    <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse mr-2" />
                    <div className="w-32 h-6 bg-gray-700 rounded animate-pulse" />
                    </div>
                </div>
                <div className="flex-1 p-4">
                    <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div 
                        key={i} 
                        className={`w-3/4 h-16 rounded-lg animate-pulse ${
                            i % 2 === 0 ? 'bg-green-700/50 self-end' : 'bg-gray-700 self-start'
                        }`}
                        />
                    ))}
                    </div>
                </div>
                </div>
            </div>
            );

        default:
            return null;
        }
    };

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
                // <div className="absolute bottom-0 left-0 right-0 h-[37.5%]"> {/* 75% of bottom half */}
                <div className="absolute bottom-0 left-0 right-0 "> 
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
                <>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {quizData.quiz.options.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => {
                          handleQuizAnswer(option.id);
                          setHasSubmittedAnswer(false);
                        }}
                        className={`p-2 text-sm text-left rounded-lg transition-colors ${
                          userAnswer === option.id
                            ? hasSubmittedAnswer
                              ? option.is_correct
                                ? 'bg-green-700 text-white'
                                : 'bg-red-700 text-white'
                              : 'bg-blue-700 text-white'
                            : 'bg-gray-700/80 hover:bg-gray-600/80'
                        }`}
                      >
                        {option.option_text}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setHasSubmittedAnswer(true)}
                    disabled={!userAnswer}
                    className={`w-full py-2 px-4 rounded-lg transition-colors ${
                      !userAnswer 
                        ? 'bg-gray-600 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    Submit Answer
                  </button>
                </>
              );
            }
          
            return (
              <>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={userAnswer}
                        onChange={handleTextInput}
                        className="w-full p-2 bg-gray-700/80 rounded-lg text-white text-sm mb-4"
                        placeholder="Type your answer here..."
                        autoComplete="off"
                        autoFocus  // Added this to automatically focus the input
                    />
                    <button
                    type="submit"
                    disabled={!userAnswer}
                    className={`w-full py-2 px-4 rounded-lg transition-colors ${
                        !userAnswer 
                        ? 'bg-gray-600 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                    >
                    Submit Answer
                    </button>
                </form>
              </>
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
                    <div className="absolute bottom-0 left-0 right-0">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute inset-0 backdrop-blur-sm bg-black/30" />
                        <div className="relative h-full p-6">
                        <h3 className="text-base font-bold mb-3 text-white">{quizData.quiz.question}</h3>
                        {renderOptions()}
                        {showError && (
                            <p className="text-red-500 mt-2 text-sm">
                            {!userAnswer && 'Please answer the question to continue!' }
                            </p>
                        )}
                        {/* {isAnswerCorrect && (
                            <p className="text-green-500 mt-2 text-sm">Correct answer!</p>
                        )} */}
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
        );
    };

    return (
        <div className="relative h-full overflow-hidden">
            {/* Sliding Placeholder with no exit animation */}
            <AnimatePresence mode="wait">
                {loading && (
                    <motion.div
                        key={`loading-${currentSlide?.id}`}
                        custom={slideDirection}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        // No exit animation - will instantly disappear
                        className="absolute w-full h-full"
                    >
                        <PlaceholderSlide type={nextSlideType} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content that just appears */}
            {!loading && (
                <div className="absolute w-full h-full">
                    {currentSlide?.slide_type === 'image' && slideContent && <DetailView />}
                    {currentSlide?.slide_type === 'chat' && chatMessages.length > 0 && <ChatView />}
                    {currentSlide?.slide_type === 'quiz' && quizData && <QuizView />}
                </div>
            )}
        </div>
    );
};;

export default SlideContainer;
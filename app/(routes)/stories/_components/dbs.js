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
    setShowError
    }) => {

    const [slideDirection, setSlideDirection] = useState('right');

    useEffect(() => {
        // Explicitly check if moving forward or backward
        if (currentSlideIndex > previousSlideIndex) {
            setSlideDirection('left');
        } else if (currentSlideIndex < previousSlideIndex) {
            setSlideDirection('right');
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

    return (
        <div className="relative h-full overflow-hidden">
            <AnimatePresence initial={false} custom={slideDirection}>
                <motion.div
                    key={loading ? 'loading' : currentSlide?.id}
                    custom={slideDirection}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 }
                    }}
                    className="absolute w-full h-full"
                >
                    {/* {loading ? (
                        <PlaceholderSlide type={nextSlideType} />
                    ) : ( */}
                        <>
                            {currentSlide?.slide_type === 'image' && slideContent && <DetailView />}
                            {currentSlide?.slide_type === 'chat' && chatMessages.length > 0 && <ChatView />}
                            {currentSlide?.slide_type === 'quiz' && quizData && <QuizView />}
                        </>
                    {/* )} */}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default SlideContainer;
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaArrowRight, FaEllipsisV, FaPhone, FaVideo, FaVolumeMute, FaVolumeUp, FaCheckDouble } from 'react-icons/fa';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const QuitDialog = ({ isOpen, onClose, onConfirm }) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-gray-800 border-gray-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Quit Challenge?</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-300">
            Are you sure you want to quit? You can continue this challenge later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Yes, Quit Challenge
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const SlideContainer = ({ 
    currentSlide, 
    nextSlideType, 
    loading, 
    storyData,
    slideContent, 
    chatMessages, 
    conversation,
    conversationAudio,
    bgImage,
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
    setHasSubmittedAnswer,
    pedometerData,
    currentSteps,
    setCurrentSteps,
    isPedometerStarted,
    setIsPedometerStarted,
    setPedometerCompleted,
    locationData,
    userLocation,
    locationPermissionDenied,
    calculateDistance,
    photoTaskData,
    photoFile,
    setPhotoFile,
    photoPreview,
    setPhotoPreview,
    photoVerificationResult,
    setPhotoVerificationResult,
    isVerifyingPhoto,
    handlePhotoVerificationSubmit,
    photoTaskCompleted,
    setPhotoTaskCompleted,
    onNextSlide,
    }) => {

    const [slideDirection, setSlideDirection] = useState('right');
    const [showQuitDialog, setShowQuitDialog] = useState(false);


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

        case 'conversation':
        return (
          <div className="flex-1 h-full bg-gray-900 relative">
            <div className="max-w-[500px] mx-auto h-full relative">
              <div className="w-full h-full bg-gray-800 animate-pulse" /> {/* Background placeholder */}
              <div className="absolute inset-0">
                <div className="flex-1 overflow-y-auto scrollbar-hide h-full">
                  <div className="p-4">
                    <div className="flex flex-col space-y-4">
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
            </div>
          </div>
        );

        case 'pedometer':
            return (
                <div className="flex-1 h-full bg-gray-900 relative">
                <div className="max-w-[500px] mx-auto h-full flex flex-col p-6">
                    <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                    <div className="w-3/4 h-8 bg-gray-700 rounded animate-pulse mb-4" />
                    <div className="w-full max-w-md h-6 bg-gray-700 rounded-full animate-pulse" />
                    <div className="w-20 h-20 bg-gray-700 rounded-full animate-pulse" />
                    <div className="w-32 h-10 bg-gray-700 rounded animate-pulse" />
                    </div>
                </div>
                </div>
            );

        case 'location':
          return (
            <div className="flex-1 h-full bg-gray-900 relative">
              <div className="max-w-[500px] mx-auto h-full flex flex-col items-center justify-center p-6">
                <div className="space-y-6 text-center">
                  <div className="w-3/4 h-8 bg-gray-700 rounded animate-pulse mx-auto mb-8" />
                  <div className="w-16 h-16 bg-gray-700 rounded-full animate-pulse mx-auto" />
                  <div className="w-48 h-4 bg-gray-700 rounded animate-pulse mx-auto" />
                </div>
              </div>
            </div>
          );

        case 'ai_image_task':
          return (
            <div className="flex-1 h-full bg-gray-900 relative">
              <div className="max-w-[500px] mx-auto h-full flex flex-col items-center justify-center p-6">
                <div className="space-y-6 text-center w-full flex flex-col items-center">
                  <div className="w-3/4 h-8 bg-gray-700 rounded animate-pulse mx-auto mb-4" />
                  <div className="w-[280px] h-[280px] bg-gray-800 rounded-3xl animate-pulse mx-auto" />
                  <div className="w-48 h-10 bg-gray-700 rounded-xl animate-pulse mx-auto" />
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
              {chatMessages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.character.is_sender ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`chat-bubble relative px-3 py-2 max-w-xs shadow-md ${
                      message.character.is_sender
                        ? "chat-sent bg-green-600 text-white"
                        : "chat-received bg-gray-700 text-gray-100"
                    }`}
                  >
                    <p className="text-[11px] font-semibold opacity-80 leading-tight">
                      {message.character.name}
                    </p>

                    <p className="text-sm leading-snug mt-1 pr-8">
                      {message.message}
                    </p>

                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[10px] opacity-70">
                        {formatMessageTime(index)}
                      </span>

                      {message.character.is_sender && (
                        <FaCheckDouble className="w-3 h-3 text-blue-200" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
        </div>
    );

    const ConversationView = () => (
      <div className="flex-1 h-full bg-gray-900 relative">
        <div className="max-w-[500px] mx-auto h-full relative">
          {/* Background Image */}
          {bgImage && (
            <div className="absolute inset-0">
              <img
                src={`${BASE_IMAGE_URL}${bgImage}`}
                alt="Background"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" /> {/* Dimming and very mild blur */}
            </div>
          )}
          
          {/* Conversation Messages */}
          <div className="relative h-full">
            <div className="flex-1 overflow-y-auto scrollbar-hide h-full">
              <div className="p-4">
                <div className="flex flex-col space-y-4">
                  {conversation.map((message) => (
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
            
            {/* Audio Control - if conversationAudio exists */}
            {conversationAudio && (
              <div className="absolute bottom-4 right-4 bg-gray-800/80 p-2 rounded-full backdrop-blur-sm">
                <button 
                  className="text-white p-2"
                  onClick={() => {
                    // Audio toggle logic would go here
                  }}
                >
                  <FaVolumeUp className="w-5 h-5" />
                </button>
              </div>
            )}
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

    const PedometerView = () => {
        const [deviceSupport, setDeviceSupport] = useState({
          isSupported: false,
          isChecking: true,
          errorMessage: ''
        });
      
        // Check device support when component mounts
        useEffect(() => {
          checkDeviceSupport();
        }, []);
      
        const checkDeviceSupport = () => {
            // Add debugging logs
            console.log('Checking device support...');
            console.log('User Agent:', navigator.userAgent);
            
            // First check if we're on a mobile device
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            console.log('Is Mobile Device:', isMobile);
            
            if (!isMobile) {
              setDeviceSupport({
                isSupported: false,
                isChecking: false,
                errorMessage: 'Please open this on a mobile device to count steps.'
              });
              return;
            }
          
            // Check for device motion support
            console.log('DeviceMotionEvent available:', window.DeviceMotionEvent !== undefined);
            console.log('DeviceMotionEvent:', window.DeviceMotionEvent);
          
            // Add a test listener to see if events are actually firing
            window.addEventListener('devicemotion', (event) => {
              console.log('Motion event received:', event);
              console.log('Acceleration data:', event.accelerationIncludingGravity);
            }, { once: true }); // Will only fire once
          
            if (window.DeviceMotionEvent !== undefined) {
              setDeviceSupport({
                isSupported: true,
                isChecking: false,
                errorMessage: ''
              });
            } else {
              setDeviceSupport({
                isSupported: false,
                isChecking: false,
                errorMessage: 'Your device does not support motion detection.'
              });
            }
          };
      
        const requestPermission = async () => {
          try {
            // iOS 13+ requires explicit permission
            if (typeof window.DeviceMotionEvent?.requestPermission === 'function') {
              const permission = await window.DeviceMotionEvent.requestPermission();
              if (permission === 'granted') {
                startPedometer();
              } else {
                setDeviceSupport({
                  isSupported: false,
                  isChecking: false,
                  errorMessage: 'Permission to access motion sensors was denied.'
                });
              }
            } else {
              // For non-iOS devices, just start the pedometer
              startPedometer();
            }
          } catch (error) {
            console.error('Permission request error:', error);
            setDeviceSupport({
              isSupported: false,
              isChecking: false,
              errorMessage: 'Error accessing motion sensors. Please check device permissions.'
            });
          }
        };
      
        const startPedometer = () => {
          setIsPedometerStarted(true);
          let lastAccel = 0;
          let steps = 0;
          let lastStepTime = Date.now();
          let gravity = { x: 0, y: 0, z: 0 }; // Gravity values initialized
          const requiredSteps = pedometerData.required_steps;
          
          const handleMotion = (event) => {
            // Stop counting if already completed
            if (steps >= requiredSteps) return;

            const currentTime = Date.now();
            // Prevent counting steps too quickly (minimum 250ms between steps)
            if (currentTime - lastStepTime < 300) return;
      
            if (!event.accelerationIncludingGravity) return;
            
            let { x = 0, y = 0, z = 0 } = event.accelerationIncludingGravity;

            // Apply low-pass filter to separate gravity
            gravity.x = 0.9 * gravity.x + 0.1 * x;
            gravity.y = 0.9 * gravity.y + 0.1 * y;
            gravity.z = 0.9 * gravity.z + 0.1 * z;

            // Remove gravity from acceleration
            x -= gravity.x;
            y -= gravity.y;
            z -= gravity.z;

            const acceleration = Math.sqrt(x * x + y * y + z * z);
            
            // Adjusted threshold and added minimum acceleration requirement
            const threshold = 3; // Adjusted threshold for better accuracy
            const minAcceleration = 5; // Minimum acceleration to count as a step
            
            if (acceleration > minAcceleration && Math.abs(acceleration - lastAccel) > threshold) {
            //   steps++;
              steps = Math.min(steps + 1, requiredSteps); // Ensure steps don't exceed required
              setCurrentSteps(steps);
              lastStepTime = currentTime;

              // Update completion status
                if (steps >= requiredSteps) {
                    setPedometerCompleted(true);
                }
            }
            lastAccel = acceleration;
          };
      
          window.addEventListener('devicemotion', handleMotion);
      
          // Cleanup function
          return () => {
            window.removeEventListener('devicemotion', handleMotion);
          };
        };
      
        // If still checking device support, show loading
        if (deviceSupport.isChecking) {
          return (
            <div className="flex-1 h-full bg-gray-900 relative">
              <div className="max-w-[500px] mx-auto h-full flex flex-col p-6 items-center justify-center">
                <p className="text-white">Checking device compatibility...</p>
              </div>
            </div>
          );
        }
      
        // If device is not supported, show error message
        if (!deviceSupport.isSupported) {
          return (
            <div className="flex-1 h-full bg-gray-900 relative">
              <div className="max-w-[500px] mx-auto h-full flex flex-col p-6 items-center justify-center">
                <p className="text-red-500 text-center font-medium">
                  {deviceSupport.errorMessage}
                </p>
              </div>
            </div>
          );
        }
      
        const progress = (currentSteps / pedometerData.required_steps) * 100;
        const isComplete = currentSteps >= pedometerData.required_steps;
      
        return (
        //   <div className="flex-1 h-full bg-gray-900 relative">
           <div className="flex-1 h-full bg-gradient-to-br from-blue-900/50 to-green-900/50 relative">
            <div className="max-w-[500px] mx-auto h-full flex flex-col p-6">
              <div className="flex-1 flex flex-col items-center justify-center space-y-6 backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-center text-white drop-shadow-md">
                    {pedometerData.description}
                </h2>
                
                {/* <div className="w-full max-w-md bg-gray-800 rounded-full h-6 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div> */}

                <div className="w-full max-w-md bg-gray-800/80 rounded-full h-6 overflow-hidden backdrop-blur-sm">
                    <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-green-400 transition-all duration-300"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>
                
                {/* Steps text */}
                <div className="text-center space-y-2">
                    <p className="text-xl font-bold text-white drop-shadow-md">
                    {currentSteps} / {pedometerData.required_steps} steps
                    </p>
                    {isPedometerStarted && !isComplete && (
                    <p className="text-blue-200 text-sm">Keep walking! Steps remaining: {pedometerData.required_steps - currentSteps}</p>
                    )}
                </div>
      
                {!isPedometerStarted && (
                  <button
                    onClick={requestPermission}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                  >
                    Start Walking
                  </button>
                )}
      
                {isComplete && (
                  <div className="text-green-500 text-center">
                    <p className="text-xl font-bold">Great job! You&apos;ve completed the required steps!</p>
                  </div>
                )}
      
                {isPedometerStarted && !isComplete && (
                  <div className="text-blue-500 text-center">
                    <p>Keep walking! You&apos;re doing great!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      };

    const [chatStartTime] = useState(() => {
        const now = new Date();
        const randomMinutesAgo = Math.floor(Math.random() * 180) + 10; // 10–190 mins ago
        now.setMinutes(now.getMinutes() - randomMinutesAgo, 0, 0);
        return now;
    });

    const formatMessageTime = (index) => {
        const msgTime = new Date(chatStartTime.getTime() + index * 30000); // +30s per message
        return msgTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    };

    // if (!window.DeviceMotionEvent) {
    //     return (
    //         <div className="flex-1 h-full bg-gray-900 relative">
    //             <div className="max-w-[500px] mx-auto h-full flex flex-col p-6 items-center justify-center">
    //                 <p className="text-center text-red-500">
    //                 Sorry, step counting is not supported on this device. Please try on a mobile device with motion sensors.
    //                 </p>
    //             </div>
    //         </div>
    //     );
    // }

    // Add LocationView component in SlideContainer.js
    
    // const LocationView = () => {
    //   const formatDistance = (meters) => {
    //     if (meters >= 1000) {
    //       return `${(meters / 1000).toFixed(1)} km (${meters.toFixed(0)}m)`;
    //     }
    //     return `${meters.toFixed(0)} meters`;
    //   };
    
    //   if (locationPermissionDenied) {
    //     return (
    //       <div className="flex-1 h-full bg-gray-900 relative">
    //         <div className="max-w-[500px] bg-gradient-to-br from-blue-900/50 to-green-900/50 mx-auto h-full flex flex-col items-center justify-center p-6">
    //           <div className="text-center space-y-4">
    //             <div className="w-16 h-16 mx-auto mb-4">
    //               <svg className="w-full h-full text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    //               </svg>
    //             </div>
    //             <h3 className="text-xl font-bold text-red-500">Location Access Required</h3>
    //             <p className="text-gray-300">This challenge requires access to your device&apos;s location. Please enable location services and reload the page.</p>
    //           </div>
    //         </div>
    //       </div>
    //     );
    //   }
    
    //   const distance = userLocation ? calculateDistance(
    //     userLocation.latitude,
    //     userLocation.longitude,
    //     locationData.latitude,
    //     locationData.longitude
    //   ) : null;

    //   // console.log("locationView distant",distance);
    //   // console.log("radius", locationData.radius)
    //   // console.log("the percent", Math.min(100, (1 - (distance / (locationData.radius * 2))) * 100))
    //   // const percentage = Math.max(0, Math.min(100, (1 - (distance / locationData.radius)) * 100));

    
    //   return (
    //     <div className="flex-1 h-full bg-gray-900 relative">
    //       <div className="max-w-[500px] bg-gradient-to-br from-blue-900/50 to-green-900/50 mx-auto h-full flex flex-col items-center justify-center p-6">
    //         <div className="text-center space-y-6 w-full">
    //           <h2 className="text-2xl font-bold mb-4">{locationData.description}</h2>
              
    //           {userLocation ? (
    //             <div className="space-y-6">
    //               <div className="grid grid-cols-2 gap-4 text-sm">
    //                 <div className="bg-gray-800 p-4 rounded-lg">
    //                   <p className="text-gray-400 mb-1">Target Location</p>
    //                   <p className="font-mono">
    //                     {/* {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)} */}
    //                     {locationData.latitude}, {locationData.longitude}
    //                   </p>
    //                 </div>
    //                 <div className="bg-gray-800 p-4 rounded-lg">
    //                   <p className="text-gray-400 mb-1">Your Location</p>
    //                   <p className="font-mono">
    //                     {/* {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)} */}
    //                     {userLocation.latitude}, {userLocation.longitude}
    //                   </p>
    //                 </div>
    //               </div>
    
    //               <div className="bg-gray-800 p-4 rounded-lg">
    //                 <p className="text-gray-400 mb-2">Distance Remaining</p>
    //                 <div className="space-y-2">
    //                   <p className="text-xl font-bold">{formatDistance(distance)}</p>
    //                   {/* <div className="w-full bg-gray-700 rounded-full h-2">
    //                     <div 
    //                       className="bg-green-600 h-3 rounded-full transition-all duration-500"
    //                       style={{ 
    //                         // width: `${Math.min(100, (1 - (distance / (locationData.radius * 2))) * 100)}%`
    //                         width: `${Math.max(0, Math.min(100, (1 - (distance / locationData.radius)) * 100))}%`
    //                       }}
    //                     />
    //                   </div> */}
    //                   <p className="text-sm text-gray-400">
    //                     Target radius: {formatDistance(locationData.radius)}
    //                   </p>
    //                 </div>
    //               </div>
    //             </div>
    //           ) : (
    //             <div className="text-gray-300 animate-pulse">Getting your location...</div>
    //           )}
    //         </div>
    //       </div>
    //     </div>
    //   );
    // };

// Move the AlertDialog to a separate stable component

    const LocationView = () => {
    
      const formatDistance = (meters) => {
        if (meters >= 1000) {
          return `${(meters / 1000).toFixed(1)} km (${meters.toFixed(0)}m)`;
        }
        return `${meters.toFixed(0)} meters`;
      };
    
      const handleQuit = () => {
        setShowQuitDialog(true);
      };
    
      const handleConfirmQuit = () => {
        // Handle navigation back - replace with your navigation logic
        window.history.back();
      };
    
      if (locationPermissionDenied) {
        return (
          <div className="flex-1 h-full bg-gray-900 relative">
            <div className="max-w-[500px] bg-gradient-to-br from-blue-900/50 to-green-900/50 mx-auto h-full flex flex-col items-center justify-center p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto mb-4">
                  <svg className="w-full h-full text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-red-500">Location Access Required</h3>
                <p className="text-gray-300">This challenge requires access to your device&apos;s location. Please enable location services and reload the page.</p>
              </div>
            </div>
          </div>
        );
      }

     const distance = userLocation ? calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        locationData.latitude,
        locationData.longitude
      ) : null;

    
      return (
        // <div className="flex-1 h-full bg-gray-900 relative">
        //   <div className="max-w-[500px] bg-gradient-to-br from-blue-900/50 to-green-900/50 mx-auto h-full flex flex-col items-center justify-center p-6">
        //     <div className="text-center space-y-6 w-full">
        //       <h2 className="text-2xl font-bold mb-4">{locationData.description}</h2>
              
        //       {userLocation ? (
        //         <div className="space-y-6">
        //           <div className="bg-gray-800 p-4 rounded-lg">
        //             <p className="text-gray-400 mb-2">Distance Remaining</p>
        //             <div className="space-y-2">
        //               <p className="text-xl font-bold">{formatDistance(distance)}</p>
        //               <p className="text-sm text-gray-400">
        //                 Target radius: {formatDistance(locationData.radius)}
        //               </p>
        //             </div>
        //           </div>
    
        //           <button
        //             onClick={handleQuit}
        //             className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-white font-medium"
        //           >
        //             Quit Challenge
        //           </button>
        //         </div>
        //       ) : (
        //         <div className="text-gray-300 animate-pulse">Getting your location...</div>
        //       )}
        //     </div>
        //   </div>

        //   <QuitDialog 
        //     isOpen={showQuitDialog}
        //     onClose={() => setShowQuitDialog(false)}
        //     onConfirm={() => {
        //       window.history.back();
        //       setShowQuitDialog(false);
        //     }}
        //   />

        // </div>
        <div className="flex-1 h-full bg-gray-900 relative">
  <div className="max-w-[500px] bg-gradient-to-br from-blue-900/50 to-green-900/50 mx-auto h-full flex flex-col items-center justify-center p-6">
    <div className="text-center space-y-6 w-full">
      <h2 className="text-2xl font-bold mb-4">{locationData.description}</h2>
      
      {userLocation ? (
        <div className="space-y-4 w-full">
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-400 mb-2">Distance Remaining</p>
            <div className="space-y-2">
              <p className="text-xl font-bold">{formatDistance(distance)}</p>
              <p className="text-sm text-gray-400">
                Target radius: {formatDistance(locationData.radius)}
              </p>
            </div>
          </div>

          {/* View in Google Maps Button */}
          {locationData?.latitude && locationData?.longitude && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${locationData.latitude},${locationData.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 border border-blue-400/30 text-sm cursor-pointer"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              View Location in Google Maps
            </a>
          )}

          <div className="mt-4">
            <button
              onClick={handleQuit}
              className="py-2.5 px-6 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-gray-200 font-medium text-sm border border-gray-600 cursor-pointer"
            >
              Quit now & continue later
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 w-full">
          <div className="text-gray-300 animate-pulse">Getting your location...</div>
          {locationData?.latitude && locationData?.longitude && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${locationData.latitude},${locationData.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 border border-blue-400/30 text-sm cursor-pointer"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              View Location in Google Maps
            </a>
          )}
        </div>
      )}
    </div>
  </div>

  <QuitDialog 
    isOpen={showQuitDialog}
    onClose={() => setShowQuitDialog(false)}
    onConfirm={() => {
      window.history.back();
      setShowQuitDialog(false);
    }}
  />
</div>
      );
    };

    const AIImageTaskView = () => {
      const fileInputRef = useRef(null);
      const videoRef = useRef(null);
      const streamRef = useRef(null);

      const [isCameraActive, setIsCameraActive] = useState(false);
      const [isCameraLoading, setIsCameraLoading] = useState(false);
      const [cameraError, setCameraError] = useState(null);

      // Stop camera helper
      const stopCamera = () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        setIsCameraActive(false);
      };

      // Start live camera stream
      const startCamera = async () => {
        try {
          setIsCameraLoading(true);
          setCameraError(null);
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: "environment" },
              width: { ideal: 640 },
              height: { ideal: 640 },
            },
            audio: false,
          });
          streamRef.current = stream;
          setIsCameraActive(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play().catch(() => {});
          }
        } catch (err) {
          console.error("Camera access error:", err);
          setCameraError("Camera unavailable or permission denied. You can select a photo directly below.");
          setIsCameraActive(false);
        } finally {
          setIsCameraLoading(false);
        }
      };

      // Attach stream when video element renders
      useEffect(() => {
        if (isCameraActive && videoRef.current && streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
          videoRef.current.play().catch(() => {});
        }
      }, [isCameraActive]);

      // Cleanup camera on unmount
      useEffect(() => {
        return () => {
          stopCamera();
        };
      }, []);

      // Snap a 300x300 square image directly from video stream
      const handleCaptureSnap = () => {
        if (!videoRef.current) return;
        const video = videoRef.current;
        const canvas = document.createElement("canvas");
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext("2d");

        const videoWidth = video.videoWidth || 300;
        const videoHeight = video.videoHeight || 300;
        const minDim = Math.min(videoWidth, videoHeight);
        const startX = (videoWidth - minDim) / 2;
        const startY = (videoHeight - minDim) / 2;

        ctx.drawImage(video, startX, startY, minDim, minDim, 0, 0, 300, 300);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
              setPhotoFile(file);
              setPhotoPreview(URL.createObjectURL(blob));
              setPhotoVerificationResult(null);
              setPhotoTaskCompleted?.(false);
              stopCamera();
            }
          },
          "image/jpeg",
          0.85
        );
      };

      // Fallback file capture / picker resized to 300x300 square
      const handleNativeCapture = (e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              canvas.width = 300;
              canvas.height = 300;
              const ctx = canvas.getContext("2d");
              const minDim = Math.min(img.width, img.height);
              const startX = (img.width - minDim) / 2;
              const startY = (img.height - minDim) / 2;

              ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, 300, 300);

              canvas.toBlob(
                (blob) => {
                  if (blob) {
                    const croppedFile = new File([blob], "upload-capture.jpg", { type: "image/jpeg" });
                    setPhotoFile(croppedFile);
                    setPhotoPreview(URL.createObjectURL(blob));
                    setPhotoVerificationResult(null);
                    setPhotoTaskCompleted?.(false);
                    stopCamera();
                  }
                },
                "image/jpeg",
                0.85
              );
            };
            img.src = event.target.result;
          };
          reader.readAsDataURL(file);
        }
      };

      return (
        <div className="flex-1 h-full bg-gray-900 relative overflow-hidden flex flex-col justify-between">
          {/* Background Image Overlay if present */}
          {photoTaskData?.media_url ? (
            <img
              src={
                photoTaskData.media_url.startsWith("http")
                  ? photoTaskData.media_url
                  : `${BASE_IMAGE_URL}${photoTaskData.media_url}`
              }
              alt="Background"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-gray-900 to-purple-950" />
          )}
          <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px]" />

          {/* Main Content Container */}
          <div className="relative z-10 max-w-[500px] mx-auto w-full h-full flex flex-col justify-between p-6 overflow-y-auto scrollbar-hide">
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 my-auto w-full">
              {/* Challenge Task Card */}
              <div className="w-full bg-gray-800/80 backdrop-blur-md p-4 rounded-2xl border border-teal-500/30 text-center shadow-xl">
                <span className="text-[11px] font-extrabold text-teal-400 uppercase tracking-widest block mb-1">
                  📸 Photo Challenge
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                  {photoTaskData?.description || "Take or upload a photo for this challenge!"}
                </h3>
              </div>

              {/* Square 300x300 Camera Viewfinder / Preview Container */}
              <div className="w-full flex flex-col items-center justify-center">
                {photoPreview ? (
                  /* 1. Captured Photo Preview (300x300 Square) */
                  <div className="relative w-[280px] h-[280px] sm:w-[300px] sm:h-[300px] rounded-3xl overflow-hidden border-4 border-teal-400 shadow-2xl group">
                    <img src={photoPreview} alt="Captured preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoFile(null);
                        setPhotoPreview(null);
                        setPhotoVerificationResult(null);
                        setPhotoTaskCompleted?.(false);
                      }}
                      className="absolute top-3 right-3 px-3 py-1.5 bg-black/80 text-white rounded-full hover:bg-red-600 transition-colors text-xs font-bold shadow-lg cursor-pointer"
                    >
                      Retake 🔄
                    </button>
                  </div>
                ) : isCameraActive ? (
                  /* 2. Live Camera Viewfinder (300x300 Square) */
                  <div className="relative w-[280px] h-[280px] sm:w-[300px] sm:h-[300px] rounded-3xl overflow-hidden border-4 border-teal-400 shadow-2xl bg-black flex flex-col items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Viewfinder Target Guidelines */}
                    <div className="absolute inset-4 border-2 border-dashed border-white/60 rounded-2xl pointer-events-none" />

                    {/* Snap & Cancel Buttons */}
                    <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-3 px-3">
                      <button
                        type="button"
                        onClick={handleCaptureSnap}
                        className="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-black font-extrabold text-xs rounded-full shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
                      >
                        <span>📸 Snap Photo</span>
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-3 py-2 bg-black/70 hover:bg-black/90 text-white font-bold text-xs rounded-full shadow transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* 3. Initial Open Camera Button (300x300 Square) */
                  <div className="flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={startCamera}
                      disabled={isCameraLoading}
                      className="w-[280px] h-[280px] sm:w-[300px] sm:h-[300px] border-4 border-dashed border-teal-500/50 hover:border-teal-400 rounded-3xl bg-gray-800/50 hover:bg-gray-800/80 flex flex-col items-center justify-center cursor-pointer transition-all shadow-2xl p-4 group"
                    >
                      <div className="w-16 h-16 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center justify-center mb-3 text-3xl group-hover:scale-110 transition-transform">
                        📷
                      </div>
                      <span className="text-sm font-bold text-white mb-1">
                        {isCameraLoading ? "Starting Camera..." : "Open Device Camera"}
                      </span>
                      <span className="text-[11px] text-teal-300 font-semibold bg-teal-950/80 px-3 py-1 rounded-full border border-teal-500/40">
                        Tap to Start Live Camera
                      </span>
                    </button>

                    {/* Direct file picker option */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-teal-400/80 hover:text-teal-300 underline font-medium cursor-pointer pt-1"
                    >
                      Or upload photo from files
                    </button>
                  </div>
                )}

                {cameraError && (
                  <p className="text-[11px] text-rose-300 bg-rose-950/80 border border-rose-500/40 px-3 py-1.5 rounded-lg mt-2 text-center max-w-[300px]">
                    {cameraError}
                  </p>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleNativeCapture}
                />
              </div>

              {/* Verification Feedback Alert Box */}
              {photoVerificationResult && (
                <div
                  className={`w-full p-3 rounded-xl border text-xs leading-relaxed font-semibold text-center transition-all ${
                    photoVerificationResult.is_valid
                      ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-200"
                      : "bg-rose-950/80 border-rose-500/50 text-rose-200"
                  }`}
                >
                  {photoVerificationResult.is_valid ? "🌟 " : "💡 "}
                  {photoVerificationResult.feedback}
                </div>
              )}

              {/* Action Buttons */}
              <div className="w-full pt-2">
                {photoVerificationResult?.is_valid ? (
                  <button
                    type="button"
                    onClick={onNextSlide}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg cursor-pointer"
                  >
                    Continue Story →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePhotoVerificationSubmit}
                    disabled={!photoFile || isVerifyingPhoto}
                    className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isVerifyingPhoto ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Checking photo...</span>
                      </>
                    ) : (
                      <span>Verify Photo ✨</span>
                    )}
                  </button>
                )}
              </div>
            </div>
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
                    {currentSlide?.slide_type === 'conversation' && conversation && <ConversationView />}
                    {currentSlide?.slide_type === 'quiz' && quizData && <QuizView />}
                    {currentSlide?.slide_type === 'pedometer' && pedometerData && <PedometerView />}
                    {currentSlide?.slide_type === 'location' && locationData && <LocationView />}
                    {currentSlide?.slide_type === 'ai_image_task' && photoTaskData && <AIImageTaskView />}
                </div>
            )}
        </div>
    );
};

export default SlideContainer;
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaArrowRight, FaEllipsisV, FaPhone, FaVideo, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
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
    calculateDistance
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
        <div className="space-y-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-400 mb-2">Distance Remaining</p>
            <div className="space-y-2">
              <p className="text-xl font-bold">{formatDistance(distance)}</p>
              <p className="text-sm text-gray-400">
                Target radius: {formatDistance(locationData.radius)}
              </p>
            </div>
          </div>

          {/* Added mt-12 to create more space from the content above */}
          <div className="mt-12">
            <button
              onClick={handleQuit}
              className="py-2.5 px-6 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-gray-200 font-medium text-sm border border-gray-600"
            >
              Quit now & continue later
            </button>
          </div>
        </div>
      ) : (
        <div className="text-gray-300 animate-pulse">Getting your location...</div>
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
                    {currentSlide?.slide_type === 'pedometer' && pedometerData && <PedometerView />}
                    {currentSlide?.slide_type === 'location' && locationData && <LocationView />}
                </div>
            )}
        </div>
    );
};;

export default SlideContainer;
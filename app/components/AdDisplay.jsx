import { useEffect, useState, useRef } from 'react';
import { FaVolumeMute, FaVolumeUp } from 'react-icons/fa';

const AdDisplay = ({ onAdComplete, isMuted, setIsMuted }) => {
  const [adData, setAdData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const videoRef = useRef(null);
  const BASE_IMAGE_URL = 'https://wowfy.in/testusr/images/';
  const BASE_VIDEO_URL = 'https://wowfy.in/testusr/videos/';


  useEffect(() => {
    const fetchAd = async () => {
      try {
        const response = await fetch('/api/ads/get-random-ad');
        const data = await response.json();
        setAdData(data);
        if (data.media_type === 'image') {
          setTimeLeft(data.duration);
        }
      } catch (error) {
        console.error('Error fetching ad:', error);
        onAdComplete(); // Skip to next episode if ad fails to load
      }
    };
    
    fetchAd();
  }, []);

  useEffect(() => {
    if (adData?.media_type === 'image' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onAdComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [adData, timeLeft, onAdComplete]);

  const handleVideoEnd = () => {
    onAdComplete();
  };

  if (!adData) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-full h-full max-w-[500px] relative my-28">
        {adData.media_type === 'video' ? (
          <video
            ref={videoRef}
            src={`${BASE_VIDEO_URL}${adData.media_url}`}
            className="w-full h-full object-cover"
            autoPlay
            muted={isMuted}
            playsInline
            onEnded={handleVideoEnd}
          />
        ) : (
          <img
            src={`${BASE_IMAGE_URL}${adData.media_url}`}
            alt="Advertisement"
            className="w-full h-full object-cover"
          />
        )}
        
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="absolute top-4 right-4 p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
        >
          {isMuted ? (
            <FaVolumeMute className="text-white w-6 h-6" />
          ) : (
            <FaVolumeUp className="text-white w-6 h-6" />
          )}
        </button>
      </div>
    </div>
  );
};

export default AdDisplay;
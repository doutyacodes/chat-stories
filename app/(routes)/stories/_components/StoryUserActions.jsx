// import { Bookmark, Heart, Share2 } from 'lucide-react';
// import React, { useState } from 'react'

// function StoryUserActions({story}) {

//     const [isLiked, setIsLiked] = useState(false);
//     const [isSaved, setIsSaved] = useState(false);

//     const handleShare = () => {
//         if (navigator.share) {
//           navigator.share({
//             title: story?.title,
//             text: story?.synopsis,
//             url: window.location.href,
//           });
//         }
//       };

//     const capitalizeFirstLetter = (string) => {
//         return string.charAt(0).toUpperCase() + string.slice(1);
//     };
    
//   return (
//     <>
//         {/* User Info Section */}
//         <div className="flex items-center gap-3 my-4 text-white">
//             <div className="w-10 h-10 rounded-full overflow-hidden">
//                 <img 
//                 src='https://chat-stories.vercel.app/user.png'
//                 alt="Profile" 
//                 className="w-full h-full object-cover"
//                 />
//             </div>
//             <div className="flex-grow">
//                 <h2 className="text-xs font-semibold">{capitalizeFirstLetter(story?.author)}</h2>
//                 <p className="text-[8px] text-gray-400">3,258 Subscribers</p>
//             </div>
//             <button className="bg-red-600 text-white px-4 py-1 rounded-full text-sm">
//                 SUBSCRIBE
//             </button>
//         </div>

//         {/* Action Icons */}
//         <div className="flex justify-between items-center my-4 text-white">
//             <div className="flex flex-col items-center gap-1">
//                 <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
//                 <span className="text-sm">6</span>
//                 </div>
//                 <span className="text-[8px]">Age & Above</span>
//             </div>

//             <div className="flex flex-col items-center gap-1">
//                 <div className="w-8 h-8 flex items-center justify-center">
//                 <span className="text-2xl font-bold">EN</span>
//                 </div>
//                 <span className="text-[8px]">Language</span>
//             </div>

//             <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => setIsLiked(!isLiked)}>
//                 <Heart className={`w-8 h-8 ${isLiked ? 'fill-current text-red-500' : ''}`} />
//                 <span className="text-[8px]">Like</span>
//             </div>

//             <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => setIsSaved(!isSaved)}>
//                 <Bookmark className={`w-8 h-8 ${isSaved ? 'fill-current' : ''}`} />
//                 <span className="text-[8px]">Save</span>
//             </div>

//             <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={handleShare}>
//                 <Share2 className="w-8 h-8" />
//                 <span className="text-[8px]">Share</span>
//             </div>
//         </div>
//     </>
      
//   )
// }

// export default StoryUserActions

'use client';

import { Bookmark, Heart, Share2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';

const StoryUserActions = ({ story }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [actionType, setActionType] = useState('');
  const [userData, setUserData] = useState({
    isSubscribed: false,
    isLiked: false,
    isSaved: false,
    likesCount: 0,
    subscribersCount: 0
  });

  // Check if user is logged in
  const isLoggedIn = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return !!token;
  };

  // Fetch initial data
  const fetchUserActions = async () => {
    if (!isLoggedIn()) {
      // If not logged in, only fetch public data
      try {
        const response = await fetch(`/api/${story.id}/public-data`);
        const data = await response.json();
        setUserData(prev => ({
          ...prev,
          likesCount: data.likesCount,
          subscribersCount: data.subscribersCount
        }));
      } catch (error) {
        console.error('Error fetching public data:', error);
      }
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/${story.id}/user-actions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user actions:', error);
    }
    setIsLoading(false);
  };

  // Handle subscribe action
  const handleSubscribe = async () => {
    if (!isLoggedIn()) {
      setActionType('subscribe');
      setShowAuthDialog(true);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/author/${story.authorId}/subscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setUserData(prev => ({
        ...prev,
        isSubscribed: data.isSubscribed,
        subscribersCount: data.subscribersCount
      }));
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  // Handle like action
  const handleLike = async () => {
    if (!isLoggedIn()) {
      setActionType('like');
      setShowAuthDialog(true);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/${story.id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setUserData(prev => ({
        ...prev,
        isLiked: data.isLiked,
        likesCount: data.likesCount
      }));
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  // Handle save action
  const handleSave = async () => {
    if (!isLoggedIn()) {
      setActionType('save');
      setShowAuthDialog(true);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/${story.id}/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setUserData(prev => ({
        ...prev,
        isSaved: data.isSaved
      }));
    } catch (error) {
      console.error('Error updating save:', error);
    }
  };

  // Handle share action
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: story?.title,
        text: story?.synopsis,
        url: window.location.href,
      });
    }
  };

  const capitalizeFirstLetter = (string) => {
    return string?.charAt(0).toUpperCase() + string?.slice(1);
  };

  useEffect(() => {
    fetchUserActions();
  }, [story.id]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="flex items-center gap-3 my-4">
          <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
          <div className="flex-grow">
            <div className="h-4 bg-gray-700 rounded w-24"></div>
            <div className="h-2 bg-gray-700 rounded w-20 mt-2"></div>
          </div>
          <div className="w-24 h-8 bg-gray-700 rounded-full"></div>
        </div>
        <div className="flex justify-between items-center my-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
              <div className="w-12 h-2 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* User Info Section */}
      <div className="flex items-center gap-3 my-4 text-white">
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <img 
            src='/user.png'
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-grow">
          <h2 className="text-xs font-semibold">{capitalizeFirstLetter(story?.author)}</h2>
          <p className="text-[8px] text-gray-400">{userData.subscribersCount.toLocaleString()} Subscribers</p>
        </div>
        <button 
          onClick={handleSubscribe}
          className={`px-4 py-1 rounded-full text-sm ${
            userData.isSubscribed ? 'bg-gray-600' : 'bg-red-600'
          }`}
        >
          {userData.isSubscribed ? 'SUBSCRIBED' : 'SUBSCRIBE'}
        </button>
      </div>

      {/* Action Icons */}
      <div className="flex justify-between items-center my-4 text-white">
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
            <span className="text-sm">6</span>
          </div>
          <span className="text-[8px]">Age & Above</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 flex items-center justify-center">
            <span className="text-2xl font-bold">EN</span>
          </div>
          <span className="text-[8px]">Language</span>
        </div>

        <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={handleLike}>
          <Heart className={`w-8 h-8 ${userData.isLiked ? 'fill-current text-red-500' : ''}`} />
          <span className="text-[8px]">{userData.likesCount} Likes</span>
        </div>

        <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={handleSave}>
          <Bookmark className={`w-8 h-8 ${userData.isSaved ? 'fill-current' : ''}`} />
          <span className="text-[8px]">Save</span>
        </div>

        <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={handleShare}>
          <Share2 className="w-8 h-8" />
          <span className="text-[8px]">Share</span>
        </div>
      </div>

      {/* Auth Dialog */}
      <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <AlertDialogContent className='bg-gray-300'>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign in required</AlertDialogTitle>
            <AlertDialogDescription>
              You need to sign in to {actionType} this story. Would you like to sign in now?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowAuthDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/login')}>Sign In</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default StoryUserActions;
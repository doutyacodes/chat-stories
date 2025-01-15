// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { FaVideo, FaPhone, FaEllipsisV } from 'react-icons/fa';
// import { useParams } from 'next/navigation';  

// const chatData = {
//   1: {
//     title: "A Couple's Fight",
//     genre: 'Romance',
//     contactName: 'Wifey',
//     profilePic:
//       'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7Kdc1T3y-DObJAzbBQ1Fe-orIp8Oj2lgdCA&s',
//     status: 'Online',
//     episodes: {
//       1: {
//         title: 'Episode 1',
//         chats: [
//           { sender: 'Wife', text: 'Why didn’t you call me today? I was waiting.', time: '12:00 PM' },
//           { sender: 'Husband', text: 'I was busy at work. I had a lot of meetings.', time: '12:01 PM' },
//           { sender: 'Wife', text: 'You always have excuses! I thought we were spending time together.', time: '12:02 PM' },
//           { sender: 'Husband', text: 'I didn’t mean to upset you. I’ll make it up, I promise.', time: '12:03 PM' },
//           { sender: 'Wife', text: 'You’ve said that before. It feels like I’m the only one trying here.', time: '12:05 PM' },
//           { sender: 'Husband', text: 'That’s not true. I’ve just been overwhelmed lately.', time: '12:06 PM' },
//           { sender: 'Wife', text: 'But you don’t even tell me what’s going on. I feel so left out.', time: '12:07 PM' },
//           { sender: 'Husband', text: 'You’re right, I need to communicate better. Can we talk over dinner tonight?', time: '12:08 PM' },
//           { sender: 'Wife', text: 'Fine. But this is your last chance to prove you care.', time: '12:09 PM' },
//           { sender: 'Husband', text: 'Thank you. I promise I won’t let you down.', time: '12:10 PM' },
//         ],
//       },
//       2: {
//         title: 'Episode 2',
//         chats: [
//           { sender: 'Husband', text: 'Hey, I made dinner reservations for tonight!', time: '5:00 PM' },
//           { sender: 'Wife', text: 'Where are we going?', time: '5:01 PM' },
//           { sender: 'Husband', text: 'Your favorite Italian place. I thought we could use a quiet night out.', time: '5:02 PM' },
//           { sender: 'Wife', text: 'That’s sweet. I hope this is a start to fixing things.', time: '5:03 PM' },
//           { sender: 'Husband', text: 'It is. I know I’ve been distant, and I want to change that.', time: '5:04 PM' },
//           { sender: 'Wife', text: 'Okay. I’ll get ready. Don’t be late.', time: '5:05 PM' },
//           { sender: 'Husband', text: 'I won’t. See you at 7.', time: '5:06 PM' },
//           { sender: 'Wife', text: 'Alright. Let’s make this work.', time: '5:07 PM' },
//         ],
//       },
//     },
//   },
//   }


// const ChatPage = () => {
//   const { id } = useParams(); // Access params with useParams hook
//   const storyId = id; // Story ID passed via URL
//   const story = chatData[storyId];
//   const [currentEpisodeId, setCurrentEpisodeId] = useState(null);
//   const [isMobileView, setIsMobileView] = useState(false);

//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobileView(window.innerWidth < 640);
//     };

//     handleResize();
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   const handleEpisodeSelect = (episodeId) => {
//     setCurrentEpisodeId(episodeId);
//   };

//   return (
//     <div className="h-screen bg-gray-900 text-white flex flex-col sm:flex-row">
//       {/* Sidebar */}
//       {(currentEpisodeId === null || !isMobileView) && (
//         <div className="sm:w-1/4 w-full bg-gray-800 p-4 border-r border-gray-700">
//           <h2 className="text-lg font-bold mb-4">{story.title}</h2>
//           <div className="ml-4 mt-2">
//             {Object.entries(story.episodes).map(([episodeId, episode]) => (
//               <div
//                 key={episodeId}
//                 onClick={() => handleEpisodeSelect(episodeId)}
//                 className="p-2 bg-gray-600 hover:bg-gray-500 text-white cursor-pointer rounded mb-2"
//               >
//                 {episode.title}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Chat Window */}
//       {(currentEpisodeId !== null || !isMobileView) && (
//         <div className="flex flex-col w-full sm:w-3/4">
//           {/* Navbar */}
//           {currentEpisodeId && (
//             <div className="bg-gray-800 p-4 flex items-center justify-between">
//               <div className="flex items-center">
//                 <img
//                   src={story.profilePic}
//                   alt="Profile"
//                   className="w-10 h-10 rounded-full mr-2"
//                 />
//                 <div>
//                   <h2 className="text-lg font-bold">{story.contactName}</h2>
//                   <p className="text-sm text-gray-400">{story.status}</p>
//                 </div>
//               </div>
//               <div className="flex items-center space-x-4 text-gray-300">
//                 <FaVideo className="w-5 h-5 cursor-pointer hover:text-white" title="Video Call" />
//                 <FaPhone className="w-5 h-5 cursor-pointer hover:text-white" title="Voice Call" />
//                 <FaEllipsisV className="w-5 h-5 cursor-pointer hover:text-white" title="Options" />
//               </div>
//             </div>
//           )}

//           {/* Chat Messages */}
//           <div className="flex-1 bg-gray-900 p-6 overflow-y-auto">
//             {currentEpisodeId ? (
//               <div className="flex flex-col space-y-4">
//                 {story.episodes[currentEpisodeId].chats.map((chat, index) => (
//                   <div
//                     key={index}
//                     className={`relative p-3 rounded-lg max-w-xs ${
//                       ['Wife', 'Mom', 'Ana', 'Tina', 'Boss'].includes(chat.sender)
//                         ? 'bg-gray-800 text-gray-300 self-start'
//                         : 'bg-green-700 text-white self-end'
//                     }`}
//                   >
//                     <strong>{chat.sender}: </strong>
//                     <p>{chat.text}</p>
//                     <p className="text-xs text-gray-400 absolute bottom-1 right-2">{chat.time}</p>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-gray-400 text-center mt-6">Select an episode to view messages.</p>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChatPage;


'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaVideo, FaPhone, FaEllipsisV } from 'react-icons/fa';
import { useParams } from 'next/navigation';

const ChatPage = () => {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [currentEpisodeId, setCurrentEpisodeId] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 640);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

useEffect(() => {
  // If there's only a general chat episode, show it automatically
  if (story && story.episodes.length === 1 && story.episodes[0].id === null) {
    setCurrentEpisodeId(0); // Using 0 for general chat
  }
}, [story]);

  useEffect(() => {
    const fetchStoryData = async () => {
      try {
        const response = await fetch(`/api/stories/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch story data');
        }

        const data = await response.json();
        setStory(data);
      } catch (err) {
        console.error('Error fetching story:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStoryData();
    }
  }, [id]);

  const handleEpisodeSelect = (episodeId) => {
    setCurrentEpisodeId(episodeId);
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Error loading story: {error}</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col sm:flex-row">
      {/* Sidebar */}
      {/* {(currentEpisodeId === null || !isMobileView) && (
        <div className="sm:w-1/4 w-full bg-gray-800 p-4 border-r border-gray-700">
          <h2 className="text-lg font-bold mb-4">{story.title}</h2>
          <div className="ml-4 mt-2">
            {story.episodes.map((episode) => (
              <div
                key={episode.id}
                onClick={() => handleEpisodeSelect(episode.id)}
                className="p-2 bg-gray-600 hover:bg-gray-500 text-white cursor-pointer rounded mb-2"
              >
                Episode {episode.episode_number}
              </div>
            ))}
          </div>
        </div>
      )} */}
      {(currentEpisodeId === null || !isMobileView) && (
        <div className="sm:w-1/4 w-full bg-gray-800 p-4 border-r border-gray-700">
          <h2 className="text-lg font-bold mb-4">{story.title}</h2>
          <div className="ml-4 mt-2">
            {story.episodes[0].id === null ? (
              <div
                className="p-2 bg-gray-600 text-white rounded mb-2"
              >
                General Chat
              </div>
            ) : (
              story.episodes.map((episode) => (
                <div
                  key={episode.id}
                  onClick={() => handleEpisodeSelect(episode.id)}
                  className="p-2 bg-gray-600 hover:bg-gray-500 text-white cursor-pointer rounded mb-2"
                >
                  Episode {episode.episode_number}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Chat Window */}
      {(currentEpisodeId !== null || !isMobileView) && (
        <div className="flex flex-col w-full sm:w-3/4">
          {/* Navbar */}
          {currentEpisodeId && (
            <div className="bg-gray-800 p-4 flex items-center justify-between">
              <div className="flex items-center">
                <img
                  src={`https://wowfy.in/testusr/images/${story.image}`}
                  alt="Profile"
                  className="w-10 h-10 rounded-full mr-2"
                />
                <div>
                  <h2 className="text-lg font-bold">{story.title}</h2>
                  <p className="text-sm text-gray-400">Online</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-gray-300">
                <FaVideo className="w-5 h-5 cursor-pointer hover:text-white" title="Video Call" />
                <FaPhone className="w-5 h-5 cursor-pointer hover:text-white" title="Voice Call" />
                <FaEllipsisV className="w-5 h-5 cursor-pointer hover:text-white" title="Options" />
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {/* <div className="flex-1 bg-gray-900 p-6 overflow-y-auto">
            {currentEpisodeId ? (
              <div className="flex flex-col space-y-4">
                {story.episodes
                  .find(ep => ep.id === parseInt(currentEpisodeId))
                  ?.messages.map((message, index) => (
                    <div
                      key={index}
                      className={`relative p-3 rounded-lg max-w-xs ${
                        message.is_character
                          ? 'bg-gray-800 text-gray-300 self-start'
                          : 'bg-green-700 text-white self-end'
                      }`}
                    >
                      <strong>{message.sender_name}: </strong>
                      <p>{message.content}</p>
                      <p className="text-xs text-gray-400 absolute bottom-1 right-2">
                        {new Date(message.created_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center mt-6">Select an episode to view messages.</p>
            )}
          </div> */}

          <div className="flex-1 bg-gray-900 p-6 overflow-y-auto">
            {story.episodes[0].id === null ? (
              // For general chat
              <div className="flex flex-col space-y-4">
                {story.episodes[0].messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`relative p-3 rounded-lg max-w-xs ${
                      message.is_sender
                        ? 'bg-green-700 text-white self-end'
                        : 'bg-gray-800 text-gray-300 self-start'
                    }`}
                  >
                    <strong>{message.sender_name}: </strong>
                    <p>{message.content}</p>
                    <p className="text-xs text-gray-400 absolute bottom-1 right-2">
                      {new Date(message.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : currentEpisodeId ? (
              // For regular episodes
              <div className="flex flex-col space-y-4">
                {story.episodes
                  .find(ep => ep.id === parseInt(currentEpisodeId))
                  ?.messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`relative p-3 rounded-lg max-w-xs ${
                        message.is_sender
                          ? 'bg-green-700 text-white self-end'
                          : 'bg-gray-800 text-gray-300 self-start'
                      }`}
                    >
                      <strong>{message.sender_name}: </strong>
                      <p>{message.content}</p>
                      <p className="text-xs text-gray-400 absolute bottom-1 right-2">
                        {new Date(message.created_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center mt-6">Select an episode to view messages.</p>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default ChatPage;
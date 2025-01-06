'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaVideo, FaPhone, FaEllipsisV } from 'react-icons/fa';

const chatData = {
  1: {
    title: "A Couple's Fight",
    contactName: 'Wifey',
    profilePic:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7Kdc1T3y-DObJAzbBQ1Fe-orIp8Oj2lgdCA&s',
    status: 'Online',
    episodes: {
      1: {
        title: 'Episode 1',
        chats: [
          { sender: 'Wife', text: 'Why didn’t you call me today? I was waiting.', time: '12:00 PM' },
          { sender: 'Husband', text: 'I was busy at work. I had a lot of meetings.', time: '12:01 PM' },
          { sender: 'Wife', text: 'You always have excuses! I thought we were spending time together.', time: '12:02 PM' },
          { sender: 'Husband', text: 'I didn’t mean to upset you. I’ll make it up, I promise.', time: '12:03 PM' },
          { sender: 'Wife', text: 'You’ve said that before. It feels like I’m the only one trying here.', time: '12:05 PM' },
          { sender: 'Husband', text: 'That’s not true. I’ve just been overwhelmed lately.', time: '12:06 PM' },
          { sender: 'Wife', text: 'But you don’t even tell me what’s going on. I feel so left out.', time: '12:07 PM' },
          { sender: 'Husband', text: 'You’re right, I need to communicate better. Can we talk over dinner tonight?', time: '12:08 PM' },
          { sender: 'Wife', text: 'Fine. But this is your last chance to prove you care.', time: '12:09 PM' },
          { sender: 'Husband', text: 'Thank you. I promise I won’t let you down.', time: '12:10 PM' },
        ],
      },
      2: {
        title: 'Episode 2',
        chats: [
          { sender: 'Husband', text: 'Hey, I made dinner reservations for tonight!', time: '5:00 PM' },
          { sender: 'Wife', text: 'Where are we going?', time: '5:01 PM' },
          { sender: 'Husband', text: 'Your favorite Italian place. I thought we could use a quiet night out.', time: '5:02 PM' },
          { sender: 'Wife', text: 'That’s sweet. I hope this is a start to fixing things.', time: '5:03 PM' },
          { sender: 'Husband', text: 'It is. I know I’ve been distant, and I want to change that.', time: '5:04 PM' },
          { sender: 'Wife', text: 'Okay. I’ll get ready. Don’t be late.', time: '5:05 PM' },
          { sender: 'Husband', text: 'I won’t. See you at 7.', time: '5:06 PM' },
        ],
      },
    },
  },
  2: {
    title: 'Family Gossip',
    contactName: 'Happy Family',
    profilePic:
      'https://allie.photo/wp-content/uploads/2021/01/what-to-wear-for-large-group-family-photos_0066.jpg',
    status: 'Members: Mom, Dad, Ana, Tina, Vicky',
    episodes: {
      1: {
        title: 'Episode 1',
        chats: [
          { sender: 'Dad', text: 'Who left the lights on again?', time: '9:00 AM' },
          { sender: 'Ana', text: 'It wasn’t me! I was in my room studying.', time: '9:01 AM' },
          { sender: 'Vicky', text: 'I think Tina did it. She left the living room last.', time: '9:02 AM' },
          { sender: 'Tina', text: 'No way! I wasn’t even in the living room today.', time: '9:03 AM' },
          { sender: 'Mom', text: 'Can we all stop pointing fingers? Let’s just make a rule to check the lights before leaving a room.', time: '9:04 AM' },
          { sender: 'Dad', text: 'That’s a good idea. Let’s be mindful, everyone.', time: '9:05 AM' },
          { sender: 'Ana', text: 'Alright, but Vicky should start setting an example.', time: '9:06 AM' },
          { sender: 'Vicky', text: 'Very funny, Ana. I’m not the only one who forgets.', time: '9:07 AM' },
          { sender: 'Tina', text: 'You’re definitely the worst at it though, Vicky!', time: '9:08 AM' },
          { sender: 'Mom', text: 'Enough, kids. Let’s all just be better, okay?', time: '9:09 AM' },
        ],
      },
    },
  },
};

const ChatPage = () => {
  const [currentStoryId, setCurrentStoryId] = useState(null);
  const [currentEpisodeId, setCurrentEpisodeId] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 640);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleStorySelect = (storyId) => {
    setCurrentStoryId(storyId);
    setCurrentEpisodeId(null);
  };

  const handleEpisodeSelect = (episodeId) => {
    setCurrentEpisodeId(episodeId);
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col sm:flex-row">
      {/* Sidebar */}
      {(currentEpisodeId === null || !isMobileView) && (
        <div className="sm:w-1/4 w-full bg-gray-800 p-4 border-r border-gray-700">
          <h2 className="text-lg font-bold mb-4">Stories</h2>
          {Object.entries(chatData).map(([storyId, story]) => (
            <div key={storyId} className="mb-4">
              <div
                onClick={() => handleStorySelect(storyId)}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white cursor-pointer rounded"
              >
                {story.title}
              </div>
              {currentStoryId === storyId && (
                <div className="ml-4 mt-2">
                  {Object.entries(story.episodes).map(([episodeId, episode]) => (
                    <div
                      key={episodeId}
                      onClick={() => handleEpisodeSelect(episodeId)}
                      className="p-2 bg-gray-600 hover:bg-gray-500 text-white cursor-pointer rounded mb-2"
                    >
                      {episode.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Chat Window */}
      {(currentEpisodeId !== null || !isMobileView) && (
        <div className="flex flex-col w-full sm:w-3/4">
          {/* Navbar */}
          {currentStoryId && currentEpisodeId && (
            <div className="bg-gray-800 p-4 flex items-center justify-between">
              <div className="flex items-center">
                <img
                  src={chatData[currentStoryId].profilePic}
                  alt="Profile"
                  className="w-10 h-10 rounded-full mr-2"
                />
                <div>
                  <h2 className="text-lg font-bold">
                    {chatData[currentStoryId].contactName}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {chatData[currentStoryId].status}
                  </p>
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
          <div className="flex-1 bg-gray-900 p-6 overflow-y-auto">
            {currentStoryId && currentEpisodeId ? (
              <div className="flex flex-col space-y-4">
                {chatData[currentStoryId].episodes[currentEpisodeId].chats.map((chat, index) => (
                  <div
                    key={index}
                    className={`relative p-3 rounded-lg max-w-xs ${
                      ['Wife', 'Mom', 'Ana', 'Tina'].includes(chat.sender)
                        ? 'bg-gray-800 text-gray-300 self-start'
                        : 'bg-green-700 text-white self-end'
                    }`}
                  >
                    <strong>{chat.sender}: </strong>
                    <p>{chat.text}</p>
                    <p className="text-xs text-gray-400 absolute bottom-1 right-2">
                      {chat.time}
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

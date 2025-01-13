'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaVideo, FaPhone, FaEllipsisV } from 'react-icons/fa';
import { useParams } from 'next/navigation';  

const chatData = {
  1: {
    title: "A Couple's Fight",
    genre: 'Romance',
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
          { sender: 'Wife', text: 'Alright. Let’s make this work.', time: '5:07 PM' },
        ],
      },
    },
  },
  2: {
    title: 'Family Gossip',
    genre: 'Family',
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
      2: {
        title: 'Episode 2',
        chats: [
          { sender: 'Mom', text: 'What do you all want for dinner tonight?', time: '4:00 PM' },
          { sender: 'Dad', text: 'I vote for pizza. Quick and easy.', time: '4:01 PM' },
          { sender: 'Ana', text: 'No way! We had pizza yesterday. Let’s cook something.', time: '4:02 PM' },
          { sender: 'Tina', text: 'I can help with pasta.', time: '4:03 PM' },
          { sender: 'Vicky', text: 'I’m in for pasta too. As long as Ana doesn’t cook!', time: '4:04 PM' },
          { sender: 'Ana', text: 'Excuse me? I’m a great cook!', time: '4:05 PM' },
          { sender: 'Mom', text: 'Alright, let’s all help with pasta. Family bonding time.', time: '4:06 PM' },
        ],
      },
    },
  },
  3: {
    title: 'Office Drama',
    genre: 'Drama',
    contactName: 'Boss',
    profilePic:
      'https://img.freepik.com/free-photo/vintage-style-office-workers-having-desk-job_23-2149851039.jpg?semt=ais_hybrid',
    status: 'Online',
    episodes: {
      1: {
        title: 'Episode 1',
        chats: [
          { sender: 'Boss', text: 'Team, we need to discuss last quarter’s performance.', time: '10:00 AM' },
          { sender: 'Alice', text: 'Sure. Is there something specific to focus on?', time: '10:02 AM' },
          { sender: 'Boss', text: 'Yes, the marketing team missed key deadlines.', time: '10:03 AM' },
          { sender: 'Bob', text: 'It wasn’t just us. We were waiting on approval from the finance team.', time: '10:04 AM' },
          { sender: 'Boss', text: 'Let’s not point fingers. We need to work as a team.', time: '10:05 AM' },
          { sender: 'Alice', text: 'How can we ensure smoother communication next time?', time: '10:06 AM' },
          { sender: 'Boss', text: 'Good question. Let’s set weekly cross-department updates.', time: '10:07 AM' },
          { sender: 'Bob', text: 'Agreed. That should help a lot.', time: '10:08 AM' },
        ],
      },
    },
  },
    4: {
      title: 'Haunted Mansion',
      genre: 'Horror',
      contactName: 'Ghost Hunters',
      profilePic: 'https://i0.wp.com/picjumbo.com/wp-content/uploads/anonymous-hacker-group-free-photo.jpg?w=600&quality=80',
      status: 'Members: Alex, Sam, Lily, Mark',
      episodes: {
        1: {
          title: 'Episode 1: The Invitation',
          chats: [
            { sender: 'Alex', text: 'I got an email about a haunted mansion. It’s supposed to be super creepy.', time: '7:00 PM' },
            { sender: 'Sam', text: 'What’s the deal? Who sent it?', time: '7:01 PM' },
            { sender: 'Alex', text: 'No clue. Just said, "Find the truth if you dare."', time: '7:02 PM' },
            { sender: 'Lily', text: 'Sounds like a trap. But I’m intrigued.', time: '7:03 PM' },
            { sender: 'Mark', text: 'Are we really doing this? Last time, we almost got arrested.', time: '7:04 PM' },
            { sender: 'Sam', text: 'That’s what makes it fun, Mark!', time: '7:05 PM' },
            { sender: 'Lily', text: 'When do we go?', time: '7:06 PM' },
            { sender: 'Alex', text: 'Tomorrow night. Midnight. Bring flashlights and gear.', time: '7:07 PM' },
            { sender: 'Mark', text: 'I’ll bring a first aid kit. Just in case.', time: '7:08 PM' },
            { sender: 'Lily', text: 'You mean for Alex’s clumsy moments?', time: '7:09 PM' },
            { sender: 'Alex', text: 'Haha. Very funny. Just be ready.', time: '7:10 PM' },
          ],
        },
        2: {
          title: 'Episode 2: The First Encounter',
          chats: [
            { sender: 'Sam', text: 'We’re inside. This place is freezing!', time: '12:15 AM' },
            { sender: 'Lily', text: 'Did anyone else hear that creak upstairs?', time: '12:16 AM' },
            { sender: 'Alex', text: 'Relax. Old houses creak all the time.', time: '12:17 AM' },
            { sender: 'Mark', text: 'Wait. What’s that shadow in the hallway?', time: '12:18 AM' },
            { sender: 'Lily', text: 'Okay, that’s not funny, Mark.', time: '12:19 AM' },
            { sender: 'Sam', text: 'I swear, something moved. Let’s check it out.', time: '12:20 AM' },
            { sender: 'Alex', text: 'I have my camera ready. Let’s stick together.', time: '12:21 AM' },
            { sender: 'Lily', text: 'Did anyone bring salt? For protection?', time: '12:22 AM' },
            { sender: 'Mark', text: 'Salt? Are we in a movie now?', time: '12:23 AM' },
            { sender: 'Sam', text: 'Shh. Listen. Do you hear whispering?', time: '12:24 AM' },
            { sender: 'Alex', text: 'Let’s move towards the sound. This is what we came for.', time: '12:25 AM' },
          ],
        },
      },
    },
    5: {
      title: 'Romantic Getaway',
      genre: 'Romance',
      contactName: 'Lover',
      profilePic: 'https://media.istockphoto.com/id/636379014/photo/hands-forming-a-heart-shape-with-sunset-silhouette.jpg?s=612x612&w=0&k=20&c=CgjWWGEasjgwia2VT7ufXa10azba2HXmUDe96wZG8F0=',
      status: 'Online',
      episodes: {
        1: {
          title: 'Episode 1: Planning the Trip',
          chats: [
            { sender: 'Lover', text: 'What do you think of a beach getaway this weekend?', time: '10:00 AM' },
            { sender: 'You', text: 'Sounds perfect! Where are we going?', time: '10:01 AM' },
            { sender: 'Lover', text: 'I found this amazing resort in Maldives. Private villas and crystal-clear water.', time: '10:02 AM' },
            { sender: 'You', text: 'That sounds like a dream. How soon can we leave?', time: '10:03 AM' },
            { sender: 'Lover', text: 'Friday evening. I’ve already booked the tickets.', time: '10:04 AM' },
            { sender: 'You', text: 'You’re amazing. Can’t wait to spend some time with you.', time: '10:05 AM' },
            { sender: 'Lover', text: 'Me too. It’s been too long since we had a proper vacation.', time: '10:06 AM' },
            { sender: 'You', text: 'Let’s make it unforgettable.', time: '10:07 AM' },
          ],
        },
        2: {
          title: 'Episode 2: Trouble in Paradise',
          chats: [
            { sender: 'You', text: 'Why are you so quiet today?', time: '6:00 PM' },
            { sender: 'Lover', text: 'I’ve been thinking… about us.', time: '6:01 PM' },
            { sender: 'You', text: 'What’s wrong? I thought everything was perfect.', time: '6:02 PM' },
            { sender: 'Lover', text: 'It is. But I want to make sure we’re on the same page about our future.', time: '6:03 PM' },
            { sender: 'You', text: 'We are. I want forever with you.', time: '6:04 PM' },
            { sender: 'Lover', text: 'Then let’s promise to always prioritize us, no matter what.', time: '6:05 PM' },
            { sender: 'You', text: 'I promise. You mean everything to me.', time: '6:06 PM' },
            { sender: 'Lover', text: 'I love you.', time: '6:07 PM' },
          ],
        },
      },
    },
    6: {
      title: 'Thrilling Escape',
      genre: 'Thriller',
      contactName: 'Agent X',
      profilePic: 'https://media.istockphoto.com/id/1387752063/photo/3d-rendered-illustration-of-detective-man-in-hat.jpg?s=612x612&w=0&k=20&c=dNodmMNxKveDHQU6kmfjUpRRtMi5GuXyRWlj-IcbRWo=',
      status: 'Encrypted',
      episodes: {
        1: {
          title: 'Episode 1: The Mission',
          chats: [
            { sender: 'Agent X', text: 'Target acquired. Proceeding to Phase 1.', time: '11:00 PM' },
            { sender: 'You', text: 'What’s the ETA for extraction?', time: '11:01 PM' },
            { sender: 'Agent X', text: '30 minutes. Stay low and don’t engage.', time: '11:02 PM' },
            { sender: 'You', text: 'Understood. What’s the status on the backup team?', time: '11:03 PM' },
            { sender: 'Agent X', text: 'Backup delayed. You’re on your own for now.', time: '11:04 PM' },
            { sender: 'You', text: 'Great. Just another day in the field.', time: '11:05 PM' },
            { sender: 'Agent X', text: 'You’ve got this. Keep comms open.', time: '11:06 PM' },
          ],
        },
        2: {
          title: 'Episode 2: The Escape',
          chats: [
            { sender: 'You', text: 'I’m surrounded. Need another exit.', time: '11:30 PM' },
            { sender: 'Agent X', text: 'There’s a fire escape two floors down. Move now.', time: '11:31 PM' },
            { sender: 'You', text: 'Under heavy fire. Cover me!', time: '11:32 PM' },
            { sender: 'Agent X', text: 'Diversion in place. Use the distraction to escape.', time: '11:33 PM' },
            { sender: 'You', text: 'Almost there. Extraction point in sight.', time: '11:34 PM' },
            { sender: 'Agent X', text: 'Hurry. The window is closing fast.', time: '11:35 PM' },
            { sender: 'You', text: 'Made it. Mission complete.', time: '11:36 PM' },
          ],
        },
      },
    },
  }


const ChatPage = () => {
  const { id } = useParams(); // Access params with useParams hook
  const storyId = id; // Story ID passed via URL
  const story = chatData[storyId];
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

  const handleEpisodeSelect = (episodeId) => {
    setCurrentEpisodeId(episodeId);
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col sm:flex-row">
      {/* Sidebar */}
      {(currentEpisodeId === null || !isMobileView) && (
        <div className="sm:w-1/4 w-full bg-gray-800 p-4 border-r border-gray-700">
          <h2 className="text-lg font-bold mb-4">{story.title}</h2>
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
                  src={story.profilePic}
                  alt="Profile"
                  className="w-10 h-10 rounded-full mr-2"
                />
                <div>
                  <h2 className="text-lg font-bold">{story.contactName}</h2>
                  <p className="text-sm text-gray-400">{story.status}</p>
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
            {currentEpisodeId ? (
              <div className="flex flex-col space-y-4">
                {story.episodes[currentEpisodeId].chats.map((chat, index) => (
                  <div
                    key={index}
                    className={`relative p-3 rounded-lg max-w-xs ${
                      ['Wife', 'Mom', 'Ana', 'Tina', 'Boss'].includes(chat.sender)
                        ? 'bg-gray-800 text-gray-300 self-start'
                        : 'bg-green-700 text-white self-end'
                    }`}
                  >
                    <strong>{chat.sender}: </strong>
                    <p>{chat.text}</p>
                    <p className="text-xs text-gray-400 absolute bottom-1 right-2">{chat.time}</p>
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

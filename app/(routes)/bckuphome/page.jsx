'use client';

import { redirect, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const HomePage = () => {
  const router = useRouter();
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [stories, setStories] = useState([]);
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const BASE_IMAGE_URL = 'https://wowfy.in/testusr/images/';

  useEffect(() => {
    // const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;    
    // if(!token) {
    //   redirect("/login");
    // }
    
    // Fetch both stories and genres when component mounts
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([fetchStories(), fetchGenres()]);
      } catch (err) {
        setError('Failed to load data');
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchStories = async () => {
    try {
      const response = await fetch('/api/getStories', {
        // headers: {
        //   'Authorization': `Bearer ${localStorage.getItem('token')}`
        // }
      });
      
      if (!response.ok) throw new Error('Failed to fetch stories');
      
      const data = await response.json();
      setStories(data);
    } catch (err) {
      console.error('Error fetching stories:', err);
      throw err;
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await fetch('/api/categories', {
        // headers: {
        //   'Authorization': `Bearer ${localStorage.getItem('token')}`
        // }
      });
      
      if (!response.ok) throw new Error('Failed to fetch genres');
      
      const data = await response.json();
      setGenres(data);
    } catch (err) {
      console.error('Error fetching genres:', err);
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return '';
    return `${BASE_IMAGE_URL}${imagePath}`;
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Main Poster Section */}
      <div className="relative h-[50vh] bg-gradient-to-b from-gray-800 to-gray-900">
        <img
          src={getFullImageUrl(stories[0]?.image)}
          alt={stories[0]?.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-8 left-8">
          <h1 className="text-4xl font-bold">{stories[0]?.title || 'Story Title'}</h1>
          <p className="text-sm mt-2">{stories[0]?.description || 'Story Description'}</p>
          <div className="flex gap-4 mt-4">
            <button
              className="bg-white text-black px-4 py-2 rounded font-semibold"
              onClick={() =>
                router.push(
                  stories[0]?.story_type === 'chat'
                    ? `/stories/${stories[0]?.id}/chat-story`
                    : `/stories/${stories[0]?.id}/normal-story`
                )
              }
            >
              Play
            </button>
            <button className="bg-gray-700 text-white px-4 py-2 rounded font-semibold">
              Resume
            </button>
          </div>
        </div>
      </div>

      {/* Create a Story Button */}
      <div className="flex justify-center mt-8 space-x-4 sm:flex hidden">
        <button
          className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 hover:from-purple-500 hover:via-pink-400 hover:to-red-400 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-lg transform transition-transform hover:scale-105"
          onClick={() => router.push('/create-story')}
        >
          ✍️ Create Your Story
        </button>

        <button
          className="bg-gradient-to-r from-blue-500 via-teal-400 to-green-500 hover:from-blue-400 hover:via-teal-300 hover:to-green-400 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-lg transform transition-transform hover:scale-105"
          onClick={() => router.push('/search-story')}
        >
          ✨ Magic Box
        </button>
      </div>

      {/* Popular Genres Section */}
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Popular Genres</h2>
        <div className="flex gap-4 overflow-x-auto">
          {genres.map((genre) => (
            <button
              key={genre.id}
              className="relative flex-shrink-0 w-48 h-32 rounded-lg overflow-hidden text-white font-bold"
              onClick={() => setSelectedGenre(genre.id === selectedGenre ? null : genre.id)}
              style={{
                backgroundImage: `url(${getFullImageUrl(genre.image)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <span>{genre.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Stories Section */}
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">New Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stories
            .filter((story) =>
              selectedGenre ? story.category_id === selectedGenre : true
            )
            .map((story) => (
              <div
                key={story.id}
                className="relative bg-gray-800 rounded-lg overflow-hidden cursor-pointer"
                onClick={() =>
                  router.push(
                    story.story_type === 'chat'
                      ? `/stories/${story.id}/chat-story`
                      : `/stories/${story.id}/normal-story`
                  )
                }
              >
                <img
                  src={getFullImageUrl(story.image)}
                  alt={story.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                  <h3 className="text-lg font-bold">{story.title}</h3>
                  <p className="text-sm text-gray-300">{story.description}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
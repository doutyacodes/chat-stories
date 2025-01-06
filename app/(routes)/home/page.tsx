'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const HomePage = () => {
  const router = useRouter();
  const [selectedGenre, setSelectedGenre] = useState(null);

  // Check if the user is logged in when the page loads
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.push('/login'); // If not logged in, redirect to the login page
    }
  }, [router]);

  const stories = [
    {
      id: 1,
      title: "A Couple's Fight",
      description: 'Texts • Love • Drama',
      category: 'Romance',
      image: 'https://t4.ftcdn.net/jpg/01/59/17/79/360_F_159177904_Dlyr81domhyeCsF0dzFXQNvxYrNfnkWr.jpg',
    },
    {
      id: 2,
      title: 'Family Chat',
      description: 'Comedy • Family • Bonding',
      category: 'Drama',
      image: 'https://allie.photo/wp-content/uploads/2021/01/what-to-wear-for-large-group-family-photos_0066.jpg',
    },
    {
      id: 3,
      title: 'Office Gossip',
      description: 'Fun • Work • Drama',
      category: 'Comedy',
      image: 'https://img.freepik.com/free-photo/vintage-style-office-workers-having-desk-job_23-2149851039.jpg?semt=ais_hybrid',
    },
    {
      id: 4,
      title: 'Haunted Mansion',
      description: 'Horror • Suspense',
      category: 'Horror',
      image: 'https://i0.wp.com/picjumbo.com/wp-content/uploads/anonymous-hacker-group-free-photo.jpg?w=600&quality=80',
    },
    {
      id: 5,
      title: 'Romantic Getaway',
      description: 'Love • Travel • Emotions',
      category: 'Romance',
      image: 'https://media.istockphoto.com/id/636379014/photo/hands-forming-a-heart-shape-with-sunset-silhouette.jpg?s=612x612&w=0&k=20&c=CgjWWGEasjgwia2VT7ufXa10azba2HXmUDe96wZG8F0=',
    },
    {
      id: 6,
      title: 'Thrilling Escape',
      description: 'Action • Suspense • Chase',
      category: 'Thriller',
      image: 'https://media.istockphoto.com/id/1387752063/photo/3d-rendered-illustration-of-detective-man-in-hat.jpg?s=612x612&w=0&k=20&c=dNodmMNxKveDHQU6kmfjUpRRtMi5GuXyRWlj-IcbRWo=',
    },
  ];

  const genres = ['Romance', 'Drama', 'Family', 'Reality', 'Comedy'];

  const genreImages = {
    Romance: 'https://cdn.pixabay.com/photo/2024/07/10/20/26/ai-generated-8886627_640.jpg',
    Drama: 'https://t4.ftcdn.net/jpg/01/75/31/27/360_F_175312778_05tS7kLNtZM6dtFvG7AG52MovhEOlIJc.jpg',
    Family: 'https://example.com/family.jpg',
    Reality: 'https://example.com/reality.jpg',
    Comedy: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8noccWqcceNtKifoZUQUoa6EtXmf0Z72-VQ&s',
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Main Poster Section */}
      <div className="relative h-[50vh] bg-gradient-to-b from-gray-800 to-gray-900">
        <img
          src={stories[0].image}
          alt="Couple's Fight"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-8 left-8">
          <h1 className="text-4xl font-bold">{stories[0].title}</h1>
          <p className="text-sm mt-2">{stories[0].description}</p>
          <div className="flex gap-4 mt-4">
            <button
              className="bg-white text-black px-4 py-2 rounded font-semibold"
              onClick={() => router.push(`/chat/${stories[0].id}`)}
            >
              Play
            </button>
            <button className="bg-gray-700 text-white px-4 py-2 rounded font-semibold">
              Resume
            </button>
          </div>
        </div>
      </div>

      {/* Popular Genres Section */}
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Popular Genres</h2>
        <div className="flex gap-4 overflow-x-auto">
          {genres.map((genre) => (
            <button
              key={genre}
              className="relative flex-shrink-0 w-48 h-32 rounded-lg overflow-hidden text-white font-bold"
              onClick={() => setSelectedGenre(genre === selectedGenre ? null : genre)}
              style={{
                backgroundImage: `url(${genreImages[genre] || ''})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <span>{genre}</span>
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
              selectedGenre ? story.category === selectedGenre : true
            )
            .map((story) => (
              <div
                key={story.id}
                className="relative bg-gray-800 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => router.push(`/chat/${story.id}`)}
              >
                <img
                  src={story.image}
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

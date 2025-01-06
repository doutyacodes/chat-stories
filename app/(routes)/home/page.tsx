'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const HomePage = () => {
  const router = useRouter();

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
      image: 'https://t4.ftcdn.net/jpg/01/59/17/79/360_F_159177904_Dlyr81domhyeCsF0dzFXQNvxYrNfnkWr.jpg', // Replace with your image path
    },
    {
      id: 2,
      title: 'Family Chat',
      description: 'Comedy • Family • Bonding',
      image: 'https://allie.photo/wp-content/uploads/2021/01/what-to-wear-for-large-group-family-photos_0066.jpg', // Replace with your image path
    },
    {
      id: 3,
      title: 'Office Gossip',
      description: 'Fun • Work • Drama',
      image: '/path-to-office-gossip-image.jpg', // Replace with your image path
    },
  ];

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Main Poster Section */}
      <div className="relative h-[50vh] bg-gradient-to-b from-gray-800 to-gray-900">
        <img
          src={stories[0].image} // Use the Couple's Fight image as the main poster
          alt="Couple's Fight"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-8 left-8">
          <h1 className="text-4xl font-bold">{stories[0].title}</h1>
          <p className="text-sm mt-2">{stories[0].description}</p>
          <div className="flex gap-4 mt-4">
            <button
              className="bg-white text-black px-4 py-2 rounded font-semibold"
              onClick={() => router.push(`/chat/${stories[0].id}`)} // Navigate to the Couple's Fight chat
            >
              Play
            </button>
            <button className="bg-gray-700 text-white px-4 py-2 rounded font-semibold">
              Resume
            </button>
          </div>
        </div>
      </div>

      {/* Stories Section */}
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">New Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stories.slice(1).map((story) => (
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

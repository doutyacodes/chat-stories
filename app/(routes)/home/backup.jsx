"use client"
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import StoryCardsSlider from './_components/StoryCardsSlider';
import StorySlider from './_components/StorySlider';

const slides = [
  {
    id: 1,
    image: "https://plus.unsplash.com/premium_photo-1664361480677-d19cf6a3af9f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Mountain Adventure",
    synopsis: "Explore the stunning peaks and valleys of the mountain range"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1504006833117-8886a355efbf?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Ocean Depths",
    synopsis: "Discover the mysteries of the deep blue sea"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1501707305551-9b2adda5e527?q=80&w=2053&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Urban Life",
    synopsis: "Experience the vibrant culture of city living"
  }
];

const ImageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);


  const fetchStories = async () => {
    try {
      const response = await fetch('/api/fetchAllData', {
      });
      
      if (!response.ok) throw new Error('Failed to fetch stories');
      
      const data = await response.json();
      console.log(data)
      setStories(data);
    } catch (err) {
      console.error('Error fetching stories:', err);
      throw err;
    }
  };

  useEffect(() => {
    let interval;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  return (
    <div className="min-h-screen bg-black pb-16">
      <div className='max-w-6xl p-7'>
        <div className="relative mx-auto h-[300px] md:h-[500px] overflow-hidden rounded-3xl">
            {/* Image and Overlay */}
            <div className="relative h-full w-full">
            <img
                src={slides[currentIndex].image}
                alt={slides[currentIndex].title}
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            
            {/* Text Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
                <h2 className="text-white text-2xl md:text-4xl font-bold mb-2">
                {slides[currentIndex].title}
                </h2>
                <p className="text-white/90 text-sm md:text-lg">
                {slides[currentIndex].synopsis}
                </p>
            </div>
              
            {/* Navigation Arrows */}
            {/* <button 
                onClick={prevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/30 hover:bg-white/50 transition-colors"
            >
                <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button 
                onClick={nextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/30 hover:bg-white/50 transition-colors"
            >
                <ChevronRight className="w-6 h-6 text-white" />
            </button> */}
            
            {/* Navigation Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {slides.map((_, index) => (
                <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentIndex === index ? 'bg-white scale-125' : 'bg-white/50'
                    }`}
                />
                ))}
            </div>
            </div>
        </div>
        <div className="mx-auto my-4">
            <div className="relative">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
                <input
                    type="text"
                    placeholder="Search Stories..."
                    className="w-full bg-transparent text-white/90 border-b border-white/30 focus:border-white/70 
                      py-2 pl-8 pr-4 outline-none transition-colors placeholder:text-white/50 
                      text-base font-light"
                  />
            </div>
        </div>
        {/* AI Story Creation Cards */}
        <div className="space-y-2 my-8">
          <StoryCardsSlider />
        </div>
      </div>

      {/* Story Sections */}
      <StorySlider 
        title="Trending Stories" 
        stories={[
          { title: "National Park Exploration", image: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bmF0aW9uYWwlMjBwYXJrfGVufDB8fDB8fHww" },
          { title: "Mountain Retreat", image: "https://plus.unsplash.com/premium_photo-1668351277191-9df852eb657f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8TW91bnRhaW4lMjBSZXRyZWF0fGVufDB8fDB8fHww" },
          { title: "Island Escapades", image: "https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8SXNsYW5kJTIwRXNjYXBhZGVzfGVufDB8fDB8fHww" },
          { title: "Safari Adventure", image: "https://plus.unsplash.com/premium_photo-1661290309226-2e5cd5a3915f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8U2FmYXJpJTIwQWR2ZW50dXJlfGVufDB8fDB8fHww" },
        ]} 
      />

      <StorySlider 
        title="Latest Stories" 
        stories={[
          { title: "Beach Getaway", image: "https://images.unsplash.com/photo-1533760881669-80db4d7b4c15?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8QmVhY2glMjBHZXRhd2F5fGVufDB8fDB8fHww" },
          { title: "Forest Camping", image: "https://images.unsplash.com/photo-1698731030142-92765f29f98d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
          { title: "Rainforest Expedition", image: "https://images.unsplash.com/photo-1721933004766-a5122afa0689?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
          { title: "Northern Lights View", image: "https://images.unsplash.com/photo-1533760881669-80db4d7b4c15?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8QmVhY2glMjBHZXRhd2F5fGVufDB8fDB8fHww" },
        ]} 
      />
    </div>
  );
};

export default ImageCarousel;
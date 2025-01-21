// import React, { useState } from 'react';
// import { ChevronLeft, ChevronRight } from 'lucide-react';

// const StoryCardsSlider = () => {
//   const [currentSlide, setCurrentSlide] = useState(0);

//   const cards = [
//     {
//       title: "Make Your Own Stories with A.I",
//       description: "Create unique stories using AI assistance",
//       bgImage: "https://plus.unsplash.com/premium_photo-1675490808234-453b817d9a72?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     },
//     {
//       title: "Creator's Corner",
//       description: "Write and publish your original stories",
//       bgImage: "https://images.unsplash.com/photo-1636956040469-fec02ed01ab5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     }
//   ];

//   const nextSlide = () => {
//     setCurrentSlide((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
//   };

//   const prevSlide = () => {
//     setCurrentSlide((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
//   };

//   return (
//     <div className="w-full max-w-3xl mx-auto">
//       {/* Desktop View */}
//       <div className="hidden md:grid md:grid-cols-2 gap-6">
//         {cards.map((card, index) => (
//           <div 
//             key={index}
//             className="relative h-32 rounded-3xl overflow-hidden group hover:shadow-xl transition-shadow duration-300"
//             style={{
//               backgroundImage: `url(${card.bgImage})`,
//               backgroundSize: 'cover',
//               backgroundPosition: 'center'
//             }}
//           >
//             <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />
//             <div className="relative p-8 h-full flex flex-col justify-center">
//               <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
//               <p className="text-base text-gray-200">{card.description}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Mobile View */}
//       <div className="md:hidden relative">
//         <div className="overflow-hidden rounded-3xl">
//           <div 
//             className="flex h-28 transition-transform duration-300 ease-out"
//             style={{ transform: `translateX(-${currentSlide * 100}%)` }}
//           >
//             {cards.map((card, index) => (
//               <div 
//                 key={index}
//                 className="w-full flex-shrink-0 relative h-full px-3"
//                 style={{
//                   backgroundImage: `url(${card.bgImage})`,
//                   backgroundSize: 'cover',
//                   backgroundPosition: 'center'
//                 }}
//               > 
//                   <div className="absolute inset-0 bg-black/40" /> {/* shade */}
//                   <div className="relative h-full flex flex-col justify-center">
//                     <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
//                     <p className="text-base text-gray-200">{card.description}</p>
//                   </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Navigation Buttons */}
//         <button 
//           onClick={prevSlide} 
//           className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white"
//         >
//           <ChevronLeft className="w-6 h-6" />
//         </button>
//         <button 
//           onClick={nextSlide} 
//           className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white"
//         >
//           <ChevronRight className="w-6 h-6" />
//         </button>

//         {/* Slide Indicators */}
//         <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
//           {cards.map((_, index) => (
//             <button
//               key={index}
//               onClick={() => setCurrentSlide(index)}
//               className={`w-2 h-2 rounded-full transition-colors duration-300 ${
//                 currentSlide === index ? 'bg-purple-500' : 'bg-gray-300'
//               }`}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StoryCardsSlider;


import { useRouter } from 'next/navigation';
import React, { useState, useRef } from 'react';

const StoryCardsSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const router = useRouter()
  const cards = [
    {
      title: "Make Your\nOwn Stories\n with A.I",
      bgImage: "/ai-story.png",
      url: "/search-story"

    },
    {
      title: "Creator's\nCorner",
      bgImage: "/be-a-creator.png",
      url: "/create-story"
    }
  ];

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (Math.abs(distance) < minSwipeDistance) return;

    if (distance > 0 && currentSlide < cards.length - 1) {
      // Swiped left
      setCurrentSlide(curr => curr + 1);
    } else if (distance < 0 && currentSlide > 0) {
      // Swiped right
      setCurrentSlide(curr => curr - 1);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Desktop View */}
      <div className="hidden md:grid md:grid-cols-2 gap-6">
        {cards.map((card, index) => (
          <div 
            key={index}
            className="relative h-32 rounded-3xl overflow-hidden group hover:shadow-xl transition-shadow duration-300"
            onClick={() =>
              router.push(card.url)
            }
          >
            <div className="absolute inset-0">
              <img 
                src={card.bgImage} 
                alt={card.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Mobile View */}
      <div className="md:hidden relative">
        <div className="overflow-hidden rounded-3xl">
          <div 
            className="flex h-28 transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {cards.map((card, index) => (
              <div 
                key={index}
                className="w-full flex-shrink-0 relative h-full"
                onClick={() =>
                  router.push(card.url)
                }
              > 
                <div className="absolute inset-0">
                  <img 
                    src={card.bgImage} 
                    alt={card.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                currentSlide === index ? 'bg-purple-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoryCardsSlider;
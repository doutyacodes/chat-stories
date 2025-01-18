import React from 'react'

function StorySlider({ title, stories }) {
  return (
      <div className="mb-6">
        <h2 className="text-base text-white font-medium mb-3 px-4">{title}</h2>
        <div className="flex overflow-x-auto hide-scrollbar px-7 space-x-3">
          {stories.map((story, idx) => (
            <div key={idx} className="flex-none w-24">
              <img 
                src={story.image} 
                alt={story.title}
                className="w-full h-20 object-cover border-[5px] rounded-xl mb-1"
              />
              <p className="text-xs text-center text-white font-medium">{story.title}</p>
            </div>
          ))}
        </div>
      </div>
  )
}

export default StorySlider
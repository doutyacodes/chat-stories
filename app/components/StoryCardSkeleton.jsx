"use client";
import React from 'react';

const StoryCardSkeleton = ({ count = 5 }) => {
  return (
    <div className="mb-8">
      <div className="px-4 mb-4">
        <div className="h-6 w-44 bg-neutral-800/80 rounded-md animate-pulse mb-1" />
      </div>
      <div className="flex overflow-x-auto scrollbar-hide px-4 space-x-4 pb-4">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="flex-none w-32 md:w-56 animate-pulse">
            <div className="w-full h-28 md:h-44 bg-neutral-800/80 rounded-2xl border-[6px] border-neutral-900 mb-2" />
            <div className="h-4 w-3/4 bg-neutral-800/80 rounded mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoryCardSkeleton;

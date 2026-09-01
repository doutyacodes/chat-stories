"use client";
import React from 'react';

const GridSkeleton = ({ count = 10 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="flex-none cursor-pointer animate-pulse">
          <div className="w-full aspect-[3/2.5] bg-neutral-900 rounded-2xl border border-white/5 mb-2" />
          <div className="h-4 w-3/4 bg-neutral-800 rounded mx-auto" />
        </div>
      ))}
    </div>
  );
};

export default GridSkeleton;

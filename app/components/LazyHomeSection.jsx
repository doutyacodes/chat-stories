"use client";
import React, { useState, useEffect, useRef } from 'react';

const LazyHomeSection = ({ children, fallback = null, rootMargin = '300px' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [rootMargin]);

  return (
    <div ref={containerRef} className="min-h-[120px]">
      {isVisible ? children : fallback}
    </div>
  );
};

export default LazyHomeSection;

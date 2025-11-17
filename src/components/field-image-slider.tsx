"use client";

import React, { useState, useEffect } from "react";

const images = ["/1.jpeg", "/2.jpeg", "/3.jpeg"];

export default function FieldImageSlider() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>(
    new Array(images.length).fill(false)
  );

  // Preload images
  useEffect(() => {
    images.forEach((src, index) => {
      const img = new Image();
      img.onload = () => {
        setImagesLoaded((prev) => {
          const updated = [...prev];
          updated[index] = true;
          return updated;
        });
      };
      img.src = src;
    });
  }, []);

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-64 sm:h-80 lg:h-96 overflow-hidden rounded-xl">
      {/* Images */}
      <div className="relative w-full h-full">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              currentImageIndex === index ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Loading placeholder */}
            {!imagesLoaded[index] && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
            )}

            {/* Image */}
            <img
              src={image}
              alt={`Field ${index + 1}`}
              className={`w-full h-full object-cover transition-opacity duration-500 rounded-xl ${
                imagesLoaded[index] ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* Dark overlay for better visual contrast */}
            <div className="absolute inset-0 bg-black/20 rounded-xl"></div>
          </div>
        ))}
      </div>

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentImageIndex === index
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
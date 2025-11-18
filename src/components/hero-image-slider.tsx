"use client";

import React, { useState, useEffect } from "react";

const images = ["/1.jpeg", "/2.jpeg", "/3.jpeg"];

export default function HeroImageSlider() {
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
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
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
              className={`w-full h-full object-cover transition-opacity duration-500 ${
                imagesLoaded[index] ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* Dark overlay for better visual contrast */}
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
        ))}
      </div>

      {/* Enhanced Overlay for Better Text Contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

      {/* CTA Content - Centered on all devices */}
      <div className="absolute inset-0 flex items-center justify-center text-white z-50 px-4">
        <div className="max-w-4xl w-full text-center">
          {/* Main Title - Centered on all devices */}
          <div className="mb-6">
            {/* Logo - centered on all devices, larger on tablet and desktop */}
            <div className="mb-2 flex justify-center">
              <img
                src="/logo1.png"
                alt="Batas Kota Logo"
                className="h-24 sm:h-24 lg:h-32 w-auto object-contain"
              />
            </div>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-3 tracking-tight
                         text-white drop-shadow-xl text-center"
            >
              Batas Kota
            </h1>
            <div className="flex items-center justify-center gap-3">
              <div className="w-8 h-0.5 bg-gradient-to-r from-[#703B3B] to-[#E1D0B3]"></div>
              <h2
                className="text-lg sm:text-xl lg:text-2xl font-light tracking-wide
                           text-white/90"
              >
                The Town Space
              </h2>
            </div>
          </div>

          {/* Main Headline */}
          <div className="mb-8">
            <p
              className="text-lg sm:text-xl lg:text-2xl font-semibold leading-relaxed
                       text-white/95 mx-auto"
            >
              Rasakan Serunya Bermain di
              <span className="block text-[#E1D0B3] font-bold mt-1">
                Mini Soccer Terbaik di Lombok
              </span>
            </p>
          </div>

          {/* Call to Action Buttons - Simplified & Elegant */}
          <div className="flex flex-col sm:flex-row gap-3 mb-12 justify-center">
            <button
              onClick={() =>
                (window.location.href = "/fields/cmhvrkzu20004cfp06b3xwes8")
              }
              className="px-6 py-3 bg-[#703B3B] hover:bg-[#5a2f2f] text-white font-medium rounded-md
                       transition-all duration-200 text-sm shadow-lg hover:shadow-xl
                       border border-[#703B3B] hover:border-[#5a2f2f]"
            >
              Pesan Lapangan
            </button>

            <button
              onClick={() => (window.location.href = "/register")}
              className="px-6 py-3 bg-transparent text-white font-medium rounded-md
                       transition-all duration-200 text-sm
                       border border-white/30 hover:border-white/60 hover:bg-white/10"
            >
              Daftar Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

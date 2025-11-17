"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface FieldData {
  id: number
  name: string
  location: string
  rating: number
  price: string
  available: boolean
  image: string
}

const fieldsData: FieldData[] = [
  {
    id: 1,
    name: "Green Field Arena",
    location: "Central Jakarta",
    rating: 4.9,
    price: "Rp 150K/hour",
    available: true,
    image: "/1.jpeg"
  },
  {
    id: 2,
    name: "Champions Court",
    location: "South Jakarta",
    rating: 4.8,
    price: "Rp 175K/hour",
    available: true,
    image: "/2.jpeg"
  },
  {
    id: 3,
    name: "Victory Ground",
    location: "East Jakarta",
    rating: 4.7,
    price: "Rp 125K/hour",
    available: false,
    image: "/3.jpeg"
  }
]

export default function FieldSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [imageLoaded, setImageLoaded] = useState<{ [key: number]: boolean }>({})

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || isPaused) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % fieldsData.length)
    }, 2000) // Change slide every 2 seconds

    return () => clearInterval(interval)
  }, [isPlaying, isPaused])

  // Handle slide navigation
  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsPlaying(false) // Stop auto-play when manually navigating
    setTimeout(() => setIsPlaying(true), 10000) // Resume after 10 seconds
  }

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % fieldsData.length)
  }

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + fieldsData.length) % fieldsData.length)
  }

  const handleMouseEnter = () => {
    setIsPaused(true)
  }

  const handleMouseLeave = () => {
    setIsPaused(false)
  }

  const handleImageLoad = (index: number) => {
    setImageLoaded(prev => ({ ...prev, [index]: true }))
  }

  return (
    <div className="relative group">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#703B3B] to-[#8B4F4F] rounded-3xl transform rotate-3 opacity-20"></div>

      <div
        className="relative bg-white rounded-3xl shadow-2xl p-8 border border-[#E1D0B3] overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Our Field</h3>
        </div>

        {/* Main Slider Container */}
        <div className="relative h-96 rounded-2xl overflow-hidden mb-6">
          {/* Slides */}
          <div className="relative h-full">
            {fieldsData.map((field, index) => (
              <div
                key={field.id}
                className={cn(
                  "absolute inset-0 transition-opacity duration-700 ease-in-out",
                  currentSlide === index ? "opacity-100" : "opacity-0"
                )}
              >
                {/* Loading placeholder */}
                {!imageLoaded[index] && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                )}

                {/* Field Image */}
                <img
                  src={field.image}
                  alt="Field image"
                  className={cn(
                    "w-full h-full object-cover",
                    !imageLoaded[index] && "opacity-0"
                  )}
                  onLoad={() => handleImageLoad(index)}
                />
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
            {fieldsData.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "transition-all duration-200",
                  currentSlide === index
                    ? "w-8 h-2 bg-white rounded-full"
                    : "w-2 h-2 bg-white/50 hover:bg-white/70 rounded-full"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

  
        {/* View All Button */}
        <Link href="/fields">
          <Button
            variant="outline"
            className="w-full border-[#E1D0B3] text-[#703B3B] hover:bg-[#EFE9E3] hover:border-[#703B3B] transition-all duration-200 group"
          >
            View All Fields
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Calendar } from "lucide-react";

export default function FloatingBookingButton() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  // Hide button on certain pages where it's not needed
  const shouldHideButton = [
    "/fields",
    "/admin",
    "/dashboard",
    "/login",
    "/register",
  ].some((path) => pathname.startsWith(path));

  useEffect(() => {
    if (shouldHideButton) return;

    const handleScroll = () => {
      // Show button when user scrolls down 200px from top
      if (window.scrollY > 200) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [shouldHideButton]);

  if (shouldHideButton) return null;

  return (
    <>
      {/* Mobile Floating Button - Bottom Right */}
      <Link
        href="/fields/cmhvrkzu20004cfp06b3xwes8"
        className={`lg:hidden fixed bottom-6 right-6 z-50 bg-gradient-to-r from-[#703B3B] to-[#8B4F4F] hover:from-[#5a2f2f] hover:to-[#7A3F3F] text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 items-center justify-center group px-3 py-1 ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        aria-label="Pesan Lapangan"
      >
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium text-xs whitespace-nowrap">Booking</span>
        </div>
      </Link>

      {/* Desktop Floating Button - Bottom Right, visible when scrolling */}
      <Link
        href="/fields/cmhvrkzu20004cfp06b3xwes8"
        className={`hidden lg:flex fixed bottom-8 right-8 z-50 bg-gradient-to-r from-[#703B3B] to-[#8B4F4F] hover:from-[#5a2f2f] hover:to-[#7A3F3F] text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 items-center justify-center group px-6 py-3 gap-2 ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        aria-label="Pesan Lapangan"
      >
        <Calendar className="w-5 h-5" />
        <span className="font-medium">Booking</span>
      </Link>
    </>
  );
}

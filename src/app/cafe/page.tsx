import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Coffee, Clock, Star, ArrowLeft } from "lucide-react";

export default function CafePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EFE9E3] to-[#E1D0B3]">
      <div className="bg-gradient-to-br from-[#F5F0E8] to-[#EFE9E3] pb-28">
        <div className="container mx-auto px-4 py-16">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-orange-600 hover:text-orange-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Main Coming Soon Content */}
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-white/80 backdrop-blur-sm border-[#E1D0B3]/20 shadow-xl">
            <CardContent className="p-12">
              {/* Coffee Icon */}
              <div className="flex justify-center mb-8">
                <div className="bg-gradient-to-br from-[#703B3B] to-[#8B4F4F] p-6 rounded-full shadow-lg">
                  <Coffee className="w-16 h-16 text-white" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                Cafe <span className="text-[#703B3B]">Coming Soon</span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                We're brewing something special! Our cafe will soon be serving
                delicious coffee, snacks, and refreshments right here at Batas
                Kota.
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-[#F5F0E8] p-6 rounded-lg border border-[#E1D0B3]/30">
                  <Coffee className="w-10 h-10 text-[#703B3B] mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Premium Coffee
                  </h3>
                  <p className="text-sm text-gray-600">
                    Locally sourced beans and expert brewing
                  </p>
                </div>
                <div className="bg-[#F5F0E8] p-6 rounded-lg border border-[#E1D0B3]/30">
                  <Clock className="w-10 h-10 text-[#703B3B] mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Quick Service
                  </h3>
                  <p className="text-sm text-gray-600">
                    Perfect for breaks between games
                  </p>
                </div>
                <div className="bg-[#F5F0E8] p-6 rounded-lg border border-[#E1D0B3]/30">
                  <Star className="w-10 h-10 text-[#703B3B] mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Comfortable Space
                  </h3>
                  <p className="text-sm text-gray-600">
                    Relax and enjoy our cozy atmosphere
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Teaser */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 italic">
              "Good coffee and good sports - the perfect combination!"
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <div className="w-2 h-2 bg-[#703B3B] rounded-full"></div>
              <div className="w-2 h-2 bg-[#703B3B] rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-[#703B3B] rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

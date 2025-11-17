import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ClientOnly from "@/components/client-only";
import FieldSlider from "@/components/field-slider";
import { HowItWorksBackground } from "@/components/ui/how-it-works-background";
import HeroImageSlider from "@/components/hero-image-slider";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Shield,
  CreditCard,
  CheckCircle,
  Trophy,
  Target,
  ChevronRight,
  ArrowRight,
  Search,
  Zap,
  Award,
  Lock,
  ThumbsUp,
  Check,
} from "lucide-react";

export default function Home() {
  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-[#EFE9E3] to-[#E1D0B3] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#E1D0B3] border-t-[#703B3B] rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-[#703B3B] font-medium">Loading...</p>
          </div>
        </div>
      }
    >
      {/* Hero Section - Full Image Slider */}
      <section className="min-h-screen">
        <HeroImageSlider />
      </section>

    
        {/* Location Section */}
      <section className="py-20 bg-gradient-to-tr from-[#E1D0B3] via-[#EFE9E3] to-[#F5F0E8] relative overflow-hidden">
        <HowItWorksBackground />
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Temukan Arena Mini Soccer Terbaik di Jantung Kota Selong
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Batas Kota – The Town Space hadir dengan lapangan mini soccer
              premium yang dirancang untuk memberikan pengalaman bermain
              terbaik.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Description */}
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Berada di lokasi strategis dengan akses jalan yang mudah,
                  arena kami dapat dijangkau dengan cepat dari berbagai kawasan
                  di Selong dan sekitarnya.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Lapangan Mini Soccer Premium di Selong
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Bermain jadi lebih seru di lapangan berkualitas tinggi
                    dengan fasilitas lengkap, pencahayaan optimal, dan permukaan
                    nyaman untuk semua level pemain—dari fun match hingga
                    pertandingan kompetitif.
                  </p>
                  <p className="text-gray-700 leading-relaxed mt-2">
                    Datang, bermain, dan rasakan atmosfernya.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-[#703B3B] mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Alamat Lengkap
                      </h4>
                      <p className="text-gray-700">
                        Jl. Selong No. 123, Selong, Lombok Timur, NTB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-[#703B3B] mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Jam Operasional
                      </h4>
                      <p className="text-gray-700">Buka 24 jam setiap hari</p>
                      <p className="text-gray-600 text-sm mt-1">
                        Siap untuk booking kapan saja—pagi, siang, malam, hingga
                        match last-minute.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-[#703B3B] mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Kapasitas Lapangan
                      </h4>
                      <p className="text-gray-700">
                        Lapangan mini soccer standar dengan ruang ideal untuk
                        5–10 pemain per tim, memberikan permainan yang lebih
                        cepat, intens, dan menyenangkan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Map Card */}
            <div className="relative">
              <Card className="overflow-hidden shadow-xl border-0">
                <div className="aspect-video relative">
                  {/* Google Maps Embedded Iframe */}
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3944.51188286332!2d116.508938!3d-8.642768!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zOMKwMzgnMzQuMCJTIDExNsKwMzAnMzIuMiJF!5e0!3m2!1sid!2sid!4v1763179997548!5m2!1sid!2sid"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-t-lg"
                  ></iframe>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
      {/* Ready to Elevate Your Game? Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#703B3B] via-[#8B4F4F] to-[#A56666]"></div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>

        {/* Soccer field pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, rgba(255,255,255,0.3) 0px, transparent 1px, transparent 40px, rgba(255,255,255,0.3) 41px),
                               repeating-linear-gradient(0deg, rgba(255,255,255,0.3) 0px, transparent 1px, transparent 40px, rgba(255,255,255,0.3) 41px)`,
              backgroundSize: "80px 80px",
            }}
          ></div>
        </div>

        <div className="relative container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            {/* Main content card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-12">
              <div className="text-center mb-10">
                {/* Logo badge */}
                <div className="inline-flex items-center justify-center w-20 h-20 mb-6">
                  <img
                    src="/logo.png"
                    alt="Batas Kota Logo"
                    className="h-full w-full object-contain"
                  />
                </div>

                {/* Main headline */}
                <h2 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  Setiap Permainan Punya Cerita.
                </h2>

                {/* Subtitle with enhanced typography */}
                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                  Biarkan{" "}
                  <span className="font-semibold text-[#703B3B]">
                    Batas Kota
                  </span>{" "}
                  menjadi tempat bermain mini soccermu
                  <br />
                  Saatnya kamu merasakan kualitas permainan yang sebenarnya
                  mulai sekarang.
                </p>
              </div>

              {/* Button group with enhanced contrast and design */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                <Link href="/fields">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[#703B3B] to-[#8B4F4F] hover:from-[#5a2f2f] hover:to-[#7A3F3F] text-white px-6 py-3 text-base sm:text-lg font-semibold min-h-[48px] sm:min-h-[56px] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-2 border-transparent"
                  >
                    <Search className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Lihat Jadwal Sekarang
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 text-[#703B3B] px-6 py-3 text-base sm:text-lg font-semibold min-h-[48px] sm:min-h-[56px] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-2 border-[#703B3B]"
                  >
                    <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Daftar Sekarang
                    <ChevronRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </Link>
              </div>

              <p className="text-white/90 text-sm mt-4">
                Need help?{" "}
                <span className="font-semibold">
                  Contact our 24/7 support team
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </ClientOnly>
  );
}

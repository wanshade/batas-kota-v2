"use client";

import { useState, useEffect, useRef } from "react";
import { signIn, useSession, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import SuccessModal from "@/components/ui/success-modal";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Users,
  Trophy,
  Clock,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get callbackUrl from search params, fallback to null
  const callbackUrl = searchParams?.get("callbackUrl");

  // Countdown timer effect
  useEffect(() => {
    if (showSuccessModal && countdown > 0) {
      countdownIntervalRef.current = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (showSuccessModal && countdown === 0) {
      // Auto-redirect when countdown reaches 0
      const redirectPath = getRedirectPath();
      router.push(redirectPath);
      router.refresh();
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearTimeout(countdownIntervalRef.current);
      }
    };
  }, [showSuccessModal, countdown, router]);

  // Reset countdown when modal opens
  useEffect(() => {
    if (showSuccessModal) {
      setCountdown(15);
    }
  }, [showSuccessModal]);

  // Helper functions to determine modal content and routing based on user role and callback
  const getModalContent = () => {
    const isAdmin = session?.user?.role === "ADMIN";
    const hasCallbackUrl =
      callbackUrl && callbackUrl !== "/admin" && callbackUrl !== "/dashboard";

    return {
      title:
        isAdmin && !hasCallbackUrl
          ? "🎯 Akses Admin Diberikan!"
          : "🎉 Selamat Datang Kembali!",
      message: hasCallbackUrl
        ? "Senang melihat Anda lagi! Anda akan dialihkan kembali untuk menyelesaikan pemesanan Anda."
        : isAdmin
        ? "Selamat datang kembali, Administrator! Anda sekarang memiliki akses untuk mengelola seluruh sistem pemesanan lapangan sepak bola."
        : "Senang melihat Anda lagi! Anda telah berhasil masuk dan siap untuk memesan lapangan sepak bola Anda berikutnya.",
      buttonText: hasCallbackUrl
        ? "Lanjutkan ke Pemesanan"
        : isAdmin
        ? "Ke Dashboard Admin"
        : "Ke Dashboard",
    };
  };

  const getRedirectPath = () => {
    // If there's a callbackUrl, use it
    if (callbackUrl) {
      return callbackUrl;
    }
    // Otherwise, redirect based on user role
    return session?.user?.role === "ADMIN" ? "/admin" : "/dashboard";
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
        callbackUrl: callbackUrl || undefined,
      });

      if (result?.error) {
        setError("Email atau kata sandi tidak valid");
      } else {
        // Refresh session to get user role information
        await getSession();
        setShowSuccessModal(true);
      }
    } catch (error) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#EFE9E3] via-[#F5F0E8] to-[#E1D0B3] flex items-center justify-center p-4">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#E1D0B3] rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#703B3B] rounded-full opacity-10 blur-3xl"></div>
          <div className="absolute top-1/3 left-1/4 w-60 h-60 bg-[#8B4F4F] rounded-full opacity-10 blur-3xl"></div>
        </div>

        <div className="w-full max-w-lg relative z-10 mb-20">
          {/* Logo and header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-4">
              <img
                src="/logo1.png"
                alt="Batas Kota Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Selamat Datang Kembali
            </h1>
            <p className="text-gray-600">
              Masuk untuk mengakses pemesanan lapangan sepak bola Anda
            </p>
          </div>

          {/* Trust indicators */}
          <div className="flex justify-center gap-8 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Shield className="w-4 h-4 text-[#703B3B]" />
              <span>Aman</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Users className="w-4 h-4 text-[#703B3B]" />
              <span>1000+ Pemain</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock className="w-4 h-4 text-[#703B3B]" />
              <span>Akses 24/7</span>
            </div>
          </div>

          <Card className="shadow-xl border border-[#E1D0B3]/50 bg-white/90 backdrop-blur-sm">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="text-2xl font-bold">Masuk</CardTitle>
              <CardDescription className="text-gray-600">
                Masukkan kredensial Anda untuk mengakses akun dan kelola
                pemesanan Anda
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={onSubmit} className="space-y-5">
                {/* Email field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Mail className="w-4 h-4 text-gray-500" />
                    Alamat Email
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      required
                      disabled={isLoading}
                      className="pl-10 transition-colors"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Lock className="w-4 h-4 text-gray-500" />
                    Kata Sandi
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan kata sandi Anda"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      required
                      disabled={isLoading}
                      className="pl-10 pr-12 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Global error message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    {error}
                  </div>
                )}

                {/* Submit button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#703B3B] to-[#8B4F4F] hover:from-[#5a2f2f] hover:to-[#7A3F3F] text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Masuk...
                    </div>
                  ) : (
                    "Masuk"
                  )}
                </Button>
              </form>

              <Separator className="my-6" />

              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Belum punya akun?{" "}
                  <Link
                    href="/register"
                    className="text-[#703B3B] hover:text-[#5a2f2f] font-medium underline-offset-4 hover:underline transition-colors"
                  >
                    Buat akun di sini
                  </Link>
                </p>

                <div className="text-xs text-gray-500">
                  <p>Dengan masuk, Anda menyetujui</p>
                  <div className="flex justify-center gap-2">
                    <Link
                      href="/terms"
                      className="text-[#703B3B] hover:text-[#5a2f2f] underline"
                    >
                      Syarat & Ketentuan
                    </Link>
                    <span>dan</span>
                    <Link
                      href="/privacy"
                      className="text-[#703B3B] hover:text-[#5a2f2f] underline"
                    >
                      Kebijakan Privasi
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          const redirectPath = getRedirectPath();
          router.push(redirectPath);
          router.refresh();
        }}
        title={getModalContent().title}
        message={getModalContent().message}
        buttonText={`${getModalContent().buttonText} (${countdown}s)`}
        showCountdown={true}
        countdown={countdown}
      />
    </>
  );
}

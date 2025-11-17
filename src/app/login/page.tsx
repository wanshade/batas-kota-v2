"use client"

import { useState, useEffect, useRef } from "react"
import { signIn, useSession, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import SuccessModal from "@/components/ui/success-modal"
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Users,
  Trophy,
  Clock
} from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [countdown, setCountdown] = useState(15)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Countdown timer effect
  useEffect(() => {
    if (showSuccessModal && countdown > 0) {
      countdownIntervalRef.current = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
    } else if (showSuccessModal && countdown === 0) {
      // Auto-redirect when countdown reaches 0
      const redirectPath = getRedirectPath()
      router.push(redirectPath)
      router.refresh()
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearTimeout(countdownIntervalRef.current)
      }
    }
  }, [showSuccessModal, countdown, router])

  // Reset countdown when modal opens
  useEffect(() => {
    if (showSuccessModal) {
      setCountdown(15)
    }
  }, [showSuccessModal])

  // Helper functions to determine modal content and routing based on user role
  const getModalContent = () => {
    const isAdmin = session?.user?.role === "ADMIN"
    return {
      title: isAdmin ? "🎯 Admin Access Granted!" : "🎉 Welcome Back!",
      message: isAdmin
        ? "Welcome back, Administrator! You now have access to manage the entire soccer field booking system."
        : "Great to see you again! You've successfully logged in and are ready to book your next soccer field.",
      buttonText: isAdmin ? "Go to Admin Dashboard" : "Go to Dashboard"
    }
  }

  const getRedirectPath = () => {
    return session?.user?.role === "ADMIN" ? "/admin" : "/dashboard"
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else {
        // Refresh session to get user role information
        await getSession()
        setShowSuccessModal(true)
      }
    } catch (error) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200 rounded-full opacity-20 blur-3xl"></div>
        </div>

        <div className="w-full max-w-lg relative z-10">
          {/* Logo and header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-4">
              <img
                src="/logo.png"
                alt="Batas Kota Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to access your soccer field bookings</p>
          </div>

          {/* Trust indicators */}
          <div className="flex justify-center gap-8 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="w-4 h-4 text-green-600" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4 text-green-600" />
              <span>1000+ Players</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-green-600" />
              <span>24/7 Access</span>
            </div>
          </div>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
              <CardDescription className="text-gray-600">
                Enter your credentials to access your account and manage your bookings
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={onSubmit} className="space-y-5">
                {/* Email field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                    <Mail className="w-4 h-4 text-gray-500" />
                    Email Address
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-10 transition-colors"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium">
                    <Lock className="w-4 h-4 text-gray-500" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-10 pr-12 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing in...
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <Separator className="my-6" />

              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="text-green-600 hover:text-green-700 font-medium underline-offset-4 hover:underline transition-colors"
                  >
                    Create account here
                  </Link>
                </p>

                <div className="text-xs text-gray-500">
                  <p>By signing in, you agree to our</p>
                  <div className="flex justify-center gap-2">
                    <Link href="/terms" className="text-green-600 hover:text-green-700 underline">
                      Terms of Service
                    </Link>
                    <span>and</span>
                    <Link href="/privacy" className="text-green-600 hover:text-green-700 underline">
                      Privacy Policy
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits section */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 flex items-center justify-center mx-auto mb-2">
                <img
                  src="/logo.png"
                  alt="Batas Kota Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <h3 className="font-semibold text-sm text-gray-900">Professional</h3>
              <p className="text-xs text-gray-600 mt-1">Quality fields</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-sm text-gray-900">Community</h3>
              <p className="text-xs text-gray-600 mt-1">Connect with players</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-sm text-gray-900">Flexible</h3>
              <p className="text-xs text-gray-600 mt-1">Book anytime</p>
            </div>
          </div>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false)
          const redirectPath = getRedirectPath()
          router.push(redirectPath)
          router.refresh()
        }}
        title={getModalContent().title}
        message={getModalContent().message}
        buttonText={`${getModalContent().buttonText} (${countdown}s)`}
        showCountdown={true}
        countdown={countdown}
      />
    </>
  )
}
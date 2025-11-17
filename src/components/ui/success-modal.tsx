"use client"

import { useEffect } from "react"
import confetti from "canvas-confetti"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle2, Clock } from "lucide-react"

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  buttonText?: string
  buttonAction?: () => void
  showCountdown?: boolean
  countdown?: number
}

export default function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
  buttonText = "Great!",
  buttonAction,
  showCountdown = false,
  countdown = 0
}: SuccessModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Trigger confetti when modal opens
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval: NodeJS.Timeout = setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)

        // Left side burst
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#10b981', '#22c55e', '#16a34a', '#15803d', '#166534']
        })

        // Right side burst
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#10b981', '#22c55e', '#16a34a', '#15803d', '#166534']
        })
      }, 250)

      return () => clearInterval(interval)
    }
  }, [isOpen])

  const handleButtonClick = () => {
    if (buttonAction) {
      buttonAction()
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-green-900">
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-base">
            {message}
          </DialogDescription>
        </DialogHeader>

        {/* Countdown section */}
        {showCountdown && countdown > 0 && (
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
              <Clock className="w-4 h-4" />
              <span>Auto-redirecting in {countdown} seconds...</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${(countdown / 15) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="flex justify-center pt-4">
          <Button
            onClick={handleButtonClick}
            className="bg-green-600 hover:bg-green-700 text-white px-8"
          >
            {buttonText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
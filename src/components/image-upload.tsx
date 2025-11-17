"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface ImageUploadProps {
  onUpload: (url: string) => void
  placeholder?: string
  className?: string
  initialImage?: string
  accept?: string
  maxSize?: number
  disabled?: boolean
}

export default function ImageUpload({
  onUpload,
  placeholder = "Click to upload image",
  className = "",
  initialImage,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024,
  disabled = false
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState("")
  const [currentImage, setCurrentImage] = useState(initialImage || "")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size
    if (file.size > maxSize) {
      setError(`File size must be less than ${(maxSize / (1024 * 1024)).toFixed(1)}MB`)
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setError("")

    const formData = new FormData()
    formData.append("file", file)

    try {
      const xhr = new XMLHttpRequest()

      // Track upload progress
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(percentComplete)
        }
      })

      // Handle completion
      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          setCurrentImage(response.url)
          onUpload(response.url)
        } else {
          setError("Upload failed")
        }
        setIsUploading(false)
        setUploadProgress(0)
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      })

      // Handle errors
      xhr.addEventListener("error", () => {
        setError("Upload error")
        setIsUploading(false)
        setUploadProgress(0)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      })

      // Send request
      xhr.open("POST", "/api/upload")
      xhr.send(formData)
    } catch (error) {
      setError("Upload error")
      setIsUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoveImage = () => {
    setCurrentImage("")
    onUpload("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        id="image-upload"
        disabled={disabled}
      />

      <div className="space-y-4">
        <Label htmlFor="image-upload">{placeholder}</Label>

        {/* Image Preview */}
        {currentImage && (
          <div className="relative group">
            <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={currentImage}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveImage}
                  disabled={disabled}
                >
                  Remove Image
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Button */}
        {!currentImage && (
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="w-full h-24 border-2 border-dashed hover:border-solid transition-colors"
          >
            {isUploading ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="text-sm">Uploading {uploadProgress}%</span>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2 text-muted-foreground">
                <div className="text-2xl">📷</div>
                <span className="text-sm">Click to upload image</span>
                <span className="text-xs">Max {(maxSize / (1024 * 1024)).toFixed(1)}MB</span>
              </div>
            )}
          </Button>
        )}

        {/* Progress Bar */}
        {isUploading && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
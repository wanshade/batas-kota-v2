"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, Image as ImageIcon } from "lucide-react"

interface FilePreviewUploadProps {
  onUpload: (file: File) => Promise<void>
  placeholder?: string
  className?: string
  accept?: string
  maxSize?: number // in bytes
  disabled?: boolean
}

export default function FilePreviewUpload({
  onUpload,
  placeholder = "Click to upload image",
  className = "",
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB
  disabled = false
}: FilePreviewUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)

    // Check file size
    if (file.size > maxSize) {
      setError(`File size must be less than ${(maxSize / 1024 / 1024).toFixed(1)}MB`)
      return
    }

    // Check file type
    const allowedTypes = accept.split(',').map(type => type.trim())
    const isAllowed = allowedTypes.some(type => {
      if (type === 'image/*') return file.type.startsWith('image/')
      return file.type === type
    })

    if (!isAllowed) {
      setError(`Only ${allowedTypes.join(', ')} files are allowed`)
      return
    }

    setSelectedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setError(null)

    try {
      await onUpload(selectedFile)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setSelectedFile(null)
    setPreview(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {!selectedFile ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            disabled={disabled}
            className="hidden"
            id="file-upload"
          />
          <Label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center space-y-2"
          >
            <Upload className="h-8 w-8 text-gray-400" />
            <span className="text-sm text-gray-600">{placeholder}</span>
            <span className="text-xs text-gray-500">
              Max size: {(maxSize / 1024 / 1024).toFixed(1)}MB
            </span>
          </Label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <ImageIcon className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemove}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {preview && (
              <div className="mt-3">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-full h-auto rounded-lg border max-h-64 object-contain"
                />
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handleUpload}
              disabled={isUploading || disabled}
              className="flex-1"
            >
              {isUploading ? "Uploading..." : "Submit Payment Proof"}
            </Button>
            <Button
              variant="outline"
              onClick={handleRemove}
              disabled={isUploading}
            >
              Remove
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
          {error}
        </div>
      )}
    </div>
  )
}
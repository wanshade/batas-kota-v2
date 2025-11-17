"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Mail, Phone, MapPin, Clock, MessageSquare } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage("")

    try {
      // Here you would normally send this to your backend
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000))

      setSubmitMessage("Terima kasih atas pesan Anda! Kami akan menghubungi Anda dalam 24 jam.")
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      })
    } catch (error) {
    setSubmitMessage("Terjadi kesalahan. Silakan coba lagi nanti.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EFE9E3] to-[#E1D0B3]">
      <div className="container mx-auto px-4 py-16">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-orange-600 hover:text-orange-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Hubungi Kami</h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Punya pertanyaan tentang sistem booking? Ingin bekerjasama dengan kami?
            Kami senang mendengar dari Anda!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white/90 backdrop-blur-sm border-[#E1D0B3]/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#703B3B] flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-[#703B3B]" />
                  Kirim Pesan
                </CardTitle>
                <CardDescription className="text-gray-700">
                  Isi form di bawah ini dan kami akan segera merespon Anda
                </CardDescription>
              </CardHeader>
            <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700 font-medium">Nama Lengkap *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                        placeholder="Masukkan nama lengkap Anda"
                        className="border-[#E1D0B3]/30 focus:border-[#703B3B]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700 font-medium">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                        placeholder="email@example.com"
                        className="border-[#E1D0B3]/30 focus:border-[#703B3B]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-700 font-medium">Nomor Telepon</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+62 812-3456-7890"
                        className="border-[#E1D0B3]/30 focus:border-[#703B3B]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-gray-700 font-medium">Subjek *</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange("subject", e.target.value)}
                        required
                        placeholder="Pertanyaan Umum"
                        className="border-[#E1D0B3]/30 focus:border-[#703B3B]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-gray-700 font-medium">Pesan *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      required
                      rows={6}
                      placeholder="Ceritakan bagaimana kami bisa membantu Anda..."
                      className="border-[#E1D0B3]/30 focus:border-[#703B3B]"
                    />
                  </div>

                  {submitMessage && (
                    <div className={`p-4 rounded-lg ${
                      submitMessage.includes("Terima kasih")
                        ? "bg-green-50 text-green-800 border border-green-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}>
                      {submitMessage}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#703B3B] to-[#8B4F4F] hover:from-[#5a2f2f] hover:to-[#7A3F3F] text-white font-semibold py-3"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Mengirim..." : "Kirim Pesan"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Email Card */}
            <Card className="bg-white/90 backdrop-blur-sm border-[#E1D0B3]/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-[#703B3B]">
                  <div className="bg-[#703B3B]/10 p-2 rounded-lg">
                    <Mail className="h-5 w-5 text-[#703B3B]" />
                  </div>
                  Email Kami
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium text-gray-900 mb-1">Info Umum</p>
                  <a href="mailto:info@bataskota.com" className="text-[#703B3B] hover:text-[#5a2f2f] transition-colors">
                    info@bataskota.com
                  </a>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Dukungan</p>
                  <a href="mailto:support@bataskota.com" className="text-[#703B3B] hover:text-[#5a2f2f] transition-colors">
                    support@bataskota.com
                  </a>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Kerjasama</p>
                  <a href="mailto:partners@bataskota.com" className="text-[#703B3B] hover:text-[#5a2f2f] transition-colors">
                    partners@bataskota.com
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Phone Card */}
            <Card className="bg-white/90 backdrop-blur-sm border-[#E1D0B3]/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-[#703B3B]">
                  <div className="bg-[#703B3B]/10 p-2 rounded-lg">
                    <Phone className="h-5 w-5 text-[#703B3B]" />
                  </div>
                  Hubungi Kami
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium text-gray-900 mb-1">Customer Support</p>
                  <a href="tel:+622112345678" className="text-[#703B3B] hover:text-[#5a2f2f] transition-colors">
                    +62 21 1234 5678
                  </a>
                  <p className="text-sm text-gray-600">Sen-Jum: 08:00 - 20:00 WITA</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">WhatsApp</p>
                  <a href="https://wa.me/628123456789" className="text-[#703B3B] hover:text-[#5a2f2f] transition-colors">
                    +62 812-3456-7890
                  </a>
                  <p className="text-sm text-gray-600">24/7 untuk booking darurat</p>
                </div>
              </CardContent>
            </Card>

            {/* Location Card */}
            <Card className="bg-white/90 backdrop-blur-sm border-[#E1D0B3]/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-[#703B3B]">
                  <div className="bg-[#703B3B]/10 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-[#703B3B]" />
                  </div>
                  Lokasi Kami
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium text-gray-900 mb-2">Batas Kota - The Town Space</p>
                  <p className="text-gray-700">Jl. Soccer No. 123</p>
                  <p className="text-gray-700">Selong, Lombok Timur</p>
                  <p className="text-gray-700">NTB 83611, Indonesia</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-2">Jam Operasional</p>
                  <p className="text-sm text-gray-700 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#703B3B]" />
                    24 jam setiap hari
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Response Time Card */}
            <Card className="bg-gradient-to-br from-[#703B3B]/10 to-[#8B4F4F]/10 border-[#E1D0B3]/30 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-[#703B3B]">
                  <div className="bg-[#703B3B]/20 p-2 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-[#703B3B]" />
                  </div>
                  Waktu Respon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Email</span>
                    <span className="text-sm font-semibold text-[#703B3B]">Maks. 24 jam</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Telepon</span>
                    <span className="text-sm font-semibold text-[#703B3B]">Maks. 2 jam</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">WhatsApp</span>
                    <span className="text-sm font-semibold text-[#703B3B]">Langsung</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
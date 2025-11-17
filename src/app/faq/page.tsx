"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Search,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  CreditCard,
  MapPin,
  User,
  Settings,
  Handshake,
  Star,
  CheckCircle,
  MessageCircle,
  ArrowRight,
  Mail,
  Phone,
  Clock,
  Shield,
  Zap,
  Award,
  Filter,
  X
} from "lucide-react"

interface FAQ {
  question: string
  answer: string
  category: string
}

const faqs: FAQ[] = [
  // Booking Related
  {
    question: "How do I book a soccer field?",
    answer: "Simply browse our available fields, select your preferred date and time, choose your payment type (full or deposit), and confirm your booking. You'll receive instant confirmation and can upload payment proof if needed.",
    category: "Booking"
  },
  {
    question: "Can I cancel or modify my booking?",
    answer: "Yes, you can modify or cancel your booking up to 24 hours before your scheduled time. Changes made within 24 hours may be subject to a cancellation fee. You can manage your bookings from your dashboard.",
    category: "Booking"
  },
  {
    question: "What happens if my booking request is rejected?",
    answer: "If your booking is rejected, you'll receive a notification explaining the reason. If you've made a payment, you'll be eligible for a full refund. You can then try booking a different time slot.",
    category: "Booking"
  },
  {
    question: "How far in advance can I book a field?",
    answer: "You can book fields up to 30 days in advance. We recommend booking early, especially for peak hours and weekends, as popular time slots fill up quickly.",
    category: "Booking"
  },

  // Payment Related
  {
    question: "What payment methods do you accept?",
    answer: "We currently accept bank transfers for payments. You can choose between full payment or a 30% deposit option. The remaining balance for deposit bookings is paid on-site at the field.",
    category: "Payment"
  },
  {
    question: "How does the deposit payment work?",
    answer: "When you choose the deposit option, you pay 30% of the total amount upfront to reserve your slot. The remaining 70% is paid directly at the field before your game begins.",
    category: "Payment"
  },
  {
    question: "Is my payment information secure?",
    answer: "Yes, all payment information is handled securely. We use encrypted connections and never store sensitive payment details. All transactions are processed through secure banking channels.",
    category: "Payment"
  },
  {
    question: "Can I get a refund?",
    answer: "Refunds are available for bookings cancelled at least 24 hours in advance. Refund requests made within 24 hours may be subject to a cancellation fee. Refunds are typically processed within 5-7 business days.",
    category: "Payment"
  },

  // Field Related
  {
    question: "What facilities are included with field bookings?",
    answer: "All our partner fields include professional turf, basic lighting, changing rooms, and parking access. Some premium fields may offer additional facilities like spectator seating, water fountains, or equipment rentals.",
    category: "Fields"
  },
  {
    question: "Can I view field photos before booking?",
    answer: "Yes, all our fields have detailed photos and descriptions available on their listing pages. You can see field dimensions, turf type, lighting conditions, and available facilities.",
    category: "Fields"
  },
  {
    question: "Are there any additional fees I should know about?",
    answer: "The price you see is the price you pay. There are no hidden booking fees. However, some fields may charge additional fees for special equipment rental or extended hours beyond your booking time.",
    category: "Fields"
  },
  {
    question: "What if the field is not available when I arrive?",
    answer: "This rarely happens, but if a field becomes unavailable due to maintenance or other issues, we'll help you find an alternative field or provide a full refund. We'll notify you as soon as possible if any issues arise.",
    category: "Fields"
  },

  // Account Related
  {
    question: "How do I create an account?",
    answer: "Click on 'Get Started' or 'Register' in the navigation bar, fill in your name, email, and password. You'll receive a confirmation email, and then you can start booking fields immediately.",
    category: "Account"
  },
  {
    question: "Can I have multiple bookings at the same time?",
    answer: "Yes, you can have multiple active bookings, but they must be for different time slots to avoid conflicts. You can view all your bookings in your dashboard.",
    category: "Account"
  },
  {
    question: "How do I reset my password?",
    answer: "Click on 'Forgot Password' on the login page, enter your email address, and we'll send you a password reset link. Follow the instructions in the email to create a new password.",
    category: "Account"
  },
  {
    question: "Can I change my email address or personal information?",
    answer: "Yes, you can update your profile information from your dashboard settings. Email changes require verification to ensure account security.",
    category: "Account"
  },

  // Technical Related
  {
    question: "Is there a mobile app available?",
    answer: "Currently, our platform is web-based and fully optimized for mobile browsers. You can access all features on your smartphone or tablet. We're working on native mobile apps for iOS and Android.",
    category: "Technical"
  },
  {
    question: "What browsers are supported?",
    answer: "Our platform works on all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated for the best experience.",
    category: "Technical"
  },
  {
    question: "How do I report a technical issue?",
    answer: "If you encounter any technical problems, please contact our support team at support@soccerfieldbooking.com or use the contact form. Include details about the issue and screenshots if possible.",
    category: "Technical"
  },

  // Partnerships
  {
    question: "How can I list my field on your platform?",
    answer: "If you own or manage a soccer field and want to partner with us, please email partners@soccerfieldbooking.com. We'll review your facility and discuss partnership terms.",
    category: "Partnerships"
  },
  {
    question: "What are the requirements for field partners?",
    answer: "Field partners must have proper insurance, well-maintained facilities, professional turf or grass surfaces, and meet our quality standards. We also require availability for regular bookings and good customer reviews.",
    category: "Partnerships"
  }
]

const categories = [
  { name: "All", icon: <HelpCircle className="h-4 w-4" />, color: "emerald" },
  { name: "Booking", icon: <Calendar className="h-4 w-4" />, color: "blue" },
  { name: "Payment", icon: <CreditCard className="h-4 w-4" />, color: "green" },
  { name: "Fields", icon: <MapPin className="h-4 w-4" />, color: "purple" },
  { name: "Account", icon: <User className="h-4 w-4" />, color: "orange" },
  { name: "Technical", icon: <Settings className="h-4 w-4" />, color: "red" },
  { name: "Partnerships", icon: <Handshake className="h-4 w-4" />, color: "indigo" }
]

const categoryColors: Record<string, string> = {
  "All": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Booking": "bg-blue-100 text-blue-700 border-blue-200",
  "Payment": "bg-green-100 text-green-700 border-green-200",
  "Fields": "bg-purple-100 text-purple-700 border-purple-200",
  "Account": "bg-orange-100 text-orange-700 border-orange-200",
  "Technical": "bg-red-100 text-red-700 border-red-200",
  "Partnerships": "bg-indigo-100 text-indigo-700 border-indigo-200"
}

const categoryGradients: Record<string, string> = {
  "All": "from-emerald-500 to-green-600",
  "Booking": "from-blue-500 to-blue-600",
  "Payment": "from-green-500 to-green-600",
  "Fields": "from-purple-500 to-purple-600",
  "Account": "from-orange-500 to-orange-600",
  "Technical": "from-red-500 to-red-600",
  "Partnerships": "from-indigo-500 to-indigo-600"
}

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (question: string) => {
    setExpandedItems(prev =>
      prev.includes(question)
        ? prev.filter(item => item !== question)
        : [...prev, question]
    )
  }

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("All")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
      {/* Hero Header Section */}
      <section className="pt-24 pb-16 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-200 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-200 rounded-full blur-3xl opacity-20"></div>

        <div className="container mx-auto px-6 relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Icon badge */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl mb-6 shadow-lg">
              <HelpCircle className="h-8 w-8 text-white" />
            </div>

            {/* Main headline */}
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Frequently Asked
              <span className="text-emerald-600"> Questions</span>
            </h1>

            {/* Enhanced subtitle */}
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
              Find answers to common questions about booking soccer fields, payments, and using our platform.
              Can't find what you're looking for? Our support team is here to help.
            </p>

            {/* Quick stats */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="text-sm text-gray-600 font-medium">24/7 Support</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-emerald-600" />
                <span className="text-sm text-gray-600 font-medium">Quick Responses</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-emerald-600" />
                <span className="text-sm text-gray-600 font-medium">Verified Answers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Search bar with enhanced styling */}
            <div className="relative mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search for answers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500 bg-white shadow-sm transition-all duration-200"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {searchTerm && (
                <p className="mt-2 text-sm text-gray-600">
                  Found {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''} for "{searchTerm}"
                </p>
              )}
            </div>

            {/* Category filter as pills */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-gray-700 flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filter by category:
              </span>
              {categories.map(category => (
                <Button
                  key={category.name}
                  variant={selectedCategory === category.name ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`px-4 py-2 rounded-full transition-all duration-200 ${
                    selectedCategory === category.name
                      ? `bg-gradient-to-r ${categoryGradients[category.name]} text-white border-0 shadow-md hover:shadow-lg transform hover:scale-105`
                      : "border-gray-200 text-gray-700 hover:border-emerald-300 hover:bg-emerald-50"
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Items Section */}
      <section className="pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No FAQs found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
                <Button
                  onClick={clearFilters}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFAQs.map((faq, index) => (
                  <Card
                    key={index}
                    className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <CardHeader
                      className="cursor-pointer hover:bg-gray-50 transition-colors pb-4"
                      onClick={() => toggleExpanded(faq.question)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-4">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[faq.category]}`}>
                              {faq.category}
                            </span>
                          </div>
                          <CardTitle className="text-lg text-left text-gray-900 group-hover:text-emerald-700 transition-colors">
                            {faq.question}
                          </CardTitle>
                        </div>
                        <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                          {expandedItems.includes(faq.question) ? (
                            <ChevronUp className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-emerald-600" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    {expandedItems.includes(faq.question) && (
                      <CardContent className="pt-0">
                        <div className="pl-2">
                          <CardDescription className="text-gray-700 leading-relaxed text-base">
                            {faq.answer}
                          </CardDescription>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Support Section - Enhanced */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 to-green-600 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="p-12">
                <div className="text-center">
                  {/* Icon badge */}
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl mb-6 shadow-lg">
                    <MessageCircle className="h-8 w-8 text-white" />
                  </div>

                  {/* Main headline */}
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Still have questions?
                  </h2>

                  {/* Enhanced subtitle */}
                  <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                    Can't find the answer you're looking for? Our dedicated support team is here to help you 24/7.
                  </p>

                  {/* Contact buttons with enhanced styling */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-4 text-lg font-semibold h-14 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Contact Support
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-8 py-4 text-lg font-semibold h-14"
                    >
                      <Mail className="mr-2 h-5 w-5" />
                      Email Us
                    </Button>
                  </div>

                  {/* Contact information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    <div className="flex items-center justify-center space-x-3 p-4 bg-emerald-50 rounded-xl">
                      <Mail className="h-5 w-5 text-emerald-600" />
                      <span className="text-sm font-medium text-gray-700">support@bataskota.com</span>
                    </div>
                    <div className="flex items-center justify-center space-x-3 p-4 bg-emerald-50 rounded-xl">
                      <Phone className="h-5 w-5 text-emerald-600" />
                      <span className="text-sm font-medium text-gray-700">+62 21 5555 1234</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

  
      {/* Quick Tips Section - Enhanced */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl mb-4">
                <Award className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Pro Tips for Better Booking
              </h2>
              <p className="text-lg text-gray-600">
                Expert advice to enhance your field booking experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: <Calendar className="h-5 w-5" />,
                  title: "Book Early",
                  description: "Popular time slots fill up quickly, especially on weekends. Book at least 3 days in advance for better availability.",
                  color: "blue"
                },
                {
                  icon: <MapPin className="h-5 w-5" />,
                  title: "Check Field Details",
                  description: "Review field photos, dimensions, and facilities before booking to ensure it meets your needs.",
                  color: "purple"
                },
                {
                  icon: <CreditCard className="h-5 w-5" />,
                  title: "Save Payment Proof",
                  description: "Keep payment receipts and confirmation emails for easy verification and future reference.",
                  color: "green"
                },
                {
                  icon: <Clock className="h-5 w-5" />,
                  title: "Arrive Early",
                  description: "Arrive 15-20 minutes before your booking time for check-in and field preparation.",
                  color: "orange"
                }
              ].map((tip, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-emerald-200 group"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r ${categoryGradients[tip.color]} text-white group-hover:scale-110 transition-transform duration-200 flex-shrink-0`}>
                      {tip.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">
                        {tip.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {tip.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
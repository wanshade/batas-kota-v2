import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Main Grid Layout */}
        <div
          className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-12"
          suppressHydrationWarning={true}
        >
          {/* Brand Section - Span 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-3">
              <img
                src="/logo.png"
                alt="Batas Kota Logo"
                className="h-12 w-auto object-contain"
              />
              <div>
                <span className="text-2xl font-bold text-white">
                  Batas Kota
                </span>
                <p className="text-xs text-gray-400">The Town Space</p>
              </div>
            </div>

            <p className="text-gray-300 leading-relaxed max-w-sm">
              Main bola sekarang nggak ribet lagi! Tinggal booking, datang, dan
              gaskeun.Dan yang bikin makin seru… Ada café-nya! Ngopi sebelum
              main, ngemil setelah tanding, atau nongkrong sambil nunggu teman —
              semuanya nyaman, semuanya fresh.
            </p>

            {/* Social Media Links with Enhanced Design */}
            <div className="flex space-x-3">
              <a
                href="#"
                className="group relative h-10 w-10 rounded-lg bg-white/10 hover:bg-emerald-600/30 transition-all duration-300 flex items-center justify-center border border-white/20 hover:border-emerald-500/50"
                aria-label="Facebook"
              >
                <svg
                  className="h-5 w-5 text-gray-300 group-hover:text-white transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.129 22 16.99 22 12z" />
                </svg>
              </a>
              <a
                href="#"
                className="group relative h-10 w-10 rounded-lg bg-white/10 hover:bg-[#E1D0B3]/30 transition-all duration-300 flex items-center justify-center border border-white/20 hover:border-[#E1D0B3]/50"
                aria-label="Twitter"
              >
                <svg
                  className="h-5 w-5 text-gray-300 group-hover:text-white transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a
                href="#"
                className="group relative h-10 w-10 rounded-lg bg-white/10 hover:bg-[#E1D0B3]/30 transition-all duration-300 flex items-center justify-center border border-white/20 hover:border-[#E1D0B3]/50"
                aria-label="Instagram"
              >
                <svg
                  className="h-5 w-5 text-gray-300 group-hover:text-white transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.468c2.456 0 2.784-.011 3.807-.058.975-.045 1.504-.207 1.857-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.468c0-2.456-.011-2.784-.058-3.807-.045-.975-.207-1.504-.344-1.857a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 110 6.666 3.333 3.333 0 010-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation Columns with Enhanced Design */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-1 w-6 bg-[#E1D0B3] rounded"></div>
              <h3 className="text-lg font-semibold text-white">Navigation</h3>
            </div>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/fields"
                  className="flex items-center group text-gray-300 hover:text-[#E1D0B3] transition-all duration-200"
                >
                  <svg
                    className="h-4 w-4 mr-2 text-gray-500 group-hover:text-[#E1D0B3] transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Browse Fields
                </Link>
              </li>
                <li>
                <Link
                  href="/contact"
                  className="flex items-center group text-gray-300 hover:text-[#E1D0B3] transition-all duration-200"
                >
                  <svg
                    className="h-4 w-4 mr-2 text-gray-500 group-hover:text-[#E1D0B3] transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/cafe"
                  className="flex items-center group text-gray-300 hover:text-[#E1D0B3] transition-all duration-200"
                >
                  <svg
                    className="h-4 w-4 mr-2 text-gray-500 group-hover:text-[#E1D0B3] transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h18v18H3zM12 8v4m0 4h.01"
                    />
                  </svg>
                  Cafe
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section with Enhanced Design */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-1 w-6 bg-[#E1D0B3] rounded"></div>
              <h3 className="text-lg font-semibold text-white">Contact Info</h3>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#E1D0B3]/20 flex items-center justify-center">
                  <svg
                    className="h-5 w-5 text-[#E1D0B3]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white">info@bataskota.com</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#E1D0B3]/20 flex items-center justify-center">
                  <svg
                    className="h-5 w-5 text-[#E1D0B3]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Phone</p>
                  <p className="text-white">+62 21 1234 5678</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#E1D0B3]/20 flex items-center justify-center">
                  <svg
                    className="h-5 w-5 text-[#E1D0B3]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Address</p>
                  <p className="text-white">Jl. Soccer No. 123, Jakarta</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Enhanced Bottom Section with Made with Love */}
        <div className="relative">
          {/* Gradient border */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#E1D0B3]/30 to-transparent h-px"></div>

          <div className="flex flex-col lg:flex-row justify-between items-center pt-8 pb-6 space-y-4 lg:space-y-0">
            {/* Copyright and Made with Love */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <p className="text-sm text-gray-400">
                © 2024 Batas Kota. All rights reserved.
              </p>
              <div className="flex items-center space-x-2 text-sm text-[#E1D0B3]">
                <span>Made with</span>
                <span className="text-red-500 animate-pulse">❤️</span>
                <span>for soccer lovers</span>
              </div>
            </div>

            {/* Legal Links */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <Link
                href="/privacy"
                className="text-sm text-gray-400 hover:text-[#E1D0B3] transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-gray-400 hover:text-[#E1D0B3] transition-colors duration-200"
              >
                Terms of Service
              </Link>
              <Link
                href="/cancellation"
                className="text-sm text-gray-400 hover:text-[#E1D0B3] transition-colors duration-200"
              >
                Cancellation Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

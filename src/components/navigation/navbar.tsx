"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header
      className="w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60"
      suppressHydrationWarning={true}
    >
      <div className="container mx-auto px-4" suppressHydrationWarning={true}>
        <div
          className="flex h-16 items-center justify-between"
          suppressHydrationWarning={true}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img
              src="/logo.png"
              alt="Batas Kota Logo"
              className="h-8 w-auto object-contain"
            />
            <span className="text-xl font-bold">Batas Kota</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {!session && (
              <Link
                href="/"
                className="px-3 py-2 text-gray-700 hover:text-[#703B3B] hover:bg-[#E1D0B3] hover:bg-opacity-20 rounded-md transition-all duration-200 font-medium"
              >
                Halaman Utama
              </Link>
            )}
            <Link
              href="/fields"
              className="px-3 py-2 text-gray-700 hover:text-[#703B3B] hover:bg-[#E1D0B3] hover:bg-opacity-20 rounded-md transition-all duration-200 font-medium"
            >
              Jadwal
            </Link>
            <Link
              href="/contact"
              className="px-3 py-2 text-gray-700 hover:text-[#703B3B] hover:bg-[#E1D0B3] hover:bg-opacity-20 rounded-md transition-all duration-200 font-medium"
            >
              Kontak
            </Link>
            <Link
              href="/cafe"
              className="px-3 py-2 text-gray-700 hover:text-[#703B3B] hover:bg-[#E1D0B3] hover:bg-opacity-20 rounded-md transition-all duration-200 font-medium"
            >
              Cafe
            </Link>
            {session?.user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="px-3 py-2 text-gray-700 hover:text-[#703B3B] hover:bg-[#E1D0B3] hover:bg-opacity-30 rounded-md transition-all duration-200 font-semibold text-[#703B3B]"
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={session.user.image || ""}
                        alt={session.user.name || ""}
                      />
                      <AvatarFallback>
                        {session.user.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {session.user.name && (
                        <p className="font-medium">{session.user.name}</p>
                      )}
                      {session.user.email && (
                        <p className="w-[200px] truncate text-sm text-gray-600">
                          {session.user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href={
                        session?.user?.role === "ADMIN"
                          ? "/admin"
                          : "/dashboard"
                      }
                    >
                      {session?.user?.role === "ADMIN"
                        ? "Admin Dashboard"
                        : "Dashboard"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost">Masuk</Button>
                </Link>
                <Link href="/register">
                  <Button>Buat Akun</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden" suppressHydrationWarning={true}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col space-y-2">
              {!session && (
                <Link
                  href="/"
                  className="px-4 py-3 text-gray-700 hover:text-[#703B3B] hover:bg-[#E1D0B3] hover:bg-opacity-20 rounded-lg transition-all duration-200 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Halaman Utama
                </Link>
              )}
              <Link
                href="/fields"
                className="px-4 py-3 text-gray-700 hover:text-[#703B3B] hover:bg-[#E1D0B3] hover:bg-opacity-20 rounded-lg transition-all duration-200 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Jadwal
              </Link>
              <Link
                href="/contact"
                className="px-4 py-3 text-gray-700 hover:text-[#703B3B] hover:bg-[#E1D0B3] hover:bg-opacity-20 rounded-lg transition-all duration-200 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Kontak
              </Link>
              <Link
                href="/cafe"
                className="px-4 py-3 text-gray-700 hover:text-[#703B3B] hover:bg-[#E1D0B3] hover:bg-opacity-20 rounded-lg transition-all duration-200 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Cafe
              </Link>
              {session?.user?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="px-4 py-3 text-gray-700 hover:text-[#703B3B] hover:bg-[#E1D0B3] hover:bg-opacity-30 rounded-lg transition-all duration-200 font-semibold text-[#703B3B]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
              {session && (
                <Link
                  href={
                    session?.user?.role === "ADMIN" ? "/admin" : "/dashboard"
                  }
                  className="px-4 py-3 text-gray-700 hover:text-[#703B3B] hover:bg-[#E1D0B3] hover:bg-opacity-20 rounded-lg transition-all duration-200 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {session?.user?.role === "ADMIN"
                    ? "Admin Dashboard"
                    : "Dashboard"}
                </Link>
              )}
            </nav>

            {/* Mobile User Actions */}
            <div className="mt-4 pt-4 border-t">
              {session ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={session.user.image || ""}
                        alt={session.user.name || ""}
                      />
                      <AvatarFallback>
                        {session.user.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{session.user.name}</p>
                      <p className="text-sm text-gray-600">
                        {session.user.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    Sign out
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

"use client";

import React, { useState } from "react";
import { useTheme } from "next-themes";
import {
  Moon,
  Sun,
  Menu,
  X,
  ChevronDown,
  Github,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDocument, setShowDocument] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2">
            <Image
              src="/logo7.png"
              alt="Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Cache Scalable
            </h1>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="#" className="nav-link">Home</Link>

            {/* Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setShowDocument(true)}
              onMouseLeave={() => setShowDocument(false)}
            >
              <button className="nav-link flex items-center gap-1">
                Documentation <ChevronDown className="w-4 h-4" />
              </button>
              {showDocument && (
              <div className="absolute left-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded shadow-lg z-20">
                <Link href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition">Proposal</Link>
                <Link href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition">Report</Link>
              </div>
            )}
            </div>

            <Link href="#" className="nav-link">Contact</Link>

            {/* GitHub Button */}
            <Link
              href="#"
              aria-label="GitHub"
              className="text-muted-foreground hover:text-primary transition"
            >
              <Github className="h-5 w-5" />
            </Link>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="relative hover:scale-110 transition"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMenu}
                className="transition hover:scale-105"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                <span className="sr-only">Toggle main menu</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="md:hidden mt-4 border-t border-border/40 pt-4 space-y-2">
            <Link href="#" className="mobile-link">Home</Link>

            {/* Dropdown for Mobile */}
            <details className="group">
              <summary className="mobile-link cursor-pointer flex items-center justify-between">
                <span>Documentation</span>
                <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="ml-4 mt-1 space-y-1">
                <Link href="#" className="mobile-sub-link">Proposal</Link>
                <Link href="#" className="mobile-sub-link">Report</Link>
              </div>
            </details>

            <Link href="#" className="mobile-link">Contact</Link>
            <Link href="#" className="mobile-link flex items-center gap-2">
              <Github className="h-5 w-5" /> GitHub
            </Link>
          </div>
        )}
      </div>

      {/* Styles for Nav links */}
      <style jsx>{`
        .nav-link {
          @apply text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition;
        }
        .dropdown-item {
          @apply block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-foreground transition;
        }
        .mobile-link {
          @apply block px-4 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-primary transition;
        }
        .mobile-sub-link {
          @apply block px-4 py-1 pl-4 rounded-md text-sm text-muted-foreground hover:text-primary transition;
        }
      `}</style>
    </nav>
  );
}

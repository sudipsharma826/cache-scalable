import React from 'react'
import { Heart, Github, Twitter, Linkedin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          <div className="mt-12 pt-8 border-t border-border/40">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
              </div>
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()}   Sudip Sharma.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

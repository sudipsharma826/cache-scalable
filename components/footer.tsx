import React from 'react';
import { Heart, Github, Twitter, Linkedin, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-background dark:bg-gray-950 border-t border-border/40 text-foreground dark:text-gray-100 transition-colors py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          <div className="mt-12 pt-8 border-t border-border/40">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              {/* Social Icons */}
              <div className="flex items-center space-x-4">
                <a
                  href="https://github.com/sudipsharma826"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                  aria-label="GitHub"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href="https://linkedin.com/in/sudipsharmanp"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                  aria-label="LinkedIn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="https://www.facebook.com/sudipsharma.np/"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                  aria-label="Facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              </div>

              {/* Copyright */}
              <p className="text-sm text-muted-foreground text-center md:text-right">
                © {new Date().getFullYear()}{" "}
                <a
                  href="https://sudipsharma.info.np"
                  className="underline hover:text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Sudip Sharma
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

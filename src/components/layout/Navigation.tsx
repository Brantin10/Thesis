"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed left-0 top-0 z-50 w-full border-b border-accent/8 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-primary transition-colors hover:text-accent"
        >
          LearningPath<span className="text-accent">AI</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-sm text-secondary transition-colors hover:text-primary"
          >
            Home
          </Link>
          <Link
            href="/thesis"
            className="text-sm text-secondary transition-colors hover:text-primary"
          >
            Read Thesis
          </Link>
          <Link
            href="/thesis"
            className="rounded-full border border-accent/30 bg-accent/5 px-4 py-1.5 text-sm font-medium text-accent transition-all hover:border-accent hover:bg-accent/10"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex flex-col gap-1.5 md:hidden"
          aria-label="Toggle menu"
        >
          <span
            className={clsx(
              "h-[1px] w-6 bg-primary transition-all duration-300",
              menuOpen && "translate-y-[7px] rotate-45"
            )}
          />
          <span
            className={clsx(
              "h-[1px] w-6 bg-primary transition-all duration-300",
              menuOpen && "opacity-0"
            )}
          />
          <span
            className={clsx(
              "h-[1px] w-6 bg-primary transition-all duration-300",
              menuOpen && "-translate-y-[7px] -rotate-45"
            )}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-b border-accent/10 bg-background/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-4 px-6 py-6">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="text-lg text-secondary transition-colors hover:text-primary"
              >
                Home
              </Link>
              <Link
                href="/thesis"
                onClick={() => setMenuOpen(false)}
                className="text-lg text-secondary transition-colors hover:text-primary"
              >
                Read Thesis
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

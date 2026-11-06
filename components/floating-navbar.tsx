"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Sparkles,
  ArrowRight,
  User,
  LogIn,
  LogOut,
  ChevronDown,
  Terminal,
  ShieldCheck,
  PlusCircle,
  Award,
} from "lucide-react";
import { AuthModal } from "@/components/auth-modal";
import { getActiveUser, onAuthChange, signOutUser, ActiveSessionUser } from "@/lib/auth";

interface FloatingNavbarProps {
  onOpenSearch: () => void;
}

export function FloatingNavbar({ onOpenSearch }: FloatingNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<"magic_link" | "password" | "oauth" | "sandbox">("magic_link");
  const [user, setUser] = useState<ActiveSessionUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Subscribe to real-time auth and persona changes
  useEffect(() => {
    getActiveUser().then(setUser);
    const unsubscribe = onAuthChange((updatedUser) => {
      setUser(updatedUser);
    });
    return () => unsubscribe();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOutUser();
    setUser(null);
  };

  const handleOpenSandboxSwitcher = () => {
    setMenuOpen(false);
    setAuthInitialTab("sandbox");
    setAuthModalOpen(true);
  };

  return (
    <>
      <header className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 pointer-events-none">
        <nav
          aria-label="Dynamic Island Navigation"
          className={`pointer-events-auto w-full h-12 px-3.5 rounded-full bg-[#111113] text-white border border-white/[0.12] flex items-center justify-between transition-all duration-300 ${
            scrolled
              ? "shadow-[0_16px_40px_-10px_rgba(0,0,0,0.45)] backdrop-blur-2xl bg-[#111113]/95"
              : "shadow-[0_12px_32px_-8px_rgba(0,0,0,0.3)] backdrop-blur-xl"
          }`}
        >
          {/* Logo & Monogram */}
          <Link
            href="/"
            className="flex items-center gap-2 group shrink-0 pl-1"
            aria-label="IdeaToX Homepage"
          >
            <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center border border-white/20 group-hover:scale-105 transition-transform">
              <span className="font-mono text-xs font-bold text-amber-300">&gt;</span>
            </div>
            <span className="font-sans font-semibold text-sm tracking-tight text-white">
              IdeaTo<span className="text-amber-300">X</span>
            </span>
          </Link>

          {/* Quick Links */}
          <div className="hidden sm:flex items-center gap-1 text-[13px] text-zinc-300 font-medium">
            <Link
              href="/ideas"
              className="px-2.5 py-1 rounded-full hover:text-white hover:bg-white/[0.08] transition-colors flex items-center gap-1"
            >
              <span>Explore</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300">
                50+
              </span>
            </Link>
            <Link
              href="/about"
              className="px-2.5 py-1 rounded-full hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              About
            </Link>
            <Link
              href="/#studio"
              className="px-2.5 py-1 rounded-full hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              Studio
            </Link>
            <Link
              href="/#sandbox"
              className="px-2.5 py-1 rounded-full hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              Sandbox
            </Link>
          </div>

          {/* Search Trigger, Auth & Primary Action */}
          <div className="flex items-center gap-1.5 shrink-0 relative" ref={menuRef}>
            <button
              onClick={onOpenSearch}
              type="button"
              className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Search specs (⌘K)"
              aria-label="Search specifications"
            >
              <Search size={14} />
            </button>

            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="flex items-center gap-1 pl-1 pr-1.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer border border-white/10"
                  title={`Logged in as @${user.username}`}
                  aria-label="Open User HUD"
                >
                  <div className="w-5 h-5 rounded-full bg-[#0D0E12] overflow-hidden flex items-center justify-center font-bold text-[10px] text-white">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      <span>{user.username.slice(0, 1).toUpperCase()}</span>
                    )}
                  </div>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      user.is_sandbox ? "bg-amber-400" : "bg-emerald-400"
                    }`}
                  />
                  <ChevronDown size={11} className={`text-zinc-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
                </button>

                {/* USER HUD DROPDOWN */}
                {menuOpen && (
                  <div className="pointer-events-auto absolute right-0 top-10 w-64 rounded-2xl bg-[#0D0E12] text-white border border-white/[0.14] shadow-2xl p-3 space-y-2 animate-scaleUp z-50">
                    {/* User Info Header */}
                    <div className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.06] flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-white/10 overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs text-amber-300">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                          <span>{user.username.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-sans font-bold text-xs truncate">
                            {user.full_name || user.username}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 font-semibold shrink-0">
                            {user.reputation_score || 350} rep
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] text-zinc-400 truncate">
                            @{user.username}
                          </span>
                          <span className="text-[9px] font-mono uppercase px-1 rounded bg-white/10 text-zinc-300">
                            {user.is_sandbox ? "Sandbox" : "Supabase"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Actions */}
                    <div className="space-y-0.5 pt-1 text-xs font-sans">
                      <Link
                        href={`/profile/${user.username}`}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-white/[0.08] text-zinc-300 hover:text-white transition-colors"
                      >
                        <User size={13} className="text-amber-300" />
                        <span>My Telemetry Profile</span>
                      </Link>

                      <Link
                        href="/ideas/new"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-white/[0.08] text-zinc-300 hover:text-white transition-colors"
                      >
                        <PlusCircle size={13} className="text-zinc-400" />
                        <span>Draft Specification</span>
                      </Link>

                      <button
                        type="button"
                        onClick={handleOpenSandboxSwitcher}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-white/[0.08] text-zinc-300 hover:text-white transition-colors text-left cursor-pointer"
                      >
                        <Terminal size={13} className="text-zinc-400" />
                        <span>Switch Persona</span>
                      </button>
                    </div>

                    {/* Divider & Sign Out */}
                    <div className="pt-1 border-t border-white/[0.08]">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 text-xs font-sans transition-colors text-left cursor-pointer"
                      >
                        <LogOut size={13} />
                        <span>Sign Out of Passport</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthInitialTab("magic_link");
                  setAuthModalOpen(true);
                }}
                className="h-7 px-2 rounded-full flex items-center gap-1.5 text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer text-xs font-mono font-medium"
                title="Developer Sign In"
                aria-label="Developer Sign In"
              >
                <LogIn size={13} className="text-amber-300" />
                <span className="hidden sm:inline">Passport</span>
              </button>
            )}

            <Link
              href="/ideas/new"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-white text-[#111113] text-xs font-semibold hover:bg-amber-200 transition-colors shadow-sm group"
            >
              <span>Ideate</span>
              <ArrowRight
                size={12}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </nav>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authInitialTab}
      />
    </>
  );
}

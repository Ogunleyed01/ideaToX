"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ArrowRight, User, LogIn, Bell, Settings } from "lucide-react";
import { AuthModal } from "@/components/auth-modal";
import { NotificationDrawer } from "@/components/notification-drawer";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  resetNotifications,
  subscribeNotifications,
} from "@/lib/ideas";
import { IdeaNotification } from "@/types/idea";

interface FloatingNavbarProps {
  onOpenSearch: () => void;
}

export function FloatingNavbar({ onOpenSearch }: FloatingNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [notifications, setNotifications] = useState<IdeaNotification[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setNotifications(getNotifications());
    return subscribeNotifications(() => {
      setNotifications(getNotifications());
    });
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
          if (data?.user) setUser(data.user);
        });

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
      } catch {
        // ignore in local offline mode
      }
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <header className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 pointer-events-none">
        <nav
          aria-label="Dynamic Island Navigation"
          className={`pointer-events-auto w-full h-12 px-3.5 rounded-full bg-[#111113] text-white border border-white/[0.12] flex items-center justify-between gap-2 transition-all duration-300 ${
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
          <div className="hidden sm:flex items-center gap-0.5 text-[13px] text-zinc-300 font-medium">
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

          {/* Search, Builder Inbox, Settings, Auth & Primary Action */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onOpenSearch}
              type="button"
              className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Search specs (⌘K)"
              aria-label="Search specifications"
            >
              <Search size={14} />
            </button>

            <button
              onClick={() => setInboxOpen(true)}
              type="button"
              className="relative w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Builder Inbox Notifications"
              aria-label="Open Builder Inbox Notifications"
            >
              <Bell size={14} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-1 rounded-full bg-amber-400 text-[#0D0E12] font-mono text-[9px] font-bold flex items-center justify-center leading-none shadow-sm">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <Link
              href="/settings"
              className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Developer Profile Settings"
              aria-label="Developer Profile Settings"
            >
              <Settings size={14} />
            </Link>

            {user ? (
              <Link
                href="/profile"
                className="w-7 h-7 rounded-full flex items-center justify-center text-amber-300 bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                title="My Profile"
                aria-label="My Profile"
              >
                <User size={14} />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Developer Sign In"
                aria-label="Developer Sign In"
              >
                <LogIn size={14} />
              </button>
            )}

            <Link
              href="/ideas/new"
              className="inline-flex items-center gap-1.5 h-8 px-3 ml-0.5 rounded-full bg-white text-[#111113] text-xs font-semibold hover:bg-amber-200 transition-colors shadow-sm group"
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

      {/* Builder Inbox Notification Drawer */}
      <NotificationDrawer
        isOpen={inboxOpen}
        onClose={() => setInboxOpen(false)}
        notifications={notifications}
        onMarkRead={(id) => setNotifications(markNotificationRead(id))}
        onMarkAllRead={() => setNotifications(markAllNotificationsRead())}
        onResetDemo={() => setNotifications(resetNotifications())}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
}

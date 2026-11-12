"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ArrowRight, User, LogIn, LogOut, Bell, Settings } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { NotificationDrawer } from "@/components/notification-drawer";
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
  const { user, profile, isAuthenticated, isConfigured, openAuthModal, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [notifications, setNotifications] = useState<IdeaNotification[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) setNotifications(getNotifications());
    });
    const unsub = subscribeNotifications(() => {
      if (active) setNotifications(getNotifications());
    });
    return () => {
      active = false;
      unsub();
    };
  }, [user?.id]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayHandle =
    profile?.username ||
    (user?.email ? user.email.split("@")[0] : null) ||
    "builder";
  const initialChar = displayHandle.charAt(0).toUpperCase();

  return (
    <>
      <header className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 pointer-events-none">
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
              onClick={() => {
                if (isConfigured && !isAuthenticated) {
                  openAuthModal({
                    mode: "signin",
                    reason: "Sign in to view your Builder Inbox notifications.",
                  });
                  return;
                }
                setInboxOpen(true);
              }}
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

            {(isAuthenticated || !isConfigured) && (
              <Link
                href="/settings"
                className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Developer Profile Settings"
                aria-label="Developer Profile Settings"
              >
                <Settings size={14} />
              </Link>
            )}

            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  className="h-7 px-2 rounded-full flex items-center gap-1.5 text-amber-200 bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                  title={`Signed in as @${displayHandle}`}
                  aria-label="My Profile"
                >
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={displayHandle}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 font-mono text-[10px] font-bold flex items-center justify-center">
                      {initialChar}
                    </span>
                  )}
                  <span className="hidden md:inline font-mono text-[11px] max-w-[84px] truncate">
                    @{displayHandle}
                  </span>
                  <User size={12} className="md:hidden" />
                </Link>

                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut size={13} />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal({ mode: "signin" })}
                className="h-7 px-2.5 rounded-full flex items-center gap-1.5 text-zinc-200 bg-white/[0.08] hover:bg-white/[0.16] border border-white/10 transition-colors cursor-pointer text-[12px] font-medium"
                title="Developer Sign In"
                aria-label="Developer Sign In"
              >
                <LogIn size={12} />
                <span>Sign In</span>
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
    </>
  );
}


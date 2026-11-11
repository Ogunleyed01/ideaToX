"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  X,
  Bell,
  GitPullRequest,
  Users,
  GitFork,
  Rocket,
  MessageSquare,
  Star,
  CheckCheck,
  ArrowUpRight,
  Settings,
  RotateCcw,
  Inbox,
} from "lucide-react";
import { IdeaNotification, NotificationType } from "@/types/idea";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: IdeaNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onResetDemo?: () => void;
}

type InboxFilter = "all" | "unread" | "prs_collabs" | "stars_forks";

const TYPE_META: Record<
  NotificationType,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badgeClass: string;
    iconBgClass: string;
  }
> = {
  pr: {
    label: "Feature PR",
    icon: GitPullRequest,
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    iconBgClass: "bg-amber-500/15 text-amber-700 border-amber-300/60",
  },
  collab: {
    label: "Co-Builder Pitch",
    icon: Users,
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    iconBgClass: "bg-emerald-500/15 text-emerald-700 border-emerald-300/60",
  },
  fork: {
    label: "Lineage Fork",
    icon: GitFork,
    badgeClass: "bg-indigo-50 text-indigo-800 border-indigo-200",
    iconBgClass: "bg-indigo-500/15 text-indigo-700 border-indigo-300/60",
  },
  build: {
    label: "Shipped Build",
    icon: Rocket,
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    iconBgClass: "bg-emerald-500/15 text-emerald-700 border-emerald-300/60",
  },
  comment: {
    label: "Thread Reply",
    icon: MessageSquare,
    badgeClass: "bg-zinc-100 text-zinc-700 border-zinc-200",
    iconBgClass: "bg-zinc-200/70 text-zinc-700 border-zinc-300/70",
  },
  star: {
    label: "Blueprint Star",
    icon: Star,
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    iconBgClass: "bg-amber-400/15 text-amber-700 border-amber-300/60",
  },
};

export function NotificationDrawer({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onResetDemo,
}: NotificationDrawerProps) {
  const [filter, setFilter] = useState<InboxFilter>("all");

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    switch (filter) {
      case "unread":
        return notifications.filter((n) => !n.read);
      case "prs_collabs":
        return notifications.filter(
          (n) => n.type === "pr" || n.type === "collab" || n.type === "comment"
        );
      case "stars_forks":
        return notifications.filter(
          (n) => n.type === "star" || n.type === "fork" || n.type === "build"
        );
      default:
        return notifications;
    }
  }, [notifications, filter]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-end bg-black/45 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label="Builder Inbox Notifications"
      onClick={onClose}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md h-full bg-[#FAF9F6] border-l border-zinc-200/80 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Obsidian Console Header */}
        <div className="bg-[#0D0E12] text-white px-5 pt-5 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-300">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-300">
                    Builder Inbox
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-[#0D0E12] font-mono text-[10px] font-bold leading-none">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <h2 className="text-base font-sans font-bold tracking-tight text-white">
                  Architecture Activity Feed
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Builder Inbox"
              className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Pills */}
          <div className="mt-4 flex items-center gap-1.5 flex-wrap">
            {(
              [
                { id: "all", label: `All (${notifications.length})` },
                { id: "unread", label: `Unread (${unreadCount})` },
                { id: "prs_collabs", label: "PRs & Collabs" },
                { id: "stars_forks", label: "Forks & Stars" },
              ] as { id: InboxFilter; label: string }[]
            ).map((tab) => {
              const active = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-medium transition-colors cursor-pointer ${
                    active
                      ? "bg-white text-[#0D0E12] font-semibold"
                      : "bg-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.12]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sub-toolbar Actions */}
        <div className="px-5 py-2.5 bg-white border-b border-zinc-200/80 flex items-center justify-between text-xs">
          <span className="font-mono text-[11px] text-zinc-500">
            Showing {filteredNotifications.length} telemetry event
            {filteredNotifications.length === 1 ? "" : "s"}
          </span>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-amber-800 hover:text-amber-600 transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
            {onResetDemo && (
              <button
                type="button"
                onClick={onResetDemo}
                title="Restore sample notifications"
                className="inline-flex items-center gap-1 font-mono text-[11px] text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Sync</span>
              </button>
            )}
          </div>
        </div>

        {/* Activity Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredNotifications.length === 0 ? (
            <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center px-6 py-10 bg-white rounded-3xl border border-zinc-200/80">
              <div className="w-11 h-11 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 mb-3">
                <Inbox className="w-5 h-5" />
              </div>
              <p className="font-sans font-semibold text-sm text-[#111113]">
                Inbox Zero Reached
              </p>
              <p className="text-xs text-zinc-500 mt-1 max-w-[260px] leading-relaxed">
                {filter === "unread"
                  ? "Every blueprint signal has been reviewed. Fork, comment, or submit a Feature PR to see live activity."
                  : "No activity events match this filter yet."}
              </p>
              {filter !== "all" && (
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className="mt-4 px-3.5 py-1.5 rounded-full bg-[#111113] text-white font-mono text-[11px] font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  View all events
                </button>
              )}
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const meta = TYPE_META[item.type] || TYPE_META.comment;
              const Icon = meta.icon;
              const targetHref = item.target_tab
                ? `/ideas/${item.idea_slug}?tab=${item.target_tab}`
                : `/ideas/${item.idea_slug}`;

              return (
                <Link
                  key={item.id}
                  href={targetHref}
                  onClick={() => {
                    onMarkRead(item.id);
                    onClose();
                  }}
                  className={`group block rounded-2xl border p-3.5 transition-all ${
                    item.read
                      ? "bg-white/75 border-zinc-200/70 hover:bg-white hover:border-zinc-300"
                      : "bg-white border-amber-300/80 shadow-sm hover:border-amber-400"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${meta.iconBgClass}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full border font-mono text-[10px] font-semibold ${meta.badgeClass}`}
                        >
                          {meta.label}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-mono text-[10px] text-zinc-400">
                            {item.created_at}
                          </span>
                          {!item.read && (
                            <span
                              className="w-2 h-2 rounded-full bg-amber-500"
                              aria-label="Unread notification"
                            />
                          )}
                        </div>
                      </div>

                      <h3 className="mt-1.5 text-sm font-sans font-bold text-[#111113] group-hover:text-amber-900 transition-colors leading-snug">
                        {item.title}
                      </h3>

                      <p className="mt-0.5 text-xs text-zinc-600 leading-relaxed line-clamp-2">
                        {item.message}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-mono text-[11px] font-semibold text-zinc-700 truncate">
                            @{item.actor.username}
                          </span>
                          <span className="text-zinc-300">·</span>
                          <span className="font-mono text-[11px] text-zinc-500 truncate">
                            {item.idea_title}
                          </span>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#111113] shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Footer Quick Navigation */}
        <div className="px-5 py-3.5 bg-white border-t border-zinc-200/80 flex items-center justify-between gap-3">
          <Link
            href="/settings"
            onClick={onClose}
            className="inline-flex items-center gap-2 text-xs font-sans font-semibold text-[#111113] hover:text-amber-800 transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-zinc-500" />
            <span>Builder Profile & Preferences</span>
          </Link>
          <Link
            href="/profile"
            onClick={onClose}
            className="font-mono text-[11px] font-semibold text-zinc-500 hover:text-[#111113] transition-colors"
          >
            My Profile →
          </Link>
        </div>
      </aside>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Check,
  User,
  Globe,
  MapPin,
  Code2,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { IdeaAuthor } from "@/types/idea";
import { updateUserProfile } from "@/lib/ideas";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  author: IdeaAuthor;
  onProfileUpdated: (updatedAuthor: IdeaAuthor) => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  author,
  onProfileUpdated,
}: EditProfileModalProps) {
  const [fullName, setFullName] = useState(author.full_name || "");
  const [bio, setBio] = useState(author.bio || "");
  const [location, setLocation] = useState(author.location || "");
  const [githubUrl, setGithubUrl] = useState(author.github_url || "");
  const [twitterUrl, setTwitterUrl] = useState(author.twitter_url || "");
  const [discordUrl, setDiscordUrl] = useState(author.discord_url || "");
  const [websiteUrl, setWebsiteUrl] = useState(author.website_url || "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const formatUrl = (val: string, prefix: string) => {
        const trimmed = val.trim();
        if (!trimmed) return undefined;
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
        return `${prefix}/${trimmed.replace(/^@/, "")}`;
      };

      const formattedGithub = githubUrl.trim()
        ? formatUrl(githubUrl, "https://github.com")
        : undefined;
      const formattedTwitter = twitterUrl.trim()
        ? formatUrl(twitterUrl, "https://x.com")
        : undefined;
      const formattedWebsite = websiteUrl.trim()
        ? websiteUrl.trim().startsWith("http")
          ? websiteUrl.trim()
          : `https://${websiteUrl.trim()}`
        : undefined;

      const res = await updateUserProfile(author.username, {
        full_name: fullName.trim() || author.username,
        bio: bio.trim(),
        location: location.trim() || "Global",
        github_url: formattedGithub,
        twitter_url: formattedTwitter,
        discord_url: discordUrl.trim() || undefined,
        website_url: formattedWebsite,
      });

      if (res.author) {
        onProfileUpdated(res.author);
        onClose();
      } else {
        setError(res.message || "Failed to update profile.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred while saving profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-[28px] bg-white border border-zinc-200/90 shadow-2xl p-6 sm:p-8 space-y-6 relative animate-scaleUp overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Decorative Aurora Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full blur-2xl opacity-35 bg-gradient-to-br from-amber-200 to-yellow-100"
        />

        {/* Modal Header */}
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                ARCHITECT PASSPORT • IDENTITY SETTINGS
              </span>
            </div>
            <h3 className="text-xl font-sans font-bold text-[#111113]">
              Edit Developer Profile
            </h3>
            <p className="text-xs text-zinc-500 mt-1 font-sans">
              Update your public bio, location, and verified external contact channels for collaborators.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 hover:text-black transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {/* Read-Only Username */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-bold mb-1.5">
              Unique Handle
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-100 border border-zinc-200/80 text-zinc-500 font-mono text-xs cursor-not-allowed">
              <span className="text-zinc-400">@</span>
              <span className="font-bold">{author.username}</span>
              <span className="ml-auto text-[10px] text-zinc-400 uppercase font-sans">Immutable ID</span>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-700 font-bold mb-1.5">
              Full Name or Display Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Adebayo Ogunlesi"
                className="w-full h-11 pl-3.5 pr-10 rounded-xl bg-white border border-zinc-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 font-sans text-xs text-zinc-900 transition-all outline-none"
                required
              />
              <User size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          {/* Bio */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-700 font-bold">
                Bio & Architectural Focus
              </label>
              <span className="text-[10px] font-mono text-zinc-400">
                {bio.length}/240
              </span>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 240))}
              rows={3}
              placeholder="Tell other builders what you specialize in (e.g. Staff Distributed Systems Engineer, offline-first architectures, low-latency WebSockets)..."
              className="w-full p-3 rounded-xl bg-white border border-zinc-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 font-sans text-xs text-zinc-900 transition-all outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-700 font-bold mb-1.5">
              Location / Timezone
            </label>
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Lagos, Nigeria or San Francisco, CA"
                className="w-full h-11 pl-3.5 pr-10 rounded-xl bg-white border border-zinc-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 font-sans text-xs text-zinc-900 transition-all outline-none"
              />
              <MapPin size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          {/* External Contact Links Section */}
          <div className="pt-2 border-t border-zinc-100 space-y-3">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-amber-800 font-bold flex items-center gap-1.5">
              <Sparkles size={12} />
              <span>External Contact & Collaboration Handles</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* GitHub */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-600 font-semibold mb-1">
                  GitHub Handle / URL
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="e.g. adebayo-dev"
                    className="w-full h-10 pl-3 pr-8 rounded-xl bg-zinc-50 border border-zinc-200 focus:border-amber-400 focus:bg-white text-xs font-mono text-zinc-900 transition-all outline-none"
                  />
                  <Code2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
              </div>

              {/* Twitter / X */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-600 font-semibold mb-1">
                  𝕏 / Twitter Handle
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={twitterUrl}
                    onChange={(e) => setTwitterUrl(e.target.value)}
                    placeholder="e.g. @adebayo_codes"
                    className="w-full h-10 pl-3 pr-8 rounded-xl bg-zinc-50 border border-zinc-200 focus:border-amber-400 focus:bg-white text-xs font-mono text-zinc-900 transition-all outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 font-mono text-[11px] pointer-events-none">
                    𝕏
                  </span>
                </div>
              </div>

              {/* Discord */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-600 font-semibold mb-1">
                  Discord Tag
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={discordUrl}
                    onChange={(e) => setDiscordUrl(e.target.value)}
                    placeholder="e.g. adebayo#1337 or @adebayo"
                    className="w-full h-10 pl-3 pr-8 rounded-xl bg-zinc-50 border border-zinc-200 focus:border-amber-400 focus:bg-white text-xs font-mono text-zinc-900 transition-all outline-none"
                  />
                  <MessageSquare size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-600 font-semibold mb-1">
                  Personal Portfolio / Blog
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="e.g. https://adebayo.dev"
                    className="w-full h-10 pl-3 pr-8 rounded-xl bg-zinc-50 border border-zinc-200 focus:border-amber-400 focus:bg-white text-xs font-mono text-zinc-900 transition-all outline-none"
                  />
                  <Globe size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-sans text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-10 px-5 rounded-xl bg-[#0D0E12] hover:bg-zinc-800 text-white font-sans text-xs font-semibold flex items-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Check size={14} className="text-amber-300" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

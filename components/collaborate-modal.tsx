"use client";

import React, { useState } from "react";
import {
  Users,
  X,
  Send,
  Sparkles,
  CheckCircle2,
  Mail,
  MessageSquare,
  Clock,
  Briefcase,
} from "lucide-react";
import { Idea } from "@/types/idea";
import { addCollaborationRequest } from "@/lib/ideas";
import { useAuth } from "@/components/auth-provider";
import { sanitizeUsernameHandle } from "@/lib/supabase/client";

interface CollaborateModalProps {
  idea: Idea;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const ROLES = [
  "Frontend & UI Engineer",
  "Backend & Systems Architect",
  "Full-Stack Generalist",
  "AI & ML / Agent Specialist",
  "Mobile / PWA Developer",
  "Hardware & Embedded Hacker",
  "Product Designer / Growth Lead",
];

const AVAILABILITY_OPTIONS = [
  "Weekend Build (5–10 hrs/wk)",
  "Part-Time Collaborator (15–20 hrs/wk)",
  "Full-Time Co-Founder (30+ hrs/wk)",
  "Advisory / Code Reviewer",
];

export function CollaborateModal({
  idea,
  isOpen,
  onClose,
  onSuccess,
}: CollaborateModalProps) {
  const { user, profile, requireAuth } = useAuth();
  const [role, setRole] = useState(ROLES[0]);
  const [availability, setAvailability] = useState(AVAILABILITY_OPTIONS[0]);
  const [contactHandle, setContactHandle] = useState("");
  const [pitch, setPitch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!requireAuth("Sign in to pitch a collaboration request to this blueprint.")) {
      return;
    }

    if (!contactHandle.trim()) {
      setError("Please provide a contact method (GitHub, Discord, or Email)");
      return;
    }
    if (!pitch.trim() || pitch.trim().length < 15) {
      setError("Please provide a short pitch explaining your experience and interest (min 15 chars)");
      return;
    }

    setIsSubmitting(true);
    try {
      const handle =
        profile?.username ||
        (user?.email ? sanitizeUsernameHandle(user.email.split("@")[0]) : undefined);

      const applicant = handle
        ? {
            id: user?.id,
            username: handle,
            full_name: profile?.full_name || handle,
            avatar_url: profile?.avatar_url || undefined,
            reputation_score: profile?.reputation_score || 300,
            badges: profile?.badges || ["Ideator"],
          }
        : undefined;

      const res = await addCollaborationRequest(idea.slug, {
        role,
        availability,
        contact_handle: contactHandle.trim(),
        pitch: pitch.trim(),
        applicant,
      });

      if (res) {
        onSuccess(
          `Collaboration pitch submitted to @${idea.author?.username || "author"}! They will review your application.`
        );
        onClose();
      } else {
        setError("Failed to submit request. Please try again.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-3xl bg-white border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header HUD */}
        <div className="px-6 py-5 bg-[#0D0E12] text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Users size={18} />
            </div>
            <div>
              <h3 className="font-sans font-bold text-base text-white tracking-tight">
                Request to Collaborate
              </h3>
              <p className="text-xs text-zinc-400 font-mono truncate max-w-[280px]">
                {idea.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-sm">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-mono font-semibold text-zinc-700 uppercase tracking-wider mb-2">
              Proposed Role / Specialty
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-xs font-mono font-semibold text-zinc-700 uppercase tracking-wider mb-2">
              Time Commitment & Availability
            </label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              {AVAILABILITY_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Contact Handle */}
          <div>
            <label className="block text-xs font-mono font-semibold text-zinc-700 uppercase tracking-wider mb-2">
              Contact Handle (GitHub, Discord, or Email)
            </label>
            <input
              type="text"
              value={contactHandle}
              onChange={(e) => setContactHandle(e.target.value)}
              placeholder="e.g. github.com/username or discord: user#1234"
              className="w-full h-11 px-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {/* Pitch / Message */}
          <div>
            <label className="block text-xs font-mono font-semibold text-zinc-700 uppercase tracking-wider mb-2">
              Your Pitch & Tech Stack Alignment
            </label>
            <textarea
              rows={4}
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              placeholder="Tell the author why you're excited to build this, your previous projects, or what tech stack you'd love to write..."
              className="w-full p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 leading-relaxed resize-none"
            />
          </div>

          {/* Action Bar */}
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl text-zinc-600 hover:text-zinc-900 text-xs font-semibold hover:bg-zinc-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-[#111113] hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-60"
            >
              <Send size={13} />
              <span>{isSubmitting ? "Submitting..." : "Send Request"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

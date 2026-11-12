"use client";

import React from "react";
import { X } from "lucide-react";
import { AuthPassportForm, type AuthFormMode } from "@/components/auth-passport-form";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthFormMode;
  reason?: string;
  nextPath?: string;
  initialError?: string | null;
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = "signin",
  reason,
  nextPath,
  initialError,
}: AuthModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Authenticate to IdeaToX"
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[28px] bg-white border border-zinc-200/90 shadow-2xl p-6 sm:p-8 space-y-5 relative animate-scaleUp overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-16 w-44 h-44 rounded-full blur-2xl opacity-40 bg-gradient-to-br from-amber-200 to-yellow-100"
        />

        {/* Header */}
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                DEVELOPER PASSPORT
              </span>
            </div>
            <h3 className="text-xl font-sans font-bold text-[#111113]">
              Authenticate to IdeaTo<span className="text-amber-800">X</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Sign in with Email, Magic Link, or OAuth to publish, fork, and collaborate.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sign in dialog"
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 hover:text-black transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <AuthPassportForm
          initialMode={initialMode}
          reason={reason}
          nextPath={nextPath}
          initialError={initialError}
          onSuccess={onClose}
          variant="modal"
        />

        <div className="pt-1 text-center text-[11px] font-mono text-zinc-400 relative z-10">
          Open-source passport • Row-Level Security protected
        </div>
      </div>
    </div>
  );
}

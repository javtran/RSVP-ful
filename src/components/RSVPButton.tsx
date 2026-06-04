"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  eventId: string;
  spotsLeft: number;
  userRsvp: { status: string } | null;
  isLoggedIn: boolean;
};

export function RSVPButton({ eventId, spotsLeft, userRsvp, isLoggedIn }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [optimistic, setOptimistic] = useState(userRsvp);

  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-4 flex-wrap">
        <a
          href="/auth/login"
          className="inline-block bg-stone-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-700 transition-colors"
        >
          Sign in to RSVP
        </a>
        <p className="text-stone-400 text-sm">Free · Instant confirmation</p>
      </div>
    );
  }

  async function handleRSVP() {
    setLoading(true);
    const res = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId }),
    });
    setLoading(false);
    if (res.ok) {
      const rsvp = await res.json();
      setOptimistic({ status: rsvp.status });
      router.refresh();
    }
  }

  async function handleCancel() {
    setLoading(true);
    const res = await fetch("/api/rsvp", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId }),
    });
    setLoading(false);
    if (res.ok) {
      setOptimistic(null);
      router.refresh();
    }
  }

  if (optimistic?.status === "CONFIRMED") {
    return (
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl">
          <span className="text-emerald-600 text-lg">✓</span>
          <span className="text-emerald-700 font-medium text-sm">You&apos;re going!</span>
        </div>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="text-sm text-stone-400 hover:text-red-500 disabled:opacity-50 transition-colors"
        >
          Cancel RSVP
        </button>
      </div>
    );
  }

  if (optimistic?.status === "WAITLISTED") {
    return (
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl">
          <span className="text-amber-500 text-lg">⏳</span>
          <span className="text-amber-700 font-medium text-sm">On the waitlist</span>
        </div>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="text-sm text-stone-400 hover:text-red-500 disabled:opacity-50 transition-colors"
        >
          Leave waitlist
        </button>
      </div>
    );
  }

  const isFull = spotsLeft <= 0;

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <button
        onClick={handleRSVP}
        disabled={loading}
        className="bg-stone-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Processing…" : isFull ? "Join Waitlist" : "RSVP Now"}
      </button>
      {!isFull && (
        <p className="text-stone-400 text-sm">Free · Confirmation email sent instantly</p>
      )}
    </div>
  );
}

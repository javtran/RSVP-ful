"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { CalendarDays } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center">
            <CalendarDays className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-stone-900 tracking-tight">RSVP-ful</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className="text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            Browse
          </Link>

          {session ? (
            <>
              <Link
                href="/events/new"
                className="text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                Create
              </Link>
              <Link
                href="/dashboard"
                className="text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 px-3 py-1.5 rounded-lg transition-colors ml-1"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="text-sm bg-stone-900 text-white hover:bg-stone-700 px-4 py-1.5 rounded-lg transition-colors ml-1"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";

type Tab = "public" | "upcoming" | "past" | "created";

const TABS: { id: Tab; label: string; requiresAuth: boolean }[] = [
  { id: "public", label: "Public Events", requiresAuth: false },
  { id: "upcoming", label: "Upcoming", requiresAuth: true },
  { id: "past", label: "Past Attended", requiresAuth: true },
  { id: "created", label: "My Events", requiresAuth: true },
];

export function BrowseTabs({
  activeTab,
  isLoggedIn,
}: {
  activeTab: Tab;
  isLoggedIn: boolean;
}) {
  const visibleTabs = TABS.filter((t) => !t.requiresAuth || isLoggedIn);

  return (
    <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit">
      {visibleTabs.map((t) => (
        <Link
          key={t.id}
          href={t.id === "public" ? "/" : `/?tab=${t.id}`}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === t.id
              ? "bg-white text-stone-900 shadow-sm"
              : "text-stone-500 hover:text-stone-800"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}

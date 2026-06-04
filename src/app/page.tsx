import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { EventCard } from "@/components/EventCard";
import { BrowseTabs } from "@/components/BrowseTabs";
import { CalendarDays, Ticket, Clock } from "lucide-react";

export const revalidate = 0;

type Tab = "public" | "upcoming" | "past" | "created";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: rawTab } = await searchParams;
  const session = await auth();

  const validTabs: Tab[] = ["public", "upcoming", "past", "created"];
  const tab: Tab =
    rawTab && validTabs.includes(rawTab as Tab) ? (rawTab as Tab) : "public";

  const requiresAuth = tab === "upcoming" || tab === "past" || tab === "created";
  const activeTab: Tab = requiresAuth && !session?.user ? "public" : tab;

  const userId = session?.user?.id;
  const now = new Date();

  let events: Awaited<ReturnType<typeof getPublicEvents>> = [];

  if (activeTab === "public") events = await getPublicEvents(now);
  else if (activeTab === "upcoming" && userId) events = await getUpcomingRsvps(userId, now);
  else if (activeTab === "past" && userId) events = await getPastRsvps(userId, now);
  else if (activeTab === "created" && userId) events = await getCreatedEvents(userId);

  const emptyStates: Record<Tab, { icon: React.ReactNode; title: string; subtitle: string; cta?: React.ReactNode }> = {
    public: {
      icon: <CalendarDays className="w-6 h-6 text-stone-400" />,
      title: "No upcoming events",
      subtitle: "Be the first to create one",
      cta: (
        <Link href="/events/new" className="inline-block mt-4 bg-stone-900 text-white px-5 py-2 rounded-xl text-sm hover:bg-stone-700 transition-colors">
          Create Event
        </Link>
      ),
    },
    upcoming: {
      icon: <Ticket className="w-6 h-6 text-stone-400" />,
      title: "No upcoming RSVPs",
      subtitle: "Browse events and RSVP to get started",
      cta: (
        <Link href="/" className="inline-block mt-4 bg-stone-900 text-white px-5 py-2 rounded-xl text-sm hover:bg-stone-700 transition-colors">
          Browse Events
        </Link>
      ),
    },
    past: {
      icon: <Clock className="w-6 h-6 text-stone-400" />,
      title: "No past events",
      subtitle: "Events you've attended will appear here",
    },
    created: {
      icon: <CalendarDays className="w-6 h-6 text-stone-400" />,
      title: "No events created yet",
      subtitle: "Host your first event",
      cta: (
        <Link href="/events/new" className="inline-block mt-4 bg-stone-900 text-white px-5 py-2 rounded-xl text-sm hover:bg-stone-700 transition-colors">
          Create Event
        </Link>
      ),
    },
  };

  const empty = emptyStates[activeTab];

  return (
    <div>
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Browse Events</h1>
          <p className="text-stone-500 mt-1">Discover events, RSVP instantly.</p>
        </div>
        <Link
          href="/events/new"
          className="bg-stone-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-700 transition-colors"
        >
          + Host an Event
        </Link>
      </div>

      <BrowseTabs activeTab={activeTab} isLoggedIn={!!session?.user} />

      <div className="mt-6">
        {events.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              {empty.icon}
            </div>
            <p className="text-lg font-medium text-stone-700">{empty.title}</p>
            <p className="text-sm text-stone-400 mt-1">{empty.subtitle}</p>
            {empty.cta}
          </div>
        ) : (
          <>
            <p className="text-xs text-stone-400 uppercase tracking-wide font-medium mb-5">
              {events.length} event{events.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const eventInclude = {
  organizer: { select: { name: true } },
  _count: { select: { rsvps: { where: { status: "CONFIRMED" as const } } } },
} as const;

async function getPublicEvents(now: Date) {
  return prisma.event.findMany({
    where: { isPrivate: false, date: { gte: now } },
    orderBy: { date: "asc" },
    take: 24,
    include: eventInclude,
  });
}

async function getUpcomingRsvps(userId: string, now: Date) {
  const rsvps = await prisma.rSVP.findMany({
    where: {
      userId,
      status: { in: ["CONFIRMED", "WAITLISTED"] },
      event: { date: { gte: now } },
    },
    orderBy: { event: { date: "asc" } },
    take: 24,
    include: { event: { include: eventInclude } },
  });
  return rsvps.map((r) => r.event);
}

async function getPastRsvps(userId: string, now: Date) {
  const rsvps = await prisma.rSVP.findMany({
    where: {
      userId,
      status: "CONFIRMED",
      event: { date: { lt: now } },
    },
    orderBy: { event: { date: "desc" } },
    take: 24,
    include: { event: { include: eventInclude } },
  });
  return rsvps.map((r) => r.event);
}

async function getCreatedEvents(userId: string) {
  return prisma.event.findMany({
    where: { organizerId: userId },
    orderBy: { date: "desc" },
    take: 24,
    include: eventInclude,
  });
}

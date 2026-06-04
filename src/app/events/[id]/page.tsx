import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { RSVPButton } from "@/components/RSVPButton";
import { ShareLink } from "@/components/ShareLink";
import { EventCover } from "@/components/EventCover";
import { Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function EventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id } = await params;
  const { token } = await searchParams;
  const session = await auth();

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      organizer: { select: { id: true, name: true, email: true } },
      _count: { select: { rsvps: { where: { status: "CONFIRMED" } } } },
    },
  });

  if (!event) notFound();

  if (event.isPrivate) {
    const isOrganizer = session?.user?.id === event.organizer.id;
    const hasValidToken = token === event.shareToken;
    const isAttendee = session?.user
      ? !!(await prisma.rSVP.findUnique({
          where: { userId_eventId: { userId: session.user.id, eventId: id } },
        }))
      : false;

    if (!isOrganizer && !hasValidToken && !isAttendee) redirect("/");
  }

  const userRsvp = session?.user
    ? await prisma.rSVP.findUnique({
        where: { userId_eventId: { userId: session.user.id, eventId: id } },
      })
    : null;

  const spotsLeft = event.capacity - event._count.rsvps;
  const pct = Math.min(Math.round((event._count.rsvps / event.capacity) * 100), 100);
  const isOrganizer = session?.user?.id === event.organizer.id;
  const isFull = spotsLeft <= 0;

  const dateStr = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = new Date(event.date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const shareUrl = `${process.env.AUTH_URL}/invite/${event.shareToken}`;

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to events
      </Link>

      {/* Cover */}
      {event.imageUrl ? (
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-72 object-cover rounded-2xl mb-6"
        />
      ) : (
        <EventCover eventId={event.id} className="h-72 rounded-2xl mb-6" />
      )}

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-stone-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
                  {dateStr} · {timeStr}
                </p>
                {event.isPrivate && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
                    <Lock className="w-3 h-3" />
                    Private
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-stone-900 tracking-tight">{event.title}</h1>
              <p className="text-stone-500 mt-1 text-sm">
                Hosted by{" "}
                <span className="text-stone-700 font-medium">
                  {event.organizer.name ?? event.organizer.email}
                </span>
              </p>
            </div>
            {isOrganizer && (
              <Link
                href={`/events/${event.id}/edit`}
                className="shrink-0 text-sm text-stone-500 hover:text-stone-900 border border-stone-200 hover:border-stone-400 px-3 py-1.5 rounded-lg transition-colors"
              >
                Edit event
              </Link>
            )}
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-px bg-stone-100">
          <div className="bg-white p-6">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1">
              Location
            </p>
            <p className="text-stone-800 font-medium">{event.location}</p>
          </div>
          <div className="bg-white p-6">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1">
              Attendance
            </p>
            <p className="text-stone-800 font-medium">
              {event._count.rsvps} / {event.capacity} going
            </p>
            <div className="mt-2 h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${isFull ? "bg-red-400" : "bg-emerald-400"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className={`text-xs mt-1 font-medium ${isFull ? "text-red-500" : "text-emerald-600"}`}>
              {isFull ? "Event is full" : `${spotsLeft} spots remaining`}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="p-8 border-t border-stone-100">
          <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wide mb-3">About</h2>
          <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">{event.description}</p>
        </div>

        {/* RSVP */}
        <div className="px-8 pb-8">
          <RSVPButton
            eventId={event.id}
            spotsLeft={spotsLeft}
            userRsvp={userRsvp ? { status: userRsvp.status } : null}
            isLoggedIn={!!session?.user}
          />
        </div>

        {/* Share link — organizer only, private events */}
        {isOrganizer && event.isPrivate && (
          <div className="px-8 pb-8 border-t border-stone-100 pt-6">
            <p className="text-sm font-semibold text-stone-700 mb-1">Invite link</p>
            <p className="text-xs text-stone-400 mb-3">
              Only people with this link can view and RSVP to your private event.
            </p>
            <ShareLink url={shareUrl} />
          </div>
        )}
      </div>
    </div>
  );
}

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CalendarDays, Ticket } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const [myEvents, myRsvps] = await Promise.all([
    prisma.event.findMany({
      where: { organizerId: session.user.id },
      orderBy: { date: "desc" },
      include: { _count: { select: { rsvps: { where: { status: "CONFIRMED" } } } } },
    }),
    prisma.rSVP.findMany({
      where: { userId: session.user.id, status: { in: ["CONFIRMED", "WAITLISTED"] } },
      orderBy: { event: { date: "asc" } },
      include: { event: { include: { organizer: { select: { name: true } } } } },
    }),
  ]);

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Dashboard</h1>
        <p className="text-stone-500 text-sm mt-1">
          Welcome back, {session.user.name ?? session.user.email}
        </p>
      </div>

      {/* Events I'm hosting */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-stone-900">Events I&apos;m hosting</h2>
          <Link
            href="/events/new"
            className="text-sm bg-stone-900 text-white px-4 py-1.5 rounded-lg hover:bg-stone-700 transition-colors"
          >
            + New event
          </Link>
        </div>

        {myEvents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center">
            <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <CalendarDays className="w-6 h-6 text-stone-400" />
            </div>
            <p className="font-medium text-stone-700">No events yet</p>
            <Link href="/events/new" className="text-sm text-stone-500 underline mt-1 block hover:text-stone-900 transition-colors">
              Create your first event
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {myEvents.map((event) => {
              const isPast = new Date(event.date) < new Date();
              return (
                <div
                  key={event.id}
                  className="bg-white rounded-xl border border-stone-200 px-5 py-4 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/events/${event.id}`}
                        className="font-medium text-stone-900 hover:text-indigo-600 transition-colors truncate"
                      >
                        {event.title}
                      </Link>
                      {isPast && (
                        <span className="text-xs bg-stone-100 text-stone-400 px-2 py-0.5 rounded-full shrink-0">
                          Past
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-stone-400 mt-0.5">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      · {event._count.rsvps} / {event.capacity} attending
                    </p>
                  </div>
                  <Link
                    href={`/events/${event.id}/edit`}
                    className="shrink-0 text-sm text-stone-400 hover:text-stone-900 border border-stone-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* My RSVPs */}
      <section>
        <h2 className="font-semibold text-stone-900 mb-4">My RSVPs</h2>

        {myRsvps.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center">
            <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Ticket className="w-6 h-6 text-stone-400" />
            </div>
            <p className="font-medium text-stone-700">No upcoming RSVPs</p>
            <Link href="/" className="text-sm text-stone-500 underline mt-1 block hover:text-stone-900 transition-colors">
              Browse events
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {myRsvps.map((rsvp) => (
              <div
                key={rsvp.id}
                className="bg-white rounded-xl border border-stone-200 px-5 py-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <Link
                    href={`/events/${rsvp.event.id}`}
                    className="font-medium text-stone-900 hover:text-indigo-600 transition-colors truncate block"
                  >
                    {rsvp.event.title}
                  </Link>
                  <p className="text-sm text-stone-400 mt-0.5">
                    {new Date(rsvp.event.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    · by {rsvp.event.organizer.name ?? "Unknown"}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${
                    rsvp.status === "CONFIRMED"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {rsvp.status === "CONFIRMED" ? "Confirmed" : "Waitlisted"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

import Link from "next/link";
import { Lock } from "lucide-react";
import { EventCover } from "./EventCover";

type Event = {
  id: string;
  title: string;
  description: string;
  location: string;
  date: Date;
  capacity: number;
  imageUrl: string | null;
  isPrivate: boolean;
  organizer: { name: string | null };
  _count: { rsvps: number };
};

export function EventCard({ event }: { event: Event }) {
  const spotsLeft = event.capacity - event._count.rsvps;
  const isFull = spotsLeft <= 0;
  const isAlmostFull = !isFull && spotsLeft <= 5;
  const isPast = new Date(event.date) < new Date();
  const pct = Math.round((event._count.rsvps / event.capacity) * 100);

  const monthDay = new Date(event.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const weekday = new Date(event.date).toLocaleDateString("en-US", { weekday: "short" });
  const time = new Date(event.date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Link href={`/events/${event.id}`} className="group block">
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-lg hover:border-stone-300 transition-all duration-200">
        {/* Cover */}
        <div className="relative">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-44 object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
          ) : (
            <EventCover eventId={event.id} className="h-44" />
          )}

          {event.isPrivate && (
            <span className="absolute top-3 right-3 flex items-center gap-1 text-xs font-medium bg-white/90 backdrop-blur-sm text-stone-600 px-2.5 py-1 rounded-full border border-stone-200">
              <Lock className="w-3 h-3" />
              Private
            </span>
          )}
          {isPast && (
            <span className="absolute top-3 left-3 text-xs font-medium bg-stone-800/75 text-white px-2.5 py-1 rounded-full">
              Past
            </span>
          )}
        </div>

        <div className="p-5">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">
            {weekday}, {monthDay} · {time}
          </p>

          <h2 className="font-semibold text-stone-900 text-lg leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
            {event.title}
          </h2>

          <p className="text-stone-500 text-sm mt-1.5 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          <p className="text-stone-400 text-xs mt-3">{event.location}</p>

          {!isPast && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-stone-400 mb-1">
                <span>{event._count.rsvps} going</span>
                <span
                  className={
                    isFull
                      ? "text-red-500 font-medium"
                      : isAlmostFull
                      ? "text-amber-500 font-medium"
                      : "text-emerald-600 font-medium"
                  }
                >
                  {isFull ? "Full" : `${spotsLeft} spots left`}
                </span>
              </div>
              <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isFull ? "bg-red-400" : isAlmostFull ? "bg-amber-400" : "bg-emerald-400"
                  }`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          )}

          {isPast && (
            <p className="text-xs text-stone-400 mt-4">{event._count.rsvps} attended</p>
          )}
        </div>
      </div>
    </Link>
  );
}

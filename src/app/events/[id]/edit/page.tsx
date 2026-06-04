import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EventForm } from "@/components/EventForm";
import Link from "next/link";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) notFound();
  if (event.organizerId !== session.user.id && session.user.role !== "ADMIN") redirect("/");

  const defaultValues = {
    title: event.title,
    description: event.description,
    location: event.location,
    date: new Date(event.date).toISOString().slice(0, 16),
    capacity: String(event.capacity),
    imageUrl: event.imageUrl ?? "",
    isPrivate: event.isPrivate,
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href={`/events/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 mb-6 transition-colors"
      >
        ← Back to event
      </Link>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Edit event</h1>
        <p className="text-stone-500 text-sm mt-1">Changes will be visible immediately.</p>
      </div>
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
        <EventForm eventId={event.id} defaultValues={defaultValues} />
      </div>
    </div>
  );
}

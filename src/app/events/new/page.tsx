import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { EventForm } from "@/components/EventForm";
import Link from "next/link";

export default async function NewEventPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 mb-6 transition-colors">
        ← Back to events
      </Link>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Host an event</h1>
        <p className="text-stone-500 text-sm mt-1">Fill in the details — attendees get a confirmation email when they RSVP.</p>
      </div>
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
        <EventForm />
      </div>
    </div>
  );
}

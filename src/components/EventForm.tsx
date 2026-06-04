"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Globe } from "lucide-react";

type EventFormData = {
  title: string;
  description: string;
  location: string;
  date: string;
  capacity: string;
  imageUrl: string;
  isPrivate: boolean;
};

type Props = {
  eventId?: string;
  defaultValues?: Partial<EventFormData>;
};

const inputClass =
  "w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all";
const labelClass = "block text-sm font-medium text-stone-700 mb-1.5";

export function EventForm({ eventId, defaultValues = {} }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPrivate, setIsPrivate] = useState(defaultValues.isPrivate ?? false);
  const isEdit = !!eventId;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body = {
      title: form.get("title"),
      description: form.get("description"),
      location: form.get("location"),
      date: form.get("date"),
      capacity: form.get("capacity"),
      imageUrl: form.get("imageUrl") || null,
      isPrivate,
    };

    const res = await fetch(isEdit ? `/api/events/${eventId}` : "/api/events", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      return;
    }

    const event = await res.json();
    router.push(`/events/${event.id}`);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    setLoading(true);
    await fetch(`/api/events/${eventId}`, { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelClass}>Event title</label>
        <input
          name="title"
          type="text"
          required
          placeholder="e.g. Summer Rooftop Party"
          defaultValue={defaultValues.title ?? ""}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Date & Time</label>
          <input
            name="date"
            type="datetime-local"
            required
            defaultValue={defaultValues.date ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Capacity</label>
          <input
            name="capacity"
            type="number"
            required
            min={1}
            placeholder="50"
            defaultValue={defaultValues.capacity ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Location</label>
        <input
          name="location"
          type="text"
          required
          placeholder="123 Main St, San Francisco"
          defaultValue={defaultValues.location ?? ""}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea
          name="description"
          required
          rows={5}
          placeholder="Tell people what to expect…"
          defaultValue={defaultValues.description ?? ""}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div>
        <label className={labelClass}>
          Cover image URL <span className="text-stone-400 font-normal">(optional)</span>
        </label>
        <input
          name="imageUrl"
          type="url"
          placeholder="https://…"
          defaultValue={defaultValues.imageUrl ?? ""}
          className={inputClass}
        />
      </div>

      {/* Visibility toggle */}
      <button
        type="button"
        onClick={() => setIsPrivate(!isPrivate)}
        className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
          isPrivate
            ? "border-stone-300 bg-stone-50"
            : "border-stone-200 bg-white hover:border-stone-300"
        }`}
      >
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
            isPrivate ? "bg-stone-900" : "bg-stone-100"
          }`}
        >
          {isPrivate ? (
            <Lock className="w-4 h-4 text-white" />
          ) : (
            <Globe className="w-4 h-4 text-stone-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-stone-800">
            {isPrivate ? "Private event" : "Public event"}
          </p>
          <p className="text-xs text-stone-400 mt-0.5">
            {isPrivate
              ? "Only people with the invite link can view and RSVP."
              : "Anyone can discover and RSVP to this event."}
          </p>
        </div>
        {/* Toggle pill */}
        <div
          className={`relative w-10 h-6 rounded-full shrink-0 transition-colors ${
            isPrivate ? "bg-stone-900" : "bg-stone-200"
          }`}
        >
          <span
            className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              isPrivate ? "left-5" : "left-1"
            }`}
          />
        </div>
      </button>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-stone-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving…" : isEdit ? "Save changes" : "Create event"}
        </button>

        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="text-sm text-stone-400 hover:text-red-500 disabled:opacity-50 transition-colors"
          >
            Delete event
          </button>
        )}
      </div>
    </form>
  );
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendRSVPConfirmation, sendRSVPCancellation } from "@/lib/email";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { eventId } = await req.json();
  if (!eventId) return NextResponse.json({ error: "Missing eventId" }, { status: 400 });

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { _count: { select: { rsvps: { where: { status: "CONFIRMED" } } } } },
  });

  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const existing = await prisma.rSVP.findUnique({
    where: { userId_eventId: { userId: session.user.id, eventId } },
  });

  if (existing) {
    if (existing.status === "CONFIRMED") {
      return NextResponse.json({ error: "Already RSVP'd" }, { status: 409 });
    }
    // Re-activate a cancelled RSVP
    const confirmedCount = event._count.rsvps;
    const status = confirmedCount < event.capacity ? "CONFIRMED" : "WAITLISTED";

    const rsvp = await prisma.rSVP.update({
      where: { id: existing.id },
      data: { status },
    });

    if (status === "CONFIRMED") {
      await sendRSVPConfirmation({
        to: session.user.email!,
        userName: session.user.name ?? "there",
        eventTitle: event.title,
        eventDate: event.date,
        eventLocation: event.location,
        eventId: event.id,
      });
    }

    return NextResponse.json(rsvp, { status: 200 });
  }

  const confirmedCount = event._count.rsvps;
  const status = confirmedCount < event.capacity ? "CONFIRMED" : "WAITLISTED";

  const rsvp = await prisma.rSVP.create({
    data: { userId: session.user.id, eventId, status },
  });

  if (status === "CONFIRMED") {
    await sendRSVPConfirmation({
      to: session.user.email!,
      userName: session.user.name ?? "there",
      eventTitle: event.title,
      eventDate: event.date,
      eventLocation: event.location,
      eventId: event.id,
    });
  }

  return NextResponse.json(rsvp, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { eventId } = await req.json();
  if (!eventId) return NextResponse.json({ error: "Missing eventId" }, { status: 400 });

  const rsvp = await prisma.rSVP.findUnique({
    where: { userId_eventId: { userId: session.user.id, eventId } },
    include: { event: true },
  });

  if (!rsvp) return NextResponse.json({ error: "RSVP not found" }, { status: 404 });

  await prisma.rSVP.update({
    where: { id: rsvp.id },
    data: { status: "CANCELLED" },
  });

  await sendRSVPCancellation({
    to: session.user.email!,
    userName: session.user.name ?? "there",
    eventTitle: rsvp.event.title,
  });

  // Promote first waitlisted person if slot opens up
  const waitlisted = await prisma.rSVP.findFirst({
    where: { eventId, status: "WAITLISTED" },
    orderBy: { createdAt: "asc" },
    include: { user: true },
  });

  if (waitlisted) {
    await prisma.rSVP.update({
      where: { id: waitlisted.id },
      data: { status: "CONFIRMED" },
    });

    await sendRSVPConfirmation({
      to: waitlisted.user.email!,
      userName: waitlisted.user.name ?? "there",
      eventTitle: rsvp.event.title,
      eventDate: rsvp.event.date,
      eventLocation: rsvp.event.location,
      eventId: rsvp.event.id,
    });
  }

  return new NextResponse(null, { status: 204 });
}

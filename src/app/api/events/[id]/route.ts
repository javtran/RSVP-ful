import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      organizer: { select: { id: true, name: true, email: true } },
      _count: { select: { rsvps: { where: { status: "CONFIRMED" } } } },
    },
  });

  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (event.isPrivate) {
    const isOrganizer = session?.user?.id === event.organizerId;
    const hasValidToken = token === event.shareToken;
    const isAttendee = session?.user
      ? !!(await prisma.rSVP.findUnique({
          where: { userId_eventId: { userId: session.user.id, eventId: id } },
        }))
      : false;

    if (!isOrganizer && !hasValidToken && !isAttendee) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.json(event);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });

  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (event.organizerId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, location, date, capacity, imageUrl, isPrivate } = body;

  const updated = await prisma.event.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(description && { description }),
      ...(location && { location }),
      ...(date && { date: new Date(date) }),
      ...(capacity && { capacity: parseInt(capacity) }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(isPrivate !== undefined && { isPrivate }),
    },
    include: {
      organizer: { select: { name: true, email: true } },
      _count: { select: { rsvps: true } },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });

  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (event.organizerId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.event.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}

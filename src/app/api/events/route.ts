import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 12;
  const skip = (page - 1) * limit;

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      skip,
      take: limit,
      orderBy: { date: "asc" },
      where: {
        date: { gte: new Date() },
        isPrivate: false,
      },
      include: {
        organizer: { select: { name: true, email: true } },
        _count: { select: { rsvps: { where: { status: "CONFIRMED" } } } },
      },
    }),
    prisma.event.count({
      where: { date: { gte: new Date() }, isPrivate: false },
    }),
  ]);

  return NextResponse.json({ events, total, pages: Math.ceil(total / limit) });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, location, date, capacity, imageUrl, isPrivate } = body;

  if (!title || !description || !location || !date || !capacity) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const event = await prisma.event.create({
    data: {
      title,
      description,
      location,
      date: new Date(date),
      capacity: parseInt(capacity),
      imageUrl,
      isPrivate: isPrivate === true,
      organizerId: session.user.id,
    },
    include: {
      organizer: { select: { name: true, email: true } },
      _count: { select: { rsvps: true } },
    },
  });

  return NextResponse.json(event, { status: 201 });
}

import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const event = await prisma.event.findUnique({ where: { shareToken: token } });
  if (!event) notFound();

  redirect(`/events/${event.id}?token=${token}`);
}

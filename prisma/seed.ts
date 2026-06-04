import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Seed users
  const password = await bcrypt.hash("password123", 12);

  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: { name: "Alice Chen", email: "alice@example.com", password },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: { name: "Bob Martinez", email: "bob@example.com", password },
  });

  const cara = await prisma.user.upsert({
    where: { email: "cara@example.com" },
    update: {},
    create: { name: "Cara Wu", email: "cara@example.com", password },
  });

  // Seed events
  const events = [
    {
      title: "Design Systems Workshop",
      description:
        "A hands-on workshop exploring how to build scalable design systems from scratch. We'll cover tokens, components, and documentation practices used by teams at Figma, Stripe, and Linear.\n\nBring your laptop. Figma account required.",
      location: "Notion HQ, 2300 Harrison St, San Francisco",
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      capacity: 30,
      isPrivate: false,
      imageUrl: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=800&q=80",
      organizerId: alice.id,
    },
    {
      title: "SF Founders Dinner",
      description:
        "An intimate dinner for early-stage founders building in the Bay Area. Good food, honest conversations about building companies, and no pitching allowed.\n\nInvite only. RSVP to reserve your seat.",
      location: "Foreign Cinema, 2534 Mission St, San Francisco",
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      capacity: 20,
      isPrivate: true,
      imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
      organizerId: bob.id,
    },
    {
      title: "Morning Yoga in Dolores Park",
      description:
        "Start your Saturday with an outdoor flow in Dolores Park. All levels welcome — bring a mat and water. We meet at the upper terrace near the tennis courts.\n\nFree to attend, donations appreciated.",
      location: "Dolores Park, San Francisco",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      capacity: 40,
      isPrivate: false,
      imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
      organizerId: cara.id,
    },
    {
      title: "Indie Hackers Meetup",
      description:
        "Monthly meetup for solo founders, indie hackers, and bootstrappers. Share what you're working on, get feedback, and meet others building sustainable businesses without VC.\n\nLightning talks at 7pm. Drinks and mingling after.",
      location: "Paige, 3369 22nd St, San Francisco",
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      capacity: 60,
      isPrivate: false,
      imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
      organizerId: alice.id,
    },
    {
      title: "TypeScript Deep Dive",
      description:
        "Advanced TypeScript patterns for production applications. We'll cover discriminated unions, template literal types, conditional types, and how to type complex APIs without losing your mind.\n\nIntermediate to advanced level. Prior TS experience required.",
      location: "Cloudflare SF, 101 Townsend St",
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      capacity: 50,
      isPrivate: false,
      imageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
      organizerId: bob.id,
    },
    {
      title: "Product Critique Night",
      description:
        "Bring a product you're working on and get structured critique from a room full of designers, engineers, and PMs. Friendly but honest. Each presenter gets 15 minutes.\n\nSubmit your product link in advance to be added to the queue.",
      location: "Figma SF, 760 Market St",
      date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      capacity: 35,
      isPrivate: false,
      imageUrl: "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=800&q=80",
      organizerId: cara.id,
    },
    {
      title: "AI/ML Reading Group",
      description:
        "Bi-weekly paper reading group focused on applied ML. This session: Attention Is All You Need + recent transformer architecture improvements. Pre-reading encouraged but not required.\n\nCome ready to discuss, not just listen.",
      location: "Anthropic, 548 Market St, San Francisco",
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      capacity: 25,
      isPrivate: false,
      imageUrl: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=800&q=80",
      organizerId: alice.id,
    },
    {
      title: "Rooftop Film Night",
      description:
        "Join us for an outdoor screening of Blade Runner 2049 on a Mission District rooftop. Blankets provided, BYO drinks and snacks.\n\nDoors open at sunset. Film starts at dusk.",
      location: "Private rooftop, Mission District SF",
      date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      capacity: 45,
      isPrivate: false,
      imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
      organizerId: bob.id,
    },
  ];

  for (const event of events) {
    await prisma.event.create({ data: event });
  }

  // Add a few RSVPs
  const allEvents = await prisma.event.findMany({ where: { isPrivate: false } });

  await prisma.rSVP.createMany({
    data: [
      { userId: bob.id, eventId: allEvents[0].id, status: "CONFIRMED" },
      { userId: cara.id, eventId: allEvents[0].id, status: "CONFIRMED" },
      { userId: alice.id, eventId: allEvents[2].id, status: "CONFIRMED" },
      { userId: bob.id, eventId: allEvents[3].id, status: "CONFIRMED" },
      { userId: cara.id, eventId: allEvents[4].id, status: "CONFIRMED" },
      { userId: alice.id, eventId: allEvents[5].id, status: "CONFIRMED" },
      { userId: bob.id, eventId: allEvents[6].id, status: "CONFIRMED" },
    ],
    skipDuplicates: true,
  });

  console.log("Seeded users: alice@example.com, bob@example.com, cara@example.com (password: password123)");
  console.log(`Seeded ${events.length} events`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

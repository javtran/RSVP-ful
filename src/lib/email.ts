import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendRSVPConfirmation({
  to,
  userName,
  eventTitle,
  eventDate,
  eventLocation,
  eventId,
}: {
  to: string;
  userName: string;
  eventTitle: string;
  eventDate: Date;
  eventLocation: string;
  eventId: string;
}) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(eventDate);

  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: `RSVP Confirmed: ${eventTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #111827;">You're going! 🎉</h1>
        <p>Hi ${userName},</p>
        <p>Your RSVP for <strong>${eventTitle}</strong> has been confirmed.</p>
        <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0 0 8px;"><strong>📅 Date:</strong> ${formattedDate}</p>
          <p style="margin: 0;"><strong>📍 Location:</strong> ${eventLocation}</p>
        </div>
        <a href="${process.env.AUTH_URL}/events/${eventId}"
           style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
          View Event
        </a>
        <p style="color: #6b7280; margin-top: 32px; font-size: 14px;">
          You can cancel your RSVP at any time from the event page.
        </p>
      </div>
    `,
  });
}

export async function sendRSVPCancellation({
  to,
  userName,
  eventTitle,
}: {
  to: string;
  userName: string;
  eventTitle: string;
}) {
  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: `RSVP Cancelled: ${eventTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #111827;">RSVP Cancelled</h1>
        <p>Hi ${userName},</p>
        <p>Your RSVP for <strong>${eventTitle}</strong> has been cancelled.</p>
        <p style="color: #6b7280; font-size: 14px;">Changed your mind? You can re-RSVP from the event page anytime.</p>
      </div>
    `,
  });
}

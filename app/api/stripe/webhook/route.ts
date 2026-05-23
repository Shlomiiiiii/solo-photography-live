import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { getGalleryPhotos, unlockGalleryFromPayment } from "@/lib/server/galleries";
import { getBaseUrl } from "@/lib/utils";
import { getStripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) return NextResponse.json({ error: "Missing webhook signature." }, { status: 400 });

  const body = await request.text();
  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const galleryId = session.metadata?.galleryId;

    if (galleryId) {
      const gallery = await unlockGalleryFromPayment({
        galleryId,
        amountCents: session.amount_total ?? 0,
        currency: session.currency ?? "usd",
        stripeSessionId: session.id,
        stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
        customerEmail: session.customer_details?.email
      });

      if (gallery && session.customer_details?.email) {
        const photos = await getGalleryPhotos(gallery.id);
        await sendEmail({
          to: session.customer_details.email,
          subject: `Your ${gallery.title} gallery is unlocked`,
          html: `
            <div style="font-family:Arial,sans-serif;background:#050505;color:#f5f5f4;padding:32px">
              <h1 style="font-size:24px">Your gallery is ready</h1>
              <p>${gallery.title} is now unlocked with ${photos.length} photo${photos.length === 1 ? "" : "s"} available.</p>
              <p><a style="color:#e8e0d0" href="${getBaseUrl()}/g/${gallery.token}">Open gallery</a></p>
            </div>
          `
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}


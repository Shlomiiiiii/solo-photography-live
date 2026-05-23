import { NextRequest, NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/schemas";
import { getGalleryByToken } from "@/lib/server/galleries";
import { getBaseUrl } from "@/lib/utils";
import { getStripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const parsed = checkoutSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });

  const gallery = await getGalleryByToken(parsed.data.token);
  if (!gallery) return NextResponse.json({ error: "Gallery not found." }, { status: 404 });
  if (gallery.isPaid || gallery.status === "unlocked" || !gallery.paymentRequired) {
    return NextResponse.json({ url: `${getBaseUrl()}/g/${gallery.token}?paid=1` });
  }

  const amount = parsed.data.mode === "deposit" && gallery.depositCents > 0 ? gallery.depositCents : gallery.amountCents;
  if (amount <= 0) return NextResponse.json({ error: "Gallery amount is not configured." }, { status: 400 });

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amount,
          product_data: {
            name: gallery.title,
            description: gallery.propertyAddress || "Solo Photography NY gallery unlock"
          }
        }
      }
    ],
    metadata: {
      galleryId: gallery.id,
      clientId: gallery.clientId,
      propertyId: gallery.propertyId,
      token: gallery.token,
      paymentMode: parsed.data.mode
    },
    allow_promotion_codes: true,
    invoice_creation: {
      enabled: true
    },
    success_url: `${getBaseUrl()}/g/${gallery.token}?success=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getBaseUrl()}/g/${gallery.token}?canceled=1`
  });

  return NextResponse.json({ url: session.url });
}


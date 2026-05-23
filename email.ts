import "server-only";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(payload: EmailPayload) {
  const provider = process.env.EMAIL_PROVIDER ?? "none";

  if (provider === "resend" && process.env.RESEND_API_KEY) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "Solo Photography NY <no-reply@example.com>",
        ...payload
      })
    });

    if (!response.ok) {
      throw new Error(`Email provider failed: ${await response.text()}`);
    }

    return;
  }

  console.info("[email skipped]", payload.subject, payload.to);
}


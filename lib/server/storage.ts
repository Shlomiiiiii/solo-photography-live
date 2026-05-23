import "server-only";

import { adminBucket } from "@/lib/firebase/admin";

export async function createSignedReadUrl(path: string, minutes = 10) {
  const expires = Date.now() + minutes * 60 * 1000;
  const [url] = await adminBucket.file(path).getSignedUrl({
    action: "read",
    expires
  });

  return {
    url,
    expiresAt: expires
  };
}


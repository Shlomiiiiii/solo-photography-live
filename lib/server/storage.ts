import "server-only";

import { adminBucket } from "@/lib/firebase/admin";

export async function createSignedReadUrl(path: string, minutes = 10) {
  const file = adminBucket.file(path);

  const [exists] = await file.exists();
  if (!exists) {
    return {
      url: "",
      expiresAt: Date.now()
    };
  }

  const expires = Date.now() + minutes * 60 * 1000;

  const [url] = await file.getSignedUrl({
    action: "read",
    expires
  });

  return {
    url,
    expiresAt: expires
  };
}

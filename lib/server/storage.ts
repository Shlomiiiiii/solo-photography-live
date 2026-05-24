import "server-only";

export async function createSignedReadUrl(path: string, minutes = 10) {
  return {
    url: `https://storage.googleapis.com/${process.env.FIREBASE_STORAGE_BUCKET}/${path}`,
    expiresAt: Date.now() + minutes * 60 * 1000
  };
}

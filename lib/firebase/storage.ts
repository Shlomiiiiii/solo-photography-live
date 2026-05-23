"use client";

const cache = new Map<string, { url: string; expiresAt: number }>();

export async function getAdminSignedImageUrl(path: string) {
  if (!path) return "";
  const cached = cache.get(path);
  if (cached && cached.expiresAt > Date.now() + 30_000) return cached.url;

  const response = await fetch(`/api/admin/storage/signed-url?path=${encodeURIComponent(path)}`);
  if (!response.ok) throw new Error("Could not create signed image URL.");
  const data = (await response.json()) as { url: string; expiresAt: number };
  cache.set(path, data);
  return data.url;
}


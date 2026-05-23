"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { CheckCircle2, ImagePlus, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadGalleryPhotos } from "@/lib/firebase/firestore";
import type { Gallery } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PhotoUploader({ gallery }: { gallery: Gallery }) {
  const [queue, setQueue] = useState<Record<string, number>>({});
  const [uploading, setUploading] = useState(false);

  const upload = useCallback(
    async (files: File[]) => {
      if (!files.length) return;
      setUploading(true);
      setQueue(Object.fromEntries(files.map((file) => [file.name, 0])));
      try {
        await uploadGalleryPhotos(gallery, files, ({ fileName, percent }) => {
          setQueue((current) => ({ ...current, [fileName]: percent }));
        });
        toast.success(`${files.length} photo${files.length === 1 ? "" : "s"} uploaded`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [gallery]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp", ".heic"]
    },
    multiple: true,
    noClick: true,
    onDrop: upload
  });

  const items = Object.entries(queue);

  return (
    <div className="grid gap-4">
      <div
        {...getRootProps()}
        className={cn(
          "grid min-h-56 place-items-center rounded-[1.75rem] border border-dashed border-white/15 bg-white/[0.045] p-6 text-center transition",
          isDragActive && "border-champagne/70 bg-champagne/10"
        )}
      >
        <input {...getInputProps()} />
        <div className="grid justify-items-center gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-3xl bg-white/10 text-white">
            {uploading ? <UploadCloud className="h-6 w-6 animate-pulse" /> : <ImagePlus className="h-6 w-6" />}
          </div>
          <div>
            <p className="font-medium text-white">Drag high-resolution photos here</p>
            <p className="mt-1 text-sm text-white/45">Multi-photo upload, client/property metadata, and browser-side compression are enabled.</p>
          </div>
          <Button type="button" variant="primary" onClick={open} disabled={uploading}>
            Select photos
          </Button>
        </div>
      </div>
      {items.length ? (
        <div className="grid gap-2">
          {items.map(([fileName, percent]) => (
            <div key={fileName} className="rounded-2xl border border-white/10 bg-white/[0.055] p-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-white/70">{fileName}</span>
                {percent === 100 ? <CheckCircle2 className="h-4 w-4 text-success" /> : <span className="text-white/45">{percent}%</span>}
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-white transition-all" style={{ width: `${percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}


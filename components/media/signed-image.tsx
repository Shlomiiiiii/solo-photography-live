"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Camera } from "lucide-react";
import { getAdminSignedImageUrl } from "@/lib/firebase/storage";
import { cn } from "@/lib/utils";

export function SignedImage({
  path,
  alt,
  className,
  imageClassName
}: {
  path?: string;
  alt: string;
  className?: string;
  imageClassName?: string;
}) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    let active = true;
    if (!path) {
      setUrl("");
      return;
    }

    getAdminSignedImageUrl(path)
      .then((nextUrl) => {
        if (active) setUrl(nextUrl);
      })
      .catch(() => {
        if (active) setUrl("");
      });

    return () => {
      active = false;
    };
  }, [path]);

  return (
    <div className={cn("relative overflow-hidden bg-white/10", className)}>
      {url ? (
        <Image src={url} alt={alt} fill sizes="(max-width: 768px) 100vw, 420px" className={cn("object-cover", imageClassName)} />
      ) : (
        <div className="grid h-full min-h-24 place-items-center text-white/35">
          <Camera className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}


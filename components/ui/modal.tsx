"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  title,
  children,
  onClose,
  className
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-end bg-black/65 p-3 backdrop-blur-sm sm:place-items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={cn("glass-panel max-h-[92vh] w-full overflow-auto rounded-[1.75rem] sm:max-w-2xl", className)}
            initial={{ y: 32, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 32, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-charcoal/90 p-4 backdrop-blur-xl">
              <h2 className="text-lg font-semibold text-white">{title}</h2>
              <Button aria-label="Close" size="icon" variant="ghost" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4 sm:p-6">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}


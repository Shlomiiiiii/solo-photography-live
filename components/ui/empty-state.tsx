import { Camera } from "lucide-react";
import { Card } from "@/components/ui/card";

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <Card className="grid min-h-64 place-items-center p-8 text-center">
      <div className="grid max-w-sm justify-items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-white">
          <Camera className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm leading-6 text-white/55">{body}</p>
      </div>
    </Card>
  );
}


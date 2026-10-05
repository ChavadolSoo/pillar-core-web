import {
  Boxes,
  CalendarCheck,
  ClipboardList,
  FileUp,
  Headset,
  LineChart,
  Megaphone,
  Receipt,
  Stamp,
  Ticket,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Catalog icon keys (Material names, shared with the apps) -> Lucide icons. */
const ICONS: Record<string, LucideIcon> = {
  assignment: ClipboardList,
  upload_file: FileUp,
  support_agent: Headset,
  event_available: CalendarCheck,
  approval: Stamp,
  confirmation_number: Ticket,
  receipt_long: Receipt,
  campaign: Megaphone,
  insights: LineChart,
  schedule: Clock,
};

export function ServiceIcon({ icon, color, className }: { icon: string; color: string; className?: string }) {
  const Icon = ICONS[icon] ?? Boxes;
  return (
    <span
      className={cn("grid size-12 shrink-0 place-items-center rounded-2xl [&_svg]:size-6", className)}
      style={{ background: `color-mix(in oklab, ${color} 16%, transparent)`, color }}
    >
      <Icon />
    </span>
  );
}

/** Workspace page of each usable web service. */
export const SERVICE_PATHS: Record<string, string> = {
  forms: "/workspace/forms",
  documents: "/workspace/documents",
  helpdesk: "/workspace/helpdesk",
};

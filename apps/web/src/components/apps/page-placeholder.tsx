import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface PagePlaceholderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: ReactNode;
}

/**
 * Consistent empty/placeholder state for routes that are scaffolded but not
 * built out yet. Keeps the sidebar nav from leading to 404s.
 */
export default function PagePlaceholder({
  icon: Icon,
  title,
  description,
  children,
}: PagePlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-20 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="size-6" />
      </span>
      <div className="space-y-1.5">
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground text-balance">
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}

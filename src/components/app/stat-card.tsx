import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label, value, delta, positive = true, hint, icon: Icon,
}: {
  label: string; value: string; delta: string; positive?: boolean; hint?: string; icon?: LucideIcon;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card-premium p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/30">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</div>
          <div className="mt-3 text-3xl font-bold tracking-tight">{value}</div>
        </div>
        {Icon && (
          <div className="h-10 w-10 rounded-xl bg-gradient-primary/10 border border-primary/20 grid place-items-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs">
        <span className={cn(
          "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold",
          positive ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
        )}>
          {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {delta}
        </span>
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
}

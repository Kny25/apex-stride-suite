import type { ReactNode } from "react";

export function PageHeader({
  title, subtitle, actions,
}: { title: ReactNode; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ativo: "bg-success/15 text-success border-success/30",
    pago: "bg-success/15 text-success border-success/30",
    formado: "bg-success/15 text-success border-success/30",
    pendente: "bg-warning/15 text-warning border-warning/30",
    "renovação": "bg-warning/15 text-warning border-warning/30",
    trancado: "bg-warning/15 text-warning border-warning/30",
    inativo: "bg-muted text-muted-foreground border-border",
    encerrado: "bg-muted text-muted-foreground border-border",
    atrasado: "bg-destructive/15 text-destructive border-destructive/30",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${map[status] ?? "bg-muted"}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

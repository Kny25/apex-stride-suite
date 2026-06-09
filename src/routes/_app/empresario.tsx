import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/empresario")({
  component: EmpresarioLayout,
  head: () => ({ meta: [{ title: "Empresário — SGE" }] }),
});

const tabs = [
  { to: "/empresario", label: "Dashboard Geral", exact: true },
  { to: "/empresario/comparativos", label: "Filtros Comparativos", exact: false },
  { to: "/empresario/cursos", label: "Cursos para o Empresário", exact: false },
] as const;

function EmpresarioLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Empresário</h1>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft text-primary px-3 py-1 text-xs font-semibold border border-primary/15">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Acesso exclusivo
        </span>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex items-center gap-8 overflow-x-auto">
          {tabs.map((t) => {
            const active = t.exact
              ? pathname === t.to || pathname === `${t.to}/`
              : pathname.startsWith(t.to);
            return (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "relative pb-3 text-sm font-medium transition whitespace-nowrap",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
                {active && (
                  <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <Outlet />
    </div>
  );
}

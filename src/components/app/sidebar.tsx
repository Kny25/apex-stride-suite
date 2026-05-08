import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Calendar, Users, BookOpen, Briefcase,
  Megaphone, Wallet, Sparkles, KeyRound, ChevronDown, ChevronLeft,
  HelpCircle, Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/calendario", label: "Calendário", icon: Calendar },
  { to: "/rh", label: "RH", icon: Users },
  { to: "/pedagogico", label: "Pedagógico", icon: BookOpen },
  { to: "/comercial", label: "Comercial", icon: Briefcase },
  { to: "/marketing", label: "Marketing", icon: Megaphone },
  { to: "/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/ia", label: "IA", icon: Sparkles },
  { to: "/senhas-links", label: "Senhas e Links", icon: KeyRound },
] as const;

const empresarioItems = [
  { to: "/empresario", label: "Dashboard Geral" },
  { to: "/empresario?tab=filtros", label: "Filtros Comparativos" },
  { to: "/empresario?tab=cursos", label: "Cursos para o Empresário" },
];

export function AppSidebar({
  collapsed, onToggle,
}: { collapsed: boolean; onToggle: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [empOpen, setEmpOpen] = useState(true);

  return (
    <aside
      className={cn(
        "hidden md:flex h-screen sticky top-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300",
        collapsed ? "w-[76px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-sidebar-border">
        <div className="h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow shrink-0">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold tracking-tight">SGE</div>
            <div className="text-[11px] text-muted-foreground truncate">Plataforma Educacional</div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="ml-auto h-8 w-8 grid place-items-center rounded-lg hover:bg-accent text-muted-foreground transition"
          aria-label="Recolher sidebar"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {!collapsed && (
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Menu
          </div>
        )}
        {items.map(({ to, label, icon: Icon }) => {
          const active = path === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-primary-soft text-primary"
                  : "text-sidebar-foreground/80 hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-primary")} />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}

        {/* Empresário expandable section */}
        {!collapsed && (
          <div className="mt-4 rounded-2xl bg-primary-soft/70 p-2">
            <button
              onClick={() => setEmpOpen((v) => !v)}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-primary hover:bg-primary-soft transition"
            >
              <div className="h-7 w-7 rounded-lg bg-gradient-primary grid place-items-center">
                <Crown className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="flex-1 text-left">Empresário</span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", !empOpen && "-rotate-90")} />
            </button>
            {empOpen && (
              <div className="mt-1 space-y-0.5 pl-2">
                {empresarioItems.map((it) => {
                  const active = path === "/empresario";
                  return (
                    <Link
                      key={it.label}
                      to="/empresario"
                      className={cn(
                        "block rounded-lg px-3 py-2 text-[13px] font-medium transition",
                        active
                          ? "text-primary"
                          : "text-foreground/70 hover:text-primary hover:bg-white/60"
                      )}
                    >
                      {it.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Bottom: Help */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          className={cn(
            "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 hover:text-primary hover:bg-primary-soft transition"
          )}
        >
          <HelpCircle className="h-[18px] w-[18px]" />
          {!collapsed && <span>Central de Ajuda</span>}
        </button>
      </div>
    </aside>
  );
}

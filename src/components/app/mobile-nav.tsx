import { Link, useRouterState } from "@tanstack/react-router";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  LayoutDashboard, Users, Wallet, FileText, GraduationCap,
  BarChart3, Settings, LogOut, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/usuarios", label: "Usuários", icon: Users },
  { to: "/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/contratos", label: "Contratos", icon: FileText },
  { to: "/alunos", label: "Alunos", icon: GraduationCap },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

export function MobileNav({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] p-0 bg-sidebar border-sidebar-border">
        <div className="flex items-center gap-3 px-5 h-16 border-b border-sidebar-border">
          <div className="h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <div className="text-sm font-bold">SGE</div>
            <div className="text-[11px] text-muted-foreground">Gestão Empresarial</div>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {items.map(({ to, label, icon: Icon }) => {
            const active = path === to || (to !== "/dashboard" && path.startsWith(to));
            return (
              <Link
                key={to} to={to} onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60"
                )}
              >
                <Icon className="h-[18px] w-[18px]" />{label}
              </Link>
            );
          })}
          <Link
            to="/login" onClick={() => onOpenChange(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 hover:text-destructive hover:bg-sidebar-accent/60 transition mt-4"
          >
            <LogOut className="h-[18px] w-[18px]" />Sair
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

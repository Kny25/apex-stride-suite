import { Link, useRouterState } from "@tanstack/react-router";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  LayoutDashboard, Calendar, Users, BookOpen, Briefcase,
  Megaphone, Wallet, Sparkles, KeyRound, HelpCircle, Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  { to: "/empresario", label: "Empresário", icon: Crown },
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
            <div className="text-[11px] text-muted-foreground">Plataforma Educacional</div>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {items.map(({ to, label, icon: Icon }) => {
            const active = path === to;
            return (
              <Link
                key={to} to={to} onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active ? "bg-primary-soft text-primary" : "text-sidebar-foreground/80 hover:bg-muted"
                )}
              >
                <Icon className="h-[18px] w-[18px]" />{label}
              </Link>
            );
          })}
          <button className="w-full mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 hover:text-primary hover:bg-primary-soft transition">
            <HelpCircle className="h-[18px] w-[18px]" />Central de Ajuda
          </button>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

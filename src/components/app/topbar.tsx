import { useRouterState, Link } from "@tanstack/react-router";
import { Bell, Search, Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { notifications } from "@/lib/mock-data";

const labels: Record<string, string> = {
  dashboard: "Dashboard",
  usuarios: "Usuários",
  financeiro: "Financeiro",
  contratos: "Contratos",
  alunos: "Alunos",
  relatorios: "Relatórios",
  configuracoes: "Configurações",
  perfil: "Perfil",
};

export function Topbar({ onOpenMobile }: { onOpenMobile: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const segments = path.split("/").filter(Boolean);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="h-full px-4 md:px-8 flex items-center gap-4">
        <button
          onClick={onOpenMobile}
          className="md:hidden h-9 w-9 grid place-items-center rounded-lg hover:bg-accent"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <nav aria-label="breadcrumb" className="hidden sm:flex items-center text-sm">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition">
            SGE
          </Link>
          {segments.map((seg, i) => (
            <span key={i} className="flex items-center">
              <span className="mx-2 text-muted-foreground/50">/</span>
              <span className={i === segments.length - 1 ? "text-foreground font-medium" : "text-muted-foreground"}>
                {labels[seg] ?? seg}
              </span>
            </span>
          ))}
        </nav>

        <div className="flex-1 max-w-md ml-auto md:ml-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Buscar clientes, contratos, relatórios..."
              className="w-full h-10 rounded-lg bg-muted/40 border border-border pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
            />
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="relative h-10 w-10 grid place-items-center rounded-lg hover:bg-accent transition">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-gradient-primary shadow-glow" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notificações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((n) => (
              <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 py-2.5">
                <div className="text-sm font-medium">{n.title}</div>
                <div className="text-xs text-muted-foreground">{n.desc} · {n.time}</div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 rounded-lg p-1 pr-3 hover:bg-accent transition">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs font-semibold">
                AC
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium leading-tight">Ana Costa</div>
              <div className="text-[11px] text-muted-foreground">Administradora</div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link to="/perfil">Perfil</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/configuracoes">Configurações</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/login" className="text-destructive">Sair</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

import { Link } from "@tanstack/react-router";
import { Bell, Search, Menu, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { notifications } from "@/lib/mock-data";

export function Topbar({ onOpenMobile }: { onOpenMobile: () => void }) {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-card">
      <div className="h-full px-4 md:px-8 flex items-center gap-4">
        <button
          onClick={onOpenMobile}
          className="h-9 w-9 grid place-items-center rounded-lg hover:bg-muted text-foreground/70"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Centered search */}
        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-xl">
            <input
              placeholder="Buscar no sistema..."
              className="w-full h-10 rounded-full bg-muted/60 border border-border pl-5 pr-11 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:bg-card transition"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="relative h-10 w-10 grid place-items-center rounded-full hover:bg-muted transition">
            <Bell className="h-5 w-5 text-foreground/70" />
            <span className="absolute top-1.5 right-1.5 h-4 w-4 grid place-items-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground ring-2 ring-card">
              3
            </span>
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
          <DropdownMenuTrigger className="flex items-center gap-3 rounded-full pl-1 pr-3 py-1 hover:bg-muted transition">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs font-semibold">
                AC
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <div className="text-sm font-semibold leading-tight">Ana Costa</div>
              <div className="text-[11px] text-muted-foreground">Administradora</div>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
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

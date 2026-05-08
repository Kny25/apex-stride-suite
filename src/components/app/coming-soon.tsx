import { createFileRoute } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Calendar, Users, BookOpen, Briefcase, Megaphone, Sparkles, KeyRound } from "lucide-react";

export function ComingSoon({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="rounded-2xl bg-card border border-border shadow-card p-12 grid place-items-center text-center">
        <div className="h-16 w-16 rounded-2xl bg-primary-soft grid place-items-center mb-4">
          <Icon className="h-7 w-7 text-primary" />
        </div>
        <h3 className="font-semibold text-lg">Em construção</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">
          Este módulo está sendo finalizado. Em breve você poderá gerenciar tudo aqui.
        </p>
      </div>
    </div>
  );
}

export const ICONS = { Calendar, Users, BookOpen, Briefcase, Megaphone, Sparkles, KeyRound };

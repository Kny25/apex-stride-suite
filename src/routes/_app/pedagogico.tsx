import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Users,
  CalendarDays,
  BookOpen,
  ClipboardCheck,
  CheckCircle2,
  FileBarChart,
  ArrowUpRight,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/pedagogico")({
  component: PedagogicoPage,
  head: () => ({ meta: [{ title: "Pedagógico — SGE" }] }),
});

type Mod = {
  title: string;
  description: string;
  icon: LucideIcon;
  to: string;
  color: string;
  bg: string;
};

const modules: Mod[] = [
  { title: "Turmas", description: "Gerenciar turmas e alunos", icon: Users, to: "/alunos", color: "text-blue-600", bg: "bg-blue-50" },
  { title: "Calendário Acadêmico", description: "Eventos e cronograma escolar", icon: CalendarDays, to: "/calendario", color: "text-violet-600", bg: "bg-violet-50" },
  { title: "Planos de Aula", description: "Planejamento de conteúdo", icon: BookOpen, to: "/pedagogico", color: "text-emerald-600", bg: "bg-emerald-50" },
  { title: "Avaliações", description: "Notas e desempenho", icon: ClipboardCheck, to: "/pedagogico", color: "text-amber-600", bg: "bg-amber-50" },
  { title: "Frequência", description: "Controle de presença", icon: CheckCircle2, to: "/pedagogico", color: "text-rose-600", bg: "bg-rose-50" },
  { title: "Relatórios", description: "Relatórios pedagógicos", icon: FileBarChart, to: "/relatorios", color: "text-indigo-600", bg: "bg-indigo-50" },
];

function PedagogicoPage() {
  return (
    <>
      <PageHeader
        title={
          <span className="inline-flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-glow">
              <GraduationCap className="h-5 w-5" />
            </span>
            Pedagógico
          </span>
        }
        subtitle="Gestão pedagógica e acadêmica"
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m, i) => (
          <motion.div
            key={m.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Link
              to={m.to}
              className="group relative block overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow"
            >
              <div className="flex items-start justify-between">
                <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl", m.bg)}>
                  <m.icon className={cn("h-7 w-7", m.color)} />
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight">{m.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </>
  );
}

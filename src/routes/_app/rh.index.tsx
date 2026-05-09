import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Briefcase, GraduationCap, TrendingUp, Wallet, AlertTriangle, ChevronRight, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { useEmployees, atestadoSituacao, type Sector } from "@/lib/rh-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/rh/")({
  component: RHHome,
  head: () => ({ meta: [{ title: "RH — SGE" }] }),
});

const sectors: { slug: Sector; name: string; desc: string; icon: LucideIcon; color: string }[] = [
  { slug: "administrativo", name: "Administrativo", desc: "Equipe administrativa e suporte interno.", icon: Briefcase, color: "from-blue-500 to-indigo-500" },
  { slug: "pedagogico", name: "Pedagógico", desc: "Coordenação, professores e equipe acadêmica.", icon: GraduationCap, color: "from-violet-500 to-purple-500" },
  { slug: "comercial", name: "Comercial", desc: "Vendas, relacionamento e captação.", icon: TrendingUp, color: "from-emerald-500 to-teal-500" },
  { slug: "financeiro", name: "Financeiro", desc: "Controladoria, contas e tesouraria.", icon: Wallet, color: "from-amber-500 to-orange-500" },
];

function RHHome() {
  const employees = useEmployees();
  const alerts = employees
    .map((e) => ({ e, s: atestadoSituacao(e) }))
    .filter((x) => x.s.tone !== "ok");

  return (
    <>
      <PageHeader title="RH" subtitle="Selecione um setor para gerenciar os colaboradores." />

      {alerts.length > 0 && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-amber-900">Atenção: atestados em risco</p>
              <ul className="mt-1.5 space-y-0.5 text-xs text-amber-800">
                {alerts.map(({ e, s }) => (
                  <li key={e.id}>
                    <span className="font-medium">{e.nome}</span> — {s.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        {sectors.map((s, i) => {
          const count = employees.filter((e) => e.sector === s.slug).length;
          return (
            <motion.div
              key={s.slug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to="/rh/$setor"
                params={{ setor: s.slug }}
                className="group block rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm", s.color)}>
                  <s.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-base font-semibold">{s.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{count} colaboradores</span>
                  <span className="inline-flex items-center gap-1 text-primary group-hover:translate-x-0.5 transition-transform">
                    Acessar <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}

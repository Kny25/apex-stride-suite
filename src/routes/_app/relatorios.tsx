import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { revenueData } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/relatorios")({
  component: ReportsPage,
  head: () => ({ meta: [{ title: "Relatórios — SGE" }] }),
});

const reports = [
  { name: "Relatório Financeiro Mensal", desc: "Receitas, despesas e fluxo de caixa", date: "Out/2025" },
  { name: "Relatório de Contratos", desc: "Status e renovações", date: "Out/2025" },
  { name: "Relatório de Usuários", desc: "Atividade e engajamento", date: "Out/2025" },
  { name: "Relatório de Alunos", desc: "Matrículas e performance", date: "Out/2025" },
];

function ReportsPage() {
  return (
    <>
      <PageHeader title="Relatórios" subtitle="Insights e exportações detalhadas." />
      <div className="rounded-2xl border border-border bg-card-premium shadow-card p-6 mb-6">
        <h3 className="font-semibold mb-4">Tendência de Receita</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData} margin={{ left: -20, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" vertical={false} />
              <XAxis dataKey="month" stroke="oklch(0.70 0.02 264)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.70 0.02 264)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "oklch(0.20 0.02 264)", border: "1px solid oklch(1 0 0 / 0.08)", borderRadius: 12, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="receita" stroke="oklch(0.66 0.20 274)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="despesa" stroke="oklch(0.74 0.18 295)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((r) => (
          <div key={r.name} className="rounded-2xl border border-border bg-card-premium shadow-card p-5 flex items-center gap-4 hover:border-primary/30 transition">
            <div className="h-12 w-12 rounded-xl bg-gradient-primary/10 border border-primary/20 grid place-items-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium">{r.name}</div>
              <div className="text-xs text-muted-foreground">{r.desc} · {r.date}</div>
            </div>
            <Button variant="outline" size="sm"><Download className="h-4 w-4" />PDF</Button>
          </div>
        ))}
      </div>
    </>
  );
}

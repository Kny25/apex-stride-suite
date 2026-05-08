import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  TrendingUp, TrendingDown, ArrowUpRight, DollarSign,
  PiggyBank, BarChart3, Receipt, Clock, PlayCircle,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from "recharts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/empresario")({
  component: EmpresarioPage,
  head: () => ({ meta: [{ title: "Empresário — SGE" }] }),
});

const evolucao = [
  { mes: "Jul", receita: 142000, despesa: 92000, lucro: 50000 },
  { mes: "Ago", receita: 168000, despesa: 101000, lucro: 67000 },
  { mes: "Set", receita: 187000, despesa: 110000, lucro: 77000 },
  { mes: "Out", receita: 174000, despesa: 118000, lucro: 56000 },
  { mes: "Nov", receita: 211000, despesa: 124000, lucro: 87000 },
  { mes: "Dez", receita: 248000, despesa: 131000, lucro: 117000 },
];

const despesas = [
  { name: "Folha", value: 412000, color: "oklch(0.62 0.20 285)" },
  { name: "Marketing", value: 186000, color: "oklch(0.66 0.15 230)" },
  { name: "Operacional", value: 198000, color: "oklch(0.65 0.16 155)" },
  { name: "Outros", value: 110170, color: "oklch(0.72 0.16 60)" },
];

const comparativo = [
  { categoria: "Receita Total", periodoA: "R$ 482.350", periodoB: "R$ 421.800", variacao: "+14,3%", positivo: true },
  { categoria: "Lucro Líquido", periodoA: "R$ 187.420", periodoB: "R$ 162.900", variacao: "+15,1%", positivo: true },
  { categoria: "Despesas Operacionais", periodoA: "R$ 198.000", periodoB: "R$ 211.500", variacao: "-6,4%", positivo: true },
  { categoria: "CAC (Custo de Aquisição)", periodoA: "R$ 124", periodoB: "R$ 98", variacao: "+26,5%", positivo: false },
  { categoria: "Ticket Médio", periodoA: "R$ 1.890", periodoB: "R$ 1.720", variacao: "+9,9%", positivo: true },
  { categoria: "Margem Líquida", periodoA: "38,9%", periodoB: "36,2%", variacao: "+2,7 p.p.", positivo: true },
];

const cursos = [
  {
    titulo: "Liderança e Gestão de Times",
    descricao: "Desenvolva habilidades para conduzir equipes de alta performance.",
    aulas: 18, duracao: "6h 20min", status: "Em andamento",
    cor: "from-violet-400 to-fuchsia-500",
  },
  {
    titulo: "Finanças para Empresários",
    descricao: "Domine indicadores financeiros, fluxo de caixa e DRE.",
    aulas: 24, duracao: "9h 10min", status: "Não iniciado",
    cor: "from-emerald-400 to-teal-500",
  },
  {
    titulo: "Estratégia e Crescimento",
    descricao: "Frameworks práticos para escalar negócios educacionais.",
    aulas: 15, duracao: "4h 45min", status: "Em andamento",
    cor: "from-sky-400 to-indigo-500",
  },
];

function EmpresarioPage() {
  const [tab, setTab] = useState<"dashboard" | "filtros" | "cursos">("dashboard");

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
        <div className="flex items-center gap-8">
          {[
            { k: "dashboard", l: "Dashboard Geral" },
            { k: "filtros", l: "Filtros Comparativos" },
            { k: "cursos", l: "Cursos para o Empresário" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k as typeof tab)}
              className={cn(
                "relative pb-3 text-sm font-medium transition",
                tab === t.k ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.l}
              {tab === t.k && (
                <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Top metric cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Receita Total" value="R$ 1.310.000" delta="+14,3%"
          icon={DollarSign} gradient="bg-gradient-primary"
        />
        <MetricCard
          label="Lucro Líquido" value="R$ 454.000" delta="+18,7%"
          icon={PiggyBank} gradient="bg-gradient-success"
        />
        <MetricCard
          label="Crescimento" value="+23,8%" delta="+3,1% MoM"
          icon={BarChart3} gradient="bg-gradient-info"
        />
        <MetricCard
          label="Despesas" value="R$ 906.170" delta="-6,4%"
          icon={Receipt} gradient="bg-gradient-warning" positiveDown
        />
      </div>

      {/* Main grid */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Line chart */}
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border shadow-card p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold">Evolução dos últimos 6 meses</h3>
              <p className="text-xs text-muted-foreground mt-1">Receita, despesas e lucro consolidados</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <Legend dot="oklch(0.62 0.20 285)" label="Receita" />
              <Legend dot="oklch(0.72 0.16 60)" label="Despesas" />
              <Legend dot="oklch(0.65 0.16 155)" label="Lucro" />
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={evolucao} margin={{ left: -10, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="oklch(0.93 0.005 270)" vertical={false} />
                <XAxis dataKey="mes" stroke="oklch(0.50 0.02 264)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.50 0.02 264)" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{
                    background: "white", border: "1px solid oklch(0.93 0.005 270)",
                    borderRadius: 12, fontSize: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                  }}
                  formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`}
                />
                <Line type="monotone" dataKey="receita" stroke="oklch(0.62 0.20 285)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="despesa" stroke="oklch(0.72 0.16 60)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="lucro" stroke="oklch(0.65 0.16 155)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resumo */}
        <div className="rounded-2xl bg-card border border-border shadow-card p-6">
          <h3 className="text-base font-semibold">Resumo do período</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-5">Indicadores consolidados</p>
          <div className="space-y-4">
            {[
              { l: "Maior receita", v: "R$ 248.000", t: "Dez/25" },
              { l: "Menor receita", v: "R$ 142.000", t: "Jul/25" },
              { l: "Maior lucro", v: "R$ 117.000", t: "Dez/25" },
              { l: "Menor lucro", v: "R$ 50.000", t: "Jul/25" },
              { l: "Margem média", v: "38,9%", t: "6 meses" },
            ].map((s) => (
              <div key={s.l} className="flex items-center justify-between pb-3 border-b border-border last:border-0 last:pb-0">
                <div>
                  <div className="text-sm font-medium">{s.l}</div>
                  <div className="text-[11px] text-muted-foreground">{s.t}</div>
                </div>
                <div className="text-sm font-semibold">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Distribuição despesas */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl bg-card border border-border shadow-card p-6">
          <h3 className="text-base font-semibold">Distribuição de Despesas</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-5">Por categoria</p>
          <div className="relative h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={despesas} dataKey="value" innerRadius={62} outerRadius={92}
                  paddingAngle={2} stroke="white" strokeWidth={3}>
                  {despesas.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "white", border: "1px solid oklch(0.93 0.005 270)", borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 grid place-items-center pointer-events-none">
              <div className="text-center">
                <div className="text-lg font-bold">R$ 906.170</div>
                <div className="text-[11px] text-muted-foreground">Total</div>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {despesas.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-foreground/80">{d.name}</span>
                </div>
                <span className="font-medium">R$ {d.value.toLocaleString("pt-BR")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filtros Comparativos */}
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold">Filtros Comparativos</h3>
              <p className="text-xs text-muted-foreground mt-1">Compare métricas entre dois períodos</p>
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-3 mb-5">
            <Select label="Período A" value="Jan – Jun 2025" />
            <Select label="Período B" value="Jul – Dez 2024" />
            <button className="h-10 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-semibold px-5 shadow-glow hover:opacity-95 transition">
              Comparar
            </button>
          </div>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Categoria</th>
                  <th className="px-4 py-3 font-medium">Período A</th>
                  <th className="px-4 py-3 font-medium">Período B</th>
                  <th className="px-4 py-3 font-medium text-right">Variação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {comparativo.map((r) => (
                  <tr key={r.categoria} className="hover:bg-muted/30 transition">
                    <td className="px-4 py-3 font-medium">{r.categoria}</td>
                    <td className="px-4 py-3 text-foreground/80">{r.periodoA}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.periodoB}</td>
                    <td className={cn(
                      "px-4 py-3 text-right font-semibold",
                      r.positivo ? "text-success" : "text-destructive"
                    )}>
                      <span className="inline-flex items-center gap-1">
                        {r.positivo ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                        {r.variacao}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Courses */}
      <div className="rounded-2xl bg-card border border-border shadow-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-semibold">Cursos para o Empresário</h3>
            <p className="text-xs text-muted-foreground mt-1">Conteúdo selecionado para líderes</p>
          </div>
          <button className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
            Ver todos <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cursos.map((c) => (
            <div key={c.titulo} className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md transition">
              <div className={cn("relative h-36 bg-gradient-to-br", c.cor)}>
                <div className="absolute inset-0 bg-black/10" />
                <button className="absolute inset-0 grid place-items-center text-white opacity-90 group-hover:opacity-100 transition">
                  <PlayCircle className="h-12 w-12" strokeWidth={1.5} />
                </button>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                    c.status === "Em andamento"
                      ? "bg-primary-soft text-primary"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {c.status}
                  </span>
                  <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />{c.duracao}
                  </span>
                </div>
                <h4 className="font-semibold text-[15px] leading-snug">{c.titulo}</h4>
                <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{c.descricao}</p>
                <div className="mt-3 text-[11px] text-muted-foreground">{c.aulas} aulas</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label, value, delta, icon: Icon, gradient, positiveDown,
}: {
  label: string; value: string; delta: string;
  icon: typeof DollarSign; gradient: string; positiveDown?: boolean;
}) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-3xl p-6 text-white shadow-soft", gradient
    )}>
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-12 -left-6 h-28 w-28 rounded-full bg-white/5" />
      <div className="relative flex items-start justify-between">
        <div className="h-11 w-11 rounded-2xl bg-white/20 backdrop-blur grid place-items-center">
          <Icon className="h-5 w-5" />
        </div>
        <button className="h-8 w-8 rounded-full bg-white/15 hover:bg-white/25 grid place-items-center transition">
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
      <div className="relative mt-6">
        <div className="text-xs font-medium text-white/80 uppercase tracking-wide">{label}</div>
        <div className="mt-1 text-[28px] font-bold tracking-tight">{value}</div>
        <div className="mt-1 inline-flex items-center gap-1 text-xs text-white/90">
          {positiveDown ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
          {delta} vs anterior
        </div>
      </div>
    </div>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <span className="h-2 w-2 rounded-full" style={{ background: dot }} />
      {label}
    </div>
  );
}

function Select({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <label className="text-[11px] font-medium text-muted-foreground mb-1">{label}</label>
      <button className="h-10 rounded-lg border border-border bg-card px-4 text-sm text-left min-w-[180px] hover:border-primary/40 transition">
        {value}
      </button>
    </div>
  );
}

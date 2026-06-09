import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  TrendingUp, TrendingDown, ArrowUpRight, DollarSign,
  PiggyBank, BarChart3, Receipt, Loader2,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  computeMetrics, formatBRL, formatPct, lastMonths, pctDiff,
  type ContaPagar, type Mov,
} from "@/lib/empresario";

export const Route = createFileRoute("/_app/empresario/")({
  component: DashboardGeral,
  head: () => ({ meta: [{ title: "Empresário — Dashboard Geral — SGE" }] }),
});

const PIE_COLORS = [
  "oklch(0.62 0.20 285)",
  "oklch(0.66 0.15 230)",
  "oklch(0.65 0.16 155)",
  "oklch(0.72 0.16 60)",
  "oklch(0.60 0.18 20)",
  "oklch(0.70 0.12 320)",
];

function DashboardGeral() {
  const { data: movs = [], isLoading: l1 } = useQuery({
    queryKey: ["caixa"],
    queryFn: async () => {
      const { data, error } = await supabase.from("caixa_movimentacoes").select("*").order("data");
      if (error) throw error;
      return data as Mov[];
    },
  });
  const { data: contas = [], isLoading: l2 } = useQuery({
    queryKey: ["contas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contas_pagar").select("*").order("vencimento");
      if (error) throw error;
      return data as ContaPagar[];
    },
  });

  const months = useMemo(() => lastMonths(6), []);

  const { totals, evolucao, despesasCat, growth } = useMemo(() => {
    const evolucao = months.map((m) => {
      const met = computeMetrics(movs, contas, m.ini, m.fim);
      return { mes: m.label, receita: met.receita, despesa: met.despesas, lucro: met.lucro };
    });

    const ini = months[0].ini;
    const fim = months[months.length - 1].fim;
    const totals = computeMetrics(movs, contas, ini, fim);

    // Crescimento: receita mês atual vs mês anterior
    const cur = computeMetrics(movs, contas, months[5].ini, months[5].fim);
    const prev = computeMetrics(movs, contas, months[4].ini, months[4].fim);
    const growth = {
      receita: pctDiff(cur.receita, prev.receita),
      lucro: pctDiff(cur.lucro, prev.lucro),
      despesas: pctDiff(cur.despesas, prev.despesas),
    };

    // Distribuição de despesas por categoria (saídas do caixa no período)
    const map = new Map<string, number>();
    movs
      .filter((m) => m.tipo !== "entrada" && m.data >= ini && m.data <= fim)
      .forEach((m) => map.set(m.categoria, (map.get(m.categoria) ?? 0) + Number(m.valor)));
    const despesasCat = [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value], i) => ({ name, value, color: PIE_COLORS[i % PIE_COLORS.length] }));

    return { totals, evolucao, despesasCat, growth };
  }, [movs, contas, months]);

  if (l1 || l2) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Carregando indicadores...
      </div>
    );
  }

  const resumo = (() => {
    const recMax = [...evolucao].sort((a, b) => b.receita - a.receita)[0];
    const recMin = [...evolucao].sort((a, b) => a.receita - b.receita)[0];
    const lucMax = [...evolucao].sort((a, b) => b.lucro - a.lucro)[0];
    const lucMin = [...evolucao].sort((a, b) => a.lucro - b.lucro)[0];
    return [
      { l: "Maior receita", v: formatBRL(recMax?.receita ?? 0), t: recMax?.mes ?? "—" },
      { l: "Menor receita", v: formatBRL(recMin?.receita ?? 0), t: recMin?.mes ?? "—" },
      { l: "Maior lucro", v: formatBRL(lucMax?.lucro ?? 0), t: lucMax?.mes ?? "—" },
      { l: "Menor lucro", v: formatBRL(lucMin?.lucro ?? 0), t: lucMin?.mes ?? "—" },
      { l: "Margem média", v: `${totals.margem.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`, t: "6 meses" },
    ];
  })();

  return (
    <div className="space-y-8">
      {/* Top metric cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Receita Total" value={formatBRL(totals.receita)} delta={formatPct(growth.receita)}
          icon={DollarSign} gradient="bg-gradient-primary"
        />
        <MetricCard
          label="Lucro Líquido" value={formatBRL(totals.lucro)} delta={formatPct(growth.lucro)}
          icon={PiggyBank} gradient="bg-gradient-success"
        />
        <MetricCard
          label="Crescimento" value={formatPct(growth.receita)} delta="receita MoM"
          icon={BarChart3} gradient="bg-gradient-info"
        />
        <MetricCard
          label="Despesas" value={formatBRL(totals.despesas)} delta={formatPct(growth.despesas)}
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
              <p className="text-xs text-muted-foreground mt-1">Receita, despesas e lucro do Caixa</p>
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
                  formatter={(v: number) => formatBRL(v)}
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
          <p className="text-xs text-muted-foreground mt-1 mb-5">Indicadores dos últimos 6 meses</p>
          <div className="space-y-4">
            {resumo.map((s) => (
              <div key={s.l} className="flex items-center justify-between pb-3 border-b border-border last:border-0 last:pb-0">
                <div>
                  <div className="text-sm font-medium">{s.l}</div>
                  <div className="text-[11px] text-muted-foreground">{s.t}</div>
                </div>
                <div className="text-sm font-semibold">{s.v}</div>
              </div>
            ))}
            <div className="flex items-center justify-between pb-3">
              <div>
                <div className="text-sm font-medium">Contas pendentes</div>
                <div className="text-[11px] text-muted-foreground">{totals.contasPendentes} conta(s)</div>
              </div>
              <div className="text-sm font-semibold">{formatBRL(totals.contasPendentesValor)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Distribuição despesas */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl bg-card border border-border shadow-card p-6">
          <h3 className="text-base font-semibold">Distribuição de Despesas</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-5">Saídas do Caixa por categoria</p>
          {despesasCat.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center">
              Nenhuma despesa registrada no período.
            </p>
          ) : (
            <>
              <div className="relative h-56">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={despesasCat} dataKey="value" innerRadius={62} outerRadius={92}
                      paddingAngle={2} stroke="white" strokeWidth={3}>
                      {despesasCat.map((d) => <Cell key={d.name} fill={d.color} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "white", border: "1px solid oklch(0.93 0.005 270)", borderRadius: 12, fontSize: 12 }}
                      formatter={(v: number) => formatBRL(v)}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 grid place-items-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-lg font-bold">{formatBRL(totals.despesas)}</div>
                    <div className="text-[11px] text-muted-foreground">Total</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {despesasCat.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                      <span className="text-foreground/80">{d.name}</span>
                    </div>
                    <span className="font-medium">{formatBRL(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Fluxo / indicadores */}
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border shadow-card p-6">
          <h3 className="text-base font-semibold">Indicadores consolidados</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-5">Calculados em tempo real a partir do Caixa e Contas a Pagar</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { l: "Fluxo de Caixa", v: formatBRL(totals.fluxo) },
              { l: "Ticket Médio", v: formatBRL(totals.ticketMedio) },
              { l: "Margem Líquida", v: `${totals.margem.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%` },
              { l: "Entradas registradas", v: `${totals.qtdEntradas}` },
              { l: "Saídas registradas", v: `${totals.qtdSaidas}` },
              { l: "Contas pagas", v: `${totals.contasPagas} (${formatBRL(totals.contasPagasValor)})` },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{s.l}</div>
                <div className="mt-1 text-lg font-bold">{s.v}</div>
              </div>
            ))}
          </div>
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
    <div className={cn("relative overflow-hidden rounded-3xl p-6 text-white shadow-soft", gradient)}>
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-12 -left-6 h-28 w-28 rounded-full bg-white/5" />
      <div className="relative flex items-start justify-between">
        <div className="h-11 w-11 rounded-2xl bg-white/20 backdrop-blur grid place-items-center">
          <Icon className="h-5 w-5" />
        </div>
        <div className="h-8 w-8 rounded-full bg-white/15 grid place-items-center">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>
      <div className="relative mt-6">
        <div className="text-xs font-medium text-white/80 uppercase tracking-wide">{label}</div>
        <div className="mt-1 text-[26px] font-bold tracking-tight">{value}</div>
        <div className="mt-1 inline-flex items-center gap-1 text-xs text-white/90">
          {positiveDown ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
          {delta} vs mês anterior
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

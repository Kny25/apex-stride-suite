import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { TrendingUp, TrendingDown, Minus, GitCompareArrows, Loader2 } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  computeMetrics, formatBRL, formatPct, monthRange, pctDiff,
  type ContaPagar, type Mov, type PeriodMetrics,
} from "@/lib/empresario";

export const Route = createFileRoute("/_app/empresario/comparativos")({
  component: ComparativosPage,
  head: () => ({ meta: [{ title: "Filtros Comparativos — Empresário — SGE" }] }),
});

type Resultado = {
  a: PeriodMetrics;
  b: PeriodMetrics;
  rangeA: { ini: string; fim: string };
  rangeB: { ini: string; fim: string };
};

function fmtRange(r: { ini: string; fim: string }) {
  const f = (iso: string) => {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  };
  return `${f(r.ini)} – ${f(r.fim)}`;
}

function ComparativosPage() {
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

  const defA = useMemo(() => monthRange(0), []);
  const defB = useMemo(() => monthRange(-1), []);

  const [aIni, setAIni] = useState(defA.ini);
  const [aFim, setAFim] = useState(defA.fim);
  const [bIni, setBIni] = useState(defB.ini);
  const [bFim, setBFim] = useState(defB.fim);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const comparar = () => {
    if (!aIni || !aFim || !bIni || !bFim) {
      setErro("Preencha todas as datas dos dois períodos.");
      return;
    }
    if (aIni > aFim || bIni > bFim) {
      setErro("A data inicial não pode ser maior que a data final.");
      return;
    }
    setErro(null);
    setResultado({
      a: computeMetrics(movs, contas, aIni, aFim),
      b: computeMetrics(movs, contas, bIni, bFim),
      rangeA: { ini: aIni, fim: aFim },
      rangeB: { ini: bIni, fim: bFim },
    });
  };

  const linhas = resultado
    ? [
        { l: "Receita Total", a: resultado.a.receita, b: resultado.b.receita, money: true },
        { l: "Lucro Líquido", a: resultado.a.lucro, b: resultado.b.lucro, money: true },
        { l: "Despesas Operacionais", a: resultado.a.despesas, b: resultado.b.despesas, money: true, invert: true },
        { l: "Ticket Médio", a: resultado.a.ticketMedio, b: resultado.b.ticketMedio, money: true },
        { l: "Margem Líquida (%)", a: resultado.a.margem, b: resultado.b.margem, money: false },
        { l: "Fluxo de Caixa", a: resultado.a.fluxo, b: resultado.b.fluxo, money: true },
        { l: "Entradas", a: resultado.a.entradas, b: resultado.b.entradas, money: true },
        { l: "Saídas", a: resultado.a.saidas, b: resultado.b.saidas, money: true, invert: true },
        { l: "Contas Pagas", a: resultado.a.contasPagas, b: resultado.b.contasPagas, money: false },
        { l: "Contas Pendentes", a: resultado.a.contasPendentes, b: resultado.b.contasPendentes, money: false, invert: true },
      ]
    : [];

  const chartData = resultado
    ? [
        { nome: "Receita", A: resultado.a.receita, B: resultado.b.receita },
        { nome: "Despesas", A: resultado.a.despesas, B: resultado.b.despesas },
        { nome: "Lucro", A: resultado.a.lucro, B: resultado.b.lucro },
        { nome: "Fluxo", A: resultado.a.fluxo, B: resultado.b.fluxo },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="rounded-2xl bg-card border border-border shadow-card p-6">
        <div className="flex items-center gap-2 mb-1">
          <GitCompareArrows className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold">Filtros Comparativos</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-5">
          Compare os indicadores financeiros reais entre dois períodos. Os dados são calculados em tempo real a partir do Caixa e Contas a Pagar.
        </p>
        <div className="grid gap-5 md:grid-cols-2">
          <fieldset className="rounded-xl border border-border p-4">
            <legend className="px-2 text-xs font-semibold text-primary">Período A</legend>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[11px] text-muted-foreground">Data Inicial</Label>
                <Input type="date" value={aIni} onChange={(e) => setAIni(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-[11px] text-muted-foreground">Data Final</Label>
                <Input type="date" value={aFim} onChange={(e) => setAFim(e.target.value)} className="mt-1" />
              </div>
            </div>
          </fieldset>
          <fieldset className="rounded-xl border border-border p-4">
            <legend className="px-2 text-xs font-semibold text-muted-foreground">Período B</legend>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[11px] text-muted-foreground">Data Inicial</Label>
                <Input type="date" value={bIni} onChange={(e) => setBIni(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-[11px] text-muted-foreground">Data Final</Label>
                <Input type="date" value={bFim} onChange={(e) => setBFim(e.target.value)} className="mt-1" />
              </div>
            </div>
          </fieldset>
        </div>
        {erro && <p className="mt-3 text-sm text-destructive">{erro}</p>}
        <div className="mt-5">
          <Button onClick={comparar} disabled={l1 || l2} className="bg-gradient-primary text-primary-foreground shadow-glow">
            {(l1 || l2) && <Loader2 className="h-4 w-4 animate-spin" />}
            Comparar
          </Button>
        </div>
      </div>

      {!resultado ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          Selecione os dois períodos e clique em <span className="font-semibold text-foreground">Comparar</span> para ver os resultados.
        </div>
      ) : (
        <>
          {/* Cards resumo */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { l: "Receita Total", a: resultado.a.receita, b: resultado.b.receita },
              { l: "Lucro Líquido", a: resultado.a.lucro, b: resultado.b.lucro },
              { l: "Despesas", a: resultado.a.despesas, b: resultado.b.despesas, invert: true },
            ].map((c) => {
              const d = pctDiff(c.a, c.b);
              const good = d !== null && (c.invert ? d <= 0 : d >= 0);
              return (
                <div key={c.l} className="rounded-2xl bg-card border border-border shadow-card p-5">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">{c.l}</div>
                  <div className="mt-1.5 text-2xl font-bold">{formatBRL(c.a)}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Período B: {formatBRL(c.b)}</div>
                  <div className={cn(
                    "mt-2 inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5",
                    d === null ? "bg-muted text-muted-foreground" : good ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                  )}>
                    {d === null ? <Minus className="h-3 w-3" /> : d >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {formatPct(d)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gráfico comparativo */}
          <div className="rounded-2xl bg-card border border-border shadow-card p-6">
            <h3 className="text-base font-semibold mb-1">Comparativo visual</h3>
            <p className="text-xs text-muted-foreground mb-5">
              Período A ({fmtRange(resultado.rangeA)}) vs Período B ({fmtRange(resultado.rangeB)})
            </p>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ left: -10, right: 8, top: 8 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="oklch(0.93 0.005 270)" vertical={false} />
                  <XAxis dataKey="nome" stroke="oklch(0.50 0.02 264)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="oklch(0.50 0.02 264)" fontSize={11} tickLine={false} axisLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: "white", border: "1px solid oklch(0.93 0.005 270)", borderRadius: 12, fontSize: 12 }}
                    formatter={(v: number) => formatBRL(v)}
                  />
                  <Bar dataKey="A" name="Período A" fill="oklch(0.62 0.20 285)" radius={[6, 6, 0, 0]} maxBarSize={48} />
                  <Bar dataKey="B" name="Período B" fill="oklch(0.80 0.06 285)" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex items-center gap-5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: "oklch(0.62 0.20 285)" }} />Período A</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: "oklch(0.80 0.06 285)" }} />Período B</span>
            </div>
          </div>

          {/* Tabela completa */}
          <div className="rounded-2xl bg-card border border-border shadow-card p-6">
            <h3 className="text-base font-semibold mb-5">Comparação detalhada</h3>
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Indicador</th>
                    <th className="px-4 py-3 font-medium">Período A</th>
                    <th className="px-4 py-3 font-medium">Período B</th>
                    <th className="px-4 py-3 font-medium text-right">Variação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {linhas.map((r) => {
                    const d = pctDiff(r.a, r.b);
                    const good = d !== null && (r.invert ? d <= 0 : d >= 0);
                    const fmt = (v: number) =>
                      r.money ? formatBRL(v) : v.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
                    return (
                      <tr key={r.l} className="hover:bg-muted/30 transition">
                        <td className="px-4 py-3 font-medium">{r.l}</td>
                        <td className="px-4 py-3 text-foreground/80">{fmt(r.a)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{fmt(r.b)}</td>
                        <td className={cn(
                          "px-4 py-3 text-right font-semibold",
                          d === null ? "text-muted-foreground" : good ? "text-success" : "text-destructive"
                        )}>
                          <span className="inline-flex items-center gap-1">
                            {d === null ? <Minus className="h-3.5 w-3.5" /> : d >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                            {formatPct(d)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

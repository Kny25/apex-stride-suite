import type { Tables } from "@/integrations/supabase/types";

export type Mov = Tables<"caixa_movimentacoes">;
export type ContaPagar = Tables<"contas_pagar">;
export type Curso = Tables<"empresario_cursos">;

export const CATEGORIAS_CURSO = [
  "Gestão Financeira",
  "Gestão Comercial",
  "Gestão de Pessoas",
  "Marketing",
  "Liderança",
  "Produtividade",
  "Expansão Empresarial",
] as const;

export const NIVEIS_CURSO = ["Iniciante", "Intermediário", "Avançado"] as const;

export interface PeriodMetrics {
  receita: number;
  despesas: number;
  lucro: number;
  margem: number; // %
  ticketMedio: number;
  fluxo: number; // entradas - saídas
  entradas: number;
  saidas: number;
  qtdEntradas: number;
  qtdSaidas: number;
  contasPagas: number;
  contasPagasValor: number;
  contasPendentes: number;
  contasPendentesValor: number;
}

function inRange(d: string | null | undefined, ini: string, fim: string) {
  if (!d) return false;
  const iso = d.slice(0, 10);
  return iso >= ini && iso <= fim;
}

/**
 * Calcula todos os indicadores de um período a partir dos dados reais
 * do Caixa (caixa_movimentacoes) e Contas a Pagar (contas_pagar).
 */
export function computeMetrics(
  movs: Mov[],
  contas: ContaPagar[],
  ini: string,
  fim: string,
): PeriodMetrics {
  const periodMovs = movs.filter((m) => inRange(m.data, ini, fim));
  const ent = periodMovs.filter((m) => m.tipo === "entrada");
  const sai = periodMovs.filter((m) => m.tipo !== "entrada");

  const entradas = ent.reduce((s, m) => s + Number(m.valor), 0);
  const saidas = sai.reduce((s, m) => s + Number(m.valor), 0);

  const pagas = contas.filter(
    (c) => c.status === "pago" && inRange(c.data_pagamento ?? c.vencimento, ini, fim),
  );
  const pendentes = contas.filter(
    (c) => c.status !== "pago" && inRange(c.vencimento, ini, fim),
  );

  const receita = entradas;
  const despesas = saidas;
  const lucro = receita - despesas;

  return {
    receita,
    despesas,
    lucro,
    margem: receita > 0 ? (lucro / receita) * 100 : 0,
    ticketMedio: ent.length > 0 ? receita / ent.length : 0,
    fluxo: entradas - saidas,
    entradas,
    saidas,
    qtdEntradas: ent.length,
    qtdSaidas: sai.length,
    contasPagas: pagas.length,
    contasPagasValor: pagas.reduce((s, c) => s + Number(c.valor_pago ?? c.valor_previsto), 0),
    contasPendentes: pendentes.length,
    contasPendentesValor: pendentes.reduce((s, c) => s + Number(c.valor_previsto), 0),
  };
}

export function pctDiff(a: number, b: number): number | null {
  if (b === 0) return a === 0 ? 0 : null;
  return ((a - b) / Math.abs(b)) * 100;
}

export function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatPct(v: number | null) {
  if (v === null) return "—";
  const s = v >= 0 ? "+" : "";
  return `${s}${v.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}

/** Retorna { ini, fim, label } dos últimos N meses (incluindo o atual). */
export function lastMonths(n: number): { ini: string; fim: string; label: string; key: string }[] {
  const out: { ini: string; fim: string; label: string; key: string }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const ini = `${y}-${String(m + 1).padStart(2, "0")}-01`;
    const last = new Date(y, m + 1, 0).getDate();
    const fim = `${y}-${String(m + 1).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
    const label = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
    out.push({ ini, fim, label: label.charAt(0).toUpperCase() + label.slice(1), key: `${y}-${m + 1}` });
  }
  return out;
}

export function monthRange(offset: number): { ini: string; fim: string } {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const y = d.getFullYear();
  const m = d.getMonth();
  const last = new Date(y, m + 1, 0).getDate();
  return {
    ini: `${y}-${String(m + 1).padStart(2, "0")}-01`,
    fim: `${y}-${String(m + 1).padStart(2, "0")}-${String(last).padStart(2, "0")}`,
  };
}

import type { Tables } from "@/integrations/supabase/types";

export type Conta = Tables<"contas_pagar">;
export type Colaborador = Tables<"folha_pagamento">;
export type Movimentacao = Tables<"caixa_movimentacoes">;

export const FORMAS_PAGAMENTO = [
  "PIX",
  "Dinheiro",
  "Cartão de Crédito",
  "Cartão de Débito",
  "Transferência",
] as const;

export function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function todayISO() {
  return new Date().toLocaleDateString("en-CA");
}

export function contaStatus(c: Conta): "pendente" | "pago" | "atrasado" {
  if (c.status === "pago") return "pago";
  return c.vencimento < todayISO() ? "atrasado" : "pendente";
}

export function formatDateBR(iso: string | null | undefined) {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

export function addMonthsISO(iso: string, months: number) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  const total = (m - 1) + months;
  const year = y + Math.floor(total / 12);
  const month = (total % 12) + 1;
  const lastDay = new Date(year, month, 0).getDate();
  const day = Math.min(d, lastDay);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

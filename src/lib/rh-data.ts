import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Colaborador = Tables<"colaboradores">;
export type AtestadoRH = Tables<"rh_atestados">;
export type AusenciaRH = Tables<"rh_ausencias">;
export type DocumentoRH = Tables<"rh_documentos">;
export type CalculoRH = Tables<"rh_calculos">;
export type HistoricoRH = Tables<"rh_historico">;

export const SETORES = ["administrativo", "pedagogico", "comercial", "financeiro"] as const;
export type Sector = (typeof SETORES)[number];

export const sectorLabel: Record<Sector, string> = {
  administrativo: "Administrativo",
  pedagogico: "Pedagógico",
  comercial: "Comercial",
  financeiro: "Financeiro",
};

export const statusLabel: Record<string, string> = {
  ativo: "Ativo",
  ferias: "Férias",
  afastado: "Afastado",
  inativo: "Inativo",
  desligado: "Desligado",
};

export const statusStyle: Record<string, string> = {
  ativo: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ferias: "bg-blue-50 text-blue-700 border-blue-200",
  afastado: "bg-amber-50 text-amber-700 border-amber-200",
  inativo: "bg-zinc-100 text-zinc-600 border-zinc-200",
  desligado: "bg-rose-50 text-rose-700 border-rose-200",
};

export function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function calcEncargos(salarioBruto: number) {
  const fgts = salarioBruto * 0.08;
  const decimoTerceiro = salarioBruto / 12;
  const ferias = (salarioBruto + salarioBruto / 3) / 12;
  const total = fgts + decimoTerceiro + ferias;
  return { fgts, decimoTerceiro, ferias, total };
}

export function custoMensalTotal(salarioBruto: number) {
  return salarioBruto + calcEncargos(salarioBruto).total;
}

/* ============ Queries ============ */

export function useColaboradores() {
  return useQuery({
    queryKey: ["colaboradores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("colaboradores").select("*").eq("ativo", true).order("nome");
      if (error) throw error;
      return data;
    },
  });
}

export function useColaborador(id: string) {
  return useQuery({
    queryKey: ["colaboradores", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("colaboradores").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useAtestados(colaboradorId: string) {
  return useQuery({
    queryKey: ["rh_atestados", colaboradorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rh_atestados").select("*")
        .eq("colaborador_id", colaboradorId).eq("ativo", true)
        .order("inicio", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAtestadosAll() {
  return useQuery({
    queryKey: ["rh_atestados"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rh_atestados").select("colaborador_id, dias").eq("ativo", true);
      if (error) throw error;
      return data;
    },
  });
}

export function useAusencias(colaboradorId: string) {
  return useQuery({
    queryKey: ["rh_ausencias", colaboradorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rh_ausencias").select("*")
        .eq("colaborador_id", colaboradorId).eq("ativo", true)
        .order("data", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useDocumentos(colaboradorId: string) {
  return useQuery({
    queryKey: ["rh_documentos", colaboradorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rh_documentos").select("*")
        .eq("colaborador_id", colaboradorId).eq("ativo", true)
        .order("gerado_em", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCalculos(colaboradorId: string) {
  return useQuery({
    queryKey: ["rh_calculos", colaboradorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rh_calculos").select("*")
        .eq("colaborador_id", colaboradorId)
        .order("data_calculo", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useHistorico(colaboradorId: string) {
  return useQuery({
    queryKey: ["rh_historico", colaboradorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rh_historico").select("*")
        .eq("colaborador_id", colaboradorId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

/* ============ Auditoria / histórico ============ */

export async function logHistorico(entry: TablesInsert<"rh_historico">) {
  const { error } = await supabase.from("rh_historico").insert(entry);
  if (error) console.error("Erro ao registrar histórico:", error);
}

/* ============ Atestados helpers ============ */

export function totalAtestadoDias(atestados: { dias: number }[]) {
  return atestados.reduce((sum, a) => sum + a.dias, 0);
}

export function atestadoSituacao(used: number, limite: number): { label: string; tone: "ok" | "warn" | "danger" } {
  if (used > limite) return { label: "Ultrapassou os requisitos", tone: "danger" };
  if (used >= limite * 0.8) return { label: "Perto do limite", tone: "warn" };
  return { label: "Dentro dos requisitos", tone: "ok" };
}

/* ============ PDF ============ */

export function sanitizeFileName(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export async function gerarPDF(opts: {
  titulo: string;
  colaborador: Colaborador;
  paragrafos: string[];
  fileName: string;
}) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const margin = 20;
  const maxW = pageW - margin * 2;
  let y = 28;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(opts.titulo.toUpperCase(), pageW / 2, y, { align: "center" });
  y += 10;

  doc.setDrawColor(180);
  doc.line(margin, y, pageW - margin, y);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Colaborador: ${opts.colaborador.nome}`, margin, y); y += 6;
  doc.text(`Cargo: ${opts.colaborador.cargo}`, margin, y); y += 6;
  doc.text(`Admissão: ${new Date(opts.colaborador.admissao + "T12:00:00").toLocaleDateString("pt-BR")}`, margin, y);
  y += 12;

  for (const p of opts.paragrafos) {
    const lines = doc.splitTextToSize(p, maxW) as string[];
    if (y + lines.length * 6 > 250) { doc.addPage(); y = 28; }
    doc.text(lines, margin, y);
    y += lines.length * 6 + 4;
  }

  const sigY = Math.max(y + 30, 230);
  doc.setDrawColor(60);
  doc.line(margin, sigY, margin + 70, sigY);
  doc.line(pageW - margin - 70, sigY, pageW - margin, sigY);
  doc.setFontSize(9);
  doc.text("Assinatura do colaborador", margin + 35, sigY + 5, { align: "center" });
  doc.text("Assinatura da empresa", pageW - margin - 35, sigY + 5, { align: "center" });

  doc.setFontSize(9);
  doc.text(
    new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }),
    pageW - margin, sigY + 18, { align: "right" },
  );

  doc.save(opts.fileName);
}

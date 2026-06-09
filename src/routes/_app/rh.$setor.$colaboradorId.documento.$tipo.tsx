import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Printer, FileDown, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  useColaborador, brl, logHistorico, gerarPDF, sanitizeFileName, SETORES,
  type Colaborador,
} from "@/lib/rh-data";
import { toast } from "sonner";

const docTitles: Record<string, string> = {
  "vale-transporte": "Recibo de Vale Transporte",
  premiacao: "Recibo de Premiação",
  pagamento: "Recibo de Pagamento",
  "conta-salario": "Abertura Conta Salário",
  "folha-ponto": "Folha de Ponto",
  advertencia: "Advertência",
};

const docFilePrefix: Record<string, string> = {
  "vale-transporte": "ValeTransporte",
  premiacao: "Premiacao",
  pagamento: "ReciboPagamento",
  "conta-salario": "ContaSalario",
  "folha-ponto": "FolhaPonto",
  advertencia: "Advertencia",
};

export const Route = createFileRoute("/_app/rh/$setor/$colaboradorId/documento/$tipo")({
  beforeLoad: ({ params }) => {
    if (!docTitles[params.tipo]) throw notFound();
    if (!(SETORES as readonly string[]).includes(params.setor)) throw notFound();
  },
  component: DocumentoPage,
});

type Dia = { data: string; entrada: string; saida: string };

type FormState = {
  mes: string;
  valor: string;
  dias: string;
  motivo: string;
  punicao: string;
  bruto: string;
  desc: string;
  extras: string;
  banco: string;
  agencia: string;
  tipoConta: string;
  faltas: string;
  pontos: Dia[];
};

const emptyForm: FormState = {
  mes: "", valor: "", dias: "", motivo: "", punicao: "",
  bruto: "", desc: "", extras: "", banco: "", agencia: "", tipoConta: "",
  faltas: "0", pontos: [],
};

function fmtMes(m: string) {
  if (!m) return "—";
  const [y, mm] = m.split("-");
  return `${mm}/${y}`;
}

function fmtData(d: string) {
  return d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR") : "—";
}

/* Texto do documento (usado no PDF) */
function buildParagrafos(tipo: string, f: FormState, e: Colaborador): string[] {
  if (tipo === "vale-transporte") {
    return [
      `Eu, ${e.nome}, declaro ter recebido a quantia de ${brl(Number(f.valor) || 0)} referente ao Vale Transporte do mês ${fmtMes(f.mes)}, correspondente a ${f.dias || "0"} dias trabalhados.`,
    ];
  }
  if (tipo === "premiacao") {
    return [
      `Eu, ${e.nome}, declaro ter recebido a premiação no valor de ${brl(Number(f.valor) || 0)} referente ao mês ${fmtMes(f.mes)}.`,
      `Motivo: ${f.motivo || "—"}`,
    ];
  }
  if (tipo === "pagamento") {
    const bruto = Number(f.bruto) || 0;
    const desc = Number(f.desc) || 0;
    const extras = Number(f.extras) || 0;
    return [
      `Eu, ${e.nome}, declaro ter recebido o pagamento referente ao mês ${fmtMes(f.mes)}:`,
      `Salário bruto: ${brl(bruto)}`,
      `Horas extras: ${brl(extras)}`,
      `Total de descontos: - ${brl(desc)}`,
      `Valor líquido: ${brl(bruto + extras - desc)}`,
    ];
  }
  if (tipo === "conta-salario") {
    return [
      `Eu, ${e.nome}, autorizo a empresa a realizar a abertura de conta salário com os seguintes dados:`,
      `Banco: ${f.banco || "—"}`,
      `Agência: ${f.agencia || "—"}`,
      `Tipo de conta: ${f.tipoConta || "—"}`,
    ];
  }
  if (tipo === "folha-ponto") {
    const linhas = [
      `Folha de ponto referente ao mês ${fmtMes(f.mes)}. Faltas: ${f.faltas || "0"}.`,
    ];
    for (const d of f.pontos) {
      linhas.push(`${fmtData(d.data)} — Entrada: ${d.entrada || "—"} · Saída: ${d.saida || "—"}`);
    }
    return linhas;
  }
  if (tipo === "advertencia") {
    return [
      `O colaborador ${e.nome}, ocupante do cargo de ${e.cargo}, recebe a presente advertência:`,
      `Motivo: ${f.motivo || "—"}`,
      `Tipo de punição: ${f.punicao || "—"}`,
    ];
  }
  return [];
}

function DocumentoPage() {
  const { setor, colaboradorId, tipo } = Route.useParams();
  const { data: e, isLoading } = useColaborador(colaboradorId);
  const queryClient = useQueryClient();
  const title = docTitles[tipo];
  const [form, setForm] = useState<FormState>(emptyForm);
  const [busy, setBusy] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  if (isLoading) {
    return <div className="flex justify-center p-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (!e) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center">
        <p className="text-sm text-muted-foreground">Colaborador não encontrado.</p>
        <Link to="/rh/$setor" params={{ setor }} className="mt-4 inline-block text-sm text-primary">Voltar</Link>
      </div>
    );
  }

  const fileName = `${docFilePrefix[tipo]}_${sanitizeFileName(e.nome)}.pdf`;

  async function salvarRegistro() {
    if (!e) return null;
    const dados = { ...form, pontos: form.pontos } as unknown as Record<string, unknown>;
    const { data, error } = await supabase.from("rh_documentos").insert({
      colaborador_id: e.id,
      tipo,
      titulo: title,
      dados: dados as never,
      arquivo_nome: fileName,
      usuario: "Sistema",
    }).select().single();
    if (error) { toast.error("Erro ao salvar documento."); return null; }
    await logHistorico({
      colaborador_id: e.id, modulo: "Documentos",
      acao: `Documento gerado: ${title}`,
      descricao: `Arquivo ${fileName}`,
    });
    queryClient.invalidateQueries({ queryKey: ["rh_documentos", e.id] });
    queryClient.invalidateQueries({ queryKey: ["rh_historico", e.id] });
    return data;
  }

  async function gerar() {
    if (!e) return;
    setBusy(true);
    try {
      const reg = await salvarRegistro();
      if (!reg) return;
      await gerarPDF({ titulo: title, colaborador: e, paragrafos: buildParagrafos(tipo, form, e), fileName });
      toast.success(`Documento gerado e salvo: ${fileName}`);
    } finally {
      setBusy(false);
    }
  }

  async function gerarEImprimir() {
    if (!e) return;
    setBusy(true);
    try {
      const reg = await salvarRegistro();
      if (!reg) return;
      toast.success("Documento salvo. Abrindo impressão…");
      setTimeout(() => window.print(), 200);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Link to="/rh/$setor/$colaboradorId" params={{ setor, colaboradorId }} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground print:hidden">
        <ArrowLeft className="h-4 w-4" /> Voltar para o perfil
      </Link>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card print:hidden">
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Para: <span className="font-semibold text-foreground">{e.nome}</span></p>

          <div className="mt-5 space-y-4">
            {tipo === "vale-transporte" && (
              <>
                <Campo label="Mês de referência"><Input type="month" value={form.mes} onChange={(ev) => set("mes", ev.target.value)} /></Campo>
                <Campo label="Valor do VT (R$)"><Input type="number" value={form.valor} onChange={(ev) => set("valor", ev.target.value)} /></Campo>
                <Campo label="Dias trabalhados"><Input type="number" value={form.dias} onChange={(ev) => set("dias", ev.target.value)} /></Campo>
              </>
            )}
            {tipo === "premiacao" && (
              <>
                <Campo label="Mês de referência"><Input type="month" value={form.mes} onChange={(ev) => set("mes", ev.target.value)} /></Campo>
                <Campo label="Valor da premiação (R$)"><Input type="number" value={form.valor} onChange={(ev) => set("valor", ev.target.value)} /></Campo>
                <Campo label="Motivo da premiação"><Textarea rows={4} value={form.motivo} onChange={(ev) => set("motivo", ev.target.value)} /></Campo>
              </>
            )}
            {tipo === "pagamento" && (
              <>
                <Campo label="Mês de referência"><Input type="month" value={form.mes} onChange={(ev) => set("mes", ev.target.value)} /></Campo>
                <Campo label="Salário bruto (R$)"><Input type="number" value={form.bruto || String(e.salario_bruto)} onChange={(ev) => set("bruto", ev.target.value)} /></Campo>
                <Campo label="Total de descontos (R$)"><Input type="number" value={form.desc} onChange={(ev) => set("desc", ev.target.value)} /></Campo>
                <Campo label="Horas extras (R$)"><Input type="number" value={form.extras} onChange={(ev) => set("extras", ev.target.value)} /></Campo>
              </>
            )}
            {tipo === "conta-salario" && (
              <>
                <Campo label="Banco"><Input value={form.banco} onChange={(ev) => set("banco", ev.target.value)} /></Campo>
                <Campo label="Agência"><Input value={form.agencia} onChange={(ev) => set("agencia", ev.target.value)} /></Campo>
                <Campo label="Tipo de conta">
                  <Select value={form.tipoConta} onValueChange={(v) => set("tipoConta", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Conta Corrente">Conta Corrente</SelectItem>
                      <SelectItem value="Conta Poupança">Conta Poupança</SelectItem>
                      <SelectItem value="Conta Salário">Conta Salário</SelectItem>
                    </SelectContent>
                  </Select>
                </Campo>
              </>
            )}
            {tipo === "folha-ponto" && (
              <>
                <Campo label="Mês de referência"><Input type="month" value={form.mes} onChange={(ev) => set("mes", ev.target.value)} /></Campo>
                <Campo label="Faltas"><Input type="number" value={form.faltas} onChange={(ev) => set("faltas", ev.target.value)} /></Campo>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Registros de ponto (máx. 10)</Label>
                    <Button
                      type="button" variant="outline" size="sm"
                      onClick={() => form.pontos.length < 10 && set("pontos", [...form.pontos, { data: "", entrada: "", saida: "" }])}
                      disabled={form.pontos.length >= 10}
                    >
                      <Plus className="h-3.5 w-3.5" /> Adicionar Dia
                    </Button>
                  </div>
                  {form.pontos.map((d, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
                      <Input type="date" value={d.data} onChange={(ev) => set("pontos", form.pontos.map((x, j) => j === i ? { ...x, data: ev.target.value } : x))} />
                      <Input type="time" value={d.entrada} onChange={(ev) => set("pontos", form.pontos.map((x, j) => j === i ? { ...x, entrada: ev.target.value } : x))} />
                      <Input type="time" value={d.saida} onChange={(ev) => set("pontos", form.pontos.map((x, j) => j === i ? { ...x, saida: ev.target.value } : x))} />
                      <Button type="button" variant="ghost" size="icon" onClick={() => set("pontos", form.pontos.filter((_, j) => j !== i))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
            {tipo === "advertencia" && (
              <>
                <Campo label="Motivo da advertência"><Textarea rows={4} value={form.motivo} onChange={(ev) => set("motivo", ev.target.value)} placeholder="Descreva o motivo da advertência" /></Campo>
                <Campo label="Tipo de punição">
                  <Select value={form.punicao} onValueChange={(v) => set("punicao", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Advertência verbal">Advertência verbal</SelectItem>
                      <SelectItem value="Advertência escrita">Advertência escrita</SelectItem>
                      <SelectItem value="Suspensão">Suspensão</SelectItem>
                      <SelectItem value="Demissão por justa causa">Demissão por justa causa</SelectItem>
                    </SelectContent>
                  </Select>
                </Campo>
              </>
            )}

            <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
              <Button variant="outline" className="rounded-xl" onClick={gerar} disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />} Gerar Documento
              </Button>
              <Button className="rounded-xl" onClick={gerarEImprimir} disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />} Gerar e Imprimir
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              "Gerar Documento" baixa o PDF <strong>{fileName}</strong> e registra no histórico do colaborador.
            </p>
          </div>
        </div>

        {/* Preview / Printable */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-card print:border-0 print:shadow-none print:p-0" id="print-area">
          <div className="mx-auto max-w-2xl">
            <div className="border-b border-border pb-4">
              <h2 className="text-2xl font-bold uppercase tracking-wide">{title}</h2>
              <p className="mt-2 text-sm">Para: <strong>{e.nome}</strong></p>
              <p className="text-xs text-muted-foreground">{e.cargo} · Admissão: {fmtData(e.admissao)}</p>
            </div>
            <div className="mt-6 text-sm leading-relaxed">
              <DocPreview tipo={tipo} form={form} employee={e} />
            </div>
            <div className="mt-16 grid grid-cols-2 gap-8 text-center text-xs">
              <div><div className="border-t border-foreground pt-2">Assinatura do colaborador</div></div>
              <div><div className="border-t border-foreground pt-2">Assinatura da empresa</div></div>
            </div>
            <p className="mt-8 text-right text-xs text-muted-foreground">
              {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}

/* ============ PREVIEW ============ */
function DocPreview({ tipo, form, employee }: { tipo: string; form: FormState; employee: Colaborador }) {
  const e = employee;
  if (tipo === "vale-transporte") {
    return <p>Eu, <strong>{e.nome}</strong>, declaro ter recebido a quantia de <strong>{brl(Number(form.valor) || 0)}</strong> referente ao Vale Transporte do mês <strong>{fmtMes(form.mes)}</strong>, correspondente a <strong>{form.dias || "0"}</strong> dias trabalhados.</p>;
  }
  if (tipo === "premiacao") {
    return (
      <>
        <p>Eu, <strong>{e.nome}</strong>, declaro ter recebido a premiação no valor de <strong>{brl(Number(form.valor) || 0)}</strong> referente ao mês <strong>{fmtMes(form.mes)}</strong>.</p>
        <p className="mt-3"><strong>Motivo:</strong> {form.motivo || "—"}</p>
      </>
    );
  }
  if (tipo === "pagamento") {
    const bruto = Number(form.bruto || e.salario_bruto) || 0;
    const desc = Number(form.desc) || 0;
    const extras = Number(form.extras) || 0;
    return (
      <>
        <p>Eu, <strong>{e.nome}</strong>, declaro ter recebido o pagamento referente ao mês <strong>{fmtMes(form.mes)}</strong>:</p>
        <table className="mt-4 w-full border-collapse text-sm">
          <tbody>
            <tr><td className="border border-border px-3 py-2">Salário bruto</td><td className="border border-border px-3 py-2 text-right tabular-nums">{brl(bruto)}</td></tr>
            <tr><td className="border border-border px-3 py-2">Horas extras</td><td className="border border-border px-3 py-2 text-right tabular-nums">{brl(extras)}</td></tr>
            <tr><td className="border border-border px-3 py-2">Total de descontos</td><td className="border border-border px-3 py-2 text-right tabular-nums">- {brl(desc)}</td></tr>
            <tr className="font-semibold"><td className="border border-border px-3 py-2">Líquido</td><td className="border border-border px-3 py-2 text-right tabular-nums">{brl(bruto + extras - desc)}</td></tr>
          </tbody>
        </table>
      </>
    );
  }
  if (tipo === "conta-salario") {
    return (
      <>
        <p>Eu, <strong>{e.nome}</strong>, autorizo a empresa a realizar a abertura de conta salário com os seguintes dados:</p>
        <ul className="mt-3 space-y-1">
          <li><strong>Banco:</strong> {form.banco || "—"}</li>
          <li><strong>Agência:</strong> {form.agencia || "—"}</li>
          <li><strong>Tipo de conta:</strong> {form.tipoConta || "—"}</li>
        </ul>
      </>
    );
  }
  if (tipo === "folha-ponto") {
    return (
      <>
        <p>Folha de ponto referente ao mês <strong>{fmtMes(form.mes)}</strong>. Faltas: <strong>{form.faltas || "0"}</strong>.</p>
        {form.pontos.length > 0 && (
          <table className="mt-4 w-full border-collapse text-sm">
            <thead><tr className="bg-muted/50"><th className="border border-border px-3 py-2 text-left">Data</th><th className="border border-border px-3 py-2 text-left">Entrada</th><th className="border border-border px-3 py-2 text-left">Saída</th></tr></thead>
            <tbody>
              {form.pontos.map((d, i) => (
                <tr key={i}>
                  <td className="border border-border px-3 py-2">{fmtData(d.data)}</td>
                  <td className="border border-border px-3 py-2">{d.entrada || "—"}</td>
                  <td className="border border-border px-3 py-2">{d.saida || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </>
    );
  }
  if (tipo === "advertencia") {
    return (
      <>
        <p>O colaborador <strong>{e.nome}</strong>, ocupante do cargo de <strong>{e.cargo}</strong>, recebe a presente advertência:</p>
        <p className="mt-3"><strong>Motivo:</strong> {form.motivo || "—"}</p>
        <p className="mt-2"><strong>Tipo de punição:</strong> {form.punicao || "—"}</p>
      </>
    );
  }
  return null;
}

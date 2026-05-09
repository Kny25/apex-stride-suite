import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useSyncExternalStore } from "react";
import { ArrowLeft, Printer, FileDown, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useEmployee, type Sector } from "@/lib/rh-store";

const docTitles: Record<string, string> = {
  "vale-transporte": "Recibo de Vale Transporte",
  premiacao: "Recibo de Premiação",
  pagamento: "Recibo de Pagamento",
  "conta-salario": "Abertura Conta Salário",
  "folha-ponto": "Folha de Ponto",
  advertencia: "Advertência",
};

export const Route = createFileRoute("/_app/rh/$setor/$colaboradorId/documento/$tipo")({
  beforeLoad: ({ params }) => {
    if (!docTitles[params.tipo]) throw notFound();
    if (!["administrativo", "pedagogico", "comercial", "financeiro"].includes(params.setor)) throw notFound();
  },
  component: DocumentoPage,
});

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function DocumentoPage() {
  const { setor, colaboradorId, tipo } = Route.useParams();
  const sector = setor as Sector;
  const e = useEmployee(colaboradorId);
  const title = docTitles[tipo];
  const [generated, setGenerated] = useState(false);

  if (!e) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center">
        <p className="text-sm text-muted-foreground">Colaborador não encontrado.</p>
      </div>
    );
  }

  function gerar() { setGenerated(true); }
  function gerarEImprimir() { setGenerated(true); setTimeout(() => window.print(), 150); }

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
          <DocForm tipo={tipo} employee={e} onGenerate={gerar} onGeneratePrint={gerarEImprimir} />
        </div>

        {/* Preview / Printable */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-card print:border-0 print:shadow-none print:p-0" id="print-area">
          <div className="mx-auto max-w-2xl">
            <div className="border-b border-border pb-4">
              <h2 className="text-2xl font-bold uppercase tracking-wide">{title}</h2>
              <p className="mt-2 text-sm">Para: <strong>{e.nome}</strong></p>
              <p className="text-xs text-muted-foreground">{e.cargo} · Admissão: {new Date(e.admissao).toLocaleDateString("pt-BR")}</p>
            </div>
            <div className="mt-6 text-sm leading-relaxed">
              <DocPreview tipo={tipo} employee={e} />
            </div>
            <div className="mt-16 grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <div className="border-t border-foreground pt-2">Assinatura do colaborador</div>
              </div>
              <div>
                <div className="border-t border-foreground pt-2">Assinatura da empresa</div>
              </div>
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

/* ============ FORM ============ */
function DocForm({ tipo, employee, onGenerate, onGeneratePrint }: {
  tipo: string;
  employee: NonNullable<ReturnType<typeof useEmployee>>;
  onGenerate: () => void;
  onGeneratePrint: () => void;
}) {
  return (
    <div className="mt-5 space-y-4">
      {tipo === "vale-transporte" && <VTFields />}
      {tipo === "premiacao" && <PremiacaoFields />}
      {tipo === "pagamento" && <PagamentoFields salario={employee.salarioBruto} />}
      {tipo === "conta-salario" && <ContaFields />}
      {tipo === "folha-ponto" && <PontoFields />}
      {tipo === "advertencia" && <AdvertenciaFields />}

      <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
        <Button variant="outline" className="rounded-xl" onClick={onGenerate}>
          <FileDown className="h-4 w-4" /> Gerar Documento
        </Button>
        <Button className="rounded-xl" onClick={onGeneratePrint}>
          <Printer className="h-4 w-4" /> Gerar e Imprimir
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Use a opção "Salvar como PDF" no diálogo de impressão do navegador para gerar o PDF.
      </p>
    </div>
  );
}

// Field stores per type — use simple FormDataset via context? For brevity, share via window-scope module store
const formData: Record<string, Record<string, unknown>> = {};
function setFD(tipo: string, key: string, value: unknown) {
  formData[tipo] = { ...(formData[tipo] || {}), [key]: value };
}
function getFD<T>(tipo: string, key: string, fallback: T): T {
  return (formData[tipo]?.[key] as T) ?? fallback;
}

function useField<T>(tipo: string, key: string, init: T) {
  const [v, setV] = useState<T>(getFD(tipo, key, init));
  return [v, (nv: T) => { setV(nv); setFD(tipo, key, nv); }] as const;
}

/* Field groups */
function VTFields() {
  const [mes, setMes] = useField("vale-transporte", "mes", "");
  const [valor, setValor] = useField("vale-transporte", "valor", "");
  const [dias, setDias] = useField("vale-transporte", "dias", "");
  return (
    <>
      <div className="space-y-1.5"><Label>Mês de referência</Label><Input type="month" value={mes} onChange={(e) => setMes(e.target.value)} /></div>
      <div className="space-y-1.5"><Label>Valor do VT (R$)</Label><Input type="number" value={valor} onChange={(e) => setValor(e.target.value)} /></div>
      <div className="space-y-1.5"><Label>Dias trabalhados</Label><Input type="number" value={dias} onChange={(e) => setDias(e.target.value)} /></div>
    </>
  );
}
function PremiacaoFields() {
  const [mes, setMes] = useField("premiacao", "mes", "");
  const [valor, setValor] = useField("premiacao", "valor", "");
  const [motivo, setMotivo] = useField("premiacao", "motivo", "");
  return (
    <>
      <div className="space-y-1.5"><Label>Mês de referência</Label><Input type="month" value={mes} onChange={(e) => setMes(e.target.value)} /></div>
      <div className="space-y-1.5"><Label>Valor da premiação (R$)</Label><Input type="number" value={valor} onChange={(e) => setValor(e.target.value)} /></div>
      <div className="space-y-1.5"><Label>Motivo da premiação</Label><Textarea rows={4} value={motivo} onChange={(e) => setMotivo(e.target.value)} /></div>
    </>
  );
}
function PagamentoFields({ salario }: { salario: number }) {
  const [mes, setMes] = useField("pagamento", "mes", "");
  const [bruto, setBruto] = useField("pagamento", "bruto", String(salario));
  const [desc, setDesc] = useField("pagamento", "desc", "");
  const [extras, setExtras] = useField("pagamento", "extras", "");
  return (
    <>
      <div className="space-y-1.5"><Label>Mês de referência</Label><Input type="month" value={mes} onChange={(e) => setMes(e.target.value)} /></div>
      <div className="space-y-1.5"><Label>Salário bruto (R$)</Label><Input type="number" value={bruto} onChange={(e) => setBruto(e.target.value)} /></div>
      <div className="space-y-1.5"><Label>Total de descontos (R$)</Label><Input type="number" value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
      <div className="space-y-1.5"><Label>Horas extras (R$)</Label><Input type="number" value={extras} onChange={(e) => setExtras(e.target.value)} /></div>
    </>
  );
}
function ContaFields() {
  const [banco, setBanco] = useField("conta-salario", "banco", "");
  const [agencia, setAgencia] = useField("conta-salario", "agencia", "");
  const [tipo, setTipo] = useField("conta-salario", "tipo", "");
  return (
    <>
      <div className="space-y-1.5"><Label>Banco</Label><Input value={banco} onChange={(e) => setBanco(e.target.value)} /></div>
      <div className="space-y-1.5"><Label>Agência</Label><Input type="number" value={agencia} onChange={(e) => setAgencia(e.target.value)} /></div>
      <div className="space-y-1.5">
        <Label>Tipo de conta</Label>
        <Select value={tipo} onValueChange={setTipo}>
          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Conta Corrente">Conta Corrente</SelectItem>
            <SelectItem value="Conta Poupança">Conta Poupança</SelectItem>
            <SelectItem value="Conta Salário">Conta Salário</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
type Dia = { data: string; entrada: string; saida: string };
function PontoFields() {
  const [mes, setMes] = useField("folha-ponto", "mes", "");
  const [faltas, setFaltas] = useField("folha-ponto", "faltas", "0");
  const [dias, setDias] = useField<Dia[]>("folha-ponto", "dias", []);
  function add() {
    if (dias.length >= 10) return;
    setDias([...dias, { data: "", entrada: "", saida: "" }]);
  }
  function rm(i: number) { setDias(dias.filter((_, x) => x !== i)); }
  function upd(i: number, k: keyof Dia, v: string) {
    setDias(dias.map((d, x) => (x === i ? { ...d, [k]: v } : d)));
  }
  return (
    <>
      <div className="space-y-1.5"><Label>Mês de referência</Label><Input type="month" value={mes} onChange={(e) => setMes(e.target.value)} /></div>
      <div className="space-y-1.5"><Label>Faltas</Label><Input type="number" value={faltas} onChange={(e) => setFaltas(e.target.value)} /></div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Registros de ponto (máx. 10)</Label>
          <Button type="button" variant="outline" size="sm" onClick={add} disabled={dias.length >= 10}>
            <Plus className="h-3.5 w-3.5" /> Adicionar Dia
          </Button>
        </div>
        {dias.map((d, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
            <Input type="date" value={d.data} onChange={(e) => upd(i, "data", e.target.value)} />
            <Input type="time" value={d.entrada} onChange={(e) => upd(i, "entrada", e.target.value)} placeholder="Entrada" />
            <Input type="time" value={d.saida} onChange={(e) => upd(i, "saida", e.target.value)} placeholder="Saída" />
            <Button type="button" variant="ghost" size="icon" onClick={() => rm(i)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
      </div>
    </>
  );
}
function AdvertenciaFields() {
  const [motivo, setMotivo] = useField("advertencia", "motivo", "");
  const [punicao, setPunicao] = useField("advertencia", "punicao", "");
  return (
    <>
      <div className="space-y-1.5"><Label>Motivo da advertência</Label><Textarea rows={4} value={motivo} onChange={(e) => setMotivo(e.target.value)} /></div>
      <div className="space-y-1.5">
        <Label>Tipo de punição</Label>
        <Select value={punicao} onValueChange={setPunicao}>
          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Advertência verbal">Advertência verbal</SelectItem>
            <SelectItem value="Advertência escrita">Advertência escrita</SelectItem>
            <SelectItem value="Suspensão">Suspensão</SelectItem>
            <SelectItem value="Demissão por justa causa">Demissão por justa causa</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}

/* ============ PREVIEW ============ */
function DocPreview({ tipo, employee }: { tipo: string; employee: NonNullable<ReturnType<typeof useEmployee>> }) {
  const e = employee;
  if (tipo === "vale-transporte") {
    const mes = getFD<string>(tipo, "mes", "");
    const valor = Number(getFD<string>(tipo, "valor", "0"));
    const dias = getFD<string>(tipo, "dias", "0");
    return <p>Eu, <strong>{e.nome}</strong>, declaro ter recebido a quantia de <strong>{brl(valor)}</strong> referente ao Vale Transporte do mês <strong>{mes || "—"}</strong>, correspondente a <strong>{dias}</strong> dias trabalhados.</p>;
  }
  if (tipo === "premiacao") {
    const mes = getFD<string>(tipo, "mes", "");
    const valor = Number(getFD<string>(tipo, "valor", "0"));
    const motivo = getFD<string>(tipo, "motivo", "");
    return (
      <>
        <p>Eu, <strong>{e.nome}</strong>, declaro ter recebido a premiação no valor de <strong>{brl(valor)}</strong> referente ao mês <strong>{mes || "—"}</strong>.</p>
        <p className="mt-3"><strong>Motivo:</strong> {motivo || "—"}</p>
      </>
    );
  }
  if (tipo === "pagamento") {
    const mes = getFD<string>(tipo, "mes", "");
    const bruto = Number(getFD<string>(tipo, "bruto", "0"));
    const desc = Number(getFD<string>(tipo, "desc", "0"));
    const extras = Number(getFD<string>(tipo, "extras", "0"));
    const liquido = bruto + extras - desc;
    return (
      <>
        <p>Eu, <strong>{e.nome}</strong>, declaro ter recebido o pagamento referente ao mês <strong>{mes || "—"}</strong>:</p>
        <table className="mt-4 w-full border-collapse text-sm">
          <tbody>
            <tr><td className="border border-border px-3 py-2">Salário bruto</td><td className="border border-border px-3 py-2 text-right tabular-nums">{brl(bruto)}</td></tr>
            <tr><td className="border border-border px-3 py-2">Horas extras</td><td className="border border-border px-3 py-2 text-right tabular-nums">{brl(extras)}</td></tr>
            <tr><td className="border border-border px-3 py-2">Total de descontos</td><td className="border border-border px-3 py-2 text-right tabular-nums">- {brl(desc)}</td></tr>
            <tr className="font-semibold"><td className="border border-border px-3 py-2">Líquido</td><td className="border border-border px-3 py-2 text-right tabular-nums">{brl(liquido)}</td></tr>
          </tbody>
        </table>
      </>
    );
  }
  if (tipo === "conta-salario") {
    const banco = getFD<string>(tipo, "banco", "");
    const agencia = getFD<string>(tipo, "agencia", "");
    const tipoConta = getFD<string>(tipo, "tipo", "");
    return (
      <>
        <p>Eu, <strong>{e.nome}</strong>, autorizo a empresa a realizar a abertura de conta salário com os seguintes dados:</p>
        <ul className="mt-3 space-y-1">
          <li><strong>Banco:</strong> {banco || "—"}</li>
          <li><strong>Agência:</strong> {agencia || "—"}</li>
          <li><strong>Tipo de conta:</strong> {tipoConta || "—"}</li>
        </ul>
      </>
    );
  }
  if (tipo === "folha-ponto") {
    const mes = getFD<string>(tipo, "mes", "");
    const faltas = getFD<string>(tipo, "faltas", "0");
    const dias = getFD<Dia[]>(tipo, "dias", []);
    return (
      <>
        <p>Folha de ponto referente ao mês <strong>{mes || "—"}</strong>. Faltas: <strong>{faltas}</strong>.</p>
        {dias.length > 0 && (
          <table className="mt-4 w-full border-collapse text-sm">
            <thead><tr className="bg-muted/50"><th className="border border-border px-3 py-2 text-left">Data</th><th className="border border-border px-3 py-2 text-left">Entrada</th><th className="border border-border px-3 py-2 text-left">Saída</th></tr></thead>
            <tbody>
              {dias.map((d, i) => (
                <tr key={i}>
                  <td className="border border-border px-3 py-2">{d.data ? new Date(d.data).toLocaleDateString("pt-BR") : "—"}</td>
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
    const motivo = getFD<string>(tipo, "motivo", "");
    const punicao = getFD<string>(tipo, "punicao", "");
    return (
      <>
        <p>O colaborador <strong>{e.nome}</strong>, ocupante do cargo de <strong>{e.cargo}</strong>, recebe a presente advertência:</p>
        <p className="mt-3"><strong>Motivo:</strong> {motivo || "—"}</p>
        <p className="mt-2"><strong>Tipo de punição:</strong> {punicao || "—"}</p>
      </>
    );
  }
  return null;
}

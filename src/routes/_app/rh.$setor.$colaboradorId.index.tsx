import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Mail, Phone, Briefcase, CalendarClock, FileText, Activity,
  Calculator, FilePlus, Upload, AlertTriangle, ChevronRight, History,
  Loader2, Pencil, FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import {
  useColaborador, useAtestados, useAusencias, useCalculos, useHistorico, useDocumentos,
  totalAtestadoDias, atestadoSituacao, calcEncargos, custoMensalTotal,
  sectorLabel, statusLabel, statusStyle, brl, logHistorico, SETORES,
  type Sector, type Colaborador,
} from "@/lib/rh-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/rh/$setor/$colaboradorId/")({
  beforeLoad: ({ params }) => {
    if (!(SETORES as readonly string[]).includes(params.setor)) throw notFound();
  },
  component: ColaboradorPage,
});

const tabs = [
  { id: "atestado", label: "Controle de atestado", icon: FileText },
  { id: "frequencia", label: "Controle de frequência", icon: Activity },
  { id: "calculadora", label: "Calculadora de custos", icon: Calculator },
  { id: "documento", label: "Fazer documento", icon: FilePlus },
  { id: "historico", label: "Histórico Completo", icon: History },
] as const;
type TabId = (typeof tabs)[number]["id"];

function ColaboradorPage() {
  const { setor, colaboradorId } = Route.useParams();
  const sector = setor as Sector;
  const queryClient = useQueryClient();
  const { data: e, isLoading } = useColaborador(colaboradorId);
  const [tab, setTab] = useState<TabId>("atestado");
  const [editOpen, setEditOpen] = useState(false);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["colaboradores"] });
    queryClient.invalidateQueries({ queryKey: ["rh_historico", colaboradorId] });
  }

  async function mudarStatus(novo: string) {
    if (!e) return;
    const anterior = e.status;
    const patch: Partial<Colaborador> = { status: novo };
    if (novo === "desligado") patch.desligamento = new Date().toISOString().slice(0, 10);
    const { error } = await supabase.from("colaboradores").update(patch).eq("id", e.id);
    if (error) { toast.error("Erro ao alterar status."); return; }
    await logHistorico({
      colaborador_id: e.id, modulo: "Status", acao: "Alteração de status",
      valor_anterior: statusLabel[anterior] ?? anterior, valor_novo: statusLabel[novo] ?? novo,
    });
    invalidate();
    toast.success(`Status alterado para ${statusLabel[novo] ?? novo}.`);
  }

  async function salvarSalario(novo: number) {
    if (!e || novo === e.salario_bruto) return;
    const { error } = await supabase.from("colaboradores").update({ salario_bruto: novo }).eq("id", e.id);
    if (error) { toast.error("Erro ao salvar salário."); return; }
    await logHistorico({
      colaborador_id: e.id, modulo: "Cadastro", acao: "Alteração salarial",
      valor_anterior: brl(e.salario_bruto), valor_novo: brl(novo),
    });
    invalidate();
    toast.success("Salário atualizado.");
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

  const encargos = calcEncargos(e.salario_bruto);
  const custoTotal = custoMensalTotal(e.salario_bruto);

  return (
    <>
      <Link to="/rh/$setor" params={{ setor }} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {sectorLabel[sector]}
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary-soft text-primary text-lg font-semibold">
                {e.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{e.nome}</h1>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditOpen(true)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-0.5 text-sm font-medium text-muted-foreground">{e.cargo}</p>
              <div className="mt-3 grid grid-cols-1 gap-1.5 text-xs text-muted-foreground sm:grid-cols-2">
                <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {e.email || "—"}</span>
                <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {e.telefone || "—"}</span>
                <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> {sectorLabel[e.setor as Sector] ?? e.setor}</span>
                <span className="flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5" /> Admissão: {fmtDate(e.admissao)}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Select value={e.status} onValueChange={mudarStatus}>
              <SelectTrigger className={cn("h-9 w-36 rounded-full border font-medium", statusStyle[e.status])}>
                <SelectValue>{statusLabel[e.status] ?? e.status}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="ferias">Férias</SelectItem>
                <SelectItem value="afastado">Afastado</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="desligado">Desligado</SelectItem>
              </SelectContent>
            </Select>
            {e.desligamento && (
              <p className="text-xs text-muted-foreground">Desligamento: {fmtDate(e.desligamento)}</p>
            )}
          </div>
        </div>

        {/* Custos */}
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <SalarioCard salario={e.salario_bruto} onSave={salvarSalario} />
          <div className="rounded-xl border border-border bg-background/60 p-4">
            <p className="text-xs font-medium text-muted-foreground">Encargos mensais</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li className="flex justify-between"><span className="text-muted-foreground">FGTS (8%)</span><span className="tabular-nums">{brl(encargos.fgts)}</span></li>
              <li className="flex justify-between"><span className="text-muted-foreground">13º salário</span><span className="tabular-nums">{brl(encargos.decimoTerceiro)}</span></li>
              <li className="flex justify-between"><span className="text-muted-foreground">Férias</span><span className="tabular-nums">{brl(encargos.ferias)}</span></li>
              <li className="mt-1 flex justify-between border-t border-border pt-1.5 font-semibold"><span>Total</span><span className="tabular-nums">{brl(encargos.total)}</span></li>
            </ul>
          </div>
          <div className="rounded-xl border border-primary/30 bg-primary-soft p-4">
            <p className="text-xs font-medium text-primary">Custo mensal total</p>
            <p className="mt-2 text-3xl font-bold text-primary tabular-nums">{brl(custoTotal)}</p>
            <p className="mt-1 text-xs text-primary/80">Salário bruto + encargos</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 rounded-2xl border border-border bg-card shadow-card">
        <div className="flex flex-wrap gap-1 border-b border-border p-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
              )}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>
        <div className="p-6">
          {tab === "atestado" && <TabAtestado employee={e} />}
          {tab === "frequencia" && <TabFrequencia employee={e} />}
          {tab === "calculadora" && <TabCalculadora employee={e} />}
          {tab === "documento" && <TabDocumento setor={setor} employee={e} />}
          {tab === "historico" && <TabHistorico employee={e} />}
        </div>
      </div>

      <EditDialog open={editOpen} onOpenChange={setEditOpen} employee={e} onSaved={invalidate} />
    </>
  );
}

function fmtDate(d: string) {
  // Formata sem usar Date/timezone para evitar divergência entre servidor e cliente
  const iso = d.slice(0, 10);
  const [y, m, day] = iso.split("-");
  if (y && m && day) return `${day}/${m}/${y}`;
  return d;
}

/* ============ SALARIO ============ */
function SalarioCard({ salario, onSave }: { salario: number; onSave: (v: number) => void }) {
  const [val, setVal] = useState(String(salario));
  return (
    <div className="rounded-xl border border-border bg-background/60 p-4">
      <p className="text-xs font-medium text-muted-foreground">Salário bruto mensal</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-sm font-semibold text-muted-foreground">R$</span>
        <Input
          type="number"
          value={val}
          onChange={(ev) => setVal(ev.target.value)}
          onBlur={() => onSave(Number(val) || 0)}
          className="h-10 text-lg font-bold"
        />
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">Salvo automaticamente ao sair do campo.</p>
    </div>
  );
}

/* ============ EDIT CADASTRO ============ */
function EditDialog({ open, onOpenChange, employee, onSaved }: {
  open: boolean; onOpenChange: (v: boolean) => void; employee: Colaborador; onSaved: () => void;
}) {
  const e = employee;
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState({
    nome: e.nome, cargo: e.cargo, cpf: e.cpf ?? "", rg: e.rg ?? "",
    telefone: e.telefone ?? "", email: e.email ?? "", endereco: e.endereco ?? "",
    setor: e.setor, observacoes: e.observacoes ?? "",
  });

  async function salvar() {
    setSaving(true);
    const { error } = await supabase.from("colaboradores").update({
      nome: f.nome, cargo: f.cargo, cpf: f.cpf || null, rg: f.rg || null,
      telefone: f.telefone || null, email: f.email || null, endereco: f.endereco || null,
      setor: f.setor, observacoes: f.observacoes || null,
    }).eq("id", e.id);
    setSaving(false);
    if (error) { toast.error("Erro ao salvar cadastro."); return; }
    const mudancas: string[] = [];
    if (f.cargo !== e.cargo) {
      await logHistorico({ colaborador_id: e.id, modulo: "Cadastro", acao: "Alteração de cargo", valor_anterior: e.cargo, valor_novo: f.cargo });
    }
    if (f.nome !== e.nome) mudancas.push("nome");
    if (f.cpf !== (e.cpf ?? "")) mudancas.push("CPF");
    if (f.rg !== (e.rg ?? "")) mudancas.push("RG");
    if (f.telefone !== (e.telefone ?? "")) mudancas.push("telefone");
    if (f.email !== (e.email ?? "")) mudancas.push("e-mail");
    if (f.endereco !== (e.endereco ?? "")) mudancas.push("endereço");
    if (f.setor !== e.setor) mudancas.push("setor");
    if (f.observacoes !== (e.observacoes ?? "")) mudancas.push("observações");
    if (mudancas.length > 0) {
      await logHistorico({
        colaborador_id: e.id, modulo: "Cadastro", acao: "Alteração cadastral",
        descricao: `Campos alterados: ${mudancas.join(", ")}`,
      });
    }
    onSaved();
    toast.success("Cadastro atualizado.");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Editar cadastro</DialogTitle></DialogHeader>
        <div className="grid gap-3 max-h-[60vh] overflow-y-auto pr-1">
          <F label="Nome"><Input value={f.nome} onChange={(ev) => setF({ ...f, nome: ev.target.value })} /></F>
          <div className="grid grid-cols-2 gap-3">
            <F label="Cargo"><Input value={f.cargo} onChange={(ev) => setF({ ...f, cargo: ev.target.value })} /></F>
            <F label="Setor">
              <Select value={f.setor} onValueChange={(v) => setF({ ...f, setor: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SETORES.map((s) => <SelectItem key={s} value={s}>{sectorLabel[s]}</SelectItem>)}
                </SelectContent>
              </Select>
            </F>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <F label="CPF"><Input value={f.cpf} onChange={(ev) => setF({ ...f, cpf: ev.target.value })} /></F>
            <F label="RG"><Input value={f.rg} onChange={(ev) => setF({ ...f, rg: ev.target.value })} /></F>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <F label="Telefone"><Input value={f.telefone} onChange={(ev) => setF({ ...f, telefone: ev.target.value })} /></F>
            <F label="E-mail"><Input value={f.email} onChange={(ev) => setF({ ...f, email: ev.target.value })} /></F>
          </div>
          <F label="Endereço"><Input value={f.endereco} onChange={(ev) => setF({ ...f, endereco: ev.target.value })} /></F>
          <F label="Observações"><Textarea rows={3} value={f.observacoes} onChange={(ev) => setF({ ...f, observacoes: ev.target.value })} /></F>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={salvar} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}

/* ============ ATESTADO ============ */
function TabAtestado({ employee }: { employee: Colaborador }) {
  const e = employee;
  const queryClient = useQueryClient();
  const { data: atestados = [], isLoading } = useAtestados(e.id);
  const used = totalAtestadoDias(atestados);
  const restantes = Math.max(0, e.limite_atestados_dias - used);
  const sit = atestadoSituacao(used, e.limite_atestados_dias);
  const [form, setForm] = useState({ motivo: "", inicio: "", fim: "" });
  const [saving, setSaving] = useState(false);

  async function salvar() {
    if (!form.motivo || !form.inicio || !form.fim) {
      toast.error("Preencha motivo, início e fim.");
      return;
    }
    const dias = Math.max(1, Math.ceil((+new Date(form.fim) - +new Date(form.inicio)) / 86400000) + 1);
    setSaving(true);
    const { error } = await supabase.from("rh_atestados").insert({
      colaborador_id: e.id, motivo: form.motivo, inicio: form.inicio, fim: form.fim, dias,
    });
    setSaving(false);
    if (error) { toast.error("Erro ao registrar atestado."); return; }
    await logHistorico({
      colaborador_id: e.id, modulo: "Atestados", acao: "Atestado registrado",
      descricao: `${form.motivo} (${dias} ${dias === 1 ? "dia" : "dias"})`,
    });
    queryClient.invalidateQueries({ queryKey: ["rh_atestados"] });
    queryClient.invalidateQueries({ queryKey: ["rh_historico", e.id] });
    toast.success("Atestado registrado.");
    setForm({ motivo: "", inicio: "", fim: "" });
  }

  const sitTone = sit.tone === "danger" ? "bg-rose-100 text-rose-700 border-rose-200"
    : sit.tone === "warn" ? "bg-amber-100 text-amber-700 border-amber-200"
    : "bg-emerald-100 text-emerald-700 border-emerald-200";

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-background/60 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Resumo anual de atestados</p>
            <p className="text-xs text-muted-foreground">{e.nome}</p>
            <div className="mt-4 grid grid-cols-3 gap-6">
              <Stat label="Total de atestados" value={String(atestados.length)} />
              <Stat label="Dias usados" value={`${used} / ${e.limite_atestados_dias}`} />
              <Stat label="Dias restantes" value={String(restantes)} />
            </div>
          </div>
          <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold", sitTone)}>
            {sit.tone !== "ok" && <AlertTriangle className="h-3.5 w-3.5" />} {sit.label}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background/60 p-5">
        <p className="text-sm font-semibold">Registrar novo atestado</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2"><Label>Colaborador</Label><Input value={e.nome} disabled /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Motivo</Label><Input value={form.motivo} onChange={(ev) => setForm({ ...form, motivo: ev.target.value })} placeholder="Ex.: Consulta médica" /></div>
          <div className="space-y-1.5"><Label>Data de início</Label><Input type="date" value={form.inicio} onChange={(ev) => setForm({ ...form, inicio: ev.target.value })} /></div>
          <div className="space-y-1.5"><Label>Data final</Label><Input type="date" value={form.fim} onChange={(ev) => setForm({ ...form, fim: ev.target.value })} /></div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={salvar} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Registrar atestado
          </Button>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold">Histórico de atestados</p>
        {isLoading ? (
          <div className="flex justify-center p-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : atestados.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Nenhum atestado registrado.</p>
        ) : (
          <div className="space-y-2">
            {atestados.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background/60 p-4">
                <div>
                  <p className="text-sm font-medium">{a.motivo}</p>
                  <p className="text-xs text-muted-foreground">{e.nome}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{fmtDate(a.inicio)} → {fmtDate(a.fim)}</span>
                  <span className="rounded-full bg-primary-soft px-2.5 py-0.5 font-semibold text-primary">{a.dias} {a.dias === 1 ? "dia" : "dias"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

/* ============ FREQUENCIA / AUSENCIAS ============ */
const TIPOS_AUSENCIA = [
  "Falta", "Atestado", "Licença", "Férias", "Afastamento",
  "Acompanhamento de filho", "NR1", "Consulta médica", "Falta justificada", "Outro",
];

function TabFrequencia({ employee }: { employee: Colaborador }) {
  const e = employee;
  const queryClient = useQueryClient();
  const { data: ausencias = [], isLoading } = useAusencias(e.id);
  const [form, setForm] = useState({
    data: "", tipo: "", cid: "", motivo: "", duracao: "", unidade: "dias", comprovante: "",
  });
  const [erro, setErro] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function salvar() {
    if (!form.data || !form.tipo || !form.duracao) {
      setErro("Preencha data, tipo e duração da ausência.");
      return;
    }
    if (form.tipo === "Acompanhamento de filho" && !form.comprovante) {
      setErro("Acompanhamento de filho exige comprovante.");
      return;
    }
    if (form.tipo === "NR1" && !form.cid) {
      setErro("Ausência NR1 exige código CID.");
      return;
    }
    if (form.cid && form.cid.length < 3) {
      setErro("Código CID inválido.");
      return;
    }
    setErro(null);
    setSaving(true);
    const { error } = await supabase.from("rh_ausencias").insert({
      colaborador_id: e.id, data: form.data, tipo: form.tipo,
      cid: form.cid || null, motivo: form.motivo || null,
      duracao: Number(form.duracao), unidade: form.unidade,
      comprovante: form.comprovante || null,
    });
    setSaving(false);
    if (error) { toast.error("Erro ao registrar ausência."); return; }
    await logHistorico({
      colaborador_id: e.id, modulo: "Frequência", acao: "Ausência registrada",
      descricao: `${form.tipo} em ${fmtDate(form.data)} (${form.duracao} ${form.unidade})`,
    });
    queryClient.invalidateQueries({ queryKey: ["rh_ausencias", e.id] });
    queryClient.invalidateQueries({ queryKey: ["rh_historico", e.id] });
    toast.success("Ausência registrada.");
    setForm({ data: "", tipo: "", cid: "", motivo: "", duracao: "", unidade: "dias", comprovante: "" });
  }

  const acompFilho = ausencias.filter((a) => a.tipo === "Acompanhamento de filho").length;
  const nr1 = ausencias.filter((a) => a.tipo === "NR1").length;
  const faltas = ausencias.filter((a) => a.tipo === "Falta").length;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-background/60 p-5">
        <p className="text-sm font-semibold">Resumo anual de uso</p>
        <p className="text-xs text-muted-foreground">{e.nome}</p>
        <div className="mt-4 grid grid-cols-2 gap-6 sm:grid-cols-4">
          <Stat label="Total de registros" value={String(ausencias.length)} />
          <Stat label="Faltas" value={String(faltas)} />
          <Stat label="Acompanhamento de filho" value={String(acompFilho)} />
          <Stat label="NR1" value={String(nr1)} />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background/60 p-5">
        <p className="text-sm font-semibold">Adicionar nova ausência</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2"><Label>Colaborador</Label><Input value={e.nome} disabled /></div>
          <div className="space-y-1.5"><Label>Data da ausência</Label><Input type="date" value={form.data} onChange={(ev) => setForm({ ...form, data: ev.target.value })} /></div>
          <div className="space-y-1.5">
            <Label>Tipo da ausência</Label>
            <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {TIPOS_AUSENCIA.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Código CID</Label><Input value={form.cid} onChange={(ev) => setForm({ ...form, cid: ev.target.value })} placeholder="Ex.: J11.1" /></div>
          <div className="space-y-1.5">
            <Label>Duração</Label>
            <div className="flex gap-2">
              <Input type="number" min="1" value={form.duracao} onChange={(ev) => setForm({ ...form, duracao: ev.target.value })} />
              <Select value={form.unidade} onValueChange={(v) => setForm({ ...form, unidade: v })}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dias">Dias</SelectItem>
                  <SelectItem value="horas">Horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Motivo / justificativa</Label><Textarea rows={2} value={form.motivo} onChange={(ev) => setForm({ ...form, motivo: ev.target.value })} placeholder="Detalhe o motivo (opcional)" /></div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Comprovante</Label>
            <div className="flex items-center gap-2">
              <Input type="file" onChange={(ev) => setForm({ ...form, comprovante: ev.target.files?.[0]?.name ?? "" })} />
              {form.comprovante && <span className="text-xs text-muted-foreground"><Upload className="inline h-3 w-3" /> {form.comprovante}</span>}
            </div>
          </div>
        </div>
        {erro && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            <AlertTriangle className="h-4 w-4 shrink-0" /> {erro}
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <Button onClick={salvar} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Adicionar registro
          </Button>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold">Registro de ausência</p>
        {isLoading ? (
          <div className="flex justify-center p-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : ausencias.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Nenhuma ausência registrada.</p>
        ) : (
          <div className="space-y-2">
            {ausencias.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background/60 p-4">
                <div>
                  <p className="text-sm font-medium">{a.tipo}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.nome} · {fmtDate(a.data)} {a.cid && `· CID ${a.cid}`}
                    {a.motivo && ` · ${a.motivo}`}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {a.comprovante && <span className="inline-flex items-center gap-1"><Upload className="h-3 w-3" /> {a.comprovante}</span>}
                  <span className="rounded-full bg-primary-soft px-2.5 py-0.5 font-semibold text-primary">{Number(a.duracao)} {a.unidade}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============ CALCULADORA ============ */
function TabCalculadora({ employee }: { employee: Colaborador }) {
  const e = employee;
  const queryClient = useQueryClient();
  const { data: calculos = [] } = useCalculos(e.id);
  const [bruto, setBruto] = useState(String(e.salario_bruto));
  const [periodo, setPeriodo] = useState("30");
  const [unidade, setUnidade] = useState<"dias" | "meses">("dias");
  const [saving, setSaving] = useState(false);

  const result = useMemo(() => {
    const b = Number(bruto) || 0;
    const p = Number(periodo) || 0;
    const totalMensal = custoMensalTotal(b);
    const fator = unidade === "meses" ? p : p / 30;
    return { custo: totalMensal * fator, totalMensal, encargos: calcEncargos(b).total };
  }, [bruto, periodo, unidade]);

  async function salvarCalculo() {
    setSaving(true);
    const { error } = await supabase.from("rh_calculos").insert({
      colaborador_id: e.id,
      salario: Number(bruto) || 0,
      encargos: result.encargos,
      custo_total: result.custo,
      periodo: Number(periodo) || 0,
      unidade,
    });
    setSaving(false);
    if (error) { toast.error("Erro ao salvar cálculo."); return; }
    await logHistorico({
      colaborador_id: e.id, modulo: "Calculadora", acao: "Cálculo de custo salvo",
      descricao: `Custo de ${brl(result.custo)} para ${periodo} ${unidade}`,
    });
    queryClient.invalidateQueries({ queryKey: ["rh_calculos", e.id] });
    queryClient.invalidateQueries({ queryKey: ["rh_historico", e.id] });
    toast.success("Cálculo salvo.");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-background/60 p-6">
        <p className="text-sm font-semibold">Calculadora de custos</p>
        <p className="text-xs text-muted-foreground">Simule o custo de um colaborador por período trabalhado.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Salário bruto (R$)</Label>
            <Input type="number" value={bruto} onChange={(ev) => setBruto(ev.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Período trabalhado</Label>
            <div className="flex gap-2">
              <Input type="number" value={periodo} onChange={(ev) => setPeriodo(ev.target.value)} />
              <Select value={unidade} onValueChange={(v) => setUnidade(v as "dias" | "meses")}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dias">Dias</SelectItem>
                  <SelectItem value="meses">Meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground">Custo mensal total</p>
            <p className="mt-2 text-2xl font-bold tabular-nums">{brl(result.totalMensal)}</p>
          </div>
          <div className="rounded-xl border border-primary/30 bg-primary-soft p-4">
            <p className="text-xs font-medium text-primary">Custo no período</p>
            <p className="mt-2 text-2xl font-bold text-primary tabular-nums">{brl(result.custo)}</p>
            <p className="mt-1 text-xs text-primary/80">{periodo} {unidade}</p>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={salvarCalculo} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Salvar cálculo
          </Button>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold">Cálculos salvos</p>
        {calculos.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Nenhum cálculo salvo.</p>
        ) : (
          <div className="space-y-2">
            {calculos.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background/60 p-4">
                <div>
                  <p className="text-sm font-medium">{brl(Number(c.custo_total))} <span className="text-xs font-normal text-muted-foreground">para {Number(c.periodo)} {c.unidade}</span></p>
                  <p className="text-xs text-muted-foreground">Salário {brl(Number(c.salario))} · Encargos {brl(Number(c.encargos))}</p>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(c.data_calculo).toLocaleString("pt-BR")}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============ DOCUMENTO ============ */
const docTipos = [
  { tipo: "vale-transporte", title: "Recibo de vale-transporte" },
  { tipo: "premiacao", title: "Recibo de premiação" },
  { tipo: "pagamento", title: "Recibo de pagamento" },
  { tipo: "conta-salario", title: "Abertura de conta salário" },
  { tipo: "folha-ponto", title: "Folha de ponto" },
  { tipo: "advertencia", title: "Advertência" },
] as const;

function TabDocumento({ setor, employee }: { setor: string; employee: Colaborador }) {
  const { data: documentos = [] } = useDocumentos(employee.id);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold">Selecione o documento</p>
        <p className="text-xs text-muted-foreground">Cada documento abre em uma página própria, pronta para impressão e PDF.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {docTipos.map((d) => (
            <Link
              key={d.tipo}
              to="/rh/$setor/$colaboradorId/documento/$tipo"
              params={{ setor, colaboradorId: employee.id, tipo: d.tipo }}
              className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-background/60 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium">{d.title}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold">Documentos gerados</p>
        {documentos.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Nenhum documento gerado ainda.</p>
        ) : (
          <div className="space-y-2">
            {documentos.map((d) => (
              <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background/60 p-4">
                <div className="flex items-center gap-3">
                  <FileDown className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{d.titulo}</p>
                    <p className="text-xs text-muted-foreground">{d.arquivo_nome ?? "—"}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(d.gerado_em).toLocaleString("pt-BR")}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============ HISTORICO COMPLETO ============ */
function TabHistorico({ employee }: { employee: Colaborador }) {
  const { data: historico = [], isLoading } = useHistorico(employee.id);

  const moduloColor: Record<string, string> = {
    Cadastro: "bg-blue-50 text-blue-700 border-blue-200",
    Status: "bg-violet-50 text-violet-700 border-violet-200",
    Atestados: "bg-amber-50 text-amber-700 border-amber-200",
    "Frequência": "bg-emerald-50 text-emerald-700 border-emerald-200",
    Documentos: "bg-rose-50 text-rose-700 border-rose-200",
    Calculadora: "bg-cyan-50 text-cyan-700 border-cyan-200",
  };

  return (
    <div>
      <p className="text-sm font-semibold">Histórico Completo</p>
      <p className="text-xs text-muted-foreground">Toda movimentação do colaborador fica registrada permanentemente.</p>
      {isLoading ? (
        <div className="flex justify-center p-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : historico.length === 0 ? (
        <p className="mt-5 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Nenhum registro no histórico.</p>
      ) : (
        <div className="mt-5 space-y-2">
          {historico.map((h) => (
            <div key={h.id} className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border bg-background/60 p-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-medium", moduloColor[h.modulo] ?? "bg-muted text-muted-foreground border-border")}>
                    {h.modulo}
                  </span>
                  <p className="text-sm font-medium">{h.acao}</p>
                </div>
                {h.descricao && <p className="mt-1 text-xs text-muted-foreground">{h.descricao}</p>}
                {(h.valor_anterior || h.valor_novo) && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {h.valor_anterior && <>De: <span className="font-medium text-foreground">{h.valor_anterior}</span> </>}
                    {h.valor_novo && <>Para: <span className="font-medium text-foreground">{h.valor_novo}</span></>}
                  </p>
                )}
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>{new Date(h.created_at).toLocaleString("pt-BR")}</p>
                <p>{h.usuario}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

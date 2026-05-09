import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  ArrowLeft, Mail, Phone, Briefcase, CalendarClock, FileText, Activity,
  Calculator, FilePlus, Upload, AlertTriangle, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  useEmployee, updateEmployee, addAtestado, addAusencia, atestadoSituacao,
  totalAtestadoDias, calcEncargos, custoMensalTotal, sectorLabel, type Sector,
} from "@/lib/rh-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/rh/$setor/$colaboradorId/")({
  beforeLoad: ({ params }) => {
    if (!["administrativo", "pedagogico", "comercial", "financeiro"].includes(params.setor)) {
      throw notFound();
    }
  },
  component: ColaboradorPage,
});

const tabs = [
  { id: "atestado", label: "Controle de atestado", icon: FileText },
  { id: "frequencia", label: "Controle de frequência", icon: Activity },
  { id: "calculadora", label: "Calculadora de custos", icon: Calculator },
  { id: "documento", label: "Fazer documento", icon: FilePlus },
] as const;
type TabId = (typeof tabs)[number]["id"];

const statusStyle: Record<string, string> = {
  ativo: "bg-emerald-100 text-emerald-700 border-emerald-200",
  ferias: "bg-blue-100 text-blue-700 border-blue-200",
  inativo: "bg-zinc-100 text-zinc-600 border-zinc-200",
};
const statusLabel: Record<string, string> = { ativo: "Ativo", ferias: "Férias", inativo: "Inativo" };

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function ColaboradorPage() {
  const { setor, colaboradorId } = Route.useParams();
  const sector = setor as Sector;
  const e = useEmployee(colaboradorId);
  const [tab, setTab] = useState<TabId>("atestado");

  if (!e) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center">
        <p className="text-sm text-muted-foreground">Colaborador não encontrado.</p>
        <Link to="/rh/$setor" params={{ setor }} className="mt-4 inline-block text-sm text-primary">Voltar</Link>
      </div>
    );
  }

  const encargos = calcEncargos(e.salarioBruto);
  const custoTotal = custoMensalTotal(e.salarioBruto);

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
              <h1 className="text-2xl font-bold tracking-tight">{e.nome}</h1>
              <p className="mt-0.5 text-sm font-medium text-muted-foreground">{e.cargo}</p>
              <div className="mt-3 grid grid-cols-1 gap-1.5 text-xs text-muted-foreground sm:grid-cols-2">
                <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {e.email}</span>
                <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {e.telefone}</span>
                <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> {sectorLabel[e.sector]}</span>
                <span className="flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5" /> Admissão: {new Date(e.admissao).toLocaleDateString("pt-BR")}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Select value={e.status} onValueChange={(v) => updateEmployee(e.id, { status: v as typeof e.status })}>
              <SelectTrigger className={cn("h-9 w-32 rounded-full border font-medium", statusStyle[e.status])}>
                <SelectValue>{statusLabel[e.status]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="ferias">Férias</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Custos */}
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-background/60 p-4">
            <p className="text-xs font-medium text-muted-foreground">Salário bruto mensal</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm font-semibold text-muted-foreground">R$</span>
              <Input
                type="number"
                value={e.salarioBruto}
                onChange={(ev) => updateEmployee(e.id, { salarioBruto: Number(ev.target.value) || 0 })}
                className="h-10 text-lg font-bold"
              />
            </div>
          </div>
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
          {tab === "calculadora" && <TabCalculadora salarioBruto={e.salarioBruto} />}
          {tab === "documento" && <TabDocumento setor={setor} colaboradorId={e.id} />}
        </div>
      </div>
    </>
  );
}

/* ============ ATESTADO ============ */
function TabAtestado({ employee }: { employee: ReturnType<typeof useEmployee> & {} }) {
  const e = employee!;
  const used = totalAtestadoDias(e);
  const restantes = Math.max(0, e.limiteAtestadosDias - used);
  const sit = atestadoSituacao(e);
  const [form, setForm] = useState({ motivo: "", inicio: "", fim: "" });

  function salvar() {
    if (!form.motivo || !form.inicio || !form.fim) return;
    addAtestado(e.id, form);
    setForm({ motivo: "", inicio: "", fim: "" });
  }

  const sitTone = sit.tone === "danger" ? "bg-rose-100 text-rose-700 border-rose-200"
    : sit.tone === "warn" ? "bg-amber-100 text-amber-700 border-amber-200"
    : "bg-emerald-100 text-emerald-700 border-emerald-200";

  return (
    <div className="space-y-6">
      {/* Resumo anual */}
      <div className="rounded-xl border border-border bg-background/60 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Resumo anual de atestados</p>
            <p className="text-xs text-muted-foreground">{e.nome}</p>
            <div className="mt-4 grid grid-cols-3 gap-6">
              <Stat label="Total de atestados" value={String(e.atestados.length)} />
              <Stat label="Dias usados" value={`${used} / ${e.limiteAtestadosDias}`} />
              <Stat label="Dias restantes" value={String(restantes)} />
            </div>
          </div>
          <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold", sitTone)}>
            {sit.tone !== "ok" && <AlertTriangle className="h-3.5 w-3.5" />} {sit.label}
          </span>
        </div>
      </div>

      {/* Novo atestado */}
      <div className="rounded-xl border border-border bg-background/60 p-5">
        <p className="text-sm font-semibold">Registrar novo atestado</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2"><Label>Colaborador</Label><Input value={e.nome} disabled /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Motivo</Label><Input value={form.motivo} onChange={(ev) => setForm({ ...form, motivo: ev.target.value })} placeholder="Ex.: Consulta médica" /></div>
          <div className="space-y-1.5"><Label>Data de início</Label><Input type="date" value={form.inicio} onChange={(ev) => setForm({ ...form, inicio: ev.target.value })} /></div>
          <div className="space-y-1.5"><Label>Data final</Label><Input type="date" value={form.fim} onChange={(ev) => setForm({ ...form, fim: ev.target.value })} /></div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={salvar}>Registrar atestado</Button>
        </div>
      </div>

      {/* Histórico */}
      <div>
        <p className="mb-3 text-sm font-semibold">Histórico de atestados</p>
        {e.atestados.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Nenhum atestado registrado.</p>
        ) : (
          <div className="space-y-2">
            {e.atestados.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background/60 p-4">
                <div>
                  <p className="text-sm font-medium">{a.motivo}</p>
                  <p className="text-xs text-muted-foreground">{e.nome}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{new Date(a.inicio).toLocaleDateString("pt-BR")} → {new Date(a.fim).toLocaleDateString("pt-BR")}</span>
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

/* ============ FREQUENCIA ============ */
function TabFrequencia({ employee }: { employee: ReturnType<typeof useEmployee> & {} }) {
  const e = employee!;
  const [form, setForm] = useState({
    data: "", tipo: "", cid: "", duracao: "", unidade: "dias" as "dias" | "horas", comprovante: "",
  });
  const [erro, setErro] = useState<string | null>(null);

  function salvar() {
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
    addAusencia(e.id, {
      data: form.data, tipo: form.tipo, cid: form.cid,
      duracao: Number(form.duracao), unidade: form.unidade, comprovante: form.comprovante || undefined,
    });
    setForm({ data: "", tipo: "", cid: "", duracao: "", unidade: "dias", comprovante: "" });
  }

  const acompFilho = e.ausencias.filter((a) => a.tipo === "Acompanhamento de filho").length;
  const nr1 = e.ausencias.filter((a) => a.tipo === "NR1").length;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-background/60 p-5">
        <p className="text-sm font-semibold">Resumo anual de uso</p>
        <p className="text-xs text-muted-foreground">{e.nome}</p>
        <div className="mt-4 grid grid-cols-2 gap-6">
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
                <SelectItem value="Acompanhamento de filho">Acompanhamento de filho</SelectItem>
                <SelectItem value="NR1">NR1</SelectItem>
                <SelectItem value="Consulta médica">Consulta médica</SelectItem>
                <SelectItem value="Falta justificada">Falta justificada</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Código CID</Label><Input value={form.cid} onChange={(ev) => setForm({ ...form, cid: ev.target.value })} placeholder="Ex.: J11.1" /></div>
          <div className="space-y-1.5">
            <Label>Duração</Label>
            <div className="flex gap-2">
              <Input type="number" min="1" value={form.duracao} onChange={(ev) => setForm({ ...form, duracao: ev.target.value })} />
              <Select value={form.unidade} onValueChange={(v) => setForm({ ...form, unidade: v as "dias" | "horas" })}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dias">Dias</SelectItem>
                  <SelectItem value="horas">Horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
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
          <Button onClick={salvar}>Adicionar registro</Button>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold">Registro de ausência</p>
        {e.ausencias.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Nenhuma ausência registrada.</p>
        ) : (
          <div className="space-y-2">
            {e.ausencias.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background/60 p-4">
                <div>
                  <p className="text-sm font-medium">{a.tipo}</p>
                  <p className="text-xs text-muted-foreground">{e.nome} · {new Date(a.data).toLocaleDateString("pt-BR")} {a.cid && `· CID ${a.cid}`}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {a.comprovante && <span className="inline-flex items-center gap-1"><Upload className="h-3 w-3" /> {a.comprovante}</span>}
                  <span className="rounded-full bg-primary-soft px-2.5 py-0.5 font-semibold text-primary">{a.duracao} {a.unidade}</span>
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
function TabCalculadora({ salarioBruto }: { salarioBruto: number }) {
  const [bruto, setBruto] = useState(String(salarioBruto));
  const [periodo, setPeriodo] = useState("30");
  const [unidade, setUnidade] = useState<"dias" | "meses">("dias");

  const result = useMemo(() => {
    const b = Number(bruto) || 0;
    const p = Number(periodo) || 0;
    const totalMensal = custoMensalTotal(b);
    const fator = unidade === "meses" ? p : p / 30;
    return { custo: totalMensal * fator, totalMensal, fator };
  }, [bruto, periodo, unidade]);

  return (
    <div className="rounded-xl border border-border bg-background/60 p-6">
      <p className="text-sm font-semibold">Calculadora de custos</p>
      <p className="text-xs text-muted-foreground">Simule o custo de um colaborador por período trabalhado.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Salário bruto (R$)</Label>
          <Input type="number" value={bruto} onChange={(e) => setBruto(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Período trabalhado</Label>
          <div className="flex gap-2">
            <Input type="number" value={periodo} onChange={(e) => setPeriodo(e.target.value)} />
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

function TabDocumento({ setor, colaboradorId }: { setor: string; colaboradorId: string }) {
  return (
    <div>
      <p className="text-sm font-semibold">Selecione o documento</p>
      <p className="text-xs text-muted-foreground">Cada documento abre em uma página própria, pronta para impressão e PDF.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {docTipos.map((d) => (
          <Link
            key={d.tipo}
            to="/rh/$setor/$colaboradorId/documento/$tipo"
            params={{ setor, colaboradorId, tipo: d.tipo }}
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
  );
}

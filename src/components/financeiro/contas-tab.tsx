import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Clock, CheckCircle2, AlertTriangle, FileText, Plus, Eye, Pencil, Trash2, CircleDollarSign, Search,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  FORMAS_PAGAMENTO, addMonthsISO, contaStatus, formatBRL, formatDateBR, todayISO, type Conta,
} from "@/lib/financeiro";

function StatusBadge({ status }: { status: "pendente" | "pago" | "atrasado" }) {
  const map = {
    pendente: "bg-amber-100 text-amber-800",
    pago: "bg-emerald-100 text-emerald-800",
    atrasado: "bg-red-100 text-red-700",
  } as const;
  const label = { pendente: "Pendente", pago: "Pago", atrasado: "Atrasado" }[status];
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[status]}`}>{label}</span>;
}

type FormState = {
  descricao: string;
  fornecedor: string;
  categoria: string;
  tipo: string;
  valor_previsto: string;
  vencimento: string;
  observacoes: string;
  parcelada: boolean;
  parcelas: string;
};

const emptyForm: FormState = {
  descricao: "", fornecedor: "", categoria: "", tipo: "fixa",
  valor_previsto: "", vencimento: "", observacoes: "", parcelada: false, parcelas: "2",
};

export function ContasTab() {
  const qc = useQueryClient();
  const { data: contas = [], isLoading } = useQuery({
    queryKey: ["contas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contas_pagar").select("*").order("vencimento");
      if (error) throw error;
      return data as Conta[];
    },
  });

  const [q, setQ] = useState("");
  const [fStatus, setFStatus] = useState("todos");
  const [fCategoria, setFCategoria] = useState("todas");
  const [fFornecedor, setFFornecedor] = useState("todos");
  const [fVencimento, setFVencimento] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Conta | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [viewConta, setViewConta] = useState<Conta | null>(null);
  const [payConta, setPayConta] = useState<Conta | null>(null);
  const [payValor, setPayValor] = useState("");
  const [payData, setPayData] = useState(todayISO());
  const [payForma, setPayForma] = useState<string>("PIX");
  const [deleteConta, setDeleteConta] = useState<Conta | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["contas"] });
    qc.invalidateQueries({ queryKey: ["caixa"] });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const valor = parseFloat(form.valor_previsto.replace(",", "."));
      if (!form.descricao.trim() || !form.fornecedor.trim() || !form.categoria.trim() || !form.vencimento || isNaN(valor)) {
        throw new Error("Preencha todos os campos obrigatórios.");
      }
      const base = {
        descricao: form.descricao.trim(),
        fornecedor: form.fornecedor.trim(),
        categoria: form.categoria.trim(),
        tipo: form.tipo,
        valor_previsto: valor,
        vencimento: form.vencimento,
        observacoes: form.observacoes.trim() || null,
      };
      if (editing) {
        const { error } = await supabase.from("contas_pagar").update(base).eq("id", editing.id);
        if (error) throw error;
      } else if (form.parcelada && parseInt(form.parcelas) > 1) {
        const n = Math.min(Math.max(parseInt(form.parcelas), 2), 120);
        const grupo = crypto.randomUUID();
        const rows = Array.from({ length: n }, (_, i) => ({
          ...base,
          descricao: `${base.descricao} - Parcela ${i + 1}/${n}`,
          vencimento: addMonthsISO(form.vencimento, i),
          parcelada: true,
          parcela_numero: i + 1,
          parcela_total: n,
          grupo_parcelamento: grupo,
        }));
        const { error } = await supabase.from("contas_pagar").insert(rows);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("contas_pagar").insert(base);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      invalidate();
      setFormOpen(false);
      toast.success(editing ? "Conta atualizada!" : "Conta cadastrada!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const payMutation = useMutation({
    mutationFn: async () => {
      if (!payConta) return;
      const valor = parseFloat(payValor.replace(",", "."));
      if (isNaN(valor) || valor <= 0) throw new Error("Informe um valor válido.");
      const { error } = await supabase
        .from("contas_pagar")
        .update({ status: "pago", valor_pago: valor, data_pagamento: payData })
        .eq("id", payConta.id);
      if (error) throw error;
      const { error: e2 } = await supabase.from("caixa_movimentacoes").insert({
        tipo: "saida",
        descricao: `Pagamento de Conta - ${payConta.descricao}`,
        categoria: payConta.categoria,
        forma_pagamento: payForma,
        valor,
        data: payData,
        conta_id: payConta.id,
      });
      if (e2) throw e2;
    },
    onSuccess: () => {
      invalidate();
      setPayConta(null);
      toast.success("Conta marcada como paga e registrada no Caixa!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!deleteConta) return;
      const { error } = await supabase.from("contas_pagar").delete().eq("id", deleteConta.id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      setDeleteConta(null);
      toast.success("Conta excluída.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const categorias = useMemo(() => [...new Set(contas.map((c) => c.categoria))].sort(), [contas]);
  const fornecedores = useMemo(() => [...new Set(contas.map((c) => c.fornecedor))].sort(), [contas]);

  const filtered = useMemo(() => {
    return contas.filter((c) => {
      const st = contaStatus(c);
      if (fStatus !== "todos" && st !== fStatus) return false;
      if (fCategoria !== "todas" && c.categoria !== fCategoria) return false;
      if (fFornecedor !== "todos" && c.fornecedor !== fFornecedor) return false;
      if (fVencimento && c.vencimento !== fVencimento) return false;
      if (q) {
        const s = q.toLowerCase();
        if (!`${c.descricao} ${c.fornecedor} ${c.categoria}`.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [contas, q, fStatus, fCategoria, fFornecedor, fVencimento]);

  const totalPendente = contas.filter((c) => contaStatus(c) === "pendente").reduce((s, c) => s + Number(c.valor_previsto), 0);
  const totalPago = contas.filter((c) => contaStatus(c) === "pago").reduce((s, c) => s + Number(c.valor_pago ?? c.valor_previsto), 0);
  const totalAtrasado = contas.filter((c) => contaStatus(c) === "atrasado").reduce((s, c) => s + Number(c.valor_previsto), 0);

  const openNew = () => { setEditing(null); setForm(emptyForm); setFormOpen(true); };
  const openEdit = (c: Conta) => {
    setEditing(c);
    setForm({
      descricao: c.descricao, fornecedor: c.fornecedor, categoria: c.categoria, tipo: c.tipo,
      valor_previsto: String(c.valor_previsto), vencimento: c.vencimento,
      observacoes: c.observacoes ?? "", parcelada: c.parcelada, parcelas: String(c.parcela_total ?? 2),
    });
    setFormOpen(true);
  };
  const openPay = (c: Conta) => {
    setPayConta(c);
    setPayValor(String(c.valor_previsto));
    setPayData(todayISO());
    setPayForma("PIX");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Pendente", value: formatBRL(totalPendente), icon: Clock, color: "text-amber-600", bg: "bg-amber-100" },
          { label: "Total Pago", value: formatBRL(totalPago), icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100" },
          { label: "Total Atrasado", value: formatBRL(totalAtrasado), icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100" },
          { label: "Quantidade de Contas", value: String(contas.length), icon: FileText, color: "text-blue-600", bg: "bg-blue-100" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
                <p className="mt-2 text-2xl font-bold tracking-tight">{s.value}</p>
              </div>
              <div className={`h-10 w-10 rounded-xl ${s.bg} grid place-items-center`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-card">
        <div className="flex flex-col lg:flex-row gap-3 p-4 border-b border-border">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar conta..." className="pl-9" />
          </div>
          <Select value={fStatus} onValueChange={setFStatus}>
            <SelectTrigger className="w-full lg:w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos status</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="atrasado">Atrasado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={fCategoria} onValueChange={setFCategoria}>
            <SelectTrigger className="w-full lg:w-40"><SelectValue placeholder="Categoria" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas categorias</SelectItem>
              {categorias.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={fFornecedor} onValueChange={setFFornecedor}>
            <SelectTrigger className="w-full lg:w-40"><SelectValue placeholder="Fornecedor" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos fornecedores</SelectItem>
              {fornecedores.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="date" value={fVencimento} onChange={(e) => setFVencimento(e.target.value)} className="w-full lg:w-40" />
          <Button onClick={openNew} className="shrink-0">
            <Plus className="h-4 w-4 mr-1.5" />Nova Conta
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground">Nenhuma conta encontrada.</TableCell></TableRow>
              ) : (
                filtered.map((c) => {
                  const st = contaStatus(c);
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.descricao}</TableCell>
                      <TableCell>{c.fornecedor}</TableCell>
                      <TableCell>{c.categoria}</TableCell>
                      <TableCell className="capitalize">{c.tipo === "fixa" ? "Fixa" : "Variável"}</TableCell>
                      <TableCell>{formatDateBR(c.vencimento)}</TableCell>
                      <TableCell>{formatBRL(Number(st === "pago" ? c.valor_pago ?? c.valor_previsto : c.valor_previsto))}</TableCell>
                      <TableCell><StatusBadge status={st} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" title="Visualizar" onClick={() => setViewConta(c)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Editar" onClick={() => openEdit(c)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {st !== "pago" && (
                            <Button variant="ghost" size="icon" title="Marcar como Pago" className="text-emerald-600 hover:text-emerald-700" onClick={() => openPay(c)}>
                              <CircleDollarSign className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" title="Excluir" className="text-destructive hover:text-destructive" onClick={() => setDeleteConta(c)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Conta" : "Nova Conta"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label>Descrição *</Label>
              <Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} maxLength={200} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Fornecedor *</Label>
                <Input value={form.fornecedor} onChange={(e) => setForm({ ...form, fornecedor: e.target.value })} maxLength={120} />
              </div>
              <div className="grid gap-1.5">
                <Label>Categoria *</Label>
                <Input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} maxLength={80} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Tipo da Conta *</Label>
                <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixa">Conta Fixa</SelectItem>
                    <SelectItem value="variavel">Conta Variável</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Valor Previsto (R$) *</Label>
                <Input type="number" step="0.01" min="0" value={form.valor_previsto} onChange={(e) => setForm({ ...form, valor_previsto: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Data de Vencimento *</Label>
              <Input type="date" value={form.vencimento} onChange={(e) => setForm({ ...form, vencimento: e.target.value })} />
            </div>
            {!editing && (
              <div className="rounded-lg border border-border p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox id="parcelada" checked={form.parcelada} onCheckedChange={(v) => setForm({ ...form, parcelada: v === true })} />
                  <Label htmlFor="parcelada" className="cursor-pointer">Conta Parcelada</Label>
                </div>
                {form.parcelada && (
                  <div className="grid gap-1.5">
                    <Label>Quantidade de Parcelas</Label>
                    <Input type="number" min={2} max={120} value={form.parcelas} onChange={(e) => setForm({ ...form, parcelas: e.target.value })} />
                    <p className="text-xs text-muted-foreground">
                      Serão geradas {form.parcelas || "?"} contas com vencimentos mensais (Parcela 1/{form.parcelas || "?"} até {form.parcelas || "?"}/{form.parcelas || "?"}).
                    </p>
                  </div>
                )}
              </div>
            )}
            <div className="grid gap-1.5">
              <Label>Observações</Label>
              <Textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} maxLength={1000} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewConta} onOpenChange={(o) => !o && setViewConta(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Detalhes da Conta</DialogTitle></DialogHeader>
          {viewConta && (
            <div className="space-y-2 text-sm">
              {[
                ["Descrição", viewConta.descricao],
                ["Fornecedor", viewConta.fornecedor],
                ["Categoria", viewConta.categoria],
                ["Tipo", viewConta.tipo === "fixa" ? "Conta Fixa" : "Conta Variável"],
                ["Vencimento", formatDateBR(viewConta.vencimento)],
                ["Valor Previsto", formatBRL(Number(viewConta.valor_previsto))],
                ["Status", contaStatus(viewConta) === "pago" ? "Pago" : contaStatus(viewConta) === "atrasado" ? "Atrasado" : "Pendente"],
                ["Data do Pagamento", formatDateBR(viewConta.data_pagamento)],
                ["Valor Pago", viewConta.valor_pago != null ? formatBRL(Number(viewConta.valor_pago)) : "—"],
                ["Parcelamento", viewConta.parcelada ? `Parcela ${viewConta.parcela_numero}/${viewConta.parcela_total}` : "Não parcelada"],
                ["Observações", viewConta.observacoes || "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-border/60 pb-2">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-medium text-right">{v}</span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!payConta} onOpenChange={(o) => !o && setPayConta(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Marcar como Pago</DialogTitle></DialogHeader>
          {payConta && (
            <div className="grid gap-4">
              <p className="text-sm text-muted-foreground">{payConta.descricao} — {payConta.fornecedor}</p>
              <div className="grid gap-1.5">
                <Label>Valor Pago (R$)</Label>
                <Input type="number" step="0.01" min="0" value={payValor} onChange={(e) => setPayValor(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <Label>Data do Pagamento</Label>
                <Input type="date" value={payData} onChange={(e) => setPayData(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <Label>Forma de Pagamento</Label>
                <Select value={payForma} onValueChange={setPayForma}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FORMAS_PAGAMENTO.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                Uma movimentação de saída será criada automaticamente no Caixa.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayConta(null)}>Cancelar</Button>
            <Button onClick={() => payMutation.mutate()} disabled={payMutation.isPending}>
              {payMutation.isPending ? "Confirmando..." : "Confirmar Pagamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConta} onOpenChange={(o) => !o && setDeleteConta(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deleteConta?.descricao}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteMutation.mutate()}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

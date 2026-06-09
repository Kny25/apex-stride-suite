import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft, Plus, Search, CalendarIcon, Eye, Pencil, Trash2, Wallet,
  ArrowUpCircle, ArrowDownCircle, X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { FORMAS_PAGAMENTO, formatBRL, formatDateBR, todayISO, type Movimentacao } from "@/lib/financeiro";

export const Route = createFileRoute("/_app/financeiro/caixa")({
  component: CaixaPage,
  head: () => ({ meta: [{ title: "Caixa — SGE" }] }),
});

type FormState = {
  tipo: string;
  descricao: string;
  categoria: string;
  forma_pagamento: string;
  valor: string;
  data: string;
  observacao: string;
};

const emptyForm: FormState = {
  tipo: "entrada", descricao: "", categoria: "", forma_pagamento: "PIX",
  valor: "", data: todayISO(), observacao: "",
};

function CaixaPage() {
  const qc = useQueryClient();
  const { data: movs = [], isLoading } = useQuery({
    queryKey: ["caixa"],
    queryFn: async () => {
      const { data, error } = await supabase.from("caixa_movimentacoes").select("*").order("created_at");
      if (error) throw error;
      return data as Movimentacao[];
    },
  });

  const [q, setQ] = useState("");
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [calOpen, setCalOpen] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Movimentacao | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [view, setView] = useState<Movimentacao | null>(null);
  const [del, setDel] = useState<Movimentacao | null>(null);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const valor = parseFloat(form.valor.replace(",", "."));
      if (!form.descricao.trim() || !form.categoria.trim() || !form.data || isNaN(valor) || valor <= 0) {
        throw new Error("Preencha todos os campos obrigatórios com valores válidos.");
      }
      const row = {
        tipo: form.tipo,
        descricao: form.descricao.trim(),
        categoria: form.categoria.trim(),
        forma_pagamento: form.forma_pagamento,
        valor,
        data: form.data,
        observacao: form.observacao.trim() || null,
      };
      if (editing) {
        const { error } = await supabase.from("caixa_movimentacoes").update(row).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("caixa_movimentacoes").insert(row);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["caixa"] });
      setFormOpen(false);
      toast.success(editing ? "Movimentação atualizada!" : "Movimentação registrada!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!del) return;
      const { error } = await supabase.from("caixa_movimentacoes").delete().eq("id", del.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["caixa"] });
      setDel(null);
      toast.success("Movimentação excluída.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saldoAtual = movs.reduce((s, m) => s + (m.tipo === "entrada" ? Number(m.valor) : -Number(m.valor)), 0);

  const formasResumo = useMemo(() => {
    const totalGeral = movs.reduce((s, m) => s + Number(m.valor), 0);
    return FORMAS_PAGAMENTO.map((f) => {
      const total = movs.filter((m) => m.forma_pagamento === f).reduce((s, m) => s + Number(m.valor), 0);
      return { forma: f, total, pct: totalGeral > 0 ? (total / totalGeral) * 100 : 0 };
    });
  }, [movs]);

  const filtered = useMemo(() => {
    return movs.filter((m) => {
      if (dateFilter && m.data !== dateFilter) return false;
      if (q) {
        const s = q.toLowerCase();
        if (!`${m.descricao} ${m.categoria} ${m.forma_pagamento}`.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [movs, q, dateFilter]);

  const rows = useMemo(() => {
    let saldo = 0;
    return filtered.map((m) => {
      saldo += m.tipo === "entrada" ? Number(m.valor) : -Number(m.valor);
      return { mov: m, saldo };
    });
  }, [filtered]);

  const totalEntradas = filtered.filter((m) => m.tipo === "entrada").reduce((s, m) => s + Number(m.valor), 0);
  const totalSaidas = filtered.filter((m) => m.tipo === "saida").reduce((s, m) => s + Number(m.valor), 0);

  const openNew = () => { setEditing(null); setForm({ ...emptyForm, data: todayISO() }); setFormOpen(true); };
  const openEdit = (m: Movimentacao) => {
    setEditing(m);
    setForm({
      tipo: m.tipo, descricao: m.descricao, categoria: m.categoria,
      forma_pagamento: m.forma_pagamento, valor: String(m.valor), data: m.data,
      observacao: m.observacao ?? "",
    });
    setFormOpen(true);
  };

  const horario = (m: Movimentacao) =>
    new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <Link to="/financeiro" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-2">
            <ArrowLeft className="h-4 w-4" />Voltar ao Financeiro
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Caixa</h1>
          <p className="text-sm text-muted-foreground mt-1">Controle de movimentações financeiras</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1.5" />Nova Movimentação</Button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-card flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Saldo Atual</p>
          <p className={cn("mt-2 text-3xl font-bold tracking-tight", saldoAtual >= 0 ? "text-emerald-600" : "text-red-600")}>
            {formatBRL(saldoAtual)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Entradas − Saídas (geral)</p>
        </div>
        <div className="h-12 w-12 rounded-xl bg-emerald-100 grid place-items-center">
          <Wallet className="h-6 w-6 text-emerald-600" />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {formasResumo.map((f) => (
          <div key={f.forma} className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <p className="text-xs font-medium text-muted-foreground">{f.forma}</p>
            <p className="mt-1.5 text-lg font-bold tracking-tight">{formatBRL(f.total)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{f.pct.toFixed(1)}%</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-card">
        <div className="flex flex-col lg:flex-row gap-3 p-4 border-b border-border">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar movimentação..." className="pl-9" />
          </div>
          <Button
            variant={dateFilter === todayISO() ? "default" : "outline"}
            onClick={() => setDateFilter(dateFilter === todayISO() ? null : todayISO())}
          >
            Hoje
          </Button>
          <Popover open={calOpen} onOpenChange={setCalOpen}>
            <PopoverTrigger asChild>
              <Button variant={dateFilter && dateFilter !== todayISO() ? "default" : "outline"} className="justify-start">
                <CalendarIcon className="h-4 w-4 mr-1.5" />
                {dateFilter ? formatDateBR(dateFilter) : "Calendário"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                locale={ptBR}
                selected={dateFilter ? new Date(dateFilter + "T12:00:00") : undefined}
                onSelect={(d) => {
                  setDateFilter(d ? format(d, "yyyy-MM-dd") : null);
                  setCalOpen(false);
                }}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          {dateFilter && (
            <Button variant="ghost" size="icon" title="Limpar filtro de data" onClick={() => setDateFilter(null)}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Horário</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Forma de Pagamento</TableHead>
                <TableHead>Entrada</TableHead>
                <TableHead>Saída</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={9} className="text-center py-10 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : rows.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-10 text-muted-foreground">Nenhuma movimentação encontrada.</TableCell></TableRow>
              ) : (
                rows.map(({ mov: m, saldo }) => (
                  <TableRow key={m.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="text-sm font-medium">{horario(m)}</div>
                      <div className="text-xs text-muted-foreground">{formatDateBR(m.data)}</div>
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        m.tipo === "entrada" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-700"
                      )}>
                        {m.tipo === "entrada" ? <ArrowUpCircle className="h-3 w-3" /> : <ArrowDownCircle className="h-3 w-3" />}
                        {m.tipo === "entrada" ? "Entrada" : "Saída"}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium max-w-[240px] truncate">{m.descricao}</TableCell>
                    <TableCell>{m.categoria}</TableCell>
                    <TableCell>{m.forma_pagamento}</TableCell>
                    <TableCell className="text-emerald-600 font-medium">
                      {m.tipo === "entrada" ? formatBRL(Number(m.valor)) : "—"}
                    </TableCell>
                    <TableCell className="text-red-600 font-medium">
                      {m.tipo === "saida" ? formatBRL(Number(m.valor)) : "—"}
                    </TableCell>
                    <TableCell className={cn("font-semibold", saldo >= 0 ? "text-foreground" : "text-red-600")}>
                      {formatBRL(saldo)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" title="Visualizar" onClick={() => setView(m)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" title="Editar" onClick={() => openEdit(m)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" title="Excluir" className="text-destructive hover:text-destructive" onClick={() => setDel(m)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border-t border-border text-sm">
          <div>
            <p className="text-muted-foreground">Total de Movimentações</p>
            <p className="font-bold text-lg">{filtered.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total de Entradas</p>
            <p className="font-bold text-lg text-emerald-600">{formatBRL(totalEntradas)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total de Saídas</p>
            <p className="font-bold text-lg text-red-600">{formatBRL(totalSaidas)}</p>
          </div>
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Movimentação" : "Nova Movimentação"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label>Tipo *</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Descrição *</Label>
              <Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} maxLength={200} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Categoria *</Label>
                <Input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} maxLength={80} />
              </div>
              <div className="grid gap-1.5">
                <Label>Forma de Pagamento *</Label>
                <Select value={form.forma_pagamento} onValueChange={(v) => setForm({ ...form, forma_pagamento: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FORMAS_PAGAMENTO.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Valor (R$) *</Label>
                <Input type="number" step="0.01" min="0" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label>Data *</Label>
                <Input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Observação</Label>
              <Textarea value={form.observacao} onChange={(e) => setForm({ ...form, observacao: e.target.value })} maxLength={1000} rows={3} />
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

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Comprovante de Movimentação</DialogTitle></DialogHeader>
          {view && (
            <div className="space-y-2 text-sm">
              {[
                ["Data", formatDateBR(view.data)],
                ["Hora", horario(view)],
                ["Tipo", view.tipo === "entrada" ? "Entrada" : "Saída"],
                ["Valor", formatBRL(Number(view.valor))],
                ["Descrição", view.descricao],
                ["Categoria", view.categoria],
                ["Forma de Pagamento", view.forma_pagamento],
                ["Observação", view.observacao || "—"],
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

      <AlertDialog open={!!del} onOpenChange={(o) => !o && setDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir movimentação?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{del?.descricao}"? Esta ação não pode ser desfeita.
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

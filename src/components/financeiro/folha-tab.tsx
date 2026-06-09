import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Eye, Pencil, Trash2, CircleDollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatBRL, formatDateBR, todayISO, type Colaborador } from "@/lib/financeiro";

type FormState = {
  nome: string;
  cargo: string;
  salario: string;
  data_pagamento: string;
  observacoes: string;
};

const emptyForm: FormState = { nome: "", cargo: "", salario: "", data_pagamento: "", observacoes: "" };

export function FolhaTab() {
  const qc = useQueryClient();
  const { data: colaboradores = [], isLoading } = useQuery({
    queryKey: ["folha"],
    queryFn: async () => {
      const { data, error } = await supabase.from("folha_pagamento").select("*").order("nome");
      if (error) throw error;
      return data as Colaborador[];
    },
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Colaborador | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [view, setView] = useState<Colaborador | null>(null);
  const [del, setDel] = useState<Colaborador | null>(null);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const salario = parseFloat(form.salario.replace(",", "."));
      if (!form.nome.trim() || !form.cargo.trim() || !form.data_pagamento || isNaN(salario)) {
        throw new Error("Preencha todos os campos obrigatórios.");
      }
      const row = {
        nome: form.nome.trim(),
        cargo: form.cargo.trim(),
        salario,
        data_pagamento: form.data_pagamento,
        observacoes: form.observacoes.trim() || null,
      };
      if (editing) {
        const { error } = await supabase.from("folha_pagamento").update(row).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("folha_pagamento").insert(row);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["folha"] });
      setFormOpen(false);
      toast.success(editing ? "Colaborador atualizado!" : "Colaborador cadastrado!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const payMutation = useMutation({
    mutationFn: async (c: Colaborador) => {
      const novo = c.status === "pago" ? "pendente" : "pago";
      const { error } = await supabase.from("folha_pagamento").update({ status: novo }).eq("id", c.id);
      if (error) throw error;
      if (novo === "pago") {
        const { error: e2 } = await supabase.from("caixa_movimentacoes").insert({
          tipo: "saida",
          descricao: `Folha de Pagamento - ${c.nome}`,
          categoria: "Folha de Pagamento",
          forma_pagamento: "Transferência",
          valor: Number(c.salario),
          data: todayISO(),
        });
        if (e2) throw e2;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["folha"] });
      qc.invalidateQueries({ queryKey: ["caixa"] });
      toast.success("Status atualizado!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!del) return;
      const { error } = await supabase.from("folha_pagamento").delete().eq("id", del.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["folha"] });
      setDel(null);
      toast.success("Colaborador excluído.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openNew = () => { setEditing(null); setForm(emptyForm); setFormOpen(true); };
  const openEdit = (c: Colaborador) => {
    setEditing(c);
    setForm({
      nome: c.nome, cargo: c.cargo, salario: String(c.salario),
      data_pagamento: c.data_pagamento, observacoes: c.observacoes ?? "",
    });
    setFormOpen(true);
  };

  const totalFolha = colaboradores.reduce((s, c) => s + Number(c.salario), 0);
  const totalPendente = colaboradores.filter((c) => c.status !== "pago").reduce((s, c) => s + Number(c.salario), 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Colaboradores", value: String(colaboradores.length) },
          { label: "Total da Folha", value: formatBRL(totalFolha) },
          { label: "Pendente de Pagamento", value: formatBRL(totalPendente) },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-card">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold">Folha de Pagamento</h3>
          <Button onClick={openNew}><Plus className="h-4 w-4 mr-1.5" />Novo Colaborador</Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Salário</TableHead>
                <TableHead>Data de Pagamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : colaboradores.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Nenhum colaborador cadastrado.</TableCell></TableRow>
              ) : (
                colaboradores.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.nome}</TableCell>
                    <TableCell>{c.cargo}</TableCell>
                    <TableCell>{formatBRL(Number(c.salario))}</TableCell>
                    <TableCell>{formatDateBR(c.data_pagamento)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.status === "pago" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                        {c.status === "pago" ? "Pago" : "Pendente"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" title="Visualizar" onClick={() => setView(c)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" title="Editar" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" title={c.status === "pago" ? "Marcar Pendente" : "Marcar Pago"} className="text-emerald-600 hover:text-emerald-700" onClick={() => payMutation.mutate(c)}>
                          <CircleDollarSign className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Excluir" className="text-destructive hover:text-destructive" onClick={() => setDel(c)}>
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
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Editar Colaborador" : "Novo Colaborador"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label>Nome *</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} maxLength={120} />
            </div>
            <div className="grid gap-1.5">
              <Label>Cargo *</Label>
              <Input value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} maxLength={80} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Salário (R$) *</Label>
                <Input type="number" step="0.01" min="0" value={form.salario} onChange={(e) => setForm({ ...form, salario: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label>Data de Pagamento *</Label>
                <Input type="date" value={form.data_pagamento} onChange={(e) => setForm({ ...form, data_pagamento: e.target.value })} />
              </div>
            </div>
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

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Detalhes do Colaborador</DialogTitle></DialogHeader>
          {view && (
            <div className="space-y-2 text-sm">
              {[
                ["Nome", view.nome],
                ["Cargo", view.cargo],
                ["Salário", formatBRL(Number(view.salario))],
                ["Data de Pagamento", formatDateBR(view.data_pagamento)],
                ["Status", view.status === "pago" ? "Pago" : "Pendente"],
                ["Observações", view.observacoes || "—"],
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
            <AlertDialogTitle>Excluir colaborador?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{del?.nome}" da folha de pagamento?
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

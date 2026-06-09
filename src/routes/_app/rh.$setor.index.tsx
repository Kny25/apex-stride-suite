import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, ChevronRight, Mail, Phone, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import {
  useColaboradores, sectorLabel, statusLabel, statusStyle, logHistorico, SETORES, type Sector,
} from "@/lib/rh-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/rh/$setor/")({
  beforeLoad: ({ params }) => {
    if (!(SETORES as readonly string[]).includes(params.setor)) throw notFound();
  },
  component: SetorPage,
});

function SetorPage() {
  const { setor } = Route.useParams();
  const sector = setor as Sector;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: all = [], isLoading } = useColaboradores();
  const employees = all.filter((e) => e.setor === sector);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nome: "", cargo: "", cpf: "", email: "", telefone: "", admissao: "", salarioBruto: "" });

  async function save() {
    if (!form.nome || !form.cargo) {
      toast.error("Preencha pelo menos nome e cargo.");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("colaboradores")
      .insert({
        setor: sector,
        nome: form.nome,
        cargo: form.cargo,
        cpf: form.cpf || null,
        email: form.email || null,
        telefone: form.telefone || null,
        admissao: form.admissao || new Date().toISOString().slice(0, 10),
        salario_bruto: Number(form.salarioBruto) || 0,
      })
      .select()
      .single();
    setSaving(false);
    if (error || !data) {
      toast.error("Erro ao salvar colaborador.");
      return;
    }
    await logHistorico({
      colaborador_id: data.id,
      modulo: "Cadastro",
      acao: "Colaborador criado",
      descricao: `${data.nome} cadastrado no setor ${sectorLabel[sector]}`,
      valor_novo: data.nome,
    });
    queryClient.invalidateQueries({ queryKey: ["colaboradores"] });
    toast.success("Colaborador cadastrado.");
    setOpen(false);
    setForm({ nome: "", cargo: "", cpf: "", email: "", telefone: "", admissao: "", salarioBruto: "" });
    navigate({ to: "/rh/$setor/$colaboradorId", params: { setor, colaboradorId: data.id } });
  }

  return (
    <>
      <Link to="/rh" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar para RH
      </Link>

      <PageHeader
        title={sectorLabel[sector]}
        subtitle={`Colaboradores do setor ${sectorLabel[sector].toLowerCase()}.`}
        actions={
          <Button className="rounded-xl" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Adicionar novo colaborador
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : employees.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">Nenhum colaborador cadastrado neste setor.</p>
          <Button className="mt-4 rounded-xl" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Adicionar colaborador
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {employees.map((e, i) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                to="/rh/$setor/$colaboradorId"
                params={{ setor, colaboradorId: e.id }}
                className="group block rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-11 w-11">
                      <AvatarFallback className="bg-primary-soft text-primary text-sm font-semibold">
                        {e.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{e.nome}</p>
                      <p className="truncate text-xs text-muted-foreground">{e.cargo}</p>
                    </div>
                  </div>
                  <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium", statusStyle[e.status])}>
                    {statusLabel[e.status] ?? e.status}
                  </span>
                </div>
                <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {e.email || "—"}</p>
                  <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {e.telefone || "—"}</p>
                </div>
                <div className="mt-4 flex items-center justify-end text-xs text-primary">
                  Abrir perfil <ChevronRight className="h-3.5 w-3.5 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo colaborador — {sectorLabel[sector]}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Field label="Nome" value={form.nome} onChange={(v) => setForm({ ...form, nome: v })} placeholder="Nome completo" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Cargo" value={form.cargo} onChange={(v) => setForm({ ...form, cargo: v })} placeholder="Ex.: Analista" />
              <Field label="CPF" value={form.cpf} onChange={(v) => setForm({ ...form, cpf: v })} placeholder="000.000.000-00" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="email@empresa.com" />
              <Field label="Telefone" value={form.telefone} onChange={(v) => setForm({ ...form, telefone: v })} placeholder="(11) 99999-9999" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Data de admissão" type="date" value={form.admissao} onChange={(v) => setForm({ ...form, admissao: v })} />
              <Field label="Salário bruto (R$)" type="number" value={form.salarioBruto} onChange={(v) => setForm({ ...form, salarioBruto: v })} placeholder="0" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Plus, Search, Pencil, Trash2, GraduationCap, Clock, ExternalLink, Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { CATEGORIAS_CURSO, NIVEIS_CURSO, type Curso } from "@/lib/empresario";

export const Route = createFileRoute("/_app/empresario/cursos")({
  component: CursosPage,
  head: () => ({ meta: [{ title: "Cursos para o Empresário — SGE" }] }),
});

type FormState = {
  titulo: string;
  descricao: string;
  categoria: string;
  nivel: string;
  carga_horaria: string;
  link: string;
};

const emptyForm: FormState = {
  titulo: "", descricao: "", categoria: CATEGORIAS_CURSO[0],
  nivel: "Iniciante", carga_horaria: "", link: "",
};

function CursosPage() {
  const qc = useQueryClient();
  const { data: cursos = [], isLoading } = useQuery({
    queryKey: ["empresario_cursos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("empresario_cursos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Curso[];
    },
  });

  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("todas");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Curso | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [del, setDel] = useState<Curso | null>(null);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form.titulo.trim() || !form.categoria) {
        throw new Error("Informe pelo menos o título e a categoria.");
      }
      const row = {
        titulo: form.titulo.trim(),
        descricao: form.descricao.trim() || null,
        categoria: form.categoria,
        nivel: form.nivel,
        carga_horaria: form.carga_horaria.trim() || null,
        link: form.link.trim() || null,
      };
      if (editing) {
        const { error } = await supabase.from("empresario_cursos").update(row).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("empresario_cursos").insert(row);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["empresario_cursos"] });
      setFormOpen(false);
      toast.success(editing ? "Curso atualizado!" : "Curso cadastrado!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleMutation = useMutation({
    mutationFn: async (c: Curso) => {
      const { error } = await supabase.from("empresario_cursos").update({ ativo: !c.ativo }).eq("id", c.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["empresario_cursos"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!del) return;
      const { error } = await supabase.from("empresario_cursos").delete().eq("id", del.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["empresario_cursos"] });
      setDel(null);
      toast.success("Curso excluído.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return cursos.filter((c) => {
      if (cat !== "todas" && c.categoria !== cat) return false;
      if (term && !`${c.titulo} ${c.descricao ?? ""} ${c.categoria}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [cursos, q, cat]);

  const openNew = () => { setEditing(null); setForm(emptyForm); setFormOpen(true); };
  const openEdit = (c: Curso) => {
    setEditing(c);
    setForm({
      titulo: c.titulo, descricao: c.descricao ?? "", categoria: c.categoria,
      nivel: c.nivel, carga_horaria: c.carga_horaria ?? "", link: c.link ?? "",
    });
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar curso..." className="pl-9" />
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as categorias</SelectItem>
            {CATEGORIAS_CURSO.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={openNew} className="bg-gradient-primary text-primary-foreground shadow-glow sm:ml-auto">
          <Plus className="h-4 w-4" /> Adicionar curso
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" /> Carregando cursos...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <GraduationCap className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {cursos.length === 0
              ? "Nenhum curso cadastrado ainda. Clique em \"Adicionar curso\" para começar."
              : "Nenhum curso encontrado com os filtros aplicados."}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <div key={c.id} className={cn(
              "rounded-2xl border border-border bg-card shadow-card p-5 flex flex-col transition",
              !c.ativo && "opacity-60"
            )}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="inline-flex items-center rounded-full bg-primary-soft text-primary px-2.5 py-0.5 text-[11px] font-semibold border border-primary/15">
                  {c.categoria}
                </span>
                <span className={cn(
                  "text-[11px] font-semibold rounded-full px-2 py-0.5",
                  c.ativo ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                )}>
                  {c.ativo ? "Ativo" : "Inativo"}
                </span>
              </div>
              <h4 className="font-semibold text-[15px] leading-snug">{c.titulo}</h4>
              {c.descricao && <p className="mt-1.5 text-xs text-muted-foreground line-clamp-3">{c.descricao}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                <span>Nível: <span className="font-medium text-foreground/80">{c.nivel}</span></span>
                {c.carga_horaria && (
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{c.carga_horaria}</span>
                )}
                <span>Cadastro: {new Date(c.created_at).toLocaleDateString("pt-BR")}</span>
              </div>
              <div className="mt-4 pt-3 border-t border-border flex items-center gap-2">
                {c.link && (
                  <a href={c.link} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                    <ExternalLink className="h-3.5 w-3.5" /> Acessar
                  </a>
                )}
                <div className="ml-auto flex items-center gap-1.5">
                  <Switch checked={c.ativo} onCheckedChange={() => toggleMutation.mutate(c)} />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDel(c)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar curso" : "Adicionar curso"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} className="mt-1" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Categoria *</Label>
                <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS_CURSO.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nível</Label>
                <Select value={form.nivel} onValueChange={(v) => setForm({ ...form, nivel: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {NIVEIS_CURSO.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Carga horária</Label>
                <Input value={form.carga_horaria} onChange={(e) => setForm({ ...form, carga_horaria: e.target.value })} placeholder="Ex: 8h" className="mt-1" />
              </div>
              <div>
                <Label>Link</Label>
                <Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://..." className="mt-1" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? "Salvar alterações" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!del} onOpenChange={(o) => !o && setDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir curso?</AlertDialogTitle>
            <AlertDialogDescription>
              O curso "{del?.titulo}" será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

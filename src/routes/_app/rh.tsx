import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CalendarClock,
  UserCheck,
  Plane,
  FileWarning,
  Cake,
  Search,
  Plus,
  Briefcase,
  GraduationCap,
  TrendingUp,
  Wallet,
  Mail,
  Phone,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/app/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/rh")({
  component: RHPage,
  head: () => ({ meta: [{ title: "Recursos Humanos — SGE" }] }),
});

type AlertTone = "red" | "orange" | "blue" | "green";
const toneStyle: Record<AlertTone, string> = {
  red: "bg-rose-50 border-rose-200 text-rose-700",
  orange: "bg-amber-50 border-amber-200 text-amber-700",
  blue: "bg-blue-50 border-blue-200 text-blue-700",
  green: "bg-emerald-50 border-emerald-200 text-emerald-700",
};

const alerts: { icon: LucideIcon; title: string; desc: string; tone: AlertTone }[] = [
  { icon: AlertTriangle, title: "Atestados próximos do limite", desc: "3 colaboradores atingiram 80% do limite anual.", tone: "red" },
  { icon: CalendarClock, title: "Folha de pagamento", desc: "Fechamento em 4 dias — R$ 248.430,00 previstos.", tone: "orange" },
  { icon: UserCheck, title: "Período de experiência", desc: "5 colaboradores em avaliação dos 90 dias.", tone: "blue" },
  { icon: Plane, title: "Férias próximas", desc: "7 colaboradores iniciam férias nos próximos 30 dias.", tone: "blue" },
  { icon: FileWarning, title: "Documentos vencendo", desc: "12 documentos exigem renovação este mês.", tone: "orange" },
  { icon: Cake, title: "Aniversariantes do mês", desc: "9 colaboradores celebram em maio.", tone: "green" },
];

type Dept = "Administrativo" | "Pedagógico" | "Comercial" | "Financeiro";
const departments: { name: Dept; icon: LucideIcon; color: string }[] = [
  { name: "Administrativo", icon: Briefcase, color: "from-blue-500 to-indigo-500" },
  { name: "Pedagógico", icon: GraduationCap, color: "from-violet-500 to-purple-500" },
  { name: "Comercial", icon: TrendingUp, color: "from-emerald-500 to-teal-500" },
  { name: "Financeiro", icon: Wallet, color: "from-amber-500 to-orange-500" },
];

type Employee = {
  id: string;
  name: string;
  role: string;
  department: Dept;
  status: "ativo" | "experiência" | "férias" | "inativo";
  phone: string;
  email: string;
  admission: string;
  salary: number;
  documents: number;
  attendance: number;
};

const employees: Employee[] = [
  { id: "1", name: "Ana Carolina Souza", role: "Coordenadora Pedagógica", department: "Pedagógico", status: "ativo", phone: "(11) 98765-1010", email: "ana.souza@sge.com", admission: "2021-03-15", salary: 8500, documents: 12, attendance: 98 },
  { id: "2", name: "Bruno Henrique Lima", role: "Analista Financeiro", department: "Financeiro", status: "ativo", phone: "(11) 98765-2020", email: "bruno.lima@sge.com", admission: "2022-08-01", salary: 6200, documents: 10, attendance: 95 },
  { id: "3", name: "Carla Mendes", role: "Assistente Administrativo", department: "Administrativo", status: "experiência", phone: "(11) 98765-3030", email: "carla.mendes@sge.com", admission: "2026-02-10", salary: 3800, documents: 8, attendance: 100 },
  { id: "4", name: "Diego Ferreira", role: "Executivo Comercial", department: "Comercial", status: "ativo", phone: "(11) 98765-4040", email: "diego.f@sge.com", admission: "2020-11-20", salary: 7400, documents: 11, attendance: 92 },
  { id: "5", name: "Elaine Cardoso", role: "Professora", department: "Pedagógico", status: "férias", phone: "(11) 98765-5050", email: "elaine.c@sge.com", admission: "2019-05-08", salary: 5600, documents: 9, attendance: 97 },
  { id: "6", name: "Felipe Araújo", role: "Gerente Administrativo", department: "Administrativo", status: "ativo", phone: "(11) 98765-6060", email: "felipe.a@sge.com", admission: "2018-01-12", salary: 11200, documents: 14, attendance: 99 },
  { id: "7", name: "Gabriela Rocha", role: "SDR", department: "Comercial", status: "ativo", phone: "(11) 98765-7070", email: "gabriela.r@sge.com", admission: "2024-09-02", salary: 4200, documents: 7, attendance: 96 },
  { id: "8", name: "Henrique Silva", role: "Controller", department: "Financeiro", status: "ativo", phone: "(11) 98765-8080", email: "henrique.s@sge.com", admission: "2017-06-30", salary: 14500, documents: 15, attendance: 94 },
];

function RHPage() {
  const [dept, setDept] = useState<Dept | null>(null);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Employee | null>(null);
  const [adding, setAdding] = useState(false);

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      if (dept && e.department !== dept) return false;
      if (q && !`${e.name} ${e.role} ${e.email}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [dept, q]);

  return (
    <>
      <PageHeader
        title="Recursos Humanos"
        subtitle="Gestão de colaboradores, alertas e folha."
        actions={
          <Button className="rounded-xl" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" /> Novo colaborador
          </Button>
        }
      />

      {/* Alerts */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <h2 className="font-semibold">Alertas de RH</h2>
            <p className="text-xs text-muted-foreground">Acompanhe pendências e próximos eventos</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {alerts.map((a, i) => (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-4 shadow-sm",
                toneStyle[a.tone],
              )}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/70">
                <a.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{a.title}</p>
                <p className="mt-0.5 text-xs opacity-80">{a.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Departments */}
      <section className="mt-6">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold">Selecionar departamento</h2>
            <p className="text-xs text-muted-foreground">
              Visualize colaboradores por área da empresa
            </p>
          </div>
          {dept && (
            <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setDept(null)}>
              Limpar filtro
            </Button>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {departments.map((d) => {
            const count = employees.filter((e) => e.department === d.name).length;
            const active = dept === d.name;
            return (
              <motion.button
                key={d.name}
                whileHover={{ y: -3 }}
                onClick={() => setDept(active ? null : d.name)}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border bg-card p-5 text-left shadow-card transition-all",
                  active ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/40",
                )}
              >
                <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white", d.color)}>
                  <d.icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm font-semibold">{d.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{count} colaboradores</p>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Employees */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">
              Colaboradores {dept && <span className="text-muted-foreground">— {dept}</span>}
            </h2>
            <p className="text-xs text-muted-foreground">{filtered.length} encontrados</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome, cargo, email..."
              className="h-10 rounded-xl pl-9"
            />
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Colaborador</th>
                <th className="px-4 py-3">Cargo</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Admissão</th>
                <th className="px-4 py-3 text-right">Salário</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((e) => (
                <tr
                  key={e.id}
                  onClick={() => setSelected(e)}
                  className="cursor-pointer transition-colors hover:bg-primary-soft/30"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary-soft text-primary text-xs font-semibold">
                          {e.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{e.name}</p>
                        <p className="text-xs text-muted-foreground">{e.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{e.role}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={e.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(e.admission).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">
                    R$ {e.salary.toLocaleString("pt-BR")}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    Nenhum colaborador encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Employee details modal */}
      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="sm:max-w-xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>Detalhes do colaborador</DialogTitle>
              </DialogHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-primary-soft text-primary font-semibold">
                    {selected.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">{selected.name}</p>
                  <p className="text-sm text-muted-foreground">{selected.role} · {selected.department}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Info icon={Mail} label="Email" value={selected.email} />
                <Info icon={Phone} label="Telefone" value={selected.phone} />
                <Info icon={CalendarClock} label="Admissão" value={new Date(selected.admission).toLocaleDateString("pt-BR")} />
                <Info icon={Wallet} label="Salário" value={`R$ ${selected.salary.toLocaleString("pt-BR")}`} />
                <Info icon={FileWarning} label="Documentos" value={`${selected.documents} arquivos`} />
                <Info icon={UserCheck} label="Frequência" value={`${selected.attendance}%`} />
              </div>
              <DialogFooter>
                <Button variant="outline" className="rounded-lg">
                  <Upload className="h-4 w-4" /> Upload documentos
                </Button>
                <Button className="rounded-lg">Editar</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add employee */}
      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo colaborador</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Nome</Label><Input placeholder="Nome completo" /></div>
            <div className="space-y-1.5"><Label>Cargo</Label><Input placeholder="Ex.: Analista" /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" placeholder="email@empresa.com" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdding(false)}>Cancelar</Button>
            <Button onClick={() => setAdding(false)}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Info({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <p className="mt-1 truncate font-medium">{value}</p>
    </div>
  );
}

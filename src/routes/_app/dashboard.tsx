import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Wallet,
  Users,
  Banknote,
  TrendingUp,
  Trash2,
  Plus,
  StickyNote,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "Dashboard — SGE" }] }),
});

type QuickCard = {
  title: string;
  description: string;
  icon: LucideIcon;
  to: string;
  gradient: string;
  glow: string;
};

const quickCards: QuickCard[] = [
  {
    title: "Contas a Pagar",
    description: "Gerencie despesas, vencimentos e fornecedores.",
    icon: Wallet,
    to: "/financeiro",
    gradient: "from-rose-500 via-red-500 to-orange-500",
    glow: "shadow-[0_18px_40px_-18px_rgba(244,63,94,0.55)]",
  },
  {
    title: "Recursos Humanos",
    description: "Colaboradores, folha de pagamento e benefícios.",
    icon: Users,
    to: "/rh",
    gradient: "from-sky-500 via-blue-500 to-indigo-500",
    glow: "shadow-[0_18px_40px_-18px_rgba(59,130,246,0.55)]",
  },
  {
    title: "Caixa",
    description: "Entradas, saídas e fluxo de caixa diário.",
    icon: Banknote,
    to: "/financeiro",
    gradient: "from-emerald-500 via-green-500 to-teal-500",
    glow: "shadow-[0_18px_40px_-18px_rgba(16,185,129,0.55)]",
  },
];

type Reminder = { id: string; text: string; done: boolean };

const initialReminders: Reminder[] = [
  { id: "1", text: "Confirmar pagamento da Globex S/A", done: false },
  { id: "2", text: "Reunião com equipe pedagógica às 15h", done: false },
  { id: "3", text: "Enviar relatório financeiro mensal", done: true },
  { id: "4", text: "Revisar contratos a vencer esta semana", done: false },
];

function DashboardPage() {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [draft, setDraft] = useState("");

  const addReminder = () => {
    const text = draft.trim();
    if (!text) return;
    setReminders((prev) => [
      { id: crypto.randomUUID(), text, done: false },
      ...prev,
    ]);
    setDraft("");
  };

  const toggle = (id: string) =>
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r)),
    );

  const remove = (id: string) =>
    setReminders((prev) => prev.filter((r) => r.id !== id));

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addReminder();
    }
  };

  return (
    <>
      <PageHeader
        title="Olá, bem-vindo de volta 👋"
        subtitle="Acesso rápido aos módulos essenciais e visão executiva do seu dia."
      />

      {/* Quick access cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {quickCards.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: "easeOut" }}
          >
            <Link
              to={c.to}
              className={cn(
                "group relative block overflow-hidden rounded-2xl bg-gradient-to-br p-6 text-white transition-all duration-300 hover:-translate-y-1",
                c.gradient,
                c.glow,
              )}
            >
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl transition-all duration-500 group-hover:scale-125" />
              <div className="absolute right-4 top-4 rounded-full bg-white/15 p-2 backdrop-blur-sm transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
                <ArrowUpRight className="h-4 w-4" />
              </div>

              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <c.icon className="h-6 w-6" />
              </div>

              <div className="relative mt-6">
                <h3 className="text-xl font-semibold tracking-tight">{c.title}</h3>
                <p className="mt-1.5 text-sm text-white/85 leading-relaxed">
                  {c.description}
                </p>
              </div>

              <div className="relative mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-white/90">
                Acessar módulo
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Financial summary + reminders */}
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {/* Total pago no mês */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card lg:col-span-1"
        >
          <span className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-emerald-400 to-emerald-600" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Total Pago no Mês
              </p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-emerald-600">
                R$ 184.520,75
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Atualizado há 2 minutos · 47 pagamentos processados
          </p>
          <div className="mt-5 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            +12,4% em relação ao mês anterior
          </div>
        </motion.div>

        {/* Anotações e Lembretes */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-card lg:col-span-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft">
                <StickyNote className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Anotações e Lembretes</h3>
                <p className="text-xs text-muted-foreground">
                  Organize suas tarefas do dia
                </p>
              </div>
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {reminders.filter((r) => !r.done).length} pendentes
            </span>
          </div>

          <div className="mt-5 flex gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKey}
              placeholder="Adicionar nova anotação..."
              className="h-11 rounded-xl"
            />
            <Button
              type="button"
              onClick={addReminder}
              className="h-11 rounded-xl px-4"
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
          </div>

          <ul className="mt-5 space-y-2">
            {reminders.length === 0 && (
              <li className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Nenhuma anotação ainda. Comece adicionando uma acima.
              </li>
            )}
            {reminders.map((r) => (
              <motion.li
                key={r.id}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className={cn(
                  "group flex items-center gap-3 rounded-xl border border-border bg-background/60 px-4 py-3 transition-colors hover:border-primary/30 hover:bg-primary-soft/40",
                )}
              >
                <Checkbox
                  checked={r.done}
                  onCheckedChange={() => toggle(r.id)}
                  className="h-5 w-5 rounded-md"
                />
                <span
                  className={cn(
                    "flex-1 text-sm transition-all",
                    r.done && "text-muted-foreground line-through opacity-60",
                  )}
                >
                  {r.text}
                </span>
                <button
                  type="button"
                  onClick={() => remove(r.id)}
                  aria-label="Remover anotação"
                  className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </>
  );
}

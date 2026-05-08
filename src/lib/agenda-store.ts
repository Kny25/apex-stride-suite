import { useSyncExternalStore } from "react";

export type AgendaCategory = "reuniao" | "vencimento" | "evento" | "lembrete" | "rh";

export type AgendaItem = {
  id: string;
  title: string;
  date: string; // ISO yyyy-mm-dd
  time?: string; // HH:mm
  category: AgendaCategory;
  done: boolean;
  source: "dashboard" | "calendar";
};

export const categoryMeta: Record<
  AgendaCategory,
  { label: string; dot: string; bg: string; text: string; ring: string }
> = {
  vencimento: {
    label: "Vencimento",
    dot: "bg-rose-500",
    bg: "bg-rose-50",
    text: "text-rose-700",
    ring: "ring-rose-200",
  },
  reuniao: {
    label: "Reunião",
    dot: "bg-blue-500",
    bg: "bg-blue-50",
    text: "text-blue-700",
    ring: "ring-blue-200",
  },
  evento: {
    label: "Evento Escolar",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-200",
  },
  lembrete: {
    label: "Lembrete",
    dot: "bg-amber-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-200",
  },
  rh: {
    label: "Compromisso RH",
    dot: "bg-violet-500",
    bg: "bg-violet-50",
    text: "text-violet-700",
    ring: "ring-violet-200",
  },
};

const today = () => new Date().toISOString().slice(0, 10);
const addDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

let items: AgendaItem[] = [
  {
    id: "s1",
    title: "Confirmar pagamento da Globex S/A",
    date: today(),
    time: "10:00",
    category: "vencimento",
    done: false,
    source: "dashboard",
  },
  {
    id: "s2",
    title: "Reunião com equipe pedagógica",
    date: today(),
    time: "15:00",
    category: "reuniao",
    done: false,
    source: "dashboard",
  },
  {
    id: "s3",
    title: "Enviar relatório financeiro mensal",
    date: addDays(-1),
    category: "lembrete",
    done: true,
    source: "dashboard",
  },
  {
    id: "s4",
    title: "Revisar contratos a vencer esta semana",
    date: addDays(2),
    category: "vencimento",
    done: false,
    source: "dashboard",
  },
  {
    id: "s5",
    title: "Festa Junina — Escola",
    date: addDays(5),
    time: "18:00",
    category: "evento",
    done: false,
    source: "calendar",
  },
  {
    id: "s6",
    title: "Folha de pagamento",
    date: addDays(7),
    category: "rh",
    done: false,
    source: "calendar",
  },
];

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const agendaStore = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getSnapshot() {
    return items;
  },
  add(item: Omit<AgendaItem, "id">) {
    items = [{ ...item, id: crypto.randomUUID() }, ...items];
    emit();
  },
  update(id: string, patch: Partial<AgendaItem>) {
    items = items.map((i) => (i.id === id ? { ...i, ...patch } : i));
    emit();
  },
  toggle(id: string) {
    items = items.map((i) => (i.id === id ? { ...i, done: !i.done } : i));
    emit();
  },
  remove(id: string) {
    items = items.filter((i) => i.id !== id);
    emit();
  },
};

export function useAgenda() {
  return useSyncExternalStore(agendaStore.subscribe, agendaStore.getSnapshot, agendaStore.getSnapshot);
}

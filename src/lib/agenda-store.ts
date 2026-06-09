import { useSyncExternalStore } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

type AgendaRow = {
  id: string;
  title: string;
  date: string;
  time: string | null;
  category: string;
  done: boolean;
  source: string;
};

const VALID_CATEGORIES: AgendaCategory[] = ["reuniao", "vencimento", "evento", "lembrete", "rh"];

function mapRow(row: AgendaRow): AgendaItem {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    time: row.time ?? undefined,
    category: VALID_CATEGORIES.includes(row.category as AgendaCategory)
      ? (row.category as AgendaCategory)
      : "lembrete",
    done: row.done,
    source: row.source === "calendar" ? "calendar" : "dashboard",
  };
}

const EMPTY: AgendaItem[] = [];
let items: AgendaItem[] = EMPTY;
let loadStarted = false;

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

async function loadFromDb() {
  if (loadStarted) return;
  loadStarted = true;
  const { data, error } = await supabase
    .from("agenda_itens")
    .select("id, title, date, time, category, done, source")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Erro ao carregar anotações:", error.message);
    loadStarted = false;
    return;
  }
  const dbItems = (data ?? []).map(mapRow);
  const dbIds = new Set(dbItems.map((i) => i.id));
  // Preserve optimistic items created while the initial load was in flight
  const pendingLocal = items.filter((i) => !dbIds.has(i.id));
  items = [...pendingLocal, ...dbItems];
  emit();
}

export const agendaStore = {
  subscribe(l: () => void) {
    listeners.add(l);
    if (typeof window !== "undefined") void loadFromDb();
    return () => listeners.delete(l);
  },
  getSnapshot() {
    return items;
  },
  getServerSnapshot() {
    return EMPTY;
  },
  add(item: Omit<AgendaItem, "id">) {
    const id = crypto.randomUUID();
    const optimistic: AgendaItem = { ...item, id };
    items = [optimistic, ...items];
    emit();
    void supabase
      .from("agenda_itens")
      .insert({
        id,
        title: item.title,
        date: item.date,
        time: item.time ?? null,
        category: item.category,
        done: item.done,
        source: item.source,
      })
      .then(({ error }) => {
        if (error) {
          console.error("Erro ao salvar anotação:", error.message);
          items = items.filter((i) => i.id !== id);
          emit();
        }
      });
  },
  update(id: string, patch: Partial<AgendaItem>) {
    items = items.map((i) => (i.id === id ? { ...i, ...patch } : i));
    emit();
    void supabase
      .from("agenda_itens")
      .update({
        ...(patch.title !== undefined ? { title: patch.title } : {}),
        ...(patch.date !== undefined ? { date: patch.date } : {}),
        ...("time" in patch ? { time: patch.time ?? null } : {}),
        ...(patch.category !== undefined ? { category: patch.category } : {}),
        ...(patch.done !== undefined ? { done: patch.done } : {}),
        ...(patch.source !== undefined ? { source: patch.source } : {}),
      })
      .eq("id", id)
      .then(({ error }) => {
        if (error) console.error("Erro ao atualizar anotação:", error.message);
      });
  },
  toggle(id: string) {
    const current = items.find((i) => i.id === id);
    if (!current) return;
    const done = !current.done;
    items = items.map((i) => (i.id === id ? { ...i, done } : i));
    emit();
    void supabase
      .from("agenda_itens")
      .update({ done })
      .eq("id", id)
      .then(({ error }) => {
        if (error) console.error("Erro ao atualizar anotação:", error.message);
      });
  },
  remove(id: string) {
    const removed = items.find((i) => i.id === id);
    items = items.filter((i) => i.id !== id);
    emit();
    void supabase
      .from("agenda_itens")
      .delete()
      .eq("id", id)
      .then(({ error }) => {
        if (error) {
          console.error("Erro ao excluir anotação:", error.message);
          if (removed) {
            items = [removed, ...items];
            emit();
          }
        }
      });
  },
};

export function useAgenda() {
  return useSyncExternalStore(
    agendaStore.subscribe,
    agendaStore.getSnapshot,
    agendaStore.getServerSnapshot,
  );
}

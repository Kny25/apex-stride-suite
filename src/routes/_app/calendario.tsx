import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, Trash2, Clock, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  agendaStore,
  useAgenda,
  categoryMeta,
  type AgendaCategory,
  type AgendaItem,
} from "@/lib/agenda-store";

export const Route = createFileRoute("/_app/calendario")({
  component: CalendarPage,
  head: () => ({ meta: [{ title: "Calendário — SGE" }] }),
});

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const iso = (d: Date) => d.toISOString().slice(0, 10);

function CalendarPage() {
  const items = useAgenda();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState<string>(iso(new Date()));
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AgendaItem | null>(null);

  const grid = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const startDow = first.getDay();
    const start = new Date(first);
    start.setDate(start.getDate() - startDow);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursor]);

  const byDate = useMemo(() => {
    const m = new Map<string, AgendaItem[]>();
    items.forEach((i) => {
      const arr = m.get(i.date) ?? [];
      arr.push(i);
      m.set(i.date, arr);
    });
    return m;
  }, [items]);

  const upcoming = useMemo(() => {
    const today = iso(new Date());
    return [...items]
      .filter((i) => i.date >= today)
      .sort((a, b) => (a.date + (a.time ?? "")).localeCompare(b.date + (b.time ?? "")))
      .slice(0, 8);
  }, [items]);

  const todayStr = iso(new Date());

  return (
    <>
      <PageHeader
        title="Calendário"
        subtitle="Gerencie eventos, vencimentos e compromissos."
        actions={
          <Dialog
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
              if (!v) setEditing(null);
            }}
          >
            <DialogTrigger asChild>
              <Button className="rounded-xl">
                <Plus className="h-4 w-4" /> Novo evento
              </Button>
            </DialogTrigger>
            <EventDialog
              key={editing?.id ?? "new"}
              initial={editing ?? { date: selected }}
              onClose={() => {
                setOpen(false);
                setEditing(null);
              }}
            />
          </Dialog>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-5 shadow-card"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-lg"
                onClick={() =>
                  setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-lg"
                onClick={() =>
                  setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                className="h-9 rounded-lg"
                onClick={() => {
                  const t = new Date();
                  setCursor(new Date(t.getFullYear(), t.getMonth(), 1));
                  setSelected(iso(t));
                }}
              >
                Hoje
              </Button>
            </div>
            <h2 className="text-lg font-semibold tracking-tight">
              {MONTHS[cursor.getMonth()]} <span className="text-muted-foreground">{cursor.getFullYear()}</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(categoryMeta) as AgendaCategory[]).map((k) => (
                <span key={k} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className={cn("h-2 w-2 rounded-full", categoryMeta[k].dot)} />
                  {categoryMeta[k].label}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-border bg-border">
            {WEEKDAYS.map((w) => (
              <div
                key={w}
                className="bg-muted/40 px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {w}
              </div>
            ))}
            {grid.map((d) => {
              const key = iso(d);
              const dayItems = byDate.get(key) ?? [];
              const inMonth = d.getMonth() === cursor.getMonth();
              const isToday = key === todayStr;
              const isSelected = key === selected;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelected(key)}
                  className={cn(
                    "flex min-h-[96px] flex-col gap-1 bg-card p-2 text-left transition-colors hover:bg-primary-soft/40",
                    !inMonth && "bg-muted/20 text-muted-foreground",
                    isSelected && "ring-2 ring-primary ring-inset",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                      isToday && "bg-primary text-primary-foreground",
                    )}
                  >
                    {d.getDate()}
                  </span>
                  <div className="flex flex-col gap-1">
                    {dayItems.slice(0, 3).map((it) => {
                      const meta = categoryMeta[it.category];
                      return (
                        <span
                          key={it.id}
                          className={cn(
                            "truncate rounded px-1.5 py-0.5 text-[10px] font-medium",
                            meta.bg,
                            meta.text,
                            it.done && "line-through opacity-60",
                          )}
                          title={it.title}
                        >
                          {it.time ? `${it.time} ` : ""}{it.title}
                        </span>
                      );
                    })}
                    {dayItems.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{dayItems.length - 3} mais
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Side panel */}
        <motion.aside
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-5"
        >
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft">
                <CalendarDays className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Próximos Eventos</h3>
                <p className="text-xs text-muted-foreground">
                  {upcoming.length} agendados
                </p>
              </div>
            </div>
            <ul className="mt-4 space-y-2">
              {upcoming.length === 0 && (
                <li className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  Nada agendado.
                </li>
              )}
              {upcoming.map((it) => {
                const meta = categoryMeta[it.category];
                const d = new Date(it.date + "T00:00");
                return (
                  <li
                    key={it.id}
                    className={cn(
                      "group flex items-start gap-3 rounded-xl border border-border bg-background/60 p-3",
                      it.done && "opacity-60",
                    )}
                  >
                    <Checkbox
                      checked={it.done}
                      onCheckedChange={() => agendaStore.toggle(it.id)}
                      className="mt-0.5 h-4 w-4 rounded"
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "truncate text-sm font-medium",
                          it.done && "line-through",
                        )}
                      >
                        {it.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="capitalize">
                          {d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                        </span>
                        {it.time && (
                          <>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {it.time}
                            </span>
                          </>
                        )}
                        <span className={cn("ml-auto rounded px-1.5 py-0.5 text-[10px] font-medium", meta.bg, meta.text)}>
                          {meta.label}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setEditing(it);
                        setOpen(true);
                      }}
                      className="text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => agendaStore.remove(it.id)}
                      className="rounded-md p-1 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </motion.aside>
      </div>
    </>
  );
}

function EventDialog({
  initial,
  onClose,
}: {
  initial: Partial<AgendaItem>;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initial.title ?? "");
  const [date, setDate] = useState(initial.date ?? iso(new Date()));
  const [time, setTime] = useState(initial.time ?? "");
  const [category, setCategory] = useState<AgendaCategory>(
    (initial.category as AgendaCategory) ?? "evento",
  );
  const [recurring, setRecurring] = useState(false);

  const submit = () => {
    if (!title.trim()) return;
    if (initial.id) {
      agendaStore.update(initial.id, { title, date, time: time || undefined, category });
    } else {
      agendaStore.add({
        title,
        date,
        time: time || undefined,
        category,
        done: false,
        source: "calendar",
      });
      if (recurring) {
        for (let i = 1; i <= 3; i++) {
          const d = new Date(date + "T00:00");
          d.setMonth(d.getMonth() + i);
          agendaStore.add({
            title,
            date: iso(d),
            time: time || undefined,
            category,
            done: false,
            source: "calendar",
          });
        }
      }
    }
    onClose();
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{initial.id ? "Editar evento" : "Novo evento"}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Título</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Reunião com pais" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Data</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Horário</Label>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Categoria</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as AgendaCategory)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(categoryMeta) as AgendaCategory[]).map((k) => (
                <SelectItem key={k} value={k}>{categoryMeta[k].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {!initial.id && (
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={recurring} onCheckedChange={(v) => setRecurring(!!v)} />
            Repetir mensalmente (próximos 3 meses)
          </label>
        )}
      </div>
      <DialogFooter>
        {initial.id && (
          <Button variant="destructive" onClick={() => { agendaStore.remove(initial.id!); onClose(); }}>
            Excluir
          </Button>
        )}
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={submit}>Salvar</Button>
      </DialogFooter>
    </DialogContent>
  );
}

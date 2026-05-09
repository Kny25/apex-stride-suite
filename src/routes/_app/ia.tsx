import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Trash2, Send, Bot, User, Lightbulb, Wand2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/ia")({
  component: AssistenteIAPage,
  head: () => ({ meta: [{ title: "Assistente IA — SGE" }] }),
});

type Message = {
  id: string;
  role: "bot" | "user";
  content: string;
  time: string;
};

function nowTime() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

const initialMessage: Message = {
  id: "init",
  role: "bot",
  content: "Olá! Sou sua assistente de IA. Como posso ajudá-lo hoje?",
  time: "11:23",
};

function AssistenteIAPage() {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function send() {
    const text = draft.trim();
    if (!text) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text, time: nowTime() };
    setMessages((m) => [...m, userMsg]);
    setDraft("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "bot",
          content:
            "Esta é uma resposta de demonstração. Para respostas reais, conecte uma API de IA (OpenAI, Claude, etc.).",
          time: nowTime(),
        },
      ]);
    }, 600);
  }

  function clearChat() {
    setMessages([initialMessage]);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-7rem)] w-full max-w-5xl flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-md shadow-violet-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight text-foreground">Assistente IA</h1>
            <p className="text-xs text-muted-foreground">Sua assistente virtual inteligente</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={clearChat} className="gap-2">
          <Trash2 className="h-4 w-4" />
          Limpar Chat
        </Button>
      </div>

      {/* Chat area */}
      <div className="flex flex-1 min-h-0 flex-col rounded-2xl border border-border/60 bg-white shadow-sm">
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6">
          <div className="flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex items-start gap-3", m.role === "user" && "flex-row-reverse")}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                      m.role === "bot"
                        ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white"
                        : "bg-muted text-foreground",
                    )}
                  >
                    {m.role === "bot" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>
                  <div className={cn("max-w-[75%]", m.role === "user" && "text-right")}>
                    <div
                      className={cn(
                        "inline-block rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                        m.role === "bot"
                          ? "bg-muted/60 text-foreground rounded-tl-sm"
                          : "bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-tr-sm",
                      )}
                    >
                      {m.content}
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">{m.time}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-border/60 p-4">
          <div className="flex items-end gap-3">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Digite sua mensagem..."
              rows={1}
              className="min-h-[48px] max-h-40 resize-none rounded-2xl border-border/60 bg-muted/30 px-4 py-3 text-sm focus-visible:ring-violet-400"
            />
            <button
              onClick={send}
              aria-label="Enviar"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-violet-600 text-white shadow-lg shadow-violet-500/30 transition hover:shadow-xl hover:shadow-violet-500/40 active:scale-95"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Pressione Enter para enviar, Shift + Enter para nova linha
          </p>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <InfoCard
          icon={<Lightbulb className="h-5 w-5" />}
          color="blue"
          title="Dica"
          text="Esta é uma interface de demonstração. Para usar IA real, integre APIs como OpenAI ou Claude."
        />
        <InfoCard
          icon={<Wand2 className="h-5 w-5" />}
          color="green"
          title="Sugestões"
          text="Você pode usar a IA para análises, relatórios, sugestões de conteúdo e muito mais."
        />
        <InfoCard
          icon={<Lock className="h-5 w-5" />}
          color="purple"
          title="Privacidade"
          text="As mensagens ficam apenas no seu navegador. Configure uma API para funcionalidade real."
        />
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  color,
  title,
  text,
}: {
  icon: React.ReactNode;
  color: "blue" | "green" | "purple";
  title: string;
  text: string;
}) {
  const styles = {
    blue: { border: "border-blue-200", bg: "bg-blue-50", fg: "text-blue-600" },
    green: { border: "border-green-200", bg: "bg-green-50", fg: "text-green-600" },
    purple: { border: "border-violet-200", bg: "bg-violet-50", fg: "text-violet-600" },
  }[color];
  return (
    <div className={cn("rounded-2xl border bg-white p-4 shadow-sm", styles.border)}>
      <div className="flex items-start gap-3">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", styles.bg, styles.fg)}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{text}</p>
        </div>
      </div>
    </div>
  );
}

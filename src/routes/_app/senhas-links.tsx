import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Copy, ExternalLink, KeyRound, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_app/senhas-links")({
  component: SenhasLinksPage,
  head: () => ({ meta: [{ title: "Links e Senhas — SGE" }] }),
});

const ACCESS_PASSWORD = "admin123";

type PasswordItem = { id: string; name: string; description: string; password: string; notes?: string };
type LinkItem = { id: string; name: string; description: string; url: string; notes?: string };

const passwords: PasswordItem[] = [
  { id: "1", name: "Painel Administrativo", description: "Acesso ao backoffice principal", password: "Admin@2025!Secure", notes: "Renovar a cada 90 dias" },
  { id: "2", name: "Servidor de E-mail", description: "Conta master de SMTP", password: "Mail#Server2025", notes: "Uso restrito ao TI" },
  { id: "3", name: "Banco de Dados", description: "Acesso de leitura/escrita", password: "DB$Master!2025" },
];

const links: LinkItem[] = [
  { id: "1", name: "Portal Administrativo", description: "Acesso ao painel principal", url: "https://admin.exemplo.com" },
  { id: "2", name: "Sistema Financeiro", description: "Conciliação e relatórios", url: "https://financeiro.exemplo.com" },
  { id: "3", name: "Suporte Interno", description: "Tickets e chamados", url: "https://suporte.exemplo.com" },
];

function SenhasLinksPage() {
  const [authed, setAuthed] = useState(false);
  return authed ? <ProtectedView /> : <LockScreen onUnlock={() => setAuthed(true)} />;
}

function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (value === ACCESS_PASSWORD) onUnlock();
    else setError("Senha incorreta. Tente novamente.");
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] grid place-items-center">
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card rounded-2xl border border-border shadow-card p-8"
      >
        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-primary-soft grid place-items-center mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Acesso Restrito</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Digite a senha correta para acessar os links e informações importantes
          </p>
        </div>
        <div className="space-y-3">
          <Input
            type="password"
            placeholder="Senha"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(""); }}
            autoFocus
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" variant="premium" className="w-full">Entrar</Button>
        </div>
      </motion.form>
    </div>
  );
}

function ProtectedView() {
  const [tab, setTab] = useState<"senhas" | "links">("senhas");
  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Links e Senhas</h1>

      <div className="flex gap-1 border-b border-border mb-6">
        <TabButton active={tab === "senhas"} onClick={() => setTab("senhas")} icon={KeyRound}>
          Senhas Importantes
        </TabButton>
        <TabButton active={tab === "links"} onClick={() => setTab("links")} icon={Link2}>
          Links Importantes
        </TabButton>
      </div>

      {tab === "senhas" ? <PasswordsTab /> : <LinksTab />}
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, children }: { active: boolean; onClick: () => void; icon: typeof KeyRound; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
        active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

function copy(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    void navigator.clipboard.writeText(text);
  }
}

function PasswordsTab() {
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setShown((s) => ({ ...s, [id]: !s[id] }));
  return (
    <div className="space-y-4">
      {passwords.map((p) => (
        <div key={p.id} className="bg-card rounded-2xl border border-border shadow-card p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="font-semibold">{p.name}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{p.description}</p>
            </div>
            <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
          <div className="flex items-center gap-2 bg-muted/60 rounded-lg px-3 py-2 font-mono text-sm">
            <span className="flex-1 truncate">{shown[p.id] ? p.password : "•".repeat(p.password.length)}</span>
            <button type="button" onClick={() => toggle(p.id)} className="p-1.5 rounded hover:bg-card transition-colors" aria-label="Mostrar/ocultar">
              {shown[p.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button type="button" onClick={() => copy(p.password)} className="p-1.5 rounded hover:bg-card transition-colors" aria-label="Copiar">
              <Copy className="h-4 w-4" />
            </button>
          </div>
          {p.notes && <p className="text-xs text-muted-foreground mt-3">{p.notes}</p>}
        </div>
      ))}
    </div>
  );
}

function LinksTab() {
  return (
    <div className="space-y-4">
      {links.map((l) => (
        <div key={l.id} className="bg-card rounded-2xl border border-border shadow-card p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <h3 className="font-semibold">{l.name}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{l.description}</p>
              <p className="text-xs text-primary mt-2 truncate">{l.url}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="premium" size="sm">
              <a href={l.url} target="_blank" rel="noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />Abrir link
              </a>
            </Button>
            <Button variant="outline" size="sm" onClick={() => copy(l.url)}>
              <Copy className="h-3.5 w-3.5" />Copiar
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

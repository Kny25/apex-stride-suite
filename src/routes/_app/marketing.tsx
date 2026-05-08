import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, Plus, ExternalLink, Pencil, Trash2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/marketing")({
  component: MarketingPage,
  head: () => ({ meta: [{ title: "Marketing — SGE" }] }),
});

type Investment = { name: string; platform: string; value: string; status: "Pago" | "Pendente" };
const investments: Investment[] = [
  { name: "Anúncios Facebook", platform: "Meta Ads", value: "R$ 3.500,00", status: "Pago" },
  { name: "Anúncios Google Ads", platform: "Google", value: "R$ 5.200,00", status: "Pago" },
  { name: "Campanha Instagram", platform: "Meta Ads", value: "R$ 2.800,00", status: "Pago" },
  { name: "Marketing de Influência", platform: "Agência Digital", value: "R$ 4.500,00", status: "Pendente" },
];

type LinkItem = { id: string; category: string; dot: string; name: string; description: string; url: string };
const initialLinks: LinkItem[] = [
  { id: "1", category: "Analytics", dot: "bg-blue-500", name: "Google Analytics", description: "Painel de análise do site", url: "https://analytics.google.com" },
  { id: "2", category: "Redes Sociais", dot: "bg-pink-500", name: "Meta Business Suite", description: "Gerenciar Facebook e Instagram", url: "https://business.facebook.com" },
  { id: "3", category: "Anúncios", dot: "bg-emerald-500", name: "Google Ads", description: "Campanha de anúncios Google", url: "https://ads.google.com" },
  { id: "4", category: "Ferramentas", dot: "bg-purple-500", name: "Canva", description: "Editor de design gráfico", url: "https://canva.com" },
];

function MarketingPage() {
  const [links, setLinks] = useState<LinkItem[]>(initialLinks);

  const removeLink = (id: string) => setLinks((l) => l.filter((x) => x.id !== id));

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">Marketing</h1>

      {/* Investment card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-7 md:p-8 text-white shadow-glow mb-6"
        style={{ background: "linear-gradient(135deg, #5B3BCC 0%, #7B61FF 100%)" }}
      >
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="h-11 w-11 rounded-xl bg-white/15 grid place-items-center">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Investimento em Mídias</h2>
              <p className="text-sm text-white/75 mt-1">Total pago em campanhas</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/70 uppercase tracking-wide">Já Pago</p>
            <p className="text-2xl md:text-3xl font-bold mt-1">R$ 11.500,00</p>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-sm font-semibold text-white/85 mb-3">Detalhamento</h3>
          <div className="rounded-xl bg-white/8 backdrop-blur-sm divide-y divide-white/10">
            {investments.map((it) => (
              <div key={it.name} className="flex items-center justify-between gap-4 px-4 py-3.5">
                <div className="min-w-0">
                  <p className="font-medium text-sm">{it.name}</p>
                  <p className="text-xs text-white/65 mt-0.5">{it.platform}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-semibold">{it.value}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      it.status === "Pago"
                        ? "bg-emerald-400/90 text-emerald-950"
                        : "bg-zinc-200/90 text-zinc-800"
                    }`}
                  >
                    {it.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Module in development */}
      <div className="rounded-2xl bg-muted/60 border border-border p-5 mb-8">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-card grid place-items-center shrink-0">
            <Info className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">Módulo em Desenvolvimento</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Esta seção conterá funcionalidades como: gestão de campanhas, análise de ROI, mídias sociais, email marketing e monitoramento de indicadores.
            </p>
          </div>
        </div>
      </div>

      {/* Useful links */}
      <div className="rounded-2xl bg-card border border-border shadow-card p-6">
        <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold">Links Úteis</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Ferramentas e plataformas de marketing</p>
          </div>
          <Button variant="premium"><Plus className="h-4 w-4" />Adicionar Link</Button>
        </div>

        <div className="space-y-4">
          {links.map((l) => (
            <div key={l.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`h-2 w-2 rounded-full ${l.dot}`} />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{l.category}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold">{l.name}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{l.description}</p>
                </div>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-primary p-1.5 rounded-md hover:bg-muted transition-colors shrink-0"
                  aria-label="Abrir link"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm"><Pencil className="h-3.5 w-3.5" />Editar</Button>
                <Button variant="outline" size="sm" onClick={() => removeLink(l.id)}>
                  <Trash2 className="h-3.5 w-3.5" />Excluir
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

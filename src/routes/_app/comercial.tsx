import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Trophy, Link as LinkIcon, PlayCircle, FileText, HelpCircle, type LucideIcon } from "lucide-react";

export const Route = createFileRoute("/_app/comercial")({
  component: ComercialPage,
  head: () => ({ meta: [{ title: "Comercial — SGE" }] }),
});

type Card = {
  title: string;
  description: string;
  icon: LucideIcon;
  to: string;
  iconBg: string;
  iconColor: string;
};

const cards: Card[] = [
  { title: "Metas", description: "Ranking e desempenho de vendedores", icon: Trophy, to: "/comercial/metas", iconBg: "bg-amber-100", iconColor: "text-amber-600" },
  { title: "Links para Acesso", description: "Acesso rápido a sistemas e ferramentas", icon: LinkIcon, to: "/comercial/links", iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  { title: "Vídeos de Treinamento", description: "Material de capacitação da equipe", icon: PlayCircle, to: "/comercial/videos", iconBg: "bg-red-100", iconColor: "text-red-600" },
  { title: "Material para Divulgação", description: "Folders, banners e apresentações", icon: FileText, to: "/comercial/material", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
];

function ComercialPage() {
  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-10">Comercial</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl">
        {cards.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
          >
            <button
              type="button"
              data-to={c.to}
              className="group w-full text-left bg-card rounded-2xl border border-border shadow-card hover:shadow-soft transition-all p-6 h-full"
            >
              <div className={`h-12 w-12 rounded-full ${c.iconBg} grid place-items-center mb-5 group-hover:scale-105 transition-transform`}>
                <c.icon className={`h-6 w-6 ${c.iconColor}`} />
              </div>
              <h3 className="font-semibold text-lg mb-1.5">{c.title}</h3>
              <p className="text-sm text-muted-foreground">{c.description}</p>
            </button>
          </motion.div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Ajuda"
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-zinc-900 text-white grid place-items-center shadow-soft hover:bg-zinc-800 transition-colors z-40"
      >
        <HelpCircle className="h-5 w-5" />
      </button>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AlertTriangle, CreditCard, Banknote, HelpCircle, type LucideIcon } from "lucide-react";

export const Route = createFileRoute("/_app/financeiro")({
  component: FinanceiroPage,
  head: () => ({ meta: [{ title: "Financeiro — SGE" }] }),
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
  { title: "Contas a Pagar", description: "Gerenciar fornecedores e pagamentos", icon: CreditCard, to: "/financeiro/contas-a-pagar", iconBg: "bg-red-100", iconColor: "text-red-600" },
  { title: "Caixa", description: "Controle de caixa e movimentações", icon: Banknote, to: "/financeiro/caixa", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
];

function FinanceiroPage() {
  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Financeiro</h1>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 mb-4 max-w-6xl">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-amber-100 grid place-items-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-900">Alertas Financeiros</h3>
            <p className="text-sm text-amber-800/90 mt-0.5">4 conta(s) vencem esta semana</p>
            <p className="text-sm font-medium text-amber-900 mt-1">Total: R$ 15.850,00</p>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-6">Selecione uma opção para gerenciar</p>

      <div className="grid gap-6 sm:grid-cols-2 max-w-4xl">
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

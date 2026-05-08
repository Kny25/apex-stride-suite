import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/page-header";
import { DataTable, type Column } from "@/components/app/data-table";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { payments, type Payment } from "@/lib/mock-data";
import { StatCard } from "@/components/app/stat-card";

export const Route = createFileRoute("/_app/financeiro")({
  component: FinancePage,
  head: () => ({ meta: [{ title: "Financeiro — SGE" }] }),
});

const columns: Column<Payment>[] = [
  { key: "id", label: "ID" },
  { key: "cliente", label: "Cliente" },
  { key: "contrato", label: "Contrato" },
  { key: "valor", label: "Valor" },
  { key: "metodo", label: "Método" },
  { key: "status", label: "Status", isStatus: true },
  { key: "data", label: "Vencimento" },
];

function FinancePage() {
  return (
    <>
      <PageHeader
        title="Financeiro"
        subtitle="Controle de receitas, despesas e pagamentos."
        actions={<Button variant="premium"><Plus className="h-4 w-4" />Novo Lançamento</Button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <StatCard label="Receita do Mês" value="R$ 92.150" delta="+18%" positive icon={DollarSign} hint="vs mês anterior" />
        <StatCard label="Despesas" value="R$ 37.500" delta="+4%" positive={false} icon={TrendingDown} hint="dentro do orçamento" />
        <StatCard label="Lucro Líquido" value="R$ 54.650" delta="+22%" positive icon={TrendingUp} hint="margem 59%" />
        <StatCard label="A Receber" value="R$ 28.300" delta="3 atrasados" positive={false} icon={Wallet} hint="próx. 30 dias" />
      </div>
      <DataTable data={payments} columns={columns} searchKeys={["cliente", "id", "contrato"]} />
    </>
  );
}

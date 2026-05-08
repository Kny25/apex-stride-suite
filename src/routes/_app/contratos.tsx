import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/page-header";
import { DataTable, type Column } from "@/components/app/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { contracts, type Contract } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/contratos")({
  component: ContractsPage,
  head: () => ({ meta: [{ title: "Contratos — SGE" }] }),
});

const columns: Column<Contract>[] = [
  { key: "id", label: "Contrato" },
  { key: "cliente", label: "Cliente" },
  { key: "valor", label: "Valor" },
  { key: "inicio", label: "Início" },
  { key: "fim", label: "Vencimento" },
  { key: "status", label: "Status", isStatus: true },
];

function ContractsPage() {
  return (
    <>
      <PageHeader title="Contratos" subtitle="Gestão completa do ciclo de contratos."
        actions={<Button variant="premium"><Plus className="h-4 w-4" />Novo Contrato</Button>} />
      <DataTable data={contracts} columns={columns} searchKeys={["cliente", "id"]} />
    </>
  );
}

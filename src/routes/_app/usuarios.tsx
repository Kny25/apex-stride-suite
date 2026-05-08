import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/page-header";
import { DataTable, type Column } from "@/components/app/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { users, type User } from "@/lib/mock-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/_app/usuarios")({
  component: UsersPage,
  head: () => ({ meta: [{ title: "Usuários — SGE" }] }),
});

const columns: Column<User>[] = [
  {
    key: "nome", label: "Usuário",
    render: (r) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8"><AvatarFallback className="bg-gradient-primary text-primary-foreground text-[11px] font-semibold">{r.nome.split(" ").map(n => n[0]).join("").slice(0,2)}</AvatarFallback></Avatar>
        <div>
          <div className="font-medium">{r.nome}</div>
          <div className="text-xs text-muted-foreground">{r.email}</div>
        </div>
      </div>
    ),
  },
  { key: "cargo", label: "Cargo" },
  { key: "status", label: "Status", isStatus: true },
  { key: "criadoEm", label: "Criado em" },
];

function UsersPage() {
  return (
    <>
      <PageHeader
        title="Usuários"
        subtitle="Gerencie os membros da sua organização."
        actions={<Button variant="premium"><Plus className="h-4 w-4" />Novo Usuário</Button>}
      />
      <DataTable data={users} columns={columns} searchKeys={["nome", "email", "cargo"]} />
    </>
  );
}

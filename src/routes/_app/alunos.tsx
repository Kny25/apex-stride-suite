import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/page-header";
import { DataTable, type Column } from "@/components/app/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { students, type Student } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/alunos")({
  component: StudentsPage,
  head: () => ({ meta: [{ title: "Alunos — SGE" }] }),
});

const columns: Column<Student>[] = [
  { key: "matricula", label: "Matrícula" },
  { key: "nome", label: "Nome" },
  { key: "email", label: "E-mail" },
  { key: "curso", label: "Curso" },
  { key: "status", label: "Status", isStatus: true },
];

function StudentsPage() {
  return (
    <>
      <PageHeader title="Alunos" subtitle="Cadastro e acompanhamento de alunos."
        actions={<Button variant="premium"><Plus className="h-4 w-4" />Novo Aluno</Button>} />
      <DataTable data={students} columns={columns} searchKeys={["nome", "email", "curso", "matricula"]} />
    </>
  );
}

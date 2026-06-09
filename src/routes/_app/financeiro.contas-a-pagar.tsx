import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContasTab } from "@/components/financeiro/contas-tab";
import { FolhaTab } from "@/components/financeiro/folha-tab";

export const Route = createFileRoute("/_app/financeiro/contas-a-pagar")({
  component: ContasAPagarPage,
  head: () => ({ meta: [{ title: "Contas a Pagar — SGE" }] }),
});

function ContasAPagarPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link to="/financeiro" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-2">
          <ArrowLeft className="h-4 w-4" />Voltar ao Financeiro
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Contas a Pagar</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestão de fornecedores, pagamentos e folha de pagamento</p>
      </div>

      <Tabs defaultValue="contas">
        <TabsList>
          <TabsTrigger value="contas">Contas a Pagar</TabsTrigger>
          <TabsTrigger value="folha">Folha de Pagamento</TabsTrigger>
        </TabsList>
        <TabsContent value="contas" className="mt-6">
          <ContasTab />
        </TabsContent>
        <TabsContent value="folha" className="mt-6">
          <FolhaTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

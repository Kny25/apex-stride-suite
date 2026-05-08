import { createFileRoute } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import { ComingSoon } from "@/components/app/coming-soon";

export const Route = createFileRoute("/_app/senhas-links")({
  component: () => <ComingSoon icon={KeyRound} title="Senhas e Links" description="Cofre seguro de credenciais e atalhos." />,
  head: () => ({ meta: [{ title: "Senhas e Links — SGE" }] }),
});

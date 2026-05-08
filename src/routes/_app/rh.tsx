import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { ComingSoon } from "@/components/app/coming-soon";

export const Route = createFileRoute("/_app/rh")({
  component: () => <ComingSoon icon={Users} title="Recursos Humanos" description="Gerencie colaboradores, folha e benefícios." />,
  head: () => ({ meta: [{ title: "RH — SGE" }] }),
});

import { createFileRoute } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";
import { ComingSoon } from "@/components/app/coming-soon";

export const Route = createFileRoute("/_app/comercial")({
  component: () => <ComingSoon icon={Briefcase} title="Comercial" description="Funil de vendas, leads e oportunidades." />,
  head: () => ({ meta: [{ title: "Comercial — SGE" }] }),
});

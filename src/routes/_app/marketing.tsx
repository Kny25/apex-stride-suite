import { createFileRoute } from "@tanstack/react-router";
import { Megaphone } from "lucide-react";
import { ComingSoon } from "@/components/app/coming-soon";

export const Route = createFileRoute("/_app/marketing")({
  component: () => <ComingSoon icon={Megaphone} title="Marketing" description="Campanhas, anúncios e métricas." />,
  head: () => ({ meta: [{ title: "Marketing — SGE" }] }),
});

import { createFileRoute } from "@tanstack/react-router";
import { Calendar } from "lucide-react";
import { ComingSoon } from "@/components/app/coming-soon";

export const Route = createFileRoute("/_app/calendario")({
  component: () => <ComingSoon icon={Calendar} title="Calendário" description="Visualize eventos, aulas e compromissos." />,
  head: () => ({ meta: [{ title: "Calendário — SGE" }] }),
});

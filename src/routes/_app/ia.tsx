import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { ComingSoon } from "@/components/app/coming-soon";

export const Route = createFileRoute("/_app/ia")({
  component: () => <ComingSoon icon={Sparkles} title="Inteligência Artificial" description="Automações, insights e copilotos do SGE." />,
  head: () => ({ meta: [{ title: "IA — SGE" }] }),
});

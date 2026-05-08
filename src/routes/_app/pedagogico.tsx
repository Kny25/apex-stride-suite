import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { ComingSoon } from "@/components/app/coming-soon";

export const Route = createFileRoute("/_app/pedagogico")({
  component: () => <ComingSoon icon={BookOpen} title="Pedagógico" description="Cursos, turmas, professores e conteúdos." />,
  head: () => ({ meta: [{ title: "Pedagógico — SGE" }] }),
});

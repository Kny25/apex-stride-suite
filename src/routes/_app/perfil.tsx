import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone, MapPin, Calendar } from "lucide-react";

export const Route = createFileRoute("/_app/perfil")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "Perfil — SGE" }] }),
});

function ProfilePage() {
  return (
    <>
      <PageHeader title="Meu Perfil" subtitle="Suas informações pessoais e atividade." />
      <div className="rounded-2xl border border-border bg-card-premium shadow-card overflow-hidden">
        <div className="h-32 bg-gradient-primary relative">
          <div className="absolute inset-0 bg-gradient-radial opacity-50" />
        </div>
        <div className="px-8 pb-8 -mt-12">
          <Avatar className="h-24 w-24 ring-4 ring-card">
            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl font-bold">AC</AvatarFallback>
          </Avatar>
          <h2 className="mt-4 text-2xl font-bold">Ana Costa</h2>
          <p className="text-sm text-muted-foreground">Administradora · SGE Inc.</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 max-w-2xl">
            {[
              { i: Mail, l: "ana@empresa.com" },
              { i: Phone, l: "+55 11 99999-0000" },
              { i: MapPin, l: "São Paulo, BR" },
              { i: Calendar, l: "Membro desde Jan/2024" },
            ].map((x, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <x.i className="h-4 w-4 text-primary" />
                <span className="text-sm">{x.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

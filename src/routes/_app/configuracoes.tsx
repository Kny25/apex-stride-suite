import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/configuracoes")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Configurações — SGE" }] }),
});

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card-premium shadow-card p-6">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-xs text-muted-foreground mb-5">{desc}</p>
      {children}
    </div>
  );
}

function SettingsPage() {
  return (
    <>
      <PageHeader title="Configurações" subtitle="Personalize sua conta e a organização." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Section title="Perfil" desc="Informações da conta exibidas no sistema.">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl font-semibold">AC</AvatarFallback>
              </Avatar>
              <Button variant="outline">Alterar foto</Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { l: "Nome", v: "Ana Costa" },
                { l: "E-mail", v: "ana@empresa.com" },
                { l: "Telefone", v: "+55 11 99999-0000" },
                { l: "Cargo", v: "Administradora" },
              ].map((f) => (
                <div key={f.l}>
                  <label className="text-xs font-medium text-muted-foreground">{f.l}</label>
                  <input defaultValue={f.v} className="mt-1.5 w-full h-10 rounded-lg bg-muted/40 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="premium" onClick={() => toast.success("Perfil atualizado!")}>Salvar alterações</Button>
            </div>
          </Section>

          <Section title="Segurança" desc="Atualize sua senha e proteja sua conta.">
            <div className="space-y-3">
              {["Senha atual", "Nova senha", "Confirmar nova senha"].map((l) => (
                <div key={l}>
                  <label className="text-xs font-medium text-muted-foreground">{l}</label>
                  <input type="password" className="mt-1.5 w-full h-10 rounded-lg bg-muted/40 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="outline">Atualizar senha</Button>
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Notificações" desc="Como deseja ser avisado.">
            {[
              { l: "E-mail", d: "Receber resumos diários" },
              { l: "Push", d: "Notificações no navegador" },
              { l: "SMS", d: "Alertas críticos" },
            ].map((n, i) => (
              <div key={n.l} className="flex items-center justify-between py-3 border-t border-border first:border-t-0">
                <div>
                  <div className="text-sm font-medium">{n.l}</div>
                  <div className="text-xs text-muted-foreground">{n.d}</div>
                </div>
                <Switch defaultChecked={i !== 2} />
              </div>
            ))}
          </Section>

          <Section title="Plano" desc="Sua assinatura atual.">
            <div className="rounded-xl border border-primary/30 bg-gradient-primary/10 p-4">
              <div className="text-xs uppercase font-semibold text-primary tracking-widest">Premium</div>
              <div className="mt-1 text-2xl font-bold">R$ 299/mês</div>
              <div className="text-xs text-muted-foreground">Renova em 12/12/2025</div>
              <Button variant="outline" className="mt-4 w-full">Gerenciar plano</Button>
            </div>
          </Section>
        </div>
      </div>
    </>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Entrar — SGE" },
      { name: "description", content: "Acesse o Sistema de Gestão Empresarial." },
    ],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("admin@sge.com");
  const [pwd, setPwd] = useState("admin123");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@") || pwd.length < 6) {
      toast.error("Credenciais inválidas");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      toast.success("Bem-vinda de volta!");
      navigate({ to: "/empresario" });
    }, 700);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Link to="/login" className="inline-flex items-center gap-2.5 mb-10">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-bold tracking-tight">SGE</div>
              <div className="text-[11px] text-muted-foreground -mt-0.5">Gestão Empresarial</div>
            </div>
          </Link>

          <h1 className="text-3xl font-bold tracking-tight">Bem-vindo de volta</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Entre na sua conta para continuar gerenciando seu negócio.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div>
              <label className="text-xs font-medium text-muted-foreground">E-mail</label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 rounded-lg bg-muted/40 border border-border pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">Senha</label>
                <button type="button" className="text-xs text-primary hover:underline">Esqueceu?</button>
              </div>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={show ? "text" : "password"} value={pwd} onChange={(e) => setPwd(e.target.value)}
                  className="w-full h-11 rounded-lg bg-muted/40 border border-border pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" className="rounded border-border bg-muted/40" defaultChecked /> Manter conectado
            </label>

            <Button type="submit" variant="premium" size="lg" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : (<>Entrar <ArrowRight className="h-4 w-4" /></>)}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-background px-3 text-muted-foreground">ou continuar com</span></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="outline">Google</Button>
              <Button type="button" variant="outline">Microsoft</Button>
            </div>

            <p className="text-center text-sm text-muted-foreground pt-2">
              Não tem uma conta? <button type="button" className="text-primary hover:underline font-medium">Criar conta</button>
            </p>
          </form>
        </div>
      </div>

      {/* Right — visual */}
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-background border-l border-border">
        <div className="absolute inset-0 bg-gradient-radial" />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/30 blur-3xl animate-float" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-primary-glow/20 blur-3xl" />

        <div className="relative z-10 m-auto p-12 max-w-lg">
          <div className="rounded-2xl border border-border bg-card-premium shadow-card p-8 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> Premium SaaS
            </div>
            <h2 className="mt-4 text-3xl font-bold leading-tight">
              Tudo que você precisa para <span className="text-gradient">gerir seu negócio</span> em um só lugar.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Dashboards em tempo real, contratos, financeiro, alunos e relatórios — com a sofisticação de um produto enterprise.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-4">
              {[
                { v: "+12k", l: "Empresas" },
                { v: "99.9%", l: "Uptime" },
                { v: "4.9★", l: "Avaliação" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-2xl font-bold">{s.v}</div>
                  <div className="text-[11px] text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

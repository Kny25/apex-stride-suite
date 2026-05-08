import { createFileRoute } from "@tanstack/react-router";
import { DollarSign, Users, FileText, TrendingUp, Plus, Calendar as CalIcon } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar,
} from "recharts";
import { StatCard } from "@/components/app/stat-card";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { stats, revenueData, channelData, recentActivity } from "@/lib/mock-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "Dashboard — SGE" }] }),
});

const icons = [DollarSign, Users, FileText, TrendingUp];

function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Visão Geral"
        subtitle="Acompanhe os principais indicadores do seu negócio em tempo real."
        actions={
          <>
            <Button variant="outline"><CalIcon className="h-4 w-4" />Últimos 30 dias</Button>
            <Button variant="premium"><Plus className="h-4 w-4" />Novo Contrato</Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} icon={icons[i]} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card-premium shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Receita vs Despesa</h3>
              <p className="text-xs text-muted-foreground">Performance financeira nos últimos 12 meses</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.66 0.20 274)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.66 0.20 274)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gDesp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.74 0.18 295)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.74 0.18 295)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" vertical={false} />
                <XAxis dataKey="month" stroke="oklch(0.70 0.02 264)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.70 0.02 264)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.20 0.02 264)",
                    border: "1px solid oklch(1 0 0 / 0.08)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="receita" stroke="oklch(0.66 0.20 274)" strokeWidth={2.5} fill="url(#gRev)" />
                <Area type="monotone" dataKey="despesa" stroke="oklch(0.74 0.18 295)" strokeWidth={2} fill="url(#gDesp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card-premium shadow-card p-6">
          <h3 className="font-semibold">Canais de Aquisição</h3>
          <p className="text-xs text-muted-foreground mb-4">Distribuição por origem</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelData} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" vertical={false} />
                <XAxis dataKey="name" stroke="oklch(0.70 0.02 264)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.70 0.02 264)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "oklch(0.20 0.02 264)", border: "1px solid oklch(1 0 0 / 0.08)", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="value" fill="oklch(0.66 0.20 274)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card-premium shadow-card p-6">
          <h3 className="font-semibold mb-4">Atividades Recentes</h3>
          <div className="space-y-1">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs font-semibold">
                    {a.user.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    <span className="font-medium">{a.user}</span>{" "}
                    <span className="text-muted-foreground">{a.action}</span>{" "}
                    <span className="font-medium text-primary">{a.target}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card-premium shadow-card p-6">
          <h3 className="font-semibold">Próximos Vencimentos</h3>
          <p className="text-xs text-muted-foreground mb-4">Contratos a renovar</p>
          <div className="space-y-3">
            {[
              { c: "Globex S/A", d: "em 5 dias", v: "R$ 38.900" },
              { c: "Initech", d: "em 12 dias", v: "R$ 12.300" },
              { c: "Acme Ltda", d: "em 18 dias", v: "R$ 24.500" },
              { c: "Wayne Ent.", d: "em 27 dias", v: "R$ 89.000" },
            ].map((x) => (
              <div key={x.c} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                <div>
                  <div className="text-sm font-medium">{x.c}</div>
                  <div className="text-xs text-muted-foreground">{x.d}</div>
                </div>
                <div className="text-sm font-semibold text-primary">{x.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

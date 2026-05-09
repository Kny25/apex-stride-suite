import { useSyncExternalStore } from "react";

export type Sector = "administrativo" | "pedagogico" | "comercial" | "financeiro";

export const sectorLabel: Record<Sector, string> = {
  administrativo: "Administrativo",
  pedagogico: "Pedagógico",
  comercial: "Comercial",
  financeiro: "Financeiro",
};

export type EmployeeStatus = "ativo" | "ferias" | "inativo";

export type Atestado = {
  id: string;
  motivo: string;
  inicio: string;
  fim: string;
  dias: number;
};

export type Ausencia = {
  id: string;
  data: string;
  tipo: string;
  cid: string;
  duracao: number;
  unidade: "dias" | "horas";
  comprovante?: string;
};

export type Employee = {
  id: string;
  sector: Sector;
  nome: string;
  cargo: string;
  email: string;
  telefone: string;
  admissao: string;
  status: EmployeeStatus;
  salarioBruto: number;
  atestados: Atestado[];
  ausencias: Ausencia[];
  limiteAtestadosDias: number;
};

let employees: Employee[] = [
  {
    id: "1", sector: "pedagogico", nome: "Ana Carolina Souza", cargo: "Coordenadora Pedagógica",
    email: "ana.souza@sge.com", telefone: "(11) 98765-1010", admissao: "2021-03-15",
    status: "ativo", salarioBruto: 8500, limiteAtestadosDias: 15,
    atestados: [
      { id: "a1", motivo: "Consulta médica", inicio: "2026-02-12", fim: "2026-02-12", dias: 1 },
      { id: "a2", motivo: "Gripe", inicio: "2026-04-05", fim: "2026-04-07", dias: 3 },
    ],
    ausencias: [],
  },
  {
    id: "2", sector: "financeiro", nome: "Bruno Henrique Lima", cargo: "Analista Financeiro",
    email: "bruno.lima@sge.com", telefone: "(11) 98765-2020", admissao: "2022-08-01",
    status: "ativo", salarioBruto: 6200, limiteAtestadosDias: 15,
    atestados: [], ausencias: [],
  },
  {
    id: "3", sector: "administrativo", nome: "Carla Mendes", cargo: "Assistente Administrativo",
    email: "carla.mendes@sge.com", telefone: "(11) 98765-3030", admissao: "2026-02-10",
    status: "ativo", salarioBruto: 3800, limiteAtestadosDias: 15,
    atestados: [
      { id: "a3", motivo: "Cirurgia", inicio: "2026-03-01", fim: "2026-03-13", dias: 13 },
    ],
    ausencias: [],
  },
  {
    id: "4", sector: "comercial", nome: "Diego Ferreira", cargo: "Executivo Comercial",
    email: "diego.f@sge.com", telefone: "(11) 98765-4040", admissao: "2020-11-20",
    status: "ativo", salarioBruto: 7400, limiteAtestadosDias: 15,
    atestados: [], ausencias: [],
  },
  {
    id: "5", sector: "pedagogico", nome: "Elaine Cardoso", cargo: "Professora",
    email: "elaine.c@sge.com", telefone: "(11) 98765-5050", admissao: "2019-05-08",
    status: "ferias", salarioBruto: 5600, limiteAtestadosDias: 15,
    atestados: [], ausencias: [],
  },
  {
    id: "6", sector: "administrativo", nome: "Felipe Araújo", cargo: "Gerente Administrativo",
    email: "felipe.a@sge.com", telefone: "(11) 98765-6060", admissao: "2018-01-12",
    status: "ativo", salarioBruto: 11200, limiteAtestadosDias: 15,
    atestados: [], ausencias: [],
  },
  {
    id: "7", sector: "comercial", nome: "Gabriela Rocha", cargo: "SDR",
    email: "gabriela.r@sge.com", telefone: "(11) 98765-7070", admissao: "2024-09-02",
    status: "ativo", salarioBruto: 4200, limiteAtestadosDias: 15,
    atestados: [], ausencias: [],
  },
  {
    id: "8", sector: "financeiro", nome: "Henrique Silva", cargo: "Controller",
    email: "henrique.s@sge.com", telefone: "(11) 98765-8080", admissao: "2017-06-30",
    status: "ativo", salarioBruto: 14500, limiteAtestadosDias: 15,
    atestados: [], ausencias: [],
  },
];

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
const getSnapshot = () => employees;

export function useEmployees() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useEmployeesBySector(sector: Sector) {
  const all = useEmployees();
  return all.filter((e) => e.sector === sector);
}

export function useEmployee(id: string) {
  const all = useEmployees();
  return all.find((e) => e.id === id);
}

export function addEmployee(data: Omit<Employee, "id" | "atestados" | "ausencias" | "limiteAtestadosDias" | "status"> & Partial<Pick<Employee, "status">>) {
  const id = String(Date.now());
  employees = [
    ...employees,
    { ...data, id, status: data.status ?? "ativo", atestados: [], ausencias: [], limiteAtestadosDias: 15 },
  ];
  emit();
  return id;
}

export function updateEmployee(id: string, patch: Partial<Employee>) {
  employees = employees.map((e) => (e.id === id ? { ...e, ...patch } : e));
  emit();
}

export function addAtestado(id: string, a: Omit<Atestado, "id" | "dias">) {
  const dias = Math.max(1, Math.ceil((+new Date(a.fim) - +new Date(a.inicio)) / 86400000) + 1);
  const novo: Atestado = { ...a, id: String(Date.now()), dias };
  employees = employees.map((e) => (e.id === id ? { ...e, atestados: [...e.atestados, novo] } : e));
  emit();
}

export function addAusencia(id: string, a: Omit<Ausencia, "id">) {
  const novo: Ausencia = { ...a, id: String(Date.now()) };
  employees = employees.map((e) => (e.id === id ? { ...e, ausencias: [...e.ausencias, novo] } : e));
  emit();
}

export function totalAtestadoDias(e: Employee) {
  return e.atestados.reduce((sum, a) => sum + a.dias, 0);
}

export function atestadoSituacao(e: Employee): { label: string; tone: "ok" | "warn" | "danger" } {
  const used = totalAtestadoDias(e);
  const limit = e.limiteAtestadosDias;
  if (used > limit) return { label: "Ultrapassou os requisitos", tone: "danger" };
  if (used >= limit * 0.8) return { label: "Perto do limite", tone: "warn" };
  return { label: "Dentro dos requisitos", tone: "ok" };
}

export function calcEncargos(salarioBruto: number) {
  const fgts = salarioBruto * 0.08;
  const decimoTerceiro = salarioBruto / 12;
  const ferias = (salarioBruto + salarioBruto / 3) / 12;
  const total = fgts + decimoTerceiro + ferias;
  return { fgts, decimoTerceiro, ferias, total };
}

export function custoMensalTotal(salarioBruto: number) {
  const { total } = calcEncargos(salarioBruto);
  return salarioBruto + total;
}

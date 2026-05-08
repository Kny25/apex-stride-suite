export const stats = [
  { label: "Receita Total", value: "R$ 482.350", delta: "+12,4%", positive: true, hint: "vs mês anterior" },
  { label: "Usuários Ativos", value: "2.847", delta: "+5,2%", positive: true, hint: "últimos 30 dias" },
  { label: "Contratos Ativos", value: "184", delta: "+8 novos", positive: true, hint: "este mês" },
  { label: "Crescimento Mensal", value: "23,8%", delta: "+3,1%", positive: true, hint: "MoM" },
];

export const revenueData = [
  { month: "Jan", receita: 32000, despesa: 18000 },
  { month: "Fev", receita: 38000, despesa: 21000 },
  { month: "Mar", receita: 41000, despesa: 19500 },
  { month: "Abr", receita: 47000, despesa: 23000 },
  { month: "Mai", receita: 52000, despesa: 25500 },
  { month: "Jun", receita: 58000, despesa: 27000 },
  { month: "Jul", receita: 61000, despesa: 28500 },
  { month: "Ago", receita: 67000, despesa: 30000 },
  { month: "Set", receita: 72000, despesa: 31200 },
  { month: "Out", receita: 78000, despesa: 33000 },
  { month: "Nov", receita: 84000, despesa: 35000 },
  { month: "Dez", receita: 92000, despesa: 37500 },
];

export const channelData = [
  { name: "Orgânico", value: 4200 },
  { name: "Direto", value: 3100 },
  { name: "Referência", value: 1800 },
  { name: "Social", value: 2400 },
  { name: "Email", value: 1500 },
];

export const recentActivity = [
  { user: "Ana Costa", action: "criou um novo contrato", target: "#CT-2841", time: "há 2 min" },
  { user: "Bruno Lima", action: "registrou pagamento de", target: "R$ 4.500", time: "há 14 min" },
  { user: "Carla Mendes", action: "atualizou perfil de", target: "Pedro Souza", time: "há 1 h" },
  { user: "Diego Ramos", action: "concluiu relatório", target: "Mensal Out/25", time: "há 3 h" },
  { user: "Elisa Faria", action: "adicionou novo aluno", target: "Marcos Vieira", time: "ontem" },
];

export type User = {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  status: "ativo" | "pendente" | "inativo";
  criadoEm: string;
};

export const users: User[] = [
  { id: "U-001", nome: "Ana Costa", email: "ana@empresa.com", cargo: "Administradora", status: "ativo", criadoEm: "12/03/2025" },
  { id: "U-002", nome: "Bruno Lima", email: "bruno@empresa.com", cargo: "Financeiro", status: "ativo", criadoEm: "02/04/2025" },
  { id: "U-003", nome: "Carla Mendes", email: "carla@empresa.com", cargo: "RH", status: "pendente", criadoEm: "18/04/2025" },
  { id: "U-004", nome: "Diego Ramos", email: "diego@empresa.com", cargo: "Vendas", status: "ativo", criadoEm: "30/04/2025" },
  { id: "U-005", nome: "Elisa Faria", email: "elisa@empresa.com", cargo: "Suporte", status: "inativo", criadoEm: "10/05/2025" },
  { id: "U-006", nome: "Felipe Soares", email: "felipe@empresa.com", cargo: "Marketing", status: "ativo", criadoEm: "22/05/2025" },
  { id: "U-007", nome: "Gabriela Reis", email: "gabi@empresa.com", cargo: "Designer", status: "ativo", criadoEm: "01/06/2025" },
  { id: "U-008", nome: "Henrique Alves", email: "henrique@empresa.com", cargo: "Dev", status: "pendente", criadoEm: "11/06/2025" },
];

export type Contract = {
  id: string;
  cliente: string;
  valor: string;
  inicio: string;
  fim: string;
  status: "ativo" | "renovação" | "encerrado";
};

export const contracts: Contract[] = [
  { id: "CT-2841", cliente: "Acme Ltda", valor: "R$ 24.500", inicio: "01/03/2025", fim: "01/03/2026", status: "ativo" },
  { id: "CT-2842", cliente: "Globex S/A", valor: "R$ 38.900", inicio: "15/02/2025", fim: "15/02/2026", status: "ativo" },
  { id: "CT-2843", cliente: "Initech", valor: "R$ 12.300", inicio: "10/01/2025", fim: "10/01/2026", status: "renovação" },
  { id: "CT-2844", cliente: "Umbrella Co.", valor: "R$ 56.000", inicio: "05/05/2024", fim: "05/05/2025", status: "encerrado" },
  { id: "CT-2845", cliente: "Wayne Ent.", valor: "R$ 89.000", inicio: "20/06/2025", fim: "20/06/2026", status: "ativo" },
];

export type Payment = {
  id: string;
  contrato: string;
  cliente: string;
  valor: string;
  metodo: string;
  status: "pago" | "pendente" | "atrasado";
  data: string;
};

export const payments: Payment[] = [
  { id: "PY-9001", contrato: "CT-2841", cliente: "Acme Ltda", valor: "R$ 4.500", metodo: "PIX", status: "pago", data: "02/11/2025" },
  { id: "PY-9002", contrato: "CT-2842", cliente: "Globex S/A", valor: "R$ 6.200", metodo: "Boleto", status: "pendente", data: "08/11/2025" },
  { id: "PY-9003", contrato: "CT-2843", cliente: "Initech", valor: "R$ 1.900", metodo: "Cartão", status: "atrasado", data: "28/10/2025" },
  { id: "PY-9004", contrato: "CT-2845", cliente: "Wayne Ent.", valor: "R$ 12.000", metodo: "PIX", status: "pago", data: "01/11/2025" },
];

export type Student = {
  id: string;
  nome: string;
  email: string;
  curso: string;
  matricula: string;
  status: "ativo" | "trancado" | "formado";
};

export const students: Student[] = [
  { id: "AL-101", nome: "Marcos Vieira", email: "marcos@aluno.com", curso: "Engenharia", matricula: "2025-001", status: "ativo" },
  { id: "AL-102", nome: "Júlia Prado", email: "julia@aluno.com", curso: "Design", matricula: "2025-002", status: "ativo" },
  { id: "AL-103", nome: "Rafael Dias", email: "rafael@aluno.com", curso: "Marketing", matricula: "2024-187", status: "trancado" },
  { id: "AL-104", nome: "Sofia Nunes", email: "sofia@aluno.com", curso: "Administração", matricula: "2023-091", status: "formado" },
  { id: "AL-105", nome: "Tiago Rocha", email: "tiago@aluno.com", curso: "Engenharia", matricula: "2025-003", status: "ativo" },
];

export const notifications = [
  { id: 1, title: "Novo contrato assinado", desc: "Wayne Ent. — R$ 89.000", time: "agora" },
  { id: 2, title: "Pagamento atrasado", desc: "Initech — PY-9003", time: "1 h" },
  { id: 3, title: "Relatório mensal pronto", desc: "Out/2025 disponível", time: "3 h" },
];

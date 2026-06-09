-- Colaboradores
CREATE TABLE public.colaboradores (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setor text NOT NULL,
  nome text NOT NULL,
  cpf text,
  rg text,
  telefone text,
  email text,
  endereco text,
  cargo text NOT NULL,
  salario_bruto numeric NOT NULL DEFAULT 0,
  admissao date NOT NULL DEFAULT CURRENT_DATE,
  desligamento date,
  status text NOT NULL DEFAULT 'ativo',
  observacoes text,
  limite_atestados_dias integer NOT NULL DEFAULT 15,
  ativo boolean NOT NULL DEFAULT true,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.colaboradores TO anon, authenticated;
GRANT ALL ON public.colaboradores TO service_role;
ALTER TABLE public.colaboradores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso publico colaboradores" ON public.colaboradores FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_colaboradores_updated_at BEFORE UPDATE ON public.colaboradores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Atestados
CREATE TABLE public.rh_atestados (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  colaborador_id uuid NOT NULL REFERENCES public.colaboradores(id),
  motivo text NOT NULL,
  inicio date NOT NULL,
  fim date NOT NULL,
  dias integer NOT NULL DEFAULT 1,
  ativo boolean NOT NULL DEFAULT true,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rh_atestados TO anon, authenticated;
GRANT ALL ON public.rh_atestados TO service_role;
ALTER TABLE public.rh_atestados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso publico rh_atestados" ON public.rh_atestados FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_rh_atestados_updated_at BEFORE UPDATE ON public.rh_atestados FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Ausencias / frequencia
CREATE TABLE public.rh_ausencias (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  colaborador_id uuid NOT NULL REFERENCES public.colaboradores(id),
  data date NOT NULL,
  tipo text NOT NULL,
  cid text,
  motivo text,
  duracao numeric NOT NULL DEFAULT 1,
  unidade text NOT NULL DEFAULT 'dias',
  comprovante text,
  observacoes text,
  ativo boolean NOT NULL DEFAULT true,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rh_ausencias TO anon, authenticated;
GRANT ALL ON public.rh_ausencias TO service_role;
ALTER TABLE public.rh_ausencias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso publico rh_ausencias" ON public.rh_ausencias FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_rh_ausencias_updated_at BEFORE UPDATE ON public.rh_ausencias FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Documentos gerados
CREATE TABLE public.rh_documentos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  colaborador_id uuid NOT NULL REFERENCES public.colaboradores(id),
  tipo text NOT NULL,
  titulo text NOT NULL,
  dados jsonb NOT NULL DEFAULT '{}'::jsonb,
  arquivo_nome text,
  usuario text,
  gerado_em timestamptz NOT NULL DEFAULT now(),
  ativo boolean NOT NULL DEFAULT true,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rh_documentos TO anon, authenticated;
GRANT ALL ON public.rh_documentos TO service_role;
ALTER TABLE public.rh_documentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso publico rh_documentos" ON public.rh_documentos FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_rh_documentos_updated_at BEFORE UPDATE ON public.rh_documentos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Calculos de custos
CREATE TABLE public.rh_calculos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  colaborador_id uuid NOT NULL REFERENCES public.colaboradores(id),
  salario numeric NOT NULL DEFAULT 0,
  beneficios numeric NOT NULL DEFAULT 0,
  encargos numeric NOT NULL DEFAULT 0,
  custo_total numeric NOT NULL DEFAULT 0,
  periodo numeric NOT NULL DEFAULT 1,
  unidade text NOT NULL DEFAULT 'meses',
  data_calculo timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rh_calculos TO anon, authenticated;
GRANT ALL ON public.rh_calculos TO service_role;
ALTER TABLE public.rh_calculos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso publico rh_calculos" ON public.rh_calculos FOR ALL USING (true) WITH CHECK (true);

-- Historico / auditoria
CREATE TABLE public.rh_historico (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  colaborador_id uuid REFERENCES public.colaboradores(id),
  modulo text NOT NULL,
  acao text NOT NULL,
  descricao text,
  valor_anterior text,
  valor_novo text,
  usuario text NOT NULL DEFAULT 'Sistema',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rh_historico TO anon, authenticated;
GRANT ALL ON public.rh_historico TO service_role;
ALTER TABLE public.rh_historico ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso publico rh_historico" ON public.rh_historico FOR ALL USING (true) WITH CHECK (true);

-- Seed: colaboradores existentes do modulo RH
INSERT INTO public.colaboradores (setor, nome, cargo, email, telefone, admissao, status, salario_bruto) VALUES
('pedagogico', 'Ana Carolina Souza', 'Coordenadora Pedagógica', 'ana.souza@sge.com', '(11) 98765-1010', '2021-03-15', 'ativo', 8500),
('financeiro', 'Bruno Henrique Lima', 'Analista Financeiro', 'bruno.lima@sge.com', '(11) 98765-2020', '2022-08-01', 'ativo', 6200),
('administrativo', 'Carla Mendes', 'Assistente Administrativo', 'carla.mendes@sge.com', '(11) 98765-3030', '2026-02-10', 'ativo', 3800),
('comercial', 'Diego Ferreira', 'Executivo Comercial', 'diego.f@sge.com', '(11) 98765-4040', '2020-11-20', 'ativo', 7400),
('pedagogico', 'Elaine Cardoso', 'Professora', 'elaine.c@sge.com', '(11) 98765-5050', '2019-05-08', 'ferias', 5600),
('administrativo', 'Felipe Araújo', 'Gerente Administrativo', 'felipe.a@sge.com', '(11) 98765-6060', '2018-01-12', 'ativo', 11200),
('comercial', 'Gabriela Rocha', 'SDR', 'gabriela.r@sge.com', '(11) 98765-7070', '2024-09-02', 'ativo', 4200),
('financeiro', 'Henrique Silva', 'Controller', 'henrique.s@sge.com', '(11) 98765-8080', '2017-06-30', 'ativo', 14500);
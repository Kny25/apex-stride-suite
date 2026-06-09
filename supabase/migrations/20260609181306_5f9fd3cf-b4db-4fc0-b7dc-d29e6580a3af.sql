CREATE TABLE public.contas_pagar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao text NOT NULL,
  fornecedor text NOT NULL,
  categoria text NOT NULL,
  tipo text NOT NULL DEFAULT 'fixa',
  valor_previsto numeric(12,2) NOT NULL DEFAULT 0,
  vencimento date NOT NULL,
  observacoes text,
  status text NOT NULL DEFAULT 'pendente',
  data_pagamento date,
  valor_pago numeric(12,2),
  parcelada boolean NOT NULL DEFAULT false,
  parcela_numero integer,
  parcela_total integer,
  grupo_parcelamento uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contas_pagar TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contas_pagar TO authenticated;
GRANT ALL ON public.contas_pagar TO service_role;
ALTER TABLE public.contas_pagar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso publico contas_pagar" ON public.contas_pagar FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.folha_pagamento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cargo text NOT NULL,
  salario numeric(12,2) NOT NULL DEFAULT 0,
  data_pagamento date NOT NULL,
  observacoes text,
  status text NOT NULL DEFAULT 'pendente',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.folha_pagamento TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.folha_pagamento TO authenticated;
GRANT ALL ON public.folha_pagamento TO service_role;
ALTER TABLE public.folha_pagamento ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso publico folha_pagamento" ON public.folha_pagamento FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.caixa_movimentacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL,
  descricao text NOT NULL,
  categoria text NOT NULL,
  forma_pagamento text NOT NULL,
  valor numeric(12,2) NOT NULL DEFAULT 0,
  data date NOT NULL DEFAULT CURRENT_DATE,
  observacao text,
  conta_id uuid REFERENCES public.contas_pagar(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.caixa_movimentacoes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.caixa_movimentacoes TO authenticated;
GRANT ALL ON public.caixa_movimentacoes TO service_role;
ALTER TABLE public.caixa_movimentacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso publico caixa_movimentacoes" ON public.caixa_movimentacoes FOR ALL USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER update_contas_pagar_updated_at BEFORE UPDATE ON public.contas_pagar FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_folha_pagamento_updated_at BEFORE UPDATE ON public.folha_pagamento FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_caixa_movimentacoes_updated_at BEFORE UPDATE ON public.caixa_movimentacoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
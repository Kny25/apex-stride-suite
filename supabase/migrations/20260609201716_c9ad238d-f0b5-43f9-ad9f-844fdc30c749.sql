CREATE TABLE public.empresario_cursos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text,
  categoria text NOT NULL,
  nivel text NOT NULL DEFAULT 'Iniciante',
  carga_horaria text,
  link text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.empresario_cursos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.empresario_cursos TO authenticated;
GRANT ALL ON public.empresario_cursos TO service_role;

ALTER TABLE public.empresario_cursos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso publico empresario_cursos" ON public.empresario_cursos FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_empresario_cursos_updated_at BEFORE UPDATE ON public.empresario_cursos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
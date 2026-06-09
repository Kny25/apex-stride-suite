CREATE TABLE public.agenda_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date date NOT NULL,
  time text,
  category text NOT NULL DEFAULT 'lembrete',
  done boolean NOT NULL DEFAULT false,
  source text NOT NULL DEFAULT 'dashboard',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agenda_itens TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agenda_itens TO authenticated;
GRANT ALL ON public.agenda_itens TO service_role;
ALTER TABLE public.agenda_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso publico agenda_itens" ON public.agenda_itens FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_agenda_itens_updated_at BEFORE UPDATE ON public.agenda_itens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
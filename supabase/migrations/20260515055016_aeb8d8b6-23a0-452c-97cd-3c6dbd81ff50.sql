
CREATE TABLE public.athletes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  age integer NOT NULL,
  sport text NOT NULL,
  sprint_time numeric NOT NULL,
  jump_height numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.athletes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read athletes" ON public.athletes FOR SELECT USING (true);
CREATE POLICY "Public insert athletes" ON public.athletes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update athletes" ON public.athletes FOR UPDATE USING (true);
CREATE POLICY "Public delete athletes" ON public.athletes FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER athletes_updated_at BEFORE UPDATE ON public.athletes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

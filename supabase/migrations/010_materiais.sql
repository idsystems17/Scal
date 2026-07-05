CREATE TABLE materiais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  url TEXT NOT NULL,
  criado_por TEXT NOT NULL CHECK (criado_por IN ('admin', 'cliente')),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE materiais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cliente_manage_materiais" ON materiais FOR ALL USING (
  cliente_id IN (SELECT id FROM clientes WHERE user_id = auth.uid())
);

CREATE POLICY "parceiro_select_materiais" ON materiais FOR SELECT USING (
  cliente_id IS NULL
  OR cliente_id IN (SELECT cliente_id FROM parceiros WHERE user_id = auth.uid())
);

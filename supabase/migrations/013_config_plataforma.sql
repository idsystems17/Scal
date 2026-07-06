CREATE TABLE config_plataforma (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id = true),
  logo_url TEXT,
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO config_plataforma (id) VALUES (true);

ALTER TABLE config_plataforma ENABLE ROW LEVEL SECURITY;

CREATE POLICY "qualquer_usuario_le_config" ON config_plataforma FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS rate_limits (
  chave TEXT PRIMARY KEY,
  contagem INT NOT NULL DEFAULT 1,
  expira_em TIMESTAMPTZ NOT NULL
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION checar_rate_limit(p_chave TEXT, p_limite INT, p_janela_segundos INT)
RETURNS BOOLEAN AS $$
DECLARE
  v_registro rate_limits%ROWTYPE;
BEGIN
  SELECT * INTO v_registro FROM rate_limits WHERE chave = p_chave FOR UPDATE;

  IF NOT FOUND OR now() > v_registro.expira_em THEN
    INSERT INTO rate_limits (chave, contagem, expira_em)
    VALUES (p_chave, 1, now() + (p_janela_segundos || ' seconds')::INTERVAL)
    ON CONFLICT (chave) DO UPDATE
      SET contagem = 1, expira_em = now() + (p_janela_segundos || ' seconds')::INTERVAL;
    RETURN TRUE;
  END IF;

  IF v_registro.contagem >= p_limite THEN
    RETURN FALSE;
  END IF;

  UPDATE rate_limits SET contagem = contagem + 1 WHERE chave = p_chave;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

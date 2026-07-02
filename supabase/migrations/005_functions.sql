CREATE OR REPLACE FUNCTION incrementar_faturamento(p_cliente_id UUID, p_valor NUMERIC)
RETURNS VOID AS $$
DECLARE
  v_faturamento_novo NUMERIC;
  v_limite NUMERIC := 100000;
BEGIN
  UPDATE clientes
  SET faturamento_acumulado_scal = faturamento_acumulado_scal + p_valor
  WHERE id = p_cliente_id
  RETURNING faturamento_acumulado_scal INTO v_faturamento_novo;

  IF v_faturamento_novo >= v_limite THEN
    INSERT INTO alertas_plano (cliente_id, tipo, valor_no_momento)
    SELECT p_cliente_id, 'limite_faturamento_excedido', 'R$ ' || ROUND(v_faturamento_novo, 2)
    WHERE NOT EXISTS (
      SELECT 1 FROM alertas_plano
      WHERE cliente_id = p_cliente_id
        AND tipo = 'limite_faturamento_excedido'
        AND resolvido = FALSE
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION atualizar_contagem_parceiros(p_cliente_id UUID)
RETURNS VOID AS $$
DECLARE
  v_contagem INTEGER;
  v_limite INTEGER;
BEGIN
  SELECT COUNT(*), c.limite_parceiros_incluidos
  INTO v_contagem, v_limite
  FROM parceiros p
  JOIN clientes c ON c.id = p.cliente_id
  WHERE p.cliente_id = p_cliente_id AND p.status = 'ativo'
  GROUP BY c.limite_parceiros_incluidos;

  UPDATE clientes SET parceiros_ativos_contagem = v_contagem WHERE id = p_cliente_id;

  IF v_contagem > v_limite THEN
    INSERT INTO alertas_plano (cliente_id, tipo, valor_no_momento)
    SELECT p_cliente_id, 'limite_parceiros_excedido', v_contagem || ' parceiros'
    WHERE NOT EXISTS (
      SELECT 1 FROM alertas_plano
      WHERE cliente_id = p_cliente_id
        AND tipo = 'limite_parceiros_excedido'
        AND resolvido = FALSE
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

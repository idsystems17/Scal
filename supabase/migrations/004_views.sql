CREATE OR REPLACE VIEW vw_parceiro_dashboard AS
SELECT
  l.parceiro_id,
  l.id AS link_id,
  l.canal,
  l.codigo,
  l.destino_url,
  COUNT(DISTINCT cl.id) AS total_cliques,
  COUNT(DISTINCT cv.id) FILTER (WHERE cv.status = 'confirmada') AS total_conversoes,
  COALESCE(SUM(cv.valor_venda) FILTER (WHERE cv.status = 'confirmada'), 0) AS volume_vendas,
  ROUND(
    COUNT(DISTINCT cv.id) FILTER (WHERE cv.status = 'confirmada')::NUMERIC
    / NULLIF(COUNT(DISTINCT cl.id), 0) * 100, 2
  ) AS ctr_pct
FROM links l
LEFT JOIN cliques cl ON cl.link_id = l.id
LEFT JOIN conversoes cv ON cv.click_id = cl.click_id AND cv.cliente_id = l.cliente_id
GROUP BY l.parceiro_id, l.id, l.canal, l.codigo, l.destino_url;

CREATE OR REPLACE VIEW vw_parceiro_tendencia AS
SELECT
  l.parceiro_id,
  DATE_TRUNC('day', cl.criado_em)::DATE AS dia,
  COUNT(DISTINCT cl.id) AS cliques,
  COUNT(DISTINCT cv.id) FILTER (WHERE cv.status = 'confirmada') AS vendas
FROM links l
JOIN cliques cl ON cl.link_id = l.id
LEFT JOIN conversoes cv ON cv.click_id = cl.click_id
WHERE cl.criado_em >= NOW() - INTERVAL '30 days'
GROUP BY l.parceiro_id, dia
ORDER BY dia;

CREATE OR REPLACE VIEW vw_cliente_dashboard AS
SELECT
  p.cliente_id,
  p.id AS parceiro_id,
  p.nome,
  p.codigo_unico,
  p.status,
  COUNT(DISTINCT cl.id) AS total_cliques,
  COUNT(DISTINCT cv.id) FILTER (WHERE cv.status = 'confirmada') AS total_conversoes,
  COALESCE(SUM(cv.valor_venda) FILTER (WHERE cv.status = 'confirmada'), 0) AS total_faturado,
  ROUND(
    COUNT(DISTINCT cv.id) FILTER (WHERE cv.status = 'confirmada')::NUMERIC
    / NULLIF(COUNT(DISTINCT cl.id), 0) * 100, 2
  ) AS taxa_conversao,
  MAX(cv.criado_em) FILTER (WHERE cv.status = 'confirmada') AS ultima_venda
FROM parceiros p
LEFT JOIN links l ON l.parceiro_id = p.id
LEFT JOIN cliques cl ON cl.link_id = l.id
LEFT JOIN conversoes cv ON cv.parceiro_id = p.id AND cv.status = 'confirmada'
GROUP BY p.cliente_id, p.id, p.nome, p.codigo_unico, p.status;

CREATE OR REPLACE VIEW vw_admin_dashboard AS
SELECT
  c.id AS cliente_id,
  c.nome_loja,
  c.plataforma_detectada,
  c.webhook_confirmado,
  c.parceiros_ativos_contagem,
  c.limite_parceiros_incluidos,
  c.faturamento_acumulado_scal,
  c.status,
  (SELECT COUNT(*) FROM alertas_plano ap WHERE ap.cliente_id = c.id AND ap.resolvido = FALSE) AS alertas_pendentes
FROM clientes c;

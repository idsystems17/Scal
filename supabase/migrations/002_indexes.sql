CREATE INDEX idx_links_codigo ON links(codigo) WHERE ativo = TRUE;
CREATE INDEX idx_conversoes_cliente ON conversoes(cliente_id, criado_em DESC);
CREATE INDEX idx_conversoes_parceiro ON conversoes(parceiro_id, criado_em DESC);
CREATE INDEX idx_cliques_link ON cliques(link_id, criado_em DESC);
CREATE INDEX idx_alertas_nao_resolvidos ON alertas_plano(resolvido, notificado_em DESC) WHERE resolvido = FALSE;
CREATE INDEX idx_cliques_click_id ON cliques(click_id);

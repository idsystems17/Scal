ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE parceiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE cliques ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas_plano ENABLE ROW LEVEL SECURITY;
ALTER TABLE convites ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;

-- CLIENTES
CREATE POLICY "cliente_select_own" ON clientes FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "cliente_update_own" ON clientes FOR UPDATE USING (user_id = auth.uid());

-- PARCEIROS
CREATE POLICY "parceiro_select_own" ON parceiros FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "cliente_select_parceiros" ON parceiros FOR SELECT USING (
  cliente_id IN (SELECT id FROM clientes WHERE user_id = auth.uid())
);
CREATE POLICY "cliente_manage_parceiros" ON parceiros FOR ALL USING (
  cliente_id IN (SELECT id FROM clientes WHERE user_id = auth.uid())
);

-- LINKS
CREATE POLICY "parceiro_select_links" ON links FOR SELECT USING (
  parceiro_id IN (SELECT id FROM parceiros WHERE user_id = auth.uid())
);
CREATE POLICY "parceiro_insert_links" ON links FOR INSERT WITH CHECK (
  parceiro_id IN (SELECT id FROM parceiros WHERE user_id = auth.uid())
);
CREATE POLICY "cliente_select_links" ON links FOR SELECT USING (
  cliente_id IN (SELECT id FROM clientes WHERE user_id = auth.uid())
);

-- CLIQUES
CREATE POLICY "parceiro_select_cliques" ON cliques FOR SELECT USING (
  link_id IN (
    SELECT id FROM links WHERE parceiro_id IN (
      SELECT id FROM parceiros WHERE user_id = auth.uid()
    )
  )
);
CREATE POLICY "cliente_select_cliques" ON cliques FOR SELECT USING (
  cliente_id IN (SELECT id FROM clientes WHERE user_id = auth.uid())
);

-- CONVERSOES
CREATE POLICY "parceiro_select_conversoes" ON conversoes FOR SELECT USING (
  parceiro_id IN (SELECT id FROM parceiros WHERE user_id = auth.uid())
);
CREATE POLICY "cliente_select_conversoes" ON conversoes FOR SELECT USING (
  cliente_id IN (SELECT id FROM clientes WHERE user_id = auth.uid())
);

-- ALERTAS_PLANO
CREATE POLICY "cliente_select_alertas" ON alertas_plano FOR SELECT USING (
  cliente_id IN (SELECT id FROM clientes WHERE user_id = auth.uid())
);

-- CONVITES
CREATE POLICY "cliente_manage_convites" ON convites FOR ALL USING (
  cliente_id IN (SELECT id FROM clientes WHERE user_id = auth.uid())
);

-- AUDIT_LOG (imutável — só insert)
CREATE POLICY "sistema_insert_audit" ON audit_log FOR INSERT WITH CHECK (TRUE);

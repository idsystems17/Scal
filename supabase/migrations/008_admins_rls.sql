ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_select_own" ON admins FOR SELECT USING (user_id = auth.uid());

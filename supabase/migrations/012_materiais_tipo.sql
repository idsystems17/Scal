ALTER TABLE materiais
  ADD COLUMN tipo TEXT NOT NULL DEFAULT 'link' CHECK (tipo IN ('link', 'video', 'audio'));

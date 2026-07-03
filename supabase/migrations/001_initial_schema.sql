CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_loja TEXT NOT NULL,
  url_loja TEXT NOT NULL,
  plataforma_detectada TEXT,
  nomenclatura_parceiro TEXT DEFAULT 'Parceiro',
  webhook_secret TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  webhook_confirmado BOOLEAN DEFAULT FALSE,
  webhook_ultimo_evento TIMESTAMPTZ,
  plano_atual TEXT DEFAULT 'mvp',
  limite_parceiros_incluidos INTEGER DEFAULT 20,
  parceiros_ativos_contagem INTEGER DEFAULT 0,
  faturamento_acumulado_scal NUMERIC(15,2) DEFAULT 0,
  status TEXT DEFAULT 'trial' CHECK (status IN ('trial','ativo','suspenso','cancelado')),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE parceiros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  codigo_unico TEXT NOT NULL,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo','pendente','bloqueado')),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cliente_id, codigo_unico)
);

CREATE TABLE links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parceiro_id UUID NOT NULL REFERENCES parceiros(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL UNIQUE,
  destino_url TEXT NOT NULL,
  canal TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cliques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  click_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  ip_hash TEXT,
  user_agent TEXT,
  referrer TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE conversoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  click_id UUID REFERENCES cliques(click_id),
  parceiro_id UUID REFERENCES parceiros(id),
  pedido_externo_id TEXT NOT NULL,
  valor_venda NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'confirmada' CHECK (status IN ('confirmada','cancelada')),
  webhook_payload_raw JSONB,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cliente_id, pedido_externo_id)
);

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ator_tipo TEXT CHECK (ator_tipo IN ('admin','cliente','parceiro','sistema')),
  ator_id UUID,
  acao TEXT NOT NULL,
  detalhes_json JSONB,
  ip TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('clique','webhook_recebido','conversao_confirmada','estorno','erro')),
  payload_json JSONB,
  ator_tipo TEXT,
  ator_id UUID,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE alertas_plano (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('limite_parceiros_excedido','limite_faturamento_excedido')),
  valor_no_momento TEXT,
  notificado_em TIMESTAMPTZ DEFAULT NOW(),
  resolvido BOOLEAN DEFAULT FALSE,
  resolvido_em TIMESTAMPTZ
);

CREATE TABLE convites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  email_destinatario TEXT,
  usado BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- C. Brasil Contabilidade - Schema Inicial
-- Executar no SQL Editor do Supabase
-- ============================================

-- 1. LEADS (vindos do chat SDR do site)
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  nome TEXT NOT NULL,
  tipo_organizacao TEXT,
  nome_organizacao TEXT,
  necessidade TEXT,
  tamanho TEXT,
  urgencia TEXT,
  contato TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'novo' CHECK (status IN ('novo', 'contatado', 'qualificado', 'convertido', 'perdido')),
  notas TEXT
);

-- 2. CLIENTES (organizações ativas)
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  nome TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('igreja', 'ong', 'associacao', 'fundacao', 'empresa', 'outro')),
  cnpj TEXT UNIQUE,
  responsavel TEXT,
  email TEXT,
  telefone TEXT,
  endereco TEXT,
  regime_tributario TEXT,
  data_inicio DATE,
  ativo BOOLEAN DEFAULT true,
  notas TEXT,
  lead_id UUID REFERENCES leads(id)
);

-- 3. DEALS (pipeline comercial)
CREATE TABLE deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  lead_id UUID REFERENCES leads(id),
  client_id UUID REFERENCES clients(id),
  titulo TEXT NOT NULL,
  valor_mensal DECIMAL(10,2),
  etapa TEXT DEFAULT 'qualificacao' CHECK (etapa IN ('qualificacao', 'proposta', 'negociacao', 'fechado_ganho', 'fechado_perdido')),
  responsavel TEXT,
  previsao_fechamento DATE,
  motivo_perda TEXT,
  notas TEXT
);

-- 4. SERVICOS CONTRATADOS (por cliente)
CREATE TABLE client_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  servico TEXT NOT NULL,
  valor DECIMAL(10,2),
  periodicidade TEXT DEFAULT 'mensal' CHECK (periodicidade IN ('mensal', 'trimestral', 'anual', 'pontual')),
  ativo BOOLEAN DEFAULT true,
  data_inicio DATE DEFAULT CURRENT_DATE
);

-- 5. PLANO DE CONTAS (para o sistema financeiro dos clientes)
CREATE TABLE chart_of_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('ativo', 'passivo', 'receita', 'despesa', 'patrimonio')),
  natureza TEXT CHECK (natureza IN ('devedora', 'credora')),
  pai_id UUID REFERENCES chart_of_accounts(id),
  ativo BOOLEAN DEFAULT true
);

-- 6. LANÇAMENTOS FINANCEIROS (clientes registram aqui)
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  conta_debito TEXT NOT NULL,
  conta_credito TEXT NOT NULL,
  valor DECIMAL(12,2) NOT NULL CHECK (valor > 0),
  historico TEXT,
  complemento TEXT,
  centro_custo TEXT,
  documento TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'revisado', 'exportado')),
  revisado_por TEXT,
  revisado_em TIMESTAMPTZ
);

-- 7. ATIVIDADES/TAREFAS (gestão interna)
CREATE TABLE activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  tipo TEXT CHECK (tipo IN ('tarefa', 'lembrete', 'reuniao', 'ligacao', 'email')),
  titulo TEXT NOT NULL,
  descricao TEXT,
  client_id UUID REFERENCES clients(id),
  deal_id UUID REFERENCES deals(id),
  responsavel TEXT,
  data_vencimento DATE,
  concluida BOOLEAN DEFAULT false,
  concluida_em TIMESTAMPTZ
);

-- ============================================
-- INDICES para performance
-- ============================================
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created ON leads(created_at DESC);
CREATE INDEX idx_clients_ativo ON clients(ativo);
CREATE INDEX idx_clients_tipo ON clients(tipo);
CREATE INDEX idx_deals_etapa ON deals(etapa);
CREATE INDEX idx_transactions_client ON transactions(client_id);
CREATE INDEX idx_transactions_data ON transactions(data DESC);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_activities_vencimento ON activities(data_vencimento);
CREATE INDEX idx_activities_client ON activities(client_id);

-- ============================================
-- ROW LEVEL SECURITY (habilitar depois de configurar auth)
-- ============================================
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Policy para o chat SDR inserir leads (acesso anônimo, só INSERT)
CREATE POLICY "Permite inserção anônima de leads" ON leads
  FOR INSERT TO anon
  WITH CHECK (true);

-- Policy para leitura autenticada de todas as tabelas
CREATE POLICY "Leitura autenticada" ON leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leitura autenticada" ON clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leitura autenticada" ON deals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leitura autenticada" ON client_services FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leitura autenticada" ON chart_of_accounts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leitura autenticada" ON transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leitura autenticada" ON activities FOR SELECT TO authenticated USING (true);

-- Policy para escrita autenticada
CREATE POLICY "Escrita autenticada" ON leads FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Escrita autenticada" ON clients FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Escrita autenticada" ON deals FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Escrita autenticada" ON client_services FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Escrita autenticada" ON chart_of_accounts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Escrita autenticada" ON transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Escrita autenticada" ON activities FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- TRIGGER para atualizar updated_at nos deals
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

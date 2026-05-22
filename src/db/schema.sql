-- AVRS Platform Database Schema
-- Autonomous Venture Replication System
-- Manages 15-venture portfolio with execution framework

-- ============================================================================
-- CORE VENTURE MANAGEMENT
-- ============================================================================

CREATE TABLE ventures (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  market_tam BIGINT,
  market_growth_rate DECIMAL(5,2),
  competitive_advantage TEXT,
  founder_expertise TEXT,
  business_model VARCHAR(100),
  status VARCHAR(50) DEFAULT 'planning',
  phase INT DEFAULT 1,
  launch_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name)
);

CREATE TABLE venture_metrics (
  id SERIAL PRIMARY KEY,
  venture_id INT NOT NULL REFERENCES ventures(id),
  customers INT DEFAULT 0,
  mrr DECIMAL(12,2) DEFAULT 0,
  arr DECIMAL(12,2) DEFAULT 0,
  growth_rate_mom DECIMAL(5,2) DEFAULT 0,
  cac DECIMAL(10,2) DEFAULT 0,
  ltv DECIMAL(10,2) DEFAULT 0,
  retention_rate DECIMAL(5,2) DEFAULT 0,
  nrr DECIMAL(5,2) DEFAULT 0,
  csat_score DECIMAL(3,1) DEFAULT 0,
  nps_score INT DEFAULT 0,
  uptime_percentage DECIMAL(5,2) DEFAULT 99.9,
  error_rate DECIMAL(5,2) DEFAULT 0,
  response_time_ms INT DEFAULT 0,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (venture_id) REFERENCES ventures(id)
);

CREATE TABLE venture_phases (
  id SERIAL PRIMARY KEY,
  venture_id INT NOT NULL REFERENCES ventures(id),
  phase_number INT NOT NULL,
  phase_name VARCHAR(100) NOT NULL,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending',
  objectives TEXT,
  deliverables TEXT,
  success_metrics TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (venture_id) REFERENCES ventures(id),
  UNIQUE(venture_id, phase_number)
);

-- ============================================================================
-- EXECUTION FRAMEWORK (7 PHASES)
-- ============================================================================

CREATE TABLE execution_phases (
  id SERIAL PRIMARY KEY,
  phase_number INT UNIQUE NOT NULL,
  phase_name VARCHAR(100) NOT NULL,
  start_day INT NOT NULL,
  end_day INT NOT NULL,
  duration_days INT NOT NULL,
  description TEXT,
  objectives TEXT,
  key_deliverables TEXT,
  success_criteria TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE phase_tasks (
  id SERIAL PRIMARY KEY,
  phase_id INT NOT NULL REFERENCES execution_phases(id),
  task_number INT NOT NULL,
  task_name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_days INT,
  dependencies TEXT,
  owner_role VARCHAR(100),
  success_metrics TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- VENTURE PLAYBOOK & REPLICATION
-- ============================================================================

CREATE TABLE venture_playbooks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  market_category VARCHAR(100),
  tam_minimum BIGINT,
  tam_maximum BIGINT,
  business_model VARCHAR(100),
  revenue_model TEXT,
  pricing_strategy TEXT,
  unit_economics TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name)
);

CREATE TABLE playbook_steps (
  id SERIAL PRIMARY KEY,
  playbook_id INT NOT NULL REFERENCES venture_playbooks(id),
  step_number INT NOT NULL,
  step_name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_days INT,
  resources_required TEXT,
  success_criteria TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE venture_replications (
  id SERIAL PRIMARY KEY,
  source_venture_id INT REFERENCES ventures(id),
  target_venture_id INT REFERENCES ventures(id),
  playbook_id INT REFERENCES venture_playbooks(id),
  replication_status VARCHAR(50) DEFAULT 'planning',
  customizations TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- ============================================================================
-- TEAM & ORGANIZATION
-- ============================================================================

CREATE TABLE team_members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(100) NOT NULL,
  position VARCHAR(100),
  venture_id INT REFERENCES ventures(id),
  salary DECIMAL(12,2),
  equity_percentage DECIMAL(5,2),
  start_date DATE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE team_roles (
  id SERIAL PRIMARY KEY,
  role_name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  responsibilities TEXT,
  salary_range_min DECIMAL(12,2),
  salary_range_max DECIMAL(12,2),
  equity_range_min DECIMAL(5,2),
  equity_range_max DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- FUNDING & CAPITAL
-- ============================================================================

CREATE TABLE funding_rounds (
  id SERIAL PRIMARY KEY,
  venture_id INT NOT NULL REFERENCES ventures(id),
  round_name VARCHAR(100) NOT NULL,
  round_type VARCHAR(50),
  target_amount DECIMAL(15,2),
  raised_amount DECIMAL(15,2) DEFAULT 0,
  valuation DECIMAL(15,2),
  dilution_percentage DECIMAL(5,2),
  start_date DATE,
  close_date DATE,
  status VARCHAR(50) DEFAULT 'planning',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE investors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  focus_area TEXT,
  check_size_min DECIMAL(12,2),
  check_size_max DECIMAL(12,2),
  portfolio_companies INT DEFAULT 0,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name)
);

CREATE TABLE investor_relationships (
  id SERIAL PRIMARY KEY,
  venture_id INT NOT NULL REFERENCES ventures(id),
  investor_id INT NOT NULL REFERENCES investors(id),
  relationship_status VARCHAR(50) DEFAULT 'prospect',
  last_contact_date TIMESTAMP,
  next_follow_up_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- AUTONOMOUS OPERATIONS
-- ============================================================================

CREATE TABLE autonomous_systems (
  id SERIAL PRIMARY KEY,
  venture_id INT NOT NULL REFERENCES ventures(id),
  system_name VARCHAR(100) NOT NULL,
  system_type VARCHAR(100),
  description TEXT,
  automation_level DECIMAL(3,1),
  status VARCHAR(50) DEFAULT 'active',
  last_execution TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sales_pipelines (
  id SERIAL PRIMARY KEY,
  venture_id INT NOT NULL REFERENCES ventures(id),
  pipeline_name VARCHAR(100),
  total_leads INT DEFAULT 0,
  qualified_leads INT DEFAULT 0,
  in_negotiation INT DEFAULT 0,
  closed_deals INT DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  average_deal_size DECIMAL(12,2) DEFAULT 0,
  sales_cycle_days INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE marketing_campaigns (
  id SERIAL PRIMARY KEY,
  venture_id INT NOT NULL REFERENCES ventures(id),
  campaign_name VARCHAR(255) NOT NULL,
  campaign_type VARCHAR(100),
  channel VARCHAR(100),
  budget DECIMAL(12,2),
  spend DECIMAL(12,2) DEFAULT 0,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  conversions INT DEFAULT 0,
  roi DECIMAL(5,2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customer_success (
  id SERIAL PRIMARY KEY,
  venture_id INT NOT NULL REFERENCES ventures(id),
  total_customers INT DEFAULT 0,
  active_customers INT DEFAULT 0,
  churned_customers INT DEFAULT 0,
  onboarded_this_month INT DEFAULT 0,
  support_tickets_open INT DEFAULT 0,
  avg_resolution_time_hours DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PORTFOLIO ANALYTICS
-- ============================================================================

CREATE TABLE portfolio_metrics (
  id SERIAL PRIMARY KEY,
  snapshot_date DATE UNIQUE NOT NULL,
  total_ventures INT DEFAULT 0,
  active_ventures INT DEFAULT 0,
  total_customers INT DEFAULT 0,
  total_mrr DECIMAL(15,2) DEFAULT 0,
  total_arr DECIMAL(15,2) DEFAULT 0,
  total_team_size INT DEFAULT 0,
  total_funding_raised DECIMAL(15,2) DEFAULT 0,
  portfolio_valuation DECIMAL(15,2) DEFAULT 0,
  weighted_growth_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE venture_comparisons (
  id SERIAL PRIMARY KEY,
  venture_1_id INT NOT NULL REFERENCES ventures(id),
  venture_2_id INT NOT NULL REFERENCES ventures(id),
  metric_name VARCHAR(100),
  venture_1_value DECIMAL(15,2),
  venture_2_value DECIMAL(15,2),
  variance_percentage DECIMAL(5,2),
  comparison_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SCALING & EXPANSION
-- ============================================================================

CREATE TABLE market_expansions (
  id SERIAL PRIMARY KEY,
  venture_id INT NOT NULL REFERENCES ventures(id),
  market_name VARCHAR(100) NOT NULL,
  market_type VARCHAR(50),
  tam_in_market BIGINT,
  entry_date DATE,
  status VARCHAR(50) DEFAULT 'planning',
  customers_acquired INT DEFAULT 0,
  mrr_from_market DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_features (
  id SERIAL PRIMARY KEY,
  venture_id INT NOT NULL REFERENCES ventures(id),
  feature_name VARCHAR(255) NOT NULL,
  description TEXT,
  priority INT,
  status VARCHAR(50) DEFAULT 'backlog',
  development_start_date DATE,
  launch_date DATE,
  adoption_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- EXIT STRATEGY & OUTCOMES
-- ============================================================================

CREATE TABLE exit_strategies (
  id SERIAL PRIMARY KEY,
  venture_id INT NOT NULL REFERENCES ventures(id),
  exit_type VARCHAR(50),
  target_valuation DECIMAL(15,2),
  target_timeline_years INT,
  potential_acquirers TEXT,
  ipo_readiness_score DECIMAL(3,1),
  strategic_buyers TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE venture_exits (
  id SERIAL PRIMARY KEY,
  venture_id INT NOT NULL REFERENCES ventures(id),
  exit_type VARCHAR(50),
  acquirer_name VARCHAR(255),
  exit_valuation DECIMAL(15,2),
  exit_date DATE,
  deal_terms TEXT,
  investor_return_multiple DECIMAL(10,2),
  founder_outcome TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- AUDIT & COMPLIANCE
-- ============================================================================

CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  venture_id INT REFERENCES ventures(id),
  action VARCHAR(255) NOT NULL,
  actor VARCHAR(100),
  details TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE compliance_checklist (
  id SERIAL PRIMARY KEY,
  venture_id INT NOT NULL REFERENCES ventures(id),
  item_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  due_date DATE,
  completed_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_ventures_status ON ventures(status);
CREATE INDEX idx_ventures_phase ON ventures(phase);
CREATE INDEX idx_venture_metrics_venture_id ON venture_metrics(venture_id);
CREATE INDEX idx_venture_metrics_recorded_at ON venture_metrics(recorded_at);
CREATE INDEX idx_team_members_venture_id ON team_members(venture_id);
CREATE INDEX idx_funding_rounds_venture_id ON funding_rounds(venture_id);
CREATE INDEX idx_funding_rounds_status ON funding_rounds(status);
CREATE INDEX idx_sales_pipelines_venture_id ON sales_pipelines(venture_id);
CREATE INDEX idx_marketing_campaigns_venture_id ON marketing_campaigns(venture_id);
CREATE INDEX idx_portfolio_metrics_snapshot_date ON portfolio_metrics(snapshot_date);
CREATE INDEX idx_audit_logs_venture_id ON audit_logs(venture_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);

-- ============================================================================
-- INITIAL DATA: EXECUTION PHASES
-- ============================================================================

INSERT INTO execution_phases (phase_number, phase_name, start_day, end_day, duration_days, description, objectives, key_deliverables, success_criteria) VALUES
(1, 'Preparation', 1, 4, 4, 'Set up infrastructure for venture execution', 'Establish holding company, hire executive team, set up legal infrastructure', 'Holding company established, executive team hired, legal infrastructure ready', 'Team hired 100%, legal setup 100%, governance defined'),
(2, 'First Venture Launch', 5, 28, 24, 'Launch first venture and validate business model', 'Build MVP, run pilot program, launch to market', 'Production-ready product, 20+ pilot customers, Series A pitch deck', 'Customers 20+, MRR $5K+, CSAT 4.5+/5'),
(3, 'Product Expansion', 29, 110, 82, 'Expand first venture and prepare for scaling', 'Add 4 new features, expand to new markets, hire 50+ team', '4+ new features, 3+ new markets, 50+ new team members', 'Customers 100+, MRR $50K+, growth 50%+ MoM'),
(4, 'Series A Fundraising', 111, 150, 40, 'Raise Series A funding for first venture', 'Prepare pitch deck, conduct investor meetings, negotiate terms', 'Series A funding $5M+, lead investor, capital deployment plan', 'Funding $5M+, valuation $50M+, dilution <15%'),
(5, 'International Expansion', 151, 210, 60, 'Expand internationally and launch Series B', 'Market analysis, localization, Series B fundraising', 'Presence in 3+ countries, Series B funding $25M+, global team 200+', 'International customers 100+, Series B $25M+'),
(6, 'IPO & Public Markets', 211, 270, 60, 'Take first venture public', 'IPO preparation, SEC filing, roadshow, launch', 'Public company status, IPO proceeds $500M+, market cap $5B+', 'IPO price $30+/share, market cap $5B+'),
(7, 'Portfolio Expansion', 271, 470, 200, 'Launch additional ventures and build portfolio', 'Launch ventures 2-15, holding company IPO', '15 ventures operating, $2.9M MRR, $6.5B+ enterprise value', 'Ventures 15, customers 3,680+, MRR $2.9M');

-- ============================================================================
-- INITIAL DATA: VENTURE PLAYBOOKS
-- ============================================================================

INSERT INTO venture_playbooks (name, description, market_category, tam_minimum, tam_maximum, business_model, revenue_model, pricing_strategy, unit_economics) VALUES
('Government Contracting', 'RCBID INTEL - AI-powered government bid discovery', 'Government', 500000000000, 1000000000000, 'SaaS', 'Subscription + transaction fees', 'Starter $99, Pro $299, Enterprise $999', 'CAC $0, LTV $2850, LTV/CAC Infinite'),
('Cleantech Energy', 'VEPKAR - Duct-integrated energy recovery', 'Energy', 100000000000, 500000000000, 'Hardware + SaaS', 'Product sales + service', 'Enterprise custom pricing', 'CAC $500, LTV $50000, LTV/CAC 100:1'),
('Grant Management', 'GRANTFORGE - Grant discovery and application', 'Funding', 50000000000, 200000000000, 'SaaS', 'Subscription + success fees', 'Starter $99, Pro $299, Enterprise $999', 'CAC $100, LTV $5000, LTV/CAC 50:1'),
('Construction Management', 'RCBUILD - Construction project management', 'Construction', 100000000000, 500000000000, 'SaaS', 'Subscription + professional services', 'Starter $199, Pro $499, Enterprise $1999', 'CAC $200, LTV $10000, LTV/CAC 50:1'),
('Business Operations', 'RCSCALE - Business automation and scaling', 'Operations', 200000000000, 1000000000000, 'SaaS', 'Subscription + consulting', 'Starter $99, Pro $299, Enterprise $999', 'CAC $50, LTV $5000, LTV/CAC 100:1');

-- ============================================================================
-- INITIAL DATA: TEAM ROLES
-- ============================================================================

INSERT INTO team_roles (role_name, description, responsibilities, salary_range_min, salary_range_max, equity_range_min, equity_range_max) VALUES
('CEO', 'Chief Executive Officer - Venture leadership', 'Vision, strategy, fundraising, board management', 150000, 250000, 5, 15),
('CTO', 'Chief Technology Officer - Product and engineering', 'Technology, product strategy, engineering leadership', 200000, 300000, 3, 10),
('CFO', 'Chief Financial Officer - Finance and operations', 'Finance, accounting, investor relations, operations', 180000, 280000, 2, 8),
('VP Sales', 'Vice President of Sales - Revenue generation', 'Sales strategy, team leadership, revenue targets', 150000, 250000, 2, 8),
('VP Marketing', 'Vice President of Marketing - Brand and growth', 'Marketing strategy, campaigns, brand building', 120000, 200000, 1, 5),
('Product Manager', 'Product Manager - Product strategy', 'Product roadmap, feature prioritization, user research', 120000, 180000, 1, 4),
('Engineer', 'Software Engineer - Development', 'Feature development, code quality, technical execution', 100000, 180000, 0.5, 2),
('Sales Rep', 'Sales Representative - Customer acquisition', 'Lead generation, demos, deal closing', 60000, 120000, 0.1, 1);

-- ============================================================================
-- INITIAL DATA: SAMPLE VENTURE (RCBID INTEL)
-- ============================================================================

INSERT INTO ventures (name, description, market_tam, market_growth_rate, competitive_advantage, founder_expertise, business_model, status, phase, launch_date) VALUES
('RCBID INTEL', 'AI-powered government bid discovery and matching', 500000000000, 15.5, 'AI matching algorithm with 40% higher win rate', 'Government contracting expertise', 'SaaS', 'active', 2, '2026-05-22');

INSERT INTO venture_metrics (venture_id, customers, mrr, arr, growth_rate_mom, cac, ltv, retention_rate, nrr, csat_score, nps_score) VALUES
(1, 50, 15000, 180000, 25.5, 300, 2850, 95, 120, 4.7, 72);

INSERT INTO venture_phases (venture_id, phase_number, phase_name, status, objectives, deliverables, success_metrics) VALUES
(1, 1, 'Preparation', 'completed', 'Set up infrastructure', 'Team hired, legal setup', 'Team 100%, legal 100%'),
(1, 2, 'First Venture Launch', 'in_progress', 'Launch and validate', '20+ customers, MVP', 'Customers 20+, MRR $5K+'),
(1, 3, 'Product Expansion', 'pending', 'Expand product and market', '4 new features, 3 markets', 'Customers 100+, MRR $50K+');

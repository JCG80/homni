# Database Design

## 🗄 Database Architecture

Homni uses **Supabase PostgreSQL** with comprehensive **Row Level Security (RLS)** policies for data isolation and security.

## 📊 Core Data Models

### User Management

```sql
-- Core user profiles extending Supabase Auth
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  display_name TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role user_role DEFAULT 'user',
  company_id UUID REFERENCES company_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Company profiles for business users
CREATE TABLE company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  org_number TEXT UNIQUE,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  website TEXT,
  logo_url TEXT,
  subscription_plan TEXT DEFAULT 'basic',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Lead Management

```sql
-- Lead submissions from users
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  service_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  budget_range TEXT,
  urgency TEXT DEFAULT 'normal',
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  status lead_status DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Lead assignments to companies
CREATE TABLE lead_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) NOT NULL,
  company_id UUID REFERENCES company_profiles(id) NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  price DECIMAL(10,2),
  status assignment_status DEFAULT 'pending',
  expires_at TIMESTAMPTZ,
  purchased_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ
);
```

### System Configuration

```sql
-- Feature flag management
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  target_roles TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Module metadata for plugin architecture
CREATE TABLE module_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  version TEXT DEFAULT '1.0.0',
  dependencies TEXT[] DEFAULT '{}',
  feature_flags JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

## 🔒 Row Level Security (RLS)

### User Data Isolation

```sql
-- Users can only access their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Company members can view company data
CREATE POLICY "Company members can view company profile" ON company_profiles
  FOR SELECT USING (
    id IN (
      SELECT company_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );
```

### Lead Access Control

```sql
-- Lead submitters and assigned companies can view leads
CREATE POLICY "Lead access control" ON leads
  FOR SELECT USING (
    auth.uid() = user_id OR  -- Lead owner
    EXISTS (  -- Assigned company members
      SELECT 1 FROM lead_assignments la
      JOIN user_profiles up ON up.company_id = la.company_id
      WHERE la.lead_id = id AND up.user_id = auth.uid()
    )
  );

-- Company members can view their assignments
CREATE POLICY "Company lead assignments" ON lead_assignments
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );
```

### Admin Oversight

```sql
-- Admins can view all data for management
CREATE POLICY "Admin full access" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'master_admin')
    )
  );
```

## 🚀 Performance Optimizations

### Indexing Strategy

```sql
-- User lookup optimization
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_company_id ON user_profiles(company_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);

-- Lead querying optimization
CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_service_type ON leads(service_type);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);

-- Lead assignment optimization
CREATE INDEX idx_lead_assignments_lead_id ON lead_assignments(lead_id);
CREATE INDEX idx_lead_assignments_company_id ON lead_assignments(company_id);
CREATE INDEX idx_lead_assignments_status ON lead_assignments(status);

-- Feature flag performance
CREATE INDEX idx_feature_flags_name ON feature_flags(name);
CREATE INDEX idx_feature_flags_enabled ON feature_flags(is_enabled);
```

### Query Patterns

```sql
-- Efficient lead distribution query
SELECT l.*, la.price, la.status as assignment_status
FROM leads l
LEFT JOIN lead_assignments la ON l.id = la.lead_id 
  AND la.company_id = $1
WHERE l.service_type = $2 
  AND l.status = 'active'
  AND (la.id IS NULL OR la.status IN ('pending', 'viewed'))
ORDER BY l.created_at DESC
LIMIT 20;

-- Company dashboard metrics
SELECT 
  COUNT(*) FILTER (WHERE status = 'pending') as pending_leads,
  COUNT(*) FILTER (WHERE status = 'purchased') as purchased_leads,
  AVG(price) FILTER (WHERE purchased_at IS NOT NULL) as avg_price
FROM lead_assignments 
WHERE company_id = $1 
  AND created_at >= NOW() - INTERVAL '30 days';
```

## 🔧 Database Functions

### Automated Triggers

```sql
-- Update timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Business Logic Functions

```sql
-- Lead scoring for distribution
CREATE OR REPLACE FUNCTION calculate_lead_score(lead_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  lead_record leads;
BEGIN
  SELECT * INTO lead_record FROM leads WHERE id = lead_id;
  
  -- Base score
  score := 50;
  
  -- Budget factor
  IF lead_record.budget_range LIKE '%50000%' THEN
    score := score + 20;
  END IF;
  
  -- Urgency factor
  IF lead_record.urgency = 'urgent' THEN
    score := score + 15;
  END IF;
  
  -- Completeness factor
  IF lead_record.contact_phone IS NOT NULL THEN
    score := score + 10;
  END IF;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 📋 Data Validation

### Enum Types

```sql
-- User roles enumeration
CREATE TYPE user_role AS ENUM (
  'guest', 'user', 'company', 'content_editor', 'admin', 'master_admin'
);

-- Lead status workflow
CREATE TYPE lead_status AS ENUM (
  'draft', 'pending', 'active', 'assigned', 'completed', 'cancelled'
);

-- Assignment status tracking
CREATE TYPE assignment_status AS ENUM (
  'pending', 'viewed', 'purchased', 'declined', 'expired'
);
```

### Constraints

```sql
-- Data quality constraints
ALTER TABLE user_profiles ADD CONSTRAINT valid_email 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE leads ADD CONSTRAINT valid_budget_range
  CHECK (budget_range IN ('under_10k', '10k_25k', '25k_50k', '50k_100k', 'over_100k'));

ALTER TABLE feature_flags ADD CONSTRAINT valid_rollout_percentage
  CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100);
```

## 🔄 Migration Strategy

### Version Control
- All schema changes tracked in `supabase/migrations/`
- Rollback scripts for all destructive changes
- Staging environment testing before production

### Data Migration Patterns
```sql
-- Safe column addition
ALTER TABLE user_profiles ADD COLUMN new_field TEXT;

-- Safe column removal (two-step process)
-- Step 1: Make optional
ALTER TABLE user_profiles ALTER COLUMN old_field DROP NOT NULL;
-- Step 2: Remove after deployment
ALTER TABLE user_profiles DROP COLUMN old_field;
```
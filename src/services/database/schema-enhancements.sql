-- Enhanced Database Schema for Structured, Semi-structured, and Unstructured Data
-- This file contains SQL migrations to enhance the existing schema

-- 1. Add JSONB columns for flexible data storage
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS 
  custom_fields JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}';

ALTER TABLE brand ADD COLUMN IF NOT EXISTS 
  brand_settings JSONB DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}';

ALTER TABLE product ADD COLUMN IF NOT EXISTS 
  specifications JSONB DEFAULT '{}',
  custom_attributes JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}';

ALTER TABLE franchisee ADD COLUMN IF NOT EXISTS 
  business_data JSONB DEFAULT '{}',
  performance_metrics JSONB DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}';

-- 2. Create document storage table for unstructured data
CREATE TABLE IF NOT EXISTS documents (
  document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchisor_id UUID NOT NULL REFERENCES franchisor(franchisor_id),
  entity_type VARCHAR(50) NOT NULL, -- 'franchisee', 'brand', 'training', etc.
  entity_id UUID, -- Reference to the related entity
  document_type VARCHAR(50) NOT NULL, -- 'contract', 'manual', 'image', 'video', etc.
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_path TEXT, -- Path to file in storage
  file_size BIGINT,
  mime_type VARCHAR(100),
  content_text TEXT, -- Extracted text content for search
  tags TEXT[], -- Array of tags for categorization
  metadata JSONB DEFAULT '{}', -- Flexible metadata
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 3. Create flexible configuration table
CREATE TABLE IF NOT EXISTS configurations (
  config_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchisor_id UUID NOT NULL REFERENCES franchisor(franchisor_id),
  config_key VARCHAR(100) NOT NULL,
  config_value JSONB NOT NULL,
  config_type VARCHAR(50) DEFAULT 'general', -- 'system', 'brand', 'user', etc.
  description TEXT,
  is_encrypted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(franchisor_id, config_key)
);

-- 4. Create analytics events table for tracking
CREATE TABLE IF NOT EXISTS analytics_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchisor_id UUID NOT NULL REFERENCES franchisor(franchisor_id),
  user_id UUID REFERENCES auth.users(id),
  event_type VARCHAR(100) NOT NULL,
  event_name VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50), -- What was acted upon
  entity_id UUID, -- ID of the entity
  properties JSONB DEFAULT '{}', -- Event properties
  session_id VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create flexible forms table for dynamic forms
CREATE TABLE IF NOT EXISTS dynamic_forms (
  form_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchisor_id UUID NOT NULL REFERENCES franchisor(franchisor_id),
  form_name VARCHAR(100) NOT NULL,
  form_type VARCHAR(50) NOT NULL, -- 'application', 'survey', 'evaluation', etc.
  title VARCHAR(255) NOT NULL,
  description TEXT,
  schema JSONB NOT NULL, -- JSON Schema for form structure
  ui_schema JSONB DEFAULT '{}', -- UI configuration
  validation_rules JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create form responses table
CREATE TABLE IF NOT EXISTS form_responses (
  response_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES dynamic_forms(form_id),
  franchisor_id UUID NOT NULL REFERENCES franchisor(franchisor_id),
  respondent_id UUID REFERENCES auth.users(id),
  entity_type VARCHAR(50), -- What entity this response is for
  entity_id UUID, -- ID of the related entity
  response_data JSONB NOT NULL, -- The actual form response
  metadata JSONB DEFAULT '{}',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- 7. Create flexible notifications table
CREATE TABLE IF NOT EXISTS notifications (
  notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchisor_id UUID NOT NULL REFERENCES franchisor(franchisor_id),
  recipient_id UUID REFERENCES auth.users(id),
  notification_type VARCHAR(50) NOT NULL,
  channel VARCHAR(50) NOT NULL, -- 'email', 'sms', 'push', 'in_app'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}', -- Additional notification data
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed'
  read_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create search index table for full-text search
CREATE TABLE IF NOT EXISTS search_index (
  index_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchisor_id UUID NOT NULL REFERENCES franchisor(franchisor_id),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  title VARCHAR(255),
  content TEXT,
  keywords TEXT[],
  metadata JSONB DEFAULT '{}',
  search_vector tsvector,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Create workflow definitions table
CREATE TABLE IF NOT EXISTS workflows (
  workflow_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchisor_id UUID NOT NULL REFERENCES franchisor(franchisor_id),
  workflow_name VARCHAR(100) NOT NULL,
  workflow_type VARCHAR(50) NOT NULL, -- 'onboarding', 'approval', 'training', etc.
  description TEXT,
  definition JSONB NOT NULL, -- Workflow definition (steps, conditions, etc.)
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Create workflow instances table
CREATE TABLE IF NOT EXISTS workflow_instances (
  instance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(workflow_id),
  franchisor_id UUID NOT NULL REFERENCES franchisor(franchisor_id),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  current_step VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'failed', 'cancelled'
  context JSONB DEFAULT '{}', -- Workflow context and variables
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  started_by UUID REFERENCES auth.users(id)
);

-- 11. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_franchisor_entity ON documents(franchisor_id, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_documents_content_search ON documents USING gin(to_tsvector('english', content_text));
CREATE INDEX IF NOT EXISTS idx_analytics_events_franchisor_type ON analytics_events(franchisor_id, event_type, timestamp);
CREATE INDEX IF NOT EXISTS idx_search_index_vector ON search_index USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_status ON notifications(recipient_id, status, created_at);

-- 12. Add GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_user_profiles_metadata ON user_profiles USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_brand_metadata ON brand USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_product_specifications ON product USING gin(specifications);
CREATE INDEX IF NOT EXISTS idx_franchisee_metadata ON franchisee USING gin(metadata);

-- 13. Create triggers for search index updates
CREATE OR REPLACE FUNCTION update_search_index()
RETURNS TRIGGER AS $$
BEGIN
  -- Update search vector when content changes
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.content, ''));
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_search_index
  BEFORE INSERT OR UPDATE ON search_index
  FOR EACH ROW
  EXECUTE FUNCTION update_search_index();

-- 14. Create function for flexible data validation
CREATE OR REPLACE FUNCTION validate_json_schema(data JSONB, schema JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- This is a simplified validation function
  -- In production, you might want to use a more robust JSON Schema validator
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- 15. Create materialized view for analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics_summary AS
SELECT 
  franchisor_id,
  DATE_TRUNC('day', timestamp) as date,
  event_type,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT session_id) as unique_sessions
FROM analytics_events
GROUP BY franchisor_id, DATE_TRUNC('day', timestamp), event_type;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_summary_unique 
ON analytics_summary(franchisor_id, date, event_type);

-- 16. Add RLS (Row Level Security) policies for new tables
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (example for documents table)
CREATE POLICY "Users can access documents from their franchisor" ON documents
  FOR ALL USING (
    franchisor_id IN (
      SELECT franchisor_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- 17. Create functions for common operations
CREATE OR REPLACE FUNCTION get_entity_metadata(
  p_franchisor_id UUID,
  p_entity_type VARCHAR,
  p_entity_id UUID
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  CASE p_entity_type
    WHEN 'user' THEN
      SELECT metadata INTO result FROM user_profiles 
      WHERE user_id = p_entity_id AND franchisor_id = p_franchisor_id;
    WHEN 'brand' THEN
      SELECT metadata INTO result FROM brand 
      WHERE brand_id = p_entity_id AND franchisor_id = p_franchisor_id;
    WHEN 'product' THEN
      SELECT metadata INTO result FROM product 
      WHERE product_id = p_entity_id AND franchisor_id = p_franchisor_id;
    WHEN 'franchisee' THEN
      SELECT metadata INTO result FROM franchisee 
      WHERE franchisee_id = p_entity_id AND franchisor_id = p_franchisor_id;
    ELSE
      result := '{}'::JSONB;
  END CASE;
  
  RETURN COALESCE(result, '{}'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 18. Create function for full-text search across entities
CREATE OR REPLACE FUNCTION search_entities(
  p_franchisor_id UUID,
  p_query TEXT,
  p_entity_types TEXT[] DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE(
  entity_type VARCHAR,
  entity_id UUID,
  title VARCHAR,
  content TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    si.entity_type,
    si.entity_id,
    si.title,
    si.content,
    ts_rank(si.search_vector, plainto_tsquery('english', p_query)) as rank
  FROM search_index si
  WHERE si.franchisor_id = p_franchisor_id
    AND si.search_vector @@ plainto_tsquery('english', p_query)
    AND (p_entity_types IS NULL OR si.entity_type = ANY(p_entity_types))
  ORDER BY rank DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

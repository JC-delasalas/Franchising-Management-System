-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'franchisee', 'franchisor', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create franchises table
CREATE TABLE IF NOT EXISTS franchises (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    investment_range_min DECIMAL(12,2),
    investment_range_max DECIMAL(12,2),
    franchise_fee DECIMAL(12,2),
    royalty_fee DECIMAL(5,2),
    territory TEXT,
    support_provided TEXT[],
    requirements TEXT[],
    contact_email TEXT,
    contact_phone TEXT,
    website_url TEXT,
    logo_url TEXT,
    images TEXT[],
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    featured BOOLEAN DEFAULT FALSE,
    owner_id UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create franchise applications table
CREATE TABLE IF NOT EXISTS franchise_applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
    applicant_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
    application_data JSONB,
    notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES user_profiles(id)
);

-- Create franchise locations table
CREATE TABLE IF NOT EXISTS franchise_locations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
    franchisee_id UUID REFERENCES user_profiles(id),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT,
    country TEXT DEFAULT 'Philippines',
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    phone TEXT,
    email TEXT,
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'construction', 'open', 'closed')),
    opening_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create franchise documents table
CREATE TABLE IF NOT EXISTS franchise_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    category TEXT CHECK (category IN ('legal', 'marketing', 'operations', 'training', 'other')),
    is_public BOOLEAN DEFAULT FALSE,
    uploaded_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create franchise reviews table
CREATE TABLE IF NOT EXISTS franchise_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    review_text TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(franchise_id, reviewer_id)
);

-- Create franchise analytics table
CREATE TABLE IF NOT EXISTS franchise_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(15,2),
    metric_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS (Row Level Security) policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchises ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchise_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchise_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchise_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchise_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchise_analytics ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Franchises policies
CREATE POLICY "Anyone can view active franchises" ON franchises
    FOR SELECT USING (status = 'active');

CREATE POLICY "Franchise owners can manage their franchises" ON franchises
    FOR ALL USING (auth.uid() = owner_id);

-- Franchise applications policies
CREATE POLICY "Users can view their own applications" ON franchise_applications
    FOR SELECT USING (auth.uid() = applicant_id);

CREATE POLICY "Users can create applications" ON franchise_applications
    FOR INSERT WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Franchise owners can view applications for their franchises" ON franchise_applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM franchises 
            WHERE franchises.id = franchise_applications.franchise_id 
            AND franchises.owner_id = auth.uid()
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_franchises_category ON franchises(category);
CREATE INDEX IF NOT EXISTS idx_franchises_status ON franchises(status);
CREATE INDEX IF NOT EXISTS idx_franchises_featured ON franchises(featured);
CREATE INDEX IF NOT EXISTS idx_franchise_applications_status ON franchise_applications(status);
CREATE INDEX IF NOT EXISTS idx_franchise_locations_franchise_id ON franchise_locations(franchise_id);
CREATE INDEX IF NOT EXISTS idx_franchise_reviews_franchise_id ON franchise_reviews(franchise_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_franchises_updated_at BEFORE UPDATE ON franchises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_franchise_locations_updated_at BEFORE UPDATE ON franchise_locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_franchise_reviews_updated_at BEFORE UPDATE ON franchise_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

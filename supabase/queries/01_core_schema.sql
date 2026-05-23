-- =========================================================================
-- HABITTA BASE SCHEMA (Hackathon Optimized)
-- =========================================================================
-- Concepto: Multi-tenant (Organizaciones), flexible para diferentes nichos.

-- 1. ENUMS (Para integridad de datos simple y rápida)
CREATE TYPE org_type AS ENUM ('residential', 'construction', 'real_estate', 'other');
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE asset_status AS ENUM ('active', 'maintenance', 'inactive');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE attachment_context AS ENUM ('ticket', 'asset', 'event');

-- 2. TABLAS PRINCIPALES

-- Opcional: Tabla de perfiles atada a auth.users de Supabase
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Organizaciones (Tu entidad Multi-Tenant principal)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type org_type DEFAULT 'other',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Relación Usuarios <-> Organizaciones
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role user_role DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    UNIQUE(organization_id, user_id) -- Un usuario no puede estar dos veces en la misma org
);

-- Activos (Casas, maquinaria, edificios, etc. Concepto abstracto)
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    location TEXT, -- Puede ser una URL de Maps, un string, etc.
    status asset_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Categorías de Tickets (Permite a la org configurar sus propios temas)
CREATE TABLE ticket_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT
);

-- Tickets (Gestión operativa)
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES profiles(id),
    asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    category_id UUID REFERENCES ticket_categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status ticket_status DEFAULT 'open',
    priority ticket_priority DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Agenda (Eventos, mantenimientos programados)
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES profiles(id),
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE, -- Relacionado a un ticket opcionalmente
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,  -- Relacionado a un activo opcionalmente
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Adjuntos (Archivos de Supabase Storage enlazados a entidades)
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    uploader_id UUID NOT NULL REFERENCES profiles(id),
    context attachment_context NOT NULL,
    record_id UUID NOT NULL, -- ID del ticket, asset o event
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 3. ÍNDICES DE RENDIMIENTO (Clave para escalabilidad)
-- Como las consultas siempre filtrarán por organización (multi-tenant), indexamos esto.
CREATE INDEX idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX idx_assets_org_id ON assets(organization_id);
CREATE INDEX idx_tickets_org_id ON tickets(organization_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_events_org_id_time ON events(organization_id, start_time);
CREATE INDEX idx_attachments_record ON attachments(context, record_id);

-- 4. TRIGGERS PARA UPDATED_AT (Automatización básica)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_modtime BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_assets_modtime BEFORE UPDATE ON assets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tickets_modtime BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

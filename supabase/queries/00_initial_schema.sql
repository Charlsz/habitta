// Aquí colocaremos todas las consultas SQL y migraciones de la base de datos de Supabase.
// Así podrás copiarlas y ejecutarlas en el SQL Editor de tu proyecto en Supabase.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: public.organizations
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Ejemplo de política: Solo lectura temporal a nivel público (Modificar después para Auth)
CREATE POLICY "Allow public read access" 
ON public.organizations FOR SELECT USING (true);

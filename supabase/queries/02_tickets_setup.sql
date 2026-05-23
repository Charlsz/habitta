-- =========================================================================
-- HABITTA TICKETS SETUP: Comentarios y Storage
-- =========================================================================

-- 1. Tabla de comentarios para "respuestas administrativas"
CREATE TABLE public.ticket_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES profiles(id),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE INDEX idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);

-- 2. Configurar Supabase Storage para los adjuntos
-- (Nota: Deberás correr esto y luego asegurarte por el Dashboard de que "attachments" es público o tiene RLS, 
-- pero el script crea el bucket por ti)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Crear política temporal en storage para la hackathon (Lecura publica, subida autenticados)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'attachments');
CREATE POLICY "Auth Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'attachments' AND auth.role() = 'authenticated');

-- 3. Crear algunas categorías por defecto para que no inicies vacío.
-- Para evitar conflictos, podrías crear un trigger, pero por ahora permitiremos categorías null.

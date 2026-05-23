-- =========================================================================
-- PATCH: Añadir Estado a los Eventos de la Agenda
-- =========================================================================

-- Como queremos aprobar y rechazar eventos (p.ej. reservas de áreas comunes o mantenimientos),
-- necesitamos agregar un campo "status" a la tabla que creamos en el master.

CREATE TYPE event_status AS ENUM ('pending', 'approved', 'rejected', 'completed');

ALTER TABLE public.events 
ADD COLUMN status event_status DEFAULT 'pending';

-- Índice para búsquedas rápidas por estado (importante para dashboards operativos)
CREATE INDEX idx_events_status ON public.events(status);

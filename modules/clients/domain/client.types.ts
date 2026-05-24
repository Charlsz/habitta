// ─────────────────────────────────────────────
// "Clients" = Residentes / Clientes / Compradores
// Nombre genérico que funciona para todas las
// verticales: residencial, inmobiliaria, construcción
// ─────────────────────────────────────────────

export type ClientStatus = 'active' | 'inactive' | 'pending';

export type ClientRelationType =
  | 'owner'     // Propietario
  | 'tenant'    // Arrendatario
  | 'resident'  // Residente (sin título de propiedad)
  | 'buyer'     // Comprador (construcción)
  | 'other';

export type DocumentType = 'cc' | 'ce' | 'passport' | 'nit' | 'other';

export interface ClientMetadata {
  tower?:   string;
  floor?:   number | string;
  unit?:    string;
  parking?: string;
  [key: string]: unknown;
}

export interface Client {
  id:                  string;
  organization_id:     string;
  asset_id:            string | null;
  full_name:           string;
  email:               string | null;
  phone:               string | null;
  document_type:       DocumentType | null;
  document_number:     string | null;
  telegram_session_id: string | null;
  relation_type:       ClientRelationType;
  move_in_date:        string | null;
  move_out_date:       string | null;
  status:              ClientStatus;
  notes:               string | null;
  metadata:            ClientMetadata;
  created_at:          string;
  updated_at:          string;
  // joins
  assets?:        { name: string; code: string | null; asset_type: string; location: string | null } | null;
  chat_sessions?: { telegram_chat_id: string; display_name: string | null; telegram_username: string | null } | null;
}

export interface ClientWithStats {
  id:              string;
  full_name:       string;
  email:           string | null;
  phone:           string | null;
  status:          ClientStatus;
  relation_type:   ClientRelationType;
  move_in_date:    string | null;
  asset_id:        string | null;
  asset_name:      string | null;
  asset_code:      string | null;
  telegram_chat_id: string | null;
  open_tickets:    number;
  last_ticket_at:  string | null;
  metadata:        ClientMetadata;
  created_at:      string;
}

export interface CreateClientInput {
  organization_id:     string;
  asset_id?:           string | null;
  full_name:           string;
  email?:              string | null;
  phone?:              string | null;
  document_type?:      DocumentType | null;
  document_number?:    string | null;
  telegram_session_id?: string | null;
  relation_type?:      ClientRelationType;
  move_in_date?:       string | null;
  move_out_date?:      string | null;
  notes?:              string | null;
  metadata?:           ClientMetadata;
}

/** Labels adaptados por vertical */
export const RELATION_LABELS: Record<ClientRelationType, string> = {
  owner:    'Propietario',
  tenant:   'Arrendatario',
  resident: 'Residente',
  buyer:    'Comprador',
  other:    'Otro',
};

export const STATUS_LABELS: Record<ClientStatus, string> = {
  active:   'Activo',
  inactive: 'Inactivo',
  pending:  'Pendiente',
};

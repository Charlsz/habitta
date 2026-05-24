export type ResidentStatus = 'active' | 'inactive' | 'pending';
export type ResidentRelationType = 'owner' | 'tenant' | 'resident' | 'buyer' | 'other';

export interface ResidentMetadata {
  tower?: string;
  floor?: number | string;
  unit?: string;
  parking?: string;
  [key: string]: unknown;
}

export interface Resident {
  id: string;
  organization_id: string;
  asset_id: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  document_type: string | null;
  document_number: string | null;
  telegram_session_id: string | null;
  relation_type: ResidentRelationType;
  move_in_date: string | null;
  move_out_date: string | null;
  status: ResidentStatus;
  notes: string | null;
  metadata: ResidentMetadata;
  created_at: string;
  updated_at: string;
  // joined
  assets?: { name: string; code: string | null; asset_type: string } | null;
  chat_sessions?: { telegram_chat_id: string; display_name: string | null } | null;
}

export interface ResidentWithStats {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  status: ResidentStatus;
  relation_type: ResidentRelationType;
  move_in_date: string | null;
  asset_id: string | null;
  asset_name: string | null;
  asset_code: string | null;
  telegram_chat_id: string | null;
  open_tickets: number;
  last_ticket_at: string | null;
  metadata: ResidentMetadata;
  created_at: string;
}

export interface CreateResidentInput {
  organization_id: string;
  asset_id?: string | null;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  document_type?: string | null;
  document_number?: string | null;
  telegram_session_id?: string | null;
  relation_type?: ResidentRelationType;
  move_in_date?: string | null;
  notes?: string | null;
  metadata?: ResidentMetadata;
}

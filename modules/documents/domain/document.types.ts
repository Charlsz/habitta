export type DocumentStatus = 'confirming' | 'generating' | 'ready' | 'error';

export interface GeneratedDocument {
  id: string;
  organization_id: string;
  created_by: string;
  title: string;
  prompt: string;
  confirmed_data: ConfirmedData;
  content: string;
  pdf_url: string | null;
  pdf_path: string | null;
  status: DocumentStatus;
  created_at: string;
  updated_at: string;
}

export interface ConfirmedData {
  title: string;
  sections: string[];
  recipient: string | null;
  date: string;
  extra_notes: string | null;
  confirmation_message: string;
}

export interface DocumentSend {
  id: string;
  document_id: string;
  chat_session_id: string;
  sent_by: string;
  sent_at: string;
}

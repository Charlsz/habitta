export interface TicketCategory {
  id:              string;
  organization_id: string;
  name:            string;
  description:     string | null;
  color:           string;
  created_at:      string;
}

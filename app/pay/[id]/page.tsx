import { createClient } from '@/lib/supabase/server';
import { PayPageClient } from './PayPageClient';

export default async function PayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: payment } = await supabase
    .from('payments')
    .select('id, resident_name, concept, amount, currency, due_date, status')
    .eq('id', id)
    .maybeSingle();

  return <PayPageClient payment={payment} />;
}

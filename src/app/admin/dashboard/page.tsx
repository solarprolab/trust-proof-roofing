export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const cookieStore = cookies();
  const auth = cookieStore.get('admin_auth');
  if (!auth || auth.value !== 'authenticated') redirect('/admin');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  return <DashboardClient leads={leads || []} />;
}

'use server';

import { createClient } from '@supabase/supabase-js';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email e senha são obrigatórios' };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data?.user?.id) {
    console.error('Login Error:', error?.message);
    return { error: 'Credenciais inválidas' };
  }

  // Fetch the user's restaurant_id from the users table
  const { data: userData } = await supabase
    .from('users')
    .select('restaurant_id, role')
    .eq('id', data.user.id)
    .single();

  // Save session — cookies() must be awaited in Next.js 14+
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  session.userId = data.user.id;
  session.restaurantId = userData?.restaurant_id ?? undefined;
  session.role = userData?.role ?? undefined;
  await session.save();

  redirect('/admin/dashboard');
}

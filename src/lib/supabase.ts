import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'bill_maker';
  is_active: boolean;
  password_hash: string | null;
  created_at: string;
}

export interface Sadhak {
  id: string;
  name: string;
  phone: string | null;
  default_amount: number | null;
  created_at: string;
}

export interface Receipt {
  receipt_no: number;
  sadhak_id: string;
  amount: number;
  date: string;
  payment_mode: string;
  remarks: string | null;
  created_by: string;
  created_at: string;
  // Joined field
  sadhak_name?: string;
}

export interface Settings {
  id: number;
  whatsapp_group_link: string | null;
  org_name: string;
  org_address: string;
  org_phone: string;
  org_email: string;
  updated_at: string;
}

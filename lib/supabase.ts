
import { createClient } from '@supabase/supabase-js';

// Credenciais fornecidas pelo usuário
const supabaseUrl = 'https://jddsfarngvajjnbetfyb.supabase.co';
const supabaseKey = 'sb_publishable_vyVwInqWpOrg80zLZYr1ug_RxV00Cgt';

export const supabase = createClient(supabaseUrl, supabaseKey);

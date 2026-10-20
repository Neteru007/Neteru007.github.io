import { createClient } from '@supabase/supabase-js';
import { publicConfig } from '../config/public-config';
export const supabase = createClient(publicConfig.supabaseUrl, publicConfig.supabasePublishableKey);

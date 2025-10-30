import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oxehooznbwiubjmdekoj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94ZWhvb3puYndpdWJqbWRla29qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MDk3ODgsImV4cCI6MjA3NzI4NTc4OH0.EWE076WUyj7pqq6A-efwUi4NeD6KuWDpVMEIvDmzOew';

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL and Key must be provided.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

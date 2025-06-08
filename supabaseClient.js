import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lbddgxbwsgxhqakzumvv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZGRneGJ3c2d4aHFha3p1bXZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MDE2OTMsImV4cCI6MjA2NDk3NzY5M30.xtNA1a7ZWH3IMK_Eq-s69B8aN7Or4RRYkiFDmfJN780';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

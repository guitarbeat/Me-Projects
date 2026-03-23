import { createClient } from '@supabase/supabase-js';

// To run this script securely:
// VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... npx tsx test_supabase.ts
// Usage: export VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... && npx tsx test_supabase.ts
// Or use dotenv: npx dotenv -e .env npx tsx test_supabase.ts

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Error: Missing environment variables.');
  console.error(
    'Please run with: VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... npx tsx test_supabase.ts'
  );
  console.error(
    'Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables.'
  );
  console.error('Please set them before running this script.');
  process.exit(1);
}

const supabase = createClient(url, key);

async function test() {
  console.log('Testing profiles...');
  const { data, error, status } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);
  console.log('Status:', status);
  console.log('Error:', error);
  console.log('Data:', data);
}

test();

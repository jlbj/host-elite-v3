import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dcaarwmafbrqdmwbulpt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_-M4hsMXU4AtkApvRMbB41g_HzRQTwY6';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runMigration() {
  console.log('Running MDX content migration...');
  
  const sql = `
    ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS mdx_content TEXT;
    COMMENT ON COLUMN public.properties.mdx_content IS 'MDX content for custom website/microsite layouts';
  `;

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('Migration error:', error);
      console.log('\nNote: You may need to use the service_role key instead of the publishable key.');
      console.log('Get it from: Supabase Dashboard → Settings → API → service_role key');
    } else {
      console.log('✓ Migration completed successfully!');
      console.log('Data:', data);
    }
  } catch (err) {
    console.error('Migration failed:', err.message);
    console.log('\nTo run manually, execute this SQL in Supabase SQL Editor:');
    console.log(sql);
  }
}

runMigration();
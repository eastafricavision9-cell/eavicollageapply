const { createClient } = require('@supabase/supabase-js')

// Test Supabase connection
async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...')
  
  const supabaseUrl = 'https://jnctixpcgiivoxfqzypa.supabase.co'
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuY3RpeHBjZ2lpdm94ZnF6eXBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3OTM5MjUsImV4cCI6MjA3NDM2OTkyNX0.1HaRN3ZmYLrPYhElV2lfrEC2qSrgIeWXlXYHLxRL12Y'
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Test basic connection
    const { data, error } = await supabase.from('_test').select('*').limit(1)
    
    if (error) {
      if (error.code === '42P01') {
        console.log('✅ Supabase connection successful!')
        console.log('❌ Tables not created yet. Please run the SQL schema.')
        console.log('\nNext steps:')
        console.log('1. Go to https://jnctixpcgiivoxfqzypa.supabase.co')
        console.log('2. Navigate to SQL Editor')
        console.log('3. Copy and paste the content from database/schema.sql')
        console.log('4. Click "Run" to create tables')
        return true
      } else {
        console.log('❌ Connection error:', error.message)
        return false
      }
    }
    
    console.log('✅ Supabase connection and database ready!')
    return true
    
  } catch (error) {
    console.log('❌ Failed to connect to Supabase:', error.message)
    return false
  }
}

// Test database tables
async function testDatabaseTables() {
  console.log('🔍 Testing database tables...')
  
  const supabaseUrl = 'https://jnctixpcgiivoxfqzypa.supabase.co'
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuY3RpeHBjZ2lpdm94ZnF6eXBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3OTM5MjUsImV4cCI6MjA3NDM2OTkyNX0.1HaRN3ZmYLrPYhElV2lfrEC2qSrgIeWXlXYHLxRL12Y'
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Test each table
    const tables = ['students', 'courses', 'email_logs', 'admin_settings']
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1)
        if (error) {
          console.log(`❌ Table '${table}' not found or not accessible`)
        } else {
          console.log(`✅ Table '${table}' ready`)
        }
      } catch (e) {
        console.log(`❌ Error testing table '${table}':`, e.message)
      }
    }
    
    // Test default courses
    const { data: courses, error: coursesError } = await supabase.from('courses').select('*')
    if (!coursesError && courses.length > 0) {
      console.log(`✅ Found ${courses.length} default courses`)
    }
    
    // Test default settings
    const { data: settings, error: settingsError } = await supabase.from('admin_settings').select('*')
    if (!settingsError && settings.length > 0) {
      console.log(`✅ Found ${settings.length} default settings`)
    }
    
  } catch (error) {
    console.log('❌ Database test failed:', error.message)
  }
}

// Main function
async function main() {
  console.log('🚀 EAVI Supabase Setup Verification\n')
  
  const connected = await testSupabaseConnection()
  if (connected) {
    await testDatabaseTables()
  }
  
  console.log('\n📋 Next Steps:')
  console.log('1. Get your Service Role Key from Supabase Dashboard → Settings → API')
  console.log('2. Add it to your .env.local file')
  console.log('3. Run the SQL schema if tables are missing')
  console.log('4. Start your application: npm run dev')
}

main().catch(console.error)
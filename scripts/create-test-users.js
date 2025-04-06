// Script to create test users in Supabase
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://roqzswykxwyzyoeazqiu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcXpzd3lreHd5enlvZWF6cWl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NzM3MDEsImV4cCI6MjA1NTU0OTcwMX0.6xrXSErzhRawyUO_HQ5grlV9DPgSluokYLPlT5Y6rXg';
const supabase = createClient(supabaseUrl, supabaseKey);

// Test users to create
const testUsers = [
  {
    email: 'user@example.com',
    password: 'password123',
    full_name: 'Regular User',
    role: 'user',
    staff_number: ''
  },
  {
    email: 'officer@example.com',
    password: 'password123',
    full_name: 'Field Officer',
    role: 'assistant_project_officer',
    staff_number: 'APO001'
  },
  {
    email: 'manager@example.com',
    password: 'password123',
    full_name: 'Program Manager',
    role: 'head_of_programs',
    staff_number: 'HOP001'
  },
  {
    email: 'executive@example.com',
    password: 'password123',
    full_name: 'Executive Director',
    role: 'director',
    staff_number: 'DIR001'
  },
  {
    email: 'admin@example.com',
    password: 'password123',
    full_name: 'System Admin',
    role: 'admin',
    staff_number: 'ADM001'
  }
];

// Function to create a user
async function createUser(userData) {
  try {
    console.log(`Creating user: ${userData.email} (${userData.role})...`);
    
    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.full_name,
          role: userData.role,
          staff_number: userData.staff_number
        }
      }
    });

    if (authError) {
      console.error(`Error creating user ${userData.email}:`, authError.message);
      return;
    }

    console.log(`User created: ${userData.email} (ID: ${authData.user.id})`);
    
    // Create profile record (as a backup, should be created by trigger)
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        full_name: userData.full_name,
        role: userData.role,
        staff_number: userData.staff_number,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'id', ignoreDuplicates: true });

    if (profileError) {
      console.error(`Error creating profile for ${userData.email}:`, profileError.message);
    } else {
      console.log(`Profile created for ${userData.email}`);
    }
  } catch (error) {
    console.error(`Unexpected error creating user ${userData.email}:`, error.message);
  }
}

// Create all test users
async function createAllUsers() {
  for (const userData of testUsers) {
    await createUser(userData);
  }
  console.log('All users created!');
}

// Run the script
createAllUsers().catch(console.error);

/**
 * Staff Access Codes Migration Script
 *
 * This script migrates staff access codes from environment variables to a database table.
 * It creates a new table called 'staff_access_codes' in the Supabase database.
 *
 * Usage:
 * 1. Set the SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables
 * 2. Run the script with Node.js: node scripts/migrate-staff-access-codes.js
 */

const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://roqzswykxwyzyoeazqiu.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Check if service key is provided
if (!supabaseServiceKey) {
  console.error('Error: SUPABASE_SERVICE_KEY environment variable is required');
  process.exit(1);
}

// Create Supabase client with service key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Default staff access codes
const defaultStaffAccessCodes = {
  'APO001': { name: 'Field Officer', role: 'assistant_project_officer' },
  'RPM001': { name: 'Project Manager', role: 'project_manager' },
  'HOP001': { name: 'Program Manager', role: 'head_of_programs' },
  'DIR001': { name: 'Director', role: 'director' },
  'CEO001': { name: 'Chief Executive', role: 'ceo' },
  'PAT001': { name: 'Patron', role: 'patron' },
  'ADM001': { name: 'Administrator', role: 'admin' },
};

// Get staff access codes from environment variables or use defaults
const getStaffAccessCodes = () => {
  try {
    const staffCodesEnv = process.env.STAFF_ACCESS_CODES;
    if (staffCodesEnv) {
      return JSON.parse(staffCodesEnv);
    }
  } catch (error) {
    console.error('Error parsing staff codes from environment variables:', error);
  }

  return defaultStaffAccessCodes;
};

// Create staff_access_codes table if it doesn't exist
const createStaffAccessCodesTable = async () => {
  try {
    // Check if the table exists
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'staff_access_codes')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.error('Error checking if table exists:', tablesError);
      return false;
    }

    // If the table doesn't exist, create it
    if (!tables || tables.length === 0) {
      const { error } = await supabase.rpc('create_staff_access_codes_table');

      if (error) {
        console.error('Error creating staff_access_codes table:', error);
        return false;
      }

      console.log('Created staff_access_codes table');
    } else {
      console.log('staff_access_codes table already exists');
    }

    return true;
  } catch (error) {
    console.error('Error creating staff_access_codes table:', error);
    return false;
  }
};

// Migrate staff access codes to the database
const migrateStaffAccessCodes = async () => {
  try {
    // Get staff access codes
    const staffAccessCodes = getStaffAccessCodes();

    // Convert to array of objects
    const staffAccessCodesArray = Object.entries(staffAccessCodes).map(([code, details]) => ({
      code,
      name: details.name,
      role: details.role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    // Insert staff access codes into the database
    const { data, error } = await supabase
      .from('staff_access_codes')
      .upsert(staffAccessCodesArray, { onConflict: 'code' });

    if (error) {
      console.error('Error migrating staff access codes:', error);
      return false;
    }

    console.log(`Migrated ${staffAccessCodesArray.length} staff access codes to the database`);
    return true;
  } catch (error) {
    console.error('Error migrating staff access codes:', error);
    return false;
  }
};

// Main function
const main = async () => {
  try {
    // Create the stored procedure to create the table
    const { error: procedureError } = await supabase.rpc('create_procedure_for_staff_access_codes_table');

    if (procedureError) {
      console.error('Error creating stored procedure:', procedureError);
      return;
    }

    // Create the table
    const tableCreated = await createStaffAccessCodesTable();
    if (!tableCreated) {
      console.error('Failed to create staff_access_codes table');
      return;
    }

    // Migrate staff access codes
    const migrated = await migrateStaffAccessCodes();
    if (!migrated) {
      console.error('Failed to migrate staff access codes');
      return;
    }

    console.log('Staff access codes migration completed successfully');
  } catch (error) {
    console.error('Error in migration script:', error);
  }
};

// Run the main function
main().catch(console.error);

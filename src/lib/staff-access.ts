import { USER_ROLES } from './supabase';
import { supabase } from './supabase';

/**
 * Staff access code interface
 */
export interface StaffAccessCode {
  id?: string;
  code?: string;
  name: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

// Cache for staff access codes
let staffAccessCodesCache: Record<string, StaffAccessCode> | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get staff access codes from the database or fallback to default values
 * @returns Record of staff access codes
 */
export async function getStaffAccessCodes(): Promise<Record<string, StaffAccessCode>> {
  // Check if we have a valid cache
  const now = Date.now();
  if (staffAccessCodesCache && (now - lastFetchTime) < CACHE_TTL) {
    return staffAccessCodesCache;
  }

  try {
    // Fetch staff access codes from the database
    const { data, error } = await supabase
      .from('staff_access_codes')
      .select('*');

    if (error) {
      console.error('Error fetching staff access codes:', error);
      return getFallbackStaffAccessCodes();
    }

    if (!data || data.length === 0) {
      console.warn('No staff access codes found in the database');
      return getFallbackStaffAccessCodes();
    }

    // Convert array to record
    const staffCodes: Record<string, StaffAccessCode> = {};
    data.forEach((item: any) => {
      staffCodes[item.code] = {
        name: item.name,
        role: item.role,
      };
    });

    // Update cache
    staffAccessCodesCache = staffCodes;
    lastFetchTime = now;

    return staffCodes;
  } catch (error) {
    console.error('Error fetching staff access codes:', error);
    return getFallbackStaffAccessCodes();
  }
}

/**
 * Get fallback staff access codes
 *
 * IMPORTANT: This is only used as a fallback when the database is unavailable.
 * These codes should match what's in the database. In a production environment,
 * this function should log an error and potentially trigger an alert, as the
 * application should not rely on hardcoded fallback values.
 *
 * @returns Record of staff access codes
 */
function getFallbackStaffAccessCodes(): Record<string, StaffAccessCode> {
  console.warn('Using fallback staff access codes - database may be unavailable');

  // These should match the values inserted into the database
  return {
    'APO001': { name: 'Field Officer', role: USER_ROLES.ASSISTANT_PROJECT_OFFICER },
    'RPM001': { name: 'Project Manager', role: USER_ROLES.PROJECT_MANAGER },
    'HOP001': { name: 'Program Manager', role: USER_ROLES.HEAD_OF_PROGRAMS },
    'DIR001': { name: 'Director', role: USER_ROLES.DIRECTOR },
    'CEO001': { name: 'Chief Executive', role: USER_ROLES.CEO },
    'PAT001': { name: 'Patron', role: USER_ROLES.PATRON },
    'ADM001': { name: 'Administrator', role: USER_ROLES.ADMIN },
  };
}

/**
 * Validate a staff access code
 * @param accessCode - The access code to validate
 * @returns The staff access code details if valid, null otherwise
 */
export async function validateStaffAccessCode(accessCode: string): Promise<StaffAccessCode | null> {
  const staffCodes = await getStaffAccessCodes();
  return staffCodes[accessCode] || null;
}

/**
 * Get all staff access codes
 * @returns Array of staff access codes with their details
 */
export async function getAllStaffAccessCodes(): Promise<Array<{ code: string; details: StaffAccessCode }>> {
  const staffCodes = await getStaffAccessCodes();
  return Object.entries(staffCodes).map(([code, details]) => ({ code, details }));
}

import { supabase } from '@/lib/supabase';

export interface SystemSetting {
  id: string;
  key: string;
  value: any;
  description?: string;
  category: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface SystemSettingInput {
  key: string;
  value: any;
  description?: string;
  category: string;
  is_public?: boolean;
}

/**
 * System settings service for managing global application settings
 */
export const systemSettingsService = {
  /**
   * Get all system settings
   * @param includePrivate - Whether to include private settings
   * @returns System settings
   */
  async getAllSettings(includePrivate: boolean = false): Promise<SystemSetting[]> {
    try {
      let query = supabase
        .from('system_settings')
        .select('*')
        .order('category')
        .order('key');
      
      if (!includePrivate) {
        query = query.eq('is_public', true);
      }
      
      const { data, error } = await query;
      
      if (error) throw new Error(error.message);
      
      return data;
    } catch (error: any) {
      console.error('Error fetching system settings:', error);
      return [];
    }
  },
  
  /**
   * Get settings by category
   * @param category - Setting category
   * @param includePrivate - Whether to include private settings
   * @returns System settings
   */
  async getSettingsByCategory(category: string, includePrivate: boolean = false): Promise<SystemSetting[]> {
    try {
      let query = supabase
        .from('system_settings')
        .select('*')
        .eq('category', category)
        .order('key');
      
      if (!includePrivate) {
        query = query.eq('is_public', true);
      }
      
      const { data, error } = await query;
      
      if (error) throw new Error(error.message);
      
      return data;
    } catch (error: any) {
      console.error(`Error fetching system settings for category ${category}:`, error);
      return [];
    }
  },
  
  /**
   * Get setting by key
   * @param key - Setting key
   * @returns System setting
   */
  async getSettingByKey(key: string): Promise<SystemSetting | null> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('key', key)
        .single();
      
      if (error) throw new Error(error.message);
      
      return data;
    } catch (error: any) {
      console.error(`Error fetching system setting ${key}:`, error);
      return null;
    }
  },
  
  /**
   * Update setting
   * @param key - Setting key
   * @param value - Setting value
   * @returns Updated system setting
   */
  async updateSetting(key: string, value: any): Promise<SystemSetting | null> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .update({ 
          value,
          updated_at: new Date().toISOString()
        })
        .eq('key', key)
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      
      return data;
    } catch (error: any) {
      console.error(`Error updating system setting ${key}:`, error);
      return null;
    }
  },
  
  /**
   * Create setting
   * @param setting - Setting data
   * @returns Created system setting
   */
  async createSetting(setting: SystemSettingInput): Promise<SystemSetting | null> {
    try {
      // Check if setting already exists
      const { data: existingData } = await supabase
        .from('system_settings')
        .select('*')
        .eq('key', setting.key)
        .single();
      
      if (existingData) {
        throw new Error(`Setting with key ${setting.key} already exists`);
      }
      
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('system_settings')
        .insert([{
          key: setting.key,
          value: setting.value,
          description: setting.description,
          category: setting.category,
          is_public: setting.is_public !== undefined ? setting.is_public : true,
          created_at: now,
          updated_at: now
        }])
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      
      return data;
    } catch (error: any) {
      console.error('Error creating system setting:', error);
      return null;
    }
  },
  
  /**
   * Delete setting
   * @param key - Setting key
   * @returns Success status
   */
  async deleteSetting(key: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('system_settings')
        .delete()
        .eq('key', key);
      
      if (error) throw new Error(error.message);
      
      return true;
    } catch (error: any) {
      console.error(`Error deleting system setting ${key}:`, error);
      return false;
    }
  },
  
  /**
   * Get all setting categories
   * @returns Setting categories
   */
  async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('category')
        .order('category');
      
      if (error) throw new Error(error.message);
      
      // Extract unique categories
      const categories = new Set<string>();
      data.forEach(item => categories.add(item.category));
      
      return Array.from(categories);
    } catch (error: any) {
      console.error('Error fetching system setting categories:', error);
      return [];
    }
  }
};

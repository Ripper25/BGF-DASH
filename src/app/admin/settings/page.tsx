"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FiArrowLeft, FiPlus, FiSave, FiTrash2, FiEdit2, FiEye, FiEyeOff, FiCheck, FiX } from 'react-icons/fi';
import { systemSettingsService, SystemSetting, SystemSettingInput } from '@/services/system-settings.service';
import { ROUTES } from '@/app/routes';
import { activityLogService } from '@/services/activity-log.service';
import { useAuth } from '@/contexts/AuthContext';

export default function SystemSettings() {
  const router = useRouter();
  const { user } = useAuth();
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [editingSetting, setEditingSetting] = useState<SystemSetting | null>(null);
  const [newSetting, setNewSetting] = useState<SystemSettingInput | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch settings and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all settings
        const settingsData = await systemSettingsService.getAllSettings(true);
        setSettings(settingsData);
        
        // Fetch categories
        const categoriesData = await systemSettingsService.getCategories();
        setCategories(categoriesData);
        
        // Set active category to the first one if available
        if (categoriesData.length > 0 && !activeCategory) {
          setActiveCategory(categoriesData[0]);
        }
      } catch (err: any) {
        console.error('Error fetching system settings:', err);
        setError('Failed to load system settings');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [activeCategory]);

  // Filter settings by active category
  const filteredSettings = activeCategory
    ? settings.filter(setting => setting.category === activeCategory)
    : settings;

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setEditingSetting(null);
    setNewSetting(null);
  };

  // Handle edit setting
  const handleEditSetting = (setting: SystemSetting) => {
    setEditingSetting(setting);
    setNewSetting(null);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingSetting(null);
  };

  // Handle save setting
  const handleSaveSetting = async () => {
    if (!editingSetting) return;
    
    try {
      setSaving(true);
      setError(null);
      
      // Update the setting
      const updatedSetting = await systemSettingsService.updateSetting(
        editingSetting.key,
        editingSetting.value
      );
      
      if (updatedSetting) {
        // Update the settings list
        setSettings(prev => prev.map(s => 
          s.id === updatedSetting.id ? updatedSetting : s
        ));
        
        // Log the activity
        if (user) {
          await activityLogService.logActivity({
            user_id: user.id,
            action: 'update',
            entity_type: 'system_setting',
            entity_id: editingSetting.key,
            details: {
              category: editingSetting.category,
              key: editingSetting.key
            }
          });
        }
        
        // Clear editing state
        setEditingSetting(null);
      }
    } catch (err: any) {
      console.error('Error updating system setting:', err);
      setError(err.message || 'Failed to update system setting');
    } finally {
      setSaving(false);
    }
  };

  // Handle new setting
  const handleNewSetting = () => {
    setNewSetting({
      key: '',
      value: '',
      description: '',
      category: activeCategory || '',
      is_public: true
    });
    setEditingSetting(null);
  };

  // Handle cancel new setting
  const handleCancelNewSetting = () => {
    setNewSetting(null);
  };

  // Handle create setting
  const handleCreateSetting = async () => {
    if (!newSetting) return;
    
    try {
      setSaving(true);
      setError(null);
      
      // Validate input
      if (!newSetting.key) {
        setError('Key is required');
        return;
      }
      
      if (!newSetting.category) {
        setError('Category is required');
        return;
      }
      
      // Create the setting
      const createdSetting = await systemSettingsService.createSetting(newSetting);
      
      if (createdSetting) {
        // Update the settings list
        setSettings(prev => [...prev, createdSetting]);
        
        // Log the activity
        if (user) {
          await activityLogService.logActivity({
            user_id: user.id,
            action: 'create',
            entity_type: 'system_setting',
            entity_id: createdSetting.key,
            details: {
              category: createdSetting.category,
              key: createdSetting.key
            }
          });
        }
        
        // Clear new setting state
        setNewSetting(null);
      }
    } catch (err: any) {
      console.error('Error creating system setting:', err);
      setError(err.message || 'Failed to create system setting');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete setting
  const handleDeleteSetting = async (key: string) => {
    if (!confirm(`Are you sure you want to delete the setting "${key}"?`)) {
      return;
    }
    
    try {
      setError(null);
      
      // Delete the setting
      const success = await systemSettingsService.deleteSetting(key);
      
      if (success) {
        // Update the settings list
        setSettings(prev => prev.filter(s => s.key !== key));
        
        // Log the activity
        if (user) {
          await activityLogService.logActivity({
            user_id: user.id,
            action: 'delete',
            entity_type: 'system_setting',
            entity_id: key
          });
        }
      }
    } catch (err: any) {
      console.error('Error deleting system setting:', err);
      setError(err.message || 'Failed to delete system setting');
    }
  };

  // Handle input change for editing
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (editingSetting) {
      setEditingSetting(prev => {
        if (!prev) return null;
        
        if (name === 'value') {
          // Handle different value types
          if (type === 'checkbox') {
            return { ...prev, value: (e.target as HTMLInputElement).checked };
          } else if (type === 'number') {
            return { ...prev, value: parseFloat(value) };
          } else {
            return { ...prev, value };
          }
        } else {
          return { ...prev, [name]: value };
        }
      });
    }
  };

  // Handle input change for new setting
  const handleNewInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (newSetting) {
      setNewSetting(prev => {
        if (!prev) return null;
        
        if (name === 'value') {
          // Handle different value types
          if (type === 'checkbox') {
            return { ...prev, value: (e.target as HTMLInputElement).checked };
          } else if (type === 'number') {
            return { ...prev, value: parseFloat(value) };
          } else {
            return { ...prev, value };
          }
        } else if (name === 'is_public') {
          return { ...prev, is_public: (e.target as HTMLInputElement).checked };
        } else {
          return { ...prev, [name]: value };
        }
      });
    }
  };

  // Render setting value based on type
  const renderSettingValue = (setting: SystemSetting) => {
    const value = setting.value;
    
    if (typeof value === 'boolean') {
      return value ? 'True' : 'False';
    } else if (typeof value === 'object') {
      return JSON.stringify(value);
    } else {
      return String(value);
    }
  };

  // Render setting value input based on type
  const renderSettingValueInput = (setting: SystemSetting) => {
    const value = setting.value;
    
    if (typeof value === 'boolean') {
      return (
        <div className="flex items-center">
          <input
            type="checkbox"
            name="value"
            checked={!!editingSetting?.value}
            onChange={handleEditInputChange}
            className="mr-2"
          />
          <label>{editingSetting?.value ? 'True' : 'False'}</label>
        </div>
      );
    } else if (typeof value === 'number') {
      return (
        <input
          type="number"
          name="value"
          value={editingSetting?.value}
          onChange={handleEditInputChange}
          className="w-full px-4 py-2 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
        />
      );
    } else if (typeof value === 'object') {
      return (
        <textarea
          name="value"
          value={JSON.stringify(editingSetting?.value, null, 2)}
          onChange={handleEditInputChange}
          className="w-full px-4 py-2 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold font-mono text-sm"
          rows={5}
        />
      );
    } else {
      return (
        <input
          type="text"
          name="value"
          value={editingSetting?.value}
          onChange={handleEditInputChange}
          className="w-full px-4 py-2 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
        />
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-playfair font-semibold">System Settings</h1>
          <Button
            variant="secondary"
            onClick={() => router.push(ROUTES.ADMIN_DASHBOARD)}
            className="flex items-center"
          >
            <FiArrowLeft className="mr-2" />
            Back to Admin
          </Button>
        </div>

        {error && (
          <div className="bg-terracotta/10 p-4 rounded-md text-terracotta mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <Card className="p-4">
              <h2 className="text-lg font-medium mb-4">Categories</h2>
              <div className="space-y-2">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-t-transparent border-bgf-burgundy rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-text-muted text-sm">Loading...</p>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-4 text-text-muted">
                    No categories found
                  </div>
                ) : (
                  categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`w-full text-left px-4 py-2 rounded-md ${
                        activeCategory === category
                          ? 'bg-bgf-burgundy text-white'
                          : 'hover:bg-slate-gray/10'
                      }`}
                    >
                      {category}
                    </button>
                  ))
                )}
              </div>
            </Card>
          </div>

          <div className="md:col-span-3">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-playfair font-semibold">
                  {activeCategory ? `${activeCategory} Settings` : 'All Settings'}
                </h2>
                <Button
                  variant="primary"
                  onClick={handleNewSetting}
                  className="flex items-center"
                  disabled={!activeCategory}
                >
                  <FiPlus className="mr-2" />
                  Add Setting
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-t-transparent border-bgf-burgundy rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-text-muted text-sm">Loading settings...</p>
                </div>
              ) : filteredSettings.length === 0 ? (
                <div className="text-center py-8 text-text-muted">
                  No settings found for this category
                </div>
              ) : (
                <div className="space-y-4">
                  {newSetting && (
                    <div className="bg-slate-gray/5 p-4 rounded-md border-l-4 border-gold">
                      <h3 className="font-medium mb-4">New Setting</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-text-secondary font-medium mb-2">
                            Key <span className="text-terracotta">*</span>
                          </label>
                          <input
                            type="text"
                            name="key"
                            value={newSetting.key}
                            onChange={handleNewInputChange}
                            className="w-full px-4 py-2 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                            placeholder="setting_key"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-text-secondary font-medium mb-2">
                            Category <span className="text-terracotta">*</span>
                          </label>
                          <input
                            type="text"
                            name="category"
                            value={newSetting.category}
                            onChange={handleNewInputChange}
                            className="w-full px-4 py-2 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                            placeholder="Category"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-text-secondary font-medium mb-2">
                            Value <span className="text-terracotta">*</span>
                          </label>
                          <input
                            type="text"
                            name="value"
                            value={newSetting.value}
                            onChange={handleNewInputChange}
                            className="w-full px-4 py-2 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                            placeholder="Value"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-text-secondary font-medium mb-2">
                            Description
                          </label>
                          <textarea
                            name="description"
                            value={newSetting.description}
                            onChange={handleNewInputChange}
                            className="w-full px-4 py-2 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                            placeholder="Description"
                            rows={2}
                          />
                        </div>
                        <div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              name="is_public"
                              checked={newSetting.is_public}
                              onChange={handleNewInputChange}
                              className="mr-2"
                            />
                            <label className="text-text-secondary font-medium">
                              Public Setting
                            </label>
                          </div>
                          <p className="text-xs text-text-muted mt-1">
                            Public settings are visible to all users with appropriate permissions
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="secondary"
                          onClick={handleCancelNewSetting}
                          disabled={saving}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          onClick={handleCreateSetting}
                          disabled={saving || !newSetting.key || !newSetting.category}
                          className="flex items-center"
                        >
                          {saving ? (
                            <>
                              <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <FiSave className="mr-2" />
                              Create
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {filteredSettings.map((setting) => (
                    <div
                      key={setting.id}
                      className={`p-4 rounded-md ${
                        editingSetting?.id === setting.id
                          ? 'bg-slate-gray/5 border-l-4 border-gold'
                          : 'bg-white border border-slate-gray/10 hover:bg-slate-gray/5'
                      }`}
                    >
                      {editingSetting?.id === setting.id ? (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-text-secondary font-medium mb-2">
                                Key
                              </label>
                              <input
                                type="text"
                                value={editingSetting.key}
                                disabled
                                className="w-full px-4 py-2 border border-slate-gray/30 rounded-md bg-slate-gray/5 cursor-not-allowed"
                              />
                            </div>
                            <div>
                              <label className="block text-text-secondary font-medium mb-2">
                                Category
                              </label>
                              <input
                                type="text"
                                value={editingSetting.category}
                                disabled
                                className="w-full px-4 py-2 border border-slate-gray/30 rounded-md bg-slate-gray/5 cursor-not-allowed"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-text-secondary font-medium mb-2">
                                Value
                              </label>
                              {renderSettingValueInput(setting)}
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-text-secondary font-medium mb-2">
                                Description
                              </label>
                              <textarea
                                name="description"
                                value={editingSetting.description || ''}
                                onChange={handleEditInputChange}
                                className="w-full px-4 py-2 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                                rows={2}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="secondary"
                              onClick={handleCancelEdit}
                              disabled={saving}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="primary"
                              onClick={handleSaveSetting}
                              disabled={saving}
                              className="flex items-center"
                            >
                              {saving ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <FiSave className="mr-2" />
                                  Save
                                </>
                              )}
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-medium">{setting.key}</h3>
                              <p className="text-sm text-text-muted mt-1">
                                {setting.description || 'No description'}
                              </p>
                            </div>
                            <div className="flex items-center">
                              {setting.is_public ? (
                                <span className="flex items-center text-forest-green text-xs mr-4">
                                  <FiEye className="mr-1" />
                                  Public
                                </span>
                              ) : (
                                <span className="flex items-center text-terracotta text-xs mr-4">
                                  <FiEyeOff className="mr-1" />
                                  Private
                                </span>
                              )}
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditSetting(setting)}
                                  className="p-1 text-blue-600 hover:text-blue-800"
                                  title="Edit Setting"
                                >
                                  <FiEdit2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteSetting(setting.key)}
                                  className="p-1 text-terracotta hover:text-deep-terracotta"
                                  title="Delete Setting"
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-slate-gray/10">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-text-muted">Value:</span>
                              <div className="font-mono text-sm bg-slate-gray/5 px-3 py-1 rounded">
                                {renderSettingValue(setting)}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

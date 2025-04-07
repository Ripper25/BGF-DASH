import { supabase } from '@/lib/supabase';

/**
 * Avatar service for handling user avatar uploads and management
 */
export const avatarService = {
  /**
   * Upload a user avatar
   * @param userId - User ID
   * @param file - Avatar image file
   * @returns URL of the uploaded avatar
   */
  async uploadAvatar(userId: string, file: File): Promise<string> {
    try {
      // Validate file type
      if (!file.type.match(/^image\/(jpeg|png|gif|webp)$/)) {
        throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
      }

      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('File size exceeds 2MB limit.');
      }

      // Try to use the API first (this is the most reliable method)
      try {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await fetch('/api/users/avatar', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          if (data.avatar_url) {
            // Update local storage as a fallback
            if (typeof window !== 'undefined') {
              localStorage.setItem('bgf.avatar.url', data.avatar_url);
            }
            return data.avatar_url;
          }
        } else {
          console.warn('API upload failed, falling back to direct upload');
        }
      } catch (apiError) {
        console.warn('API upload error, falling back to direct upload:', apiError);
      }

      // Fall back to direct upload if API fails
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        throw new Error(`Avatar upload failed: ${error.message}`);
      }

      // Get the public URL of the uploaded file
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update the user's profile with the avatar URL
      await this.updateUserAvatarUrl(userId, urlData.publicUrl);

      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      throw new Error(error.message || 'Failed to upload avatar');
    }
  },

  /**
   * Update the user's avatar URL in their profile
   * @param userId - User ID
   * @param avatarUrl - URL of the avatar
   */
  async updateUserAvatarUrl(userId: string, avatarUrl: string): Promise<void> {
    try {
      // Update user metadata
      const { error: updateAuthError } = await supabase.auth.updateUser({
        data: {
          avatar_url: avatarUrl
        }
      });

      if (updateAuthError) {
        console.warn('Auth update error:', updateAuthError);
        // Continue even if auth update fails
      }

      // Don't try to update the profiles table directly from the frontend
      // This will likely fail due to RLS policies
      // Instead, we'll store the avatar URL in localStorage as a fallback
      if (typeof window !== 'undefined') {
        localStorage.setItem('bgf.avatar.url', avatarUrl);
      }

      // We'll rely on the backend API to update the profile
      try {
        // Make an API call to update the avatar URL
        const response = await fetch('/api/users/avatar/url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ avatarUrl })
        });

        if (!response.ok) {
          console.warn('Failed to update avatar URL via API');
        }
      } catch (apiError) {
        console.warn('API call to update avatar URL failed:', apiError);
        // Continue even if API call fails
      }
    } catch (error: any) {
      console.error('Avatar URL update error:', error);
      // Don't throw here, just log the error
      // This allows the avatar upload to succeed even if the profile update fails
    }
  },

  /**
   * Get the avatar URL for a user
   * @param userId - User ID
   * @returns Avatar URL or null if not found
   */
  async getAvatarUrl(userId: string): Promise<string | null> {
    try {
      // Try to get from auth user metadata first
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (!authError && authData.user?.user_metadata?.avatar_url) {
        return authData.user.user_metadata.avatar_url;
      }

      // Try to get from localStorage
      if (typeof window !== 'undefined') {
        const localAvatarUrl = localStorage.getItem('bgf.avatar.url');
        if (localAvatarUrl) {
          return localAvatarUrl;
        }
      }

      // Try to get from API
      try {
        const response = await fetch(`/api/users/avatar`);
        if (response.ok) {
          const data = await response.json();
          if (data.avatar_url) {
            return data.avatar_url;
          }
        }
      } catch (apiError) {
        console.warn('API call to get avatar URL failed:', apiError);
      }

      // Fall back to profiles table as a last resort
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', userId)
          .single();

        if (!error && data && data.avatar_url) {
          return data.avatar_url;
        }
      } catch (dbError) {
        console.warn('Database query for avatar URL failed:', dbError);
      }

      return null;
    } catch (error) {
      console.error('Get avatar URL error:', error);
      return null;
    }
  },

  /**
   * Delete a user's avatar
   * @param userId - User ID
   * @param fileName - Name of the avatar file to delete
   */
  async deleteAvatar(userId: string, fileName: string): Promise<void> {
    try {
      const filePath = `${userId}/${fileName}`;

      // Delete the file from Supabase Storage
      const { error } = await supabase.storage
        .from('avatars')
        .remove([filePath]);

      if (error) {
        throw new Error(`Avatar deletion failed: ${error.message}`);
      }

      // Update the user's profile to remove the avatar URL
      await this.updateUserAvatarUrl(userId, '');
    } catch (error: any) {
      console.error('Avatar deletion error:', error);
      throw new Error(error.message || 'Failed to delete avatar');
    }
  }
};

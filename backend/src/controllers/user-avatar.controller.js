const multer = require('multer');
const path = require('path');
const { supabase } = require('../config/supabase');

/**
 * Configure multer for avatar uploads
 */
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
    }
  }
}).single('avatar'); // Single file upload for avatar

/**
 * User avatar controller for handling avatar-related operations
 */
const UserAvatarController = {
  /**
   * Update a user's avatar URL
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with success message
   */
  async updateAvatarUrl(req, res) {
    try {
      const userId = req.user.id;
      const { avatarUrl } = req.body;

      if (!avatarUrl) {
        return res.status(400).json({ message: 'Avatar URL is required' });
      }

      // Update user profile with avatar URL using service role
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .update({
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (userError) {
        console.error('Error updating user profile:', userError);
        return res.status(500).json({ message: `Database error: ${userError.message}` });
      }

      // Also update user metadata
      const { error: authError } = await supabase.auth.admin.updateUserById(
        userId,
        {
          user_metadata: {
            avatar_url: avatarUrl
          }
        }
      );

      if (authError) {
        console.error('Error updating user metadata:', authError);
        // Don't return an error here, as the profile update was successful
      }

      return res.status(200).json({
        message: 'Avatar URL updated successfully',
        avatar_url: avatarUrl
      });
    } catch (error) {
      console.error('Avatar URL update error:', error);
      return res.status(500).json({ message: error.message });
    }
  },
  /**
   * Upload a user avatar
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with uploaded avatar data
   */
  uploadAvatar(req, res) {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      try {
        // Get the uploaded file
        const file = req.file;
        if (!file) {
          return res.status(400).json({ message: 'No file uploaded' });
        }

        // Get the user ID from the authenticated user
        const userId = req.user.id;

        // Generate a unique file name
        const fileExt = path.extname(file.originalname);
        const fileName = `${userId}_${Date.now()}${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          throw new Error(`Avatar upload error: ${uploadError.message}`);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        // Update user profile with avatar URL
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .update({
            avatar_url: urlData.publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select()
          .single();

        if (userError) {
          console.error('Error updating user profile:', userError);
          // Don't throw here, as the upload was successful
        }

        // Also update user metadata
        const { error: authError } = await supabase.auth.admin.updateUserById(
          userId,
          {
            user_metadata: {
              avatar_url: urlData.publicUrl
            }
          }
        );

        if (authError) {
          console.error('Error updating user metadata:', authError);
          // Don't throw here, as the upload was successful
        }

        return res.status(200).json({
          message: 'Avatar uploaded successfully',
          avatar_url: urlData.publicUrl
        });
      } catch (error) {
        console.error('Avatar upload error:', error);
        return res.status(500).json({ message: error.message });
      }
    });
  },

  /**
   * Get the current user's avatar
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with avatar URL
   */
  async getAvatar(req, res) {
    try {
      const userId = req.user.id;

      // Get user profile
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', userId)
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return res.status(200).json({
        avatar_url: data?.avatar_url || null
      });
    } catch (error) {
      console.error('Get avatar error:', error);
      return res.status(500).json({ message: error.message });
    }
  },

  /**
   * Delete the current user's avatar
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with success message
   */
  async deleteAvatar(req, res) {
    try {
      const userId = req.user.id;
      const { fileName } = req.params;

      if (!fileName) {
        return res.status(400).json({ message: 'File name is required' });
      }

      const filePath = `${userId}/${fileName}`;

      // Delete from Supabase Storage
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([filePath]);

      if (deleteError) {
        throw new Error(`Avatar deletion error: ${deleteError.message}`);
      }

      // Update user profile to remove avatar URL
      const { error: userError } = await supabase
        .from('profiles')
        .update({
          avatar_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (userError) {
        console.error('Error updating user profile:', userError);
        // Don't throw here, as the deletion was successful
      }

      // Also update user metadata
      const { error: authError } = await supabase.auth.admin.updateUserById(
        userId,
        {
          user_metadata: {
            avatar_url: null
          }
        }
      );

      if (authError) {
        console.error('Error updating user metadata:', authError);
        // Don't throw here, as the deletion was successful
      }

      return res.status(200).json({
        message: 'Avatar deleted successfully'
      });
    } catch (error) {
      console.error('Avatar deletion error:', error);
      return res.status(500).json({ message: error.message });
    }
  }
};

module.exports = UserAvatarController;

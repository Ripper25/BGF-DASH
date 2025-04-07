const { supabaseAdmin } = require('./supabase');

/**
 * Setup storage buckets for the application
 */
async function setupStorage() {
  try {
    console.log('Setting up storage buckets...');

    // Check if the buckets already exist
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();

    if (listError) {
      throw new Error(`Failed to list buckets: ${listError.message}`);
    }

    // Setup bgf-documents bucket
    const bgfDocumentsBucket = buckets.find(bucket => bucket.name === 'bgf-documents');

    if (!bgfDocumentsBucket) {
      // Create the bucket if it doesn't exist
      const { data, error } = await supabaseAdmin.storage.createBucket('bgf-documents', {
        public: false,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
      });

      if (error) {
        throw new Error(`Failed to create bgf-documents bucket: ${error.message}`);
      }

      console.log('Created bgf-documents bucket');
    } else {
      console.log('bgf-documents bucket already exists');
    }

    // Setup avatars bucket
    const avatarsBucket = buckets.find(bucket => bucket.name === 'avatars');

    if (!avatarsBucket) {
      // Create the bucket if it doesn't exist
      const { data, error } = await supabaseAdmin.storage.createBucket('avatars', {
        public: false,
        fileSizeLimit: 2097152, // 2MB
        allowedMimeTypes: [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp'
        ]
      });

      if (error) {
        throw new Error(`Failed to create avatars bucket: ${error.message}`);
      }

      console.log('Created avatars bucket');
    } else {
      console.log('avatars bucket already exists');
    }

    console.log('Storage setup complete');
  } catch (error) {
    console.error('Storage setup error:', error);
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupStorage()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = setupStorage;

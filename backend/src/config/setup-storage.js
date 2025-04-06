const { supabaseAdmin } = require('./supabase');

/**
 * Setup storage buckets for the application
 */
async function setupStorage() {
  try {
    console.log('Setting up storage buckets...');

    // Check if the bucket already exists
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      throw new Error(`Failed to list buckets: ${listError.message}`);
    }

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
        throw new Error(`Failed to create bucket: ${error.message}`);
      }

      console.log('Created bgf-documents bucket');
    } else {
      console.log('bgf-documents bucket already exists');
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

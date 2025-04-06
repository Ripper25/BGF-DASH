const setupStorage = require('./setup-storage');
const setupDatabase = require('./setup-database');

/**
 * Run all setup scripts
 */
async function setup() {
  try {
    console.log('Starting setup...');
    
    // Setup storage
    await setupStorage();
    
    // Setup database
    await setupDatabase();
    
    console.log('Setup completed successfully');
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
setup()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });

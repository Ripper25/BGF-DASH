const { supabaseAdmin } = require('./supabase');
const bcrypt = require('bcrypt');
const { USER_ROLES } = require('../models/user.model');

/**
 * Setup database tables and initial data
 */
async function setupDatabase() {
  try {
    console.log('Setting up database...');

    // Create admin user if it doesn't exist
    const { data: existingUsers, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', 'admin@bgfzim.org');

    if (userError) {
      throw new Error(`Failed to check for admin user: ${userError.message}`);
    }

    if (!existingUsers || existingUsers.length === 0) {
      // Create admin user in auth
      let authUser;
      try {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email: 'admin@bgfzim.org',
          password: 'Admin@123',
          email_confirm: true
        });

        if (error) {
          console.error(`Failed to create admin auth user: ${error.message}`);
          // Try to sign up instead
          const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.signUp({
            email: 'admin@bgfzim.org',
            password: 'Admin@123'
          });

          if (signUpError) {
            throw new Error(`Failed to sign up admin user: ${signUpError.message}`);
          }

          authUser = signUpData;
        } else {
          authUser = data;
        }
      } catch (error) {
        console.error('Error creating admin user:', error);
        // Try to get the user by email
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();

        if (userError) {
          throw new Error(`Failed to list users: ${userError.message}`);
        }

        const adminAuthUser = userData.users.find(user => user.email === 'admin@bgfzim.org');

        if (!adminAuthUser) {
          throw new Error('Could not create or find admin user');
        }

        authUser = { user: adminAuthUser };
      }

      // Create admin user in users table
      const { data: adminUser, error: adminError } = await supabaseAdmin
        .from('users')
        .insert({
          auth_id: authUser.user.id,
          email: 'admin@bgfzim.org',
          full_name: 'BGF Admin',
          role: USER_ROLES.ADMIN,
          phone_number: '+263867717485',
          address: '5 Beit Road, Milton Park, Harare, Zimbabwe',
          created_at: new Date(),
          updated_at: new Date()
        })
        .select()
        .single();

      if (adminError) {
        throw new Error(`Failed to create admin user: ${adminError.message}`);
      }

      console.log('Created admin user:', adminUser.email);
    } else {
      console.log('Admin user already exists');
    }

    // Create sample users for each role
    const sampleUsers = [
      {
        email: 'field.officer@bgfzim.org',
        password: 'Field@123',
        full_name: 'BGF Field Officer',
        role: USER_ROLES.FIELD_OFFICER,
        phone_number: '+263867717486',
        address: 'Harare, Zimbabwe'
      },
      {
        email: 'programme.manager@bgfzim.org',
        password: 'Programme@123',
        full_name: 'BGF Programme Manager',
        role: USER_ROLES.PROGRAMME_MANAGER,
        phone_number: '+263867717487',
        address: 'Harare, Zimbabwe'
      },
      {
        email: 'management@bgfzim.org',
        password: 'Management@123',
        full_name: 'BGF Management',
        role: USER_ROLES.MANAGEMENT,
        phone_number: '+263867717488',
        address: 'Harare, Zimbabwe'
      },
      {
        email: 'user@example.com',
        password: 'User@123',
        full_name: 'Regular User',
        role: USER_ROLES.USER,
        phone_number: '+263867717489',
        address: 'Harare, Zimbabwe'
      }
    ];

    for (const user of sampleUsers) {
      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', user.email);

      if (checkError) {
        throw new Error(`Failed to check for user ${user.email}: ${checkError.message}`);
      }

      if (!existingUser || existingUser.length === 0) {
        // Create user in auth
        let authUser;
        try {
          const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true
          });

          if (error) {
            console.error(`Failed to create auth user ${user.email}: ${error.message}`);
            // Try to sign up instead
            const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.signUp({
              email: user.email,
              password: user.password
            });

            if (signUpError) {
              throw new Error(`Failed to sign up user ${user.email}: ${signUpError.message}`);
            }

            authUser = signUpData;
          } else {
            authUser = data;
          }
        } catch (error) {
          console.error(`Error creating user ${user.email}:`, error);
          // Skip this user and continue with the next one
          console.log(`Skipping user ${user.email} due to error`);
          continue;
        }

        // Create user in users table
        const { data: createdUser, error: userError } = await supabaseAdmin
          .from('users')
          .insert({
            auth_id: authUser.user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            phone_number: user.phone_number,
            address: user.address,
            created_at: new Date(),
            updated_at: new Date()
          })
          .select()
          .single();

        if (userError) {
          throw new Error(`Failed to create user ${user.email}: ${userError.message}`);
        }

        console.log(`Created ${user.role} user:`, createdUser.email);
      } else {
        console.log(`${user.role} user already exists:`, user.email);
      }
    }

    console.log('Database setup complete');
  } catch (error) {
    console.error('Database setup error:', error);
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupDatabase()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = setupDatabase;

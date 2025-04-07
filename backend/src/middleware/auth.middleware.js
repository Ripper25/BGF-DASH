const jwt = require('jsonwebtoken');
const { UserModel } = require('../models/user.model');
const { supabase } = require('../config/supabase');
const { successResponse, errorResponse } = require('../utils/response.util');
const { DEV_MODE, DEV_USER_ID, DEV_STAFF_ID } = require('../config/development');

/**
 * Authentication middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader ? `${authHeader.substring(0, 15)}...` : 'none');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No token provided in authorization header');

      if (DEV_MODE) {
        // In development mode, allow requests without tokens
        console.log('DEV MODE: Allowing request without token');
        req.user = {
          id: DEV_USER_ID,
          email: 'dev@example.com',
          full_name: 'Development User',
          role: 'user',
          isStaff: false,
          is_dev: true
        };
        return next();
      }

      return errorResponse(res, 'No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    console.log('Token from header:', token ? `${token.substring(0, 10)}...` : 'none');

    // First try to verify as a staff token (JWT)
    try {
      // Try to verify as a staff token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if it's a staff token
      if (decoded.isStaff) {
        // This is a staff token
        console.log('Staff token detected');

        // Add staff user to request with unified user model
        req.user = {
          id: decoded.id,
          email: decoded.email || 'staff@example.com',
          full_name: decoded.name,
          role: decoded.role,
          staffNumber: decoded.staff_number,
          isStaff: true
        };

        return next();
      }

      // This is a regular JWT token
      console.log('Regular JWT token detected');

      // Get user from database
      const user = await UserModel.getUserById(decoded.id);
      if (!user) {
        return errorResponse(res, 'Invalid token - user not found', 401);
      }

      // Add user to request with unified user model
      req.user = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        isStaff: false
      };

      return next();
    } catch (jwtError) {
      // If JWT verification fails and we're in DEV_MODE, create a dev user
      if (DEV_MODE) {
        console.log('DEV MODE: Creating development user');
        req.user = {
          id: DEV_USER_ID,
          email: 'dev@example.com',
          full_name: 'Development User',
          role: 'user',
          isStaff: false,
          is_dev: true
        };
        return next();
      }

      // If not in DEV_MODE, try Supabase token
      console.log('JWT verification failed, trying Supabase token');

      try {
        console.log('Attempting to verify token with Supabase...');
        // Verify with Supabase
        const { data, error } = await supabase.auth.getUser(token);

        if (error) {
          console.error('Supabase token verification failed:', error);
          return errorResponse(res, 'Invalid token', 401);
        }

        if (!data.user) {
          console.error('Supabase token verification returned no user');
          return errorResponse(res, 'Invalid token - no user found', 401);
        }

        console.log('Supabase token verification successful, user ID:', data.user.id);

        // Get user profile from profiles table
        console.log('Looking for profile with ID:', data.user.id);
        let { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.log('Profile error details:', profileError);
        } else {
          console.log('Profile found:', profile ? 'Yes' : 'No');
        }

        if (profileError || !profile) {
          console.log('Profile not found for Supabase token, creating one...');

          // In DEV_MODE, we can create a profile
          if (DEV_MODE) {
            console.log('DEV MODE: Creating profile for Supabase user');

            // Create a profile for the user
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                email: data.user.email,
                full_name: data.user.user_metadata?.full_name || 'User',
                role: data.user.user_metadata?.role || 'user',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select()
              .single();

            if (createError) {
              console.error('Failed to create profile:', createError);

              // Continue without a profile in DEV_MODE
              req.user = {
                id: data.user.id,
                email: data.user.email,
                full_name: data.user.user_metadata?.full_name || 'Development User',
                role: 'user',
                isStaff: false,
                is_dev: true
              };
              return next();
            }

            console.log('Created new profile:', newProfile);
            profile = newProfile;
          } else {
            return errorResponse(res, 'User profile not found', 401);
          }
        }

        // Add user to request with unified user model
        req.user = {
          id: profile.id,
          email: profile.email || data.user.email, // Use Supabase email if profile email is not available
          full_name: profile.full_name,
          role: profile.role,
          isStaff: false,
          avatar_url: profile.avatar_url
        };

        return next();
      } catch (supabaseError) {
        console.error('Supabase token verification error:', supabaseError);
        return errorResponse(res, 'Invalid token', 401);
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);

    if (DEV_MODE) {
      // In development mode, allow requests even if there's an error
      console.log('DEV MODE: Allowing request despite error');
      req.user = {
        id: DEV_USER_ID,
        email: 'dev@example.com',
        full_name: 'Development User',
        role: 'user',
        isStaff: false,
        is_dev: true
      };
      return next();
    }

    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid token', 401);
    }

    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired', 401);
    }

    return errorResponse(res, 'Authentication failed', 500, error.message);
  }
};

/**
 * Role-based authorization middleware
 * @param {Array} roles - Array of allowed roles
 * @returns {Function} Middleware function
 */
const authorizeRoles = (roles) => {
  return (req, res, next) => {
    // In development mode, allow all role-based access
    if (DEV_MODE && req.user && req.user.is_dev) {
      console.log(`DEV MODE: Bypassing role check for ${roles.join(', ')}`);
      return next();
    }

    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401);
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 'Not authorized to access this resource', 403);
    }

    next();
  };
};

/**
 * Staff-only authorization middleware
 * @returns {Function} Middleware function
 */
const authorizeStaff = (req, res, next) => {
  // In development mode, allow staff access if specified
  if (DEV_MODE && req.user && req.user.is_dev) {
    // Check if the request has a staff flag in the query or headers
    const isStaffRequest = req.query.staff === 'true' || req.headers['x-staff-request'] === 'true';
    if (isStaffRequest) {
      console.log('DEV MODE: Allowing staff access');
      // Update the user to be a staff user
      req.user.isStaff = true;
      req.user.role = 'assistant_project_officer'; // Default staff role
      return next();
    }
  }

  if (!req.user) {
    return errorResponse(res, 'Authentication required', 401);
  }

  if (!req.user.isStaff) {
    return errorResponse(res, 'Staff access required', 403);
  }

  next();
};

module.exports = {
  authMiddleware,
  authorizeRoles,
  authorizeStaff
};

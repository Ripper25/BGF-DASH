import { User, LoginRequest, RegisterRequest, ProfileUpdateRequest, PasswordChangeRequest } from '@/types/user';

export interface AuthResponse {
  user: User;
  token: string;
}

// Simulated user data
const simulatedUser: User = {
  id: 'simulated-user-id',
  email: 'user@example.com',
  full_name: 'Simulated User',
  role: 'user',
  isStaff: false,
  phone_number: '123-456-7890',
  address: '123 Main St, City, Country',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Simulated staff user data
const simulatedStaffUser: User = {
  id: 'simulated-staff-id',
  email: 'staff@example.com',
  full_name: 'Simulated Staff',
  role: 'project_manager',
  isStaff: true,
  staffNumber: 'STAFF-001',
  phone_number: '123-456-7890',
  address: '123 Main St, City, Country',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Simulated admin user data
const simulatedAdminUser: User = {
  id: 'simulated-admin-id',
  email: 'admin@example.com',
  full_name: 'Simulated Admin',
  role: 'admin',
  isStaff: true,
  staffNumber: 'ADMIN-001',
  phone_number: '123-456-7890',
  address: '123 Main St, City, Country',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Generate a fake JWT token
const generateFakeToken = (user: User): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.full_name,
    role: user.role,
    isStaff: user.isStaff,
    staff_number: user.staffNumber,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 // 24 hours
  }));
  const signature = btoa('fake-signature');
  return `${header}.${payload}.${signature}`;
};

export const simulatedAuthService = {
  /**
   * Simulated login - always succeeds and returns a user
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log('Simulated login with credentials:', credentials);
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let user: User;
    
    // Determine which user to return based on credentials
    if (credentials.staffNumber) {
      if (credentials.email.includes('admin')) {
        user = simulatedAdminUser;
      } else {
        user = simulatedStaffUser;
      }
    } else {
      user = simulatedUser;
    }
    
    // Generate a fake token
    const token = generateFakeToken(user);
    
    // Store the token in localStorage
    localStorage.setItem('bgf.auth.token', token);
    
    return { user, token };
  },
  
  /**
   * Simulated registration - always succeeds
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    console.log('Simulated registration with data:', userData);
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Create a new user based on the registration data
    const user: User = {
      id: `simulated-user-${Date.now()}`,
      email: userData.email,
      full_name: userData.full_name,
      role: 'user',
      isStaff: false,
      phone_number: userData.phone_number || '',
      address: userData.address || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Generate a fake token
    const token = generateFakeToken(user);
    
    // Store the token in localStorage
    localStorage.setItem('bgf.auth.token', token);
    
    return { user, token };
  },
  
  /**
   * Simulated logout - always succeeds
   */
  async logout(): Promise<void> {
    console.log('Simulated logout');
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Remove the token from localStorage
    localStorage.removeItem('bgf.auth.token');
  },
  
  /**
   * Simulated get profile - returns the user based on the token
   */
  async getProfile(): Promise<User> {
    console.log('Simulated get profile');
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Check if we have a token in localStorage
    const token = localStorage.getItem('bgf.auth.token');
    if (!token) {
      throw new Error('No token found');
    }
    
    // Parse the token to get the user data
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      const payload = JSON.parse(atob(tokenParts[1]));
      
      // Return the appropriate user based on the token
      if (payload.isStaff) {
        if (payload.role === 'admin') {
          return simulatedAdminUser;
        } else {
          return simulatedStaffUser;
        }
      } else {
        return simulatedUser;
      }
    } catch (error) {
      console.error('Error parsing token:', error);
      throw new Error('Invalid token');
    }
  },
  
  /**
   * Simulated update profile - always succeeds
   */
  async updateProfile(profileData: ProfileUpdateRequest): Promise<User> {
    console.log('Simulated update profile with data:', profileData);
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get the current user
    const currentUser = await this.getProfile();
    
    // Update the user with the new data
    const updatedUser: User = {
      ...currentUser,
      full_name: profileData.full_name || currentUser.full_name,
      phone_number: profileData.phone_number || currentUser.phone_number,
      address: profileData.address || currentUser.address,
      avatar_url: profileData.avatar_url || currentUser.avatar_url,
      updated_at: new Date().toISOString()
    };
    
    return updatedUser;
  },
  
  /**
   * Simulated change password - always succeeds
   */
  async changePassword(passwordData: PasswordChangeRequest): Promise<{ message: string }> {
    console.log('Simulated change password');
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { message: 'Password changed successfully' };
  },
  
  /**
   * Simulated delete account - always succeeds
   */
  async deleteAccount(password: string): Promise<{ message: string }> {
    console.log('Simulated delete account');
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Remove the token from localStorage
    localStorage.removeItem('bgf.auth.token');
    
    return { message: 'Account deleted successfully' };
  }
};

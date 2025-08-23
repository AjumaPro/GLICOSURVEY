# GLICO Survey Admin System

## Overview

The GLICO Survey platform includes a comprehensive admin system with super admin privileges for managing user accounts and monitoring system activity.

## Features

### 🔐 Admin-Only Registration System
- **Restricted Access**: Only admins and super admins can create new accounts
- **Public Login**: Anyone can log in with existing credentials
- **Role-Based Creation**: Admins can create regular users, super admins can create any role
- **Secure Registration**: Registration endpoint requires authentication

### 🔐 Super Admin Privileges
- **User Management**: Create, edit, and delete user accounts
- **Role Management**: Assign roles (user, admin, super_admin) to users
- **System Monitoring**: View platform statistics and user activity
- **Access Control**: Only super admin users can access the admin dashboard
- **Full Control**: Can manage all accounts including other admin and super admin accounts
- **Account Deletion**: Can delete any user account including other super admins (with warnings)
- **Role Escalation**: Can promote users to admin or super admin roles
- **Password Management**: View password hashes and reset user passwords
- **Team Invitations**: Invite team members with temporary passwords
- **Complete Visibility**: Can see all users and accounts in the system

### 👥 Admin & Super Admin Team Features
- **Team Invitations**: Send invitations to new team members
- **Temporary Passwords**: Generate secure temporary passwords for new users
- **Role-Based Invitations**: Admins can invite users, super admins can invite any role
- **Personal Messages**: Include custom messages in invitations
- **Immediate Access**: Invited users can login immediately with temporary passwords

### 🔒 Admin Visibility Restrictions
- **Limited Super Admin Visibility**: Admins can only see super admin accounts they created
- **Full User Visibility**: Admins can see all regular user and admin accounts
- **Filtered Statistics**: Dashboard stats reflect only visible accounts
- **Account Tracking**: System tracks who created each account via `created_by` field
- **Security Enhancement**: Prevents admins from seeing other super admin accounts

### 📊 Admin Dashboard
- **User Statistics**: Total users, admins, super admins, new users (7 days)
- **Survey Statistics**: Total surveys, published surveys, draft surveys
- **Response Statistics**: Total responses, unique respondents
- **User Management**: Search, filter, and paginate through users

### 👥 User Management
- **Create Users**: Add new users with specified roles (admin-only)
- **Edit Users**: Update user information and roles
- **Delete Users**: Remove users (with safety checks)
- **Search & Filter**: Find users by name, email, or role
- **Pagination**: Navigate through large user lists
- **Registration Access**: Only admins can access the registration page
- **Password Management**: View password hashes and reset passwords (super admin only)
- **Team Invitations**: Invite new team members with temporary passwords

## Setup Instructions

### 1. Database Setup
First, ensure your database is set up:
```bash
npm run setup-db
```

### 2. Create Super Admin User
Create the initial super admin user:
```bash
npm run create-admin
```

This will create a super admin with these default credentials:
- **Email**: admin@glico.com
- **Password**: admin123
- **Name**: Super Admin

### 3. Create Test Admin User (Optional)
Create a regular admin user for testing:
```bash
npm run create-test-admin
```

This will create an admin with these credentials:
- **Email**: admin@test.com
- **Password**: admin123
- **Name**: Test Admin

### 4. Environment Variables
Add these variables to your `.env` file:
```env
# Super Admin Configuration
SUPER_ADMIN_EMAIL=admin@glico.com
SUPER_ADMIN_PASSWORD=admin123
SUPER_ADMIN_NAME=Super Admin
```

## API Endpoints

### Authentication Required
All admin endpoints require authentication and super admin role.

### User Management
- `GET /api/admin/users` - Get all users (with pagination and filtering)
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/users/:id/password` - Get user password hash (super admin only)
- `POST /api/admin/users/:id/reset-password` - Reset user password (super admin only)
- `POST /api/admin/invite` - Invite team member (admin/super admin)

### Statistics
- `GET /api/admin/stats` - Get admin dashboard statistics

## Registration System

### Admin-Only Registration
- **Restricted Access**: The `/register` endpoint now requires admin authentication
- **Role-Based Permissions**: 
  - **Admins**: Can only create regular user accounts
  - **Super Admins**: Can create any role (user, admin, super_admin)
- **Public Login**: The login page remains public for existing users
- **Access Control**: Registration page shows access denied for non-admin users

### Registration Flow
1. **Admin Login**: Admin must be logged in to access registration
2. **Navigate to Register**: Use the "Create Account" button in admin dashboard
3. **Fill Form**: Enter user details (name, email, password, role)
4. **Create Account**: System validates permissions and creates account
5. **User Login**: New user can immediately log in with their credentials

### Security Features
- **Authentication Required**: Registration endpoint requires valid JWT token
- **Role Validation**: System checks admin permissions before allowing registration
- **Input Validation**: All user inputs are validated and sanitized
- **Email Uniqueness**: Prevents duplicate email addresses
- **Password Hashing**: Secure password storage with bcrypt

## Security Features

### Role-Based Access Control
- **user**: Regular survey creator
- **admin**: Can manage surveys and view analytics
- **super_admin**: Full system access including user management

### Safety Checks
- Super admins cannot delete their own account
- Super admins can delete other super admin accounts (with warnings)
- Super admins cannot modify their own account through admin panel
- Super admins cannot view or reset their own password through admin panel
- Admins cannot see super admin accounts they didn't create
- Email uniqueness validation
- Password hashing with bcrypt
- Confirmation dialogs for super admin deletions
- Role-based warnings for sensitive operations
- Temporary password generation for team invitations
- Account creation tracking via `created_by` field

### API Protection
- JWT authentication required
- Super admin role verification
- Rate limiting
- Input validation

## Frontend Components

### AdminDashboard.js
Main admin interface with:
- Statistics cards
- User management table
- Search and filtering
- Create/Edit user modals
- Pagination

### Navigation Integration
Admin link appears in sidebar only for super admin users.

## Usage Guide

### Accessing Admin Dashboard
1. Log in with super admin credentials
2. Navigate to "Admin" in the sidebar
3. View system statistics and manage users

### Creating a New User
1. Click "Add User" button
2. Fill in user details (name, email, password, role)
3. Click "Create User"

### Editing a User
1. Click the edit icon next to a user
2. Modify user information
3. Leave password blank to keep current password
4. Click "Update User"

### Deleting a User
1. Click the delete icon next to a user
2. Confirm deletion in the popup (special warning for super admin deletions)
3. User and all associated data will be removed
4. System shows appropriate warnings for sensitive operations

### Managing User Passwords (Super Admin Only)
1. Click the eye icon to view password hash
2. Click the shield icon to reset password
3. Enter new password and confirm reset
4. User can immediately login with new password

### Inviting Team Members
1. Click "Invite Team Member" button
2. Fill in user details (name, email, role)
3. Add optional personal message
4. System generates temporary password
5. Invited user can login immediately with temporary password

### Searching and Filtering
- Use the search box to find users by name or email
- Use the role filter to show specific user types
- Navigate through pages using pagination controls

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Troubleshooting

### Common Issues

**"Super admin access required" error**
- Ensure you're logged in with a super admin account
- Check that the user role is set to 'super_admin' in the database

**Cannot create super admin**
- Check database connection
- Ensure the setup-db script has been run
- Verify environment variables are set correctly

**Admin link not showing in sidebar**
- Log out and log back in
- Check that the user role is 'super_admin'
- Clear browser cache

### Database Queries

**Check user roles:**
```sql
SELECT id, email, name, role FROM users ORDER BY role, created_at;
```

**Make a user super admin:**
```sql
UPDATE users SET role = 'super_admin' WHERE email = 'user@example.com';
```

**Reset super admin password:**
```sql
UPDATE users SET password_hash = 'new_hashed_password' WHERE role = 'super_admin';
```

## Best Practices

### Security
- Change default super admin password immediately
- Use strong passwords for all admin accounts
- Regularly review user roles and permissions
- Monitor admin activity logs

### User Management
- Use descriptive names for admin accounts
- Document role assignments
- Regularly audit user accounts
- Remove inactive users

### System Monitoring
- Monitor user growth trends
- Track survey creation and response rates
- Watch for unusual activity patterns
- Regular backup of user data

## Future Enhancements

### Planned Features
- **Audit Logs**: Track all admin actions
- **Bulk Operations**: Import/export users
- **Advanced Analytics**: Detailed user activity reports
- **Role Permissions**: Granular permission system
- **Email Notifications**: Admin action alerts
- **Two-Factor Authentication**: Enhanced security for admin accounts

### API Extensions
- User activity tracking
- System health monitoring
- Backup and restore operations
- Advanced reporting endpoints

## Support

For issues with the admin system:
1. Check the troubleshooting section
2. Verify database connectivity
3. Review server logs for errors
4. Ensure all environment variables are set
5. Contact the development team

---

**Note**: The admin system is designed for internal use only. Ensure proper security measures are in place before deploying to production. 
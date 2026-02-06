# Role-Based Admin & Project Management Backend

## Overview
This is the **backend** for a Role-Based Admin & Project Management System with **invite-based user onboarding**.  
Admins can manage users and projects, while users can only register via admin-generated invites.  

---

## Tech Stack
- **Node.js**  
- **Express.js**  
- **MongoDB**
- **JWT Authentication**  
- **Password hashing**  
- **Invite-based registration flow**  

---

## Features

### User Management
- Users cannot self-register  
- Admin generates user invites  
- Invited users register via invite token  
- Admin can:
  - Change user roles (ADMIN | MANAGER | STAFF)  
  - Activate/deactivate users  
  - View all users (paginated)  
- Deactivated users cannot log in  

### Project Management
- Authenticated users can create projects  
- Only admins can edit or delete projects  
- Soft delete implemented for projects  
- Non-admin users can view projects but cannot modify  

### Authentication & Security
- JWT-based authentication  
- Role-based access control 
- Protected routes with middleware  
- Password hashing with bcrypt  
- Centralized error handling & request validation  

---

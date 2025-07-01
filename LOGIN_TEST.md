# 🔐 Login Test Guide

## Current Login Credentials

### ✅ Working Credentials (Updated)

#### Admin Account
- **Email:** `admin@example.com`
- **Password:** `admin123`
- **Role:** Admin

#### Regular User Account  
- **Email:** `user@example.com`
- **Password:** `user123`
- **Role:** User

## 🔧 Troubleshooting Steps

### 1. Check Environment Variables
Make sure you have these in your `.env.local` file:
```
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### 2. Test Login Flow
1. Go to `http://localhost:3000/auth/login`
2. Select "Regular User" account type
3. Enter: `user@example.com` / `user123`
4. Click "Sign In"
5. Should redirect to `/dashboard`

### 3. Test Admin Login
1. Go to `http://localhost:3000/auth/login`
2. Select "Administrator" account type  
3. Enter: `admin@example.com` / `admin123`
4. Click "Sign In"
5. Should redirect to `/admin`

### 4. Check Console for Errors
Open browser dev tools and check:
- Network tab for failed requests
- Console tab for JavaScript errors
- Application tab for session storage

### 5. Common Issues

#### Issue: Login successful but no redirect
- Check if session is created in browser storage
- Verify NextAuth callbacks are working
- Check dashboard layout authentication guard

#### Issue: "Invalid email or password"
- Verify credentials match exactly
- Check if MongoDB connection is working
- Verify demo users are configured correctly

#### Issue: Session not persisting
- Check NEXTAUTH_SECRET is set
- Verify session strategy is "jwt"
- Check browser storage for session data

## 🧪 Quick Test

Run this in browser console to check session:
```javascript
// Check if session exists
console.log('Session:', sessionStorage.getItem('next-auth.session-token'));

// Check if user is authenticated
fetch('/api/auth/session').then(r => r.json()).then(console.log);
```

## 📞 Support

If login still doesn't work:
1. Check browser console for errors
2. Verify all environment variables are set
3. Restart the development server
4. Clear browser cache and cookies 
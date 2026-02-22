# Photo Upload Troubleshooting Guide

## Issues Fixed:

### 1. 404 Error on Upload Route
**Problem**: `/api/users/me/upload-photo` returns 404
**Solution**: Backend server needs to be restarted to load new routes

**Steps**:
1. Stop the backend server (Ctrl+C in the terminal running the server)
2. Run `npm run dev` in the backend directory
3. Verify server starts without errors

### 2. Navbar Destructuring Error
**Problem**: "Cannot destructure property 'user' of 'useAuth()' as it is undefined"
**Solution**: Added safety checks in both Navbar and AuthContext

**Changes Made**:
- Added null check in Navbar before destructuring
- Added error boundary in useAuth hook
- Better error messages when AuthContext is not available

## Verification Steps:

1. **Test Cloudinary Config**:
   ```bash
   cd backend
   node test-upload.js
   ```
   Should show all ✓ marks

2. **Restart Backend**:
   ```bash
   cd backend
   npm run dev
   ```

3. **Test Upload**:
   - Go to Edit Profile page
   - Click camera icon
   - Select an image
   - Should upload successfully

## Common Issues:

### Upload fails with "Failed to upload photo"
- Check Cloudinary credentials in `.env`
- Verify file size is under 5MB
- Check file format (JPG, JPEG, PNG, WEBP only)

### Image doesn't appear after upload
- Check browser console for errors
- Verify Cloudinary URL is returned in response
- Check if AuthContext is updating

### 401 Unauthorized
- User is not logged in
- Token expired - try logging in again

## Environment Variables Required:
```
CLOUDINARY_CLOUD_NAME=dse13zdp7
CLOUDINARY_API_KEY=772848927726232
CLOUDINARY_API_SECRET=VroIKJcPgvKVeYkjl_k2mttYyOM
```

✅ All set! Just restart the backend server.

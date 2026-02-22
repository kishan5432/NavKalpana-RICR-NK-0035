# Cloudinary Setup Instructions

## Steps to Configure Cloudinary:

1. **Create a Cloudinary Account**
   - Go to https://cloudinary.com/
   - Sign up for a free account

2. **Get Your Credentials**
   - After logging in, go to your Dashboard
   - You'll see your credentials:
     - Cloud Name
     - API Key
     - API Secret

3. **Update .env File**
   - Open `backend/.env`
   - Replace the placeholder values:
     ```
     CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
     CLOUDINARY_API_KEY=your_actual_api_key
     CLOUDINARY_API_SECRET=your_actual_api_secret
     ```

4. **Restart Backend Server**
   - Stop the backend server (Ctrl+C)
   - Run `npm run dev` again

## Features Implemented:

✅ Photo upload with Cloudinary storage
✅ Multer middleware for file handling
✅ 5MB file size limit
✅ Automatic image optimization (500x500px)
✅ Supported formats: JPG, JPEG, PNG, WEBP
✅ Camera icon button for easy upload
✅ Real-time preview after upload
✅ Profile picture updates in AuthContext
✅ Works for both passengers and drivers

## Usage:

1. Go to Edit Profile page
2. Click the camera icon on the profile picture
3. Select an image file
4. Photo will be uploaded to Cloudinary
5. Profile picture updates automatically

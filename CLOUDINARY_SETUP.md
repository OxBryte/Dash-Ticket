# Cloudinary Setup Guide for TixHub

## Getting Your Cloudinary Credentials

1. **Sign up for Cloudinary** (Free account)
   - Go to: https://cloudinary.com/users/register/free
   - Or sign in if you already have an account: https://cloudinary.com/users/login

2. **Get Your Credentials**
   - After logging in, go to your Dashboard: https://cloudinary.com/console
   - You'll see your credentials at the top:
     - **Cloud Name**: e.g., `dxyz123abc`
     - **API Key**: e.g., `123456789012345`
     - **API Secret**: e.g., `abcdefghijklmnopqrstuvwxyz123`

3. **Add to `.env` file**
   - Create or update your `.env` file in the project root
   - Add these lines (replace with your actual credentials):

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your-cloud-name-here"
CLOUDINARY_API_KEY="your-api-key-here"
CLOUDINARY_API_SECRET="your-api-secret-here"

# For frontend (optional - for direct uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name-here"
```

## Quick Setup Steps

```bash
# 1. Copy .env.example to .env (if you haven't already)
cp .env.example .env

# 2. Edit .env and add your Cloudinary credentials
# Replace the placeholder values with your actual Cloudinary credentials

# 3. Restart your development server
npm run dev
```

## Features Enabled

Once configured, your app will:
- ✅ Upload event images to Cloudinary (not local storage)
- ✅ Automatically optimize images (quality, format, size)
- ✅ Resize images to max 1920x1080
- ✅ Store images in organized folders: `tixhub/events/`
- ✅ Use Cloudinary's CDN for fast image delivery worldwide
- ✅ Delete images when needed

## Testing the Upload

1. Navigate to: http://localhost:3000/organizer/events/create
2. Click on "Upload Image" tab
3. Drag & drop or click to select an image
4. The image will upload to Cloudinary and show a preview
5. Check your Cloudinary Media Library to see the uploaded image

## Folder Structure in Cloudinary

Your images will be organized as:
```
tixhub/
  └── events/
      ├── image1.jpg
      ├── image2.png
      └── ...
```

## Free Tier Limits

Cloudinary free tier includes:
- 25 GB storage
- 25 GB bandwidth/month
- 25,000 transformations/month

This is more than enough for development and small production apps!

## Troubleshooting

### Error: "Invalid credentials"
- Double-check your Cloud Name, API Key, and API Secret
- Make sure there are no extra spaces or quotes in your .env file
- Restart your dev server after updating .env

### Error: "Failed to upload"
- Check your internet connection
- Verify your Cloudinary account is active
- Check Cloudinary dashboard for any issues

### Images not showing
- Make sure you're using the full Cloudinary URL returned from the API
- Check browser console for CORS or network errors
- Verify the image was actually uploaded in Cloudinary dashboard

## Additional Configuration (Optional)

### Custom Upload Presets
For more control, create an upload preset in Cloudinary:
1. Go to Settings → Upload
2. Click "Add upload preset"
3. Configure transformations, folder, etc.
4. Use the preset name in your code

### Image Transformations
Modify `/app/api/upload/route.ts` to customize:
- Image dimensions
- Quality settings
- Format conversions
- Watermarks
- And more!

See: https://cloudinary.com/documentation/image_transformations


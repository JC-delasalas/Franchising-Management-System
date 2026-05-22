# Google Maps Integration Setup

## Overview
The FranchiseHub platform includes Google Maps integration for displaying office locations on the contact page. When a valid Google Maps API key is not configured, the system automatically falls back to a beautiful static map preview.

## Current Status
✅ **Fallback Map Active** - The system is currently using a custom-designed fallback map that includes:
- Beautiful interactive visual representation of the office location
- Animated location marker with pulsing effect
- Direct links to Google Maps and Waze for navigation
- Contact information overlay with phone, email, and hours
- Clickable areas for easy navigation
- Professional design that maintains brand quality
- No API dependencies or costs

## Setting Up Google Maps API (Optional)

### Step 1: Get a Google Maps API Key
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Maps JavaScript API**
4. Go to **Credentials** and create an **API Key**
5. Restrict the API key to your domain for security

### Step 2: Configure the API Key
1. Open your `.env` file
2. Replace the placeholder API key:
   ```bash
   # Current configuration (fallback map active):
   VITE_GOOGLE_MAPS_API_KEY=

   # To enable Google Maps, add your actual API key:
   VITE_GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key_here
   ```
3. Restart your development server

### Step 3: API Key Restrictions (Recommended)
For security, restrict your API key:
- **Application restrictions**: HTTP referrers
- **Website restrictions**: Add your domain(s)
- **API restrictions**: Limit to Maps JavaScript API

## Features

### With Google Maps API
- ✅ Interactive Google Maps
- ✅ Zoom and pan functionality
- ✅ Custom markers and info windows
- ✅ Street view integration

### With Fallback Map (Current)
- ✅ Beautiful static map design
- ✅ Office location marker with animation
- ✅ Contact information overlay
- ✅ Direct links to Google Maps and Waze
- ✅ Responsive design
- ✅ No API costs or rate limits

## Location Details
- **Address**: Ayala Avenue, Makati City, Metro Manila, Philippines 1226
- **Coordinates**: 14.5564°N, 121.0252°E
- **Area**: Makati Central Business District
- **Nearby**: Ayala Triangle, Greenbelt, Glorietta

## Troubleshooting

### Map Not Loading
1. Check browser console for errors
2. Verify API key is correct and active
3. Ensure domain is whitelisted in Google Cloud Console
4. Check if Maps JavaScript API is enabled

### Fallback Map Issues
The fallback map should always work. If you see issues:
1. Check browser console for JavaScript errors
2. Ensure all required icons are loading
3. Verify the LocationMap component is properly imported

## Cost Considerations
- Google Maps API has usage-based pricing
- The fallback map is completely free
- For most small to medium websites, the fallback map provides excellent user experience
- Consider your traffic volume before enabling the API

## Support
For technical support with Google Maps integration, check:
1. [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
2. [Google Cloud Console](https://console.cloud.google.com/)
3. Project documentation in `/docs/`

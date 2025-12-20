# 🚀 Complete Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (version 16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **A modern web browser**
   - Chrome, Firefox, Safari, or Edge
   - WebGL support required

---

## 📦 Installation Steps

### Step 1: Set Up Project Directory

```bash
# Create a new directory for the project
mkdir virtual-tryout-app
cd virtual-tryout-app

# Copy all project files into this directory
# Make sure you have:
# - virtual-tryout.jsx
# - main.jsx
# - index.html
# - package.json
# - vite.config.js
# - README.md
```

### Step 2: Install Dependencies

```bash
# Install all required packages
npm install

# This will install:
# - react & react-dom (UI framework)
# - three (3D graphics library)
# - vite (development server & build tool)
# - @vitejs/plugin-react (React support for Vite)
```

Expected output:
```
added 150 packages in 15s
```

### Step 3: Start Development Server

```bash
# Run the development server
npm run dev
```

You should see output like:
```
  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### Step 4: Open in Browser

The app should automatically open in your browser at `http://localhost:5173`

If it doesn't open automatically:
1. Open your browser
2. Navigate to `http://localhost:5173`

---

## 🎨 Using the Application

### Body Customization Panel (Left Side)

**Adjust Measurements:**
- **Height**: 150-200 cm (drag slider)
- **Chest**: 60-130 cm
- **Waist**: 60-130 cm
- **Hips**: 60-130 cm
- **Shoulders**: 35-50 cm

The mannequin updates in real-time as you adjust sliders.

**Current Outfit Section:**
- Shows what the mannequin is wearing
- Click "Remove" to take off any item
- Updates automatically when you try on clothes

**Auto Rotate Button:**
- Click to start automatic 360° rotation
- Click again to pause
- Useful for viewing outfit from all angles

### 3D Mannequin (Center)

**Interaction:**
- Drop zone for drag-and-drop clothing
- Shows clothing in real-time
- Adapts to body measurements
- Professional lighting and shadows

**Visual Features:**
- Realistic skin tones
- Proper proportions
- Shadow casting
- Ambient occlusion

### Product Catalog (Right Side)

**Category Tabs:**
- **Tops**: Blouses, shirts, jackets, sweaters
- **Bottoms**: Jeans, pants, joggers
- **Shoes**: Sneakers, loafers, boots, sandals

**Product Cards:**
- Product name and fabric type
- Price displayed
- Color swatch preview
- "Try On" button

**Try On Methods:**

1. **Drag & Drop** (Recommended)
   - Click and hold on any product card
   - Drag to the center mannequin
   - Release to apply clothing

2. **Click Button**
   - Click "Try On" button on product card
   - Clothing instantly appears on mannequin

---

## 🎯 Example Workflows

### Workflow 1: Create Complete Outfit

1. Adjust body measurements to match your size
2. Switch to "Tops" category
3. Drag "Silk Blouse" to mannequin
4. Switch to "Bottoms" category
5. Click "Try On" on "Slim Jeans"
6. Switch to "Shoes" category
7. Drag "Loafers" to mannequin
8. Click "Auto Rotate" to view full outfit

### Workflow 2: Compare Different Items

1. Try on "Cotton Tee" (tops)
2. View from all angles
3. Click "Remove" next to "Top" in Current Outfit
4. Try on "Wool Sweater"
5. Compare the looks

### Workflow 3: Test Different Body Types

1. Set Height: 160cm, Chest: 85cm, Waist: 70cm
2. Try on an outfit
3. Note how clothes fit
4. Change to Height: 180cm, Chest: 100cm, Waist: 85cm
5. Same outfit adapts to new measurements

---

## 🐛 Troubleshooting

### Problem: npm install fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules if it exists
rm -rf node_modules

# Try installing again
npm install
```

### Problem: Port 5173 already in use

**Solution:**
```bash
# Kill process on port 5173
# On Mac/Linux:
lsof -ti:5173 | xargs kill -9

# On Windows:
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F

# Or use a different port
npm run dev -- --port 3000
```

### Problem: 3D mannequin not visible

**Check:**
1. Open browser console (F12)
2. Look for WebGL errors
3. Verify Three.js loaded: Check Network tab
4. Try a different browser

**Solutions:**
- Update graphics drivers
- Enable hardware acceleration in browser settings
- Try Chrome/Firefox if using Safari
- Check if WebGL is enabled: https://get.webgl.org/

### Problem: Drag and drop not working

**Solutions:**
- Make sure you're clicking and holding on the product card
- Drag all the way to the center canvas
- Try using the "Try On" button instead
- Check browser console for JavaScript errors

### Problem: Clothing not appearing

**Solutions:**
1. Check body measurements are within valid ranges
2. Try removing all items and adding one at a time
3. Refresh the page (Ctrl/Cmd + R)
4. Check browser console for errors

### Problem: Slow performance

**Solutions:**
- Close other browser tabs
- Disable browser extensions
- Reduce window size
- Try in a different browser
- Check if GPU acceleration is enabled

---

## 🏗️ Building for Production

### Create Production Build

```bash
npm run build
```

This creates optimized files in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

Opens the production build at `http://localhost:4173`

### Deploy to Web

The `dist/` folder contains all files needed to deploy:

**Static Hosting (Netlify, Vercel, GitHub Pages):**
1. Upload the entire `dist/` folder
2. Configure to serve `index.html` as the root

**Example with Netlify:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

---

## 📁 Project Structure Explained

```
virtual-tryout-app/
│
├── node_modules/          # Dependencies (auto-generated)
│   └── ...
│
├── dist/                  # Production build (after npm run build)
│   └── ...
│
├── index.html            # HTML entry point
│   └── Loads React app and fonts
│
├── main.jsx              # React initialization
│   └── Renders VirtualTryOn component
│
├── virtual-tryout.jsx    # Main application component
│   ├── Three.js scene setup
│   ├── Mannequin creation logic
│   ├── Clothing application logic
│   ├── Product catalog
│   └── UI components
│
├── package.json          # Dependencies & scripts
│   ├── dependencies: react, three
│   ├── devDependencies: vite, plugins
│   └── scripts: dev, build, preview
│
├── vite.config.js        # Vite configuration
│   ├── React plugin setup
│   ├── Server settings
│   └── Build options
│
├── .gitignore           # Git ignore patterns
│
└── README.md            # Project documentation
```

---

## 🔧 Customization Guide

### Adding New Products

1. Open `virtual-tryout.jsx`
2. Find the `products` object (around line 45)
3. Add new items to any category:

```javascript
const products = {
  tops: [
    // Existing items...
    { 
      id: 't7',                    // Unique ID
      name: 'Cashmere Cardigan',   // Display name
      color: '#E8D5C4',            // Hex color code
      price: 189,                  // Price in dollars
      fabric: 'Cashmere'           // Fabric type
    }
  ]
};
```

### Changing Color Scheme

Find and replace these color values:

**Background:**
```javascript
background: 'linear-gradient(135deg, #fdfbf7 0%, #f5f1e8 100%)'
// Change to your colors
```

**Accent Colors:**
```javascript
color: '#8b7355'  // Main accent
color: '#2c2416'  // Dark text
color: '#a89579'  // Light text
```

### Adjusting Body Measurement Ranges

```javascript
<input
  type="range"
  min={150}    // Minimum height
  max={200}    // Maximum height
  // Change these values
/>
```

### Changing Fonts

1. **Update Google Fonts import in `index.html`:**
```html
<link href="https://fonts.googleapis.com/css2?family=YourFont&display=swap">
```

2. **Update CSS in component:**
```javascript
fontFamily: '"YourFont", serif'
```

---

## 🎓 Technical Details

### Three.js Scene

**Camera:**
- Type: PerspectiveCamera
- FOV: 50°
- Position: (0, 1.6, 3)
- Looking at: (0, 1, 0)

**Lighting:**
- Ambient: 0.6 intensity
- Main directional: 0.8 intensity with shadows
- Fill light: 0.3 intensity
- Rim light: 0.4 intensity

**Shadows:**
- Type: PCFSoftShadowMap
- Resolution: 2048x2048
- Enabled on all meshes

### Mannequin Construction

Built from primitive geometries:
- Spheres (head, shoulders, joints)
- Cylinders (torso, limbs)
- Scaled based on body measurements

### Clothing Application

**Process:**
1. Remove existing clothing mesh
2. Create new geometry based on type
3. Apply material with fabric properties
4. Scale to match body metrics
5. Add to mannequin group

**Material Properties:**
- Roughness: 0.2 (silk) to 0.8 (cotton)
- Metalness: 0.1 to 0.4 (leather)
- Color: From product hex code

---

## 📚 Resources

### Learning Materials

- [Three.js Fundamentals](https://threejs.org/manual/)
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [WebGL Basics](https://webglfundamentals.org/)

### Useful Links

- [Three.js Examples](https://threejs.org/examples/)
- [React Patterns](https://reactpatterns.com/)
- [CSS Tricks for 3D](https://css-tricks.com/tag/three-js/)

### Community

- [Three.js Forum](https://discourse.threejs.org/)
- [React Community](https://react.dev/community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/three.js)

---

## 🎉 Success!

If you've completed all steps, you should now have:

✅ A fully functional 3D virtual try-on system
✅ Customizable mannequin with body measurements
✅ Drag-and-drop clothing interface
✅ Product catalog with multiple categories
✅ Premium, professional UI design

**Next Steps:**
- Experiment with different outfits
- Adjust body measurements
- Add your own products
- Customize the color scheme
- Share with friends!

---

## 💡 Tips & Tricks

1. **Best Performance**: Use Chrome or Edge browser
2. **Smooth Rotation**: Enable hardware acceleration
3. **Quick Try-On**: Use keyboard shortcuts (if implemented)
4. **Save Outfits**: Take screenshots of combinations
5. **Test Sizing**: Try extreme body measurements to see adaptation

---

## 📞 Need Help?

If you encounter issues not covered here:

1. Check the browser console (F12) for error messages
2. Verify all files are in the correct locations
3. Ensure all dependencies installed successfully
4. Try clearing browser cache
5. Restart the development server

**Common Commands:**
```bash
# Stop server: Ctrl+C
# Restart: npm run dev
# Reinstall: rm -rf node_modules && npm install
# Clear cache: npm cache clean --force
```

---

**Happy Coding! 🎨👗👔**

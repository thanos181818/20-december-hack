# 🎨 ATELIER - Virtual Fitting Room

A premium 3D clothing e-commerce system with virtual try-on capabilities. Built with React, Three.js, and Tailwind CSS.

## ✨ Features

- **3D Mannequin Visualization** - Realistic human model rendered with Three.js
- **Body Customization** - Adjust height, chest, waist, hips, and shoulder measurements
- **Drag & Drop Try-On** - Intuitive interface to try clothes on the mannequin
- **Real-time Physics** - Clothing adapts to body measurements dynamically
- **Premium UI/UX** - Elegant, distinctive design with editorial aesthetic
- **Product Catalog** - Browse tops, bottoms, and shoes with fabric details
- **Auto-Rotation** - View the mannequin from all angles

## 🛠️ Technology Stack

- **React** - UI framework
- **Three.js** - 3D graphics and mannequin rendering
- **Tailwind CSS** - Styling (core utility classes only)
- **Custom Shaders** - Material rendering for different fabrics

## 📁 Project Structure

```
virtual-tryout/
├── virtual-tryout.jsx          # Main React component
├── package.json                # Dependencies
├── README.md                   # Documentation
└── index.html                  # HTML entry point
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm

### Installation

1. **Clone or download the project files**

2. **Install dependencies:**
```bash
npm install
```

3. **Run the development server:**
```bash
npm run dev
```

4. **Open in browser:**
Navigate to `http://localhost:5173`

## 📦 Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "three": "^0.160.0"
}
```

## 🎯 How to Use

### Body Customization
1. Use the sliders on the left panel to adjust body measurements
2. The mannequin updates in real-time
3. Clothing automatically adapts to the new measurements

### Try On Clothes
**Method 1: Drag & Drop**
- Drag any product card from the right panel
- Drop it onto the 3D mannequin in the center
- The clothing appears instantly

**Method 2: Click Button**
- Click the "Try On" button on any product card
- The item is automatically applied to the mannequin

### Browse Products
- Switch between categories: Tops, Bottoms, Shoes
- View product details: name, fabric type, price, color
- Each item shows a color swatch

### Remove Items
- Go to "Current Outfit" section in the left panel
- Click "Remove" button next to any worn item

### Rotate View
- Click "Auto Rotate" button to spin the mannequin
- Click "Pause Rotation" to stop

## 🎨 Design Philosophy

The interface follows an **editorial, atelier-inspired aesthetic**:

- **Typography**: Playfair Display (headers) + Spectral (body)
- **Colors**: Warm neutrals with earthy accents (#f5f1e8, #8b7355, #2c2416)
- **Layout**: Clean three-panel design with generous spacing
- **Interactions**: Smooth transitions and hover effects
- **Materials**: Realistic fabric rendering (leather, silk, cotton, etc.)

## 🔧 Customization

### Adding New Products

Edit the `products` object in `virtual-tryout.jsx`:

```javascript
const products = {
  tops: [
    { 
      id: 't7', 
      name: 'Cashmere Cardigan', 
      color: '#E8D5C4', 
      price: 189, 
      fabric: 'Cashmere' 
    },
    // Add more...
  ]
};
```

### Adjusting Body Ranges

Modify the range input min/max values:

```javascript
<input
  type="range"
  min={150}  // Change minimum
  max={200}  // Change maximum
  value={value}
  // ...
/>
```

### Changing Colors/Theme

Update the style values in the component:

```javascript
background: 'linear-gradient(135deg, #fdfbf7 0%, #f5f1e8 100%)'
// Change gradient colors

color: '#2c2416'
// Change text colors
```

## 🎭 Fabric Materials

The system includes realistic material rendering for:

- **Leather** - Low roughness (0.3), metallic (0.4)
- **Silk** - Very smooth (0.2), minimal metallic
- **Cotton** - High roughness (0.8), natural look
- **Wool** - Textured appearance
- **Denim** - Mid-range roughness
- **Canvas** - Sturdy, matte finish

## 🌟 Advanced Features

### Lighting Setup
- Ambient light for overall illumination
- Directional lights with shadows
- Fill light for softer shadows
- Rim light for edge definition

### Shadow Quality
- PCF soft shadows enabled
- 2048x2048 shadow map resolution
- Realistic shadow casting from clothing

### Performance Optimization
- Efficient geometry reuse
- Conditional rendering
- Request animation frame management
- Proper cleanup on unmount

## 🐛 Troubleshooting

**Issue: Mannequin not visible**
- Check browser console for Three.js errors
- Ensure canvas element is rendering
- Verify camera position and scene setup

**Issue: Clothing not appearing**
- Check that item has valid color hex code
- Verify clothing type matches category
- Ensure body metrics are within valid ranges

**Issue: Drag and drop not working**
- Verify `draggable` attribute is set
- Check event handlers are properly bound
- Ensure no CSS interfering with drag events

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 15+

Requires WebGL support for 3D rendering.

## 🎓 Learning Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [React Documentation](https://react.dev/)
- [WebGL Fundamentals](https://webglfundamentals.org/)

## 📄 License

This project is open source and available for educational purposes.

## 🤝 Contributing

Feel free to:
- Add more clothing items
- Improve material rendering
- Add new body customization options
- Enhance UI/UX
- Add more categories (accessories, outerwear, etc.)

## 🔮 Future Enhancements

- [ ] AI-powered size recommendations
- [ ] Photo upload for body scanning
- [ ] Multiple mannequin poses
- [ ] Shopping cart integration
- [ ] Save outfit combinations
- [ ] Social sharing features
- [ ] AR try-on with camera
- [ ] Fabric texture mapping
- [ ] Animation states (walking, standing)
- [ ] Color variants for each product

---

**Created with ❤️ using React, Three.js, and modern web technologies**

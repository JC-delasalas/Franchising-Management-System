# 🎨 FranchiseHub Logo Usage Guide

<div align="center">
  <img src="../public/logo.svg" alt="FranchiseHub Logo" width="120" height="120" />
</div>

## 📋 Logo Assets Overview

### **Available Logo Files**

| File | Size | Usage | Format |
|------|------|-------|--------|
| `logo.svg` | 512x512 | Main logo, documentation | SVG |
| `logo-simple.svg` | 64x64 | Small UI components | SVG |
| `favicon-16x16.svg` | 16x16 | Browser favicon | SVG |
| `favicon-32x32.svg` | 32x32 | Browser favicon | SVG |
| `favicon-192x192.svg` | 192x192 | PWA icon | SVG |
| `favicon-512x512.svg` | 512x512 | PWA icon, app stores | SVG |
| `apple-touch-icon.svg` | 180x180 | iOS home screen | SVG |
| `og-image.svg` | 1200x630 | Social media previews | SVG |

### **Logo Design Elements**

#### **Color Palette**
- **Primary Red**: `#E57373` to `#B71C1C` (gradient)
- **Secondary Pink**: `#F8BBD9` to `#E91E63` (gradient)
- **Accent Red**: `#EF5350` to `#C62828` (gradient)
- **White Elements**: `#FFFFFF` (windows and connectors)

#### **Design Concept**
The FranchiseHub logo represents:
- **Three Buildings**: Symbolizing multiple franchise locations
- **Connected Architecture**: Representing unified management
- **Modern Design**: Clean, professional appearance
- **Scalable Elements**: Works at all sizes from 16px to 512px

## 🔧 Implementation Guide

### **React Component Usage**

#### **Main Logo Component**
```tsx
import Logo from '@/components/Logo';

// Standard usage
<Logo size="md" showText={true} />

// Icon only
<Logo size="sm" showText={false} />

// Large with custom styling
<Logo size="lg" className="text-white" />
```

#### **Error Page Logo**
```tsx
import ErrorPageLogo from '@/components/error/ErrorPageLogo';

<ErrorPageLogo size="md" />
```

#### **Loading Screen**
```tsx
import LoadingScreen from '@/components/ui/LoadingScreen';

<LoadingScreen message="Loading dashboard..." size="lg" />
```

### **HTML Meta Tags**

#### **Favicon Implementation**
```html
<!-- Standard favicon -->
<link rel="icon" href="/favicon-32x32.svg" type="image/svg+xml" />
<link rel="icon" href="/favicon-16x16.svg" sizes="16x16" type="image/svg+xml" />
<link rel="icon" href="/favicon-32x32.svg" sizes="32x32" type="image/svg+xml" />

<!-- Apple touch icon -->
<link rel="apple-touch-icon" href="/apple-touch-icon.svg" sizes="180x180" />

<!-- PWA manifest -->
<link rel="manifest" href="/manifest.json" />
```

#### **Social Media Meta Tags**
```html
<!-- Open Graph -->
<meta property="og:image" content="/og-image.svg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="/og-image.svg" />
```

### **PWA Manifest Configuration**

```json
{
  "name": "FranchiseHub - Complete Franchise Management System",
  "short_name": "FranchiseHub",
  "theme_color": "#E57373",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/favicon-192x192.svg",
      "sizes": "192x192",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    },
    {
      "src": "/favicon-512x512.svg",
      "sizes": "512x512",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ]
}
```

## 📐 Logo Usage Guidelines

### **Size Recommendations**

#### **Minimum Sizes**
- **Web UI**: 16x16px minimum
- **Print**: 0.5 inch minimum
- **Mobile**: 24x24px minimum for touch targets

#### **Optimal Sizes**
- **Header Logo**: 32x32px to 48x48px
- **Dashboard**: 24x24px to 32x32px
- **Documentation**: 80x80px to 120x120px
- **Social Media**: 1200x630px for previews

### **Background Compatibility**

#### **Light Backgrounds** ✅
- White backgrounds work perfectly
- Light gray backgrounds (recommended)
- Subtle patterns or textures

#### **Dark Backgrounds** ⚠️
- May need white outline or background
- Test visibility carefully
- Consider using white background variant

### **Accessibility Guidelines**

#### **Alt Text Standards**
```html
<!-- Standard alt text -->
<img src="/logo.svg" alt="FranchiseHub Logo" />

<!-- Descriptive alt text -->
<img src="/logo.svg" alt="FranchiseHub - Franchise Management System Logo" />

<!-- Decorative usage -->
<img src="/logo.svg" alt="" role="presentation" />
```

#### **Color Contrast**
- Logo maintains good contrast on white backgrounds
- Test with accessibility tools for compliance
- Ensure 4.5:1 contrast ratio for text elements

## 🚀 Performance Optimization

### **SVG Benefits**
- **Scalable**: Perfect at any size
- **Small File Size**: Optimized for web performance
- **Crisp Display**: Sharp on all screen densities
- **Fast Loading**: Minimal bandwidth usage

### **Loading Strategies**
```tsx
// Eager loading for above-the-fold logos
<img src="/logo.svg" alt="Logo" loading="eager" />

// Lazy loading for below-the-fold usage
<img src="/logo.svg" alt="Logo" loading="lazy" />
```

### **Caching Headers**
```
Cache-Control: public, max-age=31536000
```

## 🔄 Logo Updates and Maintenance

### **Version Control**
- All logo files are version controlled in `/public/` directory
- Changes require testing across all usage contexts
- Update documentation when making changes

### **Testing Checklist**
- [ ] Browser favicon displays correctly
- [ ] PWA icons work on mobile devices
- [ ] Social media previews render properly
- [ ] Logo component renders in all sizes
- [ ] Error pages display logo correctly
- [ ] Loading screens show animated logo
- [ ] Documentation images load properly

### **Deployment Verification**
1. **Browser Tab**: Check favicon appears
2. **Mobile Home Screen**: Verify PWA icon
3. **Social Sharing**: Test Open Graph image
4. **Error Pages**: Confirm logo visibility
5. **Loading States**: Verify animation works

## 📞 Support and Questions

For logo-related questions or issues:
- **Developer**: John Cedrick de las Alas
- **Email**: jcedrick.delasalas@gmail.com
- **GitHub Issues**: Report logo display problems

---

**The FranchiseHub logo system is designed for consistency, performance, and accessibility across all platforms and use cases.**

# Branding Guide

**The Base Standard** - Visual Identity Guidelines

## Logo Usage

### Current Implementation

The logo is currently implemented as a gradient badge with "BR" initials in `src/app/page.tsx`:

```tsx
<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
  <span className="text-white font-black text-lg">BR</span>
</div>
```

### Recommended Logo Files

Place actual logo files in `/public/`:

1. **Primary Logo** (`logo.svg`)
   - Full "The Base Standard" wordmark
   - SVG format for scalability
   - Works on dark backgrounds

2. **Icon Logo** (`logo-icon.svg`)
   - Simplified icon/emblem
   - Square format (1:1 aspect ratio)
   - Used in favicons and small spaces

3. **Dark Mode Variants**
   - `logo-dark.svg` - For light backgrounds
   - `logo-light.svg` - For dark backgrounds

## Color Palette

### Primary Colors
- **Cyan**: `#06b6d4` (cyan-500)
- **Blue**: `#2563eb` (blue-600)
- **Gradient**: `from-cyan-500 to-blue-600`

### Background
- **Black**: `#000000` (primary background)
- **Zinc 900**: `#18181b` (card backgrounds)
- **Zinc 800**: `#27272a` (borders)

### Text
- **White**: `#ffffff` (primary text)
- **Zinc 400**: `#a1a1aa` (secondary text)
- **Zinc 500**: `#71717a` (muted text)

## Typography

### Font Stack
- Primary: System font stack (Inter, system-ui, sans-serif)
- Monospace: For addresses and code

### Font Weights
- **Black**: `900` - Headings, emphasis
- **Semibold**: `600` - Buttons, labels
- **Regular**: `400` - Body text

## Banner Specifications

### Hero Banner
- **Dimensions**: 1920x1080px (16:9)
- **Format**: JPG or WebP
- **File Size**: < 500KB
- **Content**: Should include "The Base Standard" branding

### Open Graph Image
- **Dimensions**: 1200x630px (1.91:1)
- **Format**: JPG or PNG
- **File Size**: < 300KB
- **Usage**: Social media previews (Twitter, Facebook, Discord)

### Twitter Card
- **Dimensions**: 1200x675px (16:9)
- **Format**: JPG
- **File Size**: < 300KB

## Tier Badge Design

Each tier should have a distinct visual identity:

### TOURIST (0-350)
- **Color**: Gray/Stone
- **Style**: Minimal, entry-level

### RESIDENT (351-650)
- **Color**: Bronze/Iron
- **Style**: Established presence

### BUILDER (651-850)
- **Color**: Silver/Steel
- **Style**: Active contributor

### BASED (851-950)
- **Color**: Blue/Iridescent (Base brand colors)
- **Style**: Elite, top 5%
- **Special**: Animated/glowing effects

### LEGEND (951-1000)
- **Color**: Gold/Animated
- **Style**: Top 1%, maximum prestige

## Implementation

### Update Logo in Header

Replace the current gradient badge in `src/app/page.tsx`:

```tsx
// Current
<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
  <span className="text-white font-black text-lg">BR</span>
</div>

// Recommended
<Image 
  src="/logo.svg" 
  alt="The Base Standard" 
  width={40} 
  height={40}
  className="h-10 w-auto"
/>
```

### Add OG Image

Ensure `/public/og-image.jpg` exists and is referenced in `src/app/layout.tsx` (already configured).

### Favicon Setup

Add favicon files to `/public/`:
- `favicon.ico`
- `favicon-16x16.png`
- `favicon-32x32.png`
- `apple-touch-icon.png`

Then reference in `src/app/layout.tsx`:

```tsx
export const metadata: Metadata = {
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};
```

## File Structure

```
public/
├── logo.svg
├── logo-icon.svg
├── logo-dark.svg
├── logo-light.svg
├── favicon.ico
├── favicon-16x16.png
├── favicon-32x32.png
├── apple-touch-icon.png
├── banner-hero.jpg
├── banner-hero.webp
├── og-image.jpg
├── og-image.png
├── twitter-card.jpg
├── tier-tourist.svg
├── tier-resident.svg
├── tier-builder.svg
├── tier-based.svg
└── tier-legend.svg
```

## Design Principles

1. **Consistency**: Use the same color palette and typography throughout
2. **Accessibility**: Ensure sufficient contrast (WCAG AA minimum)
3. **Performance**: Optimize all images (WebP, compression)
4. **Scalability**: Use SVG for logos and icons
5. **Brand Recognition**: Maintain consistent visual identity

## Resources

- Base Brand Colors: Cyan (#06b6d4) and Blue (#2563eb)
- Gradient: `bg-gradient-to-br from-cyan-500 to-blue-600`
- Dark Theme: Black background with zinc accents

---

**Note**: This guide documents the branding structure. Actual logo and banner files should be provided by the design team and placed in the `/public/` directory.

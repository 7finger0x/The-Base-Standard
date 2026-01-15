# Branding Assets Guide

**The Base Standard** - Logo and Banner Assets

## 📁 Asset Locations

All branding assets should be placed in the `/public/` directory.

## 🎨 Required Logo Files

### Primary Logos
- **`logo.svg`** - Main logo (SVG, scalable)
  - Full "The Base Standard" wordmark
  - Recommended: 200x60px viewBox
  - Works on dark backgrounds

- **`logo-icon.svg`** - Icon only (SVG)
  - Square format (1:1 aspect ratio)
  - Recommended: 100x100px viewBox
  - Used in favicons and small spaces

### Variants
- **`logo-dark.svg`** - For light backgrounds
- **`logo-light.svg`** - For dark backgrounds

### Favicons
- **`favicon.ico`** - Browser favicon (16x16, 32x32, 48x48)
- **`favicon-16x16.png`** - 16x16 PNG
- **`favicon-32x32.png`** - 32x32 PNG
- **`apple-touch-icon.png`** - Apple touch icon (180x180)

## 🖼️ Required Banner Files

### Hero Banner
- **`banner-hero.jpg`** - Main hero banner
  - Dimensions: 1920x1080px (16:9)
  - Format: JPG or WebP
  - File Size: < 500KB
  - Content: Should include "The Base Standard" branding

- **`banner-hero.webp`** - WebP version (better performance)

### Social Media
- **`og-image.jpg`** - Open Graph image
  - Dimensions: 1200x630px (1.91:1)
  - Format: JPG or PNG
  - File Size: < 300KB
  - Used for: Facebook, LinkedIn, Discord previews

- **`twitter-card.jpg`** - Twitter card
  - Dimensions: 1200x675px (16:9)
  - Format: JPG
  - File Size: < 300KB

## 🏆 Tier Badge Assets

Each tier should have a distinct badge:

- **`tier-tourist.svg`** - TOURIST tier (0-350)
- **`tier-resident.svg`** - RESIDENT tier (351-650)
- **`tier-builder.svg`** - BUILDER tier (651-850)
- **`tier-based.svg`** - BASED tier (851-950) - **Elite**
- **`tier-legend.svg`** - LEGEND tier (951-1000) - **Top 1%**

## 🎨 Color Palette

### Primary Colors
- **Cyan**: `#06b6d4` (cyan-500)
- **Blue**: `#2563eb` (blue-600)
- **Gradient**: `from-cyan-500 to-blue-600`

### Background
- **Black**: `#000000` (primary)
- **Zinc 900**: `#18181b` (cards)
- **Zinc 800**: `#27272a` (borders)

## 📝 Current Implementation

### Logo Component
A reusable `Logo` component is available at `src/components/Logo.tsx`:

```tsx
import { Logo } from '@/components/Logo';

// Icon only
<Logo variant="icon" size="md" />

// Full logo with text
<Logo variant="full" size="lg" showText />

// Text only
<Logo variant="text" size="md" />
```

### Current Header
The header in `src/app/page.tsx` currently uses a gradient badge with "BR" initials. When logo files are added, the `Logo` component will automatically use them.

## ✅ Implementation Checklist

- [ ] Create logo SVG files (full, icon, variants)
- [ ] Create favicon files (ICO, PNGs, Apple touch icon)
- [ ] Create hero banner (1920x1080)
- [ ] Create OG image (1200x630)
- [ ] Create Twitter card (1200x675)
- [ ] Create tier badge SVGs (5 tiers)
- [ ] Optimize all images (compress, WebP)
- [ ] Place files in `/public/` directory
- [ ] Update `Logo` component to use actual files
- [ ] Test on all devices and browsers

## 📚 Documentation

- **Branding Guide**: `docs/BRANDING_GUIDE.md`
- **Public Assets**: `public/README.md`
- **Logo Component**: `src/components/Logo.tsx`

## 🚀 Quick Start

1. **Add logo files** to `/public/`
2. **Uncomment Image component** in `src/components/Logo.tsx`
3. **Test** the logo displays correctly
4. **Update** header in `src/app/page.tsx` to use `<Logo />` component

## 📐 Design Specifications

### Logo
- **Format**: SVG (preferred) or PNG
- **Background**: Transparent
- **Colors**: Cyan (#06b6d4) and Blue (#2563eb)
- **Style**: Modern, tech-forward, Base ecosystem aligned

### Banners
- **Aspect Ratio**: 16:9 (hero), 1.91:1 (OG)
- **Format**: JPG or WebP
- **Compression**: Optimize for web (< 500KB)
- **Content**: Include "The Base Standard" branding

### Tier Badges
- **Format**: SVG (scalable)
- **Size**: Square (1:1)
- **Style**: Distinct visual identity per tier
- **Colors**: Match tier descriptions in branding guide

---

**Note**: This document outlines the required branding assets. Actual logo and banner files should be provided by the design team and placed in the `/public/` directory.

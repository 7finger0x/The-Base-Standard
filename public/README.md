# Public Assets Directory

This directory contains static assets served by Next.js.

## Branding Assets

### Logo Files
Place logo files here:
- `logo.svg` - Main logo (SVG format, scalable)
- `logo.png` - Main logo (PNG format, fallback)
- `logo-dark.svg` - Dark mode variant
- `logo-light.svg` - Light mode variant
- `favicon.ico` - Browser favicon
- `favicon-16x16.png` - 16x16 favicon
- `favicon-32x32.png` - 32x32 favicon
- `apple-touch-icon.png` - Apple touch icon (180x180)

### Banner Files
Place banner/hero images here:
- `banner-hero.jpg` - Main hero banner (1920x1080 recommended)
- `banner-hero.webp` - WebP version for better performance
- `og-image.jpg` - Open Graph image for social sharing (1200x630)
- `og-image.png` - PNG version of OG image
- `twitter-card.jpg` - Twitter card image (1200x675)

### Tier Badges
Place tier badge images here:
- `tier-tourist.svg` - TOURIST tier badge
- `tier-resident.svg` - RESIDENT tier badge
- `tier-builder.svg` - BUILDER tier badge
- `tier-based.svg` - BASED tier badge
- `tier-legend.svg` - LEGEND tier badge

## Usage in Code

### Logo
```tsx
import Image from 'next/image';

<Image 
  src="/logo.svg" 
  alt="The Base Standard" 
  width={40} 
  height={40}
/>
```

### OG Image
Already configured in `src/app/layout.tsx`:
```tsx
openGraph: {
  images: ['/og-image.jpg'],
}
```

## File Naming Convention

- Use kebab-case for all filenames
- Include dimensions in filename if multiple sizes exist
- Use appropriate format: `.svg` for vectors, `.webp` for optimized images, `.png` for transparency

## Optimization

- Use Next.js Image component for all images
- Provide WebP versions when possible
- Compress images before adding to repository
- Keep file sizes reasonable (< 500KB for banners, < 50KB for logos)

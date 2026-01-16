# Logo Assets

This directory contains logo variations for The Base Standard.

## 🎨 Your Beautiful Logos

You provided stunning logo variations! Please save them here:

### Logo Files:

1. **`logo-hex.png`** - Hexagonal BS logo (main logo)
   - Features: BS letters in hexagon with arrows, blue/purple gradient
   - Size: Square aspect ratio
   - Perfect for: Favicon, app icon, social media

2. **`logo-circle.png`** - Circular/round version
   - Features: BS logo in circular format with circuit board
   - Size: 1:1 aspect ratio
   - Perfect for: Profile pictures, avatars, badges

3. **`logo-hex-closeup.png`** - Close-up hexagonal logo
   - Features: Detailed view of BS logo
   - Perfect for: High-res displays, print materials

### How to Add:

```bash
cd /home/user/The-Base-Standard/public/images/logos/

# Save your logo files here:
# - logo-hex.png (main hexagonal logo)
# - logo-circle.png (circular version)
# - logo-hex-closeup.png (close-up version)
```

## Usage in Components

### Navigation/Header Logo:

```tsx
<Image
  src="/images/logos/logo-hex.png"
  alt="The Base Standard"
  width={48}
  height={48}
  className="w-12 h-12"
/>
```

### Favicon Configuration:

Update `/src/app/favicon.ico` or add to `/src/app/layout.tsx`:

```tsx
export const metadata = {
  icons: {
    icon: '/images/logos/logo-hex.png',
    apple: '/images/logos/logo-circle.png',
  },
}
```

### Social Media Meta Tags:

```tsx
<meta property="og:image" content="/images/logos/logo-hex.png" />
<meta name="twitter:image" content="/images/logos/logo-hex.png" />
```

## Logo Specifications

✅ **Format**: PNG with transparency
✅ **Colors**: Blue-to-purple gradient (#00D4FF → #8B5CF6)
✅ **Design Elements**:
  - BS lettermark
  - Hexagonal frame
  - Upward arrows (growth symbol)
  - Circuit board patterns
  - Lightning effects

## Logo Variations Summary

| File | Shape | Use Case |
|------|-------|----------|
| `logo-hex.png` | Hexagon | Primary brand identity |
| `logo-circle.png` | Circle | Social media, avatars |
| `logo-hex-closeup.png` | Hexagon | High-res, print |

Your logos are professional and ready for production! 🎨

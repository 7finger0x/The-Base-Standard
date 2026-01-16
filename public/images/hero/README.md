# Hero Banner Images

This directory contains hero banner and marketing images for The Base Standard.

## 🎨 Your Beautiful Hero Images

You provided amazing hero banners! Please save them here with these filenames:

### Hero Banners:

1. **`hero-main.png`** - Main hero banner with BS logo
   - Features: Hexagonal BS logo, circuit board pattern, blue/purple gradient
   - Text: "The Base Standard"
   - Perfect for: Homepage hero section

2. **`hero-with-tagline.png`** - Hero with tagline
   - Features: BS logo + "Connect Wallets. Check Your On-Chain Reputation."
   - Perfect for: Landing page, about page

3. **`hero-laptop.png`** - Laptop mockup version
   - Features: BS logo in laptop frame with purple border
   - Perfect for: Marketing materials, presentations

### How to Add:

```bash
cd /home/user/The-Base-Standard/public/images/hero/

# Save your hero images here:
# - hero-main.png (full width banner)
# - hero-with-tagline.png (with text)
# - hero-laptop.png (laptop mockup)
```

## Usage Examples

### Homepage Hero:

```tsx
<div className="relative h-screen">
  <Image
    src="/images/hero/hero-main.png"
    alt="The Base Standard"
    fill
    className="object-cover"
    priority
  />
</div>
```

### Landing Page:

```tsx
<Image
  src="/images/hero/hero-with-tagline.png"
  alt="Connect Wallets. Check Your On-Chain Reputation."
  width={1920}
  height={1080}
  className="w-full"
/>
```

## Specifications

✅ **Format**: PNG with high quality
✅ **Design Features**:
  - BS hexagonal logo
  - Circuit board pattern background
  - Blue/purple gradient theme
  - Lightning effects
  - Professional typography

Your hero images are production-ready! 🚀

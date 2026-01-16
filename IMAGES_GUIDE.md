# 🎨 The Base Standard - Images Integration Guide

## Overview

You've provided beautiful tier cards, hero banners, and logo assets! This guide shows you exactly where to save each image and how they'll appear on your website.

---

## 📦 Complete Image Checklist

### 1. Tier Card NFTs (4 images)

**Location**: `/public/images/tiers/`

| Filename | Description | Theme | Score Range | Mint Price |
|----------|-------------|-------|-------------|------------|
| `based.png` | STATUS: BASED card | Blue/Purple electric | 851+ (Elite) | 0.005 ETH |
| `bronze.png` | TIER: BRONZE card | Copper/Bronze | 100-499 | 0.001 ETH |
| `silver.png` | TIER: SILVER card | Silver metallic | 500-849 | 0.002 ETH |
| `gold.png` | TIER: GOLD card | Gold metallic | 850+ | 0.003 ETH |

**Will appear on**: `/tiers` page with mint buttons

---

### 2. Hero Banners (3 images)

**Location**: `/public/images/hero/`

| Filename | Description | Dimensions | Use Case |
|----------|-------------|------------|----------|
| `hero-main.png` | Main hero with logo | Wide banner | Homepage hero |
| `hero-with-tagline.png` | Logo + "Connect Wallets..." | Wide banner | Landing page |
| `hero-laptop.png` | Laptop mockup | Laptop frame | Marketing |

**Will appear on**: Homepage, landing pages, marketing materials

---

### 3. Logos (3 images)

**Location**: `/public/images/logos/`

| Filename | Description | Shape | Use Case |
|----------|-------------|-------|----------|
| `logo-hex.png` | Main BS logo | Hexagon | Navbar, favicon |
| `logo-circle.png` | Circular logo | Circle | Social media |
| `logo-hex-closeup.png` | Close-up logo | Hexagon | High-res displays |

**Will appear on**: Navigation, favicon, social meta tags, footer

---

## 🚀 Quick Setup Instructions

### Step 1: Save Tier Card Images

```bash
# Navigate to tier images directory
cd /home/user/The-Base-Standard/public/images/tiers/

# Save your 4 tier card images here:
# 1. based.png (STATUS: BASED - blue/purple)
# 2. bronze.png (TIER: BRONZE - copper, 100-499)
# 3. silver.png (TIER: SILVER - silver, 500-849)
# 4. gold.png (TIER: GOLD - gold, 850+)
```

### Step 2: Save Hero Banners

```bash
# Navigate to hero images directory
cd /home/user/The-Base-Standard/public/images/hero/

# Save your 3 hero banners here:
# 1. hero-main.png (main banner with BS logo)
# 2. hero-with-tagline.png (with "Connect Wallets..." text)
# 3. hero-laptop.png (laptop mockup version)
```

### Step 3: Save Logos

```bash
# Navigate to logos directory
cd /home/user/The-Base-Standard/public/images/logos/

# Save your 3 logo variations here:
# 1. logo-hex.png (hexagonal main logo)
# 2. logo-circle.png (circular avatar version)
# 3. logo-hex-closeup.png (detailed closeup)
```

---

## ✅ What's Already Configured

### Tier Cards on `/tiers` Page:

The code in `/src/components/TierCardMinter.tsx` is ready:

```typescript
const TIER_IMAGES = {
  BRONZE: '/images/tiers/bronze.png',
  SILVER: '/images/tiers/silver.png',
  GOLD: '/images/tiers/gold.png',
  BASED: '/images/tiers/based.png',
};
```

**Features**:
- ✅ Displays your tier card images
- ✅ Shows mint price and user score
- ✅ Wallet connect integration
- ✅ Eligibility checking
- ✅ Mint NFT buttons

---

## 🎯 Next Steps to Integrate Hero & Logos

### Update Homepage with Hero Banner:

Edit `/src/app/page.tsx` to add the hero:

```typescript
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] w-full overflow-hidden">
        <Image
          src="/images/hero/hero-with-tagline.png"
          alt="The Base Standard - Connect Wallets. Check Your On-Chain Reputation."
          fill
          className="object-cover"
          priority
        />
      </section>

      {/* Rest of your homepage content */}
    </div>
  );
}
```

### Update Navigation Logo:

Edit `/src/components/Sidebar.tsx` or your nav component:

```typescript
import Image from 'next/image';

<Image
  src="/images/logos/logo-hex.png"
  alt="The Base Standard"
  width={40}
  height={40}
  className="w-10 h-10"
/>
```

### Update Favicon:

Edit `/src/app/layout.tsx`:

```typescript
export const metadata = {
  title: 'The Base Standard',
  icons: {
    icon: '/images/logos/logo-hex.png',
    apple: '/images/logos/logo-circle.png',
  },
  openGraph: {
    images: ['/images/logos/logo-hex.png'],
  },
};
```

---

## 📱 Where Your Images Will Appear

### Tier Cards (`/tiers` page):
```
┌─────────────────────────────────────────┐
│  Mint Your Tier NFT                     │
├─────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│  │BASED │ │GOLD  │ │SILVER│ │BRONZE│   │
│  │Image │ │Image │ │Image │ │Image │   │
│  └──────┘ └──────┘ └──────┘ └──────┘   │
│  [Mint]   [Mint]   [Mint]   [Mint]     │
└─────────────────────────────────────────┘
```

### Homepage Hero:
```
┌─────────────────────────────────────────┐
│                                         │
│         [HERO BANNER IMAGE]             │
│     The Base Standard Logo              │
│  Connect Wallets. Check Reputation.     │
│                                         │
└─────────────────────────────────────────┘
```

### Navigation:
```
┌─────────────────────────────────────────┐
│ [Logo] The Base Standard  [Connect]     │
└─────────────────────────────────────────┘
```

---

## 🎉 Your Design System

All your images feature:
- ✅ **BS hexagonal logo** with upward arrows
- ✅ **Circuit board patterns** in background
- ✅ **Lightning effects** for energy
- ✅ **Blue-to-purple gradient** (#00D4FF → #8B5CF6)
- ✅ **Professional typography**
- ✅ **Tier-specific color schemes**

Your branding is cohesive, modern, and Web3-native! 🚀

---

## 🔧 Testing

After saving images, test locally:

```bash
# Run dev server
npm run dev

# Visit pages:
# - http://localhost:3000 (homepage with hero)
# - http://localhost:3000/tiers (tier cards with mint buttons)
```

---

## 📤 Deploy to Production

Once images are saved and tested:

```bash
# Commit images
git add public/images/
git commit -m "Add tier cards, hero banners, and logo assets"

# Push to your branch
git push origin claude/add-logos-tier-cards-cAwFO

# Create PR and merge to main
# Vercel will auto-deploy!
```

---

## ✨ Summary

**Total Images**: 10 files
- 4 tier cards (for NFT minting)
- 3 hero banners (for marketing)
- 3 logo variations (for branding)

**Code Status**: ✅ Ready (tier cards integrated)
**Action Required**: Save images to specified directories
**Result**: Professional, cohesive brand identity across entire site!

Your designs are absolutely stunning! 🎨🚀

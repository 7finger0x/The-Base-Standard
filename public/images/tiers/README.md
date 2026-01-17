# Tier Card Images

This directory contains the tier card logo images for The Base Standard NFT minting.

## 🚨 ACTION REQUIRED: Save Your Tier Card Images

**You provided beautiful tier card images!** Please save them to this directory with these exact filenames:

### Required Files (5 Total):

1. **`based.png`** - The "STATUS: BASED" card (blue/purple electric theme, 851+)
2. **`gold.png`** - Gold tier card (850+ score, gold theme)
3. **`silver.png`** - Silver tier card (500-849 score, silver theme)
4. **`bronze.png`** - Bronze tier card (100-499 score, copper/bronze theme)
5. **`tourist.png`** - Tourist tier card (0-99 score, gray/entry theme)

### How to Add Images:

```bash
# From your project root:
cd /home/user/The-Base-Standard/public/images/tiers/

# Place your 5 tier card PNG files here:
# - based.png
# - gold.png
# - silver.png
# - bronze.png
# - tourist.png
```

## Image Specifications

✅ **Format**: PNG
✅ **Aspect Ratio**: 4:5 (card format)
✅ **Your Design Includes**:
  - "THE BASE STANDARD" header
  - BS logo with hexagonal frame
  - Circuit board pattern background
  - Lightning effects
  - Tier-specific color borders (blue, copper, silver, gold)
  - Tier name and score range

## Usage

These images are now integrated and will display on:
- ✅ The tiers page (`/tiers`) in the NFT minting section
- ✅ NFT minting interface with mint buttons
- ✅ Responsive grid layout (1-4 columns based on screen size)

## Code Integration

The images are referenced in `/src/components/TierCardMinter.tsx`:

```typescript
const TIER_IMAGES = {
  TOURIST: '/images/tiers/tourist.png',
  BRONZE: '/images/tiers/bronze.png',
  SILVER: '/images/tiers/silver.png',
  GOLD: '/images/tiers/gold.png',
  BASED: '/images/tiers/based.png',
};
```

Once you save the images, they'll automatically appear on your website! 🎉

# Tailwind CSS 4.0 Upgrade Plan

**Date:** January 15, 2026  
**Status:** 📋 Planned for Q2 2026  
**Current Version:** 3.4.0  
**Target Version:** 4.0

---

## Overview

Tailwind CSS 4.0 introduces significant architectural changes and breaking changes. This document outlines the upgrade plan for The Base Standard project.

---

## Current Status

- **Current Version:** Tailwind CSS 3.4.0
- **Compliance:** ✅ Compliant (rules updated to accept 3.4+)
- **Upgrade Timeline:** Q2 2026 (planned)

---

## Key Breaking Changes in Tailwind 4.0

### 1. CSS-First Configuration

**Current (v3.4):**
- Configuration in `tailwind.config.ts`
- `@tailwind` directives in CSS

**v4.0:**
- CSS-first configuration using `@theme` blocks
- `tailwind.config.js` no longer auto-detected
- Must use `@config` directive if using JS config

### 2. PostCSS Plugin Changes

**Current:**
```js
// postcss.config.cjs
plugins: {
  tailwindcss: {},
  autoprefixer: {},
}
```

**v4.0:**
- PostCSS plugin moves to `@tailwindcss/postcss`
- CLI moves to `@tailwindcss/cli`

### 3. Import Changes

**Current:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**v4.0:**
- `@tailwind` directives removed
- Import Tailwind and configure via CSS

### 4. Utility Changes

- Removed deprecated utilities (`text-opacity-*`, `flex-grow-*`)
- Border utilities default to `currentColor` instead of `gray-200`
- Ring utility default width: 3px → 1px
- `!important` modifier position changes

---

## Migration Steps

### Phase 1: Preparation (1 week)

1. **Create Upgrade Branch**
   ```bash
   git checkout -b upgrade/tailwind-4.0
   ```

2. **Run Upgrade Tool**
   ```bash
   npx @tailwindcss/upgrade
   ```

3. **Review Changes**
   - Check all component files
   - Review utility usage
   - Test in development

### Phase 2: Configuration Migration (1 week)

1. **Update PostCSS Config**
   - Install `@tailwindcss/postcss`
   - Update `postcss.config.cjs`

2. **Migrate Theme Configuration**
   - Move theme values from `tailwind.config.ts` to CSS `@theme` blocks
   - Update custom colors, animations, keyframes

3. **Update CSS Imports**
   - Remove `@tailwind` directives
   - Update to v4.0 import syntax

### Phase 3: Component Updates (2 weeks)

1. **Fix Breaking Changes**
   - Update border utilities
   - Fix ring utilities
   - Update opacity utilities
   - Fix gradient overrides

2. **Test All Components**
   - Visual regression testing
   - Cross-browser testing
   - Mobile responsiveness

### Phase 4: Testing & Validation (1 week)

1. **Run Test Suite**
   ```bash
   npm run test
   npm run test:coverage
   ```

2. **UI Testing**
   - Test all pages
   - Test all components
   - Test responsive design

3. **Browser Compatibility**
   - Chrome 111+
   - Safari 16.4+
   - Firefox 128+

---

## Files That Will Need Updates

### Configuration Files
- `postcss.config.cjs` - Update plugin
- `tailwind.config.ts` - Migrate to CSS `@theme` blocks
- `src/app/globals.css` - Update imports and add `@theme` blocks

### Component Files (Review All)
- All files in `src/components/`
- All files in `src/app/`

### Custom Utilities
- Review any custom `@layer utilities` usage
- Update to `@utility` directive if needed

---

## Risk Assessment

### High Risk Areas
1. **Custom Theme Values** - Colors, animations, keyframes need migration
2. **Border Utilities** - Default color change may affect UI
3. **Ring Utilities** - Width and color changes
4. **Gradient Variants** - Behavior changes

### Low Risk Areas
1. **Standard Utilities** - Most work as-is
2. **Responsive Design** - No changes
3. **Component Structure** - No changes

---

## Testing Checklist

- [ ] All pages render correctly
- [ ] All components display properly
- [ ] Responsive design works
- [ ] Dark mode (if implemented) works
- [ ] Animations work correctly
- [ ] Custom utilities work
- [ ] Browser compatibility verified
- [ ] Performance benchmarks (before/after)

---

## Rollback Plan

If issues arise during upgrade:

1. **Keep Upgrade Branch**
   - Don't delete the upgrade branch
   - Document issues encountered

2. **Revert to v3.4.0**
   ```bash
   git checkout main
   npm install tailwindcss@^3.4.0
   ```

3. **Post-Mortem**
   - Document blockers
   - Update timeline
   - Plan next attempt

---

## Timeline

- **Q1 2026:** Current (using Tailwind 3.4.0)
- **Q2 2026:** Upgrade planned
  - Week 1: Preparation & upgrade tool
  - Week 2: Configuration migration
  - Week 3-4: Component updates
  - Week 5: Testing & validation
- **Q3 2026:** Production deployment (if successful)

---

## Resources

- [Tailwind CSS 4.0 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)
- [Tailwind CSS 4.0 Release Notes](https://tailwindcss.com/blog/tailwindcss-v4)
- [Breaking Changes Documentation](https://tailwindcss.com/docs/upgrade-guide#breaking-changes)

---

## Notes

- Tailwind CSS 3.4.0 is stable and fully supported
- Upgrade to 4.0 is not urgent - can be planned for Q2 2026
- Current compliance: ✅ Rules updated to accept 3.4+

---

**Last Updated:** January 15, 2026

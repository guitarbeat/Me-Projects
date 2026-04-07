

# Mobile-Friendly Enhancement Plan

## Overview

Transform the dashboard into a truly mobile-first experience with optimized touch interactions, improved layouts, better thumb-reachable controls, and enhanced visual feedback for small screens.

## Current Issues Identified

1. **Charts**: Too small on mobile, text illegible, no horizontal scroll for detailed data
2. **Floating Control Bar**: Expanded state buttons are cramped on narrow screens
3. **Stats Cards**: Icons and sparklines compete for space on small screens
4. **Collapsible Sections**: Header tap targets could be larger
5. **Transaction Cards**: Good but could use swipe gestures for quick actions
6. **Form Inputs**: Need larger touch targets and better spacing
7. **Navigation**: Bottom bar is good but needs safe area insets for notched phones

## Proposed Enhancements

### 1. Safe Area Insets

Add proper safe area handling for modern phones with notches/home indicators:

- Apply `pb-safe` (safe-area-inset-bottom) to the floating control bar
- Add CSS env() variables for safe areas
- Ensure content doesn't hide behind notches or home bars

### 2. Enhanced Floating Control Bar (Mobile)

Current: All controls crammed in one row when expanded

Proposed mobile layout:

```text
┌─────────────────────────────────────┐
│        [Chart Selector ▼]           │  <- Top row: chart
├─────────────────────────────────────┤
│  [👤]   [↑]   [═══]   [↓]   [🌙]   │  <- Bottom row: actions
└─────────────────────────────────────┘
```

- Two-row layout on mobile when expanded
- Larger touch targets (min 48x48px)
- Better visual grouping of related actions
- Safe area bottom padding

### 3. Stats Cards Mobile Layout

Optimize for vertical stacking with inline trends:

```text
┌────────────────────────────────┐
│  📈 Income          ▁▂▃▅▆▇█   │
│  $12,450.00         +12%      │
├────────────────────────────────┤
│  📉 Expenses        ▇▅▃▂▁     │
│  $8,200.00          -5%       │
├────────────────────────────────┤
│  💰 Net Balance               │
│  $4,250.00          ✓ Ahead   │
└────────────────────────────────┘
```

- Full-width cards on mobile (remove grid on xs screens)
- Move sparkline to header row to save vertical space
- Add percentage change indicators

### 4. Improved Chart Mobile Experience

**Sankey Chart:**
- Horizontal scroll wrapper with scroll indicators
- Larger touch targets on nodes (48px minimum)
- Full-width mode toggle button
- Pinch-to-zoom support

**Waterfall Chart:**
- Horizontal scroll for many bars
- Larger bar widths on mobile
- Tap to expand individual bar details
- Simplified axis labels

### 5. Collapsible Section Touch Improvements

- Increase header height to 56px on mobile for easier tapping
- Add active state feedback (slight scale on press)
- Larger chevron icon (20px instead of 16px)
- Add subtle haptic feedback on toggle

### 6. Transaction Cards Gestures

Add swipe gestures for common actions:

```text
← Swipe Left: Delete (red background reveals)
→ Swipe Right: Toggle enable/disable (green/gray)
```

- Use framer-motion for smooth gesture handling
- Haptic feedback on threshold reach
- Visual undo option after delete

### 7. Search & Sort Mobile Optimization

- Full-width search on mobile
- Sort controls in a bottom sheet instead of inline
- Sticky search bar when scrolling transactions
- Larger tap targets (48px height minimum)

### 8. Form Sheet Improvements

- Full-height drawer on mobile (not partial)
- Larger input fields (48px height)
- Better keyboard handling (viewport meta)
- Submit button stuck to bottom with safe area

### 9. Pull-to-Refresh Enhancement

- Add coin flip/rotate animation during refresh
- More responsive pull feedback curve
- Better visual progress indication

## Technical Implementation

### File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/index.css` | Modify | Add safe area utilities and mobile-specific styles |
| `src/components/dashboard/FloatingControlBar.tsx` | Modify | Two-row mobile layout, larger touch targets, safe areas |
| `src/components/dashboard/StatsCards.tsx` | Modify | Single column on xs, inline sparklines |
| `src/components/ui/collapsible-section.tsx` | Modify | Larger mobile headers, active feedback |
| `src/features/transactions/components/MobileTransactionItem.tsx` | Modify | Add swipe gesture support |
| `src/features/transactions/components/MobileTransactionList.tsx` | Modify | Support swipe actions |
| `src/components/dashboard/SearchAndSort.tsx` | Modify | Full-width mobile layout, larger targets |
| `src/features/charts/components/SankeyChart.tsx` | Modify | Mobile scroll wrapper, touch targets |
| `src/features/charts/components/WaterfallChart.tsx` | Modify | Mobile optimizations |
| `src/components/ui/drawer.tsx` | Modify | Full-height mobile option |
| `tailwind.config.ts` | Modify | Add safe area plugin utilities |
| `index.html` | Modify | Add viewport-fit=cover meta tag |

### CSS Safe Area Additions

```css
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.pt-safe {
  padding-top: env(safe-area-inset-top, 0);
}

/* Mobile-specific utilities */
@media (max-width: 640px) {
  .touch-target {
    min-height: 48px;
    min-width: 48px;
  }
}
```

### Gesture Implementation

Using framer-motion for swipe gestures:

```typescript
const handleDragEnd = (event, info) => {
  if (info.offset.x < -100) {
    // Delete action
    onDelete(id);
  } else if (info.offset.x > 100) {
    // Toggle action
    onToggle(id);
  }
};
```

## Performance Considerations

- Use CSS transforms for all animations (GPU accelerated)
- Debounce scroll handlers
- Lazy load charts when scrolled into view
- Keep gesture calculations simple to maintain 60fps

## Accessibility

- All touch targets meet WCAG 2.5.5 (44x44 CSS pixels minimum)
- Swipe gestures have button alternatives
- Screen reader announcements for gesture actions
- Respect prefers-reduced-motion for all animations

## Priority Order

1. **Critical (Day 1):**
   - Safe area insets for notched phones
   - Larger touch targets on control bar
   - Full-width stats cards on mobile

2. **High (Day 2):**
   - Two-row control bar layout
   - Collapsible section touch improvements
   - Search bar mobile optimization

3. **Medium (Day 3):**
   - Swipe gestures on transactions
   - Chart mobile scroll wrappers
   - Form drawer improvements


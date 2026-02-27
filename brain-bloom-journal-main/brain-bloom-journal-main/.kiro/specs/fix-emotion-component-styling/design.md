# Fix Emotion Component Styling - Design

## Design Overview
Replace styled-components that extend wrapper components with proper implementations that work with the current component architecture.

## Component Changes

### 1. EmotionTracker.tsx

**Current Issue:**
```typescript
const StatCard = styled(Card)`
  text-align: center;
  padding: 16px;
`;
```

**Solution:**
Replace with styled div that has card styling:
```typescript
const StatCard = styled.div`
  text-align: center;
  padding: 16px;
  background: #2a2a2a;
  border-radius: 12px;
  border: 1px solid #444;
`;
```

### 2. EmotionAnalytics.tsx

**Current Issues:**
- Uses `<Card>` directly without CardContent
- Uses `styled(Card)` for custom cards
- Button usage needs variant mapping

**Solutions:**

A. Replace direct Card usage:
```typescript
// Before
<Card>
  <InsightTitle>📊 Total Events</InsightTitle>
  <StatValue>{filteredEvents.length}</StatValue>
</Card>

// After
<Card>
  <CardContent className="pt-6">
    <InsightTitle>📊 Total Events</InsightTitle>
    <StatValue>{filteredEvents.length}</StatValue>
  </CardContent>
</Card>
```

B. Replace styled Card extensions with styled divs:
```typescript
// Before
const InsightCard = styled.div<{ priority: string }>`...`

// Keep as is - this is already a styled div
```

C. Fix Button usage:
```typescript
// Before
<Button variant="secondary" fullWidth style={{ marginTop: '16px' }}>

// After  
<Button variant="secondary" className="w-full mt-4">
```

### 3. EmotionTrackingDashboard.tsx

**Current Issues:**
- `styled(Card)` for StatCard and FeatureCard
- Button usage in FeatureCard

**Solutions:**

A. Replace StatCard:
```typescript
const StatCard = styled.div`
  text-align: center;
  background: linear-gradient(135deg, #2a2a2a 0%, #333 100%);
  border: 1px solid #555;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
  }
`;
```

B. Replace FeatureCard:
```typescript
const FeatureCard = styled.div`
  background: linear-gradient(135deg, #2a2a2a 0%, #333 100%);
  border: 1px solid #555;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
    border-color: #4ECDC4;
  }
`;
```

C. Remove FeatureButton styled component, use Button directly:
```typescript
<Button variant="secondary" className="w-full">
  Explore Feature
</Button>
```

## Import Changes

### EmotionAnalytics.tsx
Add CardContent import:
```typescript
import { Card } from '../common';
// Change to:
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
```

### EmotionTracker.tsx
Keep existing imports, just change styled usage:
```typescript
import { Button, Card } from '../common';
// Keep as is for Button, remove Card from styled usage
```

### EmotionTrackingDashboard.tsx
Update imports:
```typescript
import { Card, Button, ResponsiveContainer } from '../common';
// Change to:
import { Button } from '@/components/ui/button';
import { ResponsiveContainer } from '../common';
```

## Styling Preservation

All existing styles must be preserved:
- Colors (#2a2a2a, #4ECDC4, etc.)
- Gradients
- Hover effects
- Transitions
- Border radius
- Padding/margins
- Typography

## Testing Strategy

1. Visual inspection of each component
2. Verify hover states work
3. Verify click handlers work
4. Check responsive behavior
5. Verify no console errors
6. Build and typecheck pass

## Rollback Plan

If issues arise:
1. Revert to using legacy Button.legacy.tsx and Card.legacy.tsx
2. Update imports to use .legacy versions
3. Document why modern components don't work

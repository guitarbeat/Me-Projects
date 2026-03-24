# Fix Emotion Component Styling - Tasks

## Task List

- [x] 1. Fix EmotionTracker.tsx styling
  - [x] 1.1 Replace `styled(Card)` with `styled.div` for StatCard
  - [x] 1.2 Add card styling (background, border, border-radius, padding)
  - [x] 1.3 Verify Button usage is correct
  - [x] 1.4 Test component renders correctly

- [x] 2. Fix EmotionAnalytics.tsx styling
  - [x] 2.1 Update imports to use shadcn/ui Card and CardContent directly
  - [x] 2.2 Wrap Card children with CardContent
  - [x] 2.3 Update Button usage to use className instead of style prop
  - [x] 2.4 Verify all styled components work correctly
  - [x] 2.5 Test component renders correctly

- [x] 3. Fix EmotionTrackingDashboard.tsx styling
  - [x] 3.1 Replace `styled(Card)` with `styled.div` for StatCard
  - [x] 3.2 Replace `styled(Card)` with `styled.div` for FeatureCard
  - [x] 3.3 Remove FeatureButton styled component
  - [x] 3.4 Update Button usage to use className
  - [x] 3.5 Update imports to remove Card
  - [x] 3.6 Test component renders correctly

- [x] 4. Verify and test
  - [x] 4.1 Run TypeScript compiler
  - [x] 4.2 Run build
  - [x] 4.3 Start dev server and visually inspect all components
  - [x] 4.4 Verify no console errors
  - [x] 4.5 Test all interactive elements (buttons, hover states)

## Task Details

### 1.1 Replace styled(Card) in EmotionTracker.tsx
Replace the StatCard styled component that extends Card with a styled.div that has card styling.

**File:** `src/components/emotion/EmotionTracker.tsx`

**Change:**
```typescript
// Find
const StatCard = styled(Card)`
  text-align: center;
  padding: 16px;
`;

// Replace with
const StatCard = styled.div`
  text-align: center;
  padding: 16px;
  background: #2a2a2a;
  border-radius: 12px;
  border: 1px solid #444;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`;
```

### 2.1-2.2 Fix Card usage in EmotionAnalytics.tsx
Update imports and wrap Card children with CardContent.

**File:** `src/components/emotion/EmotionAnalytics.tsx`

**Import changes:**
```typescript
// Find
import { Card, Button, Grid } from '../common';

// Replace with
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Grid } from '../common';
```

**Usage changes:**
Find all instances of:
```typescript
<Card>
  {children}
</Card>
```

Replace with:
```typescript
<Card>
  <CardContent className="pt-6">
    {children}
  </CardContent>
</Card>
```

### 2.3 Fix Button usage in EmotionAnalytics.tsx
Replace style prop with className.

**File:** `src/components/emotion/EmotionAnalytics.tsx`

**Change:**
```typescript
// Find
<Button variant="secondary" fullWidth style={{ marginTop: '16px' }}>

// Replace with
<Button variant="secondary" className="w-full mt-4">
```

### 3.1-3.2 Replace styled(Card) in EmotionTrackingDashboard.tsx
Replace StatCard and FeatureCard styled components.

**File:** `src/components/emotion/EmotionTrackingDashboard.tsx`

**StatCard change:**
```typescript
// Find
const StatCard = styled(Card)`
  text-align: center;
  background: linear-gradient(135deg, #2a2a2a 0%, #333 100%);
  border: 1px solid #555;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
  }
`;

// Replace with
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

**FeatureCard change:**
```typescript
// Find
const FeatureCard = styled(Card)`
  background: linear-gradient(135deg, #2a2a2a 0%, #333 100%);
  border: 1px solid #555;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
    border-color: #4ECDC4;
  }
`;

// Replace with
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

### 3.3-3.4 Fix Button usage in EmotionTrackingDashboard.tsx
Remove FeatureButton and update Button usage.

**File:** `src/components/emotion/EmotionTrackingDashboard.tsx`

**Remove:**
```typescript
const FeatureButton = styled(Button)`
  width: 100%;
`;
```

**Update usage:**
```typescript
// Find
<FeatureButton variant="secondary">

// Replace with
<Button variant="secondary" className="w-full">
```

### 3.5 Update imports in EmotionTrackingDashboard.tsx
Remove Card from imports.

**File:** `src/components/emotion/EmotionTrackingDashboard.tsx`

**Change:**
```typescript
// Find
import { Card, Button, ResponsiveContainer } from '../common';

// Replace with
import { Button } from '@/components/ui/button';
import { ResponsiveContainer } from '../common';
```

## Validation Steps

After each component fix:
1. Check for TypeScript errors
2. Verify component renders
3. Test hover states
4. Test button clicks
5. Check responsive behavior

After all fixes:
1. Run `npm run build`
2. Start dev server
3. Navigate to emotion tracking components
4. Verify all styling is correct
5. Check browser console for errors

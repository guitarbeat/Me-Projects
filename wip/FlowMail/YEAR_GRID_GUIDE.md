# Year Grid: User & Developer Guide

The **Year Grid** is a powerful visualization tool within FlowMail that allows you to generate GitHub-style activity grids for various time spans (Days, Weeks, Months). This guide covers how to use, customize, and integrate the feature.

## 🚀 Getting Started

To access the Year Grid, click the **calendar** icon in the FlowMail sidebar. This will toggle the Year Grid interface.

### Main Features

- **Granular Views:** Switch between `Day`, `Week`, and `Month` views.
- **Customization:** Adjust colors, dot sizes, gaps, and corner radius.
- **Theme Presets:** Quickly apply curated color palettes like "Ember", "GitHub", or "Ocean".
- **Dynamic Watermark:** Shows the current year as a subtle background element.
- **Export:** Save your grid as a high-quality PNG image for sharing.

---

## 🎨 Customization Options

### Progress Settings
- **Current Date:** Determine how much of the grid is "filled" (representing time passed).
- **Start week on Monday:** Toggle between Sunday and Monday as the first day of the week.

### Grid Layout
- **Mode:** Choose between `Horizontal` (GitHub-style) and `Vertical` layouts.
- **Items Per Row:** For Week/Month views, control how many items appear in each row.
- **Square Size & Gap:** Fine-tune the density of your visualization.

### Colors & Presets
You can manually set colors for:
- Background
- Text Labels
- Empty States
- Filled States

> [!TIP]
> Use the **Theme Presets** for instant professional-looking results. 

---

## 🔗 Sharing and Persistence

### Automatic Saving
Your settings are automatically saved to your browser's **Local Storage**. If you refresh the page or return later, your exact configuration will be restored.

### Shareable Links
You can share your specific grid design using the **Share & Embed** section:
1. Click **Copy Link** to generate a URL with your current settings.
2. When someone opens this link, the Year Grid will automatically load your configuration.

### PNG Export
Click the **Save** button in the header to download a 2x scaled PNG of your grid. 
> [!IMPORTANT]
> If "Transparent Background" is checked, the saved image will have no background, making it perfect for embedding in other documents.

---

## 🛠 Developer Information

### Component Structure
- `YearGridApp`: Main container and state manager.
- `Sidebar`: Configuration panel with live updates.
- `YearGrid`: Core rendering logic using CSS Grid.
- `DayCell`: Individual grid unit with hover states.

### Persistence Logic
The app uses a `useEffect` hook in `YearGridApp.tsx` to sync state with `localStorage` and `URLSearchParams`. Configuration is merged in the following priority:
1. URL Parameters (highest)
2. Local Storage
3. Default Config (lowest)

### Technical Stack
- **React + TypeScript**
- **Tailwind CSS** for layout.
- **html2canvas** for client-side image generation.
- **Material Symbols** for iconography.

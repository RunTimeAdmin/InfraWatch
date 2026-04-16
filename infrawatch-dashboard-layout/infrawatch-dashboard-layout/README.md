# InfraWatch Dashboard Layout - Complete Code Bundle

This package contains all the necessary code files to implement the InfraWatch dashboard layout with cyberpunk theme styling.

## 📁 File Structure

```
infrawatch-dashboard-layout/
├── components/
│   └── layout/
│       ├── AppLayout.tsx      # Main layout wrapper
│       ├── Sidebar.tsx        # Navigation sidebar
│       └── Header.tsx         # Top navigation header
├── pages/
│   └── Dashboard.tsx          # Main dashboard page
├── contexts/
│   └── ThemeContext.tsx       # Theme management
├── App.tsx                    # Main app component with routing
├── index.css                  # Complete styling & cyberpunk theme
└── README.md                  # This file
```

## 🚀 Quick Start

### 1. Copy Files to Your Project

```bash
# Copy layout components
cp -r components/layout/* your-project/src/components/layout/

# Copy dashboard page
cp pages/Dashboard.tsx your-project/src/pages/

# Copy theme context
cp contexts/ThemeContext.tsx your-project/src/contexts/

# Copy or merge App.tsx
cp App.tsx your-project/src/

# Copy or merge CSS
cp index.css your-project/src/
```

### 2. Install Dependencies

```bash
npm install react react-dom wouter lucide-react tailwindcss
# or
pnpm add react react-dom wouter lucide-react tailwindcss
```

### 3. Import in Your App

```tsx
import App from './App';
import './index.css';

export default App;
```

## 📋 Component Overview

### AppLayout.tsx
Main layout wrapper that provides:
- Sidebar navigation (240px fixed width)
- Header with page title and status
- Main content area with scrolling
- Grid-based responsive structure

**Usage:**
```tsx
<AppLayout>
  <Dashboard />
</AppLayout>
```

### Sidebar.tsx
Navigation component featuring:
- Logo with animated glow effect
- Main navigation items (Dashboard, Validators, RPC Health)
- Analytics section (Data Centers, MEV Tracker, Bags, Alerts)
- Active state indicators with glowing left border
- Social media links (GitHub, Twitter)
- Version indicator

### Header.tsx
Top navigation bar with:
- Dynamic page titles based on current route
- Real-time connection status indicator
- Live/Offline status with pulsing animation
- Current timestamp (24-hour format)
- Gradient glow effect on bottom border

### Dashboard.tsx
Main dashboard page displaying:
- Network Overview section
- 4 metric cards in responsive grid (1 col mobile, 2 col tablet, 4 col desktop)
- Each metric shows: label, value, trend, status indicator
- Placeholder chart area for TPS History
- Cyberpunk styling with hover effects

### ThemeContext.tsx
Theme management providing:
- Dark/Light theme support
- localStorage persistence (optional)
- Theme toggle functionality
- Context-based theme application

### App.tsx
Main application component with:
- Route definitions for all pages
- Error boundary wrapper
- Theme provider setup
- Tooltip provider
- Toast notifications (Sonner)

### index.css
Complete styling including:
- Cyberpunk color palette (neon green, cyan, amber, red)
- Grid background pattern
- Scanline overlay effect
- Custom scrollbars
- Metric card styling with hover glow
- Animation keyframes (pulse-glow, shimmer, glow-pulse, connection-pulse)
- Tailwind CSS configuration
- Semantic color tokens

## 🎨 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Neon Green | #00ff88 | Primary accent, active states |
| Neon Cyan | #00d4ff | Secondary accent |
| Neon Amber | #ffaa00 | Warning, degraded status |
| Neon Red | #ff4444 | Critical, errors |
| Deep Black | #0a0a0f | Background |
| Dark Navy | #12121a | Cards, surfaces |
| Light Gray | #e0e0e0 | Primary text |
| Medium Gray | #888888 | Secondary text |

## 🔧 Customization

### Change Colors
Edit `index.css` `:root` section:
```css
:root {
  --color-neon-green: #00ff88;  /* Change this */
  --color-neon-cyan: #00d4ff;   /* Change this */
  /* ... */
}
```

### Modify Sidebar Width
In `AppLayout.tsx`:
```tsx
<div className="grid h-screen w-screen overflow-hidden bg-background" style={{ gridTemplateColumns: '15rem 1fr' }}>
  {/* Change '15rem' to your desired width */}
</div>
```

### Update Navigation Items
In `Sidebar.tsx`:
```tsx
const navItems = [
  { path: '/', label: 'Dashboard', icon: BarChart3 },
  // Add or modify items here
];
```

### Customize Page Titles
In `Header.tsx`:
```tsx
const pageTitles: Record<string, string> = {
  '/': 'Your Custom Title',
  // Add or modify titles
};
```

## 📱 Responsive Breakpoints

- **Mobile**: 320px - 640px (1 column metrics)
- **Tablet**: 640px - 1024px (2 column metrics)
- **Desktop**: 1024px+ (4 column metrics)

## 🎭 Animations

- **glow-pulse**: Logo pulsing glow effect (3s)
- **connection-pulse**: Connection status indicator (2s)
- **pulse-glow**: General glow animation (2s)
- **shimmer**: Shimmer effect for loading states (1.5s)

## 🔗 Dependencies

```json
{
  "dependencies": {
    "react": "^19.2.1",
    "react-dom": "^19.2.1",
    "wouter": "^3.3.5",
    "lucide-react": "^0.453.0"
  },
  "devDependencies": {
    "tailwindcss": "^4.1.14",
    "typescript": "5.6.3"
  }
}
```

## 📝 Notes

- All components use TypeScript for type safety
- Tailwind CSS is required for styling
- Lucide React provides SVG icons
- Wouter handles client-side routing
- Theme context manages dark mode
- All files are production-ready

## 🚨 Common Issues

**Issue**: Colors not appearing correctly
- **Solution**: Ensure `index.css` is imported before other styles
- **Solution**: Check that ThemeProvider has `defaultTheme="dark"`

**Issue**: Navigation not working
- **Solution**: Ensure Wouter is properly set up in App.tsx
- **Solution**: Check that all route paths match navigation items

**Issue**: Sidebar icons not showing
- **Solution**: Ensure lucide-react is installed
- **Solution**: Check that icons are imported correctly

## 📚 Further Customization

### Add More Pages
1. Create new page component in `pages/`
2. Add route in `App.tsx`
3. Add navigation item in `Sidebar.tsx`
4. Add page title in `Header.tsx`

### Connect Real Data
Replace mock data in `Dashboard.tsx` with API calls:
```tsx
const [metrics, setMetrics] = useState([]);

useEffect(() => {
  fetchMetrics().then(setMetrics);
}, []);
```

### Add Charts
Import Recharts and add chart components:
```tsx
import { LineChart, Line, XAxis, YAxis } from 'recharts';
```

## 📞 Support

For questions or issues, refer to:
- [React Documentation](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Wouter Routing](https://github.com/molefrog/wouter)
- [Lucide Icons](https://lucide.dev)

---

**Version**: 0.2.0 - Enhanced
**Last Updated**: April 15, 2026
**Status**: Production Ready

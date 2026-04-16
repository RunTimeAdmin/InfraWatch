# Installation Guide - InfraWatch Dashboard Layout

## Prerequisites

- Node.js 16+ or 18+
- npm, pnpm, or yarn package manager
- Existing React project (or create new one with Vite)

## Step 1: Create a New React Project (Optional)

If you don't have an existing React project:

```bash
# Using Vite
npm create vite@latest my-infrawatch -- --template react-ts
cd my-infrawatch
npm install

# Or using Create React App
npx create-react-app my-infrawatch
cd my-infrawatch
```

## Step 2: Install Required Dependencies

```bash
# Using npm
npm install react react-dom wouter lucide-react tailwindcss postcss autoprefixer

# Using pnpm
pnpm add react react-dom wouter lucide-react tailwindcss postcss autoprefixer

# Using yarn
yarn add react react-dom wouter lucide-react tailwindcss postcss autoprefixer
```

## Step 3: Install TypeScript (if using TypeScript)

```bash
npm install --save-dev typescript @types/react @types/react-dom
```

## Step 4: Configure Tailwind CSS

### 4.1 Initialize Tailwind

```bash
npx tailwindcss init -p
```

### 4.2 Update `tailwind.config.js`

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 4.3 Update `postcss.config.js`

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

## Step 5: Copy Dashboard Layout Files

### Option A: Manual Copy

1. Create directory structure:
```bash
mkdir -p src/components/layout
mkdir -p src/pages
mkdir -p src/contexts
```

2. Copy files from this package:
```bash
# Copy layout components
cp components/layout/* src/components/layout/

# Copy dashboard page
cp pages/Dashboard.tsx src/pages/

# Copy theme context
cp contexts/ThemeContext.tsx src/contexts/

# Copy App.tsx
cp App.tsx src/

# Copy CSS
cp index.css src/
```

### Option B: Using the Zip File

1. Extract the zip file
2. Copy the contents to your project's `src/` directory

## Step 6: Update Your Project Structure

Your project should now look like:

```
src/
├── components/
│   └── layout/
│       ├── AppLayout.tsx
│       ├── Sidebar.tsx
│       └── Header.tsx
├── pages/
│   └── Dashboard.tsx
├── contexts/
│   └── ThemeContext.tsx
├── App.tsx
├── index.css
└── main.tsx (or index.tsx)
```

## Step 7: Update Main Entry Point

### For Vite (main.tsx):

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### For Create React App (index.tsx):

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## Step 8: Update HTML Template

Make sure your `index.html` includes:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>InfraWatch</title>
    <!-- Add Google Fonts for Inter and JetBrains Mono -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## Step 9: Install Additional UI Components (Optional)

If you need shadcn/ui components like Card:

```bash
# Install shadcn/ui CLI
npm install -D @shadcn-ui/cli

# Initialize shadcn/ui
npx shadcn-ui@latest init

# Add Card component
npx shadcn-ui@latest add card
```

## Step 10: Run Development Server

```bash
# Using npm
npm run dev

# Using pnpm
pnpm dev

# Using yarn
yarn dev
```

Your dashboard should now be running at `http://localhost:5173` (Vite) or `http://localhost:3000` (CRA).

## Troubleshooting

### Issue: Tailwind CSS not working

**Solution**: 
- Ensure `index.css` is imported in your main entry file
- Check that `tailwind.config.js` includes your source files
- Run `npm install` again to ensure all dependencies are installed

### Issue: Icons not displaying

**Solution**:
- Verify `lucide-react` is installed: `npm list lucide-react`
- Check that icons are imported correctly in components
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Issue: Routing not working

**Solution**:
- Ensure `wouter` is installed: `npm list wouter`
- Check that routes are defined in `App.tsx`
- Verify navigation links use correct paths

### Issue: Theme not applying

**Solution**:
- Ensure `ThemeProvider` wraps your app in `App.tsx`
- Check that `index.css` is imported before other styles
- Verify `defaultTheme="dark"` is set on ThemeProvider

### Issue: Build errors with TypeScript

**Solution**:
- Run `npm install --save-dev @types/react @types/react-dom`
- Check that `tsconfig.json` is properly configured
- Verify all imports have correct paths

## Next Steps

1. **Customize Colors**: Edit the color palette in `index.css`
2. **Add More Pages**: Create new page components and add routes
3. **Connect Data**: Replace mock data with real API calls
4. **Add Charts**: Integrate Recharts for data visualization
5. **Deploy**: Build and deploy your application

## Build for Production

```bash
# Using npm
npm run build

# Using pnpm
pnpm build

# Using yarn
yarn build
```

The built files will be in the `dist/` directory.

## Additional Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Wouter Router](https://github.com/molefrog/wouter)
- [Lucide Icons](https://lucide.dev)
- [Vite Documentation](https://vitejs.dev)

---

**Version**: 0.2.0
**Last Updated**: April 15, 2026

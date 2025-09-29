# East Africa Vision Institute - Admission Dashboard

A clean, mobile-friendly Next.js 14 dashboard with Tailwind CSS for the East Africa Vision Institute admission system.

## Features

- **Responsive Design**: Mobile-first approach with clean, modern UI
- **Two Main Actions**: Admin Login and Apply Now buttons
- **Easy to Expand**: Modular structure for future enhancements
- **Professional Styling**: Tailwind CSS with custom components
- **Loading States**: Interactive buttons with loading animations

## Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:3000`

## Adding Your Logo

To replace the placeholder logo with your actual East Africa Vision Institute logo:

1. **Add your logo file** to the `public` folder (e.g., `public/eavi-logo.png`)

2. **Update the Dashboard component** (`app/page.tsx`):

   Replace the placeholder logo sections (lines 31-33 and 47-50) with:

   ```tsx
   // In the header section:
   <div className="w-16 h-16">
     <Image
       src="/eavi-logo.png"
       alt="East Africa Vision Institute Logo"
       width={64}
       height={64}
       className="w-full h-full object-contain"
     />
   </div>

   // In the main content section:
   <div className="mx-auto w-24 h-24 mb-6">
     <Image
       src="/eavi-logo.png"
       alt="East Africa Vision Institute Logo"
       width={96}
       height={96}
       className="w-full h-full object-contain rounded-full shadow-lg"
     />
   </div>
   ```

## Project Structure

```
finalyyy/
├── app/
│   ├── globals.css          # Global styles with Tailwind
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Main Dashboard component
├── public/                  # Static assets (add your logo here)
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
└── package.json             # Project dependencies
```

## Customization

### Colors
The project uses a custom primary color palette defined in `tailwind.config.js`. You can modify the colors to match your brand:

```js
primary: {
  500: '#3b82f6',  // Main brand color
  600: '#2563eb',  // Darker shade for buttons
  700: '#1d4ed8',  // Hover states
}
```

### Button Styles
Custom button classes are defined in `globals.css`:
- `.btn-primary` - Blue button for primary actions
- `.btn-secondary` - White button with blue border for secondary actions

### Adding New Features

1. **New Pages**: Create new files in the `app` directory
2. **Components**: Add reusable components in `app/components/`
3. **Styles**: Extend Tailwind classes or add custom CSS in `globals.css`

## Responsive Breakpoints

The dashboard is optimized for:
- **Mobile**: 320px and up
- **Tablet**: 640px and up (sm:)
- **Desktop**: 1024px and up (lg:)

## Build for Production

```bash
npm run build
npm start
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Next Steps

1. Add your logo as described above
2. Implement the actual login and application logic in the button handlers
3. Create separate pages for admin dashboard and application form
4. Add authentication and form validation
5. Connect to your backend API or database

## Support

For technical support with this dashboard, contact your development team or refer to the Next.js and Tailwind CSS documentation.
# Responsive Design System

This document outlines the responsive design system implemented in the InterviewAI application. The system ensures that the application looks and functions well across all device sizes, from mobile phones to large desktop monitors.

## Breakpoints

We follow Tailwind CSS's default breakpoints:

- **xs**: < 640px (mobile)
- **sm**: 640px (small tablets/large phones)
- **md**: 768px (tablets)
- **lg**: 1024px (laptops/desktops)
- **xl**: 1280px (large desktops)
- **2xl**: 1536px (extra large screens)

## Responsive Components

### 1. Container Components

Use these components to create responsive containers with appropriate padding and max-width:

```jsx
// Different size options
<ResponsiveContainer size="xs">Extra small container</ResponsiveContainer>
<ResponsiveContainer size="sm">Small container</ResponsiveContainer>
<ResponsiveContainer size="md">Medium container</ResponsiveContainer>
<ResponsiveContainer size="lg">Large container (default)</ResponsiveContainer>
<ResponsiveContainer size="xl">Extra large container</ResponsiveContainer>
<ResponsiveContainer size="full">Full width container</ResponsiveContainer>
```

### 2. Grid System

Create responsive grids that adapt to different screen sizes:

```jsx
<ResponsiveGrid 
  columns={{ 
    xs: 1,  // 1 column on mobile
    sm: 2,  // 2 columns on small tablets
    md: 3,  // 3 columns on tablets
    lg: 4   // 4 columns on desktop
  }}
  gap="md"
>
  {/* Grid items */}
</ResponsiveGrid>
```

### 3. Layout Components

Create responsive layouts with different patterns:

```jsx
// Stack layout (vertical on all screens)
<ResponsiveLayout type="stack" gap="md">
  <ResponsiveLayoutItem>Content 1</ResponsiveLayoutItem>
  <ResponsiveLayoutItem>Content 2</ResponsiveLayoutItem>
</ResponsiveLayout>

// Sidebar layout (vertical on mobile, horizontal with sidebar on desktop)
<ResponsiveLayout type="sidebar" gap="md">
  <ResponsiveLayoutItem width="1/3">Sidebar</ResponsiveLayoutItem>
  <ResponsiveLayoutItem width="2/3">Main content</ResponsiveLayoutItem>
</ResponsiveLayout>

// Split layout (vertical on mobile, horizontal on tablets and up)
<ResponsiveLayout type="split" gap="md">
  <ResponsiveLayoutItem width="1/2">Left content</ResponsiveLayoutItem>
  <ResponsiveLayoutItem width="1/2">Right content</ResponsiveLayoutItem>
</ResponsiveLayout>
```

### 4. Typography

Use responsive typography components that adjust font size based on screen size:

```jsx
<ResponsiveH1>This is a responsive heading 1</ResponsiveH1>
<ResponsiveH2>This is a responsive heading 2</ResponsiveH2>
<ResponsiveH3>This is a responsive heading 3</ResponsiveH3>
<ResponsiveH4>This is a responsive heading 4</ResponsiveH4>
<ResponsiveParagraph>This is a responsive paragraph</ResponsiveParagraph>
<ResponsiveText>This is responsive text</ResponsiveText>
```

### 5. Section Components

Create responsive sections with appropriate spacing:

```jsx
<ResponsiveSection spacing="default" containerSize="lg">
  <h2>Section Title</h2>
  <p>Section content</p>
</ResponsiveSection>
```

### 6. Navigation

Responsive navigation that adapts to different screen sizes:

```jsx
<ResponsiveNavigation
  items={[
    { label: 'Home', href: '/' },
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
  ]}
  logo={<Logo />}
  actions={<Button>Sign Up</Button>}
/>
```

### 7. Footer

Responsive footer with different variants:

```jsx
<ResponsiveFooter
  logo={<Logo />}
  columns={[
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '/features' },
        { label: 'Pricing', href: '/pricing' },
      ],
    },
    // More columns...
  ]}
  variant="default" // or "minimal" or "centered"
/>
```

## Utility Classes

### Container Classes

```css
.container-xs /* Max width: 640px with responsive padding */
.container-sm /* Max width: 768px with responsive padding */
.container-md /* Max width: 1024px with responsive padding */
.container-lg /* Max width: 1280px with responsive padding */
.container-xl /* Max width: 1536px with responsive padding */
```

### Typography Classes

```css
.text-responsive-xl /* Responsive extra large text */
.text-responsive-lg /* Responsive large text */
.text-responsive-md /* Responsive medium text */
.text-responsive-sm /* Responsive small text */
```

### Spacing Classes

```css
.section-spacing /* Responsive section padding */
.section-spacing-sm /* Smaller responsive section padding */
```

## Responsive Hooks

Use these hooks to conditionally render content based on screen size:

```jsx
import { useMediaQuery, useIsMobile, useIsTablet, useIsDesktop, useIsLargeDesktop } from '@/hooks/use-media-query';

function MyComponent() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  
  // Custom breakpoint
  const isAboveMedium = useMediaQuery('md', 'min');
  
  return (
    <div>
      {isMobile && <MobileView />}
      {isTablet && <TabletView />}
      {isDesktop && <DesktopView />}
      
      {isAboveMedium ? <LargeScreenContent /> : <SmallScreenContent />}
    </div>
  );
}
```

## Responsive Context

Access responsive information anywhere in your application:

```jsx
import { useResponsive } from '@/components/responsive-theme-provider';

function MyComponent() {
  const { 
    isMobile, 
    isTablet, 
    isDesktop, 
    isLargeDesktop,
    deviceType,
    windowWidth,
    windowHeight
  } = useResponsive();
  
  return (
    <div>
      <p>Current device type: {deviceType}</p>
      <p>Window dimensions: {windowWidth}px × {windowHeight}px</p>
      
      {/* Conditional rendering based on device type */}
      {isMobile && <p>Mobile view</p>}
      {isTablet && <p>Tablet view</p>}
      {isDesktop && <p>Desktop view</p>}
      {isLargeDesktop && <p>Large desktop view</p>}
    </div>
  );
}
```

## Best Practices

1. **Mobile-First Approach**: Always design for mobile first, then enhance for larger screens.
2. **Use Responsive Components**: Leverage the responsive components provided in this system.
3. **Avoid Fixed Dimensions**: Use relative units (%, rem, em) instead of fixed pixels when possible.
4. **Test on Real Devices**: Always test your responsive designs on actual devices, not just browser resizing.
5. **Use Flexbox and Grid**: These CSS features are powerful tools for responsive layouts.
6. **Optimize Images**: Use responsive images with appropriate sizes for different devices.
7. **Consider Touch Targets**: Make interactive elements at least 44×44px for touch devices.
8. **Simplify on Mobile**: Consider simplifying complex layouts and interactions on smaller screens.
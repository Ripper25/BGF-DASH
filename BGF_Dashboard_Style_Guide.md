# Bridging Gaps Foundation Dashboard Style Guide

## Brand Overview
The Bridging Gaps Foundation dashboard embodies a sophisticated, trustworthy aesthetic that reflects the organization's mission of bridging divides and creating opportunities. The design language combines traditional elegance with modern functionality, creating an interface that feels both established and accessible.

![Bridging Gaps Foundation Logo](./assets/logo.png)

## Color Palette

### Primary Colors
- **BGF Burgundy**: #9A2A2A (Logo red, primary brand color)
- **Rich Black**: #333333 (Text and UI elements)
- **Cream**: #F8F5F0 (Page background, replaces white)

### Secondary Colors
- **Gold**: #D4AF37 (Accents, highlights, important actions)
- **Deep Burgundy**: #6D1A1A (Darker variant for hover states)
- **Charcoal**: #2C2C2C (Secondary UI elements)

### Accent Colors
- **Forest Green**: #2F5233 (Success states, approvals)
- **Navy Blue**: #1A365D (Links, secondary actions)
- **Terracotta**: #C35A38 (Warnings, alerts)
- **Slate Gray**: #708090 (Neutral elements, backgrounds)

### Text Colors
- **Primary Text**: #333333 (Main text)
- **Secondary Text**: #5A5A5A (Supporting text)
- **Muted Text**: #8A8A8A (Tertiary information)
- **Light Text**: #F8F5F0 (Text on dark backgrounds)

## Typography

### Font Family
- **Primary Font**: "Playfair Display", serif (Headings, important text)
- **Secondary Font**: "Lato", sans-serif (Body text, UI elements)

### Font Sizes
- **Heading 1**: 32px (Page titles, welcome messages)
- **Heading 2**: 24px (Section titles)
- **Heading 3**: 20px (Card titles, panel headers)
- **Body Large**: 18px (Important information)
- **Body Regular**: 16px (Standard text)
- **Body Small**: 14px (Secondary information)
- **Caption**: 12px (Labels, timestamps)

### Font Weights
- **Regular**: 400 (Body text)
- **Medium**: 500 (Subheadings)
- **Semibold**: 600 (Section headings)
- **Bold**: 700 (Page titles, emphasis)
- **Black**: 900 (Used sparingly for dramatic emphasis)

### Typography Specifics
- **Line Height**: 1.5 for body text, 1.2 for headings
- **Letter Spacing**: +0.5px for all-caps text
- **Paragraph Spacing**: 16px between paragraphs

## Layout

### Grid System
- **12-column grid** for responsive layouts
- **32px margin** around main content area (more generous than standard)
- **24px gutters** between columns
- **8px base unit** for spacing (8px, 16px, 24px, 32px, etc.)

### Containers
- **Card containers**: Rounded corners (8px radius), subtle shadow, optional gold border
- **Sidebar**: Fixed width (280px), full height, burgundy background
- **Main content**: Fluid width, centered on cream background

### Spacing
- **Tight**: 8px (Between related elements)
- **Standard**: 16px (Default spacing)
- **Relaxed**: 24px (Between sections)
- **Generous**: 40px (Major section breaks)

## Components

### Navigation
- **Sidebar**: Burgundy background (#9A2A2A) with cream text
- **Icons**: 24px, stroke width 1.5px, centered with 16px padding
- **Active state**: Gold left border (3px), slightly lighter background
- **Sections**: Grouped with 16px spacing, section headers in Playfair Display

### Cards
- **Default**: Cream background (#F8F5F0), 8px border radius, subtle shadow
- **Important cards**: Thin gold border or accent
- **Card padding**: 24px (more generous than standard)
- **Card header**: Bottom border in light gray or gold accent
- **Card footer**: Top border in light gray

### Buttons
- **Primary**: Burgundy background (#9A2A2A), cream text, 4px border radius
- **Secondary**: Cream background, burgundy border, burgundy text
- **Tertiary**: No background, burgundy text, subtle underline on hover
- **Icon buttons**: 48px square, centered icon
- **Button sizes**: Small (36px height), Medium (44px height), Large (52px height)

### Icons
- **Style**: Outlined, consistent 1.5px stroke width
- **Size**: 18px (small), 24px (medium), 32px (large)
- **Colors**: Inherit from text or specific semantic colors
- **Spacing**: 12px from adjacent text

### Data Visualization
- **Charts**: Elegant, refined style with brand colors
- **Graphs**: Smooth curves, 2px line width
- **Donut charts**: 4px stroke width, rounded caps
- **Bar charts**: 12px width, subtle rounded corners
- **Data points**: Small circles (6px diameter)

### Tables
- **Headers**: Playfair Display, semibold text, subtle background
- **Rows**: Alternating background colors (cream, very light gray)
- **Cell padding**: 16px vertical, 24px horizontal
- **Borders**: 1px light border or borderless with spacing
- **Hover state**: Light gold highlight background

### Form Elements
- **Inputs**: 44px height, 4px border radius, 16px horizontal padding
- **Dropdowns**: Same as inputs, with 8px icon spacing
- **Checkboxes/Radio**: 20px square/circle, custom styled with brand colors
- **Focus state**: Gold outline or border highlight
- **Error state**: Terracotta border, error message below

### Workflow Status Indicators
- **Submitted**: Slate Gray (#708090)
- **Under Review**: Navy Blue (#1A365D)
- **Verified**: Gold (#D4AF37)
- **Approved**: Forest Green (#2F5233)
- **Rejected**: Terracotta (#C35A38)

## Micro Interactions

### Hover States
- **Buttons**: Slight darkening of background (15%)
- **Cards**: Subtle shadow increase, optional gold border appearance
- **Interactive elements**: Cursor change, subtle scale (1.02)

### Active States
- **Buttons**: Darker background (20%), slight inset effect
- **Navigation**: Gold left border, background highlight
- **Tabs**: Bottom border in gold, color change

### Transitions
- **Duration**: 200ms for small elements, 350ms for larger components
- **Easing**: Ease-out for natural feel
- **Properties**: opacity, transform, background-color

### Animations
- **Page transitions**: Fade in (250ms)
- **Card loading**: Subtle fade + rise (350ms)
- **Data updates**: Smooth value changes (450ms)
- **Notifications**: Slide in + fade (300ms)

## Imagery & Graphics

### Illustrations
- **Style**: Classic, elegant line illustrations
- **Purpose**: Visual aids, empty states, onboarding
- **Colors**: Using palette colors, primarily burgundy and gold

### Icons
- **Style**: Outlined, consistent stroke width (1.5px)
- **Corner radius**: 2px for squared corners
- **Sets**: Feather Icons or similar refined icon set
- **Usage**: Navigation, actions, status indicators

### Document/File Representations
- **Style**: Traditional document icons with subtle texture
- **States**: Different icons for different file types
- **Indicators**: Small badges for status (new, updated, etc.)

## Accessibility

### Color Contrast
- **Text on backgrounds**: Minimum 4.5:1 ratio
- **Large text**: Minimum 3:1 ratio
- **UI components**: Minimum 3:1 ratio against adjacent colors

### Focus Indicators
- **Style**: 2px solid border in gold
- **Visibility**: Never hidden, clearly visible

### Text Sizes
- **Minimum body text**: 16px
- **Minimum UI labels**: 14px

### Touch Targets
- **Minimum size**: 44px × 44px
- **Spacing between targets**: Minimum 8px

## Responsive Behavior

### Breakpoints
- **Mobile**: 320px - 639px
- **Tablet**: 640px - 1023px
- **Desktop**: 1024px - 1439px
- **Large Desktop**: 1440px+

### Adaptations
- **Mobile**: Single column, stacked cards, hidden sidebar (hamburger menu)
- **Tablet**: Two-column layout, condensed sidebar
- **Desktop**: Multi-column layout, full sidebar
- **Large Desktop**: Wider columns, more content visible

## Special UI Patterns

### Dashboard Cards
- **Request cards**: Request type, status indicator, date submitted, requester info
- **Status cards**: Icon, title, value, subtle background
- **Activity cards**: Time indicator, title, participant info, colored border

### Request List Items
- **Structure**: Request type icon, title, requester name, date, status indicator
- **States**: Submitted, Under Review, Verified, Approved, Rejected
- **Actions**: Quick action buttons on hover/tap

### Workflow Timeline
- **Time indicators**: Small, left-aligned, Lato font
- **Stage blocks**: Color-coded by status, rounded corners
- **Current stage**: Highlighted with gold border
- **Completed stages**: Checkmark icon, muted styling

### Notifications
- **Types**: Success, info, warning, error
- **Position**: Top-right corner or in-app notification center
- **Style**: Small icon, brief text, dismiss button
- **Duration**: Auto-dismiss after 5 seconds (except errors)

## Implementation Guidelines

### CSS Variables
- Use CSS custom properties for colors, spacing, and typography
- Namespace variables with prefix (e.g., `--bgf-color-primary`)

### Component Structure
- Follow atomic design principles (atoms, molecules, organisms)
- Create reusable components for common UI patterns

### Theming
- Support light/dark mode with color variable swapping
- Consider accessibility in both modes

### Performance
- Optimize images and SVGs
- Minimize CSS, use efficient selectors
- Consider loading strategies for large dashboards

## Brand Voice & Microcopy

### Tone
- **Professional and dignified**
- **Clear and respectful**
- **Supportive and empowering**

### Button Text
- **Action-oriented**: "Submit Request", "Review Application", "Approve"
- **Formal**: Use complete phrases rather than abbreviated text

### Notifications
- **Success**: "Your request has been successfully [completed action]"
- **Error**: Clear problem statement + suggested solution
- **Info**: Brief, informative statements with respectful tone

### Empty States
- **Helpful**: Explain why content is missing with encouraging tone
- **Actionable**: Provide clear next steps with guidance

---

This style guide provides a comprehensive framework for creating a dashboard interface that aligns with the Bridging Gaps Foundation brand identity, combining traditional elegance with modern functionality while ensuring usability, accessibility, and visual consistency.

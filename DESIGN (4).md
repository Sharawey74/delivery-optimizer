---
name: Nexus Logistics
colors:
  surface: '#0d1515'
  surface-dim: '#0d1515'
  surface-bright: '#333b3b'
  surface-container-lowest: '#080f10'
  surface-container-low: '#151d1e'
  surface-container: '#192122'
  surface-container-high: '#232b2c'
  surface-container-highest: '#2e3637'
  on-surface: '#dce4e4'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#dce4e4'
  inverse-on-surface: '#2a3232'
  outline: '#849495'
  outline-variant: '#3a494b'
  surface-tint: '#00dbe7'
  primary: '#e1fdff'
  on-primary: '#00363a'
  primary-container: '#00f2ff'
  on-primary-container: '#006a71'
  inverse-primary: '#00696f'
  secondary: '#ddb7ff'
  on-secondary: '#490080'
  secondary-container: '#6f00be'
  on-secondary-container: '#d6a9ff'
  tertiary: '#fff6e4'
  on-tertiary: '#3b2f00'
  tertiary-container: '#fed83a'
  on-tertiary-container: '#725e00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#74f5ff'
  primary-fixed-dim: '#00dbe7'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#f0dbff'
  secondary-fixed-dim: '#ddb7ff'
  on-secondary-fixed: '#2c0051'
  on-secondary-fixed-variant: '#6900b3'
  tertiary-fixed: '#ffe173'
  tertiary-fixed-dim: '#e8c423'
  on-tertiary-fixed: '#221b00'
  on-tertiary-fixed-variant: '#554500'
  background: '#0d1515'
  on-background: '#dce4e4'
  surface-variant: '#2e3637'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-base:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.4'
    letterSpacing: '0'
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.05em
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '450'
    lineHeight: '1.4'
    letterSpacing: '0'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-page: 24px
  panel-padding: 16px
  stack-gap: 8px
---

## Brand & Style

This design system is engineered for high-stakes operational environments where clarity and rapid cognition are paramount. It draws inspiration from the precision of developer tools like Linear and the sophisticated data density of Palantir, refined through the aesthetic polish of Stripe.

The personality is **Clinical, Visionary, and Dependable**. It avoids the "neon-cyberpunk" trope in favor of a "Mission Control" aesthetic—utilitarian but premium.

The visual style utilizes **Layered Minimalism** with a focus on:
- **Subtle Glassmorphism:** Using backdrop blurs on hovering elements and sidebars to maintain spatial awareness.
- **Surface Depth:** Creating a clear hierarchy through slight tonal shifts rather than heavy shadows.
- **Functional Accents:** Vibrant colors are used strictly for data signaling and status, never for purely decorative purposes.

## Colors

The palette is built on a "Deep Graphite" foundation to reduce eye strain during extended monitoring sessions. 

- **Background Strategy:** The base layer starts at `#121212`. Elevated panels use `#1e1e1e`, while interactive or floating elements use `#252525`.
- **System Signals:** 
    - **Cyan (#00f2ff):** Reserved for the primary "Active" state, selection indicators, and AI-driven insights.
    - **Purple (#a855f7):** Specifically designates "Optimization" events—where the AI has recalculated a route or reallocated a resource.
- **Data Status:** Success, Warning, and Critical states use high-vibrancy tones to ensure they pop against the dark surfaces, maintaining WCAG AA contrast ratios for legibility.

## Typography

This design system prioritizes **Inter** for its exceptional legibility in dark mode and high-density layouts. 

- **Hierarchy:** We use a tight scale to maximize screen real estate. Display sizes are used sparingly for top-level metrics.
- **Monospacing:** **JetBrains Mono** is introduced for secondary data points, coordinates, timestamps, and log entries. This creates a "technical" feel and ensures numerical data aligns perfectly in tables.
- **Micro-copy:** Small labels should be set in uppercase with slight tracking (`0.05em`) to ensure readability at sizes as small as 11px.

## Layout & Spacing

The layout follows a **Rigid Fluidity** model. It uses a 12-column grid for the main stage but relies on flex-box patterns for sidebar-heavy operations dashboards.

- **Rhythm:** A 4px baseline grid governs all spacing. 
- **Density:** High-density (16px gutters) is the default to allow more data to be visible without scrolling.
- **Sidebars:** Persistent left navigation (collapsed to 64px or expanded to 240px) and a right-side "Details/Event Log" panel (320px) anchor the central map or chart area.
- **Breakpoints:**
    - Desktop: 1440px+ (Full 3-pane view)
    - Tablet: 1024px (Collapse right panel into drawer)
    - Mobile: 375px (Single column, bottom-sheet for event logs)

## Elevation & Depth

Depth is communicated through **Tonal Stacking** and **Edge Illumination** rather than traditional drop shadows.

1.  **Level 0 (Base):** `#121212` - The canvas.
2.  **Level 1 (Panels):** `#1e1e1e` with a 1px border of `rgba(255,255,255,0.05)`.
3.  **Level 2 (Popovers/Modals):** `#252525` with a subtle `0.5px` inner highlight on the top edge and a `24px` blur backdrop filter (Glassmorphism).

Shadows, when used (e.g., on floating tooltips), are extremely diffused: `0 8px 32px rgba(0,0,0,0.5)`.

## Shapes

The design system uses a **Precision Softness** approach. 

- **Standard Elements:** 4px (`rounded`) for buttons, input fields, and small cards. This retains a technical, sharp edge while feeling modern.
- **Container Elements:** 8px (`rounded-lg`) for main dashboard panels and modals.
- **Status Pills:** Fully rounded (pill) for status indicators to distinguish them from interactive buttons.

## Components

- **Buttons:**
    - **Primary:** Solid Cyan (`#00f2ff`) with black text.
    - **Secondary:** Ghost style with `rgba(255,255,255,0.05)` background and white text.
- **Data Cards:** Should feature a 1px stroke. The top-left corner can include a small 2px accent bar in the status color (e.g., Green for healthy routes).
- **Event Log:** Uses `JetBrains Mono`. Each entry should have a subtle hover state (`#252525`) and a vertical "thread line" connecting related logistics events.
- **Inputs:** Darker than the panel background (`#121212`), with a 1px border that glows Cyan on focus.
- **Gauges & Sparklines:** Use ultra-thin 1.5pt strokes. Active paths in maps or charts should use a "pulse" animation to indicate flow.
- **Chips:** Small, low-contrast backgrounds with high-contrast text for categorical tagging (e.g., `[Vehicle: Semi-Truck]`).
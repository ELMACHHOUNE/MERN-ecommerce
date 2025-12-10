# Keni Sweet Flowers - Theme & Design System 🌸

This project features a custom "Vintage Petal" design system, built with Tailwind CSS v4 tokens and a fixed color palette inspired by floral aesthetics.

## Design Philosophy

The design language mimics the organic curves of flower petals and the soft, romantic tones of a boutique bakery.

- **Shapes**: Organic, asymmetrical border radii (e.g., `rounded-tl-[2.5rem] rounded-br-[2.5rem]`) to resemble petals.
- **Typography**: `BucklaneScript` (or serif fallbacks) for headings to evoke elegance; clean sans-serif for readability.
- **Atmosphere**: Soft gradients, backdrop blurs, and subtle shadows (`shadow-blush-pop-100/20`).

## Color Palette 🎨

The color system is defined in `src/index.css` using Tailwind v4 `@theme` directives.

### Primary Colors

- **Blush Pop** (`--color-blush-pop-*`): The core brand color. Used for primary buttons, highlights, and floral accents.
  - Primary Action: `bg-blush-pop-600`
  - Hover State: `bg-blush-pop-700`
  - Light Backgrounds: `bg-blush-pop-50`

### Secondary Colors

- **Vanilla Custard** (`--color-vanilla-custard-*`): Warm, creamy backgrounds.
  - App Background: `bg-vanilla-custard-50`
- **Almond Silk** (`--color-almond-silk-*`): Earthy neutrals for cards and borders.
  - Card Background: `bg-almond-silk-50`
  - Borders: `border-almond-silk-200`
- **Plum** (`--color-plum-*`): Deep accents for contrast.
- **Vintage Berry** (`--color-vintage-berry-*`): Muted tones for secondary text.

### Semantic Tokens

| Token                | Value                | Usage                                 |
| -------------------- | -------------------- | ------------------------------------- |
| `--color-background` | `vanilla-custard-50` | Main app background                   |
| `--color-foreground` | `ink-900`            | Primary text color                    |
| `--color-primary`    | `blush-pop-600`      | Call-to-action buttons, active states |
| `--color-card`       | `almond-silk-50`     | Card backgrounds                      |
| `--color-muted`      | `vintage-berry-200`  | Disabled states, subtle borders       |
| `--color-accent`     | `plum-500`           | Highlights, badges                    |

## Typography ✍️

- **Headings** (`font-display`): `BucklaneScript`, `Segoe Script`, `Brush Script MT`, cursive.
  - Used for: Page titles, hero sections, "Our Story".
- **Body** (`font-body`): System UI, `Segoe UI`, sans-serif.
  - Used for: Product descriptions, prices, interface text.

## UI Components & Patterns

### The "Petal" Card

A signature card style used for products and containers.

```tsx
<div className="rounded-tl-[2.5rem] rounded-br-[2.5rem] rounded-tr-2xl rounded-bl-2xl border border-blush-pop-100 shadow-xl shadow-blush-pop-100/20">
  {/* Content */}
</div>
```

### Buttons

- **Primary**: `bg-primary text-primary-foreground hover:bg-primary/90` (Pink/Magenta)
- **Ghost**: `hover:bg-pink-50 hover:text-pink-600` (Soft hover effect)

### Shadows

Custom colored shadows are used to create depth without harshness.

- `shadow-blush-pop-100/20`
- `shadow-pink-200`

## Mantine Integration

Mantine is configured in `src/theme/mantineTheme.ts` to match the Tailwind palette, ensuring consistency across complex components like modals or inputs if used.

## Usage Guidelines

1. **Always use semantic tokens** (`bg-background`, `text-primary`) when possible.
2. **Use the "Petal" radius** for main containers to maintain brand identity.
3. **Images**: Apply `loading="lazy"` and `rounded-tl-[1.2rem] rounded-br-[1.2rem]` to product thumbnails.

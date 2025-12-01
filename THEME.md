# Theme Palette and Usage

This project uses Tailwind CSS v4 tokens and Mantine to implement a cohesive theme.

Provided brand colors:

- Dark Olive: `#212107`
- Pale Blue: `#9DB6D4`
- Teal (Primary): `#008A97`
- Beige (Background): `#D6BEB0`
- Gray (Muted/Borders): `#9C9C9C`

## Tailwind tokens (src/index.css)

Tokens are defined with `@theme` in `src/index.css`:

- `--color-background`: `#D6BEB0`
- `--color-foreground`: `#212107`
- `--color-card`: `#FFFFFF`
- `--color-card-foreground`: `#212107`
- `--color-primary`: `#008A97`
- `--color-primary-foreground`: `#FFFFFF`
- `--color-accent`: `#9DB6D4`
- `--color-accent-foreground`: `#212107`
- `--color-muted`: `#9C9C9C`
- `--color-muted-foreground`: `#212107` (light) / `#D6BEB0` (dark)
- `--color-border` / `--color-input`: `#9C9C9C`
- `--color-ring`: `#008A97`

Dark mode overrides (`.dark`) invert background/foreground and keep the same brand colors. The dark mode class is toggled on `<html>`.

Use token-based utilities in components (examples):

- Backgrounds: `bg-background`, `bg-card`, `bg-accent/10`
- Text: `text-foreground`, `text-muted-foreground`, `text-primary`
- Borders: `border`, `border-border`
- Buttons: the shadcn variants use tokens; for custom buttons, use `bg-primary text-primary-foreground`.

## Mantine theme (src/theme/mantineTheme.ts)

Primary color is set to a custom `brand` scale anchored on `#008A97` to align Mantine components with the Tailwind palette:

- `primaryColor: "brand"`
- `colors.brand[9] = #008A97`

Mantine color scheme is synced to Tailwind by observing the `.dark` class on `<html>` in `App.tsx`.

## Notes

- Prefer semantic token utilities (`bg-card`, `text-muted-foreground`, `border`) over raw hex values.
- If you introduce new UI states (e.g., warnings), consider adding semantic tokens at the top of `src/index.css`.
- The linter may warn about Tailwind v4 at-rules in CSS (e.g., `@theme`, `@plugin`); they are handled during the build by Tailwind’s Vite plugin.

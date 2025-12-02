# Theme Palette and Usage

This project uses Tailwind CSS v4 tokens and Mantine with a single, fixed color scheme (no dark mode).

## Tailwind tokens (src/index.css)

Tokens are defined with `@theme` in `src/index.css` and provide semantic roles:

- `--color-background`
- `--color-foreground`
- `--color-card` / `--color-card-foreground`
- `--color-primary` / `--color-primary-foreground`
- `--color-accent` / `--color-accent-foreground`
- `--color-muted` / `--color-muted-foreground`
- `--color-border` / `--color-input`
- `--color-ring`
- `--bg-image-opacity` (for global background image intensity)

Use token-based utilities in components (examples):

- Backgrounds: `bg-background`, `bg-card`, `bg-accent/10`
- Text: `text-foreground`, `text-muted-foreground`, `text-primary`
- Borders: `border`, `border-border`
- Buttons: `bg-primary text-primary-foreground`

## Mantine theme (src/theme/mantineTheme.ts)

Mantine is configured to use the custom `brand` palette and a fixed color scheme. No runtime color scheme switching is used.

## Notes

- Prefer semantic token utilities over raw hex values.
- If you introduce new UI states (e.g., warnings), consider adding semantic tokens in `src/index.css`.
- The linter may warn about Tailwind v4 at-rules in CSS (e.g., `@theme`, `@plugin`); they are handled during the build by Tailwind’s Vite plugin.

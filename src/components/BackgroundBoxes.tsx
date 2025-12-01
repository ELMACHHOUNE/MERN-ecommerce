import { ReactNode } from "react";

interface BackgroundBoxesProps {
  children: ReactNode;
  className?: string;
}

export function BackgroundBoxes({
  children,
  className = "",
}: BackgroundBoxesProps) {
  return (
    <div className={`min-h-screen w-full bg-background relative ${className}`}>
      {/* Top Fade Grid Background */}
      <div
        className="absolute inset-0 z-0 dark:opacity-50"
        style={{
          /* Use theme tokens for grid + subtle brand glow */
          backgroundImage: `
            linear-gradient(to right, color-mix(in srgb, var(--color-accent) 10%, transparent) 1px, transparent 1px),
            linear-gradient(to bottom, color-mix(in srgb, var(--color-accent) 10%, transparent) 1px, transparent 1px),
            radial-gradient(ellipse 60% 40% at 50% 0%, color-mix(in srgb, var(--color-primary) 12%, transparent), transparent 70%)
          `,
          backgroundSize: "22px 28px, 22px 28px, auto",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

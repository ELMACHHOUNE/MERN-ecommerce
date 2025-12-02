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
      {/* Global floral image background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `url('/bg-flours.svg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.12, // ~12% for light mode
          mixBlendMode: "normal",
        }}
      />

      {/* Subtle grid + brand glow overlay (on top of image), dim in dark mode */}
      <div
        className="absolute inset-0 z-0 pointer-events-none dark:opacity-50"
        style={{
          backgroundImage: `
            linear-gradient(to right, color-mix(in srgb, var(--color-accent) 18%, transparent) 1px, transparent 1px),
            linear-gradient(to bottom, color-mix(in srgb, var(--color-accent) 18%, transparent) 1px, transparent 1px),
            radial-gradient(ellipse 60% 40% at 50% 0%, color-mix(in srgb, var(--color-primary) 10%, transparent), transparent 70%)
          `,
          backgroundSize: "22px 28px, 22px 28px, auto",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, var(--color-ink-950) 60%, transparent 100%)",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, var(--color-ink-950) 60%, transparent 100%)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

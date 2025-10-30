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
          backgroundImage: `
            linear-gradient(to right, #c7e7f0 1px, transparent 1px),
            linear-gradient(to bottom, #c7e7f0 1px, transparent 1px)
          `,
          backgroundSize: "20px 30px",
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

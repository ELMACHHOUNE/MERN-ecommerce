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
          opacity: `var(--bg-image-opacity)` as unknown as number,
          mixBlendMode: "normal",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

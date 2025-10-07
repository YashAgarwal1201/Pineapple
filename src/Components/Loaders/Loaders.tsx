import React from "react";

import clsx from "clsx";

type LoaderVariant = "spinner" | "dots" | "ripple" | "bars" | "glow";
type LoaderSize = "sm" | "md" | "lg";

interface LoaderProps {
  variant?: LoaderVariant;
  size?: LoaderSize;
  label?: string;
}

const sizeMap: Record<LoaderSize, string> = {
  sm: "w-6 h-6",
  md: "w-12 h-12",
  lg: "w-16 h-16",
};

// Consistent pineapple color palette
const pineappleColors = {
  light: {
    main: "bg-yellow-400",
    border: "border-yellow-400",
    accent: "bg-green-500",
  },
  dark: {
    main: "dark:bg-yellow-600",
    border: "dark:border-yellow-600",
    accent: "dark:bg-green-700",
  },
};

const PineappleLoader: React.FC<LoaderProps> = ({
  variant = "spinner",
  size = "md",
  label,
}) => {
  const baseSize = sizeMap[size];

  // Spinner 🍍
  const spinner = (
    <div
      className={clsx(
        baseSize,
        "border-4 rounded-full animate-spin border-t-green-500 border-yellow-400",
        "dark:border-t-green-700 dark:border-yellow-600"
      )}
    />
  );

  // Dots 🍍
  const dots = (
    <div className="flex space-x-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={clsx(
            "w-3 h-3 rounded-full animate-bounce",
            pineappleColors.light.main,
            pineappleColors.dark.main,
            i === 1 && [
              pineappleColors.light.accent,
              pineappleColors.dark.accent,
            ]
          )}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );

  // Ripple 🍍
  const ripple = (
    <div className={clsx("relative", baseSize)}>
      <div
        className={clsx(
          "absolute inset-0 border-4 rounded-full animate-ping",
          pineappleColors.light.border,
          pineappleColors.dark.border
        )}
      />
      <div
        className={clsx(
          "absolute inset-0 border-4 rounded-full opacity-75",
          pineappleColors.light.border,
          pineappleColors.dark.border
        )}
      />
    </div>
  );

  // Bars 🍍
  const bars = (
    <div className="flex space-x-1">
      {[0, 0.2, 0.4].map((delay, i) => (
        <div
          key={i}
          className={clsx(
            "w-2 h-6 rounded-sm animate-[pulse_0.6s_ease-in-out_infinite]",
            pineappleColors.light.main,
            pineappleColors.dark.main
          )}
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </div>
  );

  // Glow 🍍
  const glow = (
    <div className={clsx("relative", baseSize)}>
      <div
        className={clsx(
          "absolute w-full h-full border-4 rounded-full animate-spin border-t-transparent",
          pineappleColors.light.border,
          pineappleColors.dark.border
        )}
      />
      <div
        className={clsx(
          "absolute inset-0 rounded-full opacity-20 blur-md",
          pineappleColors.light.main,
          pineappleColors.dark.main
        )}
      />
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case "dots":
        return dots;
      case "ripple":
        return ripple;
      case "bars":
        return bars;
      case "glow":
        return glow;
      default:
        return spinner;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3 text-center">
      {renderLoader()}
      {label && (
        <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
          {label}
        </p>
      )}
    </div>
  );
};

export default PineappleLoader;

import React from "react";
import clsx from "clsx";
import { cn } from "@/lib/utils";

type LogoProps = {
  size?: "sm" | "md" | "lg" | number; // pre-defined or custom number (in rem)
  withText?: boolean;
  showImage?: boolean;
  text?: string;
  imgSrc?: string;
  className?: string;
  textClassName?: string;
};

const sizeMap = {
  sm: { width: "w-10", height: "h-6", text: "text-xl" },
  md: { width: "w-16", height: "h-10", text: "text-2xl" },
  lg: { width: "w-24", height: "h-14", text: "text-3xl" },
};

export const Logo: React.FC<LogoProps> = ({
  size = "md",
  withText = true,
  showImage = true,
  text = "Ticketer Africa",
  imgSrc = "/logo.png",
  className = "",
  textClassName,
}) => {
  const isCustomSize = typeof size === "number";
  const {
    width,
    height,
    text: textSize,
  } = typeof size === "string" ? sizeMap[size] : sizeMap.md;

  const imageClasses = isCustomSize
    ? `w-[${size}rem] h-[${size * 0.625}rem]` // keep aspect ratio
    : `${width} ${height}`;

  const fontClasses = isCustomSize ? `text-[${size * 0.15}rem]` : textSize;

  return (
    <div className={clsx("flex items-center gap-2", className)}>
      {showImage && (
        <div className={imageClasses}>
          <img
            src={imgSrc}
            alt={`${text} Logo`}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      {withText && (
        <span
          className={cn(
            "font-bold",
            fontClasses,
            textClassName ?? "text-[#E2725B]"
          )}
        >
          {text}
        </span>
      )}
    </div>
  );
};

import React from "react";
import clsx from "clsx";

type LogoProps = {
  size?: "sm" | "md" | "lg" | number; // pre-defined or custom number (in rem)
  withText?: boolean;
  text?: string;
  imgSrc?: string;
  className?: string;
};

const sizeMap = {
  sm: { width: "w-10", height: "h-6", text: "text-xl" },
  md: { width: "w-16", height: "h-10", text: "text-2xl" },
  lg: { width: "w-24", height: "h-14", text: "text-3xl" },
};

export const Logo: React.FC<LogoProps> = ({
  size = "md",
  withText = true,
  text = "Ticketer Africa",
  imgSrc = "/logo.png",
  className = "",
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
      <div className={imageClasses}>
        <img
          src={imgSrc}
          alt={`${text} Logo`}
          className="w-full h-full object-cover"
        />
      </div>
      {withText && (
        <span className={clsx("font-bold text-[#1E88E5]", fontClasses)}>
          {text}
        </span>
      )}
    </div>
  );
};

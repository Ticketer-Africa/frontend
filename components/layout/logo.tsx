import React from "react";
import clsx from "clsx";
import { cn } from "@/lib/utils";

type LogoProps = {
  size?: "sm" | "md" | "lg" | number; // pre-defined or custom number (in rem)
  withText?: boolean;
  showImage?: boolean;
  /** Hide the wordmark text below the `sm` breakpoint, leaving just the mark. */
  hideTextOnMobile?: boolean;
  /** Hide the image mark at the `md` breakpoint and up, leaving just the wordmark. */
  hideImageOnDesktop?: boolean;
  text?: string;
  imgSrc?: string;
  className?: string;
  textClassName?: string;
};

// The mark is a square icon, so its box is always square (unlike the old
// wide logo image this replaced) to avoid object-cover cropping it.
const sizeMap = {
  sm: { image: "w-6 h-6", text: "text-xl" },
  md: { image: "w-9 h-9", text: "text-2xl" },
  lg: { image: "w-12 h-12", text: "text-3xl" },
};

export const Logo: React.FC<LogoProps> = ({
  size = "md",
  withText = true,
  showImage = true,
  hideTextOnMobile = false,
  hideImageOnDesktop = false,
  text = "Ticketer Africa",
  imgSrc = "/logo.png",
  className = "",
  textClassName,
}) => {
  const isCustomSize = typeof size === "number";
  const { image, text: textSize } =
    typeof size === "string" ? sizeMap[size] : sizeMap.md;

  const imageClasses = isCustomSize
    ? `w-[${size * 0.625}rem] h-[${size * 0.625}rem]` // square, matches text height
    : image;

  const fontClasses = isCustomSize ? `text-[${size * 0.15}rem]` : textSize;

  return (
    <div className={clsx("flex items-center gap-2", className)}>
      {showImage && (
        <div className={clsx(imageClasses, "shrink-0", hideImageOnDesktop && "md:hidden")}>
          <img
            src={imgSrc}
            alt={`${text} Logo`}
            className="w-full h-full object-contain"
          />
        </div>
      )}
      {withText && (
        <span
          className={cn(
            "font-bold",
            fontClasses,
            hideTextOnMobile && "hidden sm:inline-block",
            textClassName ?? "text-[#E2725B]"
          )}
        >
          {text}
        </span>
      )}
    </div>
  );
};

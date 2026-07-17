"use client"

import * as React from "react"
import * as HoverCardPrimitive from "@radix-ui/react-hover-card"

import { cn } from "@/lib/utils"

const HoverCard = HoverCardPrimitive.Root

const HoverCardTrigger = HoverCardPrimitive.Trigger

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      "z-50 w-64 origin-[var(--radix-hover-card-content-transform-origin)] rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none transition-[opacity,transform] duration-150 [transition-timing-function:var(--motion-ease-out)] data-[state=closed]:scale-[0.98] data-[state=closed]:opacity-0 data-[state=open]:scale-100 data-[state=open]:opacity-100 data-[side=bottom]:data-[state=closed]:-translate-y-1 data-[side=left]:data-[state=closed]:translate-x-1 data-[side=right]:data-[state=closed]:-translate-x-1 data-[side=top]:data-[state=closed]:translate-y-1",
      className
    )}
    {...props}
  />
))
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName

export { HoverCard, HoverCardTrigger, HoverCardContent }

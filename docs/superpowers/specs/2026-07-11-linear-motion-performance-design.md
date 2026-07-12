# Linear-Inspired Motion Performance Refactor

**Date:** 2026-07-11

## Objective

Refactor animation across the frontend so interaction feedback remains subtle and responsive while avoiding animation-driven layout recalculation. Motion will prioritize perceived speed, spatial clarity, interruption safety, and consistent 60 FPS behavior.

Responsiveness takes precedence over preserving decorative animation. Motion without a clear interaction, state, or spatial purpose will be removed.

## Scope

This refactor covers frontend motion in:

- Page and route transitions
- Hover and press feedback
- Dropdowns, selects, popovers, tooltips, and navigation menus
- Dialogs, alert dialogs, modals, sheets, drawers, and sidebars
- Loading indicators and content-loading transitions
- Cards, buttons, navigation items, accordions, and collapsible form sections
- Shared CSS keyframes and Framer Motion usage

The work does not redesign component layouts, colors, typography, application behavior, or backend APIs.

## Current Risks

The initial audit found these recurring patterns:

- `transition-all` appears across shared primitives and page components, allowing unintended properties to animate.
- Sidebar state changes transition `width`, `left`, `right`, `margin`, and `padding`.
- A form section animates `height` between zero and `auto` with Framer Motion.
- Repeated entrance keyframes and decorative floating backgrounds add motion without improving task comprehension.
- Shared Radix primitives use generic animation utilities with inconsistent durations and origins.
- Hover motion is not consistently limited to devices with a fine pointer.
- Motion timing and reduced-motion behavior are not controlled by a single system.

## Motion Principles

### Property budget

Animated properties are limited to:

- `transform`
- `opacity`

Color changes may use short color transitions where needed for state feedback because they do not trigger layout. Box-shadow changes will be removed or made instantaneous when they coincide with movement; elevation feedback will primarily use transform and color.

The refactor will not animate `width`, `height`, `margin`, `padding`, `top`, `left`, `right`, or `bottom`.

### Timing and easing

The default responsive entrance curve is:

```css
cubic-bezier(0.23, 1, 0.32, 1)
```

Timing budgets are:

- Button press: 100–160ms
- Hover feedback: 120–180ms
- Tooltip and small popover: 140–180ms
- Dropdown, select, and navigation menu: 150–200ms
- Modal and dialog: 180–220ms
- Drawer and sheet: 200–240ms
- Page transition: 160–220ms

Exit transitions will be equal to or shorter than entrances. Frequently repeated actions will use reduced motion or no positional motion.

### Physical behavior

- Trigger-anchored overlays scale from the Radix-provided transform origin.
- Dialogs and modals remain centered and enter from approximately `scale(0.97)` with opacity.
- Drawers and sidebars enter with a full-element translate transform rather than positional or width animation.
- Entrances use small travel distances, normally 4–12px.
- No element animates from `scale(0)`.
- Interaction animations remain interruptible through CSS transitions or retargetable Motion transforms.

### GPU compositing

Transform and opacity animations will be composited where supported. `will-change` will be applied narrowly to actively animated overlay surfaces or pseudo-elements, not permanently across large lists. Three-dimensional transforms will not be added globally; they will only be used when a browser-specific compositing issue is demonstrated.

## Architecture

### Shared motion tokens

Global CSS will define named durations and easing curves for fast, standard, and overlay motion. Reusable utility classes will cover overlay entry/exit, press feedback, hover lift, and reduced-motion behavior.

Tokens provide one source of truth while component classes remain explicit about which properties transition. No utility will reintroduce `transition: all`.

### Shared UI primitives

Radix-based primitives are the highest-leverage layer. Dialog, alert dialog, sheet, dropdown, select, popover, hover card, tooltip, menubar, navigation menu, toast, accordion, tabs, button, and sidebar primitives will receive consistent property-scoped motion.

Overlay content will use Radix state and side attributes to select transform direction and origin. Overlay backdrops use opacity only.

### Page-level components

Page components will consume the shared motion language. Repeated one-off classes will be converted to explicit transitions or shared utilities. Framer Motion remains only where presence management or interruption behavior adds value; simple mount, hover, and press effects move to CSS.

## Component Behavior

### Page transitions

Page content may use a short opacity transition with at most a small vertical transform. High-frequency dashboard tab changes and keyboard-triggered navigation will not animate. Route loading feedback remains immediate.

### Hover effects, cards, and buttons

Hover lift is capped at roughly 2–4px and is enabled only under `@media (hover: hover) and (pointer: fine)`. Card image zoom is reduced to a subtle scale. Buttons gain brief press feedback around `scale(0.97–0.98)` and avoid animated shadows or layout properties.

### Dropdowns and navigation overlays

Menus enter from `opacity: 0` and approximately `scale(0.97)` with a 4px directional translate. Transform origin follows the trigger. Exit is slightly faster. Keyboard-opened command-style interfaces may skip positional motion.

### Modals and dialogs

Backdrops fade using opacity. Centered surfaces use opacity plus a small scale, without positional centering animations. Modal transforms compose centering and scale in a single transform so animation cannot overwrite placement.

### Sheets, drawers, and sidebars

Mobile sheets and drawers translate as a single fixed surface. The desktop sidebar will stop tweening width and edge position. Its layout state changes immediately; interior labels and controls may crossfade or translate within a fixed visual shell. This avoids repeated layout work during the transition.

### Accordions and collapsible content

Content height will not tween. Where preserving document flow is required, the container changes layout immediately while inner content uses opacity and a small transform. Frequently used accordions may use icon rotation only. Form sections must remain accessible and must not delay focus or validation feedback.

### Loading transitions

Spinners retain transform-only rotation. Skeletons use an opacity pulse rather than animated geometry. Decorative loading movement is removed. Loading feedback appears without an entrance delay.

## Decorative Motion Reduction

Continuous floating background ornaments and repeated list/card entrance animations will be removed when they do not explain state or hierarchy. Rare marketing-page entrances may remain only when they are transform/opacity based, short, and disabled under reduced motion.

## Accessibility

`prefers-reduced-motion: reduce` will:

- Remove travel, scaling, spinning decoration, and repeated entrance sequences.
- Preserve immediate opacity or color feedback where it communicates state.
- Avoid delays caused by animation duration.

Hover-only transforms will be restricted to hover-capable fine pointers. Focus visibility and keyboard behavior will remain unchanged or improve. Animation removal must not remove state communication.

## Verification

### Static checks

Repository searches must confirm that frontend motion code does not animate prohibited layout properties and that `transition-all` is removed from application components. Any third-party-generated CSS exception must be documented.

### Automated checks

- TypeScript and production build complete successfully.
- Existing lint or test commands run where supported by the project.
- Targeted motion-policy tests or static assertions cover prohibited transition patterns and shared primitives.

### Interaction checks

Representative flows will be checked at desktop and mobile widths:

- Route and page loading
- Header and navigation menus
- Dropdown and select placement/origin
- Dialog and alert dialog open/close
- Mobile sheet/drawer and desktop sidebar state changes
- Accordion and form-section expansion
- Card hover and button press
- Reduced-motion preference

Browser performance inspection will verify that representative transitions avoid layout and paint work attributable to animated properties. The acceptance target is smooth composited motion under normal application load rather than a synthetic FPS claim unsupported by profiling.

## Acceptance Criteria

- Application-controlled motion animates only transform and opacity for geometry or visibility changes.
- No application component uses `transition-all`.
- No animation transitions width, height, margin, padding, or inset position properties.
- Shared overlays use consistent timing, easing, direction, and transform origin.
- Decorative continuous motion and redundant repeated entrances are removed.
- Hover transforms are pointer-gated and reduced-motion behavior is present.
- Page transitions, overlays, sidebars, drawers, loading states, cards, buttons, and navigation remain functionally correct.
- The frontend production build passes.


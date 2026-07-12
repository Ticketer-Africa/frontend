# Linear Motion Performance Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor frontend animation to a Linear-inspired motion system that uses transform and opacity for geometry/visibility motion, removes decorative animation, and avoids layout-triggering animated properties.

**Architecture:** Add a static motion policy check, centralize motion tokens/utilities in global CSS, update shared UI primitives first, then clean page-level Framer Motion and one-off transition classes. Keep layout, copy, behavior, and backend interactions unchanged.

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Radix UI, Framer Motion where presence management still adds value, Node.js static validation script.

## Global Constraints

- Animated geometry and visibility properties are limited to `transform` and `opacity`.
- The refactor will not animate `width`, `height`, `margin`, `padding`, `top`, `left`, `right`, or `bottom`.
- Color changes may use short color transitions where needed for state feedback.
- Button press: 100-160ms.
- Hover feedback: 120-180ms.
- Tooltip and small popover: 140-180ms.
- Dropdown, select, and navigation menu: 150-200ms.
- Modal and dialog: 180-220ms.
- Drawer and sheet: 200-240ms.
- Page transition: 160-220ms.
- Hover lift is capped at roughly 2-4px and is enabled only under `@media (hover: hover) and (pointer: fine)`.
- Continuous floating background ornaments and repeated list/card entrance animations will be removed when they do not explain state or hierarchy.
- `prefers-reduced-motion: reduce` removes travel, scaling, spinning decoration, and repeated entrance sequences.
- No application component uses `transition-all`.

---

## File Structure

- Create `scripts/check-motion-performance.mjs`: static validation for prohibited transition patterns and layout-property animation in app/component CSS/TSX files.
- Modify `package.json`: add `check:motion` script.
- Modify `app/globals.css`: define motion tokens/utilities, remove decorative continuous keyframes, remove layout-based mobile menu animation, add reduced-motion policy.
- Modify `tailwind.config.ts`: remove height-based accordion keyframes/animations.
- Modify `components/ui/*`: update Radix overlays, buttons, cards, tabs, toast, progress, accordion, sidebar, sheet/drawer/dialog primitives to property-scoped transform/opacity motion.
- Modify app and component TSX files found by `rg -l "transition-all"`: replace `transition-all` with explicit `transition-[background-color,color,border-color,opacity,transform]`, `motion-press`, `motion-hover-lift`, or no transition when decorative.
- Modify Framer Motion files found by `rg -l "from \"framer-motion\""`: remove simple decorative/page entrance usage, keep only useful presence behavior, and remove height animation from event form step 4.

### Task 1: Static Motion Guard

**Files:**
- Create: `scripts/check-motion-performance.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `npm run check:motion`, which exits non-zero when app or component source contains `transition-all`, layout-property transition utilities, Framer Motion `height` animation, or CSS keyframes animating layout properties.

- [ ] **Step 1: Write the failing static check**

Create `scripts/check-motion-performance.mjs` that scans `app`, `components`, and `tailwind.config.ts`, ignoring `docs`, `node_modules`, `.next`, and package lock files. It must flag:

```js
const prohibitedPatterns = [
  /transition-all/,
  /transition-\[[^\]]*(?:width|height|margin|padding|top|left|right|bottom)[^\]]*\]/,
  /initial=\{\{[^}]*height\s*:/s,
  /animate=\{\{[^}]*height\s*:/s,
  /exit=\{\{[^}]*height\s*:/s,
  /height:\s*["'](?:0|auto|var\(--radix-accordion-content-height\))["']/,
  /max-height/,
];
```

- [ ] **Step 2: Add package script**

Add `"check:motion": "node scripts/check-motion-performance.mjs"` to `package.json`.

- [ ] **Step 3: Run red check**

Run: `npm run check:motion`

Expected: FAIL, listing current files such as `components/ui/sidebar.tsx`, `components/faq-section.tsx`, `tailwind.config.ts`, and `app/organizer/_components/event-form-step4.tsx`.

- [ ] **Step 4: Commit the guard**

Run: `git add scripts/check-motion-performance.mjs package.json && git commit -m "test: add motion performance guard"`

### Task 2: Global Motion Tokens and Decorative Reduction

**Files:**
- Modify: `app/globals.css`
- Modify: `tailwind.config.ts`

**Interfaces:**
- Consumes: `npm run check:motion`
- Produces: `.motion-surface`, `.motion-overlay`, `.motion-menu`, `.motion-press`, `.motion-hover-lift`, `.motion-fade-in`, and global motion CSS variables.

- [ ] **Step 1: Run guard to confirm current global failures**

Run: `npm run check:motion`

Expected: FAIL for global CSS/tailwind layout or decorative animation patterns.

- [ ] **Step 2: Update global CSS**

Add motion variables to `:root`, including:

```css
--motion-ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--motion-duration-fast: 120ms;
--motion-duration-standard: 160ms;
--motion-duration-overlay: 200ms;
```

Remove continuous decorative floating background keyframes and their `animation` assignments. Replace repeated entrance classes (`explore-card`, `hero-fade-in`, `section-animate`, `feature-card`, `faq-item`, `event-card-animate`, ticket/card equivalents) with either no animation or a single opacity/transform utility using short duration and reduced-motion support. Remove `mobile-menu-slide` because it animates `max-height`.

- [ ] **Step 3: Update Tailwind accordion config**

Remove `accordion-down` and `accordion-up` keyframes and animation entries because they animate height.

- [ ] **Step 4: Run checks**

Run: `npm run check:motion`

Expected: still FAIL because component/page files remain, but no failure should point at `tailwind.config.ts` for accordion height animation.

- [ ] **Step 5: Commit global motion cleanup**

Run: `git add app/globals.css tailwind.config.ts && git commit -m "style: centralize performant motion tokens"`

### Task 3: Shared UI Primitive Motion

**Files:**
- Modify: `components/ui/accordion.tsx`
- Modify: `components/ui/alert-dialog.tsx`
- Modify: `components/ui/button.tsx`
- Modify: `components/ui/card.tsx`
- Modify: `components/ui/context-menu.tsx`
- Modify: `components/ui/dialog.tsx`
- Modify: `components/ui/drawer.tsx`
- Modify: `components/ui/dropdown-menu.tsx`
- Modify: `components/ui/hover-card.tsx`
- Modify: `components/ui/input-otp.tsx`
- Modify: `components/ui/menubar.tsx`
- Modify: `components/ui/modal.tsx`
- Modify: `components/ui/navigation-menu.tsx`
- Modify: `components/ui/popover.tsx`
- Modify: `components/ui/progress.tsx`
- Modify: `components/ui/select.tsx`
- Modify: `components/ui/sheet.tsx`
- Modify: `components/ui/sidebar.tsx`
- Modify: `components/ui/tabs.tsx`
- Modify: `components/ui/toast.tsx`
- Modify: `components/ui/tooltip.tsx`

**Interfaces:**
- Consumes: global motion classes and variables.
- Produces: Radix primitive state animations that transition only opacity, transform, color, border-color, and background-color.

- [ ] **Step 1: Run guard for primitive failures**

Run: `npm run check:motion`

Expected: FAIL for `components/ui/sidebar.tsx` plus primitives using `transition-all`.

- [ ] **Step 2: Replace Radix animation utilities**

For overlays, replace `animate-in`, `animate-out`, `zoom-in-95`, `zoom-out-95`, `slide-in-*`, and `slide-out-*` with state classes that transition explicit properties:

```tsx
"origin-[var(--radix-*-content-transform-origin)] will-change-[opacity,transform] transition-[opacity,transform] duration-200 ease-[var(--motion-ease-out)] data-[state=open]:opacity-100 data-[state=closed]:opacity-0 data-[state=open]:scale-100 data-[state=closed]:scale-[0.98]"
```

For side-aware menus, use small translate classes such as `data-[side=bottom]:data-[state=closed]:-translate-y-1`.

- [ ] **Step 3: Fix sidebar transition properties**

Remove transitions of `width`, `left`, `right`, `margin`, and `padding`. Sidebar layout changes become immediate. Keep opacity/transform/color transitions on interior controls only.

- [ ] **Step 4: Replace primitive `transition-all`**

Use explicit transitions such as `transition-[background-color,color,border-color,opacity,transform]` or `transition-colors`. Add `motion-press` to clickable primitives where useful.

- [ ] **Step 5: Run checks**

Run: `npm run check:motion`

Expected: still FAIL for page-level files, but no failure should point at `components/ui`.

- [ ] **Step 6: Commit shared primitive cleanup**

Run: `git add components/ui && git commit -m "refactor: make ui primitive motion composited"`

### Task 4: Page and Feature Component Cleanup

**Files:**
- Modify every app/component file returned by `rg -l "transition-all" app components --glob '*.{ts,tsx,css}'`
- Modify every app/component file returned by `rg -l 'from "framer-motion"' app components --glob '*.{ts,tsx}'`

**Interfaces:**
- Consumes: primitive motion cleanup and global motion utilities.
- Produces: app pages and feature components without `transition-all`, decorative continuous animation, or Framer Motion height animation.

- [ ] **Step 1: Run guard for remaining page failures**

Run: `npm run check:motion`

Expected: FAIL for scattered page/component files.

- [ ] **Step 2: Remove nonessential Framer Motion**

Remove Framer Motion imports and wrappers from simple page/card entrance animations in organizer, settings, verify-ticket, terms, QR display, why-choose, and custom modal files when the animation does not communicate state. Keep ordinary `div` structure and preserve class names and behavior.

- [ ] **Step 3: Replace event form step 4 height animation**

In `app/organizer/_components/event-form-step4.tsx`, replace the `height: 0` to `height: "auto"` `motion.div` with immediate layout rendering and an inner `motion.div` or plain `div` that only uses opacity and a small y transform.

- [ ] **Step 4: Replace app-level `transition-all`**

For buttons/cards/links, replace `transition-all duration-300` with explicit properties. Remove animated shadow changes where present. Use `motion-press` and `motion-hover-lift` only when the interaction is useful and pointer-gated.

- [ ] **Step 5: Run checks**

Run: `npm run check:motion`

Expected: PASS.

- [ ] **Step 6: Commit page cleanup**

Run: `git add app components && git commit -m "refactor: remove layout-heavy page motion"`

### Task 5: Verification and Final Review

**Files:**
- Read/modify only if verification reveals an issue.

**Interfaces:**
- Consumes: all previous tasks.
- Produces: verified production build and static acceptance evidence.

- [ ] **Step 1: Run static motion policy**

Run: `npm run check:motion`

Expected: PASS.

- [ ] **Step 2: Run lint**

Run: `npm run lint`

Expected: PASS or report pre-existing framework/tooling issue clearly with exact output.

- [ ] **Step 3: Run production build**

Run: `npm run build`

Expected: PASS or report exact blocking error.

- [ ] **Step 4: Self-review diff**

Run: `git diff --check` and `git diff --stat HEAD~4..HEAD`

Expected: no whitespace errors; diff scope limited to motion refactor.

- [ ] **Step 5: Final commit if verification fixes were needed**

If fixes are required after prior commits, commit them with `git commit -m "fix: satisfy motion performance checks"`.

## Self-Review

- Spec coverage: Tasks cover static checks, shared tokens, primitives, page transitions, hover effects, dropdowns, modals, sidebars, drawers, loading transitions, cards, buttons, navigation, decorative motion removal, accessibility, and verification.
- Placeholder scan: No `TBD`, `TODO`, `implement later`, or unspecified tests are present.
- Type consistency: The only new public interface is `npm run check:motion`; later tasks consume the global CSS class names introduced in Task 2.

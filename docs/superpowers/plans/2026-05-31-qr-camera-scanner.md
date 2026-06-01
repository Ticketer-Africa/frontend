# QR Camera Scanner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a live camera-based QR scanner to the verify-ticket page so door staff can scan tickets directly from the browser without a dedicated app, while preserving the existing URL-param verification flow.

**Architecture:** Extract the verify logic from the URL-param `useEffect` into a shared `handleVerify` function. Add a `QRCameraScanner` component that wraps `@zxing/browser`'s `BrowserQRCodeReader` and calls `onScan` with the decoded raw text. The page starts in camera mode when no `?data=` param is present, and shows a "Scan Next Ticket" button after each result so door staff can immediately process the next ticket.

**Tech Stack:** Next.js App Router, `@zxing/browser`, `@zxing/library` (peer dep), TypeScript, Tailwind CSS, shadcn/ui

---

## File Map

| File | Action | Change |
|------|--------|--------|
| `package.json` | Modify | Add `@zxing/browser` and `@zxing/library` |
| `app/verify-ticket/QRCameraScanner.tsx` | Create | Camera viewfinder component using BrowserQRCodeReader |
| `app/verify-ticket/page.tsx` | Modify | Add camera mode, shared handleVerify, Scan Next Ticket button |

---

## Task 1: Install @zxing/browser

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Install the packages**

```bash
cd /Users/admin/Documents/ticketerafrica/frontend
npm install @zxing/browser @zxing/library
```

Expected output: both packages added to `node_modules` and `package.json` dependencies.

- [ ] **Step 2: Verify installation**

```bash
node -e "require('@zxing/browser'); console.log('ok')"
```

Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @zxing/browser for QR camera scanning"
```

---

## Task 2: Create QRCameraScanner component

**Files:**
- Create: `app/verify-ticket/QRCameraScanner.tsx`

This component manages the full lifecycle of the ZXing reader: starts on mount (when `active` is true), stops on unmount or when `active` becomes false, and calls `onScan` exactly once per QR code detected.

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader, IScannerControls } from "@zxing/browser";
import { Camera, CameraOff } from "lucide-react";

interface QRCameraScannerProps {
  onScan: (rawText: string) => void;
  active: boolean;
}

export function QRCameraScanner({ onScan, active }: QRCameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!active) {
      controlsRef.current?.stop();
      controlsRef.current = null;
      return;
    }

    let cancelled = false;

    const start = async () => {
      if (!videoRef.current) return;
      setStarting(true);
      setPermissionDenied(false);

      try {
        const reader = new BrowserQRCodeReader();
        const controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result, error) => {
            if (result && !cancelled) {
              cancelled = true;
              controls.stop();
              controlsRef.current = null;
              onScan(result.getText());
            }
          },
        );
        if (!cancelled) {
          controlsRef.current = controls;
        } else {
          controls.stop();
        }
      } catch (err: any) {
        if (
          err?.name === "NotAllowedError" ||
          err?.message?.includes("Permission")
        ) {
          setPermissionDenied(true);
        }
      } finally {
        setStarting(false);
      }
    };

    start();

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [active, onScan]);

  if (permissionDenied) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
        <CameraOff className="h-12 w-12 text-gray-400" />
        <p className="text-gray-700 font-medium text-center">
          Camera access denied
        </p>
        <p className="text-sm text-gray-500 text-center max-w-xs">
          Allow camera access in your browser settings, then refresh the page to
          scan tickets.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-[#1E88E5] underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-square max-w-sm mx-auto rounded-xl overflow-hidden bg-black">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        muted
        playsInline
      />
      {/* Viewfinder overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-48 h-48 border-2 border-white rounded-lg opacity-70" />
      </div>
      {starting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center">
        <div className="bg-black/60 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
          <Camera className="h-3 w-3" />
          Point at ticket QR code
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors in `QRCameraScanner.tsx`.

- [ ] **Step 3: Commit**

```bash
git add app/verify-ticket/QRCameraScanner.tsx
git commit -m "feat(scanner): add QRCameraScanner component using @zxing/browser"
```

---

## Task 3: Update verify-ticket page

**Files:**
- Modify: `app/verify-ticket/page.tsx`

This task: (1) adds a `mode` state (`"camera" | "url-param"`), (2) extracts shared `handleVerify` logic, (3) renders `QRCameraScanner` in camera mode, (4) adds "Scan Next Ticket" button on the result card.

- [ ] **Step 1: Add QRCameraScanner import and mode state**

At the top of `app/verify-ticket/page.tsx`, add the import after existing imports:

```ts
import { QRCameraScanner } from "./QRCameraScanner";
```

Inside `VerifyTicketPage`, add a new state variable and a helper after the existing state declarations:

```ts
const [mode, setMode] = useState<"camera" | "url-param">("camera");
const [scannerActive, setScannerActive] = useState(false);
```

- [ ] **Step 2: Extract shared `handleVerify` function**

The existing `useEffect` contains the verify logic inline. Extract it into a named async function inside the component (above the `useEffect`):

```ts
const handleVerify = async (dataParam: string) => {
  try {
    setError("");
    const parsedData = parseTicketData(dataParam);
    if (!parsedData || !parsedData.eventId) {
      setError("Invalid ticket data");
      toast.error("Invalid ticket data");
      return;
    }

    setTicketData(parsedData);

    const response = await verifyTicket({
      ticketId: parsedData.ticketId,
      code: parsedData.code,
      eventId: parsedData.eventId,
    });

    setVerification({
      isValid: response.status === "VALID",
      ticket: {
        id: response.ticketId,
        code: response.code,
        eventId: response.eventId,
        ticketCategory: response.ticketCategory,
        isUsed: response.markedUsed,
        isListed: !!response.resalePrice,
        resalePrice: response.resalePrice,
        event: response.event
          ? (response.event as unknown as TicketEvent)
          : undefined,
      },
      scannedAt: new Date().toISOString(),
      message: response.message,
    });
  } catch (err: any) {
    setError(err?.message || "Verification failed. Please try again.");
    toast.error(err?.message || "Verification failed. Please try again.");
  }
};
```

- [ ] **Step 3: Update the existing useEffect to call handleVerify and set mode**

Replace the existing `useEffect` body with:

```ts
useEffect(() => {
  const dataParam = searchParams.get("data");
  if (dataParam) {
    setMode("url-param");
    setScannerActive(false);
    handleVerify(dataParam);
  } else {
    setMode("camera");
    setScannerActive(true);
  }
}, [searchParams]);
```

Note: `handleVerify` is defined above this effect, so the reference is stable within the component scope. The linter may warn about missing deps — add `// eslint-disable-next-line react-hooks/exhaustive-deps` if needed, since this effect intentionally runs once on mount.

- [ ] **Step 4: Add the onScan camera callback**

Add this function inside the component, below `handleVerify`:

```ts
const handleCameraScan = (rawText: string) => {
  setScannerActive(false);
  // QR codes encode the full verification URL: extract the ?data= param
  try {
    const url = new URL(rawText);
    const dataParam = url.searchParams.get("data");
    if (dataParam) {
      handleVerify(dataParam);
      return;
    }
  } catch {
    // rawText is not a URL — try treating it as the raw data string directly
  }
  handleVerify(rawText);
};
```

- [ ] **Step 5: Add Scan Next Ticket reset function**

```ts
const handleScanNext = () => {
  setVerification(null);
  setTicketData(null);
  setError("");
  setMode("camera");
  setScannerActive(true);
};
```

- [ ] **Step 6: Add mode toggle button and camera viewfinder to the render**

In the return JSX, the page currently shows a spinner while `isVerifying`, then an error card, then the result card. We need to add:

1. A camera viewfinder section when in camera mode and no result yet
2. A mode toggle button
3. "Scan Next Ticket" button in the result card

**Replace the `isVerifying` early return** (the spinner block) to also handle the no-ticketData camera state. Find:

```tsx
if (isVerifying) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      ...spinner...
    </div>
  );
}

if (error || !ticketData) {
  return (
    ...error card...
  );
}
```

Replace with:

```tsx
if (isVerifying) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="w-16 h-16 border-4 border-[#1E88E5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Verifying Ticket...
        </h2>
        <p className="text-gray-600">
          Please wait while we validate your ticket
        </p>
      </motion.div>
    </div>
  );
}

// Camera mode: no result yet — show viewfinder
if (mode === "camera" && !verification && !error) {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-md py-8 space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Scan Ticket
          </h1>
          <p className="text-gray-500 text-sm">
            Point the camera at a ticket QR code
          </p>
        </div>
        <QRCameraScanner onScan={handleCameraScan} active={scannerActive} />
        <div className="text-center">
          <button
            onClick={() => {
              setScannerActive(false);
              setMode("url-param");
            }}
            className="text-sm text-[#1E88E5] underline"
          >
            Use URL param instead
          </button>
        </div>
      </div>
    </div>
  );
}

if (error || !ticketData) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        <Card className="bg-white border-red-200 shadow-lg rounded-xl">
          <CardHeader className="text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">
              Verification Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">{error || "Invalid ticket data"}</p>
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                className="bg-transparent border-gray-300 hover:bg-gray-100 text-gray-900"
                onClick={handleScanNext}
              >
                Scan Another Ticket
              </Button>
              <Button
                variant="outline"
                className="bg-transparent border-gray-300 hover:bg-gray-100 text-gray-900"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 7: Add "Scan Next Ticket" button to the result card action buttons**

Find the action buttons section in the result card:

```tsx
{/* Action Buttons */}
<div className="flex space-x-2 pt-4 border-t">
  {verification?.isValid && user?.role === "ORGANIZER" ? (
    <>
      <Button
        className="flex-1 bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300"
        onClick={() => window.print()}
      >
        Print Verification
      </Button>
      <Button
        variant="outline"
        className="flex-1 bg-transparent border-gray-300 hover:bg-gray-100 text-gray-900"
        onClick={() => (window.location.href = "/")}
      >
        Close
      </Button>
    </>
  ) : (
    <Button
      variant="outline"
      className="w-full bg-transparent border-gray-300 hover:bg-gray-100 text-gray-900"
      onClick={() => (window.location.href = "/")}
    >
      Close
    </Button>
  )}
</div>
```

Replace with:

```tsx
{/* Action Buttons */}
<div className="flex flex-wrap gap-2 pt-4 border-t">
  <Button
    className="flex-1 bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300"
    onClick={handleScanNext}
  >
    Scan Next Ticket
  </Button>
  {verification?.isValid && user?.role === "ORGANIZER" && (
    <Button
      variant="outline"
      className="flex-1 bg-transparent border-gray-300 hover:bg-gray-100 text-gray-900"
      onClick={() => window.print()}
    >
      Print Verification
    </Button>
  )}
  <Button
    variant="outline"
    className="flex-1 bg-transparent border-gray-300 hover:bg-gray-100 text-gray-900"
    onClick={() => (window.location.href = "/")}
  >
    Close
  </Button>
</div>
```

- [ ] **Step 8: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add app/verify-ticket/page.tsx
git commit -m "feat(scanner): add camera QR scanner mode to verify-ticket page"
```

---

## Task 4: Manual browser verification

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Test camera mode (no ?data= param)**

Open `http://localhost:3000/verify-ticket`. Confirm:
- Camera viewfinder renders with a white border overlay
- Browser requests camera permission
- "Point the camera at a ticket QR code" label is shown
- "Use URL param instead" link is visible

- [ ] **Step 3: Test URL param mode (backward compat)**

Open `http://localhost:3000/verify-ticket?data=<valid-encoded-ticket-data>`. Confirm:
- Page auto-verifies without showing camera
- Result card renders as before (pass or fail)
- "Scan Next Ticket" button appears on the result card
- Clicking "Scan Next Ticket" clears the result and shows the camera viewfinder again

- [ ] **Step 4: Test scan-next flow**

With camera open, scan a QR code (or simulate by calling `handleCameraScan` in browser console). Confirm:
- Scanner stops after first decode
- Verifying spinner shows
- Result card renders
- "Scan Next Ticket" restarts the camera

- [ ] **Step 5: Test permission denied**

In browser settings, block camera for localhost. Open the page. Confirm:
- "Camera access denied" message shows
- "Retry" link reloads the page

- [ ] **Step 6: Final commit if any fixes were needed**

```bash
git add -p
git commit -m "fix(scanner): address browser verification issues"
```

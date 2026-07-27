"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { HugeiconsIcon } from "@hugeicons/react";
import { Camera01Icon, CameraOff01Icon } from "@hugeicons/core-free-icons";

interface QRCameraScannerProps {
  onScan: (rawText: string) => void;
  active: boolean;
}

const SCANNER_ELEMENT_ID = "qr-camera-scanner-region";

export function QRCameraScanner({ onScan, active }: QRCameraScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!active) {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            scannerRef.current = null;
          });
      }
      return;
    }

    let cancelled = false;

    const start = async () => {
      setStarting(true);
      setPermissionDenied(false);

      try {
        const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 200, height: 200 } },
          (decodedText) => {
            if (!cancelled) {
              cancelled = true;
              scanner
                .stop()
                .catch(() => {})
                .finally(() => {
                  scannerRef.current = null;
                  onScan(decodedText);
                });
            }
          },
          () => {
            // per-frame not-found errors are expected — ignore
          },
        );
      } catch (err: any) {
        if (
          err?.name === "NotAllowedError" ||
          (typeof err === "string" && err.toLowerCase().includes("permission"))
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
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            scannerRef.current = null;
          });
      }
    };
  }, [active, onScan]);

  if (permissionDenied) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
        <HugeiconsIcon icon={CameraOff01Icon} className="h-12 w-12 text-gray-400" />
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
    <div className="relative w-full max-w-sm mx-auto">
      {/* html5-qrcode mounts its own video + overlay into this div */}
      <div
        id={SCANNER_ELEMENT_ID}
        className="w-full rounded-xl overflow-hidden bg-black"
        style={{ minHeight: 280 }}
      />
      {starting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div className="mt-2 flex justify-center">
        <div className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
          <HugeiconsIcon icon={Camera01Icon} className="h-3 w-3" />
          Point at ticket QR code
        </div>
      </div>
    </div>
  );
}

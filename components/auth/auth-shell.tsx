import type React from "react";

/**
 * Shared dark-theme glassmorphic shell for the 4 auth pages (Login,
 * Register, Forgot Password, Reset Password). The card itself (blur,
 * coral-tinted border, accent glow blobs) lives here so pages only
 * render their form content — matches Figma frames 351:888, 361:1461,
 * 368:603.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="home-theme min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-12"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <div
        className="auth-form-animate relative z-10 w-full max-w-2xl overflow-hidden rounded-xl border backdrop-blur-md shadow-2xl"
        style={{
          backgroundColor: "rgba(17,24,39,0.6)",
          borderColor: "rgba(226,114,91,0.2)",
        }}
      >
        <div
          className="pointer-events-none absolute -top-24 right-24 h-48 w-48 rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(226,114,91,0.2)" }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute top-72 -left-24 h-48 w-48 rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(226,114,91,0.2)" }}
          aria-hidden="true"
        />
        <div className="relative p-8 sm:p-10 md:p-12">{children}</div>
      </div>
    </div>
  );
}

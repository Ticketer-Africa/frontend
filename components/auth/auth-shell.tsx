import type React from "react";

/**
 * Shared dark-theme shell for the 4 auth pages (Login, Register,
 * Forgot Password, Reset Password). Replaces the identical
 * copy-pasted wrapper + decorative-circle markup that existed in
 * all 4 files pre-redesign.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="home-theme min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <div className="auth-form-animate relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}

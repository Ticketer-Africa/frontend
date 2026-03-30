"use client";

import { Button } from "@/components/ui/button";

export function AuthStep() {
  const redirectToAuth = (path: "/login" | "/register") => {
    const currentUrl = window.location.href;
    window.location.href = `${path}?redirect=${encodeURIComponent(currentUrl)}`;
  };

  return (
    <div className="space-y-6 text-center auth-step-animate">
      <div className="text-6xl mb-4">🎫</div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Sign in to complete your purchase
        </h3>
        <p className="text-gray-600">
          You need to be signed in to buy tickets and access your digital
          tickets.
        </p>
      </div>

      <div className="space-y-3">
        <Button
          onClick={() => redirectToAuth("/login")}
          className="w-full h-12 bg-[#1E88E5] hover:bg-blue-500 text-white font-semibold rounded-xl"
        >
          Sign In
        </Button>
        <Button
          onClick={() => redirectToAuth("/register")}
          variant="outline"
          className="w-full h-12 border-gray-200 hover:bg-gray-50 rounded-xl bg-transparent"
        >
          Create Account
        </Button>
      </div>
    </div>
  );
}

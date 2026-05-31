"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";

interface AcceptInviteResponse {
  message: string;
  invite: {
    id: string;
    email: string;
    eventId: string;
    accepted: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export default function InviteAcceptancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "invalid"
  >("loading");
  const [message, setMessage] = useState("");
  const [eventName, setEventName] = useState("");

  const inviteId = searchParams.get("inviteId");
  const email = searchParams.get("email");
  const inviteToken = searchParams.get("i");

  const resolvePersonalInvite = useCallback(async (token: string) => {
    try {
      setStatus("loading");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://api.ticketer.africa"}/api/v2/events/invite/resolve?i=${encodeURIComponent(token)}`,
      );
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to resolve invite");
      }
      const data = await response.json();
      try {
        sessionStorage.setItem(
          "inviteSession",
          JSON.stringify({
            inviteToken: token,
            guestName: data.invitee?.name ?? "",
            guestEmail: data.invitee?.email ?? "",
          }),
        );
      } catch {
        // sessionStorage unavailable — proceed without storing
      }
      const slug = data.event?.slug;
      if (slug) {
        // Hard redirect so event page loads fresh with server-side data
        window.location.href = `/events/${slug}`;
      } else {
        setStatus("error");
        setMessage("Could not determine event from this invite link.");
      }
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Failed to resolve invite.",
      );
    }
  }, []);

  useEffect(() => {
    if (inviteToken) {
      resolvePersonalInvite(inviteToken);
      return;
    }
    if (!inviteId || !email) {
      setStatus("invalid");
      setMessage("Invalid invitation link. Missing required parameters.");
      return;
    }
    acceptInvite(inviteId, decodeURIComponent(email));
  }, [inviteToken, inviteId, email, resolvePersonalInvite]);

  const acceptInvite = async (id: string, inviteeEmail: string) => {
    try {
      setStatus("loading");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://api.ticketer.africa"}/api/v2/events/accept-invite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inviteId: id,
            email: inviteeEmail,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to accept invite");
      }

      const data: AcceptInviteResponse = await response.json();

      // Extract event name from the response if available
      // For now, we'll show a generic success message
      setStatus("success");
      setMessage("Invitation accepted successfully! Redirecting...");

      // Redirect to event details or dashboard after 2 seconds
      setTimeout(() => {
        router.push("/events");
      }, 2000);
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to accept invite. Please try again.",
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Loading State */}
          {status === "loading" && (
            <>
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Loader className="w-16 h-16 text-blue-600 animate-spin" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Processing Your Invitation
              </h1>
              <p className="text-gray-600">
                Please wait while we accept your invitation...
              </p>
            </>
          )}

          {/* Success State */}
          {status === "success" && (
            <>
              <div className="flex justify-center mb-6">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Invitation Accepted! 🎉
              </h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <p className="text-sm text-gray-500">
                Redirecting you to events...
              </p>
            </>
          )}

          {/* Error State */}
          {status === "error" && (
            <>
              <div className="flex justify-center mb-6">
                <AlertCircle className="w-16 h-16 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Something Went Wrong
              </h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push("/")}
                >
                  Go Home
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
            </>
          )}

          {/* Invalid Parameters State */}
          {status === "invalid" && (
            <>
              <div className="flex justify-center mb-6">
                <AlertCircle className="w-16 h-16 text-yellow-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Invalid Invitation Link
              </h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <p className="text-sm text-gray-500 mb-6">
                Please check the invitation link and try again.
              </p>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => router.push("/")}
              >
                Go Home
              </Button>
            </>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Having trouble? Contact the event organizer for a new invitation
            link.
          </p>
        </div>
      </div>
    </div>
  );
}

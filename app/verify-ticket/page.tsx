"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  MapPin,
  Ticket,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { parseTicketData, type QRTicketData } from "@/lib/qr-utils";
import { useVerifyTicket } from "@/services/tickets/tickets.queries";
import { verifyInvite, type VerifyInviteResponse } from "@/services/invites/invites";
import { useAuth } from "@/lib/auth-context";
import { formatDate, formatPrice } from "@/lib/helpers";
import { toast } from "sonner";
import { useEventById } from "@/services/events/events.queries";
import { QRCameraScanner } from "./QRCameraScanner";

interface TicketCategory {
  name: string;
  price: number;
}

interface TicketEvent {
  id: string;
  name: string;
  date: Date | string;
  location: string;
  bannerUrl?: string;
}

interface Ticket {
  id: string;
  code: string;
  eventId: string;
  ticketCategory?: TicketCategory;
  isUsed: boolean;
  isListed: boolean;
  resalePrice?: number;
  event?: TicketEvent;
}

interface TicketVerification {
  isValid: boolean;
  ticket?: Ticket;
  scannedAt?: string;
  message?: string;
}

export default function VerifyTicketPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { mutateAsync: verifyTicket, isPending: isVerifying } =
    useVerifyTicket();

  const [verification, setVerification] = useState<TicketVerification | null>(
    null
  );
  const [ticketData, setTicketData] = useState<QRTicketData | null>(null);
  const [inviteVerification, setInviteVerification] =
    useState<VerifyInviteResponse | null>(null);
  const [inviteVerifying, setInviteVerifying] = useState(false);
  const [error, setError] = useState<string>("");
  const [mode, setMode] = useState<"camera" | "url-param">("camera");
  const [scannerActive, setScannerActive] = useState(false);

  const { data: event } = useEventById(ticketData?.eventId || "");

  // ─── shared verify logic ──────────────────────────────────────────────────

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

  // ─── camera scan callback ─────────────────────────────────────────────────

  const handleVerifyInvite = async (inviteToken: string) => {
    try {
      setError("");
      setInviteVerifying(true);
      const resp = await verifyInvite(inviteToken);
      setInviteVerification(resp);
      if (resp.status === "VALID") {
        toast.success(resp.message);
      } else {
        toast.error(resp.message);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to verify invite.";
      setError(msg);
      toast.error(msg);
    } finally {
      setInviteVerifying(false);
    }
  };

  const handleCameraScan = (rawText: string) => {
    setScannerActive(false);
    // QR codes encode the full verification URL — extract ?data= (ticket)
    // or ?i= (invite). If neither parses, fall back to treating the raw
    // text as a ticket data string.
    try {
      const url = new URL(rawText);
      const inviteToken = url.searchParams.get("i");
      if (inviteToken) {
        handleVerifyInvite(inviteToken);
        return;
      }
      const dataParam = url.searchParams.get("data");
      if (dataParam) {
        handleVerify(dataParam);
        return;
      }
    } catch {
      // rawText is not a URL — treat it as the raw data string
    }
    handleVerify(rawText);
  };

  // ─── scan-next reset ──────────────────────────────────────────────────────

  const handleScanNext = () => {
    setVerification(null);
    setTicketData(null);
    setInviteVerification(null);
    setError("");
    setMode("camera");
    setScannerActive(true);
  };

  // ─── URL-param mode on mount ──────────────────────────────────────────────

  useEffect(() => {
    const inviteToken = searchParams.get("i");
    if (inviteToken) {
      setMode("url-param");
      setScannerActive(false);
      handleVerifyInvite(inviteToken);
      return;
    }
    const dataParam = searchParams.get("data");
    if (dataParam) {
      setMode("url-param");
      setScannerActive(false);
      handleVerify(dataParam);
    } else {
      setMode("camera");
      setScannerActive(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const ticket = verification?.ticket;

  // ─── render: invite verification result ───────────────────────────────────

  if (inviteVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1E88E5] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Verifying invite...
          </h2>
        </div>
      </div>
    );
  }

  if (inviteVerification) {
    const isOk = inviteVerification.status === "VALID";
    const isUsed = inviteVerification.status === "ALREADY_USED";
    const isPending =
      inviteVerification.status === "NOT_STARTED" ||
      inviteVerification.status === "EVENT_PASSED";

    const formatRelativeCheckin = (iso: string) => {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return iso;
      const time = d.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
      const startOfDay = (dt: Date) =>
        new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()).getTime();
      const today = startOfDay(new Date());
      const that = startOfDay(d);
      const diffDays = Math.round((today - that) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return `Today at ${time}`;
      if (diffDays === 1) return `Yesterday at ${time}`;
      if (diffDays === -1) return `Tomorrow at ${time}`;
      const datePart = d.toLocaleDateString([], {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      return `${datePart} at ${time}`;
    };

    const checkInLabel = inviteVerification.usedAt
      ? formatRelativeCheckin(inviteVerification.usedAt)
      : null;
    const formatEventDay = (iso: string) => {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return iso;
      return d.toLocaleDateString([], {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    };

    const headlineSubtitle = isOk
      ? checkInLabel
        ? `Checked in ${checkInLabel}`
        : "Checked in"
      : isUsed
        ? checkInLabel
          ? `Already checked in ${checkInLabel}`
          : "This invite was already checked in."
        : inviteVerification.status === "NOT_STARTED"
          ? `Check-in isn't open yet — the event is on ${formatEventDay(
              inviteVerification.event.date,
            )}.`
          : inviteVerification.status === "EVENT_PASSED"
            ? `Check-in is closed — the event ended on ${formatEventDay(
                inviteVerification.event.date,
              )}.`
            : inviteVerification.message;
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="container mx-auto max-w-md py-8">
          <Card
            className={`bg-white shadow-lg rounded-xl ${
              isOk
                ? "border-green-200"
                : isUsed || isPending
                  ? "border-amber-200"
                  : "border-red-200"
            }`}
          >
            <CardHeader className="text-center">
              {isOk ? (
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              ) : isUsed || isPending ? (
                <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              )}
              <CardTitle
                className={
                  isOk
                    ? "text-green-600"
                    : isUsed || isPending
                      ? "text-amber-600"
                      : "text-red-600"
                }
              >
                {isOk
                  ? "Invite checked in ✓"
                  : isUsed
                    ? "Already checked in"
                    : inviteVerification.status === "NOT_STARTED"
                      ? "Not the event day yet"
                      : inviteVerification.status === "EVENT_PASSED"
                        ? "Event has ended"
                        : "Invite invalid"}
              </CardTitle>
              <p className="text-gray-600 mt-2">{headlineSubtitle}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Guest</span>
                  <span className="text-gray-900 font-medium">
                    {inviteVerification.invite.name || "—"}
                  </span>
                </div>
                {inviteVerification.invite.email && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email</span>
                    <span className="text-gray-900">
                      {inviteVerification.invite.email}
                    </span>
                  </div>
                )}
                {inviteVerification.invite.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone</span>
                    <span className="text-gray-900">
                      {inviteVerification.invite.phone}
                    </span>
                  </div>
                )}
                {inviteVerification.invite.ticketCategoryName && (
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-600">Category</span>
                    <span className="text-right font-semibold text-indigo-600 break-words">
                      {inviteVerification.invite.ticketCategoryName}
                    </span>
                  </div>
                )}
                {!!inviteVerification.invite.admitsCount &&
                  inviteVerification.invite.admitsCount > 1 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Admits</span>
                      <span className="text-gray-900 font-medium">
                        {inviteVerification.invite.admitsCount}
                      </span>
                    </div>
                  )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Event</span>
                  <span className="text-gray-900 font-medium">
                    {inviteVerification.event.name}
                  </span>
                </div>
                {checkInLabel && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Checked in</span>
                    <span className="text-gray-900">{checkInLabel}</span>
                  </div>
                )}
              </div>
              <Button
                className="w-full bg-[#1E88E5] hover:bg-blue-500 text-white"
                onClick={handleScanNext}
              >
                Scan next
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ─── render: verifying spinner ────────────────────────────────────────────

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

  // ─── render: camera viewfinder ────────────────────────────────────────────

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

  // ─── render: error / invalid data ────────────────────────────────────────

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

  // ─── render: verification result card ────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-2xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card
            className={`bg-white shadow-lg rounded-xl ${
              verification?.isValid ? "border-green-200" : "border-red-200"
            }`}
          >
            <CardHeader className="text-center">
              {verification?.isValid ? (
                <>
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <CardTitle className="text-green-600">
                    Ticket Valid ✓
                  </CardTitle>
                  <p className="text-gray-600">
                    {verification.message ||
                      "This ticket has been successfully verified"}
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <CardTitle className="text-red-600">
                    Invalid Ticket ✗
                  </CardTitle>
                  <p className="text-gray-600">
                    {verification?.message ||
                      "This ticket could not be verified"}
                  </p>
                </>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Verification Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-gray-500" />
                  Verification Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Ticket Code:</span>
                    <p className="font-mono text-gray-900">
                      {ticketData.code || ticket?.code || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Event ID:</span>
                    <p className="font-mono text-gray-900">
                      {ticketData.eventId}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Scanned At:</span>
                    <p className="text-gray-900">
                      {verification?.scannedAt
                        ? new Date(verification.scannedAt).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <Badge
                      variant={
                        verification?.isValid ? "default" : "destructive"
                      }
                    >
                      {verification?.isValid ? "Valid" : "Invalid"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              {event && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">
                    Event Information
                  </h3>
                  <div className="flex items-start space-x-4">
                    <img
                      src={event.bannerUrl || "/placeholder.svg"}
                      alt={event.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1 space-y-2">
                      <h4 className="font-semibold text-lg text-gray-900">
                        {event.name}
                      </h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{formatDate(new Date(event.date))}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Ticket Details */}
              {ticket && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Ticket className="h-4 w-4 mr-2 text-gray-500" />
                    Ticket Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Category:</span>
                      <p className="font-semibold text-gray-900">
                        {ticket.ticketCategory?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Category Price:</span>
                      <p className="font-semibold text-gray-900">
                        {ticket.ticketCategory?.price
                          ? `${formatPrice(ticket.ticketCategory.price)}`
                          : "Free"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Ticket Status:</span>
                      <Badge
                        variant={
                          ticket.isUsed
                            ? "secondary"
                            : ticket.isListed
                            ? "destructive"
                            : "default"
                        }
                      >
                        {ticket.isUsed
                          ? "Used"
                          : ticket.isListed
                          ? "Listed for Resale"
                          : "Active"}
                      </Badge>
                    </div>
                    {ticket.isListed && ticket.resalePrice && (
                      <div>
                        <span className="text-gray-600">Listed for:</span>
                        <p className="font-semibold text-orange-600">
                          ₦{formatPrice(ticket.resalePrice)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

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

              {/* Security Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-[#1E88E5] mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Security Notice</p>
                    <p>
                      This verification was performed at{" "}
                      {new Date().toLocaleString("en-US", {
                        timeZone: "Africa/Lagos",
                      })}
                      . Each ticket can only be used once for entry.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

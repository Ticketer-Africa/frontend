"use client";

import { useState, useEffect } from "react";
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
import { useUser } from "@/lib/auth-context";
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
  const { user } = useUser();
  const { mutateAsync: verifyTicket, isPending: isVerifying } =
    useVerifyTicket();

  const [verification, setVerification] = useState<TicketVerification | null>(
    null
  );
  const [ticketData, setTicketData] = useState<QRTicketData | null>(null);
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

  const handleCameraScan = (rawText: string) => {
    setScannerActive(false);
    try {
      const url = new URL(rawText);
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
    setError("");
    setMode("camera");
    setScannerActive(true);
  };

  // ─── URL-param mode on mount ──────────────────────────────────────────────

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const ticket = verification?.ticket;

  // ─── render: verifying spinner ────────────────────────────────────────────

  if (isVerifying) {
    return (
      <div
        className="home-theme min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--home-bg)" }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{
              borderColor: "var(--home-accent)",
              borderTopColor: "transparent",
            }}
          />
          <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--home-text)" }}>
            Verifying Ticket...
          </h2>
          <p style={{ color: "var(--home-muted)" }}>
            Please wait while we validate your ticket
          </p>
        </div>
      </div>
    );
  }

  // ─── render: camera viewfinder ────────────────────────────────────────────

  if (mode === "camera" && !verification && !error) {
    return (
      <div
        className="home-theme min-h-screen px-4 pb-4 pt-16"
        style={{ backgroundColor: "var(--home-bg)" }}
      >
        <div className="container mx-auto max-w-md py-8 space-y-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--home-text)" }}>
              Scan Ticket
            </h1>
            <p className="text-sm" style={{ color: "var(--home-muted)" }}>
              Point the camera at a ticket QR code
            </p>
          </div>
          <div
            className="p-3 border shadow-xl"
            style={{
              backgroundColor: "var(--home-card)",
              borderColor: "var(--home-border)",
              borderRadius: "var(--home-radius-card-lg)",
            }}
          >
            <QRCameraScanner onScan={handleCameraScan} active={scannerActive} />
          </div>
          <div className="text-center">
            <button
              onClick={() => {
                setScannerActive(false);
                setMode("url-param");
              }}
              className="text-sm underline"
              style={{ color: "var(--home-text-highlight)" }}
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
      <div
        className="home-theme min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: "var(--home-bg)" }}
      >
        <div className="max-w-md w-full">
          <Card
            className="shadow-xl border"
            style={{
              backgroundColor: "var(--home-card)",
              borderColor: "rgba(248, 113, 113, 0.45)",
              borderRadius: "var(--home-radius-card-lg)",
            }}
          >
            <CardHeader className="text-center">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-red-600">
                Verification Failed
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p style={{ color: "var(--home-muted)" }}>{error || "Invalid ticket data"}</p>
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  className="bg-transparent hover:bg-[var(--home-card-elevated)] hover:text-[var(--home-text-highlight)]"
                  style={{ borderColor: "var(--home-border-strong)", color: "var(--home-text)" }}
                  onClick={handleScanNext}
                >
                  Scan Another Ticket
                </Button>
                <Button
                  variant="outline"
                  className="bg-transparent hover:bg-[var(--home-card-elevated)] hover:text-[var(--home-text-highlight)]"
                  style={{ borderColor: "var(--home-border-strong)", color: "var(--home-text)" }}
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ─── render: verification result card ────────────────────────────────────

  return (
    <div
      className="home-theme min-h-screen px-4 pb-4 pt-16"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <div className="container mx-auto max-w-2xl py-8">
        <div>
          <Card
            className="shadow-xl border"
            style={{
              backgroundColor: "var(--home-card)",
              borderColor: verification?.isValid
                ? "var(--home-success)"
                : "rgba(248, 113, 113, 0.45)",
              borderRadius: "var(--home-radius-card-lg)",
            }}
          >
            <CardHeader className="text-center">
              {verification?.isValid ? (
                <>
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <CardTitle className="text-green-600">
                    Ticket Valid ✓
                  </CardTitle>
                  <p style={{ color: "var(--home-muted)" }}>
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
                  <p style={{ color: "var(--home-muted)" }}>
                    {verification?.message ||
                      "This ticket could not be verified"}
                  </p>
                </>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Verification Details */}
              <div
                className="rounded-xl p-4 border"
                style={{
                  backgroundColor: "var(--home-card-elevated)",
                  borderColor: "var(--home-border-subtle)",
                }}
              >
                <h3 className="font-semibold mb-3 flex items-center" style={{ color: "var(--home-text)" }}>
                  <AlertCircle className="h-4 w-4 mr-2" style={{ color: "var(--home-muted)" }} />
                  Verification Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span style={{ color: "var(--home-muted)" }}>Ticket Code:</span>
                    <p className="font-mono" style={{ color: "var(--home-text)" }}>
                      {ticketData.code || ticket?.code || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span style={{ color: "var(--home-muted)" }}>Event ID:</span>
                    <p className="font-mono" style={{ color: "var(--home-text)" }}>
                      {ticketData.eventId}
                    </p>
                  </div>
                  <div>
                    <span style={{ color: "var(--home-muted)" }}>Scanned At:</span>
                    <p style={{ color: "var(--home-text)" }}>
                      {verification?.scannedAt
                        ? new Date(verification.scannedAt).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <span style={{ color: "var(--home-muted)" }}>Status:</span>
                    <Badge
                      variant={
                        verification?.isValid ? "default" : "destructive"
                      }
                      className={
                        verification?.isValid
                          ? "bg-[var(--home-success)] text-[var(--home-success-fg)] hover:bg-[var(--home-success)]"
                          : ""
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
                  <h3 className="font-semibold" style={{ color: "var(--home-text)" }}>
                    Event Information
                  </h3>
                  <div className="flex items-start space-x-4">
                    <img
                      src={event.bannerUrl || "/placeholder.svg"}
                      alt={event.name}
                      className="w-20 h-20 rounded-xl object-cover border"
                      style={{ borderColor: "var(--home-border)" }}
                    />
                    <div className="flex-1 space-y-2">
                      <h4 className="font-semibold text-lg" style={{ color: "var(--home-text)" }}>
                        {event.name}
                      </h4>
                      <div className="space-y-1 text-sm" style={{ color: "var(--home-muted)" }}>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" style={{ color: "var(--home-accent)" }} />
                          <span>{formatDate(new Date(event.date))}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" style={{ color: "var(--home-accent)" }} />
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
                  <h3 className="font-semibold flex items-center" style={{ color: "var(--home-text)" }}>
                    <Ticket className="h-4 w-4 mr-2" style={{ color: "var(--home-accent)" }} />
                    Ticket Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span style={{ color: "var(--home-muted)" }}>Category:</span>
                      <p className="font-semibold" style={{ color: "var(--home-text)" }}>
                        {ticket.ticketCategory?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span style={{ color: "var(--home-muted)" }}>Category Price:</span>
                      <p className="font-semibold" style={{ color: "var(--home-text)" }}>
                        {ticket.ticketCategory?.price
                          ? `${formatPrice(ticket.ticketCategory.price)}`
                          : "Free"}
                      </p>
                    </div>
                    <div>
                      <span style={{ color: "var(--home-muted)" }}>Ticket Status:</span>
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
                        <span style={{ color: "var(--home-muted)" }}>Listed for:</span>
                        <p className="font-semibold" style={{ color: "var(--home-text-highlight)" }}>
                          ₦{formatPrice(ticket.resalePrice)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-4 border-t" style={{ borderColor: "var(--home-border)" }}>
                <Button
                  className="flex-1 px-6 shadow-lg transition-[background-color,color,border-color,opacity,transform] duration-150 hover:brightness-110"
                  style={{
                    backgroundColor: "var(--home-accent)",
                    color: "var(--home-accent-fg)",
                    borderRadius: "var(--home-radius-card)",
                  }}
                  onClick={handleScanNext}
                >
                  Scan Next Ticket
                </Button>
                {verification?.isValid && user?.role === "ORGANIZER" && (
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent hover:bg-[var(--home-card-elevated)] hover:text-[var(--home-text-highlight)]"
                    style={{ borderColor: "var(--home-border-strong)", color: "var(--home-text)" }}
                    onClick={() => window.print()}
                  >
                    Print Verification
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent hover:bg-[var(--home-card-elevated)] hover:text-[var(--home-text-highlight)]"
                  style={{ borderColor: "var(--home-border-strong)", color: "var(--home-text)" }}
                  onClick={() => (window.location.href = "/")}
                >
                  Close
                </Button>
              </div>

              {/* Security Notice */}
              <div
                className="border rounded-xl p-3"
                style={{
                  backgroundColor: "var(--home-card-highlight)",
                  borderColor: "var(--home-border)",
                }}
              >
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 mt-0.5" style={{ color: "var(--home-accent)" }} />
                  <div className="text-sm" style={{ color: "var(--home-muted)" }}>
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
        </div>
      </div>
    </div>
  );
}

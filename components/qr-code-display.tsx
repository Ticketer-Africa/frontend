"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Download, Share2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { generateTicketQR, generateVerificationCode, type QRTicketData } from "@/lib/qr-utils"
import type { Ticket } from "@/types/tickets.type"

interface QRCodeDisplayProps {
  ticket: Ticket
  userId: string
  showControls?: boolean
}

export function QRCodeDisplay({ ticket, userId, showControls = true }: QRCodeDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [showQR, setShowQR] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const generateQR = async () => {
      try {
        setIsLoading(true)
        setError("")

        // Create ticket data for QR code
        const ticketData: QRTicketData = {
          ticketId: ticket.id,
          eventId: ticket.eventId,
          userId: userId,
          verificationCode: ticket.code || generateVerificationCode(ticket.id, ticket.eventId, userId),
          timestamp: Date.now(),
        }

        const qrUrl = await generateTicketQR(ticketData)
        setQrCodeUrl(qrUrl)
      } catch (err) {
        setError("Failed to generate QR code")
        console.error("QR generation error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    generateQR()
  }, [ticket, userId])

  const handleDownload = () => {
    if (!qrCodeUrl) return

    const link = document.createElement("a")
    link.download = `ticket-${ticket.id}-qr.png`
    link.href = qrCodeUrl
    link.click()
  }

  const handleShare = async () => {
    if (!qrCodeUrl) return

    try {
      // Convert data URL to blob
      const response = await fetch(qrCodeUrl)
      const blob = await response.blob()
      const file = new File([blob], `ticket-${ticket.id}-qr.png`, { type: "image/png" })

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Ticket QR Code - ${ticket.event.name}`,
          text: `QR Code for ${ticket.event.name}`,
          files: [file],
        })
      } else {
        // Fallback: copy to clipboard or download
        handleDownload()
      }
    } catch (error) {
      console.error("Error sharing QR code:", error)
      handleDownload()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-48 h-48 bg-muted rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-48 h-48 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground text-center">{error}</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="relative">
        {showQR ? (
          <div className="bg-white p-4 rounded-lg border-2 border-dashed border-muted-foreground/25">
            <img
              src={qrCodeUrl || "/placeholder.svg"}
              alt={`QR Code for ${ticket.event.name}`}
              className="w-full h-auto max-w-[200px] mx-auto"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center w-48 h-48 bg-muted rounded-lg">
            <div className="text-center">
              <EyeOff className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">QR Code Hidden</p>
            </div>
          </div>
        )}
      </div>

      {showControls && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Verification Code:</span>
            <code className="text-sm bg-muted px-2 py-1 rounded">{ticket.code || "GENERATING..."}</code>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => setShowQR(!showQR)} className="flex-1 bg-transparent">
              {showQR ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showQR ? "Hide" : "Show"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!qrCodeUrl}
              className="bg-transparent"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare} disabled={!qrCodeUrl} className="bg-transparent">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            <p>Present this QR code at the event entrance</p>
            <p>Valid for: {ticket.event.name}</p>
          </div>
        </div>
      )}
    </motion.div>
  )
}

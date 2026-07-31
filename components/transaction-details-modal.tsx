"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate } from "@/lib/helpers";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar01Icon, Ticket01Icon } from "@hugeicons/core-free-icons";

interface Transaction {
  id: string;
  reference: string;
  type: "PURCHASE" | "RESALE" | "WITHDRAW";
  amount: number;
  status: "SUCCESS" | "PENDING" | "FAILED";
  createdAt: string;
  buyer: { id: string; name: string; email: string } | null;
  event: { id: string; name: string } | null;
  tickets: { id: string; code: string; event: { id: string; name: string } }[];
}

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export function TransactionDetailsModal({
  isOpen,
  onClose,
  transaction,
}: TransactionDetailsModalProps) {
  if (!transaction) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transaction Details"
      className="max-w-lg bg-background shadow-lg rounded-xl"
    >
      <div className="space-y-6">
        {/* Transaction Info */}
        <div>
          <h3 className="font-semibold text-lg text-foreground mb-2">
            Transaction Info
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Type:</span>
              <p className="font-medium text-foreground capitalize">
                {transaction.type.toLowerCase()}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Reference:</span>
              <p className="font-mono text-foreground">{transaction.reference}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Amount:</span>
              <p
                className={`font-semibold ${
                  transaction.type === "RESALE"
                    ? "text-green-400"
                    : "text-foreground"
                }`}
              >
                {transaction.type === "RESALE" ? "+" : "+"}
                {formatPrice(Math.abs(transaction.amount))}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>
              <p className="font-medium text-foreground">{transaction.status}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Date:</span>
              <p className="text-foreground">
                {formatDate(transaction.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Buyer Info */}
        {transaction.buyer && (
          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">
              Buyer Info
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <p className="text-foreground">{transaction.buyer.name}</p>
              </div>
            </div>
          </div>
        )}

        {/* Event Info */}
        {transaction.event && (
          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">
              Event Info
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4" />
                <span>{transaction.event.name}</span>
              </div>
            </div>
          </div>
        )}

        {/* Ticket Info */}
        {transaction.tickets.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">
              Tickets
            </h3>
            <div className="space-y-2">
              {transaction.tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center space-x-2 text-sm text-muted-foreground"
                >
                  <HugeiconsIcon icon={Ticket01Icon} className="h-4 w-4" />
                  <span>
                    {ticket.code} - {ticket.event.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          <Button
            variant="outline"
            className="w-full bg-transparent border-border hover:bg-accent text-foreground"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

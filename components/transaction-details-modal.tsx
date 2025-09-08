"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Calendar, Ticket } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/helpers";

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
      className="max-w-lg bg-white shadow-lg rounded-xl"
    >
      <div className="space-y-6">
        {/* Transaction Info */}
        <div>
          <h3 className="font-semibold text-lg text-gray-900 mb-2">
            Transaction Info
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Type:</span>
              <p className="font-medium text-gray-900 capitalize">
                {transaction.type.toLowerCase()}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Reference:</span>
              <p className="font-mono text-gray-900">{transaction.reference}</p>
            </div>
            <div>
              <span className="text-gray-600">Amount:</span>
              <p
                className={`font-semibold ${
                  transaction.type === "RESALE"
                    ? "text-green-600"
                    : "text-black"
                }`}
              >
                {transaction.type === "RESALE" ? "+" : "+"}
                {formatPrice(Math.abs(transaction.amount))}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <p className="font-medium text-gray-900">{transaction.status}</p>
            </div>
            <div>
              <span className="text-gray-600">Date:</span>
              <p className="text-gray-900">
                {formatDate(transaction.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Buyer Info */}
        {transaction.buyer && (
          <div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">
              Buyer Info
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <p className="text-gray-900">{transaction.buyer.name}</p>
              </div>
            </div>
          </div>
        )}

        {/* Event Info */}
        {transaction.event && (
          <div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">
              Event Info
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{transaction.event.name}</span>
              </div>
            </div>
          </div>
        )}

        {/* Ticket Info */}
        {transaction.tickets.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">
              Tickets
            </h3>
            <div className="space-y-2">
              {transaction.tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center space-x-2 text-sm text-gray-600"
                >
                  <Ticket className="h-4 w-4" />
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
            className="w-full bg-transparent border-gray-300 hover:bg-gray-100 text-gray-900"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

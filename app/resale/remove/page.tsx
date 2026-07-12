"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRemoveResaleTicket } from "@/services/tickets/tickets.queries";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const guestRemoveSchema = z.object({
  ticketCode: z.string().trim().min(1, "Ticket code is required"),
  email: z.string().trim().email("Enter a valid purchase email"),
});

type GuestRemoveFormData = z.infer<typeof guestRemoveSchema>;

export default function GuestResaleRemovePage() {
  const { mutateAsync: removeResale, isPending } = useRemoveResaleTicket();
  const { register, handleSubmit, formState: { errors } } = useForm<GuestRemoveFormData>({
    resolver: zodResolver(guestRemoveSchema),
  });

  const onSubmit = async (data: GuestRemoveFormData) => {
    try {
      await removeResale({
        ticketCode: data.ticketCode.trim(),
        email: data.email.trim().toLowerCase(),
      });
    } catch {}
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <section className="mx-auto max-w-xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Remove a resale listing</h1>
          <p className="mt-2 text-sm text-gray-600">
            No login needed. Enter the ticket code and purchase email used for the ticket.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Ticket code</label>
            <Input {...register("ticketCode")} placeholder="TCK-ABC123" disabled={isPending} />
            {errors.ticketCode && <p className="text-xs text-red-600">{errors.ticketCode.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Purchase email</label>
            <Input {...register("email")} type="email" placeholder="owner@example.com" disabled={isPending} />
            {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
          </div>
          <Button type="submit" className="w-full bg-[#1E88E5] text-white hover:bg-blue-600" disabled={isPending}>
            {isPending ? "Removing listing..." : "Remove listing"}
          </Button>
        </form>
      </section>
    </main>
  );
}

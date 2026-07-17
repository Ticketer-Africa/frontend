"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HomeCard } from "@/components/home/home-card";
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
    <main
      className="home-theme min-h-screen px-4 py-10 pt-24"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <section className="mx-auto max-w-xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold" style={{ color: "var(--home-text)" }}>
            Remove a resale listing
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--home-muted)" }}>
            No login needed. Enter the ticket code and purchase email used for the ticket.
          </p>
        </div>
        <HomeCard tone="card" className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--home-text)" }}>
                Ticket code
              </label>
              <Input
                {...register("ticketCode")}
                placeholder="TCK-ABC123"
                disabled={isPending}
                style={{
                  backgroundColor: "var(--home-bg)",
                  borderColor: "var(--home-border-strong)",
                  color: "var(--home-text)",
                }}
              />
              {errors.ticketCode && (
                <p className="text-xs text-red-400">{errors.ticketCode.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--home-text)" }}>
                Purchase email
              </label>
              <Input
                {...register("email")}
                type="email"
                placeholder="owner@example.com"
                disabled={isPending}
                style={{
                  backgroundColor: "var(--home-bg)",
                  borderColor: "var(--home-border-strong)",
                  color: "var(--home-text)",
                }}
              />
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>
            <Button type="submit" variant="homeAccent" className="w-full" disabled={isPending}>
              {isPending ? "Removing listing..." : "Remove listing"}
            </Button>
          </form>
        </HomeCard>
      </section>
    </main>
  );
}

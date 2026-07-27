"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon, Sent02Icon, Tag01Icon } from "@hugeicons/core-free-icons";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { useToast } from "@/hooks/use-toast";
import {
  useListDiscounts,
  useCreateDiscount,
} from "@/services/discounts/discounts.queries";
import { useSendMessage } from "@/services/messages/messages.queries";

interface EventManagementTabsProps {
  eventId: string;
}

export default function EventManagementTabs({ eventId }: EventManagementTabsProps) {
  const { toast } = useToast();

  // ── Discounts state ──────────────────────────────────────────
  const { data: discounts, isLoading: discountsLoading } =
    useListDiscounts(eventId);
  const { mutate: createDiscount, isPending: creatingDiscount } =
    useCreateDiscount(eventId);
  const [discountForm, setDiscountForm] = useState({
    code: "",
    type: "PERCENT" as "PERCENT" | "FLAT",
    value: "",
    usageLimit: "",
  });

  const handleCreateDiscount = () => {
    if (!discountForm.code || !discountForm.value) return;
    const { code } = discountForm;
    createDiscount(
      {
        code: discountForm.code,
        type: discountForm.type,
        value: Number(discountForm.value),
        usageLimit: discountForm.usageLimit
          ? Number(discountForm.usageLimit)
          : undefined,
      },
      {
        onSuccess: () => {
          setDiscountForm({ code: "", type: "PERCENT", value: "", usageLimit: "" });
          toast({ title: "Discount created", description: `Code "${code}" added.` });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to create discount code.", variant: "destructive" });
        },
      },
    );
  };

  // ── Messaging state ──────────────────────────────────────────
  const { mutate: sendMessage, isPending: sendingMessage } =
    useSendMessage(eventId);
  const [messageForm, setMessageForm] = useState({
    subject: "",
    body: "",
    scheduledFor: "",
  });

  const handleSendMessage = () => {
    if (!messageForm.subject || !messageForm.body) return;
    sendMessage(
      {
        subject: messageForm.subject,
        body: messageForm.body,
        scheduledFor: messageForm.scheduledFor
          ? new Date(messageForm.scheduledFor).toISOString()
          : undefined,
      },
      {
        onSuccess: () => {
          setMessageForm({ subject: "", body: "", scheduledFor: "" });
          toast({ title: "Message sent", description: "Your message has been sent to all attendees." });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl">Event Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="discounts">
          <TabsList className="mb-6">
            <TabsTrigger value="discounts" className="flex items-center gap-1">
              <HugeiconsIcon icon={Tag01Icon} className="h-4 w-4" />
              Discount Codes
            </TabsTrigger>
            <TabsTrigger value="messaging" className="flex items-center gap-1">
              <HugeiconsIcon icon={Sent02Icon} className="h-4 w-4" />
              Messaging
            </TabsTrigger>
          </TabsList>

          {/* ── Discounts Tab ── */}
          <TabsContent value="discounts" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="space-y-1">
                <Label htmlFor="dc-code">Code</Label>
                <Input
                  id="dc-code"
                  placeholder="SUMMER20"
                  value={discountForm.code}
                  onChange={(e) =>
                    setDiscountForm((f) => ({ ...f, code: e.target.value }))
                  }
                  disabled={creatingDiscount}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dc-type">Type</Label>
                <Select
                  value={discountForm.type}
                  onValueChange={(v: "PERCENT" | "FLAT") =>
                    setDiscountForm((f) => ({ ...f, type: v }))
                  }
                  disabled={creatingDiscount}
                >
                  <SelectTrigger id="dc-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENT">Percent (%)</SelectItem>
                    <SelectItem value="FLAT">Flat (amount)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="dc-value">Value</Label>
                <Input
                  id="dc-value"
                  type="number"
                  min="0"
                  placeholder={discountForm.type === "PERCENT" ? "20" : "500"}
                  value={discountForm.value}
                  onChange={(e) =>
                    setDiscountForm((f) => ({ ...f, value: e.target.value }))
                  }
                  disabled={creatingDiscount}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dc-limit">Usage Limit (optional)</Label>
                <Input
                  id="dc-limit"
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  value={discountForm.usageLimit}
                  onChange={(e) =>
                    setDiscountForm((f) => ({
                      ...f,
                      usageLimit: e.target.value,
                    }))
                  }
                  disabled={creatingDiscount}
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-4">
                <Button
                  onClick={handleCreateDiscount}
                  disabled={
                    creatingDiscount ||
                    !discountForm.code ||
                    !discountForm.value
                  }
                  className="bg-[#1E88E5] hover:bg-blue-500 text-white"
                >
                  {creatingDiscount ? (
                    <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Create Discount Code
                </Button>
              </div>
            </div>

            {discountsLoading ? (
              <div className="flex justify-center py-8">
                <HugeiconsIcon icon={Loading03Icon} className="h-6 w-6 animate-spin text-[#1E88E5]" />
              </div>
            ) : discounts && discounts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-2 pr-4 font-medium">Code</th>
                      <th className="text-left py-2 pr-4 font-medium">Type</th>
                      <th className="text-left py-2 pr-4 font-medium">Value</th>
                      <th className="text-left py-2 pr-4 font-medium">Limit</th>
                      <th className="text-left py-2 font-medium">Used</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discounts.map((d) => (
                      <tr key={d.id} className="border-b last:border-0">
                        <td className="py-2 pr-4 font-mono font-semibold">
                          {d.code}
                        </td>
                        <td className="py-2 pr-4">{d.type}</td>
                        <td className="py-2 pr-4">
                          {d.type === "PERCENT" ? `${d.value}%` : `${d.value}`}
                        </td>
                        <td className="py-2 pr-4">
                          {d.usageLimit ?? "Unlimited"}
                        </td>
                        <td className="py-2">{d.usedCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No discount codes yet.
              </p>
            )}
          </TabsContent>

          {/* ── Messaging Tab ── */}
          <TabsContent value="messaging" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Send a broadcast message to all attendees who have purchased
              tickets.
            </p>
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <div className="space-y-1">
                <Label htmlFor="msg-subject">Subject</Label>
                <Input
                  id="msg-subject"
                  placeholder="Important update about the event"
                  value={messageForm.subject}
                  onChange={(e) =>
                    setMessageForm((f) => ({ ...f, subject: e.target.value }))
                  }
                  disabled={sendingMessage}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="msg-body">Message</Label>
                <Textarea
                  id="msg-body"
                  placeholder="Write your message here..."
                  rows={5}
                  value={messageForm.body}
                  onChange={(e) =>
                    setMessageForm((f) => ({ ...f, body: e.target.value }))
                  }
                  disabled={sendingMessage}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="msg-schedule">
                  Schedule For (optional)
                </Label>
                <DateTimePicker
                  value={messageForm.scheduledFor}
                  onChange={(val) =>
                    setMessageForm((f) => ({ ...f, scheduledFor: val }))
                  }
                  disabled={sendingMessage}
                  placeholder="Schedule for later (optional)"
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={
                  sendingMessage ||
                  !messageForm.subject ||
                  !messageForm.body
                }
                className="bg-[#1E88E5] hover:bg-blue-500 text-white"
              >
                {sendingMessage ? (
                  <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <HugeiconsIcon icon={Sent02Icon} className="h-4 w-4 mr-2" />
                )}
                {messageForm.scheduledFor ? "Schedule Message" : "Send Now"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

    </Card>
  );
}

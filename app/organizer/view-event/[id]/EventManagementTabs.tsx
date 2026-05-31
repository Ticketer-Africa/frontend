"use client";

import { useState } from "react";
import {
  Loader2,
  Copy,
  Check,
  RefreshCw,
  Send,
  Trash2,
  Link,
  Tag,
  Mail,
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  useListDiscounts,
  useCreateDiscount,
} from "@/services/discounts/discounts.queries";
import {
  useListInvites,
  useShareableLink,
  useAddInvitee,
  useResendInvite,
  useRegenerateToken,
  useRemoveInvitee,
  useGenerateShareableLink,
  useRevokeShareableLink,
} from "@/services/invites/invites.queries";
import { useSendMessage } from "@/services/messages/messages.queries";

interface EventManagementTabsProps {
  eventId: string;
  accessType: "PUBLIC" | "INVITE_ONLY";
  eventSlug: string;
}

export default function EventManagementTabs({
  eventId,
  accessType,
  eventSlug,
}: EventManagementTabsProps) {
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
          toast({ title: "Discount created", description: `Code "${discountForm.code}" added.` });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to create discount code.", variant: "destructive" });
        },
      },
    );
  };

  // ── Invites state ────────────────────────────────────────────
  const { data: invites, isLoading: invitesLoading } = useListInvites(eventId);
  const { data: shareableLink, isLoading: linkLoading } =
    useShareableLink(eventId);
  const { mutate: addInvitee, isPending: addingInvitee } =
    useAddInvitee(eventId);
  const { mutate: resendInvite, isPending: resendingInvite } =
    useResendInvite(eventId);
  const { mutate: regenerateToken } = useRegenerateToken(eventId);
  const { mutate: removeInvitee } = useRemoveInvitee(eventId);
  const { mutate: generateLink, isPending: generatingLink } =
    useGenerateShareableLink(eventId);
  const { mutate: revokeLink, isPending: revokingLink } =
    useRevokeShareableLink(eventId);
  const [inviteForm, setInviteForm] = useState({ email: "", name: "" });
  const [copiedLink, setCopiedLink] = useState(false);

  const handleAddInvitee = () => {
    if (!inviteForm.email || !inviteForm.name) return;
    addInvitee(inviteForm, {
      onSuccess: () => {
        setInviteForm({ email: "", name: "" });
        toast({ title: "Invite sent", description: `Invite sent to ${inviteForm.email}.` });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to send invite.", variant: "destructive" });
      },
    });
  };

  const handleCopyLink = async (token: string) => {
    const url = `${window.location.origin}/invite/shareable?s=${token}&eventSlug=${eventSlug}`;
    await navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast({ title: "Copied!", description: "Shareable link copied to clipboard." });
    setTimeout(() => setCopiedLink(false), 2000);
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
        scheduledFor: messageForm.scheduledFor || undefined,
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
              <Tag className="h-4 w-4" />
              Discount Codes
            </TabsTrigger>
            {accessType === "INVITE_ONLY" && (
              <TabsTrigger value="invites" className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                Invites
              </TabsTrigger>
            )}
            <TabsTrigger value="messaging" className="flex items-center gap-1">
              <Send className="h-4 w-4" />
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
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Create Discount Code
                </Button>
              </div>
            </div>

            {discountsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[#1E88E5]" />
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

          {/* ── Invites Tab ── */}
          {accessType === "INVITE_ONLY" && (
            <TabsContent value="invites" className="space-y-8">
              {/* Individual invites */}
              <div className="space-y-4">
                <h3 className="font-semibold text-base">Individual Invites</h3>
                <div className="flex flex-col sm:flex-row gap-3 p-4 border rounded-lg bg-muted/30">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="inv-name">Name</Label>
                    <Input
                      id="inv-name"
                      placeholder="Jane Doe"
                      value={inviteForm.name}
                      onChange={(e) =>
                        setInviteForm((f) => ({ ...f, name: e.target.value }))
                      }
                      disabled={addingInvitee}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="inv-email">Email</Label>
                    <Input
                      id="inv-email"
                      type="email"
                      placeholder="jane@example.com"
                      value={inviteForm.email}
                      onChange={(e) =>
                        setInviteForm((f) => ({ ...f, email: e.target.value }))
                      }
                      disabled={addingInvitee}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleAddInvitee}
                      disabled={
                        addingInvitee ||
                        !inviteForm.email ||
                        !inviteForm.name
                      }
                      className="bg-[#1E88E5] hover:bg-blue-500 text-white w-full sm:w-auto"
                    >
                      {addingInvitee ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      Send Invite
                    </Button>
                  </div>
                </div>

                {invitesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[#1E88E5]" />
                  </div>
                ) : invites && invites.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-muted-foreground">
                          <th className="text-left py-2 pr-4 font-medium">Name</th>
                          <th className="text-left py-2 pr-4 font-medium">Email</th>
                          <th className="text-left py-2 pr-4 font-medium">Status</th>
                          <th className="text-left py-2 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invites.map((inv) => (
                          <tr key={inv.id} className="border-b last:border-0">
                            <td className="py-2 pr-4">{inv.name}</td>
                            <td className="py-2 pr-4">{inv.email}</td>
                            <td className="py-2 pr-4">
                              <span
                                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                  inv.status === "ACCEPTED"
                                    ? "bg-green-100 text-green-700"
                                    : inv.status === "REVOKED"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {inv.status}
                              </span>
                            </td>
                            <td className="py-2">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    resendInvite(inv.id, {
                                      onSuccess: () =>
                                        toast({
                                          title: "Invite resent",
                                          description: `Resent to ${inv.email}.`,
                                        }),
                                      onError: () =>
                                        toast({
                                          title: "Error",
                                          description: "Failed to resend invite.",
                                          variant: "destructive",
                                        }),
                                    })
                                  }
                                  disabled={resendingInvite}
                                >
                                  <Send className="h-3 w-3 mr-1" />
                                  Resend
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    regenerateToken(inv.id, {
                                      onSuccess: () =>
                                        toast({
                                          title: "Token regenerated",
                                          description: "A new invite link has been generated.",
                                        }),
                                      onError: () =>
                                        toast({
                                          title: "Error",
                                          description: "Failed to regenerate token.",
                                          variant: "destructive",
                                        }),
                                    })
                                  }
                                >
                                  <RefreshCw className="h-3 w-3 mr-1" />
                                  Regenerate
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:border-red-300"
                                  onClick={() =>
                                    removeInvitee(inv.id, {
                                      onSuccess: () =>
                                        toast({
                                          title: "Invitee removed",
                                          description: `${inv.name} has been removed.`,
                                        }),
                                      onError: () =>
                                        toast({
                                          title: "Error",
                                          description: "Failed to remove invitee.",
                                          variant: "destructive",
                                        }),
                                    })
                                  }
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Remove
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No invitees yet.
                  </p>
                )}
              </div>

              {/* Shareable link */}
              <div className="space-y-3 pt-4 border-t">
                <h3 className="font-semibold text-base">Shareable Invite Link</h3>
                {linkLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-[#1E88E5]" />
                  </div>
                ) : shareableLink?.token ? (
                  <div className="space-y-3">
                    <p className="text-sm break-all bg-muted px-3 py-2 rounded-md font-mono">
                      {`${typeof window !== "undefined" ? window.location.origin : ""}/invite/shareable?s=${shareableLink.token}&eventSlug=${eventSlug}`}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(shareableLink.token)}
                      >
                        {copiedLink ? (
                          <Check className="h-4 w-4 mr-2" />
                        ) : (
                          <Copy className="h-4 w-4 mr-2" />
                        )}
                        {copiedLink ? "Copied!" : "Copy Link"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                        onClick={() =>
                          revokeLink(undefined, {
                            onSuccess: () =>
                              toast({
                                title: "Link revoked",
                                description: "The shareable link has been disabled.",
                              }),
                            onError: () =>
                              toast({
                                title: "Error",
                                description: "Failed to revoke link.",
                                variant: "destructive",
                              }),
                          })
                        }
                        disabled={revokingLink}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Revoke
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Generate a single link that anyone can use to register for
                      this event.
                    </p>
                    <Button
                      onClick={() =>
                        generateLink(undefined, {
                          onSuccess: () =>
                            toast({
                              title: "Link generated",
                              description: "Your shareable invite link is ready.",
                            }),
                          onError: () =>
                            toast({
                              title: "Error",
                              description: "Failed to generate link.",
                              variant: "destructive",
                            }),
                        })
                      }
                      disabled={generatingLink}
                      className="bg-[#1E88E5] hover:bg-blue-500 text-white"
                    >
                      {generatingLink ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Link className="h-4 w-4 mr-2" />
                      )}
                      Generate Shareable Link
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          )}

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
                <Input
                  id="msg-schedule"
                  type="datetime-local"
                  value={messageForm.scheduledFor}
                  onChange={(e) =>
                    setMessageForm((f) => ({
                      ...f,
                      scheduledFor: e.target.value,
                    }))
                  }
                  disabled={sendingMessage}
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
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
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

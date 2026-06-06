"use client";

import { useEffect, useState } from "react";
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
  QrCode,
  Download,
  Phone,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getInviteQrBlob, type Invite } from "@/services/invites/invites";
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
import { DateTimePicker } from "@/components/ui/date-time-picker";
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
  const [inviteForm, setInviteForm] = useState<{
    name: string;
    contactMethod: "email" | "phone";
    email: string;
    phone: string;
  }>({ name: "", contactMethod: "email", email: "", phone: "" });
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrInvite, setQrInvite] = useState<Invite | null>(null);
  const [qrBlobUrl, setQrBlobUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [copiedInviteLink, setCopiedInviteLink] = useState(false);

  const inviteContactReady =
    inviteForm.contactMethod === "email"
      ? !!inviteForm.email
      : !!inviteForm.phone;

  const submitInvite = (mode: "GENERATE" | "SEND") => {
    if (!inviteForm.name || !inviteContactReady) return;
    const payload = {
      name: inviteForm.name,
      mode,
      ...(inviteForm.contactMethod === "email"
        ? { email: inviteForm.email }
        : { phone: inviteForm.phone }),
    };
    const label =
      inviteForm.contactMethod === "email"
        ? inviteForm.email
        : inviteForm.phone;
    addInvitee(payload, {
      onSuccess: (resp: any) => {
        setInviteForm({
          name: "",
          contactMethod: inviteForm.contactMethod,
          email: "",
          phone: "",
        });
        if (mode === "SEND") {
          toast({ title: "Invite sent", description: `Invite sent to ${label}.` });
        } else {
          toast({
            title: "Invite created",
            description: `Open the QR for ${label}.`,
          });
          // Auto-open QR modal for the freshly added invite (last item in `added`)
          const added = resp?.added?.[0];
          if (added?.id) {
            openQrFor({
              id: added.id,
              eventId,
              name: added.name ?? inviteForm.name,
              email: added.email,
              phone: added.phone,
              status: "PENDING",
              token: added.inviteToken ?? "",
              inviteLink: added.inviteLink,
            });
          }
        }
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to add invite.",
          variant: "destructive",
        });
      },
    });
  };

  const openQrFor = async (inv: Invite) => {
    setQrInvite(inv);
    setQrBlobUrl(null);
    setQrLoading(true);
    try {
      const blob = await getInviteQrBlob(eventId, inv.id);
      setQrBlobUrl(URL.createObjectURL(blob));
    } catch {
      toast({
        title: "Error",
        description: "Failed to load QR code.",
        variant: "destructive",
      });
    } finally {
      setQrLoading(false);
    }
  };

  const closeQr = () => {
    if (qrBlobUrl) URL.revokeObjectURL(qrBlobUrl);
    setQrBlobUrl(null);
    setQrInvite(null);
  };

  const downloadQr = () => {
    if (!qrBlobUrl || !qrInvite) return;
    const a = document.createElement("a");
    a.href = qrBlobUrl;
    a.download = `invite-${(qrInvite.name || "guest").replace(/\s+/g, "-").toLowerCase()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const copyInviteLink = async (link?: string) => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopiedInviteLink(true);
    toast({ title: "Copied!", description: "Invite link copied." });
    setTimeout(() => setCopiedInviteLink(false), 2000);
  };

  useEffect(() => {
    return () => {
      if (qrBlobUrl) URL.revokeObjectURL(qrBlobUrl);
    };
  }, [qrBlobUrl]);

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
                <p className="text-xs text-muted-foreground">
                  Add a guest by name and either email or phone. Choose{" "}
                  <strong>Generate Invite</strong> to get a QR card you can share
                  via WhatsApp, or <strong>Send Invite</strong> to email it.
                </p>
                <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
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
                    <div className="space-y-1">
                      <Label>Contact method</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={
                            inviteForm.contactMethod === "email"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            setInviteForm((f) => ({
                              ...f,
                              contactMethod: "email",
                            }))
                          }
                          className="flex-1"
                        >
                          <Mail className="h-3 w-3 mr-1" /> Email
                        </Button>
                        <Button
                          type="button"
                          variant={
                            inviteForm.contactMethod === "phone"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            setInviteForm((f) => ({
                              ...f,
                              contactMethod: "phone",
                            }))
                          }
                          className="flex-1"
                        >
                          <Phone className="h-3 w-3 mr-1" /> Phone
                        </Button>
                      </div>
                    </div>
                  </div>

                  {inviteForm.contactMethod === "email" ? (
                    <div className="space-y-1">
                      <Label htmlFor="inv-email">Email</Label>
                      <Input
                        id="inv-email"
                        type="email"
                        placeholder="jane@example.com"
                        value={inviteForm.email}
                        onChange={(e) =>
                          setInviteForm((f) => ({
                            ...f,
                            email: e.target.value,
                          }))
                        }
                        disabled={addingInvitee}
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Label htmlFor="inv-phone">Phone</Label>
                      <Input
                        id="inv-phone"
                        type="tel"
                        placeholder="+2348012345678"
                        value={inviteForm.phone}
                        onChange={(e) =>
                          setInviteForm((f) => ({
                            ...f,
                            phone: e.target.value,
                          }))
                        }
                        disabled={addingInvitee}
                      />
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => submitInvite("GENERATE")}
                      disabled={
                        addingInvitee || !inviteForm.name || !inviteContactReady
                      }
                      className="flex-1"
                    >
                      {addingInvitee ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <QrCode className="h-4 w-4 mr-2" />
                      )}
                      Generate Invite
                    </Button>
                    <Button
                      type="button"
                      onClick={() => submitInvite("SEND")}
                      disabled={
                        addingInvitee ||
                        !inviteForm.name ||
                        !inviteContactReady ||
                        inviteForm.contactMethod !== "email"
                      }
                      className="flex-1 bg-[#1E88E5] hover:bg-blue-500 text-white"
                      title={
                        inviteForm.contactMethod === "phone"
                          ? "Phone invites must be generated — there's no email to send to."
                          : undefined
                      }
                    >
                      {addingInvitee ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
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
                          <th className="text-left py-2 pr-4 font-medium">Contact</th>
                          <th className="text-left py-2 pr-4 font-medium">Status</th>
                          <th className="text-left py-2 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invites.map((inv) => (
                          <tr key={inv.id} className="border-b last:border-0">
                            <td className="py-2 pr-4">{inv.name}</td>
                            <td className="py-2 pr-4">
                              {inv.email || inv.phone || (
                                <span className="text-muted-foreground italic">
                                  —
                                </span>
                              )}
                            </td>
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
                              <div className="flex gap-2 flex-wrap">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openQrFor(inv)}
                                >
                                  <QrCode className="h-3 w-3 mr-1" />
                                  QR
                                </Button>
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
                                  disabled={resendingInvite || !inv.email}
                                  title={
                                    !inv.email
                                      ? "No email on file — share the QR instead"
                                      : undefined
                                  }
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

      <Dialog
        open={!!qrInvite}
        onOpenChange={(open) => {
          if (!open) closeQr();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite QR</DialogTitle>
            <DialogDescription>
              {qrInvite?.name
                ? `Share this with ${qrInvite.name}`
                : "Share this invite"}{" "}
              — they scan to claim their ticket.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-3">
            {qrLoading || !qrBlobUrl ? (
              <div className="h-72 w-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#1E88E5]" />
              </div>
            ) : (
              <img
                src={qrBlobUrl}
                alt="Invite QR card"
                className="w-full rounded-md border"
              />
            )}

            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button
                onClick={downloadQr}
                disabled={!qrBlobUrl}
                className="flex-1 bg-[#1E88E5] hover:bg-blue-500 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PNG
              </Button>
              <Button
                variant="outline"
                onClick={() => copyInviteLink(qrInvite?.inviteLink)}
                disabled={!qrInvite?.inviteLink}
                className="flex-1"
              >
                {copiedInviteLink ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copiedInviteLink ? "Copied!" : "Copy Invite Link"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Tip: download then share on WhatsApp.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

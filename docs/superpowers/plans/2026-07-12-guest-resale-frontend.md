# Guest Resale Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let ticket owners and resale buyers use resale as guests while preserving the current logged-in resale flows.

**Architecture:** Extend the existing ticket service/query layer with discriminated guest/logged-in payloads, payout account verification, and guest status lookup. Reuse the current logged-in listing modal, add focused public guest owner pages under `/resale/*`, and update the resale buyer modal so unauthenticated buyers can provide checkout contact details.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript strict mode, TanStack Query v5, axios, react-hook-form, zod, Tailwind/shadcn-style UI primitives, sonner toasts.

## Global Constraints

- Branch: `ticket-resale-guest-frontend`.
- API base path: v1.
- Listing minimum: `resalePrice >= 1200`.
- Guest owner proof: `ticketCode` and valid purchase `email`.
- Guest buyer proof: at least one `ticketIds` entry and valid `buyerEmail`; `buyerName` is optional.
- Verify payout account with `POST /v1/payment/resolve-account` before final list submission.
- Do not send `accountName` in list payloads; backend resolves it again.
- Mask verified account numbers in UI as `****6789`.
- Generic guest ticket/email mismatch copy: `Ticket not found or email does not match.`
- Throttle copy: `Too many attempts. Please wait a minute and try again.`
- Guest status pages must not show bank code, full account number, or payout account details.
- Existing logged-in list/remove/buy flows must keep using session-authenticated payloads.
- Verification commands: `npm run lint` and `npm run build`. This repo has no configured unit-test script.

---

## File Structure

- Modify `types/tickets.type.ts`: add reusable resale payload, account resolution, status, and buyer payload types.
- Modify `services/tickets/tickets.ts`: add `resolvePayoutAccount`, guest-compatible list/remove/buy payloads, and `getGuestResaleStatus`; normalize guest-safe error copy.
- Modify `services/tickets/tickets.queries.ts`: expose mutations/queries for the new service functions and broaden existing mutation payload types.
- Modify `components/resale-modal.tsx`: require account verification for logged-in ticket listing before enabling final list action.
- Modify `components/buy-resale-modal.tsx`: keep logged-in one-click buy, add guest buyer email/name form, and submit the right payload.
- Create `app/resale/list/page.tsx`: public guest listing flow.
- Create `app/resale/remove/page.tsx`: public guest removal flow.
- Create `app/resale/status/page.tsx`: public guest-safe status lookup driven by query params.
- Modify `lib/auth-context.tsx`: keep `/resale` public; no extra auth requirement needed unless a later route guard proves otherwise.
- Optionally modify `components/layout/header.tsx` or footer only if product wants discoverability links after the core flow works.

---

### Task 1: Shared Types And Ticket API Surface

**Files:**
- Modify: `types/tickets.type.ts`
- Modify: `services/tickets/tickets.ts`
- Modify: `services/tickets/tickets.queries.ts`

**Interfaces:**
- Produces:
  - `ResolveAccountPayload = { bankCode: string; accountNumber: string }`
  - `ResolvedAccount = { bankCode: string; accountNumber: string; accountName: string }`
  - `ListResalePayload = LoggedInListResalePayload | GuestListResalePayload`
  - `RemoveResalePayload = { ticketId: string } | { ticketCode: string; email: string }`
  - `BuyResalePayload = { ticketIds: string[]; buyerEmail?: string; buyerName?: string }`
  - `GuestResaleStatusParams = { ticketCode: string; email: string }`
  - `GuestResaleStatus` with event/category/listing/sold/payout fields only, no bank detail fields.
  - `resolvePayoutAccount(payload): Promise<ResolvedAccount>`
  - `removeResaleTicket(payload): Promise<TicketResale>`
  - `getGuestResaleStatus(params): Promise<GuestResaleStatus>`
- Consumes: existing `axios`, `buildEndpoint`, `toast`, and query invalidation patterns.

- [ ] **Step 1: Broaden resale types**

Add these definitions in `types/tickets.type.ts`, replacing the current single-shape `ListResalePayload` and adding new types near the resale interfaces:

```ts
export interface ResolveAccountPayload {
  bankCode: string;
  accountNumber: string;
}

export interface ResolvedAccount {
  bankCode: string;
  accountNumber: string;
  accountName: string;
}

export interface LoggedInListResalePayload {
  ticketId: string;
  resalePrice: number;
  bankCode: string;
  accountNumber: string;
}

export interface GuestListResalePayload {
  ticketCode: string;
  email: string;
  resalePrice: number;
  bankCode: string;
  accountNumber: string;
}

export type ListResalePayload =
  | LoggedInListResalePayload
  | GuestListResalePayload;

export type RemoveResalePayload =
  | { ticketId: string }
  | { ticketCode: string; email: string };

export interface BuyResalePayload {
  ticketIds: string[];
  buyerEmail?: string;
  buyerName?: string;
}

export interface GuestResaleStatusParams {
  ticketCode: string;
  email: string;
}

export interface GuestResaleStatus {
  eventName?: string;
  eventDate?: string;
  ticketCategory?: string;
  isListed?: boolean;
  resalePrice?: number;
  listedAt?: string;
  isSold?: boolean;
  payoutStatus?: string;
  commissionStatus?: string;
  ticket?: Pick<Ticket, "code" | "isListed" | "resalePrice" | "listedAt" | "status">;
  event?: {
    name?: string;
    date?: string;
    location?: string;
  };
}
```

- [ ] **Step 2: Add API helper functions**

In `services/tickets/tickets.ts`, import the new types and add a local error normalizer:

```ts
const THROTTLE_MESSAGE = "Too many attempts. Please wait a minute and try again.";
const GUEST_PROOF_MESSAGE = "Ticket not found or email does not match.";

const getApiErrorMessage = (error: any, fallback: string) => {
  const status = error.response?.status;
  if (status === 429) return THROTTLE_MESSAGE;
  return error.response?.data?.message || fallback;
};

const getGuestProofErrorMessage = (error: any) => {
  if (error.response?.status === 429) return THROTTLE_MESSAGE;
  return GUEST_PROOF_MESSAGE;
};
```

Add account resolution:

```ts
export const resolvePayoutAccount = async (
  data: ResolveAccountPayload
): Promise<ResolvedAccount> => {
  try {
    const res = await axios.post(
      buildEndpoint(API_VERSION, "payment/resolve-account"),
      data
    );
    toast.success("Account verified");
    return res.data;
  } catch (error: any) {
    const errorMessage = getApiErrorMessage(error, "Failed to verify account");
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};
```

Change `buyResaleTicket` to accept `BuyResalePayload`:

```ts
export const buyResaleTicket = async (
  data: BuyResalePayload
): Promise<TicketResponse> => {
  try {
    const res = await axios.post(
      buildEndpoint(API_VERSION, "tickets/resale/buy"),
      data
    );
    toast.success(res.data.message || "Resale ticket purchased successfully");
    return res.data;
  } catch (error: any) {
    const errorMessage = getApiErrorMessage(
      error,
      "Failed to purchase resale ticket"
    );
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};
```

Change `removeResaleTicket` to accept guest or logged-in payload:

```ts
export const removeResaleTicket = async (
  data: RemoveResalePayload
): Promise<TicketResale> => {
  try {
    const res = await axios.post(
      buildEndpoint(API_VERSION, "tickets/resale/remove"),
      data
    );
    toast.success(
      res.data.message || "Ticket removed from resale successfully"
    );
    return res.data;
  } catch (error: any) {
    const isGuestPayload = "ticketCode" in data;
    const errorMessage = isGuestPayload
      ? getGuestProofErrorMessage(error)
      : getApiErrorMessage(error, "Failed to remove resale ticket");
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};
```

Add guest status:

```ts
export const getGuestResaleStatus = async (
  params: GuestResaleStatusParams
): Promise<GuestResaleStatus> => {
  try {
    const res = await axios.get(
      buildEndpoint(API_VERSION, "tickets/resale/status"),
      { params }
    );
    return res.data;
  } catch (error: any) {
    throw new Error(getGuestProofErrorMessage(error));
  }
};
```

- [ ] **Step 3: Update query hooks**

In `services/tickets/tickets.queries.ts`, import the new service functions and types, then update/add hooks:

```ts
export const useBuyResaleTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BuyResalePayload) => buyResaleTicket(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myTickets"] });
      queryClient.invalidateQueries({ queryKey: ["resaleListings"] });
    },
  });
};

export const useResolvePayoutAccount = () =>
  useMutation({
    mutationFn: (payload: ResolveAccountPayload) => resolvePayoutAccount(payload),
  });

export const useGuestResaleStatus = (
  params: GuestResaleStatusParams,
  enabled: boolean
) =>
  useQuery<GuestResaleStatus>({
    queryKey: ["guestResaleStatus", params.ticketCode, params.email],
    queryFn: () => getGuestResaleStatus(params),
    enabled,
    retry: false,
  });

export const useRemoveResaleTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RemoveResalePayload) => removeResaleTicket(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resaleListings"] });
      queryClient.invalidateQueries({ queryKey: ["myResaleListings"] });
      queryClient.invalidateQueries({ queryKey: ["myTickets"] });
      queryClient.invalidateQueries({ queryKey: ["guestResaleStatus"] });
    },
  });
};
```

- [ ] **Step 4: Verify type surface**

Run: `npm run build`

Expected before later UI tasks: build may fail only for consumers still passing a raw `ticketId` string to `useRemoveResaleTicket`; fix those consumers in Task 4 by changing calls to `{ ticketId }`.

---

### Task 2: Account Verification In Logged-In Listing Modal

**Files:**
- Modify: `components/resale-modal.tsx`
- Modify: `app/ticket/[id]/page.tsx` if TypeScript requires callback signature alignment

**Interfaces:**
- Consumes: `useBankCodes`, `useResolvePayoutAccount`, `ResolvedAccount`, existing `onConfirmResale({ resalePrice, bankCode, accountNumber })`.
- Produces: a final listing form that cannot submit until the currently entered `bankCode + accountNumber` has been verified and has an `accountName`.

- [ ] **Step 1: Add verification state**

In `components/resale-modal.tsx`, import `useEffect` and `useResolvePayoutAccount`, then add:

```ts
const { mutateAsync: resolveAccount, isPending: isVerifyingAccount } =
  useResolvePayoutAccount();
const [resolvedAccount, setResolvedAccount] = useState<ResolvedAccount | null>(null);
```

Watch both fields:

```ts
const bankCode = watch("bankCode");
const accountNumber = watch("accountNumber");
```

Reset stale verification when bank/account changes:

```ts
useEffect(() => {
  setResolvedAccount(null);
}, [bankCode, accountNumber]);
```

- [ ] **Step 2: Add mask and verify handler**

Inside `ResaleModal`, add:

```ts
const maskAccountNumber = (value: string) =>
  value.length >= 4 ? `****${value.slice(-4)}` : value;

const handleVerifyAccount = async () => {
  const isBankValid = !!bankCode;
  const isAccountValid = /^\d{10}$/.test(accountNumber || "");
  if (!isBankValid || !isAccountValid) {
    toast.error("Select a bank and enter a valid 10-digit account number");
    return;
  }
  const account = await resolveAccount({ bankCode, accountNumber });
  setResolvedAccount(account);
};
```

- [ ] **Step 3: Gate submit on verification**

At the top of `onSubmit`, add:

```ts
if (!resolvedAccount) {
  toast.error("Verify your payout account before listing this ticket");
  return;
}
```

Change the submit button disabled expression to:

```tsx
disabled={isPending || isAlreadyResold || !resolvedAccount}
```

- [ ] **Step 4: Render verification controls**

Below account number errors, add:

```tsx
<div className="flex items-center gap-2">
  <Button
    type="button"
    variant="outline"
    onClick={handleVerifyAccount}
    disabled={isAlreadyResold || isPending || isVerifyingAccount}
  >
    {isVerifyingAccount ? "Verifying..." : "Verify account"}
  </Button>
  {resolvedAccount && (
    <p className="text-xs text-green-700">
      {resolvedAccount.accountName} confirmed for{" "}
      {maskAccountNumber(resolvedAccount.accountNumber)}
    </p>
  )}
</div>
```

- [ ] **Step 5: Verify logged-in list behavior**

Run: `npm run build`

Manual check:
- Open a ticket detail page while authenticated.
- Enter resale price `1199`; expect validation error.
- Enter valid bank/account and click verify; expect account name and masked account number.
- Confirm `List for Sale` stays disabled until verification succeeds.
- Submit; payload must still be `{ ticketId, resalePrice, bankCode, accountNumber }`.

---

### Task 3: Public Guest List Page

**Files:**
- Create: `app/resale/list/page.tsx`

**Interfaces:**
- Consumes: `useBankCodes`, `useResolvePayoutAccount`, `useListResale`, `GuestListResalePayload`.
- Produces: a public page where ticket owners list using `ticketCode`, `email`, `resalePrice`, `bankCode`, and `accountNumber`.

- [ ] **Step 1: Create page component with schema**

Create `app/resale/list/page.tsx` as a client component. Use this schema:

```ts
const guestListSchema = z.object({
  ticketCode: z.string().trim().min(1, "Ticket code is required"),
  email: z.string().trim().email("Enter a valid purchase email"),
  resalePrice: z
    .string()
    .min(1, "Enter resale price")
    .transform((value) => Number(value))
    .refine((value) => value >= 1200, "Minimum resale price is ₦1,200"),
  bankCode: z.string().min(1, "Please select your bank"),
  accountNumber: z
    .string()
    .regex(/^\d{10}$/, "Account number must be exactly 10 digits"),
});
```

- [ ] **Step 2: Add verification state and handlers**

Use the same `resolvedAccount`, `maskAccountNumber`, and `handleVerifyAccount` pattern from Task 2. Normalize email on submit:

```ts
const payload: GuestListResalePayload = {
  ticketCode: data.ticketCode.trim(),
  email: data.email.trim().toLowerCase(),
  resalePrice: data.resalePrice,
  bankCode: data.bankCode,
  accountNumber: data.accountNumber,
};
```

- [ ] **Step 3: Render guest-safe copy and form**

Page layout:
- Heading: `List a ticket for resale`
- Supporting text: `No account needed. Use the ticket code and purchase email from your order.`
- Fields: Ticket code, Purchase email, Resale price, Bank, Account number.
- Verification result: `Account Name confirmed for ****6789`.
- Primary submit button text: `List ticket`.
- Final submit disabled until `resolvedAccount` is present.

- [ ] **Step 4: Handle submit success and errors**

On success:

```ts
toast.success("Ticket listed for resale successfully");
router.push(
  `/resale/status?ticketCode=${encodeURIComponent(payload.ticketCode)}&email=${encodeURIComponent(payload.email)}`
);
```

On error:

```ts
toast.error(error.message || "Ticket not found or email does not match.");
```

- [ ] **Step 5: Verify guest list behavior**

Run: `npm run build`

Manual check:
- `/resale/list` loads while logged out.
- Invalid email shows field validation.
- `1199` resale price blocks submit.
- Bank/account verification is required before submit.
- Submit payload uses `ticketCode` and `email`, not `ticketId`.

---

### Task 4: Guest Remove Listing Page And Logged-In Remove Payload Compatibility

**Files:**
- Create: `app/resale/remove/page.tsx`
- Modify any logged-in consumer that calls `useRemoveResaleTicket().mutate(ticketId)` or `mutateAsync(ticketId)`.

**Interfaces:**
- Consumes: `useRemoveResaleTicket` with `RemoveResalePayload`.
- Produces: guest removal with generic proof failure copy and logged-in removal still using `{ ticketId }`.

- [ ] **Step 1: Update logged-in remove call sites**

Search:

```bash
rg -n "removeResale|useRemoveResaleTicket|mutate\\(|mutateAsync\\(" app components
```

For any existing logged-in remove handler, change:

```ts
removeResaleTicket(ticketId);
```

to:

```ts
removeResaleTicket({ ticketId });
```

- [ ] **Step 2: Create guest remove schema**

Create `app/resale/remove/page.tsx` with:

```ts
const guestRemoveSchema = z.object({
  ticketCode: z.string().trim().min(1, "Ticket code is required"),
  email: z.string().trim().email("Enter a valid purchase email"),
});
```

- [ ] **Step 3: Submit guest remove payload**

Use:

```ts
await removeResale({
  ticketCode: data.ticketCode.trim(),
  email: data.email.trim().toLowerCase(),
});
toast.success("Ticket removed from resale successfully");
```

On error show:

```ts
toast.error(error.message || "Ticket not found or email does not match.");
```

- [ ] **Step 4: Render guest-safe copy**

Page layout:
- Heading: `Remove a resale listing`
- Supporting text: `No login needed. Enter the ticket code and purchase email used for the ticket.`
- Fields: Ticket code, Purchase email.
- Button: `Remove listing`.
- Avoid copy that reveals whether ticket code or email individually exists.

- [ ] **Step 5: Verify remove behavior**

Run: `npm run build`

Manual check:
- `/resale/remove` loads while logged out.
- Empty ticket code is rejected.
- Invalid email is rejected.
- Invalid guest proof shows exactly `Ticket not found or email does not match.`
- Logged-in remove calls still compile and send `{ ticketId }`.

---

### Task 5: Guest Resale Status Page

**Files:**
- Create: `app/resale/status/page.tsx`

**Interfaces:**
- Consumes: `useSearchParams`, `useGuestResaleStatus`, `GuestResaleStatus`.
- Produces: guest-safe status display for `/resale/status?ticketCode=...&email=...`.

- [ ] **Step 1: Read and validate query params**

In `app/resale/status/page.tsx`, read:

```ts
const ticketCode = searchParams.get("ticketCode")?.trim() ?? "";
const email = searchParams.get("email")?.trim().toLowerCase() ?? "";
const hasRequiredParams = ticketCode.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
```

Call:

```ts
const { data, isLoading, error } = useGuestResaleStatus(
  { ticketCode, email },
  hasRequiredParams
);
```

- [ ] **Step 2: Normalize display fields**

Compute fields without assuming one backend shape:

```ts
const eventName = data?.eventName ?? data?.event?.name ?? "Event";
const eventDate = data?.eventDate ?? data?.event?.date;
const category = data?.ticketCategory ?? data?.ticket?.ticketCategory?.name ?? "Ticket";
const isListed = data?.isListed ?? data?.ticket?.isListed ?? false;
const resalePrice = data?.resalePrice ?? data?.ticket?.resalePrice;
const listedAt = data?.listedAt ?? data?.ticket?.listedAt;
const isSold = data?.isSold ?? data?.ticket?.status === "RESOLD";
```

- [ ] **Step 3: Render allowed status details only**

Show:
- Event name/date.
- Ticket category.
- Listed/not listed.
- Resale price when listed.
- Listed date when present.
- Sold status.
- Payout/commission status only when fields are present.

Do not render any object keys that include `bank`, `account`, `bankCode`, `accountNumber`, or `accountName`.

- [ ] **Step 4: Render missing params and error states**

Missing params state:

```tsx
<p className="text-sm text-muted-foreground">
  Enter a ticket code and purchase email to check resale status.
</p>
```

Error state:

```tsx
<p className="text-sm text-red-600">
  Ticket not found or email does not match.
</p>
```

- [ ] **Step 5: Verify status behavior**

Run: `npm run build`

Manual check:
- `/resale/status` does not call the API and asks for ticket code/email.
- `/resale/status?ticketCode=TCK-ABC123&email=owner@example.com` calls status endpoint.
- UI never displays bank/account fields even if backend response includes them.

---

### Task 6: Guest Buyer In Resale Purchase Modal

**Files:**
- Modify: `components/buy-resale-modal.tsx`
- Modify the resale modal caller if one is reintroduced/exists during implementation.

**Interfaces:**
- Consumes: `onConfirmBuy(payload: BuyResalePayload)`, `isAuthenticated`, `TicketResale`.
- Produces: logged-in buyers submit `{ ticketIds: [id] }`; guests submit `{ ticketIds: [id], buyerEmail, buyerName? }`.

- [ ] **Step 1: Update modal props**

Change:

```ts
onConfirmBuy: (ticketId: string) => void;
```

to:

```ts
onConfirmBuy: (payload: BuyResalePayload) => void;
```

- [ ] **Step 2: Add guest form state and validation**

Inside the modal:

```ts
const [buyerEmail, setBuyerEmail] = useState("");
const [buyerName, setBuyerName] = useState("");
const [buyerEmailError, setBuyerEmailError] = useState("");

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
```

- [ ] **Step 3: Submit correct payload**

Replace `handleSubmit` with:

```ts
const handleSubmit = () => {
  if (!selectedTicket?.id) return;

  if (isAuthenticated) {
    onConfirmBuy({ ticketIds: [selectedTicket.id] });
    return;
  }

  if (!buyerEmail.trim()) {
    setBuyerEmailError("Email address is required");
    return;
  }

  if (!isValidEmail(buyerEmail)) {
    setBuyerEmailError("Enter a valid email address");
    return;
  }

  onConfirmBuy({
    ticketIds: [selectedTicket.id],
    buyerEmail: buyerEmail.trim().toLowerCase(),
    ...(buyerName.trim() ? { buyerName: buyerName.trim() } : {}),
  });
};
```

- [ ] **Step 4: Render guest fields**

If `!isAuthenticated`, render before the note:

```tsx
<div className="space-y-3">
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-900">
      Email address <span className="text-red-600">*</span>
    </label>
    <Input
      id="resale-buyer-email"
      type="email"
      value={buyerEmail}
      onChange={(event) => {
        setBuyerEmail(event.target.value);
        setBuyerEmailError("");
      }}
      placeholder="you@example.com"
      disabled={isPending}
    />
    {buyerEmailError && (
      <p className="text-xs text-red-600">{buyerEmailError}</p>
    )}
  </div>
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-900">Name</label>
    <Input
      value={buyerName}
      onChange={(event) => setBuyerName(event.target.value)}
      placeholder="Buyer name"
      disabled={isPending}
    />
  </div>
</div>
```

Change the button copy to:

```tsx
{isPending ? "Processing..." : "Buy Now"}
```

and disabled state to:

```tsx
disabled={isPending || !selectedTicket}
```

- [ ] **Step 5: Update caller redirect behavior**

Where the modal is used, call:

```ts
buyResale(payload, {
  onSuccess: (response) => {
    if (response.checkoutUrl) {
      window.location.href = response.checkoutUrl;
    }
  },
});
```

- [ ] **Step 6: Verify buyer behavior**

Run: `npm run build`

Manual check:
- Logged-in resale buy submits only `ticketIds`.
- Logged-out resale buy requires valid buyer email and optional name.
- Successful response redirects to `checkoutUrl`.
- Empty `ticketIds` cannot be submitted because the button is tied to `selectedTicket.id`.

---

### Task 7: Public Route Discoverability And Final Verification

**Files:**
- Modify: `components/layout/header.tsx` only if a public Resale nav link is desired.
- Modify: `components/layout/footer.tsx` only if footer links are desired.
- Modify: `lib/auth-context.tsx` only if runtime proves `/resale/list`, `/resale/remove`, or `/resale/status` is not covered by the existing `pathname.startsWith("/resale")` allowlist.

**Interfaces:**
- Consumes: completed guest pages and auth allowlist.
- Produces: public routes accessible without account creation prompts.

- [ ] **Step 1: Confirm auth allowlist**

Read `lib/auth-context.tsx` and confirm this remains true:

```ts
const publicRoutes = [
  // ...
  "/resale",
];
```

Because it uses `pathname.startsWith(route)`, `/resale/list`, `/resale/remove`, and `/resale/status` are public.

- [ ] **Step 2: Add optional navigation links if desired**

If discoverability is requested, add one nav item:

```ts
{ name: "Resale", href: "/resale/list" }
```

If not requested, skip nav changes to avoid cluttering the main header.

- [ ] **Step 3: Run full verification**

Run:

```bash
npm run lint
npm run build
```

Expected:
- `npm run lint` completes or reports only pre-existing Next lint setup issues.
- `npm run build` completes without TypeScript errors.

- [ ] **Step 4: Manual acceptance checklist**

Check:
- Guest owner can list with ticket code, email, price, verified bank, and account number.
- Guest owner can remove with ticket code and email.
- Guest buyer can submit buyer email/name and redirect to checkout.
- Logged-in list/remove/buy payloads still use ticket IDs/session flow.
- Guest status page shows event/category/listing/sold/payout/commission status and no bank details.
- Throttle errors show `Too many attempts. Please wait a minute and try again.`
- Invalid guest proof shows `Ticket not found or email does not match.`

---

## Self-Review

- Spec coverage: listing, removing, buying, account verification, status lookup, validation rules, generic proof errors, throttle copy, logged-in preservation, and no bank detail exposure are each covered by Tasks 1-7.
- Placeholder scan: no placeholder markers or undefined future behavior remain. Optional navigation is explicitly non-core and gated by product preference.
- Type consistency: service types introduced in Task 1 are consumed by later tasks using the same names and payload shapes.

// _components/ticket-category-card-v3.tsx
import { TicketCategoryV2 } from "@/types/events-v2.type";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  category: TicketCategoryV2;
  isSelected: boolean;
  quantity: number;
  onToggle: () => void;
  onQuantityChange: (delta: number) => void;
  feeMode: "ORGANIZER" | "ATTENDEE";
  primaryFeeBps: number;
};

export function TicketCategoryCardV2({
  category,
  isSelected,
  quantity,
  onToggle,
  onQuantityChange,
  feeMode,
  primaryFeeBps,
}: Props) {
  const available = category.maxTickets - (category.minted ?? 0);
  const outOfStock = available <= 0;
  const fee =
    feeMode === "ATTENDEE"
      ? Math.floor((category.displayPrice * primaryFeeBps) / 10000)
      : 0;

  return (
    <div
      className={cn(
        "rounded-xl border p-5 transition-all duration-200",
        outOfStock && "opacity-50 pointer-events-none",
      )}
      style={{
        borderColor: isSelected ? "var(--home-accent)" : "var(--home-border)",
        backgroundColor: isSelected ? "var(--home-card-highlight)" : "var(--home-card)",
      }}
    >
      <div className="flex justify-between items-start gap-4 mb-4">
        <div>
          <h3 className="font-semibold text-lg" style={{ color: "var(--home-text)" }}>
            {category.name}
          </h3>
          <p className="text-sm mt-1" style={{ color: "var(--home-muted)" }}>
            Admits {category.maxAdmissions}
          </p>
        </div>

        <div className="text-right shrink-0">
          <div className="text-2xl font-bold tracking-tight" style={{ color: "var(--home-text)" }}>
            ₦{category.displayPrice.toLocaleString()}
          </div>
          {fee > 0 && (
            <div className="text-xs mt-0.5" style={{ color: "var(--home-muted)" }}>
              incl. ₦{fee.toLocaleString()} fee
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        {isSelected && quantity > 0 ? (
          <div
            className="flex items-center gap-2 border rounded-lg px-1.5 py-1"
            style={{ backgroundColor: "var(--home-bg)", borderColor: "var(--home-border)" }}
          >
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-[var(--home-text)] hover:bg-[var(--home-card-elevated)] hover:text-[var(--home-text-highlight)]"
              onClick={() => onQuantityChange(-1)}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-10 text-center font-medium" style={{ color: "var(--home-text)" }}>
              {quantity}
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-[var(--home-text)] hover:bg-[var(--home-card-elevated)] hover:text-[var(--home-text-highlight)]"
              onClick={() => onQuantityChange(1)}
              disabled={quantity >= available || quantity >= 10}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div />
        )}

        <Button
          variant={isSelected ? "homeAccent" : "homeOutline"}
          size="sm"
          className="min-w-[100px]"
          onClick={onToggle}
          disabled={outOfStock}
        >
          {isSelected ? "Selected" : outOfStock ? "Sold Out" : "Select"}
        </Button>
      </div>
    </div>
  );
}

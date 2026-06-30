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
        isSelected
          ? "border-[#1E88E5]/60 bg-[#1E88E5]/10 ring-1 ring-[#1E88E5]/30"
          : "border-border hover:border-[#1E88E5]/40",
        outOfStock && "opacity-50 pointer-events-none",
      )}
    >
      <div className="flex justify-between items-start gap-4 mb-4">
        <div>
          <h3 className="font-semibold text-lg">{category.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Admits {category.maxAdmissions}
          </p>
        </div>

        <div className="text-right shrink-0">
          <div className="text-2xl font-bold tracking-tight">
            ₦{category.displayPrice.toLocaleString()}
          </div>
          {fee > 0 && (
            <div className="text-xs text-muted-foreground mt-0.5">
              incl. ₦{fee.toLocaleString()} fee
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        {isSelected && quantity > 0 ? (
          <div className="flex items-center gap-2 bg-background border rounded-lg px-1.5 py-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => onQuantityChange(-1)}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-10 text-center font-medium">{quantity}</span>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
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
          variant={isSelected ? "primary" : "outline"}
          size="sm"
          className={cn("min-w-[100px]")}
          onClick={onToggle}
          disabled={outOfStock}
        >
          {isSelected ? "Selected" : outOfStock ? "Sold Out" : "Select"}
        </Button>
      </div>
    </div>
  );
}

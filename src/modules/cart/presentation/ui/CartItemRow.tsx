import { AppImage } from "@/shared/ui/AppImage";
import { Trash2Icon } from "lucide-react";
import type { CartItemDTO } from "../../domain/contracts/cart.contract";
import { useRemoveCartItem, useUpdateCartItem } from "../api/queries";

interface Props {
  item: CartItemDTO;
}

export function CartItemRow({ item }: Props) {
  const updateQty = useUpdateCartItem();
  const remove = useRemoveCartItem();
  const fmt = (v: string) => `${Number(v).toLocaleString("lo-LA")} ກີບ`;

  return (
    <div className="flex gap-4 py-4">
      {/* Image */}
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-muted">
        <AppImage
          src={item.productImage}
          alt={item.productName}
          className="h-full w-full"
          fit="cover"
        />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <p className="font-semibold leading-snug line-clamp-2">{item.productName}</p>
        {(item.colorName || item.size) && (
          <p className="text-xs text-muted-foreground">
            {[item.colorName, item.size].filter(Boolean).join(" · ")}
          </p>
        )}
        <p className="text-sm font-medium text-primary">{fmt(item.unitPrice)} / ຊິ້ນ</p>
      </div>

      {/* Qty + remove */}
      <div className="flex shrink-0 flex-col items-end justify-between gap-2">
        {/* Qty stepper */}
        <div className="flex items-center gap-1.5 rounded-lg border px-2 py-1">
          <button
            type="button"
            onClick={() => updateQty.mutate({ itemId: item.id, quantity: item.quantity - 1 })}
            disabled={item.quantity <= 1 || updateQty.isPending}
            className="h-6 w-6 rounded text-base font-bold disabled:opacity-30 hover:bg-muted"
          >
            −
          </button>
          <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
          <button
            type="button"
            onClick={() => updateQty.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
            disabled={updateQty.isPending}
            className="h-6 w-6 rounded text-base font-bold hover:bg-muted"
          >
            +
          </button>
        </div>

        <div className="flex items-center gap-3">
          <p className="font-bold">{fmt(item.subtotal)}</p>
          <button
            type="button"
            onClick={() => remove.mutate(item.id)}
            disabled={remove.isPending}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2Icon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

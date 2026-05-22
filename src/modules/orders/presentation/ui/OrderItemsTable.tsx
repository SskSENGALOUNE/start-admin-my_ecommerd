import { AppImage } from "@/shared/ui/AppImage";
import type { OrderItemDTO } from "../../domain/contracts/order.contract";

interface Props {
  items: OrderItemDTO[];
}

export function OrderItemsTable({ items }: Props) {
  const formatPrice = (v: string) =>
    Number(v).toLocaleString("lo-LA") + " ກີບ";

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              ສິນຄ້າ
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              SKU
            </th>
            <th className="px-4 py-3 text-center font-medium text-muted-foreground">
              ຈຳນວນ
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              ລາຄາ/ໜ່ວຍ
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              ລວມ
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b last:border-0">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                    <AppImage
                      src={item.productImage}
                      alt={item.productName}
                      className="h-full w-full"
                      fit="cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    {(item.colorName || item.size) && (
                      <p className="text-xs text-muted-foreground">
                        {[item.colorName, item.size]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                {item.variantSku ?? "—"}
              </td>
              <td className="px-4 py-3 text-center">{item.quantity}</td>
              <td className="px-4 py-3 text-right">
                {formatPrice(item.unitPrice)}
              </td>
              <td className="px-4 py-3 text-right font-medium">
                {formatPrice(item.subtotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

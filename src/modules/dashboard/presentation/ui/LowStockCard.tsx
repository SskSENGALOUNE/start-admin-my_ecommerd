import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@devhop/ui";
import { AlertTriangleIcon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { StockBadge } from "@/modules/products/presentation/ui/StockBadge";

interface Product {
  id: string;
  name: string;
  quantity: number;
  reservedQty: number;
}

interface Props {
  products: Product[];
  isLoading?: boolean;
}

export function LowStockCard({ products, isLoading }: Props) {
  const nav = useNavigate();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangleIcon className="h-4 w-4 text-amber-500" />
          ສິນຄ້າໃກ້ໝົດ
        </CardTitle>
        <button
          type="button"
          onClick={() => nav({ to: "/app/products" })}
          className="text-xs text-primary hover:underline"
        >
          ຈັດການ →
        </button>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-3 px-6 pb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loader
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center gap-1 px-6 pb-6 pt-4 text-center">
            <p className="text-sm font-medium text-green-600">ສະຕ໋ອກຄົບ ✓</p>
            <p className="text-xs text-muted-foreground">
              ບໍ່ມີສິນຄ້າໃກ້ໝົດ
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {products.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() =>
                  nav({ to: "/app/products/$id", params: { id: p.id } })
                }
                className="flex w-full items-center justify-between px-6 py-3 text-sm transition-colors hover:bg-muted/50"
              >
                <p className="min-w-0 flex-1 truncate text-left font-medium">
                  {p.name}
                </p>
                <StockBadge
                  quantity={p.quantity}
                  reservedQty={p.reservedQty}
                />
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

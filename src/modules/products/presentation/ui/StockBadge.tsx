import { Badge } from "@devhop/ui";

type Props = { quantity: number; reservedQty: number };

export function StockBadge({ quantity, reservedQty }: Props) {
  const available = quantity - reservedQty;
  if (available <= 0) return <Badge variant="destructive">ໝົດສະຕ໋ອກ</Badge>;
  if (available <= 5) return <Badge variant="warning">{available} ຊິ້ນ</Badge>;
  return <Badge variant="success">{available} ຊິ້ນ</Badge>;
}

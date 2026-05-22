import { Badge } from "@devhop/ui";

export function CustomerStatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <Badge variant="success">ເປີດໃຊ້ງານ</Badge>
  ) : (
    <Badge variant="destructive">ຖືກລະງັບ</Badge>
  );
}

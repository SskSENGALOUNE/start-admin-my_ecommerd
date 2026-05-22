import { Button, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from "@devhop/ui";
import { useState } from "react";
import type { CreateShipmentDTO, ShippingType } from "../../domain/contracts/shipment.contract";

const SHIPPING_OPTIONS: { value: ShippingType; label: string }[] = [
  { value: "RAIDER", label: "RAIDER" },
  { value: "ANOUSITH_EXPRESS", label: "Anousith Express" },
  { value: "HOUNGALOUN_EXPRESS", label: "Houngaloun Express" },
  { value: "MIXAY_EXPRESS", label: "Mixay Express" },
  { value: "UNITEL_EXPRESS", label: "Unitel Express" },
];

interface Props {
  orderId: string;
  defaultShippingType?: ShippingType;
  onSubmit: (values: CreateShipmentDTO) => Promise<void>;
  isLoading?: boolean;
}

export function CreateShipmentForm({
  orderId,
  defaultShippingType,
  onSubmit,
  isLoading,
}: Props) {
  const [shippingType, setShippingType] = useState<ShippingType>(
    defaultShippingType ?? "RAIDER",
  );
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!shippingType) {
      setError("ກະລຸນາເລືອກບໍລິສັດຂົນສົ່ງ");
      return;
    }
    setError("");
    await onSubmit({ orderId, shippingType, note: note || undefined });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>ບໍລິສັດຂົນສົ່ງ *</Label>
        <Select
          value={shippingType}
          onValueChange={(v) => setShippingType(v as ShippingType)}
        >
          <SelectTrigger className={error ? "border-destructive" : ""}>
            <SelectValue placeholder="ເລືອກຂົນສົ່ງ" />
          </SelectTrigger>
          <SelectContent>
            {SHIPPING_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>ໝາຍເຫດ (ຖ້າມີ)</Label>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="ໝາຍເຫດ..."
          rows={2}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "ກຳລັງສ້າງ..." : "ສ້າງ Shipment"}
      </Button>
    </form>
  );
}

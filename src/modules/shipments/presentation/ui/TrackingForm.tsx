import { Button, Input, Label, Textarea } from "@devhop/ui";
import { useState } from "react";
import type { UpdateTrackingDTO } from "../../domain/contracts/shipment.contract";

interface Props {
  onSubmit: (values: UpdateTrackingDTO) => Promise<void>;
  isLoading?: boolean;
}

export function TrackingForm({ onSubmit, isLoading }: Props) {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      setError("ກະລຸນາໃສ່ເລກ Tracking");
      return;
    }
    setError("");
    await onSubmit({ trackingNumber: trackingNumber.trim(), note: note || undefined });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="tracking">ເລກ Tracking *</Label>
        <Input
          id="tracking"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="ໃສ່ເລກ Tracking ຂົນສົ່ງ..."
          className={error ? "border-destructive" : ""}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="note">ໝາຍເຫດ (ຖ້າມີ)</Label>
        <Textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="ໝາຍເຫດເພີ່ມເຕີມ..."
          rows={2}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "ກຳລັງບັນທຶກ..." : "ຢືນຢັນການຈັດສົ່ງ"}
      </Button>
    </form>
  );
}

import { Badge, Button } from "@devhop/ui";
import { MapPinIcon, PencilIcon, StarIcon, Trash2Icon } from "lucide-react";
import type { MyAddress } from "../api/client";

interface Props {
  address: MyAddress;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  isDeleting?: boolean;
  isSettingDefault?: boolean;
}

export function AddressCard({
  address,
  canDelete,
  onEdit,
  onDelete,
  onSetDefault,
  isDeleting,
  isSettingDefault,
}: Props) {
  const fullAddress = [
    address.address,
    address.village,
    address.district,
    address.province,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        address.isDefault ? "border-primary/50 bg-primary/5" : "bg-card"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left — icon + content */}
        <div className="flex min-w-0 gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
            <MapPinIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-medium">{address.recipientName}</span>
              <span className="text-sm text-muted-foreground">{address.recipientPhone}</span>
              {address.label && (
                <Badge variant="secondary" className="text-xs">
                  {address.label}
                </Badge>
              )}
              {address.isDefault && (
                <Badge variant="default" className="text-xs">
                  ຫຼັກ
                </Badge>
              )}
            </div>
            <p className="truncate text-sm text-muted-foreground">{fullAddress}</p>
          </div>
        </div>

        {/* Right — actions */}
        <div className="flex shrink-0 items-center gap-1">
          {!address.isDefault && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={onSetDefault}
              disabled={isSettingDefault}
              title="ຕັ້ງເປັນທີ່ຢູ່ຫຼັກ"
            >
              <StarIcon className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onEdit}
            title="ແກ້ໄຂ"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          {canDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={onDelete}
              disabled={isDeleting}
              title="ລຶບ"
            >
              <Trash2Icon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

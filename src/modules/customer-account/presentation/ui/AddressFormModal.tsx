import {
  Button,
  FormInput,
  FormRoot,
  FormSelect,
  FormSwitch,
  Modal,
  RHF,
  zodResolver,
} from "@devhop/ui";
import { useEffect } from "react";
import { z } from "zod";
import type { AddressUpsertDTO } from "../../domain/contracts/customer-account.contract";

// ─── Lao provinces ────────────────────────────────────────────────────────────

const LAO_PROVINCES = [
  "ນະຄອນຫຼວງວຽງຈັນ",
  "ແຂວງວຽງຈັນ",
  "ແຂວງຜົ້ງສາລີ",
  "ແຂວງລວງນ້ຳທາ",
  "ແຂວງອຸດົມໄຊ",
  "ແຂວງບໍ່ແກ້ວ",
  "ແຂວງຫຼວງພະບາງ",
  "ແຂວງຫົວພັນ",
  "ແຂວງໄຊຍະບູລີ",
  "ແຂວງຊຽງຂວາງ",
  "ແຂວງບໍລິຄໍາໄຊ",
  "ແຂວງຄໍາມ່ວນ",
  "ແຂວງສາວັນນະເຂດ",
  "ແຂວງສາລະວັນ",
  "ແຂວງເຊກອງ",
  "ແຂວງຈໍາປາສັກ",
  "ແຂວງອັດຕະປື",
  "ແຂວງໄຊສົມບູນ",
];

const PROVINCE_OPTIONS = LAO_PROVINCES.map((p) => ({ value: p, label: p }));

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  label: z.string().optional(),
  recipientName: z.string().min(1, "ກະລຸນາໃສ່ຊື່ຜູ້ຮັບ"),
  recipientPhone: z.string().min(1, "ກະລຸນາໃສ່ເບີໂທຜູ້ຮັບ"),
  province: z.string().min(1, "ກະລຸນາເລືອກແຂວງ"),
  district: z.string().min(1, "ກະລຸນາໃສ່ເມືອງ"),
  village: z.string().optional(),
  address: z.string().min(1, "ກະລຸນາໃສ່ທີ່ຢູ່"),
  isDefault: z.boolean().default(false),
});
type FormValues = z.infer<typeof schema>;

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  initial?: Partial<AddressUpsertDTO>;
  onSubmit: (data: AddressUpsertDTO) => void;
  isPending: boolean;
  title?: string;
}

export function AddressFormModal({
  open,
  onClose,
  initial,
  onSubmit,
  isPending,
  title = "ເພີ່ມທີ່ຢູ່ໃໝ່",
}: Props) {
  const methods = RHF.useForm<FormValues>({
    resolver: zodResolver(schema) as RHF.Resolver<FormValues>,
    defaultValues: {
      label: initial?.label ?? "",
      recipientName: initial?.recipientName ?? "",
      recipientPhone: initial?.recipientPhone ?? "",
      province: initial?.province ?? undefined,
      district: initial?.district ?? "",
      village: initial?.village ?? "",
      address: initial?.address ?? "",
      isDefault: initial?.isDefault ?? false,
    },
  });

  // Reset form when modal opens with new initial values
  useEffect(() => {
    if (open) {
      methods.reset({
        label: initial?.label ?? "",
        recipientName: initial?.recipientName ?? "",
        recipientPhone: initial?.recipientPhone ?? "",
        province: initial?.province ?? undefined,
        district: initial?.district ?? "",
        village: initial?.village ?? "",
        address: initial?.address ?? "",
        isDefault: initial?.isDefault ?? false,
      });
    }
  }, [open]);

  function handleSubmit(values: FormValues) {
    onSubmit({
      ...values,
      label: values.label || null,
      village: values.village || null,
    });
  }

  return (
    <Modal open={open} onOpenChange={(o) => !o && onClose()} title={title}>
      <FormRoot<FormValues>
        methods={methods}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* Label */}
        <FormInput
          name="label"
          label="ປ້າຍຊື່ (ຖ້າມີ)"
          placeholder="ເຊັ່ນ: ບ້ານ, ບ່ອນເຮັດວຽກ"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Recipient */}
          <FormInput
            name="recipientName"
            label="ຊື່ຜູ້ຮັບ"
            requiredMark
            placeholder="ຊື່ ແລະ ນາມສະກຸນ"
          />
          <FormInput
            name="recipientPhone"
            label="ເບີໂທຜູ້ຮັບ"
            requiredMark
            placeholder="020XXXXXXXX"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Location */}
          <FormSelect
            name="province"
            label="ແຂວງ"
            requiredMark
            options={PROVINCE_OPTIONS}
          />
          <FormInput
            name="district"
            label="ເມືອງ"
            requiredMark
            placeholder="ຊື່ເມືອງ"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            name="village"
            label="ບ້ານ (ຖ້າມີ)"
            placeholder="ຊື່ບ້ານ"
          />
          <FormInput
            name="address"
            label="ທີ່ຢູ່ລະອຽດ"
            requiredMark
            placeholder="ເລກເຮືອນ, ຖະໜົນ..."
          />
        </div>

        {/* Default toggle */}
        <FormSwitch name="isDefault" label="ຕັ້ງເປັນທີ່ຢູ່ຫຼັກ" />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            ຍົກເລີກ
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ"}
          </Button>
        </div>
      </FormRoot>
    </Modal>
  );
}

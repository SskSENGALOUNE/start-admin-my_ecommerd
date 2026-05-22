import {
  Button,
  FormInput,
  FormNumber,
  FormRoot,
  FormSelect,
  FormSwitch,
  RHF,
  zodResolver,
} from "@devhop/ui";
import { z } from "zod";
import type { ColorDTO } from "../../domain/contracts/variant.contract";

const schema = z.object({
  colorId: z.string().min(1, "ກະລຸນາເລືອກສີ"),
  size: z.string().optional(),
  sku: z.string().optional(),
  price: z.number().min(0).optional().nullable(),
  isActive: z.boolean().default(true),
});
type FormValues = z.infer<typeof schema>;

type Props = {
  colors: ColorDTO[];
  defaultValues?: Partial<FormValues>;
  onSubmit: (values: FormValues) => void;
  isLoading?: boolean;
  submitLabel?: string;
};

const COLOR_LABELS: Record<string, string> = {
  RED: "ແດງ", GREEN: "ຂຽວ", BLUE: "ຟ້າ", YELLOW: "ເຫຼືອງ",
  BLACK: "ດຳ", WHITE: "ຂາວ", GRAY: "ຂີ້ເຖົ່າ", PURPLE: "ມ່ວງ",
  ORANGE: "ສົ້ມ", PINK: "ບົວ", BROWN: "ນ້ຳຕານ", GOLD: "ທອງ", SILVER: "ເງິນ",
};

export function VariantForm({
  colors,
  defaultValues,
  onSubmit,
  isLoading,
  submitLabel = "ບັນທຶກ",
}: Props) {
  const methods = RHF.useForm<FormValues>({
    resolver: zodResolver(schema) as RHF.Resolver<FormValues>,
    defaultValues: {
      // ห้ามใช้ "" เป็น default ของ Select — ใช้ undefined ให้ Radix แสดง placeholder แทน
      colorId: undefined,
      size: "",
      sku: "",
      price: null,
      isActive: true,
      ...defaultValues,
    },
  });

  const colorOptions = colors.map((c) => ({
    value: c.id,
    label: `${COLOR_LABELS[c.color] ?? c.color} (${c.color})`,
  }));

  return (
    <FormRoot<FormValues> methods={methods} onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormSelect name="colorId" label="ສີ" options={colorOptions} requiredMark />
        <FormInput name="size" label="ໄຊ (ຖ້າມີ)" placeholder="S, M, L, XL, 38, 39..." />
        <FormInput name="sku" label="SKU" placeholder="SHIRT-RED-M" />
        <FormNumber
          name="price"
          label="ລາຄາ Variant (₭)"
          min={0}
          placeholder="ຫາກຫວ່າງ = ໃຊ້ລາຄາຫຼັກ"
        />
        <div className="flex items-end pb-1">
          <FormSwitch name="isActive" label="ເປີດໃຊ້ງານ" />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "ກຳລັງບັນທຶກ..." : submitLabel}
        </Button>
      </div>
    </FormRoot>
  );
}

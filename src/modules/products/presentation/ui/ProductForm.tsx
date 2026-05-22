import { useCategoriesQuery } from "@/modules/categories/presentation/api/queries";
import { ImageKeyUploadField } from "@/shared/ui/ImageKeyUploadField";
import {
  Button,
  FormInput,
  FormNumber,
  FormRoot,
  FormSelect,
  FormSwitch,
  FormTextarea,
  RHF,
  zodResolver,
} from "@devhop/ui";
import { useState } from "react";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "ກະລຸນາໃສ່ຊື່ສິນຄ້າ"),
  description: z.string().optional(),
  basePrice: z.number().min(0, "ລາຄາຕ້ອງ >= 0"),
  categoryId: z.string().optional(),
  isActive: z.boolean().default(true),
  quantity: z.number().int().min(0).default(0),
});
type FormValues = z.infer<typeof schema>;

type Props = {
  defaultValues?: Partial<FormValues>;
  onSubmit: (values: FormValues, imageKeys: string[]) => void;
  isLoading?: boolean;
  submitLabel?: string;
  /** ถ้าแก้ไข ส่ง existing image keys มาด้วย */
  existingImageKeys?: string[];
};

export function ProductForm({
  defaultValues,
  onSubmit,
  isLoading,
  submitLabel = "ບັນທຶກ",
  existingImageKeys = [],
}: Props) {
  // Radix UI Select.Item ห้ามใช้ value="" → ใช้ sentinel "__none__" แทน
  const NO_CATEGORY = "__none__";

  // map "" หรือ undefined → NO_CATEGORY ก่อน pass เข้า form
  const resolvedCategoryId =
    !defaultValues?.categoryId || defaultValues.categoryId === ""
      ? NO_CATEGORY
      : defaultValues.categoryId;

  const methods = RHF.useForm<FormValues>({
    resolver: zodResolver(schema) as RHF.Resolver<FormValues>,
    defaultValues: {
      name: "",
      description: "",
      basePrice: 0,
      isActive: true,
      quantity: 0,
      ...defaultValues,
      // ห้ามส่ง "" ให้ Select — override หลัง spread เสมอ
      categoryId: resolvedCategoryId,
    },
  });

  const [imageKeys, setImageKeys] = useState<string[]>(existingImageKeys);
  const categories = useCategoriesQuery();

  const categoryOptions = [
    { label: "— ບໍ່ລະບຸໝວດ —", value: NO_CATEGORY },
    ...(categories.data?.data ?? []).map((c) => ({
      label: c.name,
      value: c.id,
    })),
  ];

  function handleSubmit(values: FormValues) {
    // แปลง sentinel กลับเป็น undefined ก่อนส่ง
    const normalized = {
      ...values,
      categoryId:
        values.categoryId === NO_CATEGORY ? undefined : values.categoryId,
    };
    onSubmit(normalized, imageKeys);
  }

  return (
    <FormRoot<FormValues> methods={methods} onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormInput name="name" label="ຊື່ສິນຄ້າ" requiredMark placeholder="ເຊັ່ນ: ເສື້ອ Oversize" />
        </div>
        <FormNumber name="basePrice" label="ລາຄາຫຼັກ (₭)" requiredMark min={0} />
        <FormSelect name="categoryId" label="ໝວດໝູ່" options={categoryOptions} />
        <FormNumber name="quantity" label="ຈຳນວນ Stock" min={0} />
        <div className="flex items-end pb-1">
          <FormSwitch name="isActive" label="ເປີດໃຊ້ງານ" />
        </div>
        <div className="sm:col-span-2">
          <FormTextarea
            name="description"
            label="ລາຍລະອຽດ"
            placeholder="ລາຍລະອຽດສິນຄ້າ..."
            rows={3}
          />
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <p className="mb-2 text-sm font-medium">ຮູບສິນຄ້າ</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {imageKeys.map((key, idx) => (
            <div key={key} className="relative">
              <ImageKeyUploadField
                value={key}
                onChange={(newKey) => {
                  if (!newKey) {
                    setImageKeys((prev) => prev.filter((_, i) => i !== idx));
                  } else {
                    setImageKeys((prev) =>
                      prev.map((k, i) => (i === idx ? newKey : k)),
                    );
                  }
                }}
                keyPrefix="uploads/products"
                label={idx === 0 ? "ຮູບຫຼັກ" : `ຮູບ ${idx + 1}`}
                aspectRatio="aspect-square"
              />
            </div>
          ))}
          {/* Add new image slot */}
          {imageKeys.length < 6 && (
            <ImageKeyUploadField
              value=""
              onChange={(key) => {
                if (key) setImageKeys((prev) => [...prev, key]);
              }}
              keyPrefix="uploads/products"
              label="+ ເພີ່ມຮູບ"
              aspectRatio="aspect-square"
            />
          )}
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

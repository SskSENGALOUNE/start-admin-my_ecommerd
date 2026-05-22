import { ImageKeyUploadField } from "@/shared/ui/ImageKeyUploadField";
import {
  Button,
  FormInput,
  FormNumber,
  FormRoot,
  FormSwitch,
  RHF,
  zodResolver,
} from "@devhop/ui";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1, "ກະລຸນາໃສ່ຊື່ Banner"),
  imageUrl: z.string().min(1, "ກະລຸນາອັບໂຫຼດຮູບ"),
  linkUrl: z.string().optional(),
  isActive: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
});
type FormValues = z.infer<typeof schema>;

type Props = {
  defaultValues?: Partial<FormValues>;
  onSubmit: (values: FormValues) => void;
  isLoading?: boolean;
  submitLabel?: string;
};

export function BannerForm({
  defaultValues,
  onSubmit,
  isLoading,
  submitLabel = "ບັນທຶກ",
}: Props) {
  const methods = RHF.useForm<FormValues>({
    resolver: zodResolver(schema) as RHF.Resolver<FormValues>,
    defaultValues: {
      title: "",
      imageUrl: "",
      linkUrl: "",
      isActive: true,
      order: 0,
      ...defaultValues,
    },
  });

  const imageUrl = methods.watch("imageUrl");

  return (
    <FormRoot<FormValues> methods={methods} onSubmit={onSubmit} className="space-y-4">
      {/* Image Upload */}
      <ImageKeyUploadField
        label="ຮູບ Banner *"
        value={imageUrl}
        onChange={(key) => methods.setValue("imageUrl", key, { shouldValidate: true })}
        keyPrefix="uploads/banners"
        aspectRatio="aspect-video"
        aspectHint="ອັດຕາສ່ວນແນະນຳ 16:9"
        widthPx={1280}
        heightPx={720}
      />
      {methods.formState.errors.imageUrl && (
        <p className="text-destructive text-xs">
          {methods.formState.errors.imageUrl.message}
        </p>
      )}

      <FormInput
        name="title"
        label="ຊື່ Banner"
        requiredMark
        placeholder="ເຊັ່ນ: ໂປຣໂມຊັ່ນລະດູຮ້ອນ"
      />

      <FormInput
        name="linkUrl"
        label="URL ລິ້ງ (ຖ້າມີ)"
        placeholder="https://example.com/promotion"
      />

      <div className="grid grid-cols-2 gap-4">
        <FormNumber
          name="order"
          label="ລຳດັບການສະແດງ"
          min={0}
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
